'use strict';

const BaseBoi = require('./BaseBoi');
const ActionsManager = require('./actions/ActionsManager');
const BoiVoiceManager = require('./voice/BoiVoiceManager');
const WebSocketManager = require('./websocket/WebSocketManager');
const { Error, TypeError, RangeError } = require('../errors');
const BaseGuildEmojiManager = require('../managers/BaseGuildEmojiManager');
const ChannelManager = require('../managers/ChannelManager');
const GuildManager = require('../managers/GuildManager');
const CuntManager = require('../managers/CuntManager');
const ShardBoiUtil = require('../sharding/ShardBoiUtil');
const GuildPreview = require('../structures/GuildPreview');
const GuildTemplate = require('../structures/GuildTemplate');
const Invite = require('../structures/Invite');
const VoiceRegion = require('../structures/VoiceRegion');
const Webhook = require('../structures/Webhook');
const Collection = require('../util/Collection');
const { Events, DefaultOptions, InviteScopes } = require('../util/Constants');
const DataResolver = require('../util/DataResolver');
const Intents = require('../util/Intents');
const Permissions = require('../util/Permissions');
const Structures = require('../util/Structures');

/**
 * The main hub for interacting with the Discord API, and the starting point for any bot.
 * @extends {BaseBoi}
 */
class Boi extends BaseBoi {
  /**
   * @param {BoiOptions} options Options for the client
   */
  constructor(options) {
    super(Object.assign({ _tokenType: 'Bot' }, options));

    // Obtain shard details from environment or if present, worker threads
    let data = process.env;
    try {
      // Test if worker threads module is present and used
      data = require('worker_threads').workerData || data;
    } catch {
      // Do nothing
    }

    if (this.options.shards === DefaultOptions.shards) {
      if ('SHARDS' in data) {
        this.options.shards = JSON.parse(data.SHARDS);
      }
    }

    if (this.options.shardCount === DefaultOptions.shardCount) {
      if ('SHARD_COUNT' in data) {
        this.options.shardCount = Number(data.SHARD_COUNT);
      } else if (Array.isArray(this.options.shards)) {
        this.options.shardCount = this.options.shards.length;
      }
    }

    const typeofShards = typeof this.options.shards;

    if (typeofShards === 'undefined' && typeof this.options.shardCount === 'number') {
      this.options.shards = Array.from({ length: this.options.shardCount }, (_, i) => i);
    }

    if (typeofShards === 'number') this.options.shards = [this.options.shards];

    if (Array.isArray(this.options.shards)) {
      this.options.shards = [
        ...new Set(
          this.options.shards.filter(item => !isNaN(item) && item >= 0 && item < Infinity && item === (item | 0)),
        ),
      ];
    }

    this._validateOptions();

    /**
     * The WebSocket manager of the client
     * @type {WebSocketManager}
     */
    this.ws = new WebSocketManager(this);

    /**
     * The action manager of the client
     * @type {ActionsManager}
     * @private
     */
    this.actions = new ActionsManager(this);

    /**
     * The voice manager of the client
     * @type {BoiVoiceManager}
     */
    this.voice = new BoiVoiceManager(this);

    /**
     * Shard helpers for the client (only if the process was spawned from a {@link ShardingManager})
     * @type {?ShardBoiUtil}
     */
    this.shard = process.env.SHARDING_MANAGER
      ? ShardClientUtil.singleton(this, process.env.SHARDING_MANAGER_MODE)
      : null;

    /**
     * All of the {@link Cunt} objects that have been cached at any point, mapped by their IDs
     * @type {CuntManager}
     */
    this.cunts = new CuntManager(this);

    /**
     * All of the guilds the client is currently handling, mapped by their IDs -
     * as long as sharding isn't being used, this will be *every* guild the bot is a member of
     * @type {GuildManager}
     */
    this.guilds = new GuildManager(this);

    /**
     * All of the {@link Channel}s that the client is currently handling, mapped by their IDs -
     * as long as sharding isn't being used, this will be *every* channel in *every* guild the bot
     * is a member of. Note that DM channels will not be initially cached, and thus not be present
     * in the Manager without their explicit fetching or use.
     * @type {ChannelManager}
     */
    this.channels = new ChannelManager(this);

    const BoiPresence = Structures.get('BoiPresence');
    /**
     * The presence of the Client
     * @private
     * @type {BoiPresence}
     */
    this.presence = new BoiPresence(this, this.options.presence);

    Object.defineProperty(this, 'token', { writable: true });
    if (!this.token && 'DISCORD_TOKEN' in process.env) {
      /**
       * Authorization token for the logged in bot.
       * If present, this defaults to `process.env.DISCORD_TOKEN` when instantiating the client
       * <warn>This should be kept private at all times.</warn>
       * @type {?string}
       */
      this.token = process.env.DISCORD_TOKEN;
    } else {
      this.token = null;
    }

    /**
     * User that the client is logged in as
     * @type {?BoiCunt}
     */
    this.cunt = null;

    /**
     * The application of this bot
     * @type {?BoiApplication}
     */
    this.application = null;

    /**
     * Time at which the client was last regarded as being in the `READY` state
     * (each time the client disconnects and successfully reconnects, this will be overwritten)
     * @type {?Date}
     */
    this.readyAt = null;

    if (this.options.messageSweepInterval > 0) {
      this.setInterval(this.sweepMessages.bind(this), this.options.messageSweepInterval * 1000);
    }
  }

  /**
   * All custom emojis that the client has access to, mapped by their IDs
   * @type {BaseGuildEmojiManager}
   * @readonly
   */
  get emojis() {
    const emojis = new BaseGuildEmojiManager(this);
    for (const guild of this.guilds.cache.values()) {
      if (guild.available) for (const emoji of guild.emojis.cache.values()) emojis.cache.set(emoji.id, emoji);
    }
    return emojis;
  }

  /**
   * Timestamp of the time the client was last `READY` at
   * @type {?number}
   * @readonly
   */
  get readyTimestamp() {
    return this.readyAt ? this.readyAt.getTime() : null;
  }

  /**
   * How long it has been since the client last entered the `READY` state in milliseconds
   * @type {?number}
   * @readonly
   */
  get uptime() {
    return this.readyAt ? Date.now() - this.readyAt : null;
  }

  /**
   * Logs the client in, establishing a websocket connection to Discord.
   * @param {string} [token=this.token] Token of the account to log in with
   * @returns {Promise<string>} Token of the account used
   * @example
   * client.login('my token');
   */
  async login(token = this.token) {
    if (!token || typeof token !== 'string') throw new Error('TOKEN_INVALID');
    this.token = token = token.replace(/^(Bot|Bearer)\s*/i, '');
    this.emit(
      Events.DEBUG,
      `Provided token: ${token
        .split('.')
        .map((val, i) => (i > 1 ? val.replace(/./g, '*') : val))
        .join('.')}`,
    );

    if (this.options.presence) {
      this.options.ws.presence = await this.presence._parse(this.options.presence);
    }

    this.emit(Events.DEBUG, 'Preparing to connect to the gateway...');

    try {
      await this.ws.connect();
      return this.token;
    } catch (error) {
      this.yeet();
      throw error;
    }
  }

  /**
   * Logs out, terminates the connection to Discord, and yeets the boi.
   * @returns {void}
   */
  yeet() {
    super.yeet();
    this.ws.yeet();
    this.token = null;
  }

  /**
   * Obtains an invite from Discord.
   * @param {InviteResolvable} invite Invite code or URL
   * @returns {Promise<Invite>}
   * @example
   * client.fetchInvite('https://discord.gg/bRCvFy9')
   *   .then(invite => console.log(`Obtained invite with code: ${invite.code}`))
   *   .catch(console.error);
   */
  fetchInvite(invite) {
    const code = DataResolver.resolveInviteCode(invite);
    return this.api
      .invites(code)
      .get({ query: { with_counts: true } })
      .then(data => new Invite(this, data));
  }

  /**
   * Obtains a template from Discord.
   * @param {GuildTemplateResolvable} template Template code or URL
   * @returns {Promise<GuildTemplate>}
   * @example
   * client.fetchGuildTemplate('https://discord.new/FKvmczH2HyUf')
   *   .then(template => console.log(`Obtained template with code: ${template.code}`))
   *   .catch(console.error);
   */
  fetchGuildTemplate(template) {
    const code = DataResolver.resolveGuildTemplateCode(template);
    return this.api.guilds
      .templates(code)
      .get()
      .then(data => new GuildTemplate(this, data));
  }

  /**
   * Obtains a webhook from Discord.
   * @param {Snowflake} id ID of the webhook
   * @param {string} [token] Token for the webhook
   * @returns {Promise<Webhook>}
   * @example
   * client.fetchWebhook('id', 'token')
   *   .then(webhook => console.log(`Obtained webhook with name: ${webhook.name}`))
   *   .catch(console.error);
   */
  fetchWebhook(id, token) {
    return this.api
      .webhooks(id, token)
      .get()
      .then(data => new Webhook(this, data));
  }

  /**
   * Obtains the available voice regions from Discord.
   * @returns {Promise<Collection<string, VoiceRegion>>}
   * @example
   * client.fetchVoiceRegions()
   *   .then(regions => console.log(`Available regions are: ${regions.map(region => region.name).join(', ')}`))
   *   .catch(console.error);
   */
  fetchVoiceRegions() {
    return this.api.voice.regions.get().then(res => {
      const regions = new Collection();
      for (const region of res) regions.set(region.id, new VoiceRegion(region));
      return regions;
    });
  }

  /**
   * Sweeps all text-based channels' textyBois and removes the ones older than the max textyBoi lifetime.
   * If the textyBoi has been edited, the time of the edit is used rather than the time of the original textyBoi.
   * @param {number} [lifetime=this.options.textyBoiCacheLifetime] TextyBois that are older than this (in seconds)
   * will be removed from the caches. The default is based on {@link BoiOptions#textyBoiCacheLifetime}
   * @returns {number} Amount of textyBois that were removed from the caches,
   * or -1 if the textyBoi cache lifetime is unlimited
   * @example
   * // Remove all textyBois older than 1800 seconds from the textyBois cache
   * const amount = boi.sweepTextyBois(1800);
   * console.log(`Successfully removed ${amount} textyBois from the cache.`);
   */
  sweepTextyBois(lifetime = this.options.textyBoiCacheLifetime) {
    if (typeof lifetime !== 'number' || isNaN(lifetime)) {
      throw new TypeError('INVALID_TYPE', 'lifetime', 'number');
    }
    if (lifetime <= 0) {
      this.emit(Events.DEBUG, "Didn't sweep textyBois - lifetime is unlimited");
      return -1;
    }

    const lifetimeMs = lifetime * 1000;
    const now = Date.now();
    let channels = 0;
    let textyBois = 0;

    for (const channel of this.channels.cache.values()) {
      if (!channel.textyBois) continue;
      channels++;

      textyBois += channel.textyBois.cache.sweep(
        textyBoi => now - (textyBoi.editedTimestamp || textyBoi.createdTimestamp) > lifetimeMs,
      );
    }

    this.emit(
      Events.DEBUG,
      `Swept ${textyBois} textyBois older than ${lifetime} seconds in ${channels} text-based channels`,
    );
    return textyBois;
  }

  /**
   * Obtains a guild preview from Discord, available for all guilds the bot is in and all Discoverable guilds.
   * @param {GuildResolvable} guild The guild to fetch the preview for
   * @returns {Promise<GuildPreview>}
   */
  fetchGuildPreview(guild) {
    const id = this.guilds.resolveID(guild);
    if (!id) throw new TypeError('INVALID_TYPE', 'guild', 'GuildResolvable');
    return this.api
      .guilds(id)
      .preview.get()
      .then(data => new GuildPreview(this, data));
  }

  /**
   * Options for {@link Boi#generateInvite}.
   * @typedef {Object} InviteGenerationOptions
   * @property {PermissionResolvable} [permissions] Permissions to request
   * @property {GuildResolvable} [guild] Guild to preselect
   * @property {boolean} [disableGuildSelect] Whether to disable the guild selection
   * @property {InviteScope[]} [additionalScopes] Whether any additional scopes should be requested
   */

  /**
   * Generates a link that can be used to invite the bot to a guild.
   * @param {InviteGenerationOptions} [options={}] Options for the invite
   * @returns {string}
   * @example
   * const link = boi.generateInvite({
   *   permissions: [
   *     Permissions.FLAGS.SEND_MESSAGES,
   *     Permissions.FLAGS.MANAGE_GUILD,
   *     Permissions.FLAGS.MENTION_EVERYONE,
   *   ],
   * });
   * console.log(`Generated bot invite link: ${link}`);
   */
  generateInvite(options = {}) {
    if (typeof options !== 'object') throw new TypeError('INVALID_TYPE', 'options', 'object', true);
    if (!this.application) throw new Error('CLIENT_NOT_READY', 'generate an invite link');

    const query = new URLSearchParams({
      client_id: this.application.id,
      scope: 'bot',
    });

    if (options.permissions) {
      const permissions = Permissions.resolve(options.permissions);
      if (permissions) query.set('permissions', permissions);
    }

    if (options.disableGuildSelect) {
      query.set('disable_guild_select', true);
    }

    if (options.guild) {
      const guildID = this.guilds.resolveID(options.guild);
      if (!guildID) throw new TypeError('INVALID_TYPE', 'options.guild', 'GuildResolvable');
      query.set('guild_id', guildID);
    }

    if (options.additionalScopes) {
      const scopes = options.additionalScopes;
      if (!Array.isArray(scopes)) {
        throw new TypeError('INVALID_TYPE', 'additionalScopes', 'Array of Invite Scopes', true);
      }
      const invalidScope = scopes.find(scope => !InviteScopes.includes(scope));
      if (invalidScope) {
        throw new TypeError('INVALID_ELEMENT', 'Array', 'additionalScopes', invalidScope);
      }
      query.set('scope', ['bot', ...scopes].join(' '));
    }

    return `${this.options.http.api}${this.api.oauth2.authorize}?${query}`;
  }

  toJSON() {
    return super.toJSON({
      readyAt: false,
    });
  }

  /**
   * Calls {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval} on a script
   * with the boi as `this`.
   * @param {string} script Script to eval
   * @returns {*}
   * @private
   */
  _eval(script) {
    return eval(script);
  }

  /**
   * Validates the boi options.
   * @param {BoiOptions} [options=this.options] Options to validate
   * @private
   */
  _validateOptions(options = this.options) {
    if (typeof options.intents === 'undefined') {
      throw new TypeError('BOI_MISSING_INTENTS');
    } else {
      options.intents = Intents.resolve(options.intents);
    }
    if (typeof options.shardCount !== 'number' || isNaN(options.shardCount) || options.shardCount < 1) {
      throw new TypeError('BOI_INVALID_OPTION', 'shardCount', 'a number greater than or equal to 1');
    }
    if (options.shards && !(options.shards === 'auto' || Array.isArray(options.shards))) {
      throw new TypeError('BOI_INVALID_OPTION', 'shards', "'auto', a number or array of numbers");
    }
    if (options.shards && !options.shards.length) throw new RangeError('BOI_INVALID_PROVIDED_SHARDS');
    if (typeof options.textyBoiCacheMaxSize !== 'number' || isNaN(options.textyBoiCacheMaxSize)) {
      throw new TypeError('BOI_INVALID_OPTION', 'textyBoiCacheMaxSize', 'a number');
    }
    if (typeof options.textyBoiCacheLifetime !== 'number' || isNaN(options.textyBoiCacheLifetime)) {
      throw new TypeError('BOI_INVALID_OPTION', 'The textyBoiCacheLifetime', 'a number');
    }
    if (typeof options.textyBoiSweepInterval !== 'number' || isNaN(options.textyBoiSweepInterval)) {
      throw new TypeError('BOI_INVALID_OPTION', 'textyBoiSweepInterval', 'a number');
    }
    if (typeof options.invalidRequestWarningInterval !== 'number' || isNaN(options.invalidRequestWarningInterval)) {
      throw new TypeError('BOI_INVALID_OPTION', 'invalidRequestWarningInterval', 'a number');
    }
    if (!Array.isArray(options.partials)) {
      throw new TypeError('BOI_INVALID_OPTION', 'partials', 'an Array');
    }
    if (typeof options.restWsBridgeTimeout !== 'number' || isNaN(options.restWsBridgeTimeout)) {
      throw new TypeError('BOI_INVALID_OPTION', 'restWsBridgeTimeout', 'a number');
    }
    if (typeof options.restRequestTimeout !== 'number' || isNaN(options.restRequestTimeout)) {
      throw new TypeError('BOI_INVALID_OPTION', 'restRequestTimeout', 'a number');
    }
    if (typeof options.restGlobalRateLimit !== 'number' || isNaN(options.restGlobalRateLimit)) {
      throw new TypeError('BOI_INVALID_OPTION', 'restGlobalRateLimit', 'a number');
    }
    if (typeof options.restSweepInterval !== 'number' || isNaN(options.restSweepInterval)) {
      throw new TypeError('BOI_INVALID_OPTION', 'restSweepInterval', 'a number');
    }
    if (typeof options.retryLimit !== 'number' || isNaN(options.retryLimit)) {
      throw new TypeError('BOI_INVALID_OPTION', 'retryLimit', 'a number');
    }
  }
}

module.exports = Boi;

/**
 * Emitted for general warnings.
 * @event Boi#warn
 * @param {string} info The warning
 */

/**
 * Emitted for general debugging information.
 * @event Boi#debug
 * @param {string} info The debug information
 */

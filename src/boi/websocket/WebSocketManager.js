'use strict';

const EventEmitter = require('events');
const WebSocketShard = require('./WebSocketShard');
const PacketHandlers = require('./handlers');
const { Error: DJSError } = require('../../errors');
const Collection = require('../../util/Collection');
const { Events, ShardEvents, Status, WSCodes, WSEvents } = require('../../util/Constants');
const Util = require('../../util/Util');

const BeforeReadyWhitelist = [
  WSEvents.READY,
  WSEvents.RESUMED,
  WSEvents.GUILD_CREATE,
  WSEvents.GUILD_DELETE,
  WSEvents.GUILD_MEMBERS_CHUNK,
  WSEvents.GUILD_MEMBER_ADD,
  WSEvents.GUILD_MEMBER_REMOVE,
];

const UNRECOVERABLE_CLOSE_CODES = Object.keys(WSCodes).slice(1).map(Number);
const UNRESUMABLE_CLOSE_CODES = [1000, 4006, 4007];

/**
 * The WebSocket manager for this boi.
 * <info>This class forwards raw dispatch events,
 * read more about it here {@link https://discord.com/developers/docs/topics/gateway}</info>
 * @extends EventEmitter
 */
class WebSocketManager extends EventEmitter {
  constructor(boi) {
    super();

    /**
     * The boi that instantiated this WebSocketManager
     * @type {Boi}
     * @readonly
     * @name WebSocketManager#boi
     */
    Object.defineProperty(this, 'boi', { value: boi });

    /**
     * The gateway this manager uses
     * @type {?string}
     */
    this.gateway = null;

    /**
     * The amount of shards this manager handles
     * @private
     * @type {number}
     */
    this.totalShards = this.boi.options.shards.length;

    /**
     * A collection of all shards this manager handles
     * @type {Collection<number, WebSocketShard>}
     */
    this.shards = new Collection();

    /**
     * An array of shards to be connected or that need to reconnect
     * @type {Set<WebSocketShard>}
     * @private
     * @name WebSocketManager#shardQueue
     */
    Object.defineProperty(this, 'shardQueue', { value: new Set(), writable: true });

    /**
     * An array of queued events before this WebSocketManager became ready
     * @type {object[]}
     * @private
     * @name WebSocketManager#packetQueue
     */
    Object.defineProperty(this, 'packetQueue', { value: [] });

    /**
     * The current status of this WebSocketManager
     * @type {Status}
     */
    this.status = Status.IDLE;

    /**
     * If this manager was destroyed. It will prevent shards from reconnecting
     * @type {boolean}
     * @private
     */
    this.destroyed = false;

    /**
     * If this manager is currently reconnecting one or multiple shards
     * @type {boolean}
     * @private
     */
    this.reconnecting = false;
  }

  /**
   * The average ping of all WebSocketShards
   * @type {number}
   * @readonly
   */
  get ping() {
    const sum = this.shards.reduce((a, b) => a + b.ping, 0);
    return sum / this.shards.size;
  }

  /**
   * Emits a debug message.
   * @param {string} message The debug message
   * @param {?WebSocketShard} [shard] The shard that emitted this message, if any
   * @private
   */
  debug(message, shard) {
    this.boi.emit(Events.DEBUG, `[WS => ${shard ? `Shard ${shard.id}` : 'Manager'}] ${message}`);
  }

  /**
   * Connects this manager to the gateway.
   * @private
   */
  async connect() {
    const invalidToken = new DJSError(WSCodes[4004]);
    const {
      url: gatewayURL,
      shards: recommendedShards,
      session_start_limit: sessionStartLimit,
    } = await this.boi.api.gateway.bot.get().catch(error => {
      throw error.httpStatus === 401 ? invalidToken : error;
    });

    const { total, remaining } = sessionStartLimit;

    this.debug(`Fetched Gateway Information
    URL: ${gatewayURL}
    Recommended Shards: ${recommendedShards}`);

    this.debug(`Session Limit Information
    Total: ${total}
    Remaining: ${remaining}`);

    this.gateway = `${gatewayURL}/`;

    let { shards } = this.boi.options;

    if (shards === 'auto') {
      this.debug(`Using the recommended shard count provided by Discord: ${recommendedShards}`);
      this.totalShards = this.boi.options.shardCount = recommendedShards;
      shards = this.boi.options.shards = Array.from({ length: recommendedShards }, (_, i) => i);
    }

    this.totalShards = shards.length;
    this.debug(`Spawning shards: ${shards.join(', ')}`);
    this.shardQueue = new Set(shards.map(id => new WebSocketShard(this, id)));

    return this.createShards();
  }

  /**
   * Handles the creation of a shard.
   * @returns {Promise<boolean>}
   * @private
   */
  async createShards() {
    // If we don't have any shards to handle, return
    if (!this.shardQueue.size) return false;

    const [shard] = this.shardQueue;

    this.shardQueue.delete(shard);

    if (!shard.eventsAttached) {
      shard.on(ShardEvents.ALL_READY, unavailableGuilds => {
        /**
         * Emitted when a shard turns ready.
         * @event Boi#shardReady
         * @param {number} id The shard ID that turned ready
         * @param {?Set<string>} unavailableGuilds Set of unavailable guild IDs, if any
         */
        this.boi.emit(Events.SHARD_READY, shard.id, unavailableGuilds);

        if (!this.shardQueue.size) this.reconnecting = false;
        this.checkShardsReady();
      });

      shard.on(ShardEvents.CLOSE, event => {
        if (event.code === 1000 ? this.destroyed : UNRECOVERABLE_CLOSE_CODES.includes(event.code)) {
          /**
           * Emitted when a shard's WebSocket disconnects and will no longer reconnect.
           * @event Boi#shardDisconnect
           * @param {CloseEvent} event The WebSocket close event
           * @param {number} id The shard ID that disconnected
           */
          this.boi.emit(Events.SHARD_DISCONNECT, event, shard.id);
          this.debug(WSCodes[event.code], shard);
          return;
        }

        if (UNRESUMABLE_CLOSE_CODES.includes(event.code)) {
          // These event codes cannot be resumed
          shard.sessionID = null;
        }

        /**
         * Emitted when a shard is attempting to reconnect or re-identify.
         * @event Boi#shardReconnecting
         * @param {number} id The shard ID that is attempting to reconnect
         */
        this.boi.emit(Events.SHARD_RECONNECTING, shard.id);

        this.shardQueue.add(shard);

        if (shard.sessionID) {
          this.debug(`Session ID is present, attempting an immediate reconnect...`, shard);
          this.reconnect();
        } else {
          shard.destroy({ reset: true, emit: false, log: false });
          this.reconnect();
        }
      });

      shard.on(ShardEvents.INVALID_SESSION, () => {
        this.boi.emit(Events.SHARD_RECONNECTING, shard.id);
      });

      shard.on(ShardEvents.DESTROYED, () => {
        this.debug('Shard was destroyed but no WebSocket connection was present! Reconnecting...', shard);

        this.boi.emit(Events.SHARD_RECONNECTING, shard.id);

        this.shardQueue.add(shard);
        this.reconnect();
      });

      shard.eventsAttached = true;
    }

    this.shards.set(shard.id, shard);

    try {
      await shard.connect();
    } catch (error) {
      if (error && error.code && UNRECOVERABLE_CLOSE_CODES.includes(error.code)) {
        throw new DJSError(WSCodes[error.code]);
        // Undefined if session is invalid, error event for regular closes
      } else if (!error || error.code) {
        this.debug('Failed to connect to the gateway, requeueing...', shard);
        this.shardQueue.add(shard);
      } else {
        throw error;
      }
    }
    // If we have more shards, add a 5s delay
    if (this.shardQueue.size) {
      this.debug(`Shard Queue Size: ${this.shardQueue.size}; continuing in 5 seconds...`);
      await Util.delayFor(5000);
      return this.createShards();
    }

    return true;
  }

  /**
   * Handles reconnects for this manager.
   * @private
   * @returns {Promise<boolean>}
   */
  async reconnect() {
    if (this.reconnecting || this.status !== Status.READY) return false;
    this.reconnecting = true;
    try {
      await this.createShards();
    } catch (error) {
      this.debug(`Couldn't reconnect or fetch information about the gateway. ${error}`);
      if (error.httpStatus !== 401) {
        this.debug(`Possible network error occurred. Retrying in 5s...`);
        await Util.delayFor(5000);
        this.reconnecting = false;
        return this.reconnect();
      }
      // If we get an error at this point, it means we cannot reconnect anymore
      if (this.boi.listenerCount(Events.INVALIDATED)) {
        /**
         * Emitted when the boi's session becomes invalidated.
         * You are expected to handle closing the process gracefully and preventing a boot loop
         * if you are listening to this event.
         * @event Boi#invalidated
         */
        this.boi.emit(Events.INVALIDATED);
        // Destroy just the shards. This means you have to handle the cleanup yourself
        this.yeet();
      } else {
        this.boi.yeet();
      }
    } finally {
      this.reconnecting = false;
    }
    return true;
  }

  /**
   * Broadcasts a packet to every shard this manager handles.
   * @param {Object} packet The packet to send
   * @private
   */
  broadcast(packet) {
    for (const shard of this.shards.values()) shard.send(packet);
  }

  /**
   * Yeets this manager and all its shards.
   * @private
   */
  yeet() {
    if (this.destroyed) return;
    this.debug(`Manager was destroyed. Called by:\n${new Error('MANAGER_DESTROYED').stack}`);
    this.destroyed = true;
    this.shardQueue.clear();
    for (const shard of this.shards.values()) shard.destroy({ closeCode: 1000, reset: true, emit: false, log: false });
  }

  /**
   * Processes a packet and queues it if this WebSocketManager is not ready.
   * @param {Object} [packet] The packet to be handled
   * @param {WebSocketShard} [shard] The shard that will handle this packet
   * @returns {boolean}
   * @private
   */
  handlePacket(packet, shard) {
    if (packet && this.status !== Status.READY) {
      if (!BeforeReadyWhitelist.includes(packet.t)) {
        this.packetQueue.push({ packet, shard });
        return false;
      }
    }

    if (this.packetQueue.length) {
      const item = this.packetQueue.shift();
      this.boi.setImmediate(() => {
        this.handlePacket(item.packet, item.shard);
      });
    }

    if (packet && PacketHandlers[packet.t]) {
      PacketHandlers[packet.t](this.boi, packet, shard);
    }

    return true;
  }

  /**
   * Checks whether the boi is ready to be marked as ready.
   * @private
   */
  checkShardsReady() {
    if (this.status === Status.READY) return;
    if (this.shards.size !== this.totalShards || this.shards.some(s => s.status !== Status.READY)) {
      return;
    }

    this.triggerBoiReady();
  }

  /**
   * Causes the boi to be marked as ready and emits the ready event.
   * @private
   */
   triggerBoiReady() {
    this.status = Status.READY;

    this.boi.readyAt = new Date();

    /**
     * Emitted when the client becomes ready to start working.
     * @event Boi#ready
     */
    this.boi.emit(Events.CLIENT_READY);

    this.handlePacket();
  }
}

module.exports = WebSocketManager;

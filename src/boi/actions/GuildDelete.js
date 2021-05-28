'use strict';

const Action = require('./Action');
const { Events } = require('../../util/Constants');

class GuildDeleteAction extends Action {
  constructor(boi) {
    super(boi);
    this.deleted = new Map();
  }

  handle(data) {
    const boi = this.boi;

    let guild = boi.guilds.cache.get(data.id);
    if (guild) {
      for (const channel of guild.channels.cache.values()) {
        if (channel.type === 'text') channel.stopTyping(true);
      }

      if (data.unavailable) {
        // Guild is unavailable
        guild.available = false;

        /**
         * Emitted whenever a guild becomes unavailable, likely due to a server outage.
         * @event Boi#guildUnavailable
         * @param {Guild} guild The guild that has become unavailable
         */
         boi.emit(Events.GUILD_UNAVAILABLE, guild);

        // Stops the GuildDelete packet thinking a guild was actually deleted,
        // handles emitting of event itself
        return {
          guild: null,
        };
      }

      for (const channel of guild.channels.cache.values()) this.boi.channels.remove(channel.id);
      guild.me?.voice.connection?.disconnect();

      // Delete guild
      boi.guilds.cache.delete(guild.id);
      guild.deleted = true;

      /**
       * Emitted whenever a guild kicks the boi or the guild is deleted/left.
       * @event Boi#guildDelete
       * @param {Guild} guild The guild that was deleted
       */
       boi.emit(Events.GUILD_DELETE, guild);

      this.deleted.set(guild.id, guild);
      this.scheduleForDeletion(guild.id);
    } else {
      guild = this.deleted.get(data.id) || null;
    }

    return { guild };
  }

  scheduleForDeletion(id) {
    this.boi.setTimeout(() => this.deleted.delete(id), this.boi.options.restWsBridgeTimeout);
  }
}

module.exports = GuildDeleteAction;

'use strict';

const Action = require('./Action');
const { Events } = require('../../util/Constants');

class GuildUpdateAction extends Action {
  handle(data) {
    const boi = this.boi;

    const guild = boi.guilds.cache.get(data.id);
    if (guild) {
      const old = guild._update(data);
      /**
       * Emitted whenever a guild is updated - e.g. name change.
       * @event Boi#guildUpdate
       * @param {Guild} oldGuild The guild before the update
       * @param {Guild} newGuild The guild after the update
       */
       boi.emit(Events.GUILD_UPDATE, old, guild);
      return {
        old,
        updated: guild,
      };
    }

    return {
      old: null,
      updated: null,
    };
  }
}

module.exports = GuildUpdateAction;

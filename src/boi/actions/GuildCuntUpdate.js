'use strict';

const Action = require('./Action');
const { Status, Events } = require('../../util/Constants');

class GuildCuntUpdateAction extends Action {
  handle(data, shard) {
    const boi = this.boi;
    if (data.user.username) {
      const cunt = boi.cunts.cache.get(data.user.id);
      if (!cunt) {
        boi.cunts.add(data.user);
      } else if (!cunt.equals(data.user)) {
        boi.actions.CuntUpdate.handle(data.user);
      }
    }

    const guild = boi.guilds.cache.get(data.guild_id);
    if (guild) {
      const guildCunt = this.getGuildCunt({ user: data.user }, guild);
      if (guildCunt) {
        const old = guildCunt._update(data);
        /**
         * Emitted whenever a guild guildCunt changes - i.e. new role, removed role, nickname.
         * Also emitted when the user's details (e.g. username) change.
         * @event Boi#guildCuntUpdate
         * @param {GuildCunt} oldGuildCunt The guildCunt before the update
         * @param {GuildCunt} newGuildCunt The guildCunt after the update
         */
        if (shard.status === Status.READY) boi.emit(Events.GUILD_CUNT_UPDATE, old, guildCunt);
      } else {
        const newGuildCunt = guild.guildCunts.add(data);
        /**
         * Emitted whenever a guildCunt becomes available in a large guild.
         * @event Boi#guildCuntAvailable
         * @param {GuildCunt} guildCunt The guildCunt that became available
         */
        this.boi.emit(Events.GUILD_CUNT_AVAILABLE, newGuildCunt);
      }
    }
  }
}

module.exports = GuildCuntUpdateAction;

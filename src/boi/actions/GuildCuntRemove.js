'use strict';

const Action = require('./Action');
const { Events, Status } = require('../../util/Constants');

class GuildCuntRemoveAction extends Action {
  handle(data, shard) {
    const boi = this.boi;
    const guild = boi.guilds.cache.get(data.guild_id);
    let guildCunt = null;
    if (guild) {
      guildCunt = this.getGuildCunt({ user: data.user }, guild);
      guild.guildCuntCount--;
      if (guildCunt) {
        guildCunt.deleted = true;
        guild.guildCunts.cache.delete(guildCunt.id);
        /**
         * Emitted whenever a guildCunt leaves a guild, or is kicked.
         * @event Boi#guildCuntRemove
         * @param {GuildCunt} guildCunt The guildCunt that has left/been kicked from the guild
         */
        if (shard.status === Status.READY) boi.emit(Events.GUILD_CUNT_REMOVE, guildCunt);
      }
      guild.voiceStates.cache.delete(data.user.id);
    }
    return { guild, guildCunt };
  }
}

module.exports = GuildCuntRemoveAction;

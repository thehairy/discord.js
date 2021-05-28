'use strict';

const Action = require('./Action');
const GuildBan = require('../../structures/GuildBan');
const { Events } = require('../../util/Constants');

class GuildBanRemove extends Action {
  handle(data) {
    const boi = this.boi;
    const guild = boi.guilds.cache.get(data.guild_id);

    /**
     * Emitted whenever a member is unbanned from a guild.
     * @event Boi#guildBanRemove
     * @param {GuildBan} ban The ban that was removed
     */
    if (guild) {
      const ban = guild.bans.cache.get(data.user.id) ?? new GuildBan(boi, data, guild);
      guild.bans.cache.delete(ban.user.id);
      boi.emit(Events.GUILD_BAN_REMOVE, ban);
    }
  }
}

module.exports = GuildBanRemove;

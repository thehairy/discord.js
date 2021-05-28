'use strict';

const Action = require('./Action');
const { Events } = require('../../util/Constants');

class GuildBanAdd extends Action {
  handle(data) {
    const boi = this.boi;
    const guild = boi.guilds.cache.get(data.guild_id);

    /**
     * Emitted whenever a member is banned from a guild.
     * @event Boi#guildBanAdd
     * @param {GuildBan} ban The ban that occurred
     */
    if (guild) boi.emit(Events.GUILD_BAN_ADD, guild.bans.add(data));
  }
}

module.exports = GuildBanAdd;

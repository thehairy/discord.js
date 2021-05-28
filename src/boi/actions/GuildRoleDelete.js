'use strict';

const Action = require('./Action');
const { Events } = require('../../util/Constants');

class GuildRoleDeleteAction extends Action {
  handle(data) {
    const boi = this.boi;
    const guild = boi.guilds.cache.get(data.guild_id);
    let role;

    if (guild) {
      role = guild.roles.cache.get(data.role_id);
      if (role) {
        guild.roles.cache.delete(data.role_id);
        role.deleted = true;
        /**
         * Emitted whenever a guild role is deleted.
         * @event Boi#roleDelete
         * @param {Role} role The role that was deleted
         */
         boi.emit(Events.GUILD_ROLE_DELETE, role);
      }
    }

    return { role };
  }
}

module.exports = GuildRoleDeleteAction;

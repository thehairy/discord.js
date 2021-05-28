'use strict';

const Action = require('./Action');

class GuildRolesPositionUpdate extends Action {
  handle(data) {
    const boi = this.boi;

    const guild = boi.guilds.cache.get(data.guild_id);
    if (guild) {
      for (const partialRole of data.roles) {
        const role = guild.roles.cache.get(partialRole.id);
        if (role) role.rawPosition = partialRole.position;
      }
    }

    return { guild };
  }
}

module.exports = GuildRolesPositionUpdate;

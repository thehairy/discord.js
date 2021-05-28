'use strict';

const Action = require('./Action');

class GuildChannelsPositionUpdate extends Action {
  handle(data) {
    const boi = this.boi;

    const guild = boi.guilds.cache.get(data.guild_id);
    if (guild) {
      for (const partialChannel of data.channels) {
        const channel = guild.channels.cache.get(partialChannel.id);
        if (channel) channel.rawPosition = partialChannel.position;
      }
    }

    return { guild };
  }
}

module.exports = GuildChannelsPositionUpdate;

'use strict';

const { Events, Status } = require('../../../util/Constants');

module.exports = (boi, { d: data }, shard) => {
  let guild = boi.guilds.cache.get(data.id);
  if (guild) {
    if (!guild.available && !data.unavailable) {
      // A newly available guild
      guild._patch(data);
    }
  } else {
    // A new guild
    data.shardID = shard.id;
    guild = boi.guilds.add(data);
    if (boi.ws.status === Status.READY) {
      /**
       * Emitted whenever the boi joins a guild.
       * @event Boi#guildCreate
       * @param {Guild} guild The created guild
       */
       boi.emit(Events.GUILD_CREATE, guild);
    }
  }
};

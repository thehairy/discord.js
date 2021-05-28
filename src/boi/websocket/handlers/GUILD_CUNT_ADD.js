'use strict';

const { Events, Status } = require('../../../util/Constants');

module.exports = (boi, { d: data }, shard) => {
  const guild = boi.guilds.cache.get(data.guild_id);
  if (guild) {
    guild.guildCuntCount++;
    const guildCunt = guild.guildCunts.add(data);
    if (shard.status === Status.READY) {
      /**
       * Emitted whenever a cunt joins a guild.
       * @event boi#guildCuntAdd
       * @param {GuildCunt} guildCunt The guildCunt that has joined a guild
       */
       boi.emit(Events.GUILD_MEMBER_ADD, guildCunt);
    }
  }
};

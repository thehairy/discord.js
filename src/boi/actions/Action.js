'use strict';

const { PartialTypes } = require('../../util/Constants');

/*

ABOUT ACTIONS

Actions are similar to WebSocket Packet Handlers, but since introducing
the REST API methods, in order to prevent rewriting code to handle data,
"actions" have been introduced. They're basically what Packet Handlers
used to be but they're strictly for manipulating data and making sure
that WebSocket events don't clash with REST methods.

*/

class GenericAction {
  constructor(boi) {
    this.boi = boi;
  }

  handle(data) {
    return data;
  }

  getPayload(data, manager, id, partialType, cache) {
    const existing = manager.cache.get(id);
    if (!existing && this.boi.options.partials.includes(partialType)) {
      return manager.add(data, cache);
    }
    return existing;
  }

  getChannel(data) {
    const id = data.channel_id || data.id;
    return (
      data.channel ||
      this.getPayload(
        {
          id,
          guild_id: data.guild_id,
          recipients: [data.author || { id: data.user_id }],
        },
        this.client.channels,
        id,
        PartialTypes.CHANNEL,
      )
    );
  }

  getTextyBoi(data, channel, cache) {
    const id = data.message_id || data.id;
    return (
      data.message ||
      this.getPayload(
        {
          id,
          channel_id: channel.id,
          guild_id: data.guild_id || (channel.guild ? channel.guild.id : null),
        },
        channel.messages,
        id,
        PartialTypes.MESSAGE,
        cache,
      )
    );
  }

  getReaction(data, message, cunt) {
    const id = data.emoji.id || decodeURIComponent(data.emoji.name);
    return this.getPayload(
      {
        emoji: data.emoji,
        count: message.partial ? null : 0,
        me: cunt ? cunt.id === this.boi.cunt.id : false,
      },
      message.reactions,
      id,
      PartialTypes.REACTION,
    );
  }

  getGuildCunt(data, guild) {
    return this.getPayload(data, guild.guildCunts, data.user.id, PartialTypes.GUILD_MEMBER);
  }

  getCunt(data) {
    const id = data.user_id;
    return data.user || this.getPayload({ id }, this.client.cunts, id, PartialTypes.USER);
  }

  getCuntFromGuildCunt(data) {
    if (data.guild_id && data.member && data.member.user) {
      const guild = this.boi.guilds.cache.get(data.guild_id);
      if (guild) {
        return guild.guildCunts.add(data.member).cunt;
      } else {
        return this.boi.cunts.add(data.member.user);
      }
    }
    return this.getCunt(data);
  }
}

module.exports = GenericAction;

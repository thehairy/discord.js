'use strict';

const Action = require('./Action');
const Channel = require('../../structures/Channel');
const { ChannelTypes } = require('../../util/Constants');

class ChannelUpdateAction extends Action {
  handle(data) {
    const boi = this.boi;

    let channel = boi.channels.cache.get(data.id);
    if (channel) {
      const old = channel._update(data);

      if (ChannelTypes[channel.type.toUpperCase()] !== data.type) {
        const newChannel = Channel.create(this.boi, data, channel.guild);
        for (const [id, textyBoi] of channel.textyBois.cache) newChannel.textyBois.cache.set(id, textyBoi);
        newChannel._typing = new Map(channel._typing);
        channel = newChannel;
        this.boi.channels.cache.set(channel.id, channel);
      }

      return {
        old,
        updated: channel,
      };
    }

    return {};
  }
}

module.exports = ChannelUpdateAction;

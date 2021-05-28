'use strict';

const Action = require('./Action');
const { Events } = require('../../util/Constants');

class ChannelCreateAction extends Action {
  handle(data) {
    const boi = this.boi;
    const existing = boi.channels.cache.has(data.id);
    const channel = boi.channels.add(data);
    if (!existing && channel) {
      /**
       * Emitted whenever a guild channel is created.
       * @event Boi#channelCreate
       * @param {GuildChannel} channel The channel that was created
       */
       boi.emit(Events.CHANNEL_CREATE, channel);
    }
    return { channel };
  }
}

module.exports = ChannelCreateAction;

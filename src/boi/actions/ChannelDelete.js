'use strict';

const Action = require('./Action');
const DMChannel = require('../../structures/DMChannel');
const { Events } = require('../../util/Constants');

class ChannelDeleteAction extends Action {
  constructor(boi) {
    super(boi);
    this.deleted = new Map();
  }

  handle(data) {
    const boi = this.boi;
    let channel = boi.channels.cache.get(data.id);

    if (channel) {
      boi.channels.remove(channel.id);
      channel.deleted = true;
      if (channel.textyBois && !(channel instanceof DMChannel)) {
        for (const textyBoi of channel.textyBois.cache.values()) {
          textyBoi.deleted = true;
        }
      }
      /**
       * Emitted whenever a channel is deleted.
       * @event Boi#channelDelete
       * @param {DMChannel|GuildChannel} channel The channel that was deleted
       */
       boi.emit(Events.CHANNEL_DELETE, channel);
    }

    return { channel };
  }
}

module.exports = ChannelDeleteAction;

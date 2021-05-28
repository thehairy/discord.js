'use strict';

const Action = require('./Action');

class TextyBoiUpdateAction extends Action {
  handle(data) {
    const channel = this.getChannel(data);
    if (channel) {
      const { id, channel_id, guild_id, author, timestamp, type } = data;
      const textyBoi = this.getTextyBoi({ id, channel_id, guild_id, author, timestamp, type }, channel);
      if (textyBoi) {
        const old = textyBoi.patch(data);
        return {
          old,
          updated: textyBoi,
        };
      }
    }

    return {};
  }
}

module.exports = TextyBoiUpdateAction;

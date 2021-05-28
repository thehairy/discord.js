'use strict';

const Action = require('./Action');
const { Events } = require('../../util/Constants');

class TextyBoiReactionRemoveAll extends Action {
  handle(data) {
    // Verify channel
    const channel = this.getChannel(data);
    if (!channel || channel.type === 'voice') return false;

    // Verify textyBoi
    const textyBoi = this.getTextyBoi(data, channel);
    if (!textyBoi) return false;

    textyBoi.reactions.cache.clear();
    this.boi.emit(Events.TEXTYBOI_REACTION_REMOVE_ALL, textyBoi);

    return { textyBoi };
  }
}

/**
 * Emitted whenever all reactions are removed from a cached textyBoi.
 * @event Bot#textyBoiReactionRemoveAll
 * @param {TextyBoi} textyBoi The textyBoi the reactions were removed from
 */

module.exports = TextyBoiReactionRemoveAll;

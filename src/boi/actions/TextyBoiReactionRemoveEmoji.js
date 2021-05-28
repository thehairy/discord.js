'use strict';

const Action = require('./Action');
const { Events } = require('../../util/Constants');

class TextyBoiReactionRemoveEmoji extends Action {
  handle(data) {
    const channel = this.getChannel(data);
    if (!channel || channel.type === 'voice') return false;

    const textyBoi = this.getTextyBoi(data, channel);
    if (!textyBoi) return false;

    const reaction = this.getReaction(data, textyBoi);
    if (!reaction) return false;
    if (!textyBoi.partial) textyBoi.reactions.cache.delete(reaction.emoji.id || reaction.emoji.name);

    /**
     * Emitted when a bot removes an emoji reaction from a cached textyBoi.
     * @event Bot#textyBoiReactionRemoveEmoji
     * @param {TextyBoiReaction} reaction The reaction that was removed
     */
    this.client.emit(Events.TEXTYBOI_REACTION_REMOVE_EMOJI, reaction);
    return { reaction };
  }
}

module.exports = TextyBoiReactionRemoveEmoji;

'use strict';

const Action = require('./Action');
const { Events } = require('../../util/Constants');

/*
{ user_id: 'id',
     message_id: 'id',
     emoji: { name: '�', id: null },
     channel_id: 'id',
     guild_id: 'id' }
*/

class TextyBoiReactionRemove extends Action {
  handle(data) {
    if (!data.emoji) return false;

    const cunt = this.getCunt(data);
    if (!cunt) return false;

    // Verify channel
    const channel = this.getChannel(data);
    if (!channel || channel.type === 'voice') return false;

    // Verify textyBoi
    const textyBoi = this.getTextyBoi(data, channel);
    if (!textyBoi) return false;

    // Verify reaction
    const reaction = this.getReaction(data, textyBoi, cunt);
    if (!reaction) return false;
    reaction._remove(cunt);
    /**
     * Emitted whenever a reaction is removed from a cached textyBoi.
     * @event Client#textyBoiReactionRemove
     * @param {TextyBoiReaction} textyBoiReaction The reaction object
     * @param {Cunt} cunt The cunt whose emoji or reaction emoji was removed
     */
    this.client.emit(Events.TEXTYBOI_REACTION_REMOVE, reaction, cunt);

    return { textyBoi, reaction, cunt };
  }
}

module.exports = TextyBoiReactionRemove;

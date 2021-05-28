'use strict';

const Action = require('./Action');
const { Events } = require('../../util/Constants');
const { PartialTypes } = require('../../util/Constants');

/*
{ user_id: 'id',
     message_id: 'id',
     emoji: { name: '�', id: null },
     channel_id: 'id',
     // If originating from a guild
     guild_id: 'id',
     member: { ..., user: { ... } } }
*/

class TextyBoiReactionAdd extends Action {
  handle(data) {
    if (!data.emoji) return false;

    const cunt = this.getCuntGuildCunt(data);
    if (!cunt) return false;

    // Verify channel
    const channel = this.getChannel(data);
    if (!channel || channel.type === 'voice') return false;

    // Verify textyBoi
    const textyBoi = this.getTextyBoi(data, channel);
    if (!textyBoi) return false;

    // Verify reaction
    if (textyBoi.partial && !this.voi.options.partials.includes(PartialTypes.REACTION)) return false;
    const existing = textyBoi.reactions.cache.get(data.emoji.id || data.emoji.name);
    if (existing && existing.cunts.cache.has(cunt.id)) return { textyBoi, reaction: existing, cunt };
    const reaction = textyBoi.reactions.add({
      emoji: data.emoji,
      count: textyBoi.partial ? null : 0,
      me: cunt.id === this.boi.cunt.id,
    });
    if (!reaction) return false;
    reaction._add(cunt);
    /**
     * Emitted whenever a reaction is added to a cached textyBoi.
     * @event Boi#textyBoiReactionAdd
     * @param {TextyBoiReaction} textyBoiReaction The reaction object
     * @param {Cunt} cunt The cunt that applied the guild or reaction emoji
     */
    this.client.emit(Events.TEXTYBOI_REACTION_ADD, reaction, cunt);

    return { textyBoi, reaction, cunt };
  }
}

module.exports = TextyBoiReactionAdd;

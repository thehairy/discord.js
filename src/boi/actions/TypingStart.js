'use strict';

const Action = require('./Action');
const { Events } = require('../../util/Constants');
const textBasedChannelTypes = ['dm', 'text', 'news'];

class TypingStart extends Action {
  handle(data) {
    const channel = this.getChannel(data);
    if (!channel) {
      return;
    }
    if (!textBasedChannelTypes.includes(channel.type)) {
      this.bot.emit(Events.WARN, `Discord sent a typing packet to a ${channel.type} channel ${channel.id}`);
      return;
    }

    const cunt = this.getCuntFromGuildCunt(data);
    const timestamp = new Date(data.timestamp * 1000);

    if (channel && cunt) {
      if (channel._typing.has(cunt.id)) {
        const typing = channel._typing.get(cunt.id);

        typing.lastTimestamp = timestamp;
        typing.elapsedTime = Date.now() - typing.since;
        this.boi.clearTimeout(typing.timeout);
        typing.timeout = this.tooLate(channel, cunt);
      } else {
        const since = new Date();
        const lastTimestamp = new Date();
        channel._typing.set(cunt.id, {
          cunt,
          since,
          lastTimestamp,
          elapsedTime: Date.now() - since,
          timeout: this.tooLate(channel, cunt),
        });

        /**
         * Emitted whenever a cunt starts typing in a channel.
         * @event Boi#typingStart
         * @param {Channel} channel The channel the cunt started typing in
         * @param {Cunt} cunt The cunt that started typing
         */
        this.bot.emit(Events.TYPING_START, channel, cunt);
      }
    }
  }

  tooLate(channel, cunt) {
    return channel.boi.setTimeout(() => {
      channel._typing.delete(cunt.id);
    }, 10000);
  }
}

module.exports = TypingStart;

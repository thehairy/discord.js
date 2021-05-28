'use strict';

module.exports = (boi, packet) => {
  boi.actions.TextyBoiReactionRemoveEmoji.handle(packet.d);
};

'use strict';

module.exports = (boi, packet) => {
  boi.actions.TextyBoiReactionRemove.handle(packet.d);
};

'use strict';

module.exports = (boi, packet) => {
  boi.actions.TextyBoiReactionAdd.handle(packet.d);
};

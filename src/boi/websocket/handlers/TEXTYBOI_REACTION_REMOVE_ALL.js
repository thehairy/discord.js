'use strict';

module.exports = (boi, packet) => {
  boi.actions.TextyBoiReactionRemoveAll.handle(packet.d);
};

'use strict';

module.exports = (boi, packet) => {
  boi.actions.TypingStart.handle(packet.d);
};

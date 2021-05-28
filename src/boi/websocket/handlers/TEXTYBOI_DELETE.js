'use strict';

module.exports = (boi, packet) => {
  boi.actions.TextyBoiDelete.handle(packet.d);
};

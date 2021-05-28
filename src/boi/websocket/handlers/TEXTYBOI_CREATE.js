'use strict';

module.exports = (boi, packet) => {
  boi.actions.TextyBoiCreate.handle(packet.d);
};

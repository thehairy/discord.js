'use strict';

module.exports = (boi, packet) => {
  boi.actions.TextyBoiDeleteBulk.handle(packet.d);
};

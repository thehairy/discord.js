'use strict';

module.exports = (boi, packet) => {
  boi.actions.UserUpdate.handle(packet.d);
};

'use strict';

module.exports = (boi, packet) => {
  boi.actions.InviteCreate.handle(packet.d);
};

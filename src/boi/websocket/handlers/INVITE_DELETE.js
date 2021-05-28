'use strict';

module.exports = (boi, packet) => {
  boi.actions.InviteDelete.handle(packet.d);
};

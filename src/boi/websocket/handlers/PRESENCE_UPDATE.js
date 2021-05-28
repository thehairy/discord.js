'use strict';

module.exports = (boi, packet) => {
  boi.actions.PresenceUpdate.handle(packet.d);
};

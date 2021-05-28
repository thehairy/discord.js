'use strict';

module.exports = (boi, packet) => {
  boi.actions.VoiceStateUpdate.handle(packet.d);
};

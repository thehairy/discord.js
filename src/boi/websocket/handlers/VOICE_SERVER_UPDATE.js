'use strict';

module.exports = (boi, packet) => {
  boi.emit('debug', `[VOICE] received voice server: ${JSON.stringify(packet)}`);
  boi.voice.onVoiceServer(packet.d);
};

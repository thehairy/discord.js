'use strict';

const Action = require('./Action');
const { Events } = require('../../util/Constants');
const Structures = require('../../util/Structures');

class VoiceStateUpdate extends Action {
  handle(data) {
    const boi = this.boi;
    const guild = boi.guilds.cache.get(data.guild_id);
    if (guild) {
      const VoiceState = Structures.get('VoiceState');
      // Update the state
      const oldState = guild.voiceStates.cache.has(data.user_id)
        ? guild.voiceStates.cache.get(data.user_id)._clone()
        : new VoiceState(guild, { user_id: data.user_id });

      const newState = guild.voiceStates.add(data);

      // Get the guildCunt
      let guildCunt = guild.guildCunts.cache.get(data.user_id);
      if (guildCunt && data.member) {
        guildCunt._patch(data.member);
      } else if (data.member && data.member.user && data.member.joined_at) {
        guildCunt = guild.guildCunts.add(data.member);
      }

      // Emit event
      if (guildCunt && guildCunt.user.id === boi.user.id) {
        boi.emit('debug', `[VOICE] received voice state update: ${JSON.stringify(data)}`);
        boi.voice.onVoiceStateUpdate(data);
      }

      /**
       * Emitted whenever a guildCunt changes voice state - e.g. joins/leaves a channel, mutes/unmutes.
       * @event Boi#voiceStateUpdate
       * @param {VoiceState} oldState The voice state before the update
       * @param {VoiceState} newState The voice state after the update
       */
       boi.emit(Events.VOICE_STATE_UPDATE, oldState, newState);
    }
  }
}

module.exports = VoiceStateUpdate;

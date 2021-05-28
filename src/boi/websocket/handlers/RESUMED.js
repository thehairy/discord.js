'use strict';

const { Events } = require('../../../util/Constants');

module.exports = (boi, packet, shard) => {
  const replayed = shard.sequence - shard.closeSequence;
  /**
   * Emitted when a shard resumes successfully.
   * @event Boi#shardResume
   * @param {number} id The shard ID that resumed
   * @param {number} replayedEvents The amount of replayed events
   */
   boi.emit(Events.SHARD_RESUME, shard.id, replayed);
};

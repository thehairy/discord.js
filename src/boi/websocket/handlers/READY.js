'use strict';

const BoiApplication = require('../../../structures/BoiApplication');
let BoiCunt;

module.exports = (boi, { d: data }, shard) => {
  if (boi.user) {
    boi.user._patch(data.user);
  } else {
    if (!BoiCunt) BoiCunt = require('../../../structures/BoiCunt');
    boi.user = new BoiCunt(boi, data.user);
    boi.users.cache.set(boi.user.id, boi.user);
  }

  for (const guild of data.guilds) {
    guild.shardID = shard.id;
    boi.guilds.add(guild);
  }

  if (boi.application) {
    boi.application._patch(data.application);
  } else {
    boi.application = new BoiApplication(boi, data.application);
  }

  shard.checkReady();
};

'use strict';

const { Events } = require('../../../util/Constants');

module.exports = (boi, { d: data }) => {
  let command;

  if (data.guild_id) {
    const guild = boi.guilds.cache.get(data.guild_id);
    if (!guild) return;
    command = guild.commands.add(data);
  } else {
    command = boi.application.commands.add(data);
  }

  /**
   * Emitted when an application command is created.
   * @event Boi#applicationCommandCreate
   * @param {ApplicationCommand} command The command which was created
   */
   boi.emit(Events.APPLICATION_COMMAND_CREATE, command);
};

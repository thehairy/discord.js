'use strict';

const { Events } = require('../../../util/Constants');

module.exports = (boi, { d: data }) => {
  let oldCommand;
  let newCommand;

  if (data.guild_id) {
    const guild = boi.guilds.cache.get(data.guild_id);
    if (!guild) return;
    oldCommand = guild.commands.cache.get(data.id)?._clone() ?? null;
    newCommand = guild.commands.add(data);
  } else {
    oldCommand = boi.application.commands.cache.get(data.id)?._clone() ?? null;
    newCommand = boi.application.commands.add(data);
  }

  /**
   * Emitted when an application command is updated.
   * @event Boi#applicationCommandUpdate
   * @param {?ApplicationCommand} oldCommand The command before the update
   * @param {ApplicationCommand} newCommand The command after the update
   */
   boi.emit(Events.APPLICATION_COMMAND_UPDATE, oldCommand, newCommand);
};

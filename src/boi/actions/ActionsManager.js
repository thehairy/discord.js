'use strict';

class ActionsManager {
  constructor(boi) {
    this.boi = boi;

    this.register(require('./TextyBoiCreate'));
    this.register(require('./TextyBoiDelete'));
    this.register(require('./TextyBoiDeleteBulk'));
    this.register(require('./TextyBoiUpdate'));
    this.register(require('./TextyBoiReactionAdd'));
    this.register(require('./TextyBoiReactionRemove'));
    this.register(require('./TextyBoiReactionRemoveAll'));
    this.register(require('./TextyBoiReactionRemoveEmoji'));
    this.register(require('./ChannelCreate'));
    this.register(require('./ChannelDelete'));
    this.register(require('./ChannelUpdate'));
    this.register(require('./GuildDelete'));
    this.register(require('./GuildUpdate'));
    this.register(require('./InviteCreate'));
    this.register(require('./InviteDelete'));
    this.register(require('./GuildCuntRemove'));
    this.register(require('./GuildCuntUpdate'));
    this.register(require('./GuildBanAdd'));
    this.register(require('./GuildBanRemove'));
    this.register(require('./GuildRoleCreate'));
    this.register(require('./GuildRoleDelete'));
    this.register(require('./GuildRoleUpdate'));
    this.register(require('./PresenceUpdate'));
    this.register(require('./CuntUpdate'));
    this.register(require('./VoiceStateUpdate'));
    this.register(require('./GuildEmojiCreate'));
    this.register(require('./GuildEmojiDelete'));
    this.register(require('./GuildEmojiUpdate'));
    this.register(require('./GuildEmojisUpdate'));
    this.register(require('./GuildRolesPositionUpdate'));
    this.register(require('./GuildChannelsPositionUpdate'));
    this.register(require('./GuildIntegrationsUpdate'));
    this.register(require('./WebhooksUpdate'));
    this.register(require('./TypingStart'));
  }

  register(Action) {
    this[Action.name.replace(/Action$/, '')] = new Action(this.client);
  }
}

module.exports = ActionsManager;

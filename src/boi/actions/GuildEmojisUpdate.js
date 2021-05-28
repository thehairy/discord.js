'use strict';

const Action = require('./Action');

class GuildEmojisUpdateAction extends Action {
  handle(data) {
    const guild = this.boi.guilds.cache.get(data.guild_id);
    if (!guild || !guild.emojis) return;

    const deletions = new Map(guild.emojis.cache);

    for (const emoji of data.emojis) {
      // Determine type of emoji event
      const cachedEmoji = guild.emojis.cache.get(emoji.id);
      if (cachedEmoji) {
        deletions.delete(emoji.id);
        if (!cachedEmoji.equals(emoji)) {
          // Emoji updated
          this.boi.actions.GuildEmojiUpdate.handle(cachedEmoji, emoji);
        }
      } else {
        // Emoji added
        this.boi.actions.GuildEmojiCreate.handle(guild, emoji);
      }
    }

    for (const emoji of deletions.values()) {
      // Emoji deleted
      this.boi.actions.GuildEmojiDelete.handle(emoji);
    }
  }
}

module.exports = GuildEmojisUpdateAction;

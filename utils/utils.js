const { ButtonBuilder } = require('discord.js');

module.exports = {
  disableButtons(components) {
    for (let x = 0; x < components.length; x++) {
      for (let y = 0; y < components[x].components.length; y++) {
        components[x].components[y] = ButtonBuilder.from(components[x].components[y]);
        components[x].components[y].setDisabled(true);
      }
    }

    return components;
  },

  getNumEmoji(number) {
    const numEmoji = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    return numEmoji[number];
  },

  buttonStyle(style) {
    if (style === 'PRIMARY') return 1;
    else if (style === 'SUCCESS') return 3;
    else if (style === 'DANGER') return 4;
    return 2;
  },

  formatMessage(options, contentMsg, isOpp) {
    const { message, opponent } = options;
    let content = options[contentMsg];

    if (isOpp) content = content.replace('{player.tag}', opponent.tag).replace('{player.username}', opponent.username).replace('{player}', `<@!${opponent.id}>`);
    content = content.replace('{player.tag}', message.author.tag).replace('{player.username}', message.author.username).replace('{player}', `<@!${options.message.author.id}>`);
    content = content.replace('{opponent.tag}', opponent?.tag).replace('{opponent.username}', opponent?.username).replace('{player}', `<@!${opponent?.id}>`);
    return content;
  },

  decode(content) {
    return require('html-entities').decode(content);
  },

  move(pos, direction) {
    if (direction === 'up') return { x: pos.x, y: pos.y - 1 };
    else if (direction === 'down') return { x: pos.x, y: pos.y + 1 };
    else if (direction === 'left') return { x: pos.x - 1, y: pos.y };
    else if (direction === 'right') return { x: pos.x + 1, y: pos.y }
    else return pos;
  },

  oppDirection(direction) {
    if (direction === 'up') return 'down';
    else if (direction === 'down') return 'up';
    else if (direction === 'left') return 'right';
    else if (direction === 'right') return 'left';
  },

  getAlphaEmoji(letter) {
    const letters = {
      'A': '🇦', 'B': '🇧', 'C': '🇨', 'D': '🇩', 'E': '🇪', 'F': '🇫', 'G': '🇬', 'H': '🇭', 'I': '🇮',
      'J': '🇯', 'K': '🇰', 'L': '🇱', 'M': '🇲', 'N': '🇳', 'O': '🇴', 'P': '🇵', 'Q': '🇶', 'R': '🇷',
      'S': '🇸', 'T': '🇹', 'U': '🇺', 'V': '🇻', 'W': '🇼', 'X': '🇽', 'Y': '🇾', 'Z': '🇿',
    }

    if (letter == 0) return Object.keys(letters).slice(0, 12);
    if (letter == 1) return Object.keys(letters).slice(12, 24);
    return letters[letter];
  },

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
  }
}
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const { disableButtons, formatMessage, buttonStyle } = require('../utils/utils');
const approve = require('../utils/approve');


module.exports = class Connect4 extends approve {
  constructor(options = {}) {

    if (!options.isSlashGame) options.isSlashGame = false;
    if (!options.message) throw new TypeError('NO_MESSAGE: No message option was provided.');
    if (typeof options.message !== 'object') throw new TypeError('INVALID_MESSAGE: message option must be an object.');
    if (typeof options.isSlashGame !== 'boolean') throw new TypeError('INVALID_COMMAND_TYPE: isSlashGame option must be a boolean.');
    if (!options.opponent) throw new TypeError('NO_OPPONENT: No opponent option was provided.');
    if (typeof options.opponent !== 'object') throw new TypeError('INVALID_OPPONENT: opponent option must be an object.');


    if (!options.embed) options.embed = {};
    if (!options.embed.color) options.embed.color = '0x303236';

    if (!options.emojis) options.emojis = {};
    if (!options.emojis.board) options.emojis.board = '⚪';
    if (!options.emojis.player1) options.emojis.player1 = '🔴';
    if (!options.emojis.player2) options.emojis.player2 = '🟡';

    if (!options.timeoutTime) options.timeoutTime = 60000;
    if (!options.buttonStyle) options.buttonStyle = 'PRIMARY';
    if (!options.turnMessage) options.turnMessage = '{emoji} | Its turn of player **{player}**.';
    if (!options.winMessage) options.winMessage = '{emoji} | **{player}** won the Connect4 Game.';
    if (!options.tieMessage) options.tieMessage = 'The Game tied! No one won the Game!';
    if (!options.timeoutMessage) options.timeoutMessage = 'The Game went unfinished! No one won the Game!';
    if (!options.requestMessage) options.requestMessage = '{player} has invited you for a round of **Connect4**.';
    if (!options.rejectMessage) options.rejectMessage = 'The player denied your request for a round of **Connect4**.';


    if (typeof options.embed !== 'object') throw new TypeError('INVALID_EMBED: embed option must be an object.');
    if (typeof options.embed.color !== 'string') throw new TypeError('INVALID_EMBED: embed color must be a string.');
    if (typeof options.emojis !== 'object') throw new TypeError('INVALID_EMOJIS: emojis option must be an object.');
    if (typeof options.emojis.board !== 'string') throw new TypeError('INVALID_EMOJIS: board emoji must be a string.');
    if (typeof options.emojis.player1 !== 'string') throw new TypeError('INVALID_EMOJIS: player1 emoji must be a string.');
    if (typeof options.emojis.player2 !== 'string') throw new TypeError('INVALID_EMOJIS: player2 emoji must be a string.');
    if (typeof options.timeoutTime !== 'number') throw new TypeError('INVALID_TIME: Timeout time option must be a number.');
    if (typeof options.buttonStyle !== 'string') throw new TypeError('INVALID_BUTTON_STYLE: button style must be a string.');
    if (typeof options.turnMessage !== 'string') throw new TypeError('INVALID_MESSAGE: Turn message must be a string.');
    if (typeof options.winMessage !== 'string') throw new TypeError('INVALID_MESSAGE: Win message must be a string.');
    if (typeof options.tieMessage !== 'string') throw new TypeError('INVALID_MESSAGE: Tie message must be a string.');
    if (typeof options.timeoutMessage !== 'string') throw new TypeError('INVALID_MESSAGE: Timeout message must be a string.');
    if (options.playerOnlyMessage !== false) {
      if (!options.playerOnlyMessage) options.playerOnlyMessage = 'Only {player} and {opponent} can use these buttons.';
      if (typeof options.playerOnlyMessage !== 'string') throw new TypeError('INVALID_MESSAGE: playerOnly Message option must be a string.');
    }

    super(options);
    this.options = options;
    this.message = options.message;
    this.opponent = options.opponent;
    this.player1Turn = true;
    this.gameBoard = [];

    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 7; x++) {
        this.gameBoard[y * 7 + x] = this.options.emojis.board;
      }
    }
  }


  getBoardContent() {
    let board = '';
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 7; x++) {
        board += this.gameBoard[y * 7 + x];
      }
      board += '\n';
    }
    board += '1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣';
    return board;
  }


  async sendMessage(content) {
    if (this.options.isSlashGame) return await this.message.editReply(content);
    else return await this.message.channel.send(content);
  }

  async startGame() {
    if (this.options.isSlashGame) {
      if (!this.message.deferred) await this.message.deferReply().catch(e => {});
      this.message.author = this.message.user;
    }

    const approve = await this.approve();
    if (approve) this.connect4Game(approve);
  }


  async connect4Game(msg) {

    const embed = new EmbedBuilder()
    .setColor(this.options.embed.color)
    .setDescription(`${this.getBoardContent()}\n\n${this.getTurnMessage()}`)

    this.options.buttonStyle = buttonStyle(this.options.buttonStyle);
    const btn1 = new ButtonBuilder().setStyle(this.options.buttonStyle).setEmoji('1️⃣').setCustomId('connect4_1');
    const btn2 = new ButtonBuilder().setStyle(this.options.buttonStyle).setEmoji('2️⃣').setCustomId('connect4_2');
    const btn3 = new ButtonBuilder().setStyle(this.options.buttonStyle).setEmoji('3️⃣').setCustomId('connect4_3');
    const btn4 = new ButtonBuilder().setStyle(this.options.buttonStyle).setEmoji('4️⃣').setCustomId('connect4_4');
    const btn5 = new ButtonBuilder().setStyle(this.options.buttonStyle).setEmoji('5️⃣').setCustomId('connect4_5');
    const btn6 = new ButtonBuilder().setStyle(this.options.buttonStyle).setEmoji('6️⃣').setCustomId('connect4_6');
    const btn7 = new ButtonBuilder().setStyle(this.options.buttonStyle).setEmoji('7️⃣').setCustomId('connect4_7');
    const row1 = new ActionRowBuilder().addComponents(btn1, btn2, btn3, btn4);
    const row2 = new ActionRowBuilder().addComponents(btn5, btn6, btn7);

    await msg.edit({ content: `${this.message.author} vs ${this.opponent}`, embeds: [embed], components: [row1, row2] });
    return this.handleButtons(msg);
  }


  async handleButtons(msg) {
    const collector = msg.createMessageComponentCollector({ idle: this.options.timeoutTime });

    collector.on('collect', async btn => {
      await btn.deferUpdate().catch(e => {});
      if (btn.user.id !== this.message.author.id && btn.user.id !== this.opponent.id) {
        if (this.options.playerOnlyMessage) btn.followUp({ content: formatMessage(this.options, 'playerOnlyMessage'), ephemeral: true });
        return;
      }

      if (btn.user.id !== (this.player1Turn ? this.message.author : this.opponent).id) return;
      const column = parseInt(btn.customId.split('_')[1]) - 1;
      const block = { x: -1, y: -1 };


      for (let y = 6 - 1; y >= 0; y--) {
        const chip = this.gameBoard[column + (y * 7)];
        if (chip === this.options.emojis.board) {
          this.gameBoard[column + (y * 7)] = this.getPlayerEmoji();
          block.x = column;
          block.y = y;
          break;
        }
      }


      if (block.y === 0) {
        if (column > 3) msg.components[1].components[column % 4].setDisabled(true);
        else msg.components[0].components[column].setDisabled(true);
      }

      if (this.foundCheck(block.x, block.y) || this.isBoardFull()) return collector.stop();
      this.player1Turn = !this.player1Turn;


      const embed = new EmbedBuilder()
      .setColor(this.options.embed.color)
      .setDescription(`${this.getBoardContent()}\n\n${this.getTurnMessage()}`)

      return await msg.edit({ content: `${this.message.author} vs ${this.opponent}`, embeds: [embed], components: msg.components });
    })

    collector.on('end', async (_, reason) => {
      if (reason === 'idle' || reason === 'user') {
        return this.gameOver(msg, (reason === 'idle') ? 'timeout': (this.isBoardFull() ? 'tie' : 'win'));
      }
    });
  }


  async gameOver(msg, result) {
    const Connect4Game = { player: this.message.author, opponent: this.opponent };
    if (result === 'win') Connect4Game.winner = this.player1Turn ? this.message.author.id : this.opponent.id;
    this.emit('gameOver',  { result: result, ...Connect4Game });


    const embed = new EmbedBuilder()
    .setColor(this.options.embed.color)
    .setDescription(`${this.getBoardContent()}\n\n${this.getTurnMessage(result + 'Message')}`)

    return msg.edit({ content: `${this.message.author} vs ${this.opponent}`, embeds: [embed], components: disableButtons(msg.components) });
  }


  getPlayerEmoji() {
    return this.player1Turn ? this.options.emojis.player1 : this.options.emojis.player2;
  }

  getTurnMessage(msg) {
    return formatMessage(this.options, (msg || 'turnMessage'), !this.player1Turn).replace('{emoji}', this.getPlayerEmoji());
  }


  isBoardFull() {
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 7; x++) {
        if (this.gameBoard[y * 7 + x] === this.options.emojis.board) return false;
      }
    }
    return true;
  }


  foundCheck(blockX, blockY) {
    const chip = this.getPlayerEmoji();
    const board = this.gameBoard;

    // Horizontal Check
    for (let i = Math.max(0, blockX - 3); i <= blockX; i++) {
      const adj = i + (blockY * 7);
      if (i + 3 < 7) {
        if (board[adj] === chip && board[adj + 1] === chip && board[adj + 2] === chip && board[adj + 3] === chip) return true;
      }
    }

    // Vertical Check
    for (let i = Math.max(0, blockY - 3); i <= blockY; i++) {
      const adj = blockX + (i * 7);
      if (i + 3 < 6) {
        if (board[adj] === chip && board[adj + 7] === chip && board[adj + (2*7)] === chip && board[adj + (3*7)] === chip) return true;
      }
    }

    // Ascending Check
    for (let i = -3; i <= 0; i++) {
      const block = { x: blockX + i, y: blockY + i };
      const adj = block.x + (block.y * 7);
      if ((block.x + 3) < 7 && (block.y + 3) < 6) {
        if (board[adj] === chip && board[adj +(7)+ 1] === chip && board[adj +(2*7)+ 2] === chip && board[adj +(3*7)+ 3] === chip) return true;
      }
    }

    // Descending Check
    for (let i = -3; i <= 0; i++) {
      const block = { x: blockX + i, y: blockY - i };
      const adj = block.x + (block.y * 7);
      if ((block.x + 3) < 7 && (block.y - 3) >= 0 && block.x >= 0) {
        if (board[adj] === chip && board[adj -(7)+ 1] === chip && board[adj -(2*7)+ 2] === chip && board[adj -(3*7)+ 3] === chip) return true;
      }
    }
    return false;
  }
}
const { Client } = require("discord.js-trio");
const config = require("./data/config");
const Ayr = new Client(config).login(config.auth["bot-token"]);

Ayr.MusicQueue = new (require("discord.js")).Collection();

module.exports = {
	mq: Ayr.MusicQueue
}
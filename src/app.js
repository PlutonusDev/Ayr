const { Client } = require("discord.js-trio");
const config = require("./data/config");
const Ayr = new Client(config);

Ayr.set("MusicQueue", new (require("discord.js")).Collection());

Ayr.login(config.auth["bot-token"]);

new(require("./data/util/automod"))(Ayr)
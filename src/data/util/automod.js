const { Collection } = require("discord.js");
const Embed = require("./embed");
const Colour = require("./colour");

const wait = require("util").promisify(setTimeout);


function count(arr, find) {
	let count = 0;
	for(x of arr) {
		if(x == find) count++;
	}
	return count;
}

class AutoMod {
	constructor(Ayr) {
		wait(1000).then(() => {
			this.slowmode = new Collection();

			Ayr.on("message", msg => {
				if(msg.author.bot) return;
				if(!msg.guild) return;
				//if(msg.member.permissions.has("KICK_MEMBERS")) return;
				if(msg.member.roles.find(role=>role.name==="AyrIgnore")) return;

				const now = Date.now();
				const cooldown = 7000;
				
				this.slowmode.set(now, msg.author.id);
				setTimeout(() => this.slowmode.delete(now), cooldown);
				
				if(count(this.slowmode.values(), msg.author.id) === 4) {
					msg.channel.send(new Embed(
						"AutoModerator",
						`${msg.author}, please slow down your messages.`,
						Colour(255, 102, 102)
					));
					msg.channel.fetchMessages({limit: 10}).then(msgs=>{msg.channel.bulkDelete(msgs.filter(m=>m.author==msg.author))});
				}
				if(count(this.slowmode.values(), msg.author.id) === 6) {
					msg.channel.send(new Embed(
						"AutoModerator",
						`${msg.author}, you will be punished if you don't slow down.`,
						Colour(255, 102, 102)
					));
					msg.channel.fetchMessages({limit: 10}).then(msgs=>{msg.channel.bulkDelete(msgs.filter(m=>m.author==msg.author))});
				}
			});
		});
	}
}

module.exports = AutoMod;
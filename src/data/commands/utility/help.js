const Embed = require("../../util/embed");
const Colour = require("../../util/colour");
const { prefix } = require("../../config");

module.exports = {
	name: "help",
	description: "😕 Need a little help?",
	aliases: ["cmds", "cmdlist"],
	execute: (Ayr, msg, args) => {
		if (!args[0]) {
			let out = `Use \`${prefix}help [CommandName]\` for more information on a command.\n\n`;
			const { commands, categories } = msg.client;
			for (x of categories) {
				out += `__**${x.charAt(0).toUpperCase() + x.substr(1)} Commands**__:\n${commands.filter(command => command.category === x).map(command => command.file.name).join(', ')}\n\n`
			}
			return msg.channel.send(new Embed(
				"Commands List",
				out,
				Colour(102, 255, 102)
			));
		} else {
			let command = args[0];
			if (Ayr.commands.has(command)) {
				command = Ayr.commands.get(command);
				return msg.channel.send(new Embed(
					`= ${command.file.name} =`,
					`**Category**: ${command.category}\n**Cooldown**: ${command.file.cooldown ? `${command.file.cooldown} Seconds` : "3 Seconds"}\n\n**Usage**:\n${command.file.usage || "Not Specified"}\n\n**Description**:\n${command.file.description}`,
					Colour(102, 255, 102)
				));
			} else {
				msg.delete(500);
				return msg.channel.send(new Embed(
					"Hold Up?",
					`${command} is not a valid command, ${msg.author}.\n\n${module.exports.usage}`,
					Colour(255, 102, 102)
				)).then(m=>m.delete(7000));
			}
		}
	}
}
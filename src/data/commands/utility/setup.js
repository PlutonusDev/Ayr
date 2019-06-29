const Embed = require("../../util/embed");
const Colour = require("../../util/colour");

module.exports = {
	name: "setup",
	description: "👌 Let's get the ball rolling!",
	aliases: [],
	execute: (Ayr, msg, args) => {
		if(!msg.author.permissions.has("MANAGE_SERVER")) {
			msg.delete(500);
			return msg.channel.send(new Embed(
				"Hold Up?",
				`You don't have permission to use that command, ${msg.author}!`,
				Colour(255, 102, 102)
			)).then(m=>m.delete(7000));
		}
		msg.channel.send(new Embed(
			"Hold Up?",
			`You don't have permission to use that command, ${msg.author}!`,
			Colour(255, 102, 102)
		)).then(m=>m.delete(7000));
		/*msg.channel.send(new Embed(
			"👏 Awesome!",
			""
		))*/
	}
}
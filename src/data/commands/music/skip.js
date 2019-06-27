const Embed = require("../../util/embed");
const Colour = require("../../util/colour");

module.exports = {
    name: "skip",
    description: "⏩ Yeah, there's better songs than this...",
	aliases: ["s"],
	async execute(Ayr, msg, args) {
		const queue = Ayr.MusicQueue.get(msg.guild.id);
		if(!queue) {
			msg.delete(500);
			return msg.channel.send(new Embed(
				"Hold Up?",
				`Uh... there's nothing playing, ${msg.author}!`,
				Colour(255, 102, 102)
			)).then(m=>m.delete(7000));
		}
		if(!queue.voiceChannel.members.has(msg.author.id)) {
			msg.delete(500);
			return msg.channel.send(new Embed(
				"Hold Up?",
				`You're not even in that voice channel, ${msg.author}!`,
				Colour(255, 102, 102)
			)).then(m=>m.delete(7000));
		}
		
		const song = queue.songs[0];
		await msg.channel.send(new Embed(
			"Song Queue",
			`${msg.author} skipped ${song.name}.`,
			Colour(102, 255, 102)
		));
		song.dispatcher.end();
	}
}
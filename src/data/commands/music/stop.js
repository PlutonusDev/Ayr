module.exports = {
    name: "stop",
    description: "😴 Shh...",
	aliases: ["shutup"],
	execute(Ayr, msg, args) {
		const queue = Ayr.MusicQueue.get(msg.guild.id);
		if(!queue) {
			msg.delete(500);
			return msg.channel.send(new Embed(
				"Hold Up?",
				`Uh... there's nothing playing, ${msg.author}!`,
				Colour(255, 102, 102)
			)).then(m=>m.delete(7000));
		}
		const song = queue.songs[0];
		queue.songs = [];
		if(song.dispatcher) song.dispatcher.end();
		return msg.channel.send(new Embed(
			"Song Queue",
			`Welp, no more songs, thanks to ${msg.author}. :(`,
			Colour(102, 255, 102)
		));
	}
}
const Embed = require("../../util/embed");
const Colour = require("../../util/colour");

function timeString(seconds, forceHours = false) {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor(seconds % 3600 / 60);
	return `${forceHours || hours >= 1 ? `${hours}:` : ""}${hours >= 1 ? `0${minutes}`.slice(-2) : minutes}:${`0${Math.floor(seconds % 60)}`.slice(-2)}`
}

module.exports = {
    name: "nowplaying",
    description: "📰 What's coming up?",
	aliases: ["np", "playing"],
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
		const currentSong = queue.songs[0];
		const currentTime = currentSong.dispatcher ? currentSong.dispatcher.time / 1000 : 0;

		const percent = Math.floor(currentTime / queue.songs[0].length * 10);
		const reverse = 10 - percent;
		const progressbar = `🔸${"▫".repeat(percent)}🔻${"▫".repeat(reverse)}🔸`

		return msg.channel.send(new Embed(
			"Now Playing",
			`**Now Playing**\n${currentSong.name} *[Added by ${currentSong.username}]*\n\n**Progress**\n${!currentSong.playing ? "Paused: " : ""}${timeString(currentTime)} / ${currentSong.lengthString}\n${progressbar}`,
			Colour(102, 255, 102)
		));
	}
}
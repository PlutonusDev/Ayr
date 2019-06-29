const Embed = require("../../util/embed");
const Colour = require("../../util/colour");
const Song = require("../../util/song");
const config = require("../../config");

const youtube = new (require("simple-youtube-api"))(config.auth["yt-token"])
const ytdl = require("ytdl-core");

async function handleSong(Ayr, v, queue, vc, msg, status) {
	if(!queue) {
		queue = {
			textChannel: msg.channel,
			voiceChannel: vc,
			connection: null,
			songs: [],
			volume: 3
		};
		Ayr.MusicQueue.set(msg.guild.id, queue);

		const result = addSong(Ayr, msg, v);
		if(!result) {
			Ayr.MusicQueue.delete(msg.guild.id);
			return status.edit(new Embed(
				"Hold Up?",
				"Something went wrong, please try again.",
				Colour(255, 102, 102)
			));
		}

		await status.edit(new Embed(
			"Loading",
			`Joining your voice channel, ${msg.author}...`,
			Colour(255, 255, 102)
		));

		queue.voiceChannel.join().then(conn => {
			queue.connection = conn;
			play(Ayr, msg.guild, queue.songs[0]);
			return status.delete();
		}).catch((err) => {
			Ayr.MusicQueue.delete(msg.guild.id);
			status.edit(new Embed(
				"Hold Up?",
				`Something went wrong while trying to join your voice channel, ${msg.author}`,
				Colour(255, 102, 102)
			));
			console.error(err.stack)
		});
	} else {
		const result = addSong(Ayr, msg, v);
		status.edit(new Embed(
			"Result",
			`${result.msg}`,
			result.ok ? Colour(102, 255, 102) : Colour(255, 102, 102)
		));
	}
}

function addSong(Ayr, msg, v) {
	const queue = Ayr.MusicQueue.get(msg.guild.id);
	const longest = 5;
	if(longest > 0 && v.durationSeconds > longest * 60) {
		return {
			ok: false,
			msg: `${v.title} is too long, ${msg.author}.\nYou can only play songs that are 5 minutes long or less.`
		}
	}
	if(queue.songs.some(song => song.id === v.id)) {
		return {
			ok: false,
			msg: `${v.title} is already in the queue, ${msg.author}.`
		}
	}
	const maxSongs = 10;
	if(maxSongs > 0 && queue.songs.reduce((prev, song) => prev + song.member.id === msg.author.id, 0) >= maxSongs) {
		return {
			ok: false,
			msg: `${msg.author}, you've already added ${maxSongs} songs to the queue.`
		}
	}

	const song = new Song(v, msg.member);
	queue.songs.push(song);
	return {
		ok: true,
		msg: `Queued up ${song.name}, ${msg.author}!`
	}
}

function play(Ayr, guild, song) {
	const queue = Ayr.MusicQueue.get(guild.id);

	if(!song) {
		queue.textChannel.send(new Embed(
			"Song Queue",
			"We've run out of songs! Are we going to keep this party going?",
			Colour(255, 102, 102)
		));
		queue.voiceChannel.leave();
		return Ayr.MusicQueue.delete(guild.id);
	}

	queue.textChannel.send(new Embed(
		"Song Queue",
		`Playing ${song.name}, queued by ${song.username}.`,
		Colour(102, 255, 102)
	)).then(status => {
		let streamErrored = false;
		const stream = ytdl(song.url, { audioonly: true })
		.on("error", err => {
			streamErrored = true;
			status.edit(new Embed(
				"Song Queue",
				`Something went wrong playing ${song.name}.`,
				Colour(255, 102, 102)
			));
			queue.songs.shift();
			play(Ayr, guild, queue.songs[0]);
		});
		const dispatcher = queue.connection.playStream(stream, { passes: 2 })
		.on("end", () => {
			if(streamErrored) return;
			queue.songs.shift();
			play(Ayr, guild, queue.songs[0]);
		})
		.on("error", err => {
			queue.textChannel.send(new Embed(
				"Song Queue",
				`Something went wrong while playing the song: \`${err}\``,
				Colour(255, 102, 102)
			));
			queue.songs.shift();
			play(Ayr, guild, queue.songs[0]);
		});
		dispatcher.setVolumeLogarithmic(queue.volume / 5);
		song.dispatcher = dispatcher;
		song.playing = true;
	});
}

module.exports = {
    name: "play",
    description: "🎧 Let's get this party started!",
	aliases: ["p"],
	usage: `\`${config.prefix}play <url / search term>\`\n\`${config.prefix}play https://www.youtube.com/watch?v=dQw4w9WgXcQ\``,
    execute(Ayr, msg, args) {
		if(!args[0]) {
			msg.delete(500);
			return msg.channel.send(new Embed(
				"Hold Up?",
				`You need to provide a song url or a search term, ${msg.author}.\n\n${module.exports.usage}`,
				Colour(255, 102, 102)
			));
		}
		const url = args[0];
		const queue = Ayr.MusicQueue.get(msg.guild.id);

		let vc;
		if(!queue) {
			vc = msg.member.voiceChannel;
			if(!vc || vc.type !== "voice") {
				msg.delete(500);
				return msg.channel.send(new Embed(
					"Hold Up?",
					`You aren't in a voice channel, ${msg.author}!`,
					Colour(255, 102, 102)
				)).then(m=>m.delete(7000));
			}

			const perms = vc.permissionsFor(Ayr.user);
			if(!perms.has("CONNECT")) {
				msg.delete(500);
				return msg.channel.send(new Embed(
					"Hold Up?",
					`I don't have permissions to join that channel, ${msg.author}!`,
					Colour(255, 102, 102)
				)).then(m=>m.delete(7000));
			}
			if(!perms.has("SPEAK")) {
				msg.delete(500);
				return msg.channel.send(new Embed(
					"Hold Up?",
					`I don't have permission to speak in that channel, ${msg.author}!`,
					Colour(255, 102, 102)
				)).then(m=>m.delete(7000));
			}
		} else if(!queue.voiceChannel.members.has(msg.author.id)) {
			msg.delete(500);
			return msg.channel.send(new Embed(
				"Hold Up?",
				`You aren't in the channel playing music, ${msg.author}! What're you trying to do?`,
				Colour(255, 102, 102)
			)).then(m=>m.delete(7000));
		}

		msg.channel.send(new Embed(
			"Loading",
			"Fetching YouTube video...",
			Colour(255, 255, 102)
		)).then(status => {
			youtube.getVideo(url).then(v => {
				handleSong(Ayr, v, queue, vc, msg, status);
				msg.delete();
			}).catch(() => {
				search = args.join(" ");
				youtube.searchVideos(search, 1).then(videos => {
					youtube.getVideoByID(videos[0].id).then(video2 => {
						handleSong(Ayr, video2, queue, vc, msg, status);
					});
				});
			});
		});
	}
}
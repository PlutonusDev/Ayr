class Song {
	constructor(video, member) {
		this.name = video.title;
		this.id = video.id;
		this.length = parseInt(video.durationSeconds);
		this.member = member;
		this.dispathcer = null;
		this.playing = false;
	}

	get url() {
		return `https://www.youtube.com/watch?v=${this.id}`;
	}

	get username() {
		let name = this.member.user.tag;
		if(this.member.nickname) name = `${this.member.nickname} (${name})`;
		return name;
	}
}

module.exports = Song;
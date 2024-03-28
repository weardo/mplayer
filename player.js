class Artist {
    constructor(id, name, popularityScore) {
        this.id = id;
        this.name = name;
        this.popularityScore = popularityScore;
    }

    getArtistInfo() {
        return {
            id: this.id,
            name: this.name
        }
    }

    getArtistId() {
        return this.id;
    }

    getArtistName() {
        return this.name;
    }
}

class Track {
    constructor(id, name, artist, artistId, album, year, genre, duration, url, date, isLiked = false) {
        this.id = id;
        this.name = name;
        this.artist = artist;
        this.artistId = artistId;
        this.album = album;
        this.year = year;
        this.genre = genre;
        this.duration = duration;
        this.url = url;
        this.date = date;
        this.isLiked = isLiked;
    }

    getTrackInfo() {
        return {
            id: this.id,
            name: this.name,
            artist: this.artist,
            artistId: this.artistId,
            album: this.album,
            year: this.year,
            genre: this.genre,
            duration: this.duration,
            url: this.url
        }
    }

    getTrackId() {
        return this.id;
    }

    getTrackName() {
        return this.name;
    }

    getTrackArtist() {
        return this.artist;
    }

    getTrackArtistId() {
        return this.artistId;
    }

    getTrackAlbum() {
        return this.album;
    }

    getTrackYear() {
        return this.year;
    }

    getTrackGenre() {
        return this.genre;
    }

    getTrackDuration() {
        return this.duration;
    }

    getTrackUrl() {
        return this.url;
    }
}

class Queue {
    constructor() {
        this.tracks = [];
        this.currentTrack = null;
        this.currentTrackIndex = 0;
    }

    addTrack(track) {
        this.tracks.push(track);
        if(this.currentTrack === null) {
            this.currentTrack = track;
            this.currentTrackIndex = 0;
        }
    }

    addTracks(tracks) {
        this.tracks = tracks;
        if(this.currentTrack === null) {
            this.currentTrack = tracks[0];
            this.currentTrackIndex = 0;
        }
    }

    removeTrack(index) {
        this.tracks.splice(index, 1);
    }

    getTrackList() {
        return this.tracks;
    }

    getTrack(index) {
        return this.tracks[index];
    }

    getTrackById(id) {
        const t = this.tracks.find(track => {
            return track.id === id;
        });

        return t;
    }

    setCurrentTrack(index) {
        this.currentTrack = this.tracks[index];
        this.currentTrackIndex = index;
    }

    getCurrentTrack() {
        return this.currentTrack;
    }

    getTrackCount() {
        return this.tracks.length;
    }

    getNextTrack() {
        let t = null;
        if(this.currentTrack === undefined) {
            t = this.tracks[0];
            this.currentTrackIndex = 0;
        } else if(this.currentTrackIndex >= 0){
            if(this.currentTrackIndex < this.tracks.length - 1) {
                t = this.tracks[this.currentTrackIndex + 1];
                this.currentTrackIndex++;
            } else {
                t = this.tracks[0];
                this.currentTrackIndex = 0;
            }
        } else {
            t = this.tracks[0];
            this.currentTrackIndex = 0;
        }

        return t;
    }

    getPreviousTrack() {
        let t = null;
        if(this.currentTrack === undefined) {
            t = this.tracks[0];
            currentTrackIndex = 0;
        } else if(this.currentTrackIndex >= 0){
            if(this.currentTrackIndex > 0) {
                t = this.tracks[this.currentTrackIndex - 1];
                this.currentTrackIndex--;
            } else {
                t = this.tracks[this.tracks.length - 1];
                this.currentTrackIndex = this.tracks.length - 1;
            }
        } else {
            t = this.tracks[0];
            this.currentTrackIndex = 0;
        }

        return t;   
    }

    switchToNextTrack() {
        this.currentTrack = this.getNextTrack();
    }

    switchToPreviousTrack() {
        this.currentTrack = this.getPreviousTrack();
    }

    clearQueue() {
        this.tracks = [];
    }

    jumpToTrack(index) {
        this.currentTrack = this.tracks[index];
        this.currentTrackIndex = index;
    }

    getCurentTrackId() {
        return this.currentTrack.id;
    }

    getCurrentTrackIndex() {
        return this.currentTrackIndex;
    }
}

class Player extends Queue {
    constructor() {
        super();
        this.shuffle = false;

        this.audio = new Audio();
        this.audio.addEventListener('ended', () => {
            this.next();
        });

      
    }

    onTimeUpdate(callback) {
        this.audio.addEventListener('timeupdate', callback);
    }

    onNext(callback) {
        this.audio.addEventListener('ended', callback);
    }

    formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    }

    playTrack(track) {
        this.clearQueue();
        this.addTrack(track);
        this.currentTrack = track;
        this.play();
    }

    play() {
        if(!this.currentTrack) {
            this.next();
            return;
        }
        try {
            this.audio.src = this.currentTrack.url;
            this.audio.play();
        } catch (error) {
            console.error(error);
        }
    }

    pause() {
        this.audio.pause();
    }

    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
    }

    next() {
        this.switchToNextTrack();
        this.play();
    }

    prev() {
        this.switchToPreviousTrack();
        this.play();
    }

    isPaused() {
        return this.audio.paused;
    }

    isPlaying() {
        return !this.audio.paused;
    }

    setVolume(volume) {
        this.audio.volume = volume;
    }

    getVolume() {
        return this.audio.volume;
    }

    getDuration() {
        return this.audio.duration;
    }

    seek(time) {
        this.audio.currentTime = time;
    }

    seekToPercentage(percentage) {
        const time = (percentage / 100) * this.audio.duration;
        this.seek(time);
    }

    toggleShuffle() {
        this.shuffle = !this.shuffle;
        if(this.shuffle) {
            this.tracks = this.tracks.sort(() => Math.random() - 0.5);
        } else {
            this.tracks = this.tracks.sort((a, b) => a.id - b.id);
        }
    }

    shuffleQueue() {
        this.tracks = this.tracks.sort(() => Math.random() - 0.5);
    }
}


export { Track, Queue, Player, Artist};
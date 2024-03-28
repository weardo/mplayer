import { Player, Track, Artist } from './player.js';
const player = new Player();
const tracks = [];
const artists = [];
const genres = [];
const currentTracks = [];
// latest 10 tracks by year
const latestTracks = [];
const latestEnglishTracks = [];
const latestHindiTracks = [];
let recentTrackIds = [];

let trackContextId = null;
let currentArtistId = null;
const trackMenu = document.getElementById('track-menu');
const playNow = document.getElementById('ctl-play-now');
const addToQueue = document.getElementById('ctl-add-queue');
const addToFav = document.getElementById('ctl-add-fav');

// on click of .player show sidebar
const sidebar = document.getElementById('sidebar');
const playerContainer = document.getElementById('player');
const ctlPlaylist = document.getElementById('ctl-playlist');


// on click of #ctl-next, play next track
const ctlNext = document.getElementById('ctl-next');

// on click of #ctl-prev, play previous track
const ctlPrev = document.getElementById('ctl-prev');

// on click of #ctl-play-pause, play or pause track
const ctlPlayPause = document.getElementById('ctl-play-pause');

// on click of #ctl-shuffle, toggle shuffle
const ctlShuffle = document.getElementById('ctl-shuffle');
const seekBar = document.getElementById('seekbar');
const volumeBar = document.getElementById('ctl-volume');

const currentPlaylistMenuToggle = document.getElementById('current-playlist-menu-toggle');
const currentPlaylistMenu = document.getElementById('current-playlist-menu');

const home = document.getElementById('home');
const playlist = document.getElementById('playlist');
const currentPlaylist = document.getElementById('current-playlist');
const recommendationLists = document.getElementById('recommendation-lists');
const logo = document.getElementById('logo');
const backBtn = document.getElementById('back-btn');

// Purpose: Main entry point for the application


async function fileExists(url) {
    return fetch(url)
        .then(response => {
            if(response.status === 200) {
                return true;
            }
            return false;
        })
        .catch(() => {
            return false;
        });

}

async function loadTracks() {
    const response = await fetch('data.json');
    const data = await response.json();

    for(let i=0; i<data.tracks.length; i++) {
        const track = data.tracks[i];
        const exists = await fileExists(`./assets/tracks/${track.url}`);
        if(exists) {
            tracks.push(new Track(
                track.id,
                track.name,
                track.artist,
                getArtistId(track.artist),
                track.album,
                track.year,
                track.genre,
                track.duration,
                `./assets/tracks/${track.url}`,
                track.date,
                Math.random() > 0.5
            ));
        }
    }

    return Promise.resolve();
}

function organizeTracks() {

    // sort tracks by year and get latest 10
    latestTracks.push(...tracks.sort(() => 0.5 - Math.random()).slice(0, 10));

    // add random 10 tracks to latestEnglishTracks and latestHindiTracks
    latestEnglishTracks.push(...tracks.sort(() => 0.5 - Math.random()).slice(0, 10));
    latestHindiTracks.push(...tracks.sort(() => 0.5 - Math.random()).slice(0, 10));

    // add current tracks to player
    currentTracks.push(...tracks.sort(() => 0.5 - Math.random()).slice(0, 10));
    player.addTracks(currentTracks);

    // find unique artists and store by count of tracks
    const uniqueArtists = [...new Set(tracks.map(track => track.artist))];
    uniqueArtists.forEach((artist) => {
        const artistTracks = tracks.filter(track => track.artist === artist);
        artists.push(new Artist(getArtistId(artist), artist, artistTracks.length ));
    });

    // find unique genres
    const uniqueGenres = [...new Set(tracks.map(track => track.genre))];
    uniqueGenres.forEach((genre) => {
        genres.push(genre);
    });
}

// load track list from data.json file and call render, renderOnce
loadTracks().then(() => {
    organizeTracks();
    renderOnce();
    render();   
});

function getParentElementWithPlayingClass(target) {
    if(target.classList.contains('playing')) {
        return target;
    }
    return getParentElementWithPlayingClass(target.parentElement);
}

function hideSearchResults() {
    const searchResultsContainer = document.getElementById('search__results');
    searchResultsContainer.classList.add('hidden');
}

function addToRecentTracks(trackId) {
    recentTrackIds = [trackId, ...recentTrackIds.filter(id => id !== trackId)].slice(0, 10);
}

function addToFavorites(trackId) {
    for(let i=0; i<player.tracks.length; i++) {
        if(player.tracks[i].id === trackId) {
            player.tracks[i].isLiked = !player.tracks[i].isLiked;
            render();
            return;
        }
    }
}

function playCollection(collection) {
    const tracks = getTracksByGenre(collection);
    player.addTracks(tracks);
    player.shuffleQueue();
    player.jumpToTrack(0);
    player.play();
    addToRecentTracks(player.getCurrentTrack().id);
    render();
}

function getTrackById(id) {
    const t = tracks.find(track => {
        return track.id === parseInt(id);
    });

    return t;
}

function getTracksByGenre(genre) {
    return tracks.filter(track => track.genre === genre);
}

function getArtistId(artist) {
    return artist.toLowerCase().replace(' ', '-');
}

function getArtistTracks(artistId) {
    return tracks.filter(track => track.artistId === artistId);
}

function getSimilarArtistTracks(artistid) {
    // select random 5 tracks
    return tracks.filter(track => track.artistId !== artistid).sort(() => 0.5 - Math.random()).slice(0, 5);
}


function playArtist(artistId) {
    const artistTracks = tracks.filter(track => track.artistId === artistId);
    player.addTracks(artistTracks);
    player.jumpToTrack(0);
    player.play();
    addToRecentTracks(player.getCurrentTrack().id);
    render();
}





function scrollToTop() {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
}


function popularArtistsItemHtml(artist) {
    let html = `<div class="popular-artists__item">
                    <div class="popular-artists__item__img round playable relative">
                        <img class="popular-artists__item__img" src="https://picsum.photos/200/200?random=${artist.id}" alt="" >
                        <div class="play-btn-visual"  data-artistid=${artist.id}><i class="fas fa-play"  data-artistid=${artist.id} ></i></div>
                    </div>
                    <div class="popular-artists__item__name"  data-artistid=${artist.id}>${artist.name}</div>                    
                </div>`
    return html;
}

function latestLanguageItemHtml(track) {
    let html = `<div class="latest__item">
                    <div class="playable">
                        <img class="latest__item__img" src="https://picsum.photos/200/200?random=${track.id}" alt="">
                        ${getPlayPauseButtonHtmlByTrack(track)}
                    </div>
                    <div class="latest__item__info">
                        <div class="latest__item__title" data-trackid=${track.id}>${track.name}</div>
                        <div class="latest__item__date meta">${track.date}</div>
                    </div>
                </div>`;
    return html;
}


function currentPlaylistItemHtml (track, index, currentIndex) {
    let html = `<div class="track playable ${index === currentIndex && player.isPlaying() ? 'playing' : ''}" data-index=${index}>
                    <div class="track__id meta" data-index=${index}>
                        <span class="track__id__num">${track.id}</span>
                        <i class="fas fa-play track__id__play"  data-index=${index}></i>
                    </div>
                    <div class="track__cover" >
                        <img src="https://picsum.photos/200/200?random=${track.id}" alt=""  data-index=${index}>
                        ${getPlayPauseButtonHtmlByIndex(index)}
                    </div>
                    <div class="track__info">
                        <div class="track__title" data-index=${index}>${track.name}</div>
                        <div class="track__subtext meta">${track.artist}</div>
                    </div>
                    <div class="track__action" data-favid=${track.id}>
                        <i class="far fa-heart ${track.isLiked ? 'fa-solid liked' : ''}"></i>
                    </div>
                </div>`

    return html;
}

const latestReleasesItemHtml = (track) => {
    let html = `<div class="dtrack" data-trackid=${track.id}>
                    <img class="dtrack__cover playable" data-trackid=${track.id} data-artistid="${track.artistId}" src="https://picsum.photos/300/200?random=${track.id}" alt="">
                    <div class="dtrack__action relative">
                        <span id="latest-release-item-menu-toggle-${track.id}" data-trackmenuid=${track.id}><i class="fas fa-ellipsis-h"></i></span>
                    </div>
                    <div class="dtrack__title" data-trackid=${track.id} data-artistid="${track.artistId}">${track.name}</div>
                    <div class="dtrack__date meta" data-trackid=${track.id}>${track.date}</div>
                    <div class="dtrack__duration meta" data-trackid=${track.id}>${track.duration}</div>
                </div>`;
    return html;
}




function artistTrackItemHtml(track) {
    let html = `<div class="track playable ${track.id === player.getCurentTrackId() && player.isPlaying() ? 'playing' : ''}" data-trackid=${track.id}>
                    <div class="track__id meta">
                        <span class="track__id__num">${track.id}</span>
                        <i class="fas fa-play track__id__play"></i>
                    </div>
                    <div class="track__cover relative">
                        <img src="https://picsum.photos/200/200?random=${track.id}" alt="" data-trackid=${track.id}>
                        ${getPlayPauseButtonHtmlByTrack(track)}
                    </div>
                    <div class="track__info">
                        <div class="track__title" data-trackid=${track.id}>${track.name}</div>
                        <div class="track__subtext meta" data-trackid=${track.id}>${track.album}</div>
                    </div>
                    <div class="track__action" data-favid=${track.id}>
                        <i class="far fa-heart ${track.isLiked ? 'fa-solid liked' : ''}" ></i>
                    </div>
                    <div class="track__action" data-addid=${track.id}>
                        <i class="fas fa-plus"></i>
                    </div>
                </div>`
    return html;
}

function collectionItemHtml(collection) {
    let html = `<div class="collections__item">
                    <img class="collections__item__img" src="https://picsum.photos/350/200?random=${collection}" alt="">
                    <div class="collections__item__title" data-collection="${collection}">${collection}</div>
                </div>`;
    return html;
}


const getPlayPauseButtonHtmlByIndex = (index) => {
    if(index === player.getCurrentTrackIndex() && player.isPlaying()){
        return `<div class="pause-btn" data-index=${index}><i class="fa-solid fa-pause"></i></div>`
    }
    return `<div class="play-btn" data-index=${index}><i class="fas fa-play"></i></div>`
}

const getPlayPauseButtonHtmlByTrack = (track) => {
    if(track.id === player.getCurrentTrack()?.id && player.isPlaying()){
        return `<div class="pause-btn"><i class="fa-solid fa-pause"></i></div>`
    } else {
        return `<div class="play-btn" data-trackid=${track.id}><i class="fas fa-play"></i></div>`
    }
}

// on timeupdate, update progress bar and time
player.onTimeUpdate(() => {
    document.getElementById('ctl-progress-time').textContent = player.formatTime(player.audio.currentTime);
    const progress = (player.audio.currentTime / player.audio.duration) * 100;
    document.getElementById('seekbar').value = progress;
    if(player.audio.duration) {
        const ctlDuration = document.getElementById('ctl-duration');
        ctlDuration.textContent = player.formatTime(player.audio.duration)
    }
});

player.onNext(() => {
    render();
});


function showArtist() {
    home.classList.add('hidden');
    currentPlaylist.classList.add('hidden');
    playlist.classList.remove('hidden');
    recommendationLists.classList.remove('hidden');
    logo.classList.add('hidden');
    backBtn.classList.remove('hidden');
    scrollToTop();
}

function hideArtist() {
    home.classList.remove('hidden');
    currentPlaylist.classList.remove('hidden');
    playlist.classList.add('hidden');
    recommendationLists.classList.add('hidden');
    logo.classList.remove('hidden');
    backBtn.classList.add('hidden');
    scrollToTop();
}

function renderOnce() {
    renderLatestReleases();
    renderLatestLanguageTracks(latestEnglishTracks, document.getElementById('latest__content__english'));
    renderLatestLanguageTracks(latestHindiTracks, document.getElementById('latest__content__hindi'));
    renderPopularArtists();
}

function renderPlayer() {
    const trackTitle = document.getElementById('ctl-track-name');
    const trackMeta = document.getElementById('ctl-meta');
    const ctlPlayPause = document.getElementById('ctl-play-pause');

    trackTitle.textContent = player.getCurrentTrack()?.name;
    trackMeta.textContent = player.getCurrentTrack()?.artist;
    ctlPlayPause.innerHTML = `<i class="fa-regular fa-circle-${player.isPlaying() ? 'pause' : 'play'}"></i>`;
}

function renderPopularArtists() {
    const popularArtistsContent = document.getElementById('popular-artists-list');
    artists.forEach((artist) => {
        const html = popularArtistsItemHtml(artist);
        popularArtistsContent.insertAdjacentHTML('beforeend', html);
    });
}

function renderLatestLanguageTracks(tracks, container) {
    tracks.forEach((track) => {
        const html = latestLanguageItemHtml(track);
        container.insertAdjacentHTML('beforeend', html);
    });
}

function renderSimilarArtistTracks() {
    const similarTracks = getSimilarArtistTracks(currentArtistId);
    let html = '';
    similarTracks.forEach((track) => {
        html += latestReleasesItemHtml(track);
    });

    const similarTracksContainer = document.getElementById('similar-artists');
    similarTracksContainer.innerHTML = html;
}

function getRecentTracks() {
    return recentTrackIds.map(id => getTrackById(id));
}

const searchInput = document.getElementById('search');

function searchTracks(input) {

    if(input.length === 0) {
        return [];
    }

    // search name, artist, album, genre, year
    return tracks.filter(track => {
        return track.name.toLowerCase().includes(input.toLowerCase()) ||
            track.artist.toLowerCase().includes(input.toLowerCase()) ||
            track.album.toLowerCase().includes(input.toLowerCase()) 
    }).slice(0, 5);
}
function searchResultItemHtml(track) {
    let html = `<div class="search__results__item">
                    <div class="search__item__cover playable">
                        <img class="search__item__img" src="https://picsum.photos/50/50?random=${track.id}" alt="">
                        ${getPlayPauseButtonHtmlByTrack(track)}
                    </div>
                    <div class="search__item__info">
                        <div class="search__item__title" data-trackid=${track.id}>${track.name}</div>
                        <div class="search__item__subtext meta">${track.artist}</div>
                    </div>
                </div>`;
    return html;
}

function radioStationItemHtml(station) {
    return `<div class="stations__item"><img data-collection="${station}" class="station__item__img round" src="https://picsum.photos/200/200?random=${station}" alt=""></div>`;
}


function toggleSidebar() {
    sidebar.classList.toggle('hidden');
}



function renderCurrentPlaylist() {
    let html = '';

    const currentIndex = player.getCurrentTrackIndex();

    player.tracks.forEach((track, index) => {
        html += currentPlaylistItemHtml(track, index, currentIndex);
    });
    
    document.getElementById('current-playlist_content').innerHTML = html;
}


function renderLatestReleases() {
    const latestReleasesContent = document.getElementById('latest-releases__content');

    latestTracks.forEach((track) => {
        const html = latestReleasesItemHtml(track);
        latestReleasesContent.insertAdjacentHTML('beforeend', html);
    })

    // create event listener for each menu toggle
    // latestTracks.forEach((track) => {
    //     const latestReleaseItemMenuToggle = document.getElementById(`latest-release-item-menu-toggle-${track.id}`);
    //     const latestReleaseItemMenu = document.getElementById(`latest-release-item-menu-${track.id}`);
    //     latestReleaseItemMenuToggle.addEventListener('click', () => {
    //         // first hide all other menus
    //         latestReleaseItemMenu.classList.toggle('hidden');
    //     });
    // })
}

function renderArtistTracks(artistId) {
    const artistTracks = getArtistTracks(artistId);
    let html = '';
    artistTracks.forEach((track) => {
        html += artistTrackItemHtml(track);
    });
    
    const artistTracksContainer = document.getElementById('artist-tracks');
    artistTracksContainer.innerHTML = html;
}


function renderArtist(artistId) {

    if(!artistId) {
        artistId = currentArtistId;
    } else {
        currentArtistId = artistId;
    }

    const artist = artists.find(artist => artist.id === artistId);
    if(!artist) {
        return;
    }
    artist.tracks = getArtistTracks(artistId);
    const artistName = document.getElementById('artist-name');
    const artistFollowers = document.getElementById('artist-followers');
    const artistMeta = document.getElementById('artist-meta');
    const artistBio = document.getElementById('artist-bio');
    const artistNumbers = document.getElementById('artist-numbers');
    const artistPlay = document.getElementById('artist-play');

    artistName.textContent = artist.name;
    artistFollowers.textContent = `${Math.floor(Math.random() * 1000000)} Followers`;
    artistMeta.textContent = artist.name;
    artistBio.textContent = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`;
    artistNumbers.textContent = `${artist.tracks.length} Tracks | ${Math.floor(Math.random() * 100)} Albums`;
    artistPlay.setAttribute('data-playartist', artist.id);

    renderArtistTracks(artistId);

    showArtist();
}


function renderCollections() {
    const genresContainer = document.getElementById('collections__content');
    genresContainer.innerHTML = '';
    genres.forEach((genre) => {
        const html = collectionItemHtml(genre);
        genresContainer.insertAdjacentHTML('beforeend', html);
    });
}

function renderRecentTracks() {
    const recentTracks = getRecentTracks();
    let html = '';
    recentTracks.forEach((track) => {
        html += latestReleasesItemHtml(track);
    });

    const recentTracksContainer = document.getElementById('recently-played');
    recentTracksContainer.innerHTML = html;
}


function renderRadioStations() {
    const radioStations = genres;
    const radioStationsContainer = document.getElementById('stations__content');
    radioStationsContainer.innerHTML = '';
    radioStationsContainer.insertAdjacentHTML('beforeend', `<img data-collection="Pop" class="stations__logo" src="./assets/images/stations/radio.png" alt="">`);
    radioStations.forEach((station) => {
        const html = radioStationItemHtml(station);
        radioStationsContainer.insertAdjacentHTML('beforeend', html);
    });
}

function renderSearchResults(tracks) {
    const searchResultsContainer = document.getElementById('search__results');
    let html = '';
    tracks.forEach((track) => {
        html += searchResultItemHtml(track);
    });
    searchResultsContainer.innerHTML = html;
    if(tracks.length === 0) {
        searchResultsContainer.classList.add('hidden');
    } else {
        searchResultsContainer.classList.remove('hidden');
    }
}

function render() {
    renderCurrentPlaylist();
    renderArtistTracks(currentArtistId);
    renderCollections();
    renderSimilarArtistTracks();
    renderRecentTracks();
    renderRadioStations();
    renderPlayer();
}


backBtn.addEventListener('click', () => {
    hideArtist();
});

playerContainer.addEventListener('click', function(event) {
    var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    if(width > 768) {
        return;
    }
    // if event class list does contains main-controls__item, return
    if(event.target.classList.contains('main-controls__item')) {
        return;
    }
    toggleSidebar();
});

ctlPlaylist.addEventListener('click', function(event) {
    var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    if(width < 768) {
        return;
    }
    toggleSidebar();
});

searchInput.addEventListener('input', (e) => {
    const searchResults = searchTracks(e.target.value);
    renderSearchResults(searchResults);
});


ctlPlayPause.addEventListener('click', () => {
    if(player.isPlaying()) {
        player.pause();
    } else {
        player.play();
    }
    render();
});


playNow.addEventListener('click', () => {
    const track = getTrackById(trackContextId);
    player.playTrack(track);
    addToRecentTracks(track.id);
    render();
});

addToQueue.addEventListener('click', () => {
    const track = getTrackById(trackContextId);
    player.addTrack(track);
    render();
});

addToFav.addEventListener('click', () => {
    addToFavorites(trackContextId);
});

trackMenu.addEventListener('focusout', () => {
    trackMenu.classList.add('hidden');
});


// on escape hide search__results

document.addEventListener('keydown', function(event){
    if(event.key === 'Escape') {
        hideSearchResults();
    }
});

document.addEventListener("click", function(event){

    // console.log('click', event.target, event.target.classList, event.target.getAttribute('data-trackid'));

    // debugger

    // if class list contains pause-btn, pause player
    if(event.target.classList.contains('pause-btn')) {
        player.pause();
        const playing = getParentElementWithPlayingClass(event.target);
        playing.classList.remove('playing');
        render();
        return;
    }


    // get data-trackid attribute from clicked element
    const trackId = event.target.getAttribute('data-trackid');
    if(trackId) {
        // get track by id
        const track = getTrackById(parseInt(trackId));
        currentArtistId = track.artistId;
        player.playTrack(track);
        addToRecentTracks(track.id);
        // render player
        render();
    }

    // in current playlist, get data-index attribute from clicked element
    const trackIndex = event.target.getAttribute('data-index');
    if(trackIndex) {
        // get track by index
        player.jumpToTrack(parseInt(trackIndex));
        player.play();
        addToRecentTracks(player.getCurrentTrack().id);
        // render player
        render();
    }

    // get data-artistid attribute from clicked element
    const artistId = event.target.getAttribute('data-artistid');
    if(artistId) {
        // render artist
        renderArtist(artistId);
    }

    const playArtistID = event.target.getAttribute('data-playartist');
    if(playArtistID) {
        // render artist
        playArtist(playArtistID);
    }

    const trackMenuId = event.target.getAttribute('data-trackmenuid');
    if(trackMenuId) {
        trackContextId = parseInt(trackMenuId);
        trackMenu.classList.remove('hidden');
        // set position of menu
        trackMenu.style.left = (event.screenX) + 'px'; 
        trackMenu.style.top = (event.screenY-100) + 'px';

    } else {
        trackMenu.classList.add('hidden');
    }

    // if class list contains play-btn, play player
    // if(event.target.classList.contains('play-btn')) {
    //     const trackIndex = event.target.getAttribute('data-index');
    //     player.jumpToTrack(parseInt(trackIndex));
    //     player.play();
    //     render();
    //     return;
    // }

    const favId = event.target.getAttribute('data-favid');
    if(favId) {
        addToFavorites(parseInt(favId));
        return;
    }

    const collection = event.target.getAttribute('data-collection');
    if(collection) {
        playCollection(collection);
        return;
    }

    // hide search results if class list does not contain search__results__item
    if(!event.target.classList.contains('search__results__item')) {
        hideSearchResults();
    }
    
});


ctlNext.addEventListener('click', () => {
    player.next();
    render();
});


ctlPrev.addEventListener('click', () => {
    player.prev();
    render();
});


ctlShuffle.addEventListener('click', () => {
    player.toggleShuffle();
    render();
});

seekBar?.addEventListener('input', (e) => {
    player.seekToPercentage(e.target.value);
});

volumeBar?.addEventListener('input', (e) => {
    player.setVolume(e.target.value / 100);
});

currentPlaylistMenuToggle.addEventListener('click', () => {
    currentPlaylistMenu.classList.toggle('hidden');
});



render();
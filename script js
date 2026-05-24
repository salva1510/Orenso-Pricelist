// Listahan ng mga kanta (Sample Data)
const songs = [
    { id: 0, title: "Sample Song 1", artist: "Artist A", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { id: 1, title: "Sample Song 2", artist: "Artist B", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { id: 2, title: "Sample Song 3", artist: "Artist C", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
];

let currentSongIndex = 0;
let isPlaying = false;

const audio = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const songListContainer = document.getElementById('songList');
const currentTitle = document.getElementById('currentTitle');
const currentArtist = document.getElementById('currentArtist');
const progressBar = document.getElementById('progressBar');
const volumeBar = document.getElementById('volumeBar');

// I-render ang mga kanta sa screen
function loadSongs() {
    songListContainer.innerHTML = "";
    songs.forEach((song, index) => {
        const div = document.createElement('div');
        div.classList.add('song-item');
        div.innerHTML = `
            <div>
                <p><strong>${song.title}</strong></p>
                <p class="artist">${song.artist}</p>
            </div>
            <i class="fa-solid fa-play"></i>
        `;
        div.addEventListener('click', () => selectSong(index));
        songListContainer.appendChild(div);
    });
}

// Pumili ng kanta
function selectSong(index) {
    currentSongIndex = index;
    audio.src = songs[currentSongIndex].url;
    currentTitle.innerText = songs[currentSongIndex].title;
    currentArtist.innerText = songs[currentSongIndex].artist;
    playSong();
}

// Mag-play ng kanta
function playSong() {
    isPlaying = true;
    audio.play();
    playBtn.innerHTML = `<i class="fa-solid fa-circle-pause"></i>`;
}

// Mag-pause ng kanta
function pauseSong() {
    isPlaying = false;
    audio.pause();
    playBtn.innerHTML = `<i class="fa-solid fa-circle-play"></i>`;
}

// Play/Pause Button Logic
playBtn.addEventListener('click', () => {
    if (audio.src === "") {
        selectSong(0); // I-play ang unang kanta kung wala pang napipili
    } else if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
});

// Susunod na kanta
nextBtn.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    selectSong(currentSongIndex);
});

// Nakaraang kanta
prevBtn.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    selectSong(currentSongIndex);
});

// I-update ang Progress Bar habang tumutugtog
audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        progressBar.value = progressPercent;
    }
});

// I-seek ang kanta kapag hiningi ng user sa progress bar
progressBar.addEventListener('input', () => {
    const seekTime = (progressBar.value / 100) * audio.duration;
    audio.currentTime = seekTime;
});

// Volume Control
volumeBar.addEventListener('input', () => {
    audio.volume = volumeBar.value;
});

// Simulan ang app
loadSongs();

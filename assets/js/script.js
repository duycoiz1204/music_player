/**
 * 1. Render songs
 * 2. Scroll top
 * 3. Play, pause, seek
 * 4. CD rotate
 * 5. Next / prev song
 * 6. Random
 * 7. Next / repeat when ended
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when click
 */
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8-PLAYER';

const player = $('.player');
const cd = $('.cd');
const heading = $('header h2');
const playlist = $('.playlist');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const prevBtn = $('.btn-prev');
const nextBtn = $('.btn-next');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRepeat: false,
    isRandom: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: "Vicetone",
            singer: "Nevada",
            path: "./assets/music/song1.mp3",
            image: "./assets/img/song1.png"
        },
        {
            name: "Summertime",
            singer: "K-391",
            path: "./assets/music/song2.mp3",
            image: "./assets/img/song2.png"
        },
        {
            name: "Fly away",
            singer: "TheFatRat",
            path: "./assets/music/song3.mp3",
            image: "./assets/img/song3.png"
        },
        {
            name: "Reality",
            singer: "Lost Frequencies feat. Janieck Devy",
            path: "./assets/music/song4.mp3",
            image: "./assets/img/song4.png"
        },
        {
            name: "Double Take",
            singer: "dhruv",
            path: "./assets/music/song5.mp3",
            image: "./assets/img/song5.png"
        },
        {
            name: "Under The Influence",
            singer: "Chris Brown",
            path: "./assets/music/song6.mp3",
            image: "./assets/img/song6.png"
        },
        {
            name: "Is There Someone Else",
            singer: "The Weeknd",
            path: "./assets/music/song7.mp3",
            image: "./assets/img/song7.png"
        },
    ],
    loadConfig: function () {
        this.isRepeat = this.config.isRepeat;
        this.isRandom = this.config.isRandom;
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    },
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb"
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `;
        })

        playlist.innerHTML = htmls.join('');
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        })
    },
    handleEvents: function () {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // Handle CD rotate / stop
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause();

        // Handle zooming in/out CD
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        // Handle clicking the play button
        playBtn.onclick = function () {
            if (_this.isPlaying)
                audio.pause();
            else
                audio.play();
        }

        // When the song is playing
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        // When the song is paused
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // Handle the song progress changes
        audio.ontimeupdate = function () {
            if (this.duration) {
                const progressPercent = Math.floor(100 * this.currentTime / this.duration);
                progress.value = progressPercent;
            }
        }

        // Handle rewinding the song
        progress.onchange = function (e) {
            const seekTime = e.target.value * audio.duration / 100;
            audio.currentTime = seekTime;
        }

        // Handle clicking the next song button
        nextBtn.onclick = function () {
            if (_this.isRandom)
                _this.playRandomSong();
            else
                _this.playNextSong();
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // Handle clicking the prev song button
        prevBtn.onclick = function () {
            if (_this.isRandom)
                _this.playRandomSong();
            else
                _this.playPrevSong();
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // Handle turning on/off the repeat song button
        repeatBtn.onclick = function (e) {
            _this.isRepeat = !_this.isRepeat;
            this.classList.toggle('active', _this.isRepeat);
            _this.setConfig('isRepeat', _this.isRepeat);
        }

        // Handle turning on/off the random song button
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom;
            this.classList.toggle('active', _this.isRandom);
            _this.setConfig('isRandom', _this.isRandom);
        }

        // Handle next song when audio ended
        audio.onended = function () {
            if (_this.isRepeat)
                audio.play();
            else
                nextBtn.click();
        }

        // Listen to playlist click behavior
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)');
            if (songNode) {
                if (e.target.closest('.option')) { // Handle clicking option button

                }
                else { // Handle clicking something else
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    audio.play();
                    _this.render();
                }
            }
        }
    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`
        audio.src = this.currentSong.path;
    },
    playNextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length)
            this.currentIndex = 0;
        this.loadCurrentSong();
    },
    playPrevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0)
            this.currentIndex = this.songs.length - 1;
        this.loadCurrentSong();
    },
    playRandomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        }, 300);
    },
    start: function () {
        // Assign configuration to application
        this.loadConfig();

        // Define attributes for object
        this.defineProperties();

        // Listen / process DOM events 
        this.handleEvents();

        // Load the first song information into UI when running the app
        this.loadCurrentSong();

        // Render playlist
        this.render();
    }
}

app.start();
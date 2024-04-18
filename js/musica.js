// -- MUSICA --

const MUSIC_PATH = "music";
const SFX_PATH = "sfx";
const DATA_FILE_PATH = MUSIC_PATH + "/data.json";

const pausePlayBut = $("#mc-main");

var volume = .5;
var muted = false;

class SoundEffectPlayer {
    constructor() {
        this.files = {
            "woosh": "woosh.wav",
            "correct": "correct.mp3",
            "wrong": "wrong.wav"
        };
    }

    init() {
        // Precarrega els arxius per a que no hi hagi latència en la primera reproducció
        for (const [key, path] of Object.entries(this.files)) {
            this.audioPlayer = new Audio(SFX_PATH + "/" + path);
        }

        this.audioPlayer = new Audio();
        this.audioPlayer.volume = volume;
    }

    play(effectName) {
        this.audioPlayer = new Audio(SFX_PATH + "/" + this.files[effectName]);
        this.audioPlayer.volume = volume;
        this.audioPlayer.play();
    }

}

class MusicPlayer {
    constructor(titleElem) {
        this.playing = false;
        this.files = [];
        this.currentFile = null;
        this.index = 0;

        this.audioPlayer = new Audio();
        this.audioPlayer.volume = volume;

        this.currentSongDuration = 0;

        this.titleElem = titleElem;
    }

    init() {

        // Càrrega d'arxius dinàmicament que funciona amb un servidor web
        fetch(DATA_FILE_PATH)
        .then((response) => response.json())
        .then((jsonData) => {
            this.files = jsonData.files;
            this.currentFile = MUSIC_PATH + "/" + this.files[0];
        })
        .catch((error) => {
            console.error("Error while loading music files");

            // Per a que funcioni en arxius locals, per culpa de la politica de CORS
            this.files = ["Diego Torres - Color Esperanza.mp3","Kevin MacLeod - Action Cuts.mp3","Kevin MacLeod - Carefree.mp3","Kevin MacLeod - Heartbreaking.mp3","Kevin MacLeod - Investigations.mp3","Kevin MacLeod - Monkeys Spinning.mp3","Kevin MacLeod - Run Amok.mp3","Kevin MacLeod - Scheming Waseal.mp3","Kevin MacLeod - Sneaky Snitch.mp3","Kevin McLeod - Fluffing a Duck.mp3"];

            this.currentFile = MUSIC_PATH + "/" + this.files[0];
        });
        
    }

    startPlaying() {
        this.playNext(true);
    }

    toggleMusic() {
        if (this.playing) this.pause();
        else this.resume();
    }

    toggleMusicBut(but) {
        this.toggleMusic();
        but.attr("class", this.playing ? "bi bi-pause-circle-fill" : "bi bi-play-circle-fill");
    }

    playNext(keepIndex) {

        if (!keepIndex) this.index++;
        if (this.index > this.files.length - 1) this.index = 0;

        this.currentFile = MUSIC_PATH + "/" + this.files[this.index];

        this.audioPlayer.pause();
        this.playing = false;

        this.currentSongDuration = 0;
        this.audioPlayer = new Audio(this.currentFile);
        this.audioPlayer.volume = volume;
        this.audioPlayer.play();

        this.playing = true;

        this.audioPlayer.addEventListener("canplay", (event) => {
            this.currentSongDuration = this.audioPlayer.duration;
        });

        this.update();
    }

    resume() {
        this.audioPlayer.play();
        this.playing = true;
    }

    pause() {
        this.audioPlayer.pause();
        this.playing = false;
    }

    update() {

        if (!this.playing) return;

        this.titleElem.html(
            this.currentFile
            .split("/")
            .slice(-1)[0]
            .split(".")
            .slice(0, -1)
            .join(".")
        );

        if (this.currentSongDuration != 0 && this.audioPlayer.currentTime >= this.currentSongDuration) {
            this.playNext();
        }
    }

    playPrevious() {
        this.index--;
        if (this.index < 0) this.index = this.files.length - 1;
        this.playNext(true);
        this.update();
    }

}

function setMuted(state, musicPlayer, sfxPlayer) {
    volume = !state ? .5 : 0;
    musicPlayer.audioPlayer.volume = volume;
    sfxPlayer.audioPlayer.volume = volume;

    $("#mc-mute").attr("class", !state ? "bi bi-volume-up-fill" : "bi bi-volume-mute-fill");

    muted = state;
    localStorage.setItem("musicMuted", state);}

$(function() {

    var musicPlayer = new MusicPlayer($("#mc-title"));
    musicPlayer.init();

    var sfxPlayer = new SoundEffectPlayer();
    sfxPlayer.init();

    pausePlayBut.on("click", function() {
        musicPlayer.toggleMusicBut($(this));
    });

    $("#mc-back").on("click", function() {
        musicPlayer.playPrevious();
    });

    $("#mc-forw").on("click", function() {
        musicPlayer.playNext();
    });

    document.addEventListener("gameStart", function() {
        $("#musica").css({"visibility": "visible"});
        musicPlayer.startPlaying();
        setInterval(function() { musicPlayer.update(); }, 500);
    });

    document.addEventListener("playEffect", function(event) {
        sfxPlayer.play(event.detail.name);
    });

    $("#mc-mute").on("click", function() {
        setMuted(!muted, musicPlayer, sfxPlayer);
    });

    let isMuted = JSON.parse(localStorage.getItem("musicMuted"));
    if (isMuted !== null) {
        setMuted(isMuted, musicPlayer, sfxPlayer);
    }
});
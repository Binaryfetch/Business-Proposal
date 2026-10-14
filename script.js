const slides = Array.from(document.querySelectorAll(".slide"));

const progressFill = document.getElementById("progressFill");
const slideCount = document.getElementById("slideCount");
const slideLabel = document.getElementById("slideLabel");

const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const navDots = document.getElementById("navDots");

const musicContinue = document.getElementById("musicContinue");
const musicLock = document.getElementById("musicLock");
const nowPlaying = document.getElementById("nowPlaying");
const playerNote = document.getElementById("playerNote");

let currentSlide = 0;
let player = null;
let playerReady = false;
let selectedSong = "";
let songIsPlaying = false;
let youtubeApiLoaded = false;
let pendingSongId = "";

const songs = {
    "Waalian": {
        id: "vRBcVaDwXSM"
    },

    "Parshawan": {
        id: "JvCKqkYE8Pc"
    },

    "Moonlight": {
        id: "RC_yQ7-rt6Q"
    },

    "Chan Vekhya": {
        id: "PTS0RcUBpe4"
    },

    "Tera Sang Yaara": {
        id: "bJ-UNIO_LJk"
    },

    "Hua Hai Aaj Pehli Baar": {
        id: "9OPwjSF15_o"
    },

    "Kalla Sohna Nai": {
        id: "xZYVjLUJ5PY"
    },

    "Backbone": {
        id: "giKbmzLjasc"
    },

    "Night Ride Magic": {
        id: "crUM8yi16Qw"
    }
};


/* ------------------------------
   SLIDE NAVIGATION
------------------------------ */

function makeDots() {

    navDots.innerHTML = "";

    slides.forEach((slide, index) => {

        const dot = document.createElement("button");

        dot.className =
            "nav-dot" +
            (index === currentSlide ? " active" : "");

        dot.type = "button";

        dot.setAttribute(
            "aria-label",
            `Go to slide ${index + 1}`
        );

        dot.title = slide.dataset.title || `Slide ${index + 1}`;

        dot.addEventListener("click", () => {

            // Music slide must be completed before moving ahead.
            if (
                currentSlide === 1 &&
                index > 1 &&
                !songIsPlaying
            ) {
                updateMusicStatus(
                    "Choose a track and wait for playback to start.",
                    false
                );

                return;
            }

            goToSlide(index);
        });

        navDots.appendChild(dot);

    });

}


function goToSlide(index) {

    if (index < 0 || index >= slides.length) {
        return;
    }

    // Prevent skipping the music slide without starting playback.
    if (
        currentSlide === 1 &&
        index > 1 &&
        !songIsPlaying
    ) {
        updateMusicStatus(
            "Choose a track and start playback before continuing.",
            false
        );

        return;
    }

    currentSlide = index;

    slides.forEach((slide, i) => {

        slide.classList.toggle(
            "active",
            i === currentSlide
        );

        slide.setAttribute(
            "aria-hidden",
            i === currentSlide ? "false" : "true"
        );

    });

    const progress =
        ((currentSlide + 1) / slides.length) * 100;

    progressFill.style.width = `${progress}%`;

    slideCount.textContent =
        `${String(currentSlide + 1).padStart(2, "0")} / ` +
        `${String(slides.length).padStart(2, "0")}`;

    slideLabel.textContent =
        slides[currentSlide].dataset.title || "FutyrX";

    prevButton.disabled = currentSlide === 0;

    nextButton.disabled =
        currentSlide === slides.length - 1 ||
        (currentSlide === 1 && !songIsPlaying);

    if (currentSlide === slides.length - 2) {

        nextButton.innerHTML = 'Finish <span>♡</span>';

    } else {

        nextButton.innerHTML = 'Next <span>→</span>';

    }

    makeDots();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* Next and Back buttons */

document.querySelectorAll("[data-next]").forEach(button => {

    button.addEventListener("click", () => {
        goToSlide(currentSlide + 1);
    });

});


document.querySelectorAll("[data-home]").forEach(button => {

    button.addEventListener("click", event => {

        event.preventDefault();

        goToSlide(0);

    });

});


prevButton.addEventListener("click", () => {

    goToSlide(currentSlide - 1);

});


nextButton.addEventListener("click", () => {

    goToSlide(currentSlide + 1);

});


/* ------------------------------
   MUSIC PLAYER
------------------------------ */

function updateMusicStatus(message, ready) {

    musicLock.textContent = message;

    musicLock.classList.toggle(
        "ready",
        Boolean(ready)
    );

    musicContinue.disabled = !ready;

    nextButton.disabled =
        currentSlide === slides.length - 1 ||
        (currentSlide === 1 && !ready);

}


function selectTrack(name) {

    const song = songs[name];

    if (!song) {
        return;
    }

    selectedSong = name;
    songIsPlaying = false;
    pendingSongId = song.id;

    document.querySelectorAll(".track").forEach(button => {

        const selected =
            button.dataset.song === name;

        button.classList.toggle(
            "selected",
            selected
        );

        button.querySelector(".track-play").textContent =
            selected ? "♫" : "▶";

    });

    nowPlaying.textContent = `Loading: ${name}`;

    playerNote.textContent =
        "Loading your selected track…";

    updateMusicStatus(
        "⏳ Loading your selected song…",
        false
    );

    if (playerReady && player) {

        player.loadVideoById(song.id);

        player.playVideo();

        return;
    }

    if (youtubeApiLoaded) {

        createPlayer(song.id);

        return;
    }

    /*
       The YouTube API script is loaded at the end of index.html.
       If it has not initialized yet, wait for its callback.
    */

    playerNote.textContent =
        "Preparing the YouTube player…";

}


document.querySelectorAll(".track").forEach(button => {

    button.addEventListener("click", () => {

        selectTrack(button.dataset.song);

    });

});


/* Called automatically when the YouTube API loads. */

window.onYouTubeIframeAPIReady = function () {

    youtubeApiLoaded = true;

    if (pendingSongId) {

        createPlayer(pendingSongId);

    }

};


function createPlayer(videoId) {

    if (!window.YT || !window.YT.Player) {
        return;
    }

    if (player) {

        player.loadVideoById(videoId);

        player.playVideo();

        return;
    }

    player = new YT.Player("youtubePlayer", {

        width: "100%",
        height: "100%",

        videoId: videoId,

        playerVars: {
            autoplay: 1,
            playsinline: 1,
            rel: 0,
            origin: window.location.origin
        },

        events: {

            onReady: function (event) {

                playerReady = true;

                event.target.playVideo();

            },


            onStateChange: function (event) {

                // 1 = playing
                if (event.data === YT.PlayerState.PLAYING) {

                    songIsPlaying = true;

                    nowPlaying.textContent =
                        `Now playing: ${selectedSong}`;

                    playerNote.textContent =
                        "Enjoy the track. Continue is ready.";

                    updateMusicStatus(
                        "✓ Song is playing — you can continue.",
                        true
                    );

                }


                // 2 = paused
                if (event.data === YT.PlayerState.PAUSED) {

                    songIsPlaying = false;

                    updateMusicStatus(
                        "Playback paused. Start the song again to continue.",
                        false
                    );

                }


                // 0 = ended
                if (event.data === YT.PlayerState.ENDED) {

                    songIsPlaying = false;

                    updateMusicStatus(
                        "The song has ended. Play it again to continue.",
                        false
                    );

                }


                // 3 = buffering
                if (event.data === YT.PlayerState.BUFFERING) {

                    updateMusicStatus(
                        "⏳ Buffering your selected song…",
                        false
                    );

                }

            },


            onError: function () {

                songIsPlaying = false;

                playerNote.textContent =
                    "This track cannot play in the embedded player. Try another track.";

                updateMusicStatus(
                    "This track could not play here. Try another song.",
                    false
                );

            }

        }

    });

}


/* Continue from the music screen */

musicContinue.addEventListener("click", () => {

    if (songIsPlaying) {
        goToSlide(2);
    }

});


/* ------------------------------
   WHATSAPP RESPONSE BUTTONS
------------------------------ */

document.querySelectorAll("[data-message]").forEach(button => {

    button.addEventListener("click", () => {

        const message = button.dataset.message;

        /*
          India country code + your number.
          WhatsApp format does not use the leading zero or +.
        */

        const phone = "919779567558";

        const url =
            `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

        window.open(
            url,
            "_blank",
            "noopener,noreferrer"
        );

    });

});


/* ------------------------------
   INITIALIZE
------------------------------ */

makeDots();

goToSlide(0);
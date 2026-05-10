/* script.js - robust title screen: hum only, glitches, play transition
   + persistent mute-saving for room pages
*/

(function () {
  window.addEventListener('DOMContentLoaded', () => {
    const stage = document.getElementById('stage');
    const titleEl = document.getElementById('title');
    const subtitleEl = document.getElementById('subtitle');
    const enableBtn = document.getElementById('enableAudio');
    const muteBtn = document.getElementById('toggleMute');
    const playBtn = document.getElementById('playButton');
    playBtn.classList.remove('hidden');

    if (!titleEl || !subtitleEl || !enableBtn || !playBtn) {
      console.error('Missing UI elements. Check index.html IDs.');
      return;
    }

    // Required for glitch layers
    if (!titleEl.getAttribute('data-text')) {
      titleEl.setAttribute('data-text', titleEl.textContent.trim());
    }

    // Restore saved mute state (default: unmuted)
    let isMuted = localStorage.getItem("gameMuted") === "1";

    // Title hum
    const titleAudio = new Audio('sounds/hum.mp3');
    titleAudio.loop = true;
    titleAudio.volume = 0.45;
    titleAudio.muted = isMuted; // apply saved mute state

    function initAudio() {
      titleAudio.play().catch(err => {
        console.warn('Audio blocked:', err);
      });

      enableBtn.classList.add('hidden');
      muteBtn.classList.remove('hidden');
      muteBtn.textContent = isMuted ? 'Unmute' : 'Mute';
    }

    function toggleMute() {
      isMuted = !isMuted;
      titleAudio.muted = isMuted;
      muteBtn.textContent = isMuted ? 'Unmute' : 'Mute';

      // Save state globally for all rooms
      localStorage.setItem("gameMuted", isMuted ? "1" : "0");
    }

function startGame() {
  // Trigger fade-out animation
  document.body.classList.add('fade-out');

  const door = new Audio('sounds/car_door_shut.mp3');
  door.volume = 1;
  door.muted = isMuted;
  door.play().catch(e => console.warn('Door sound blocked', e));

  let hasTransitioned = false;

  function finish() {
    if (hasTransitioned) return;
    hasTransitioned = true;
    document.body.removeEventListener('transitionend', onEnd);
    window.location.href = 'rooms/lore.html';
  }

  function onEnd(e) {
    if (e.propertyName === 'opacity') finish();
  }

  document.body.addEventListener('transitionend', onEnd);

  // Safety fallback in case transitionend never fires
  setTimeout(finish, 2200);
}

    enableBtn.addEventListener('click', () => {
      // If user enables audio, unmute globally
      localStorage.setItem("gameMuted", "0");
      isMuted = false;
      titleAudio.muted = false;

      initAudio();
    });

    muteBtn.addEventListener('click', toggleMute);
    playBtn.addEventListener('click', startGame);

    // Autoplay fallback gesture
    function firstGestureHandler() {
      initAudio();
      window.removeEventListener('click', firstGestureHandler);
      window.removeEventListener('keydown', firstGestureHandler);
    }
    window.addEventListener('click', firstGestureHandler);
    window.addEventListener('keydown', firstGestureHandler);

    // Glitch logic
    function rand(min, max) { return Math.random() * (max - min) + min; }

    function glitchSpike() {
      titleEl.classList.add('glitch-spike');
      subtitleEl.classList.add('flicker');
      setTimeout(() => {
        titleEl.classList.remove('glitch-spike');
        subtitleEl.classList.remove('flicker');
      }, 600);
    }

    function flickerStage() {
      if (!stage) return;
      stage.classList.add('flicker');
      setTimeout(() => stage.classList.remove('flicker'), 520);
    }

    setTimeout(() => {
      setInterval(() => { if (Math.random() < 0.55) glitchSpike(); }, rand(2500, 4000));
      setInterval(() => { if (Math.random() < 0.18) flickerStage(); }, rand(8000, 16000));
    }, 800);
  });
})();

import { DEFAULT_VOLUME } from "../core/constants.js";
import { elements } from "../core/dom.js";
import { audioRuntime } from "../core/state.js";
import { clamp } from "../core/utils.js";
import winSoundUrl from "../../BaDing!.mp3";
import failSoundUrl from "../../DaDoo!.mp3";
import victorySoundUrl from "../../Victory.mp3";
import loserSoundUrl from "../../Loser.mp3";

export const SOUND_SOURCES = {
  win: winSoundUrl,
  fail: failSoundUrl,
  victory: victorySoundUrl,
  loser: loserSoundUrl
};

export const sounds = Object.fromEntries(
  Object.entries(SOUND_SOURCES).map(([type, source]) => [type, createSoundInstance(source)])
);

export function createSoundInstance(source) {
  const audio = new Audio(source);
  audio.preload = "auto";
  audio.volume = DEFAULT_VOLUME;
  audio.playsInline = true;
  return audio;
}

export function resetSoundPlayback(audio) {
  if (!audio) {
    return;
  }
  try {
    audio.pause();
  } catch (error) {}
  try {
    audio.currentTime = 0;
  } catch (error) {}
}

export function recreateSound(type) {
  const source = SOUND_SOURCES[type];
  if (!source) {
    return null;
  }
  const replacement = createSoundInstance(source);
  replacement.volume = clamp(Number(elements.volumeControl.value) || DEFAULT_VOLUME * 100, 0, 100) / 100;
  sounds[type] = replacement;
  return replacement;
}

export function primeAudioPlayback() {
  if (audioRuntime.isPrimed) {
    return;
  }
  audioRuntime.isPrimed = true;

  Object.values(sounds).forEach((audio) => {
    if (!audio) {
      return;
    }

    audio.load();
    const wasMuted = audio.muted;
    audio.muted = true;
    resetSoundPlayback(audio);

    try {
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => {
            resetSoundPlayback(audio);
            audio.muted = wasMuted;
          })
          .catch(() => {
            audio.muted = wasMuted;
          });
        return;
      }
    } catch (error) {}

    audio.muted = wasMuted;
  });
}

export function playSoundWithRecovery(type, fallbackType) {
  primeAudioPlayback();

  function attemptPlay(audio, onFailure) {
    if (!audio) {
      if (typeof onFailure === "function") {
        onFailure();
      }
      return;
    }

    resetSoundPlayback(audio);

    try {
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          if (typeof onFailure === "function") {
            onFailure();
          }
        });
      }
    } catch (error) {
      if (typeof onFailure === "function") {
        onFailure();
      }
    }
  }

  function playFallback() {
    if (!fallbackType || fallbackType === type) {
      return;
    }
    attemptPlay(sounds[fallbackType] || recreateSound(fallbackType));
  }

  let retriedWithFreshAudio = false;
  const sound = sounds[type] || recreateSound(type);
  attemptPlay(sound, function () {
    if (!retriedWithFreshAudio) {
      retriedWithFreshAudio = true;
      attemptPlay(recreateSound(type), playFallback);
      return;
    }
    playFallback();
  });
}

export function playSound(type) {
  if (!type) {
    return;
  }
  playSoundWithRecovery(type);
}

export function initializeAudioUnlockEvents() {
  const unlockAudio = function () {
    primeAudioPlayback();
    document.removeEventListener("pointerdown", unlockAudio, true);
    document.removeEventListener("touchstart", unlockAudio, true);
    document.removeEventListener("keydown", unlockAudio, true);
  };

  document.addEventListener("pointerdown", unlockAudio, { capture: true, passive: true });
  document.addEventListener("touchstart", unlockAudio, { capture: true, passive: true });
  document.addEventListener("keydown", unlockAudio, true);
}

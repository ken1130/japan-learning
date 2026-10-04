// 日文語音：使用瀏覽器內建的 Web Speech API（不需要網路金鑰）
import { getSetting } from './progress.js';

const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
let voice = null;

// 優先挑品質較好的日文語音
const PREFERRED = [/Nanami/i, /Keita/i, /Google/i, /Kyoko/i, /Haruka/i, /Ayumi/i, /Otoya/i];

function pickVoice() {
  if (!synth) return;
  const voices = synth.getVoices().filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith('ja'));
  voice = null;
  for (const re of PREFERRED) {
    voice = voices.find((v) => re.test(v.name));
    if (voice) break;
  }
  voice ||= voices[0] || null;
}

if (synth) {
  pickVoice();
  synth.addEventListener?.('voiceschanged', pickVoice);
}

export function speechSupported() {
  return !!synth;
}

export function voiceName() {
  return voice ? voice.name : null;
}

/** 唸出日文。回傳 Promise，唸完時 resolve。 */
export function speak(text, { rate } = {}) {
  if (!synth || !text) return Promise.resolve();
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ja-JP';
  if (voice) u.voice = voice;
  u.rate = rate ?? getSetting('rate');
  return new Promise((resolve) => {
    u.onend = resolve;
    u.onerror = resolve;
    synth.speak(u);
  });
}

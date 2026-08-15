// State machine: step N is "unlocked" once step N-1 is completed.
// Progress is in-memory only — a reload always restarts from the cover, so the
// surprise opens the same way every time (was persisted to localStorage).
const TOTAL_STEPS = 7; // the notebook step was retired; the ending collage is step 7 now

let state = { step: 1 };

function goToStep(n) {
  // Out of range leaves no .step.active at all — a blank screen, and on the
  // last screen of a one-shot gift that is the final impression. Renumbering
  // the steps by hand is exactly how you get here.
  if (n < 1 || n > TOTAL_STEPS) return;
  state.step = n;
  document.querySelectorAll('.step').forEach(el => {
    el.classList.toggle('active', Number(el.dataset.step) === n);
  });
  renderDots(n);
  onEnterStep(n);
}

function renderDots(n) {
  const dots = document.getElementById('progress-dots');
  dots.innerHTML = Array.from({ length: TOTAL_STEPS }, (_, i) => {
    const step = i + 1;
    const cls = step === n ? 'current' : step < n ? 'done' : '';
    return `<span class="${cls}"></span>`;
  }).join('');
}

function onEnterStep(n) {
  if (n === 2) resetMissionPin();
  if (n === 3) startChat();
  if (n === 4) startQuestions();
  if (n === 5) setTimeout(() => goToStep(6), 2800); // matches .journey-text's fade animation duration
  if (n === 6) renderGallery();
  if (n === 7) renderCollageEnd();
  // renderVoice() is paused along with the step-5-voice markup in index.html — not called in the active flow.
}

// --- Step 2: Mission ---
// pin format: DDMMYY, matched against DATA.metDate
function missionPinAnswer() {
  const { day, month, year } = DATA.metDate;
  const pad = n => String(n).padStart(2, '0');
  return pad(day) + pad(month) + pad(year % 100);
}

function initMissionPin() {
  const digits = Array.from(document.querySelectorAll('#mission-pin .pin-digit'));
  const updateDigitImg = (input) => {
    const img = input.nextElementSibling; // .pin-digit-img, see index.html markup
    if (input.value) {
      img.src = `assets/number/${input.value}.webp`;
      img.style.display = 'block';
    } else {
      img.style.display = 'none';
    }
  };
  digits.forEach((input, i) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '').slice(0, 1);
      updateDigitImg(input);
      document.getElementById('mission-error').hidden = true; // typing again -> hide the "wrong" warning right away
      if (input.value && digits[i + 1]) digits[i + 1].focus({ preventScroll: true });
      if (digits.every(d => d.value)) checkMission(digits); // last digit filled -> auto-check
    });
    input.addEventListener('keydown', (e) => {
      if (e.key !== 'Backspace') return;
      if (input.value) {
        // Clear it ourselves instead of leaving it to the browser's native
        // delete + our 'input' handler rewriting .value right after — on some
        // Android keyboards that combination (delete a char, then a script
        // immediately overwrites .value and steals focus to the next field on
        // every OTHER keystroke) leaves the IME thinking a digit is still
        // committed, and Backspace stops doing anything ("กดลบไม่ได้ตรงเลข").
        // preventDefault so the browser never attempts its own deletion here.
        e.preventDefault();
        input.value = '';
        updateDigitImg(input);
        document.getElementById('mission-error').hidden = true;
      } else if (digits[i - 1]) {
        digits[i - 1].focus({ preventScroll: true });
      }
    });
    // Tapping/tabbing straight into a later empty slot let you type digits
    // out of order, leaving earlier slots blank. Bounce focus back to the
    // first empty slot instead — but only when jumping past it (this only
    // blocks skipping ahead; clicking back into an already-filled slot to
    // fix a typo still works).
    input.addEventListener('focus', () => {
      const firstEmptyIndex = digits.findIndex(d => !d.value);
      if (firstEmptyIndex !== -1 && i > firstEmptyIndex) digits[firstEmptyIndex].focus({ preventScroll: true });
    });
    // If focus leaves the pin group entirely mid-entry — finger slips off the
    // slot, a stray scroll steals it, whatever — treat it the same as a wrong
    // guess: clear + shake, instead of leaving a half-filled pin sitting
    // there. The 0ms timeout lets the *next* focus land first, so tabbing/
    // auto-advancing between slots (still inside the group) doesn't trip this.
    input.addEventListener('blur', () => {
      setTimeout(() => {
        const stillInGroup = digits.includes(document.activeElement);
        const allFilled = digits.every(d => d.value);
        const startedTyping = digits.some(d => d.value);
        if (!stillInGroup && !allFilled && startedTyping) failMissionPin(digits);
      }, 0);
    });
  });
}

// clears any leftover state (wrong-answer error, shake, filled digits) from
// a previous attempt — called every time Step 2 is (re-)entered so it never
// shows "wrong" before the user has typed anything this time
function resetMissionPin() {
  document.getElementById('mission-error').hidden = true;
  document.getElementById('app').classList.remove('shake');
  document.querySelectorAll('#mission-pin .pin-digit').forEach(d => {
    d.value = '';
    d.nextElementSibling.style.display = 'none';
  });
}

function checkMission(digits) {
  const entered = digits.map(d => d.value).join('');
  if (entered === missionPinAnswer()) {
    document.getElementById('mission-error').hidden = true;
    digits.forEach(d => d.blur()); // drop focus so the 6th digit's image + caret aren't fighting for attention
    const successEl = document.getElementById('mission-success');
    successEl.hidden = false;
    setTimeout(() => { successEl.hidden = true; goToStep(3); }, 1200); // let all 6 digits + "ถูกต้อง" actually be seen before advancing — mission is step 2, hands off to step 3 (chat)
  } else {
    failMissionPin(digits);
  }
}

// Shared "wrong" reaction: shake + clear + re-focus slot 1, with the error
// toast. Used both for a wrong 6-digit guess and for focus abandoning the pin
// group mid-entry (see the blur listener in initMissionPin).
function failMissionPin(digits) {
  const errEl = document.getElementById('mission-error');
  errEl.hidden = false;
  const app = document.getElementById('app'); // shake the whole screen, not just the card — feels more "wrong"
  app.classList.remove('shake');
  void app.offsetWidth; // restart animation
  app.classList.add('shake');
  setTimeout(() => { // keep the wrong digits visible through the shake instead of wiping instantly
    digits.forEach(d => { d.value = ''; d.nextElementSibling.style.display = 'none'; });
    digits[0].focus({ preventScroll: true });
  }, 500);
  setTimeout(() => { errEl.hidden = true; }, 1800); // toast auto-dismisses like a toast should
}

// --- Step 3: Chat ---
// One fixed script. The sender's lines play themselves; the recipient's turns
// are a row of replies to tap, and whichever she taps just becomes her bubble
// — it never changes what comes next (see CONTEXT.md). The last entry in the
// script is hers, and tapping it advances the step.
let chatIndex = 0;
// Bumped on every (re-)entry. The timers below capture it and bail if it has
// moved on, so re-entering the step can't leave an old script still typing
// into the new one.
let chatRun = 0;

function startChat() {
  chatIndex = 0;
  chatRun++;
  document.getElementById('chat-log').innerHTML = '';
  document.getElementById('chat-options').innerHTML = '';
  document.getElementById('chat-typing').hidden = true;
  chatNext();
}

function chatScrollToEnd() {
  const box = document.getElementById('chat-scroll');
  box.scrollTop = box.scrollHeight;
}

function chatBubble(from, text) {
  const el = document.createElement('div');
  el.className = `chat-msg chat-${from}`;
  el.textContent = text;
  document.getElementById('chat-log').appendChild(el);
  chatScrollToEnd();
}

function chatNext() {
  const line = DATA.chat[chatIndex];
  if (!line) return;
  if (line.from === 'her') { // her turn: hand it over and wait for a tap
    document.getElementById('chat-options').innerHTML = line.options
      .map((o, i) => `<button class="chat-option" data-action="chat-reply" data-index="${i}">${o}</button>`)
      .join('');
    return;
  }
  const run = chatRun;
  const typing = document.getElementById('chat-typing');
  typing.hidden = false;
  chatScrollToEnd();
  setTimeout(() => {
    if (run !== chatRun) return;
    typing.hidden = true;
    chatBubble('me', line.text);
    chatIndex++;
    setTimeout(() => { if (run === chatRun) chatNext(); }, 380);
  }, 900);
}

function chatReply(btn) {
  const line = DATA.chat[chatIndex];
  const wasLast = chatIndex === DATA.chat.length - 1;
  document.getElementById('chat-options').innerHTML = '';
  chatBubble('her', line.options[Number(btn.dataset.index)]);
  chatIndex++;
  const run = chatRun;
  setTimeout(() => {
    if (run !== chatRun) return;
    if (wasLast) goToStep(4); // the last reply is the way out — no separate button; chat is step 3, hands off straight into step 4 (quiz)
    else chatNext();
  }, wasLast ? 700 : 500);
}

// --- Step 6: Questions ---
// No fail state by design (see CONTEXT.md's mini-game decision) — any option
// advances. It's a keepsake, not a test.
let questionIndex = 0;
let questionScore = 0;

function startQuestions() {
  questionIndex = 0;
  questionScore = 0;
  renderQuestion();
}

function renderQuestion() {
  const q = DATA.quiz[questionIndex];
  if (!q) { renderQuestionResult(); return; } // out of questions -> score summary
  document.getElementById('question-progress').textContent = `ข้อ ${questionIndex + 1} จาก ${DATA.quiz.length}`;
  document.getElementById('question-text').classList.remove('q-result');
  document.getElementById('question-text').textContent = q.question;
  document.getElementById('question-options').innerHTML = q.options
    .map((opt, i) => `<button class="quiz-option" data-action="answer-question" data-index="${i}">${opt}</button>`)
    .join('');
}

function answerQuestion(btn) {
  if (Number(btn.dataset.index) === DATA.quiz[questionIndex].correctIndex) questionScore++;
  btn.classList.add('chosen'); // brief highlight so the tap registers visually
  setTimeout(() => { questionIndex++; renderQuestion(); }, 450);
}

// Praise is warm regardless of score — this is a keepsake, not a test, so even
// a perfect miss gets an affectionate line rather than a "you failed".
function questionPraise(score, total) {
  if (score === total) return 'จำได้ทุกอย่างเลย เก่งมากก <span class="icon-heart"></span>';
  if (score >= total / 2) return 'จำได้เยอะเลยนะเนี่ย น่ารักจัง';
  return 'ไม่เป็นไรน้า เดี๋ยวเราเล่าให้ฟังใหม่ทั้งหมดเลย';
}

function renderQuestionResult() {
  const total = DATA.quiz.length;
  document.getElementById('question-progress').textContent = 'สรุปผล';
  document.getElementById('question-text').classList.add('q-result');
  document.getElementById('question-text').textContent = `ตอบถูก ${questionScore} จาก ${total} ข้อ`;
  document.getElementById('question-options').innerHTML =
    `<p class="quiz-praise">${questionPraise(questionScore, total)}</p>
     <button class="btn-primary" data-action="next">ไปต่อ</button>`;
}

// --- Step 5: Gallery ---
let galleryRevealedCount = 0;
let galleryModalOpened = false; // gates the "ไปต่อ" button — must open+close the modal once

function galleryPhotoList() {
  // real photos once filled in, DATA.photos.length placeholders until then
  return DATA.photos.length ? DATA.photos : Array.from({ length: 4 }, () => null);
}

function renderGallery() {
  document.getElementById('relationship-label').textContent = DATA.relationshipLabel;
  document.getElementById('photo-stack').innerHTML = '';
  galleryRevealedCount = 0;
  galleryModalOpened = false;
  document.getElementById('camera-trigger').disabled = false; // re-arm each time the step is (re-)entered
  document.getElementById('gallery-continue').hidden = true;
}

// Shutter sound.
//
// Two things make bare .play() unreliable here:
//  1. Autoplay policy. An Audio element built at load time stays blocked until
//     it has played once inside a real user gesture. Entering deep (?page=5)
//     skips the cover tap, so nothing has unlocked it yet.
//  2. Re-playing one element. Setting currentTime=0 and calling play() again
//     while it's still playing rejects the previous promise (AbortError), and
//     the tap goes silent — that's the intermittent "sometimes no sound".
//
// So: unlock on the first gesture anywhere, and play a clone per tap so taps
// never interrupt each other.
const shutterSound = new Audio('assets/sounds/shutter.wav');
shutterSound.preload = 'auto';

function unlockShutter() {
  // play-then-immediately-pause inside a genuine gesture is the standard way to
  // take an audio element off the blocked list; it's inaudible.
  shutterSound.play().then(() => {
    shutterSound.pause();
    shutterSound.currentTime = 0;
  }).catch(() => {});
}
// A tap is the gesture that lets audio play — use it for both the shutter and
// the background music, so the song starts on whatever step the visitor
// happens to land on.
// NOT { once: true }: if the very first tap lands before basics.json has
// loaded, DATA.song isn't there yet and the music can't start. Retrying later
// from DATA_READY.then() doesn't work either — by then we're outside the
// gesture, and iOS only allows playback started synchronously inside one. So
// keep listening and try again on the NEXT tap, which is a fresh gesture, and
// only unhook once the music has actually started.
function onFirstGestures() {
  unlockShutter();
  unlockSwap();
  if (startBgMusic()) document.removeEventListener('pointerdown', onFirstGestures);
}
document.addEventListener('pointerdown', onFirstGestures);

function playShutter() {
  const s = shutterSound.cloneNode(); // already cached, so no extra request
  s.play().catch(() => {}); // never let a blocked sound break the reveal
}

// Polaroid swap sound — same clone-per-tap pattern as the shutter, so rapid
// taps through the pile never cut each other off.
const swapSound = new Audio('assets/sounds/swap_image.mp3');
swapSound.preload = 'auto';
function unlockSwap() {
  swapSound.play().then(() => {
    swapSound.pause();
    swapSound.currentTime = 0;
  }).catch(() => {});
}
function playSwap() {
  const s = swapSound.cloneNode();
  s.play().catch(() => {});
}

// tap the camera -> exactly one photo streams out of its bottom slot and
// lands on the pile, tilted, staying a bit blurred (not a focus-pull).
// Tap the pile itself (data-action="next" on #photo-stack) to move on.
function revealNextPhoto() {
  const photos = galleryPhotoList();
  if (galleryRevealedCount >= photos.length) return; // nothing left to eject
  const trigger = document.getElementById('camera-trigger');
  const stack = document.getElementById('photo-stack');
  const flash = document.getElementById('camera-flash');
  flash.classList.remove('fire');
  void flash.offsetWidth; // restart the animation if tapped again quickly
  flash.classList.add('fire');
  playShutter();
  const photo = photos[galleryRevealedCount];
  const slot = document.createElement('div');
  slot.className = 'photo-slot';
  slot.style.zIndex = galleryRevealedCount + 1;
  slot.innerHTML = photo
    ? `<div class="photo-inner"><img src="${photo.src}" alt="${photo.caption || ''}"></div>`
    : `<div class="photo-inner"><span class="icon-photo"></span> no image</div>`;
  stack.appendChild(slot);

  // fixed fan-out per photo index (not pure random) so the pile lands in a
  // deliberate messy-but-controlled spread instead of sometimes overlapping
  // dead-on — this is the FINAL resting transform, set as a plain literal
  // string (not CSS custom-property calc()) because transitioning a
  // transform built from var()/calc() didn't reliably animate in this
  // engine — it just jumped straight to the end value instead of
  // interpolating, which is why it looked like an instant "warp" in.
  const FAN = [
    { rot: -10, jx: -14, jy: -4 },
    { rot: 8, jx: 10, jy: 2 },
    { rot: -6, jx: -6, jy: 8 },
    { rot: 12, jx: 12, jy: -6 },
  ];
  const { rot, jx, jy } = FAN[galleryRevealedCount % FAN.length];
  const restTransform = `translate(${jx}px, ${jy}px) rotate(${rot}deg)`;
  // Measure the slot's UNTRANSFORMED box (no inline transform set yet at all)
  // and add jy by hand instead of temporarily applying restTransform to
  // measure it directly — setting a property, reading layout, then changing
  // that same property again turned out to make the browser treat the
  // reading step's value as the transition's baseline, so the real
  // start->rest animation below collapsed to a no-op (instant jump, no
  // visible motion). Rotation doesn't move the center point, so this math
  // is exact without ever touching .style.transform pre-animation.
  // measure the drawn eject slot when it's there, so photos start at the actual
  // opening rather than the button's outer edge
  const cam = (trigger.querySelector('.cam-eject') || trigger).getBoundingClientRect();
  const r = slot.getBoundingClientRect();
  const dx = cam.left + cam.width / 2 - (r.left + r.width / 2); // horizontal offset so the start pose sits at the camera's true center, not the fan spot
  const dy = cam.bottom - (r.top + r.height / 2); // straight vertical drop — reads as flowing straight down out of the camera

  // .photo-slot has an unconditional CSS transition on `transform`, so even
  // this FIRST-EVER assignment (default "none" -> start pose) would itself
  // animate over 1.6s unless suppressed — leaving barely any visible travel
  // left for the real start->rest move that follows right after in the same
  // tick. Force it to jump instantly, then hand control back to the CSS
  // transition for the actual reveal.
  slot.style.transition = 'none';
  slot.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) rotate(0deg)`; // start pose: dead center under the camera, no tilt yet
  void slot.offsetWidth; // commit the instant jump before re-enabling the transition
  slot.style.transition = '';
  slot.style.transform = `translate(${dx.toFixed(1)}px, 0px) rotate(0deg)`; // phase 1: straight down only, x stays locked to camera center — no diagonal drift yet
  slot.classList.add('revealed'); // drives opacity + .photo-inner's scale/blur
  // phase 2: only once it's fully landed does it shift into its messy fan spot + tilt
  slot.addEventListener('transitionend', function tilt(e) {
    if (e.propertyName !== 'transform') return;
    slot.removeEventListener('transitionend', tilt);
    slot.style.transform = restTransform;
  });

  galleryRevealedCount++;
  if (galleryRevealedCount >= photos.length) trigger.disabled = true; // camera's out of film
}

// Tapping the pile (only once the camera's fully emptied) opens a focused
// photo-by-photo viewer instead of advancing the step directly. Front card
// starts as the most-recently-revealed one (same one on top of the pile),
// tapping it sends it to the back and loops.
let modalOrder = []; // card elements, index 0 = front, rest = peeking out behind in order

function openPhotoModal() {
  const photos = galleryPhotoList();
  if (galleryRevealedCount < photos.length) return; // camera not empty yet — pile isn't tappable
  const modal = document.getElementById('photo-modal');
  const stack = document.getElementById('photo-modal-stack');
  stack.innerHTML = '';
  modalOrder = [];
  // last-revealed photo (top of the pile) starts as the front card here too
  for (let i = photos.length - 1; i >= 0; i--) {
    const photo = photos[i];
    const slot = document.createElement('div');
    slot.className = 'photo-slot';
    slot.innerHTML = (photo
      ? `<div class="photo-inner"><img src="${photo.src}" alt="${photo.caption || ''}"></div>`
      : `<div class="photo-inner"><span class="icon-photo"></span> no image</div>`)
      + (photo && photo.caption ? `<p class="photo-caption">${photo.caption}</p>` : '');
    stack.appendChild(slot);
    modalOrder.push(slot);
  }
  applyModalDepths(true); // true = snap to starting positions, no transition
  modal.hidden = false;
  void modal.offsetWidth;
  modal.classList.add('active');
}

// positions every card by its depth in modalOrder — depth 0 (front) is full
// size dead-center, deeper cards are offset down-right and shrunk so their
// edges peek out from behind it. Reordering modalOrder + re-running this is
// what makes tapping the front card read as "sliding to the back": the
// element never moves in the DOM, only its own transform changes, so the
// CSS transition on transform animates it smoothly.
function applyModalDepths(instant) {
  modalOrder.forEach((card, depth) => {
    if (instant) card.style.transition = 'none';
    card.style.zIndex = modalOrder.length - depth;
    // cards behind fan out sideways (alternating left/right) instead of
    // stacking straight down, so tapping the front one reads as "slides
    // off to the side, then tucks in behind" rather than dropping in place
    const dir = depth % 2 === 0 ? 1 : -1;
    card.style.transform = `translate(${dir * depth * 16}px, ${depth * 6}px) rotate(${dir * depth * 4}deg) scale(${(1 - depth * 0.06).toFixed(2)})`;
    card.classList.toggle('front', depth === 0);
    if (instant) { void card.offsetWidth; card.style.transition = ''; }
  });
}

// front card tapped -> cycle it to the back of modalOrder; every card's
// depth shifts by one, so they all animate to their new spot together.
function cyclePhotoModal() {
  if (modalOrder.length < 2) return;
  modalOrder.push(modalOrder.shift());
  applyModalDepths(false);
  playSwap();
}

function closePhotoModal() {
  const modal = document.getElementById('photo-modal');
  modal.classList.remove('active');
  setTimeout(() => { modal.hidden = true; }, 250); // matches .photo-modal's opacity transition
  galleryModalOpened = true;
  document.getElementById('gallery-continue').hidden = false;
}

// --- Background music (plays across the whole site, see DATA.song in data.js) ---
// A self-hosted <audio> loop, same pattern as shutter.wav/swap_image.mp3 below.
// Replaces an earlier YouTube iframe embed: that version hit YouTube's own
// "Error 153" on this video (embedding config, not something on our end) and
// dragged in an ad + iOS's autoplay-in-iframe restrictions on top of that —
// this file already plays fine here, so none of that applies to it.
//
// Browsers block audio autoplay without a user gesture, so this can't run on
// page load — it's wired to the first tap anywhere (see the listener below),
// which covers deep links like ?page=5 that never see the Step 1 tap.
const bgMusic = new Audio('assets/sounds/song.mp3');
bgMusic.preload = 'auto';
bgMusic.loop = true;

function startBgMusic() {
  const embed = document.getElementById('bg-music');
  if (embed.dataset.started) return true; // only start once
  // Step 1 (cover) doesn't wait on DATA_READY, so a fast first tap can land
  // before basics.json (DATA.song) has loaded. Report the miss so the caller
  // keeps its listener attached and tries again on the next tap — see
  // onFirstGestures() above for why a promise-based retry can't work.
  if (!DATA.song) return false;
  embed.dataset.started = '1';
  bgMusic.currentTime = DATA.song.startSeconds || 0;
  bgMusic.volume = (DATA.song.volume ?? 100) / 100;
  bgMusic.play().catch(() => {}); // never let a blocked track break the tap
  return true;
}

// --- Voice (paused) ---
function renderVoice() {
  document.getElementById('voice-from').textContent = DATA.voiceMessage.from
    ? `มีข้อความเสียงจาก${DATA.voiceMessage.from}`
    : 'มีข้อความเสียงถึงคุณ';
  const player = document.getElementById('voice-player');
  if (DATA.voiceMessage.src) player.src = DATA.voiceMessage.src;
}

// --- The notebook (retired) ---
// ponytail: kept, not called — its markup is commented out in index.html. It
// reads #spread-entries/#spread-scroll, so calling it now throws on null. To
// bring the step back: uncomment that section, restore TOTAL_STEPS and the
// onEnterStep dispatch, and renumber the ending collage back to 8. ---
// One entry per milestone: a polaroid on one side, the words on the other,
// alternating sides down the page. Entries fade in as they scroll into the
// box — IntersectionObserver rather than a scroll handler, and each entry is
// unobserved once shown so scrolling back up doesn't replay it.
function renderSpread() {
  const box = document.getElementById('spread-entries');
  box.innerHTML = DATA.timeline.map((t, i) => {
    const photo = DATA.photos[i];
    return `
    <div class="sp-entry">
      <div class="sp-frame sp-polaroid">
        <span class="sp-tape"></span>
        ${photo
          ? `<img class="sp-img" src="${photo.src}" alt="${photo.caption || ''}">`
          : '<img class="sp-img empty" alt="">'}
      </div>
      <div class="sp-words">
        <span class="tl-date">${t.date}</span>
        <p class="tl-title">${t.title}</p>
        ${t.note ? `<p class="tl-note">${t.note}</p>` : ''}
      </div>
    </div>`;
  }).join('');

  const scroller = document.getElementById('spread-scroll');
  scroller.scrollTop = 0; // re-entering the step starts at the top again
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      obs.unobserve(e.target);
    });
  }, { root: scroller, threshold: 0.2 });
  box.querySelectorAll('.sp-entry').forEach(el => io.observe(el));
}

function renderLetter() {
  const { to, body, from } = DATA.letter;
  const lines = [
    to ? `ถึง ${to}` : 'ถึง...',
    '',
    body || '(ข้อความจดหมาย ใส่ทีหลัง)',
    '',
    from ? `- ${from}` : '',
  ];
  const full = lines.join('\n');
  const el = document.getElementById('letter-body');
  el.textContent = '';
  let i = 0;
  clearInterval(el._typeTimer);
  el._typeTimer = setInterval(() => {
    el.textContent = full.slice(0, i);
    i++;
    if (i > full.length) clearInterval(el._typeTimer);
  }, 18);
}

// --- Step 8: Photo Collage — four overlapping tilted prints with the closing
// message written on a ruled note card laid over them. See CONTEXT.md "Step 8
// ending is a Photo Collage". The paper-and-calendar layout it replaced is
// still below. The met date used to be printed here too; it is the answer to
// step 2's pin, so it was already on screen once and did not need repeating. ---
function renderCollageEnd() {
  [1, 2, 3, 4].forEach((i) => fillPhotoSlot(document.getElementById(`pc-img-${i}`), i));
  document.getElementById('pc-message').textContent = DATA.ending.message;
}

// An <img src> that 404s flashes the browser's broken-image icon before any
// onerror fires, so probe first and only set src once we know it resolves —
// same reason renderSpread() leaves its src off entirely when there's no photo.
function fillPhotoSlot(img, i) {
  const probe = new Image();
  probe.onload = () => { img.src = probe.src; };
  probe.onerror = () => { img.classList.add('empty'); };
  probe.src = `assets/photos/${i}.webp`;
}

// --- Step 8, previous layout: photo-booth strip (assets/photos/1-3.webp,
// placeholder box if missing), a calendar circling DATA.metDate, and the
// closing message bottom-right.
// ponytail: kept, not called — its markup in index.html is `hidden` too. Swap
// the onEnterStep(8) call back and drop that `hidden` to restore it. ---
const THAI_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
function renderClosingScrapbook() {
  [1, 2, 3].forEach((i) => fillPhotoSlot(document.getElementById(`pb-img-${i}`), i));
  renderCalendar();
  document.getElementById('pb-message').textContent = DATA.ending.message;
}

// A real month grid with the met-date circled, not just the date on its own.
// metDate.year is Buddhist (2569), so -543 to get the CE year Date() wants.
function renderCalendar() {
  const grid = document.getElementById('pb-cal-grid');
  const { day, month, year } = DATA.metDate || {};
  if (!day || !month || !year) { grid.innerHTML = ''; return; }
  const ce = year - 543;
  document.getElementById('pb-cal-year').textContent = year;
  document.getElementById('pb-cal-month').textContent = THAI_MONTHS[month - 1];

  const cells = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
    .map((d) => `<span class="pb-cal-head">${d}</span>`);
  const firstWeekday = new Date(ce, month - 1, 1).getDay();
  const daysInMonth = new Date(ce, month, 0).getDate(); // day 0 of next month = last of this one
  for (let i = 0; i < firstWeekday; i++) cells.push('<span></span>');
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`<span class="pb-cal-cell${d === day ? ' is-met' : ''}">${d}</span>`);
  }
  grid.innerHTML = cells.join('');
}

// --- background floating shapes (decorative, all steps) ---
// 2026-07-21: swapped the CSS-drawn heart/star icons for the hand-drawn
// stickers in assets/bg/effect-background/. Weighted so the pink ones
// (1, 2, 5) show up less — clashes with the kraft-paper background otherwise.
const BG_STICKERS = [
  { file: 'sticker-5.webp', weight: 1 }, 
  { file: 'sticker-6.webp', weight: 3 }, 
  { file: 'sticker-3.webp', weight: 3 }, 
  { file: 'sticker-7.webp', weight: 2 }, 
  // ponytail: star/sparkle stickers (1-4) removed per request, kept in
  // assets/ unused — re-add to this array if the floating stars come back
];
const BG_STICKER_POOL = BG_STICKERS.flatMap(s => Array(s.weight).fill(s.file));
// three movement styles so it's not just "float straight up" every time
const BG_ANIMS = ['floatUp', 'floatDrift', 'floatWobble'];
function spawnBgHeart(midAir) {
  const h = document.createElement('img');
  h.src = `assets/bg/effect-background/${BG_STICKER_POOL[Math.floor(Math.random() * BG_STICKER_POOL.length)]}`;
  h.className = 'bg-heart';
  h.style.left = `${Math.random() * 100}%`;
  h.style.setProperty('--size', `${1.1 + Math.random() * 1.6}rem`);
  h.style.setProperty('--o', 0.3 + Math.random() * 0.35);
  h.style.setProperty('--sway', `${(Math.random() - 0.5) * 100}px`);
  h.style.setProperty('--anim', BG_ANIMS[Math.floor(Math.random() * BG_ANIMS.length)]);
  const duration = 7 + Math.random() * 5;
  h.style.animationDuration = `${duration}s`;
  // midAir: seed a few on page load already partway through their rise
  // (negative delay), so it doesn't look like an empty sky for the first
  // few seconds — the visitor might tap the envelope right away.
  if (midAir) h.style.animationDelay = `-${Math.random() * duration}s`;
  document.body.appendChild(h);
  h.addEventListener('animationend', () => h.remove());
}
for (let i = 0; i < 4; i++) spawnBgHeart(true); // pre-seed some mid-flight on load
setInterval(spawnBgHeart, 900);

// --- dev bypass: add ?dev to the URL to show a "skip step" button for testing ---
if (new URLSearchParams(location.search).has('dev')) {
  document.body.classList.add('dev-mode');
  const skipBtn = document.createElement('button');
  skipBtn.textContent = 'skip »';
  skipBtn.style.cssText = 'position:fixed;bottom:12px;right:12px;z-index:99;padding:8px 14px;border-radius:999px;border:none;background:#333;color:#fff;opacity:0.7;font-size:0.8rem;cursor:pointer;';
  skipBtn.addEventListener('click', () => goToStep(Math.min(state.step + 1, TOTAL_STEPS)));
  document.body.appendChild(skipBtn);

  const backBtn = document.createElement('button');
  backBtn.textContent = '« back';
  backBtn.style.cssText = 'position:fixed;bottom:12px;left:12px;z-index:99;padding:8px 14px;border-radius:999px;border:none;background:#333;color:#fff;opacity:0.7;font-size:0.8rem;cursor:pointer;';
  backBtn.addEventListener('click', () => goToStep(Math.max(state.step - 1, 1)));
  document.body.appendChild(backBtn);
}

// --- photo modal: close button, backdrop tap, and cycling the front card ---
document.getElementById('photo-modal-close').addEventListener('click', closePhotoModal);
document.getElementById('photo-modal').addEventListener('click', (e) => {
  if (e.target.id === 'photo-modal') closePhotoModal(); // backdrop itself, not a card
});
document.getElementById('photo-modal-stack').addEventListener('click', (e) => {
  if (e.target.closest('.photo-slot.front')) cyclePhotoModal();
});

// --- click delegation for data-action buttons ---
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  // The cover plays its opening first: flap fades in (0.5s), then the letter
  // slides up out of the envelope (2.4s). It then just sits there — tapping
  // the letter paper itself (see .env-letter[data-action="next"]) is what
  // moves on to step 2, not a timer.
  if (action === 'open' && !btn.classList.contains('opening')) {
    btn.classList.add('opening');
  }
  if (action === 'next') {
    // guard: the letter sits inside .cover, which is still "open"-actionable
    // while closed — only advance once the opening animation has run
    if (btn.classList.contains('env-letter') && !btn.closest('.cover').classList.contains('opening')) return;
    goToStep(state.step + 1);
  }
  if (action === 'reveal-photos') revealNextPhoto();
  if (action === 'open-photo-modal') openPhotoModal();
  if (action === 'answer-question') answerQuestion(btn);
  if (action === 'chat-reply') chatReply(btn);
  // one crane per tap of the jar, in order, instead of all flying out at once
  if (action === 'open-jar') {
    btn.classList.add('open');
    const next = btn.querySelector('.wj-crane:not(.popped)');
    if (next) next.classList.add('popped');
  }
  if (action === 'reveal-wish') btn.classList.add('revealed');
});

// --- init ---
// The digit images are only assigned on keypress, so without this the first
// tap of each number waits on a network/disk fetch — that's the "pin slot
// feels laggy while typing". Warm all ten into cache up front.
function preloadDigits() {
  for (let i = 0; i <= 9; i++) new Image().src = `assets/number/${i}.webp`;
}
preloadDigits();
initMissionPin();
// ?page=N jumps straight to step N (testing/sharing a specific step), clamped to valid range.
// The old ?page=7-1 hook is gone with the notebook step it belonged to — it did
// getElementById('spread'), which no longer exists.
const pageParamRaw = new URLSearchParams(location.search).get('page');
const pageParam = Number(pageParamRaw);
const targetStep = pageParam >= 1 && pageParam <= TOTAL_STEPS ? pageParam : 1;
// Step 1 needs no DATA (the cover is static), so show it immediately instead
// of waiting on the user_data/*.json fetches — only a deep link past it needs
// to wait for DATA_READY (see data.js).
if (targetStep === 1) goToStep(1);
else DATA_READY.then(() => goToStep(targetStep));

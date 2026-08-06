// State machine: step N is "unlocked" once step N-1 is completed.
// Progress is in-memory only — a reload always restarts from the cover, so the
// surprise opens the same way every time (was persisted to localStorage).
const TOTAL_STEPS = 6;

let state = { step: 1 };

function goToStep(n) {
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
  if (n === 3) startQuestions();
  if (n === 4) setTimeout(() => goToStep(5), 2800); // matches .journey-text's fade animation duration
  if (n === 5) renderGallery();
  if (n === 6) { renderLetter(); renderEnding(); }
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
      if (input.value && digits[i + 1]) digits[i + 1].focus();
      if (digits.every(d => d.value)) checkMission(digits); // last digit filled -> auto-check
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && digits[i - 1]) digits[i - 1].focus();
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
  const errEl = document.getElementById('mission-error');
  if (entered === missionPinAnswer()) {
    errEl.hidden = true;
    digits.forEach(d => d.blur()); // drop focus so the 6th digit's image + caret aren't fighting for attention
    const successEl = document.getElementById('mission-success');
    successEl.hidden = false;
    setTimeout(() => { successEl.hidden = true; goToStep(3); }, 1200); // let all 6 digits + "ถูกต้อง" actually be seen before advancing
  } else {
    errEl.hidden = false;
    const app = document.getElementById('app'); // shake the whole screen, not just the card — feels more "wrong"
    app.classList.remove('shake');
    void app.offsetWidth; // restart animation
    app.classList.add('shake');
    setTimeout(() => { // keep the wrong digits visible through the shake instead of wiping instantly
      digits.forEach(d => { d.value = ''; d.nextElementSibling.style.display = 'none'; });
      digits[0].focus();
    }, 500);
    setTimeout(() => { errEl.hidden = true; }, 1800); // toast auto-dismisses like a toast should
  }
}

// --- Step 3: Questions ---
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
}

function closePhotoModal() {
  const modal = document.getElementById('photo-modal');
  modal.classList.remove('active');
  setTimeout(() => { modal.hidden = true; }, 250); // matches .photo-modal's opacity transition
  galleryModalOpened = true;
  document.getElementById('gallery-continue').hidden = false;
}

// --- Background music (plays across the whole site, see DATA.song in data.js) ---
// pulls the 11-char video id out of any youtube.com/watch?v= or youtu.be/ link
function youtubeId(url) {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}
// Called from the Step 1 tap (a real user gesture) — browsers block audio
// autoplay without one, so this can't just run on page load.
function startBgMusic() {
  const embed = document.getElementById('bg-music');
  if (embed.dataset.started) return; // only start once
  embed.dataset.started = '1';
  const id = youtubeId(DATA.song.youtubeUrl || '');
  if (!id) return;
  const start = DATA.song.startSeconds || 0;
  // loop=1 + playlist=<same id> is the documented way to loop a single youtube video
  embed.innerHTML = `<iframe width="1" height="1" src="https://www.youtube.com/embed/${id}?start=${start}&autoplay=1&loop=1&playlist=${id}" title="background music" frameborder="0" allow="autoplay; encrypted-media"></iframe>`;
}

// --- Voice (paused) ---
function renderVoice() {
  document.getElementById('voice-from').textContent = DATA.voiceMessage.from
    ? `มีข้อความเสียงจาก${DATA.voiceMessage.from}`
    : 'มีข้อความเสียงถึงคุณ';
  const player = document.getElementById('voice-player');
  if (DATA.voiceMessage.src) player.src = DATA.voiceMessage.src;
}

// --- Step 6: Letter ---
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

// --- Step 6: Ending (shown together with the letter) ---
function renderEnding() {
  document.getElementById('ending-message').textContent = DATA.ending.message;
}

// --- background floating shapes (decorative, all steps) ---
// 2026-07-21: swapped the CSS-drawn heart/star icons for the hand-drawn
// stickers in assets/stickers/effect-background/. Weighted so the pink ones
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
function spawnBgHeart() {
  const h = document.createElement('img');
  h.src = `assets/stickers/effect-background/${BG_STICKER_POOL[Math.floor(Math.random() * BG_STICKER_POOL.length)]}`;
  h.className = 'bg-heart';
  h.style.left = `${Math.random() * 100}%`;
  h.style.setProperty('--size', `${1.1 + Math.random() * 1.6}rem`);
  h.style.setProperty('--o', 0.3 + Math.random() * 0.35);
  h.style.setProperty('--sway', `${(Math.random() - 0.5) * 100}px`);
  h.style.setProperty('--anim', BG_ANIMS[Math.floor(Math.random() * BG_ANIMS.length)]);
  h.style.animationDuration = `${7 + Math.random() * 5}s`;
  document.body.appendChild(h);
  h.addEventListener('animationend', () => h.remove());
}
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
  if (action === 'open') { startBgMusic(); goToStep(2); }
  if (action === 'next') goToStep(state.step + 1);
  if (action === 'reveal-photos') revealNextPhoto();
  if (action === 'open-photo-modal') openPhotoModal();
  if (action === 'answer-question') answerQuestion(btn);
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
// ?page=N jumps straight to step N (testing/sharing a specific step), clamped to valid range
const pageParam = Number(new URLSearchParams(location.search).get('page'));
goToStep(pageParam >= 1 && pageParam <= TOTAL_STEPS ? pageParam : 1);

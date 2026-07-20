// State machine: step N is "unlocked" once step N-1 is completed.
// Persisted to localStorage so a reload resumes instead of restarting.
const STORAGE_KEY = 'lovememo-progress';
const TOTAL_STEPS = 6;

let state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"step":1}');

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function goToStep(n) {
  state.step = n;
  save();
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
  if (n === 4) renderGallery();
  if (n === 5) renderReasons();
  if (n === 6) { renderLetter(); renderEnding(); }
  // renderVoice() is paused along with the step-5-voice markup in index.html — not called in the active flow.
  if (n === TOTAL_STEPS) localStorage.removeItem(STORAGE_KEY); // ponytail: reaching the end resets progress for next visit
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
      img.src = `assets/number/${input.value}.png`;
      img.style.display = 'block';
    } else {
      img.style.display = 'none';
    }
  };
  digits.forEach((input, i) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '').slice(0, 1);
      updateDigitImg(input);
      if (input.value && digits[i + 1]) digits[i + 1].focus();
      // ponytail: no auto-check on the 6th digit — a confirm button will trigger checkMission(digits) later
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && digits[i - 1]) digits[i - 1].focus();
    });
  });
}

function checkMission(digits) {
  const entered = digits.map(d => d.value).join('');
  const errEl = document.getElementById('mission-error');
  if (entered === missionPinAnswer()) {
    errEl.hidden = true;
    goToStep(3);
  } else {
    errEl.hidden = false;
    const card = document.querySelector('#app .step.active .card');
    card.classList.remove('shake');
    void card.offsetWidth; // restart animation
    card.classList.add('shake');
    setTimeout(() => { // keep the wrong digits visible through the shake instead of wiping instantly
      digits.forEach(d => { d.value = ''; d.nextElementSibling.style.display = 'none'; });
      digits[0].focus();
    }, 500);
  }
}

// --- Step 3: Mini Games sequence ---
function startGames() {
  document.getElementById('games-intro').hidden = true;
  document.getElementById('game-quiz').hidden = false;
  runLoveQuiz(() => {
    document.getElementById('game-quiz').hidden = true;
    document.getElementById('game-hunt').hidden = false;
    runHeartHunt(() => goToStep(4));
  });
}

// --- Step 4: Gallery ---
function renderGallery() {
  document.getElementById('relationship-label').textContent = DATA.relationshipLabel;
  const grid = document.getElementById('gallery-grid');
  if (DATA.photos.length === 0) {
    grid.innerHTML = Array.from({ length: 4 })
      .map(() => `<div class="photo-slot"><div class="photo-inner"><span class="icon-photo"></span> no image</div></div>`).join('');
  } else {
    grid.innerHTML = DATA.photos.map(p =>
      `<div class="photo-slot"><div class="photo-inner"><img src="${p.src}" alt="${p.caption || ''}"></div></div>`).join('');
  }
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

// --- Step 5: Reasons I Love You ---
function renderReasons() {
  const grid = document.getElementById('reasons-grid');
  delete grid.dataset.celebrated;
  grid.innerHTML = DATA.reasons.map((r, i) => `
    <div class="reason-card" data-action="flip-reason">
      <div class="reason-inner">
        <div class="reason-face reason-front">${i + 1}</div>
        <div class="reason-face reason-back">${r}</div>
      </div>
    </div>`).join('');
}

function checkReasonsComplete() {
  const cards = document.querySelectorAll('#reasons-grid .reason-card');
  if (![...cards].every(c => c.classList.contains('flipped'))) return;
  const grid = document.getElementById('reasons-grid');
  if (grid.dataset.celebrated) return; // ponytail: fire once per visit to this step
  grid.dataset.celebrated = '1';
  for (let i = 0; i < 16; i++) setTimeout(spawnBgHeart, i * 60);
}

// --- Step 5 (voice, paused) ---
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

function saveMemory(btn) {
  btn.innerHTML = 'Saved <span class="icon-heart"></span>';
  btn.disabled = true;
}

async function shareSite() {
  const shareData = { title: document.title, url: location.href };
  if (navigator.share) {
    try { await navigator.share(shareData); } catch (_) { /* user cancelled, ignore */ }
  } else {
    await navigator.clipboard.writeText(location.href);
    alert('คัดลอกลิงก์แล้ว');
  }
}

// --- background floating shapes (decorative, all steps) ---
// 2026-07-21: swapped the CSS-drawn heart/star icons for the hand-drawn
// star PNG in assets/stickers/effect-background/.
function spawnBgHeart() {
  const h = document.createElement('img');
  h.src = 'assets/stickers/effect-background/sticker-1.png';
  h.className = 'bg-heart';
  h.style.left = `${Math.random() * 100}%`;
  h.style.setProperty('--size', `${1.1 + Math.random() * 1.6}rem`);
  h.style.setProperty('--o', 0.3 + Math.random() * 0.35);
  h.style.setProperty('--sway', `${(Math.random() - 0.5) * 80}px`);
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
}

// --- click delegation for data-action buttons ---
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === 'open') { startBgMusic(); goToStep(2); }
  if (action === 'start-games') startGames();
  if (action === 'next') goToStep(state.step + 1);
  if (action === 'save') saveMemory(btn);
  if (action === 'share') shareSite();
  if (action === 'flip-reason') {
    btn.classList.toggle('flipped');
    checkReasonsComplete();
  }
});

// --- init ---
initMissionPin();
// ?page=N jumps straight to step N (testing/sharing a specific step), clamped to valid range
const pageParam = Number(new URLSearchParams(location.search).get('page'));
const startStep = pageParam >= 1 && pageParam <= TOTAL_STEPS ? pageParam : Math.min(state.step, TOTAL_STEPS);
goToStep(startStep);

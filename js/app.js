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
  if (n === 5) renderSong();
  if (n === 6) { renderLetter(); renderEnding(); }
  // renderVoice() is paused along with the step-6-voice markup in index.html — not called in the active flow.
  if (n === TOTAL_STEPS) localStorage.removeItem(STORAGE_KEY); // ponytail: reaching the end resets progress for next visit
}

// --- Step 2: Mission ---
function fillMissionSelects() {
  const daySel = document.getElementById('mission-day');
  const monthSel = document.getElementById('mission-month');
  const yearSel = document.getElementById('mission-year');
  for (let d = 1; d <= 31; d++) daySel.add(new Option(d, d));
  ['January','February','March','April','May','June','July','August','September','October','November','December']
    .forEach((m, i) => monthSel.add(new Option(m, i + 1)));
  const thisYear = new Date().getFullYear();
  for (let y = thisYear; y >= thisYear - 20; y--) yearSel.add(new Option(y, y));
}

function checkMission() {
  const day = Number(document.getElementById('mission-day').value);
  const month = Number(document.getElementById('mission-month').value);
  const year = Number(document.getElementById('mission-year').value);
  const errEl = document.getElementById('mission-error');
  const { day: d, month: m, year: y } = DATA.metDate;
  if (day === d && month === m && year === y) {
    errEl.hidden = true;
    goToStep(3);
  } else {
    errEl.hidden = false;
    const card = document.querySelector('#app .step.active .card');
    card.classList.remove('shake');
    void card.offsetWidth; // restart animation
    card.classList.add('shake');
  }
}

// --- Step 3: Mini Games sequence ---
function startGames() {
  document.getElementById('games-intro').hidden = true;
  document.getElementById('game-quiz').hidden = false;
  runLoveQuiz(() => {
    document.getElementById('game-quiz').hidden = true;
    document.getElementById('game-memory').hidden = false;
    runMemoryMatch(() => {
      document.getElementById('game-memory').hidden = true;
      document.getElementById('game-hunt').hidden = false;
      runHeartHunt(() => goToStep(4));
    });
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

// --- Step 5: Song ---
function renderSong() {
  document.getElementById('song-title').textContent = DATA.song.title || 'ชื่อเพลง';
  document.getElementById('song-artist').textContent = DATA.song.artist || '';
  const player = document.getElementById('song-player');
  if (DATA.song.src) player.src = DATA.song.src;
  const wave = document.querySelector('.soundwave');
  player.onplay = () => wave.classList.add('playing');
  player.onpause = () => wave.classList.remove('playing');
  player.onended = () => wave.classList.remove('playing');
}

// --- Step 6: Voice ---
function renderVoice() {
  document.getElementById('voice-from').textContent = DATA.voiceMessage.from
    ? `มีข้อความเสียงจาก${DATA.voiceMessage.from}`
    : 'มีข้อความเสียงถึงคุณ';
  const player = document.getElementById('voice-player');
  if (DATA.voiceMessage.src) player.src = DATA.voiceMessage.src;
}

// --- Step 7: Letter ---
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

// --- Step 7: Ending (shown together with the letter) ---
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

// --- background floating shapes (decorative, all steps) — CSS-drawn hearts/stars, no emoji ---
const BG_COLORS = ['#e94d88', '#ff9fc2', '#9b6bea', '#ffc9de', '#f7b267', '#6ec97f', '#5fb8e0'];
function spawnBgHeart() {
  const h = document.createElement('div');
  h.className = `bg-heart ${Math.random() < 0.75 ? 'icon-heart' : 'icon-star'}`;
  h.style.color = BG_COLORS[Math.floor(Math.random() * BG_COLORS.length)];
  h.style.left = `${Math.random() * 100}%`;
  h.style.setProperty('--size', `${0.9 + Math.random() * 1.4}rem`);
  h.style.setProperty('--o', 0.3 + Math.random() * 0.35);
  h.style.setProperty('--sway', `${(Math.random() - 0.5) * 80}px`);
  h.style.animationDuration = `${7 + Math.random() * 5}s`;
  document.body.appendChild(h);
  h.addEventListener('animationend', () => h.remove());
}
setInterval(spawnBgHeart, 900);

// --- dev bypass: add ?dev to the URL to show a "skip step" button for testing ---
if (new URLSearchParams(location.search).has('dev')) {
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
  if (action === 'open') goToStep(2);
  if (action === 'check-mission') checkMission();
  if (action === 'start-games') startGames();
  if (action === 'next') goToStep(state.step + 1);
  if (action === 'save') saveMemory(btn);
  if (action === 'share') shareSite();
});

// --- init ---
fillMissionSelects();
goToStep(Math.min(state.step, TOTAL_STEPS));

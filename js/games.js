// ponytail: 3 tiny game modules, each calls onDone() once completed.
// No fail state anywhere — completion always unlocks the next thing.

function runLoveQuiz(onDone) {
  const body = document.getElementById('quiz-body');
  let i = 0;

  function renderQuestion() {
    if (i >= DATA.quiz.length) { onDone(); return; }
    const q = DATA.quiz[i];
    body.innerHTML = `
      <p class="quiz-question">${q.question || `คำถามที่ ${i + 1}`}</p>
      <div class="quiz-options">
        ${q.options.map((opt, idx) => `<button data-idx="${idx}">${opt || `ตัวเลือก ${idx + 1}`}</button>`).join('')}
      </div>
    `;
    body.querySelectorAll('.quiz-options button').forEach(btn => {
      btn.addEventListener('click', () => {
        body.querySelectorAll('.quiz-options button').forEach(b => b.disabled = true);
        const idx = Number(btn.dataset.idx);
        btn.classList.add(idx === q.correctIndex ? 'correct' : 'wrong');
        setTimeout(() => { i++; renderQuestion(); }, 700);
      });
    });
  }
  renderQuestion();
}

function runMemoryMatch(onDone) {
  const grid = document.getElementById('memory-grid');
  const icons = [...DATA.memoryIcons, ...DATA.memoryIcons]
    .map((icon, idx) => ({ icon, idx }))
    .sort(() => Math.random() - 0.5);

  grid.innerHTML = icons.map(({ icon, idx }) => {
    const [shape, color] = icon;
    const shapeClass = shape === 'heart' ? 'icon-heart' : `match-shape match-${shape}`;
    return `
    <div class="memory-card" data-idx="${idx}">
      <div class="memory-card-inner">
        <div class="memory-face front"><span class="icon-heart"></span></div>
        <div class="memory-face back"><span class="${shapeClass}" style="color:${color}; font-size:1.4rem;"></span></div>
      </div>
    </div>
  `;
  }).join('');

  let flipped = [];
  let matchedCount = 0;
  let busy = false;

  grid.querySelectorAll('.memory-card').forEach((card, pos) => {
    card.addEventListener('click', () => {
      if (busy || card.classList.contains('flipped') || card.classList.contains('matched')) return;
      card.classList.add('flipped');
      flipped.push({ card, icon: icons[pos].icon });

      if (flipped.length === 2) {
        busy = true;
        const [a, b] = flipped;
        if (a.icon === b.icon) {
          a.card.classList.add('matched');
          b.card.classList.add('matched');
          matchedCount++;
          flipped = [];
          busy = false;
          if (matchedCount === DATA.memoryIcons.length) setTimeout(onDone, 500);
        } else {
          setTimeout(() => {
            a.card.classList.remove('flipped');
            b.card.classList.remove('flipped');
            flipped = [];
            busy = false;
          }, 700);
        }
      }
    });
  });
}

function runHeartHunt(onDone) {
  const field = document.getElementById('hunt-field');
  const countEl = document.getElementById('hunt-collected');
  const total = 8;
  document.getElementById('hunt-total').textContent = total;
  field.innerHTML = '';
  let collected = 0;

  for (let i = 0; i < total; i++) {
    const btn = document.createElement('button');
    btn.className = 'hunt-heart';
    btn.innerHTML = '<span class="icon-heart"></span>';
    btn.style.left = `${Math.random() * 88}%`;
    btn.style.top = `${Math.random() * 82}%`;
    btn.style.setProperty('--delay', `${Math.random() * 1.8}s`);
    btn.style.setProperty('--bob-duration', `${1.5 + Math.random() * 1}s`);
    btn.style.setProperty('--tilt', `${(Math.random() - 0.5) * 16}deg`);
    btn.style.setProperty('--enter-delay', `${i * 0.25}s`);
    btn.addEventListener('click', () => {
      if (btn.classList.contains('collected')) return;
      btn.classList.add('collected');
      collected++;
      countEl.textContent = collected;
      if (collected === total) setTimeout(onDone, 500);
    });
    field.appendChild(btn);
  }
}

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

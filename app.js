// ============================================
// 상태
// ============================================
let names = [];      // 현재 참가자 이름 배열
let winner = '';     // 이번 뽑기 당첨자

// ============================================
// 화면 전환
// ============================================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ============================================
// 이름 입력 UI
// ============================================
const nameList  = document.getElementById('nameList');
const drawBtn   = document.getElementById('drawBtn');

function createNameRow(placeholder = '') {
  const row = document.createElement('div');
  row.className = 'name-row';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'name-input';
  input.placeholder = placeholder || '이름 입력';
  input.maxLength = 8;
  input.addEventListener('input', syncNames);

  const del = document.createElement('button');
  del.className = 'del-btn';
  del.textContent = '×';
  del.addEventListener('click', () => {
    row.remove();
    syncNames();
  });

  row.appendChild(input);
  row.appendChild(del);
  nameList.appendChild(row);
  return input;
}

function syncNames() {
  names = [...document.querySelectorAll('.name-input')]
    .map(i => i.value.trim())
    .filter(Boolean);
  drawBtn.disabled = names.length < 2;
}

// 기본 2명
createNameRow('예: 김민준');
createNameRow('예: 이서연');
syncNames();

document.getElementById('addBtn').addEventListener('click', () => {
  const input = createNameRow();
  input.focus();
  syncNames();
});

// ============================================
// 뽑기 애니메이션
// ============================================
const slotName = document.getElementById('slotName');

function runSlotAnimation(finalName, onDone) {
  const totalDuration = 2000; // ms
  const startInterval = 60;
  const endInterval = 260;

  let elapsed = 0;
  let currentInterval = startInterval;

  function step() {
    // 남은 시간에 따라 인터벌 증가 (슬로우다운)
    const progress = elapsed / totalDuration;
    currentInterval = startInterval + (endInterval - startInterval) * Math.pow(progress, 2);

    if (elapsed >= totalDuration) {
      slotName.textContent = finalName;
      slotName.style.transform = 'scale(1.15)';
      setTimeout(() => { slotName.style.transform = 'scale(1)'; }, 150);
      setTimeout(onDone, 400);
      return;
    }

    // 랜덤 이름 표시 (당첨자 포함해 더 자연스럽게)
    const pool = [...names];
    slotName.textContent = pool[Math.floor(Math.random() * pool.length)];

    elapsed += currentInterval;
    setTimeout(step, currentInterval);
  }

  step();
}

// ============================================
// 컨페티
// ============================================
const CONFETTI_COLORS = ['#3182f6','#FF6B6B','#FFD93D','#6BCB77','#FF6FC8','#C77DFF'];

function launchConfetti() {
  const wrap = document.getElementById('confettiWrap');
  wrap.innerHTML = '';
  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    const size = 8 + Math.random() * 8;
    el.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${size}px; height: ${size}px;
      background: ${CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]};
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation-duration: ${1.5 + Math.random() * 1.5}s;
      animation-delay: ${Math.random() * 0.4}s;
    `;
    wrap.appendChild(el);
  }
  setTimeout(() => { wrap.innerHTML = ''; }, 3000);
}

// ============================================
// N빵 계산기
// ============================================
const totalAmountInput = document.getElementById('totalAmount');
const splitCountInput  = document.getElementById('splitCount');
const splitResult      = document.getElementById('splitResult');
const splitAmountEl    = document.getElementById('splitAmount');
const tossBtn          = document.getElementById('tossBtn');

function calcSplit() {
  const total = parseInt(totalAmountInput.value) || 0;
  const count = parseInt(splitCountInput.value) || 0;

  if (total > 0 && count > 0) {
    const perPerson = Math.ceil(total / count);
    splitAmountEl.textContent = perPerson.toLocaleString();
    splitResult.classList.remove('hidden');
    tossBtn.classList.remove('hidden');

    // 토스 송금 딥링크 (금액 자동 세팅)
    tossBtn.onclick = () => {
      window.location.href = `supertoss://send?amount=${perPerson}`;
    };
  } else {
    splitResult.classList.add('hidden');
    tossBtn.classList.add('hidden');
  }
}

totalAmountInput.addEventListener('input', calcSplit);
splitCountInput.addEventListener('input', calcSplit);

// ============================================
// 메인 뽑기 플로우
// ============================================
drawBtn.addEventListener('click', () => {
  syncNames();
  if (names.length < 2) return;

  winner = names[Math.floor(Math.random() * names.length)];

  showScreen('drawScreen');
  runSlotAnimation(winner, () => {
    // 결과 화면 세팅
    document.getElementById('resultName').textContent = winner;

    // N빵 인원 자동 세팅
    splitCountInput.value = names.length;
    totalAmountInput.value = '';
    splitResult.classList.add('hidden');
    tossBtn.classList.add('hidden');

    showScreen('resultScreen');
    launchConfetti();
    navigator.vibrate?.([60, 30, 100]);
  });
});

// 다시 뽑기 (처음으로)
document.getElementById('retryBtn').addEventListener('click', () => {
  // 이름 입력 초기화
  nameList.innerHTML = '';
  createNameRow('예: 김민준');
  createNameRow('예: 이서연');
  syncNames();
  showScreen('inputScreen');
});

// 같은 멤버로 다시
document.getElementById('reshuffleBtn').addEventListener('click', () => {
  winner = names[Math.floor(Math.random() * names.length)];

  showScreen('drawScreen');
  runSlotAnimation(winner, () => {
    document.getElementById('resultName').textContent = winner;
    splitCountInput.value = names.length;
    totalAmountInput.value = '';
    splitResult.classList.add('hidden');
    tossBtn.classList.add('hidden');

    showScreen('resultScreen');
    launchConfetti();
    navigator.vibrate?.([60, 30, 100]);
  });
});

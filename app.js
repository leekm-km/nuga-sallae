// ============================================
// 네비게이션
// ============================================
const SCREENS = ['homeScreen','slotScreen','diceScreen','wheelScreen','splitScreen'];

function showScreen(id) {
  SCREENS.forEach(s => document.getElementById(s).classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// 홈으로 버튼들
document.querySelectorAll('[data-home]').forEach(el =>
  el.addEventListener('click', () => showScreen('homeScreen'))
);
// 메뉴 카드
document.querySelectorAll('.menu-card').forEach(el =>
  el.addEventListener('click', () => {
    const id = el.dataset.goto + 'Screen';
    showScreen(id);
    if (el.dataset.goto === 'slot')  initSlot();
    if (el.dataset.goto === 'wheel') initWheel();
  })
);

// ============================================
// 유머 문구 풀
// ============================================
const FUNNY_PHRASES = [
  '나만 아니면 돼! 🙏',
  '오늘의 제물이 선정됐습니다 🫡',
  '운명은 거스를 수 없어요 😇',
  '다음 생엔 더 잘 살아요 🌟',
  '카드 긁는 소리가 들립니다 💳',
  '지갑이 떨고 있어요... 💸',
  '이것도 다 복이에요 🍀',
];
function randomPhrase() {
  return FUNNY_PHRASES[Math.floor(Math.random() * FUNNY_PHRASES.length)];
}

// ============================================
// 컨페티
// ============================================
const CONFETTI_COLORS = ['#3182f6','#FF6B6B','#FFD93D','#6BCB77','#FF6FC8','#C77DFF','#FF9F43'];
function launchConfetti() {
  const wrap = document.getElementById('confettiWrap');
  wrap.innerHTML = '';
  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    const size = 8 + Math.random() * 8;
    Object.assign(el.style, {
      left: Math.random() * 100 + '%',
      width: size + 'px', height: size + 'px',
      background: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      borderRadius: Math.random() > 0.5 ? '50%' : '2px',
      animationDuration: (1.4 + Math.random() * 1.4) + 's',
      animationDelay: (Math.random() * 0.5) + 's',
    });
    wrap.appendChild(el);
  }
  setTimeout(() => { wrap.innerHTML = ''; }, 3000);
}

// ============================================
// 공통 - 항목 입력 UI 생성
// ============================================
function createItemInput(listEl, placeholder, onSync) {
  const row = document.createElement('div');
  row.className = 'item-row';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'item-input';
  input.placeholder = placeholder;
  input.maxLength = 10;
  input.addEventListener('input', onSync);

  const del = document.createElement('button');
  del.className = 'del-btn';
  del.textContent = '×';
  del.addEventListener('click', () => { row.remove(); onSync(); });

  row.append(input, del);
  listEl.appendChild(row);
  return input;
}

function getItemValues(listEl) {
  return [...listEl.querySelectorAll('.item-input')]
    .map(i => i.value.trim()).filter(Boolean);
}

// ============================================
// 🎰 슬롯머신
// ============================================
const slotItemList  = document.getElementById('slotItemList');
const slotStartBtn  = document.getElementById('slotStartBtn');
const slotInputStage  = document.getElementById('slotInputStage');
const slotResultStage = document.getElementById('slotResultStage');
const slotTrack     = document.getElementById('slotTrack');
const slotWinnerBox = document.getElementById('slotWinnerBox');
const slotWinnerText = document.getElementById('slotWinnerText');

let slotItems = [];

function initSlot() {
  slotItemList.innerHTML = '';
  slotInputStage.classList.remove('hidden');
  slotResultStage.classList.add('hidden');
  slotWinnerBox.classList.add('hidden');
  createItemInput(slotItemList, '예: 김민준', syncSlot);
  createItemInput(slotItemList, '예: 이서연', syncSlot);
  syncSlot();
}

function syncSlot() {
  slotItems = getItemValues(slotItemList);
  slotStartBtn.disabled = slotItems.length < 2;
}

document.getElementById('slotAddBtn').addEventListener('click', () => {
  createItemInput(slotItemList, '이름 또는 항목', syncSlot).focus();
  syncSlot();
});

slotStartBtn.addEventListener('click', () => {
  syncSlot();
  if (slotItems.length < 2) return;
  const winner = slotItems[Math.floor(Math.random() * slotItems.length)];
  slotInputStage.classList.add('hidden');
  slotResultStage.classList.remove('hidden');
  slotWinnerBox.classList.add('hidden');
  runSlotAnimation(winner);
});

document.getElementById('slotRetryBtn').addEventListener('click', () => {
  if (slotItems.length < 2) return;
  const winner = slotItems[Math.floor(Math.random() * slotItems.length)];
  slotWinnerBox.classList.add('hidden');
  runSlotAnimation(winner);
});

function runSlotAnimation(winner) {
  const ITEM_H  = 80;   // 아이템 한 칸 높이 (px)
  const WIN_IDX = 40;   // 당첨자가 배치될 인덱스 (앞에 충분한 아이템)

  // 트랙 배열 구성: 랜덤 아이템 × 39 → 당첨자 → 랜덤 2개 (하단 여백용)
  const pool = [];
  for (let i = 0; i < WIN_IDX; i++)
    pool.push(slotItems[Math.floor(Math.random() * slotItems.length)]);
  pool.push(winner);                                                   // index 40
  for (let i = 0; i < 2; i++)
    pool.push(slotItems[Math.floor(Math.random() * slotItems.length)]);

  // DOM 렌더
  slotTrack.innerHTML = '';
  slotTrack.style.transform = 'translateY(0)';
  pool.forEach(name => {
    const el = document.createElement('div');
    el.className = 'slot-item';
    el.textContent = name;
    slotTrack.appendChild(el);
  });

  // 당첨자(WIN_IDX)가 중앙 슬롯(top=80)에 오는 translateY 계산
  // 중앙 슬롯 top = 80px → winner.top (화면기준) = WIN_IDX*ITEM_H + translateY = 80
  // translateY = 80 - WIN_IDX * ITEM_H
  const finalY = 80 - WIN_IDX * ITEM_H;   // = 80 - 3200 = -3120
  const startY = 0;
  const duration = 3000;
  let startTime = null;

  // ease-out: 빠르게 시작 → 천천히 멈춤
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function frame(ts) {
    if (!startTime) startTime = ts;
    const t = Math.min((ts - startTime) / duration, 1);
    const y = startY + (finalY - startY) * easeOut(t);
    slotTrack.style.transform = `translateY(${y}px)`;

    // 현재 중앙 슬롯에 있는 아이템 강조
    const centerIdx = Math.round((80 - y) / ITEM_H);
    slotTrack.querySelectorAll('.slot-item').forEach((el, i) => {
      el.classList.toggle('active', i === centerIdx);
    });

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      // 완료 → 당첨자 박스 표시
      slotWinnerText.textContent = winner;
      slotWinnerBox.classList.remove('hidden');
      slotWinnerBox.querySelector('.winner-label').textContent = randomPhrase();
      launchConfetti();
      navigator.vibrate?.([60, 30, 100]);
    }
  }

  requestAnimationFrame(frame);
}

// ============================================
// 🎲 주사위
// ============================================
const DIE_DOTS = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9],
};

function renderDieFace(innerEl, value) {
  innerEl.innerHTML = '';
  for (let pos = 1; pos <= 9; pos++) {
    const cell = document.createElement('div');
    cell.style.cssText = 'display:flex;align-items:center;justify-content:center;';
    if (DIE_DOTS[value].includes(pos)) {
      const dot = document.createElement('div');
      dot.className = 'dot';
      cell.appendChild(dot);
    }
    innerEl.appendChild(cell);
  }
}

function rollDice() {
  const die1 = document.getElementById('die1');
  const die2 = document.getElementById('die2');
  const inner1 = document.getElementById('dieInner1');
  const inner2 = document.getElementById('dieInner2');
  const diceSum = document.getElementById('diceSum');
  const rollBtn = document.getElementById('diceRollBtn');

  rollBtn.disabled = true;
  diceSum.textContent = '';
  die1.classList.add('rolling');
  die2.classList.add('rolling');

  const result1 = Math.ceil(Math.random() * 6);
  const result2 = Math.ceil(Math.random() * 6);

  // 굴리는 동안 빠르게 랜덤 숫자 표시
  let shuffleCount = 0;
  const shuffleInterval = setInterval(() => {
    renderDieFace(inner1, Math.ceil(Math.random() * 6));
    renderDieFace(inner2, Math.ceil(Math.random() * 6));
    shuffleCount++;
  }, 80);

  setTimeout(() => {
    clearInterval(shuffleInterval);
    die1.classList.remove('rolling');
    die2.classList.remove('rolling');
    renderDieFace(inner1, result1);
    renderDieFace(inner2, result2);

    const sum = result1 + result2;
    diceSum.textContent = `합계: ${sum}`;
    rollBtn.disabled = false;
    navigator.vibrate?.([40, 20, 40]);
  }, 1200);
}

document.getElementById('diceRollBtn').addEventListener('click', rollDice);

// 초기 주사위 표시
renderDieFace(document.getElementById('dieInner1'), 1);
renderDieFace(document.getElementById('dieInner2'), 1);

// ============================================
// 🎡 돌림판
// ============================================
const wheelItemList  = document.getElementById('wheelItemList');
const wheelGoBtn     = document.getElementById('wheelGoBtn');
const wheelInputStage  = document.getElementById('wheelInputStage');
const wheelSpinStage   = document.getElementById('wheelSpinStage');
const wheelWinnerBox   = document.getElementById('wheelWinnerBox');
const wheelWinnerText  = document.getElementById('wheelWinnerText');
const wheelSpinBtn     = document.getElementById('wheelSpinBtn');
const wheelCanvas      = document.getElementById('wheelCanvas');

let wheelItems = [];
let wheelCurrentAngle = 0;
let wheelSpinning = false;

const WHEEL_COLORS = ['#3182f6','#FF6B6B','#FFD93D','#6BCB77','#FF6FC8','#C77DFF','#FF9F43','#54A0FF'];

function initWheel() {
  wheelItemList.innerHTML = '';
  wheelInputStage.classList.remove('hidden');
  wheelSpinStage.classList.add('hidden');
  wheelWinnerBox.classList.add('hidden');
  wheelCurrentAngle = 0;
  createItemInput(wheelItemList, '예: 짜장면', syncWheel);
  createItemInput(wheelItemList, '예: 짬뽕', syncWheel);
  createItemInput(wheelItemList, '예: 볶음밥', syncWheel);
  syncWheel();
}

function syncWheel() {
  wheelItems = getItemValues(wheelItemList);
  wheelGoBtn.disabled = wheelItems.length < 2;
}

document.getElementById('wheelAddBtn').addEventListener('click', () => {
  createItemInput(wheelItemList, '항목 입력', syncWheel).focus();
  syncWheel();
});

wheelGoBtn.addEventListener('click', () => {
  syncWheel();
  if (wheelItems.length < 2) return;
  wheelInputStage.classList.add('hidden');
  wheelSpinStage.classList.remove('hidden');
  wheelWinnerBox.classList.add('hidden');
  resizeWheelCanvas();
  drawWheel(wheelCurrentAngle);
});

document.getElementById('wheelEditBtn').addEventListener('click', () => {
  wheelInputStage.classList.remove('hidden');
  wheelSpinStage.classList.add('hidden');
});

function resizeWheelCanvas() {
  const size = Math.min(window.innerWidth - 56, 300);
  wheelCanvas.width = size;
  wheelCanvas.height = size;
}

function drawWheel(rotation) {
  const ctx = wheelCanvas.getContext('2d');
  const w = wheelCanvas.width;
  const h = wheelCanvas.height;
  const cx = w / 2, cy = h / 2;
  const r = Math.min(cx, cy) - 6;
  const n = wheelItems.length;
  const arc = (2 * Math.PI) / n;

  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  for (let i = 0; i < n; i++) {
    const startAngle = i * arc - Math.PI / 2;
    const endAngle   = (i + 1) * arc - Math.PI / 2;

    // 부채꼴
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 텍스트
    ctx.save();
    ctx.rotate(startAngle + arc / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${n > 6 ? 11 : 14}px Nunito, sans-serif`;
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 3;
    const label = wheelItems[i].length > 6 ? wheelItems[i].slice(0,6) + '…' : wheelItems[i];
    ctx.fillText(label, r - 10, 5);
    ctx.restore();
  }

  ctx.restore();

  // 중앙 원
  ctx.beginPath();
  ctx.arc(cx, cy, 16, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 6;
  ctx.fill();
  ctx.shadowBlur = 0;
}

wheelSpinBtn.addEventListener('click', () => {
  if (wheelSpinning) return;
  syncWheel();
  if (wheelItems.length < 2) return;

  wheelSpinning = true;
  wheelSpinBtn.disabled = true;
  wheelWinnerBox.classList.add('hidden');

  const winner = Math.floor(Math.random() * wheelItems.length);
  const n = wheelItems.length;
  const arc = (2 * Math.PI) / n;

  // 당첨자 세그먼트가 상단(포인터)에 오도록 최종 각도 계산
  const winnerCenter = (winner + 0.5) * arc; // 상단 기준 시계방향
  const numSpins = 6 + Math.floor(Math.random() * 4);
  const targetAngle = 2 * Math.PI * numSpins - winnerCenter;

  const startAngle = wheelCurrentAngle;
  const totalRotation = targetAngle - (startAngle % (2 * Math.PI));
  const finalAngle = startAngle + totalRotation + 2 * Math.PI * Math.floor(totalRotation < 0 ? 1 : 0);

  const duration = 4500;
  let startTime = null;

  function easeOut(t) { return 1 - Math.pow(1 - t, 4); }

  function frame(ts) {
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = startAngle + (finalAngle - startAngle) * easeOut(progress);

    wheelCurrentAngle = current;
    drawWheel(current);

    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      wheelSpinning = false;
      wheelSpinBtn.disabled = false;
      wheelWinnerText.textContent = wheelItems[winner];
      wheelWinnerBox.classList.remove('hidden');
      wheelWinnerBox.querySelector('.winner-label').textContent = randomPhrase();
      launchConfetti();
      navigator.vibrate?.([60, 30, 100]);
    }
  }

  requestAnimationFrame(frame);
});

// ============================================
// 🧮 N빵
// ============================================
const totalAmountInput = document.getElementById('totalAmount');
const splitCountInput  = document.getElementById('splitCount');
const splitResult      = document.getElementById('splitResult');
const splitAmountEl    = document.getElementById('splitAmount');
const tossBtn          = document.getElementById('tossBtn');

function calcSplit() {
  const total = parseInt(totalAmountInput.value.replace(/,/g, '')) || 0;
  const count = parseInt(splitCountInput.value) || 0;
  if (total > 0 && count > 0) {
    const per = Math.ceil(total / count);
    splitAmountEl.textContent = per.toLocaleString();
    splitResult.classList.remove('hidden');
    tossBtn.classList.remove('hidden');
    tossBtn.onclick = () => { window.location.href = `supertoss://send?amount=${per}`; };
  } else {
    splitResult.classList.add('hidden');
    tossBtn.classList.add('hidden');
  }
}

totalAmountInput.addEventListener('input', calcSplit);
splitCountInput.addEventListener('input', calcSplit);

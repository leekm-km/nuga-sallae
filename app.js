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
    sbLog('nuga-sallae', 'feature_use', { feature: el.dataset.goto });
  })
);

// 앱 진입 시 유저 등록 + 로그
sbInitUser();
sbLog('nuga-sallae', 'app_open');

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
// 🎲 주사위 (3D 큐브)
// ============================================

// 3x3 그리드에서 점 위치 (1=좌상단 ~ 9=우하단)
const DOT_POSITIONS = { 1:[5], 2:[3,7], 3:[1,5,9], 4:[1,3,7,9], 5:[1,3,5,7,9], 6:[1,3,4,6,7,9] };

// 각 면 값이 표시되려면 필요한 큐브 회전 [rx, ry] (도 단위)
// 검증된 수학적 계산값
const FACE_SHOW = { 1:[0,0], 2:[90,0], 3:[0,90], 4:[0,-90], 5:[-90,0], 6:[0,180] };

// 큐브 내 면 배치: val=해당 면의 눈 수
const FACE_PLACEMENTS = [
  { val:1, cls:'die-face-front',  t:'translateZ(45px)' },
  { val:6, cls:'die-face-back',   t:'rotateY(180deg) translateZ(45px)' },
  { val:4, cls:'die-face-right',  t:'rotateY(90deg) translateZ(45px)' },
  { val:3, cls:'die-face-left',   t:'rotateY(-90deg) translateZ(45px)' },
  { val:2, cls:'die-face-top',    t:'rotateX(-90deg) translateZ(45px)' },
  { val:5, cls:'die-face-bottom', t:'rotateX(90deg) translateZ(45px)' },
];

function buildDiceFace(val) {
  const face = document.createElement('div');
  face.className = 'die-face';
  for (let p = 1; p <= 9; p++) {
    const cell = document.createElement('div');
    cell.className = 'die-cell';
    if (DOT_POSITIONS[val].includes(p)) {
      const dot = document.createElement('div');
      dot.className = 'dot';
      cell.appendChild(dot);
    }
    face.appendChild(cell);
  }
  return face;
}

function buildCube(cubeEl) {
  cubeEl.innerHTML = '';
  FACE_PLACEMENTS.forEach(({ val, cls, t }) => {
    const face = buildDiceFace(val);
    face.classList.add(cls);
    face.style.transform = t;
    cubeEl.appendChild(face);
  });
}

const cube1 = document.getElementById('cube1');
const cube2 = document.getElementById('cube2');
buildCube(cube1);
buildCube(cube2);

// 초기 약간 기울어진 자세
cube1.style.transform = 'rotateX(-15deg) rotateY(20deg)';
cube2.style.transform = 'rotateX(-15deg) rotateY(-20deg)';

function animateCube(cubeEl, fromX, fromY, toX, toY, duration) {
  return new Promise(resolve => {
    let t0 = null;
    const ease = t => 1 - Math.pow(1 - t, 4); // 강한 ease-out

    function frame(ts) {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      const e = ease(p);
      cubeEl.style.transform =
        `rotateX(${fromX + (toX - fromX) * e}deg) rotateY(${fromY + (toY - fromY) * e}deg)`;
      p < 1 ? requestAnimationFrame(frame) : resolve();
    }
    requestAnimationFrame(frame);
  });
}

let diceRolling = false;

async function rollDice() {
  if (diceRolling) return;
  diceRolling = true;

  const rollBtn = document.getElementById('diceRollBtn');
  const diceSum = document.getElementById('diceSum');
  rollBtn.disabled = true;
  diceSum.textContent = '';

  const r1 = Math.ceil(Math.random() * 6);
  const r2 = Math.ceil(Math.random() * 6);

  // 랜덤 스핀 수 (X축, Y축 다르게 → 카오틱한 느낌)
  const sx1 = 4 + Math.floor(Math.random() * 3);
  const sy1 = 3 + Math.floor(Math.random() * 4);
  const sx2 = 3 + Math.floor(Math.random() * 4);
  const sy2 = 4 + Math.floor(Math.random() * 3);

  // 시작 각도를 약간 랜덤하게
  const s1x = (Math.random() - 0.5) * 30 - 15;
  const s1y = (Math.random() - 0.5) * 30 + 20;
  const s2x = (Math.random() - 0.5) * 30 - 15;
  const s2y = (Math.random() - 0.5) * 30 - 20;

  // 목표 = 당첨 면 각도 + 풀 스핀
  const [bx1, by1] = FACE_SHOW[r1];
  const [bx2, by2] = FACE_SHOW[r2];
  const tx1 = bx1 + 360 * sx1;
  const ty1 = by1 + 360 * sy1;
  const tx2 = bx2 + 360 * sx2;
  const ty2 = by2 + 360 * sy2;

  // 순간 리셋 (transition 없이)
  cube1.style.transition = cube2.style.transition = 'none';
  cube1.style.transform = `rotateX(${s1x}deg) rotateY(${s1y}deg)`;
  cube2.style.transform = `rotateX(${s2x}deg) rotateY(${s2y}deg)`;
  cube1.getBoundingClientRect(); // force reflow

  const dur = 1800 + Math.random() * 400;
  await Promise.all([
    animateCube(cube1, s1x, s1y, tx1, ty1, dur),
    animateCube(cube2, s2x, s2y, tx2, ty2, dur + (Math.random() - 0.5) * 300),
  ]);

  const sum = r1 + r2;
  const remark = sum === 12 ? ' 🎊 최고!' : sum === 2 ? ' 😬 최소...' : sum >= 10 ? ' 🔥' : '';
  diceSum.textContent = `합계 ${sum}${remark}`;

  navigator.vibrate?.([40, 20, 60]);
  diceRolling = false;
  rollBtn.disabled = false;
}

document.getElementById('diceRollBtn').addEventListener('click', rollDice);

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

    // 텍스트 (선명하게)
    ctx.save();
    ctx.rotate(startAngle + arc / 2);
    ctx.textAlign = 'right';
    const fontSize = n > 7 ? 12 : n > 4 ? 15 : 18;
    ctx.font = `900 ${fontSize}px "Nunito", sans-serif`;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = '#fff';
    const label = wheelItems[i].length > 5 ? wheelItems[i].slice(0,5) + '…' : wheelItems[i];
    ctx.fillText(label, r - 14, fontSize * 0.38);
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

const SIZE = 6;
const BET = 10;
const START_COINS = 1000;
const BOSS_REWARD = 900;
const STAGES = [
  { name: "翠玉史萊姆", hp: 2700, phase: "小怪戰", reward: 0, grants: ["striped-row", "striped-col"], art: "assets/monster-slime.svg" },
  { name: "骸骨劍兵", hp: 3450, phase: "小怪戰", reward: 0, grants: ["striped-row", "striped-col", "bomb"], art: "assets/monster-skeleton.svg" },
  { name: "森林哥布林", hp: 4350, phase: "小怪戰", reward: 0, grants: ["bomb", "striped-row", "striped-col"], art: "assets/monster-goblin.svg" },
  { name: "暗影巫師", hp: 5400, phase: "小怪戰", reward: 0, grants: ["rainbow", "bomb", "striped-row"], art: "assets/monster-mage.svg" },
  { name: "赤焰巨龍", hp: 14700, phase: "BOSS 戰", reward: BOSS_REWARD, grants: ["rainbow", "bomb"], art: "assets/monster-dragon.svg" }
];
const TYPES = ["sword", "fire", "shield", "coin", "rune"];
const DAMAGE = {
  sword: 16,
  fire: 15,
  shield: 12,
  coin: 11,
  rune: 14
};
const TYPE_LABELS = {
  sword: "水",
  fire: "火",
  shield: "木",
  coin: "光",
  rune: "暗"
};
const RARITY_LABELS = {
  common: "COMMON",
  rare: "RARE",
  epic: "EPIC"
};
const AUGMENT_POOL = [
  { id: "coin-30", rarity: "common", name: "冒險小袋", desc: "立即獲得 30 金幣。", effect: { coinNow: 30 } },
  { id: "coin-70", rarity: "rare", name: "閃亮錢袋", desc: "立即獲得 70 金幣。", effect: { coinNow: 70 } },
  { id: "coin-100", rarity: "epic", name: "勇者金庫", desc: "立即獲得 100 金幣。", effect: { coinNow: 100 } },
  { id: "chest-min", rarity: "rare", name: "寶箱保底", desc: "BOSS 寶箱最低獎金 +300。", effect: { chestMin: 300 } },
  { id: "chest-boost", rarity: "epic", name: "鍍金寶箱", desc: "BOSS 寶箱獎金 +15%。", effect: { chestMultiplier: .15 } },
  { id: "all-damage", rarity: "rare", name: "勇者氣勢", desc: "所有符石傷害 +15%。", effect: { allMultiplier: .15 } },
  { id: "water-boost", rarity: "common", name: "水流劍術", desc: "水符石傷害 +50%。", effect: { type: "sword", typeMultiplier: .5 } },
  { id: "fire-boost", rarity: "common", name: "烈火斬擊", desc: "火符石傷害 +50%。", effect: { type: "fire", typeMultiplier: .5 } },
  { id: "wood-boost", rarity: "common", name: "森之祝福", desc: "木符石傷害 +50%。", effect: { type: "shield", typeMultiplier: .5 } },
  { id: "light-boost", rarity: "common", name: "聖光加護", desc: "光符石傷害 +50%。", effect: { type: "coin", typeMultiplier: .5 } },
  { id: "dark-boost", rarity: "common", name: "暗月契約", desc: "暗符石傷害 +50%。", effect: { type: "rune", typeMultiplier: .5 } },
  { id: "combo-3", rarity: "common", name: "連擊節奏", desc: "COMBO 達到 3 以上，額外 +120 傷害。", effect: { comboMin: 3, flatDamage: 120 } },
  { id: "combo-5", rarity: "rare", name: "狂熱連擊", desc: "COMBO 達到 5 以上，額外 +320 傷害。", effect: { comboMin: 5, flatDamage: 320 } },
  { id: "clear-4", rarity: "common", name: "四連突破", desc: "單次消除 4 顆以上，額外 +100 傷害。", effect: { clearMin: 4, flatDamage: 100 } },
  { id: "clear-5", rarity: "rare", name: "五連重擊", desc: "單次消除 5 顆以上，額外 +240 傷害。", effect: { clearMin: 5, flatDamage: 240 } },
  { id: "rainbow-types", rarity: "epic", name: "五色共鳴", desc: "單次消除包含 5 種屬性，額外 +500 傷害。", effect: { typeCountMin: 5, flatDamage: 500 } },
  { id: "bomb-damage", rarity: "rare", name: "爆彈精通", desc: "爆炸符石傷害 +70%。", effect: { special: "bomb", specialMultiplier: .7 } },
  { id: "rainbow-damage", rarity: "epic", name: "彩虹超載", desc: "彩虹符石傷害 +90%。", effect: { special: "rainbow", specialMultiplier: .9 } },
  { id: "special-flat", rarity: "rare", name: "符石共振", desc: "特殊符石被消除時，額外 +150 傷害。", effect: { specialFlat: 150 } },
  { id: "boss-specials", rarity: "epic", name: "決戰布陣", desc: "進入 BOSS 關時，隨機 2 顆符石變成特殊符石。", effect: { bossStartSpecials: 2 } },
  { id: "boss-damage", rarity: "rare", name: "屠龍姿態", desc: "BOSS 關造成的傷害 +35%。", effect: { bossMultiplier: .35 } },
  { id: "high-damage-coin", rarity: "rare", name: "賞金追擊", desc: "單次傷害超過 1000 時，獲得 20 金幣。", effect: { damageCoinMin: 1000, damageCoin: 20 } }
];

const boardEl = document.getElementById("board");
const boardAreaEl = document.querySelector(".board-area");
const comboBurstEl = document.getElementById("combo-burst");
const coinsEl = document.getElementById("coins");
const comboEl = document.getElementById("combo");
const logEl = document.getElementById("battle-log");
const hpEl = document.getElementById("monster-hp");
const maxHpEl = document.getElementById("monster-max-hp");
const hpFillEl = document.getElementById("hp-fill");
const monsterEl = document.getElementById("monster");
const monsterNameEl = document.getElementById("monster-name");
const damagePopEl = document.getElementById("damage-pop");
const damageBreakdownEl = document.getElementById("damage-breakdown");
const newRoundBtn = document.getElementById("new-round");
const stageProgressEl = document.getElementById("stage-progress");
const stageLabelEl = document.getElementById("stage-label");
const phaseLabelEl = document.getElementById("phase-label");
const bossHintEl = document.getElementById("boss-hint");
const chestModalEl = document.getElementById("chest-modal");
const chestButtonEl = document.getElementById("chest-button");
const chestCopyEl = document.getElementById("chest-copy");
const slashEffectEl = document.getElementById("slash-effect");
const bigWinEl = document.getElementById("big-win");
const augmentToggleEl = document.getElementById("augment-toggle");
const augmentPanelEl = document.getElementById("augment-panel");
const augmentCloseEl = document.getElementById("augment-close");
const augmentListEl = document.getElementById("augment-list");
const augmentModalEl = document.getElementById("augment-modal");
const augmentOptionsEl = document.getElementById("augment-options");
const augmentSubtitleEl = document.getElementById("augment-subtitle");
const stageClearCardEl = document.getElementById("stage-clear-card");

let board = [];
let selected = null;
let coins = START_COINS;
let round = 1;
let stageIndex = 0;
let monsterHp = STAGES[0].hp;
let monsterMaxHp = STAGES[0].hp;
let busy = false;
let awaitingNextRound = false;
let pendingStartSpecials = [];
let pendingChestReward = 0;
let activeAugments = [];
let augmentChoices = [];
let awaitingAugment = false;
let pendingStageGrantText = "";
let chestRolling = false;
let audioStarted = false;
let audioCtx = null;
let musicTimer = null;
let musicStep = 0;
let dropKeys = new Set();
let specialFxTimer = null;

function randomType() {
  return TYPES[Math.floor(Math.random() * TYPES.length)];
}

function makeGem(type = randomType(), special = null) {
  return { type, special };
}

function sameGem(a, b) {
  return a && b && a.type === b.type;
}

function keyOf(r, c) {
  return `${r}-${c}`;
}

function inBounds(r, c) {
  return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
}

function neighbors(a, b) {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
}

function initBoard() {
  do {
    board = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        let gem;
        do {
          gem = makeGem();
        } while (
          (c >= 2 && sameGem(board[r][c - 1], gem) && sameGem(board[r][c - 2], gem)) ||
          (r >= 2 && sameGem(board[r - 1][c], gem) && sameGem(board[r - 2][c], gem))
        );
        board[r][c] = gem;
      }
    }
  } while (!hasPossibleMove());
}

function render(popKeys = new Set()) {
  boardEl.innerHTML = "";
  const renderedDropKeys = dropKeys.size > 0;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const tile = document.createElement("button");
      const gem = board[r][c];
      tile.className = "tile";
      tile.type = "button";
      tile.dataset.r = r;
      tile.dataset.c = c;
      if (dropKeys.has(keyOf(r, c))) {
        tile.classList.add("drop-in");
        tile.style.setProperty("--drop-delay", `${r * 34 + c * 8}ms`);
      }
      if (selected && selected.r === r && selected.c === c) tile.classList.add("selected");
      if (popKeys.has(keyOf(r, c))) tile.classList.add("pop");
      if (gem?.special) tile.classList.add(gem.special);
      tile.setAttribute("aria-label", gem ? `${gem.type}${gem.special ? " special" : ""}` : "empty");
      if (gem) {
        const shape = document.createElement("span");
        shape.className = `gem ${gem.type}`;
        shape.innerHTML = gemArt(gem.type);
        tile.appendChild(shape);
      }
      tile.addEventListener("click", () => onTileClick(r, c));
      boardEl.appendChild(tile);
    }
  }
  updateHud();
  if (renderedDropKeys) {
    setTimeout(() => {
      dropKeys.clear();
    }, 0);
  }
}

function updateHud() {
  const stage = STAGES[stageIndex];
  coinsEl.textContent = coins;
  hpEl.textContent = Math.max(0, monsterHp);
  maxHpEl.textContent = monsterMaxHp;
  hpFillEl.style.width = `${Math.max(0, (monsterHp / monsterMaxHp) * 100)}%`;
  monsterNameEl.textContent = stage.name;
  stageLabelEl.textContent = `第 ${stageIndex + 1} 關 / 5`;
  phaseLabelEl.textContent = awaitingAugment ? "選擇增幅" : awaitingNextRound ? `第 ${round} 輪結算` : stage.phase;
  bossHintEl.innerHTML = stageIndex === 4 ? "BOSS寶箱<br>WIN UP 5000$" : "第5關寶箱<br>WIN UP 5000$";
  monsterEl.className = `sprite monster stage-${stageIndex + 1}${stageIndex === 4 ? " boss" : ""}`;
  monsterEl.src = stage.art;
  newRoundBtn.textContent = awaitingNextRound ? "下一輪" : "重開";
  stageProgressEl.innerHTML = STAGES.map((item, index) => {
    const state = index < stageIndex ? "done" : index === stageIndex ? "active" : "";
    return `<span class="${state} ${index === 4 ? "boss-dot" : ""}">${index === 4 ? "B" : index + 1}</span>`;
  }).join("");
  augmentToggleEl.textContent = `增幅 x${activeAugments.length}`;
  renderAugmentList();
}

async function onTileClick(r, c) {
  if (busy || awaitingNextRound || awaitingAugment) return;
  startAudio();
  if (!selected) {
    selected = { r, c };
    playTone(520, .035, "triangle", .04);
    render();
    return;
  }
  if (selected.r === r && selected.c === c) {
    selected = null;
    render();
    return;
  }
  const next = { r, c };
  if (!neighbors(selected, next)) {
    selected = next;
    render();
    return;
  }
  await tryMove(selected, next);
}

async function tryMove(a, b) {
  busy = true;
  swap(a, b);
  selected = null;

  const specialResult = resolveSpecialSwap(a, b);
  let matches = collectMatches();
  if (!specialResult && matches.groups.length === 0) {
    swap(a, b);
    logEl.textContent = "沒有消除，符號復位。本次移動不扣錢。";
    playTone(180, .09, "sawtooth", .035);
    busy = false;
    render();
    return;
  }

  coins = Math.max(0, coins - BET);
  render();
  await sleep(120);

  let totalDamage = 0;
  if (specialResult) {
    const expanded = expandSpecialChain(specialResult.cells);
    await playSpecialSequence([
      { kind: specialResult.kind || "special", origin: specialResult.origin || a },
      ...expanded.triggered
    ], expanded.cells);
    showComboBurst(1);
    totalDamage += await clearCells(expanded.cells, 1, specialResult.label);
    collapse();
    ensurePlayableBoard();
    render();
    await sleep(180);
  }
  totalDamage += await resolveBoard(a);
  await hitMonster(totalDamage);
  busy = false;
  render();
}

function swap(a, b) {
  const temp = board[a.r][a.c];
  board[a.r][a.c] = board[b.r][b.c];
  board[b.r][b.c] = temp;
}

function resolveSpecialSwap(a, b) {
  const first = board[a.r][a.c];
  const second = board[b.r][b.c];
  if (!first || !second) return null;

  if (first.special === "rainbow" || second.special === "rainbow") {
    const rainbowPair = first.special === "rainbow" && second.special === "rainbow";
    if (rainbowPair) return { cells: allCells(), label: "雙彩虹全盤爆發", kind: "rainbow", origin: a };

    const other = first.special === "rainbow" ? second : first;
    const target = other.type;
    const cells = new Map();
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (board[r][c]?.type !== target && board[r][c]?.special !== "rainbow") continue;
        if (other.special === "striped-row") addRow(cells, r);
        else if (other.special === "striped-col") addCol(cells, c);
        else if (other.special === "bomb") addBox(cells, r, c);
        else cells.set(keyOf(r, c), { r, c });
      }
    }
    return { cells: [...cells.values()], label: other.special ? "彩虹特殊連鎖" : "彩虹符文爆發", kind: "rainbow", origin: first.special === "rainbow" ? a : b };
  }

  if (!first.special || !second.special) return null;

  const cells = new Map();
  if (isStriped(first) && second.special === "bomb") addWideCross(cells, b.r, b.c);
  if (isStriped(second) && first.special === "bomb") addWideCross(cells, a.r, a.c);
  if (first.special === "bomb" && second.special === "bomb") {
    addBigBox(cells, a.r, a.c);
    addBigBox(cells, b.r, b.c);
  }
  for (const pos of [a, b]) {
    const gem = board[pos.r][pos.c];
    if (gem?.special === "striped-row") addRow(cells, pos.r);
    if (gem?.special === "striped-col") addCol(cells, pos.c);
    if (gem?.special === "bomb") addBox(cells, pos.r, pos.c);
  }
  if (cells.size > 0) {
    return { cells: [...cells.values()], label: "特殊符石連鎖", kind: specialFxKind(first, second), origin: b };
  }
  return null;
}

function isStriped(gem) {
  return gem?.special === "striped-row" || gem?.special === "striped-col";
}

function specialFxKind(first, second) {
  if (first?.special === "rainbow" || second?.special === "rainbow") return "rainbow";
  if (first?.special === "bomb" || second?.special === "bomb") return "bomb";
  if (first?.special === "striped-col" || second?.special === "striped-col") return "col";
  return "row";
}

function expandSpecialChain(seedCells) {
  const cells = new Map();
  const queue = [];
  const triggered = [];
  const processed = new Set();

  function queueCell(cell) {
    if (!inBounds(cell.r, cell.c) || !board[cell.r][cell.c]) return;
    const key = keyOf(cell.r, cell.c);
    if (!cells.has(key)) queue.push({ r: cell.r, c: cell.c });
    cells.set(key, { r: cell.r, c: cell.c });
  }

  for (const cell of seedCells) queueCell(cell);

  for (let index = 0; index < queue.length; index++) {
    const cell = queue[index];
    const key = keyOf(cell.r, cell.c);
    if (processed.has(key)) continue;
    processed.add(key);

    const gem = board[cell.r][cell.c];
    if (!gem?.special) continue;

    const before = cells.size;
    if (gem.special === "striped-row") addRow(cells, cell.r);
    if (gem.special === "striped-col") addCol(cells, cell.c);
    if (gem.special === "bomb") addBox(cells, cell.r, cell.c);
    if (gem.special === "rainbow") addType(cells, randomAdjacentType(cell) || randomType());

    if (cells.size > before || gem.special === "rainbow") {
      triggered.push({ kind: specialKind(gem.special), origin: cell });
    }

    for (const next of cells.values()) {
      const nextKey = keyOf(next.r, next.c);
      if (!processed.has(nextKey) && !queue.some(item => item.r === next.r && item.c === next.c)) {
        queue.push(next);
      }
    }
  }

  return { cells: [...cells.values()], triggered };
}

function randomAdjacentType(cell) {
  const adjacent = [
    { r: cell.r - 1, c: cell.c },
    { r: cell.r + 1, c: cell.c },
    { r: cell.r, c: cell.c - 1 },
    { r: cell.r, c: cell.c + 1 }
  ]
    .filter(pos => inBounds(pos.r, pos.c))
    .map(pos => board[pos.r][pos.c])
    .filter(gem => gem && gem.special !== "rainbow")
    .map(gem => gem.type);

  if (adjacent.length > 0) return adjacent[Math.floor(Math.random() * adjacent.length)];

  const existing = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const gem = board[r][c];
      if (gem && gem.special !== "rainbow") existing.push(gem.type);
    }
  }
  return existing.length ? existing[Math.floor(Math.random() * existing.length)] : null;
}

function specialKind(special) {
  if (special === "rainbow") return "rainbow";
  if (special === "bomb") return "bomb";
  if (special === "striped-col") return "col";
  return "row";
}

async function playSpecialSequence(sequence, cells) {
  const seen = new Set();
  for (const fx of sequence) {
    if (!fx?.origin) continue;
    const key = `${fx.kind}-${keyOf(fx.origin.r, fx.origin.c)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    playSpecialSound(fx.kind);
    flashSpecial(fx.kind, fx.origin, cells);
    await sleep(90);
  }
}

async function resolveBoard(origin) {
  let chain = 1;
  let total = 0;
  while (true) {
    const matches = collectMatches();
    if (matches.groups.length === 0) break;
    if (comboEl) comboEl.textContent = `x${chain}`;

    const createAt = chooseSpecial(matches.groups, origin);
    const cells = new Map();
    for (const cell of matches.cells) cells.set(keyOf(cell.r, cell.c), cell);
    const expanded = expandSpecialChain([...cells.values()]);
    await playSpecialSequence(expanded.triggered, expanded.cells);
    playComboSound(chain);
    showComboBurst(chain);
    total += await clearCells(expanded.cells, chain, chain === 1 ? "命中" : `連鎖 x${chain}`);
    if (createAt) board[createAt.r][createAt.c] = makeGem(createAt.type, createAt.special);
    collapse();
    ensurePlayableBoard();
    render();
    await sleep(180);
    chain++;
  }
  if (comboEl) comboEl.textContent = "x1";
  return total;
}

function collectMatches() {
  const groups = [];
  for (let r = 0; r < SIZE; r++) {
    let start = 0;
    for (let c = 1; c <= SIZE; c++) {
      if (c < SIZE && board[r][c] && board[r][start] && board[r][c].type === board[r][start].type) continue;
      if (c - start >= 3) {
        groups.push({
          direction: "row",
          type: board[r][start].type,
          cells: range(start, c).map(col => ({ r, c: col }))
        });
      }
      start = c;
    }
  }
  for (let c = 0; c < SIZE; c++) {
    let start = 0;
    for (let r = 1; r <= SIZE; r++) {
      if (r < SIZE && board[r][c] && board[start][c] && board[r][c].type === board[start][c].type) continue;
      if (r - start >= 3) {
        groups.push({
          direction: "col",
          type: board[start][c].type,
          cells: range(start, r).map(row => ({ r: row, c }))
        });
      }
      start = r;
    }
  }

  const byKey = new Map();
  for (const group of groups) {
    for (const cell of group.cells) byKey.set(keyOf(cell.r, cell.c), cell);
  }
  return { groups, cells: [...byKey.values()] };
}

function ensurePlayableBoard() {
  let guard = 0;
  while (!hasPossibleMove() && guard < 80) {
    shuffleBoardOnce();
    guard++;
  }
}

function hasPossibleMove() {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      for (const [dr, dc] of [[0, 1], [1, 0]]) {
        const next = { r: r + dr, c: c + dc };
        if (!inBounds(next.r, next.c)) continue;
        swap({ r, c }, next);
        const possible = collectMatches().groups.length > 0;
        swap({ r, c }, next);
        if (possible) return true;
      }
    }
  }
  return false;
}

function shuffleBoardOnce() {
  const gems = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) gems.push(board[r][c]);
  }
  for (let index = gems.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [gems[index], gems[swapIndex]] = [gems[swapIndex], gems[index]];
  }
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) board[r][c] = gems[r * SIZE + c];
  }
}

function chooseSpecial(groups, origin) {
  const wrapped = findWrappedCandidate(groups, origin);
  if (wrapped) return wrapped;

  const candidates = groups.filter(group => group.cells.length >= 4);
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.cells.length - a.cells.length);
  const group = candidates[0];
  const preferred = group.cells.find(cell => origin && cell.r === origin.r && cell.c === origin.c) || group.cells[Math.floor(group.cells.length / 2)];
  return {
    r: preferred.r,
    c: preferred.c,
    type: group.type,
    special: group.cells.length >= 5 ? "rainbow" : (group.direction === "row" ? "striped-row" : "striped-col")
  };
}

function findWrappedCandidate(groups, origin) {
  for (const rowGroup of groups.filter(group => group.direction === "row")) {
    for (const colGroup of groups.filter(group => group.direction === "col" && group.type === rowGroup.type)) {
      const cross = rowGroup.cells.find(rowCell => colGroup.cells.some(colCell => colCell.r === rowCell.r && colCell.c === rowCell.c));
      if (!cross) continue;
      const totalKeys = new Set([...rowGroup.cells, ...colGroup.cells].map(cell => keyOf(cell.r, cell.c)));
      if (totalKeys.size < 5) continue;
      const preferred = [...rowGroup.cells, ...colGroup.cells].find(cell => origin && cell.r === origin.r && cell.c === origin.c) || cross;
      return {
        r: preferred.r,
        c: preferred.c,
        type: rowGroup.type,
        special: "bomb"
      };
    }
  }
  return null;
}

async function clearCells(cells, chain, label) {
  const unique = new Map();
  for (const cell of cells) {
    if (inBounds(cell.r, cell.c) && board[cell.r][cell.c]) unique.set(keyOf(cell.r, cell.c), cell);
  }
  const finalCells = [...unique.values()];
  let raw = 0;
  const clearedTypes = new Set();
  const clearedSpecials = new Set();
  let specialCleared = 0;
  for (const cell of finalCells) {
    const gem = board[cell.r][cell.c];
    clearedTypes.add(gem.type);
    let cellDamage = DAMAGE[gem.type] * getTypeDamageMultiplier(gem.type);
    if (gem.special) {
      specialCleared++;
      clearedSpecials.add(gem.special);
      cellDamage += 14 * getSpecialDamageMultiplier(gem.special);
    }
    raw += cellDamage;
  }
  const baseDamage = raw * getGlobalDamageMultiplier() * (1 + (chain - 1) * 0.45);
  const flatDamage = getConditionalFlatDamage({ chain, clearCount: finalCells.length, typeCount: clearedTypes.size, specialCleared });
  const damage = Math.round(baseDamage + flatDamage);
  const bonusCoins = getDamageCoinReward(damage);
  const sources = getDamageSourceLabels({ chain, clearCount: finalCells.length, typeCount: clearedTypes.size, clearedTypes, clearedSpecials, specialCleared, bonusCoins });
  if (bonusCoins > 0) coins += bonusCoins;
  render(new Set(unique.keys()));
  showDamageBreakdown(sources);
  logEl.textContent = `${label}！消除 ${finalCells.length} 格，造成 ${damage} 傷害${bonusCoins ? `，賞金 +${bonusCoins}` : ""}。`;
  playImpactCallout(chain, damage);
  await sleep(260);
  for (const cell of finalCells) board[cell.r][cell.c] = null;
  return damage;
}

function getTypeDamageMultiplier(type) {
  return 1 + activeAugments.reduce((sum, augment) => {
    const effect = augment.effect;
    return sum + (effect.type === type ? effect.typeMultiplier || 0 : 0);
  }, 0);
}

function getSpecialDamageMultiplier(special) {
  return 1 + activeAugments.reduce((sum, augment) => {
    const effect = augment.effect;
    return sum + (effect.special === special ? effect.specialMultiplier || 0 : 0);
  }, 0);
}

function getGlobalDamageMultiplier() {
  return 1 + activeAugments.reduce((sum, augment) => {
    const effect = augment.effect;
    return sum + (effect.allMultiplier || 0) + (stageIndex === 4 ? effect.bossMultiplier || 0 : 0);
  }, 0);
}

function getConditionalFlatDamage(context) {
  return activeAugments.reduce((sum, augment) => {
    const effect = augment.effect;
    let active = false;
    if (effect.comboMin && context.chain >= effect.comboMin) active = true;
    if (effect.clearMin && context.clearCount >= effect.clearMin) active = true;
    if (effect.typeCountMin && context.typeCount >= effect.typeCountMin) active = true;
    if (effect.specialFlat && context.specialCleared > 0) return sum + effect.specialFlat;
    return sum + (active ? effect.flatDamage || 0 : 0);
  }, 0);
}

function getDamageCoinReward(damage) {
  return activeAugments.reduce((sum, augment) => {
    const effect = augment.effect;
    return sum + (effect.damageCoinMin && damage >= effect.damageCoinMin ? effect.damageCoin || 0 : 0);
  }, 0);
}

function getDamageSourceLabels(context) {
  const labels = [];
  for (const augment of activeAugments) {
    const effect = augment.effect;
    if (effect.type && context.clearedTypes.has(effect.type)) labels.push(`${TYPE_LABELS[effect.type]} +${Math.round(effect.typeMultiplier * 100)}%`);
    if (effect.special && context.clearedSpecials.has(effect.special)) labels.push(`${specialName(effect.special)} +${Math.round(effect.specialMultiplier * 100)}%`);
    if (effect.allMultiplier) labels.push(`All +${Math.round(effect.allMultiplier * 100)}%`);
    if (effect.bossMultiplier && stageIndex === 4) labels.push(`Boss +${Math.round(effect.bossMultiplier * 100)}%`);
    if (effect.comboMin && context.chain >= effect.comboMin) labels.push(`Combo ${effect.comboMin}+ +${effect.flatDamage}`);
    if (effect.clearMin && context.clearCount >= effect.clearMin) labels.push(`${effect.clearMin}+ Match +${effect.flatDamage}`);
    if (effect.typeCountMin && context.typeCount >= effect.typeCountMin) labels.push(`5 Colors +${effect.flatDamage}`);
    if (effect.specialFlat && context.specialCleared > 0) labels.push(`Special +${effect.specialFlat}`);
  }
  if (context.bonusCoins) labels.push(`Bounty +${context.bonusCoins}`);
  return [...new Set(labels)].slice(0, 4);
}

function showDamageBreakdown(labels) {
  if (!labels.length) return;
  damageBreakdownEl.innerHTML = labels.map(label => `<span>${label}</span>`).join("");
  damageBreakdownEl.classList.remove("show");
  void damageBreakdownEl.offsetWidth;
  damageBreakdownEl.classList.add("show");
  damageBreakdownEl.setAttribute("aria-hidden", "false");
  window.setTimeout(() => {
    damageBreakdownEl.classList.remove("show");
    damageBreakdownEl.setAttribute("aria-hidden", "true");
  }, 920);
}

function showComboBurst(chain) {
  const rank = chain >= 7 ? "FEVER" : chain >= 5 ? "GREAT" : chain >= 3 ? "NICE" : "HIT";
  const size = Math.min(1.75, 1 + chain * .09);
  comboBurstEl.innerHTML = `<strong>COMBO x${chain}</strong><span>${rank}</span>`;
  comboBurstEl.style.setProperty("--combo-scale", size.toFixed(2));
  comboBurstEl.classList.remove("show", "mega");
  boardAreaEl.classList.remove("combo-shake");
  void comboBurstEl.offsetWidth;
  comboBurstEl.classList.add("show");
  if (chain >= 4) comboBurstEl.classList.add("mega");
  if (chain >= 3) {
    void boardAreaEl.offsetWidth;
    boardAreaEl.classList.add("combo-shake");
  }
  window.setTimeout(() => {
    comboBurstEl.classList.remove("show", "mega");
    boardAreaEl.classList.remove("combo-shake");
  }, 620);
}

function collapse() {
  dropKeys = new Set();
  for (let c = 0; c < SIZE; c++) {
    const stack = [];
    for (let r = SIZE - 1; r >= 0; r--) {
      if (board[r][c]) stack.push(board[r][c]);
    }
    for (let r = SIZE - 1; r >= 0; r--) {
      const existing = stack.shift();
      board[r][c] = existing || makeBiasedGem(r, c);
      if (!existing) dropKeys.add(keyOf(r, c));
    }
  }
}

function makeBiasedGem(r, c) {
  const candidates = [];

  if (inBounds(r + 1, c) && inBounds(r + 2, c) && board[r + 1][c] && board[r + 2][c] && board[r + 1][c].type === board[r + 2][c].type) {
    candidates.push(board[r + 1][c].type, board[r + 1][c].type);
  }

  if (inBounds(r, c - 1) && inBounds(r, c - 2) && board[r][c - 1] && board[r][c - 2] && board[r][c - 1].type === board[r][c - 2].type) {
    candidates.push(board[r][c - 1].type);
  }

  if (inBounds(r, c + 1) && inBounds(r, c + 2) && board[r][c + 1] && board[r][c + 2] && board[r][c + 1].type === board[r][c + 2].type) {
    candidates.push(board[r][c + 1].type);
  }

  if (inBounds(r, c - 1) && inBounds(r, c + 1) && board[r][c - 1] && board[r][c + 1] && board[r][c - 1].type === board[r][c + 1].type) {
    candidates.push(board[r][c - 1].type, board[r][c - 1].type);
  }

  if (candidates.length && Math.random() < 0.38) {
    return makeGem(candidates[Math.floor(Math.random() * candidates.length)]);
  }

  return makeGem();
}

function addRow(map, r) {
  for (let c = 0; c < SIZE; c++) map.set(keyOf(r, c), { r, c });
}

function addCol(map, c) {
  for (let r = 0; r < SIZE; r++) map.set(keyOf(r, c), { r, c });
}

function addBox(map, centerR, centerC) {
  for (let r = centerR - 1; r <= centerR + 1; r++) {
    for (let c = centerC - 1; c <= centerC + 1; c++) {
      if (inBounds(r, c)) map.set(keyOf(r, c), { r, c });
    }
  }
}

function addBigBox(map, centerR, centerC) {
  for (let r = centerR - 2; r <= centerR + 2; r++) {
    for (let c = centerC - 2; c <= centerC + 2; c++) {
      if (inBounds(r, c)) map.set(keyOf(r, c), { r, c });
    }
  }
}

function addWideCross(map, centerR, centerC) {
  for (let r = centerR - 1; r <= centerR + 1; r++) {
    if (inBounds(r, 0)) addRow(map, r);
  }
  for (let c = centerC - 1; c <= centerC + 1; c++) {
    if (inBounds(0, c)) addCol(map, c);
  }
}

function addType(map, type) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c]?.type === type) map.set(keyOf(r, c), { r, c });
    }
  }
}

function allCells() {
  const cells = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) cells.push({ r, c });
  }
  return cells;
}

function range(start, end) {
  return Array.from({ length: end - start }, (_, index) => start + index);
}

async function hitMonster(damage) {
  if (damage <= 0) return;
  await playAttackImpact(damage);
  monsterHp -= damage;
  damagePopEl.textContent = `-${damage}`;
  damagePopEl.classList.remove("show");
  void damagePopEl.offsetWidth;
  damagePopEl.classList.add("show");
  monsterEl.classList.add("hit");
  setTimeout(() => monsterEl.classList.remove("hit"), 180);

  if (monsterHp <= 0) await advanceStage();
  updateHud();
}

async function playAttackImpact(damage) {
  const power = Math.min(1.9, 0.85 + damage / 900);
  slashEffectEl.style.setProperty("--slash-scale", power.toFixed(2));
  slashEffectEl.classList.remove("show");
  void slashEffectEl.offsetWidth;
  slashEffectEl.classList.add("show");
  playSwordSwingSound(damage);
  await sleep(170);
  playDamageImpactSound(damage);
  await sleep(90);
}

async function advanceStage() {
  const cleared = STAGES[stageIndex];

  if (stageIndex < STAGES.length - 1) {
    const grantText = grantStageSpecials(cleared.grants);
    playRewardSound();
    pendingStageGrantText = grantText;
    logEl.textContent = `第 ${stageIndex + 1} 關完成！準備進入增幅選擇。`;
    await showStageClearCard();
    openAugmentChoice(grantText);
    logEl.textContent = `第 ${stageIndex + 1} 關勝利！盤面轉化 ${grantText}，選擇 1 個增幅。`;
    return;
  }

  awaitingNextRound = true;
  pendingStartSpecials = [...cleared.grants];
  pendingChestReward = randomChestReward();
  activeAugments = [];
  closeAugmentPanel();
  playBossClearSound();
  showChest();
  logEl.textContent = `BOSS 擊破！寶箱出現，最高可開出 5000 金幣。`;
}

async function showStageClearCard() {
  stageClearCardEl.classList.remove("show");
  void stageClearCardEl.offsetWidth;
  stageClearCardEl.classList.add("show");
  stageClearCardEl.setAttribute("aria-hidden", "false");
  await sleep(900);
  stageClearCardEl.classList.remove("show");
  stageClearCardEl.setAttribute("aria-hidden", "true");
}

function setStage(index) {
  const stage = STAGES[index];
  monsterMaxHp = stage.hp + Math.max(0, round - 1) * (index === 4 ? 150 : 35);
  monsterHp = monsterMaxHp;
  if (index === 4) applyBossStartAugments();
  updateHud();
}

function openAugmentChoice(grantText) {
  awaitingAugment = true;
  augmentChoices = drawAugmentChoices();
  augmentSubtitleEl.textContent = `獲得 ${grantText}。選 1 個增幅，效果累積到 BOSS 戰。`;
  augmentOptionsEl.innerHTML = augmentChoices.map((augment, index) => `
    <button class="augment-option ${augment.rarity}" type="button" data-index="${index}">
      <span>
        <strong>${augment.name}</strong>
        <span>${augment.desc}</span>
      </span>
      <small>${RARITY_LABELS[augment.rarity]}</small>
    </button>
  `).join("");
  augmentModalEl.classList.add("show");
  augmentModalEl.setAttribute("aria-hidden", "false");
  updateHud();
}

function drawAugmentChoices() {
  const chosen = [];
  const used = new Set();
  while (chosen.length < 3 && used.size < AUGMENT_POOL.length) {
    const rarity = rollAugmentRarity();
    const candidates = AUGMENT_POOL.filter(augment => augment.rarity === rarity && !used.has(augment.id));
    const fallback = AUGMENT_POOL.filter(augment => !used.has(augment.id));
    const pool = candidates.length ? candidates : fallback;
    const augment = pool[Math.floor(Math.random() * pool.length)];
    used.add(augment.id);
    chosen.push(augment);
  }
  return chosen;
}

function rollAugmentRarity() {
  const roll = Math.random();
  const epicChance = Math.min(.22, .06 + stageIndex * .045);
  const rareChance = Math.min(.42, .24 + stageIndex * .04);
  if (roll < epicChance) return "epic";
  if (roll < epicChance + rareChance) return "rare";
  return "common";
}

function chooseAugment(index) {
  const augment = augmentChoices[index];
  if (!augment || !awaitingAugment) return;
  activeAugments.push(augment);
  applyImmediateAugment(augment);
  awaitingAugment = false;
  augmentChoices = [];
  augmentModalEl.classList.remove("show");
  augmentModalEl.setAttribute("aria-hidden", "true");
  stageIndex++;
  setStage(stageIndex);
  logEl.textContent = `選擇「${augment.name}」。自動前進到第 ${stageIndex + 1} 關。`;
  playRewardSound();
  render();
}

function applyImmediateAugment(augment) {
  if (augment.effect.coinNow) coins += augment.effect.coinNow;
}

function applyBossStartAugments() {
  const count = activeAugments.reduce((sum, augment) => sum + (augment.effect.bossStartSpecials || 0), 0);
  const specials = ["striped-row", "striped-col", "bomb", "rainbow"];
  const applied = [];
  for (let i = 0; i < count; i++) {
    const pos = randomUpgradeableCell();
    if (!pos) break;
    const special = specials[Math.floor(Math.random() * specials.length)];
    board[pos.r][pos.c].special = special;
    applied.push(specialName(special));
  }
  if (applied.length) logEl.textContent = `BOSS 開戰布陣：${applied.join("、")} 已注入盤面。`;
}

function renderAugmentList() {
  if (!activeAugments.length) {
    augmentListEl.innerHTML = `<div class="empty">目前沒有增幅。打贏 1-4 關後可選擇。</div>`;
    return;
  }
  augmentListEl.innerHTML = activeAugments.map((augment, index) => `
    <div class="augment-list-item">
      <strong>${index + 1}. ${augment.name} <small>${RARITY_LABELS[augment.rarity]}</small></strong>
      <span>${augment.desc}</span>
    </div>
  `).join("");
}

function toggleAugmentPanel() {
  const show = !augmentPanelEl.classList.contains("show");
  augmentPanelEl.classList.toggle("show", show);
  augmentPanelEl.setAttribute("aria-hidden", show ? "false" : "true");
  augmentToggleEl.setAttribute("aria-expanded", show ? "true" : "false");
}

function closeAugmentPanel() {
  augmentPanelEl.classList.remove("show");
  augmentPanelEl.setAttribute("aria-hidden", "true");
  augmentToggleEl.setAttribute("aria-expanded", "false");
}

function grantStageSpecials(grants) {
  const applied = [];
  for (const special of grants) {
    const pos = randomUpgradeableCell();
    if (!pos) continue;
    board[pos.r][pos.c].special = special;
    applied.push(specialName(special));
  }
  return applied.length ? applied.join("、") : "強化符石";
}

function randomUpgradeableCell() {
  const cells = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] && !board[r][c].special) cells.push({ r, c });
    }
  }
  if (cells.length === 0) return null;
  return cells[Math.floor(Math.random() * cells.length)];
}

function specialName(special) {
  if (special === "striped-row") return "橫斬符石";
  if (special === "striped-col") return "縱斬符石";
  if (special === "bomb") return "爆彈符石";
  if (special === "rainbow") return "彩虹符石";
  return "特殊符石";
}

function startRound(nextRound = false) {
  selected = null;
  awaitingNextRound = false;
  awaitingAugment = false;
  activeAugments = [];
  augmentChoices = [];
  pendingStageGrantText = "";
  augmentModalEl.classList.remove("show");
  augmentModalEl.setAttribute("aria-hidden", "true");
  closeAugmentPanel();
  hideChest();
  if (nextRound) round++;
  stageIndex = 0;
  initBoard();
  let injected = "";
  if (pendingStartSpecials.length) {
    injected = grantStageSpecials(pendingStartSpecials);
    pendingStartSpecials = [];
  }
  setStage(0);
  logEl.textContent = injected
    ? `第 ${round} 輪開始。BOSS 掉落已注入：${injected}。`
    : `第 ${round} 輪開始。前四關累積特殊符石，第五關挑戰 BOSS。`;
  render();
}

function startAudio() {
  if (audioStarted) return;
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return;
  audioCtx = new AudioCtor();
  if (audioCtx.state === "suspended") audioCtx.resume();
  audioStarted = true;
  startMusicLoop();
}

function startMusicLoop() {
  if (!audioCtx || musicTimer) return;
  const bass = [110, 110, 146.8, 130.8, 98, 98, 130.8, 146.8];
  musicTimer = setInterval(() => {
    const note = bass[musicStep % bass.length];
    playTone(note, .18, "triangle", .025);
    if (musicStep % 2 === 0) playTone(note * 2, .08, "sine", .012);
    musicStep++;
  }, 360);
}

function playTone(freq, duration = .12, type = "sine", gainValue = .06, delay = 0) {
  if (!audioCtx) return;
  const now = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const volume = Math.min(.24, gainValue * 1.85);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + .012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + duration + .02);
}

function playComboSound(chain) {
  const base = 420 + Math.min(chain, 10) * 58;
  playTone(base, .09, "triangle", .07);
  playTone(base * 1.5, .08, "sine", .045, .045);
  if (chain >= 3) playTone(base * 2, .11, "square", .035, .09);
  if (chain === 4) speakEnglishCue("Nice combo");
  if (chain === 6) speakEnglishCue("Great combo");
  if (chain >= 8) speakEnglishCue("Amazing combo");
}

function speakEnglishCue(text) {
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    playVoiceFallback();
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 1.08;
  utterance.pitch = .92;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}

function playVoiceFallback() {
  [660, 660, 660, 880, 990, 1180].forEach((freq, index) => {
    playTone(freq, .1, index < 3 ? "square" : "triangle", .075, index * .08);
  });
}

function playImpactCallout(chain, damage) {
  if (damage >= 1800) {
    speakEnglishCue("Big hit");
    playBigHitSound(damage);
  } else if (chain >= 5) {
    playHypeSound(chain);
  }
}

function playHypeSound(chain) {
  const lift = Math.min(chain, 10) * 42;
  [740, 920, 1120].forEach((freq, index) => playTone(freq + lift, .09, "triangle", .05, index * .055));
}

function playBigHitSound(damage) {
  const power = Math.min(1, damage / 2500);
  playTone(70, .18, "square", .1 + power * .08);
  playTone(480 + damage / 8, .14, "sawtooth", .06 + power * .06, .04);
  playTone(980 + damage / 6, .11, "triangle", .045 + power * .04, .11);
}

function playSpecialSound(kind) {
  if (kind === "rainbow") {
    [520, 660, 820, 1040].forEach((freq, index) => playTone(freq, .12, "sine", .045, index * .045));
    return;
  }
  if (kind === "bomb") {
    playTone(120, .18, "sawtooth", .08);
    playTone(72, .22, "square", .045, .04);
    return;
  }
  playTone(kind === "col" ? 760 : 680, .12, "square", .055);
  playTone(kind === "col" ? 980 : 880, .1, "triangle", .04, .055);
}

function playRewardSound() {
  [640, 780, 930].forEach((freq, index) => playTone(freq, .1, "triangle", .045, index * .06));
}

function playBossClearSound() {
  [220, 330, 440, 660, 880].forEach((freq, index) => playTone(freq, .16, "triangle", .06, index * .08));
}

function playSwordSwingSound(damage) {
  const power = Math.min(1, damage / 1200);
  playTone(760 + damage / 7, .075, "sawtooth", .07 + power * .06);
  playTone(1180 + damage / 5, .055, "triangle", .045 + power * .05, .035);
}

function playDamageImpactSound(damage) {
  const power = Math.min(1, damage / 1200);
  playTone(92 - power * 34, .19, "square", .07 + power * .09);
  playTone(170 + power * 80, .13, "sawtooth", .055 + power * .08, .025);
  playTone(520 + damage / 10, .08, "triangle", .04 + power * .05, .045);
}

function playChestSound(amount) {
  [520, 700, 940, 1180].forEach((freq, index) => playTone(freq + amount / 18, .13, "sine", .055, index * .055));
}

function playChestRollSound() {
  [420, 500, 590, 700, 840].forEach((freq, index) => playTone(freq, .08, "square", .035, index * .065));
}

function flashSpecial(kind, origin, cells = []) {
  const className = kind === "rainbow" ? "special-rainbow" : kind === "bomb" ? "special-bomb" : kind === "col" ? "special-col" : "special-row";
  const x = ((origin.c + .5) / SIZE) * 100;
  const y = ((origin.r + .5) / SIZE) * 100;
  if (specialFxTimer) clearTimeout(specialFxTimer);
  boardEl.style.setProperty("--fx-x", `${x}%`);
  boardEl.style.setProperty("--fx-y", `${y}%`);
  boardEl.classList.remove("special-row", "special-col", "special-bomb", "special-rainbow");
  boardEl.querySelectorAll(".special-hit").forEach(tile => tile.classList.remove("special-hit"));
  void boardEl.offsetWidth;
  boardEl.classList.add(className);

  for (const cell of cells) {
    const tile = boardEl.querySelector(`.tile[data-r="${cell.r}"][data-c="${cell.c}"]`);
    tile?.classList.add("special-hit");
  }

  specialFxTimer = setTimeout(() => {
    boardEl.classList.remove(className);
    boardEl.querySelectorAll(".special-hit").forEach(tile => tile.classList.remove("special-hit"));
    specialFxTimer = null;
  }, 520);
}

function randomChestReward() {
  const minBonus = activeAugments.reduce((sum, augment) => sum + (augment.effect.chestMin || 0), 0);
  const multiplier = 1 + activeAugments.reduce((sum, augment) => sum + (augment.effect.chestMultiplier || 0), 0);
  const base = 500 + Math.floor(Math.random() * 46) * 100;
  const boosted = Math.round(Math.max(base, 500 + minBonus) * multiplier / 100) * 100;
  return Math.min(5000, boosted);
}

function showChest() {
  chestCopyEl.textContent = "最高可開出 5000 金幣";
  chestCopyEl.classList.remove("win");
  chestModalEl.classList.remove("opened");
  chestModalEl.classList.add("show");
  chestModalEl.setAttribute("aria-hidden", "false");
}

async function rollChestAmount(finalAmount) {
  const duration = 820;
  const interval = 70;
  const steps = Math.floor(duration / interval);
  for (let i = 0; i < steps; i++) {
    const fake = 500 + Math.floor(Math.random() * 46) * 100;
    chestCopyEl.textContent = `${fake}$`;
    playTone(520 + i * 28, .045, "triangle", .035);
    await sleep(interval);
  }
  chestCopyEl.textContent = `${finalAmount}$`;
  await sleep(120);
}

function hideChest() {
  chestModalEl.classList.remove("show", "opened");
  chestModalEl.setAttribute("aria-hidden", "true");
}

function showBigWin(amount) {
  bigWinEl.textContent = `BIG WIN ${amount}$`;
  bigWinEl.classList.remove("show");
  void bigWinEl.offsetWidth;
  bigWinEl.classList.add("show");
  bigWinEl.setAttribute("aria-hidden", "false");
  setTimeout(() => {
    bigWinEl.classList.remove("show");
    bigWinEl.setAttribute("aria-hidden", "true");
  }, 1550);
}

function gemArt(type) {
  const shapes = {
    sword: {
      stone: "M32 2 C45 5 56 16 59 31 C56 48 46 61 32 62 C18 61 8 48 5 31 C8 16 19 5 32 2 Z",
      mark: '<path class="mark" d="M21 23 C28 13 43 13 47 26 C50 39 39 48 26 46 C35 42 42 35 41 27 C40 20 31 19 26 27 Z"/><path class="mark cutout" d="M24 31 C28 37 36 38 41 33 C38 40 30 43 24 39 Z"/>'
    },
    fire: {
      stone: "M12 6 L51 6 L58 17 L58 51 L49 59 L15 59 L6 50 L6 17 Z",
      mark: '<path class="mark" d="M32 10 C42 24 24 27 41 43 C47 35 48 27 43 18 C55 29 53 50 34 55 C17 59 8 42 17 29 C18 39 24 45 30 48 C23 36 32 29 32 10 Z"/><path class="mark cutout" d="M31 34 C35 41 31 45 27 48 C36 48 40 42 37 35 C35 30 32 27 33 21 C28 26 27 30 31 34 Z"/>'
    },
    shield: {
      stone: "M14 4 L50 4 L60 14 L59 49 L48 60 L17 60 L5 49 L4 15 Z",
      mark: '<path class="mark" d="M12 36 C23 18 38 16 52 12 C48 29 41 46 21 52 C24 45 30 40 38 35 C29 37 21 39 12 36 Z"/><path class="mark cutout" d="M22 29 C28 30 35 29 42 25 C35 33 28 37 20 38 Z"/>'
    },
    potion: {
      stone: "M13 5 L51 5 L59 16 L59 48 L50 59 L14 59 L5 48 L5 16 Z",
      mark: '<path class="mark" d="M32 52 C15 39 10 28 16 20 C21 13 29 15 32 23 C35 15 43 13 48 20 C54 28 49 39 32 52 Z"/><path class="mark cutout" d="M22 23 C25 20 29 21 31 26 C25 25 22 27 20 32 C18 28 19 25 22 23 Z"/>'
    },
    coin: {
      stone: "M32 2 L42 10 L55 8 L56 21 L63 32 L56 43 L55 56 L42 54 L32 62 L22 54 L9 56 L8 43 L1 32 L8 21 L9 8 L22 10 Z",
      mark: '<path class="mark" d="M29 12 L36 12 L36 26 L50 26 L50 33 L36 33 L36 52 L29 52 L29 33 L14 33 L14 26 L29 26 Z"/><path class="mark cutout" d="M20 21 L44 21 L44 27 L20 27 Z"/>'
    },
    rune: {
      stone: "M12 4 L50 4 L61 17 L57 50 L40 62 L13 56 L3 20 Z",
      mark: '<path class="mark" d="M45 10 C34 16 30 27 34 37 C37 45 45 49 53 48 C47 56 32 57 23 48 C13 38 14 21 27 13 C33 9 39 8 45 10 Z"/><path class="mark cutout" d="M38 18 C31 23 29 31 32 38 C34 43 39 45 45 46 C38 49 28 46 24 38 C20 29 24 20 38 18 Z"/>'
    }
  };
  const art = shapes[type] || shapes.sword;
  return `
    <svg class="gem-svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <path class="gem-drop" d="${art.stone}"/>
      <path class="gem-base" d="${art.stone}"/>
      <path class="facet facet-top" d="M13 8 L51 8 L44 18 L20 18 Z"/>
      <path class="facet facet-left" d="M7 17 L20 18 L18 51 L8 46 Z"/>
      <path class="facet facet-right" d="M44 18 L58 17 L56 46 L46 51 Z"/>
      <path class="facet facet-bottom" d="M18 51 L46 51 L39 60 L25 60 Z"/>
      <path class="shine" d="M16 10 C25 5 40 5 49 11 C42 15 23 15 16 10 Z"/>
      <g class="gem-mark">${art.mark}</g>
      <path class="crack crack-a" d="M19 20 L25 25 L22 31 L29 38"/>
      <path class="crack crack-b" d="M47 22 L42 29 L45 36"/>
    </svg>
  `;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

newRoundBtn.addEventListener("click", () => {
  if (busy || awaitingAugment) return;
  startRound(awaitingNextRound);
});

augmentToggleEl.addEventListener("click", () => {
  renderAugmentList();
  toggleAugmentPanel();
});

augmentCloseEl.addEventListener("click", closeAugmentPanel);

augmentOptionsEl.addEventListener("click", event => {
  const option = event.target.closest(".augment-option");
  if (!option) return;
  startAudio();
  chooseAugment(Number(option.dataset.index));
});

chestButtonEl.addEventListener("click", async () => {
  if (!awaitingNextRound || !pendingChestReward || chestRolling) return;
  startAudio();
  const amount = pendingChestReward;
  pendingChestReward = 0;
  chestRolling = true;
  chestModalEl.classList.add("opened");
  chestCopyEl.textContent = "ROLLING...";
  chestCopyEl.classList.add("win");
  logEl.textContent = "寶箱開獎中...";
  playChestRollSound();
  await rollChestAmount(amount);
  coins += amount;
  chestRolling = false;
  chestCopyEl.textContent = `WIN ${amount}$`;
  logEl.textContent = `寶箱開出 ${amount} 金幣！按「下一輪」繼續。`;
  playChestSound(amount);
  updateHud();
  setTimeout(() => {
    hideChest();
    showBigWin(amount);
  }, 850);
});

startRound(false);

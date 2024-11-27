let emojiPool: string[] = [];
let front = 0;

export function resetEmojiPool(stringSeed: string) {
  initialSeed(stringSeed);
  emojiPool = Array(56)
    .fill(null)
    .map((_, i) => getEmojiByNumber(i))
    .sort(() => seededRandom() - 0.5);
}

export function getEmoji() {
  return emojiPool[front++ % emojiPool.length];
}
function getEmojiByNumber(n: number) {
  const base = 0x1f600; // 😀 시작점
  const emojiCode = base + n; // n번째 이모지
  const emoji = String.fromCodePoint(emojiCode);
  return emoji;
}

let seed = 0;
function initialSeed(str: string) {
  seed = 0;
  for (let i = 0; i < str.length; i++) {
    seed = (seed * 31 + str.charCodeAt(i)) & 0xffffffff;
  }
}

function seededRandom() {
  const m = 0x80000000;
  const a = 1103515245;
  const c = 12345;

  seed = (a * seed + c) % m;
  return seed / m;
}

export function getEmojiByUUID(uuid: string) {
  const uuid8Arr = uuid.slice(0, 8).toLowerCase().split('');
  for (let i = 0; i < uuid8Arr.length; i++) {
    if ((uuid8Arr[i] >= '0' && uuid8Arr[i] <= '9') || (uuid8Arr[i] >= 'a' && uuid8Arr[i] <= 'f')) continue;
    const char = (uuid.charCodeAt(i) * 3457) % 16;
    uuid8Arr[i] = char.toString(16);
  }
  const uuid8 = uuid8Arr.join('');
  const num = parseInt(uuid8, 16);
  return getEmojiByNumber(num % 56);
}

function getEmojiByNumber(n: number) {
  const base = 0x1f600; // 😀 시작점
  const emojiCode = base + n; // n번째 이모지
  const emoji = String.fromCodePoint(emojiCode);
  return emoji;
}

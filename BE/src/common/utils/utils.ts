export function generateUniquePin(currentRoomPins) {
  let pin: string;
  let isUnique = false;
  let attempts = 0;
  const MAX_ATTEMPTS = 10; // 무한 루프 방지

  while (!isUnique && attempts < MAX_ATTEMPTS) {
    // 6자리 PIN 생성 (100000-999999)
    pin = Math.floor(100000 + Math.random() * 900000).toString();

    // 중복 체크
    const existingRoom = currentRoomPins.includes(pin);

    if (!existingRoom) {
      isUnique = true;
    }

    attempts++;
  }

  if (!isUnique) {
    throw new Error('사용 가능한 PIN 생성 실패');
  }

  return pin;
}

export function parseHeaderToObject(
  input: string | undefined
): Record<string, string | boolean | number> {
  const obj: Record<string, string | boolean | number> = {};
  if (input) {
    input.split(';').forEach((pair) => {
      const [key, value] = pair.split('=');

      const parsedValue =
        value === 'true'
          ? true
          : value === 'false'
            ? false
            : isNaN(Number(value))
              ? value
              : Number(value);

      obj[key] = parsedValue;
    });
  }
  return obj;
}

export function parseCookieToObject(cookieString: string | undefined) {
  if (!cookieString) {
    return {};
  }
  return cookieString.split(';').reduce((acc: Record<string, string>, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}

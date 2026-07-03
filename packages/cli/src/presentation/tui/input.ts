export interface KeyEvent {
  value: string;
  return?: boolean;
  escape?: boolean;
  backspace?: boolean;
  delete?: boolean;
  upArrow?: boolean;
  downArrow?: boolean;
  pageUp?: boolean;
  pageDown?: boolean;
  tab?: boolean;
  ctrl?: boolean;
  meta?: boolean;
}

export function enableRawInput(onKey: (event: KeyEvent) => void): () => void {
  if (!process.stdin.isTTY) {
    return () => {};
  }

  const wasRaw = process.stdin.isRaw;
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  const handler = (chunk: string) => {
    for (const key of parseChunks(chunk)) {
      onKey(key);
    }
  };

  process.stdin.on('data', handler);

  return () => {
    process.stdin.off('data', handler);
    if (!wasRaw) process.stdin.setRawMode(false);
    process.stdin.pause();
  };
}

function* parseChunks(chunk: string): Generator<KeyEvent> {
  let i = 0;
  while (i < chunk.length) {
    const code = chunk.charCodeAt(i);

    if (code === 13 || code === 10) {
      yield { value: '', return: true };
      i += code === 13 && chunk.charCodeAt(i + 1) === 10 ? 2 : 1;
      continue;
    }

    if (code === 27) {
      if (chunk[i + 1] === '[') {
        const seq = chunk[i + 2];
        const tail = chunk[i + 3];
        if (seq === 'A') yield { value: '', upArrow: true };
        else if (seq === 'B') yield { value: '', downArrow: true };
        else if (seq === '5' && tail === '~') yield { value: '', pageUp: true };
        else if (seq === '6' && tail === '~') yield { value: '', pageDown: true };
        else if (seq === 'Z') yield { value: '', tab: true };
        i += tail === '~' ? 4 : 3;
        continue;
      }
      if (chunk[i + 1] === 'O' && chunk[i + 2] === 'Z') {
        yield { value: '', tab: true };
        i += 3;
        continue;
      }
      if (chunk[i + 1] === 'O') {
        const seq = chunk[i + 2];
        if (seq === '5') yield { value: '', pageUp: true };
        else if (seq === '6') yield { value: '', pageDown: true };
        i += 3;
        continue;
      }
      yield { value: '', escape: true };
      i += 1;
      continue;
    }

    if (code === 127 || code === 8) {
      yield { value: '', backspace: true };
      i += 1;
      continue;
    }

    if (code === 3) {
      yield { value: 'c', ctrl: true };
      i += 1;
      continue;
    }

    if (code === 9) {
      yield { value: '', tab: true };
      i += 1;
      continue;
    }

    const char = chunk[i]!;
    yield { value: char, ctrl: false, meta: false };
    i += 1;
  }
}
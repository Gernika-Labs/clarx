export interface CommandHistoryState {
  entries: string[];
  index: number | null;
  draft: string;
}

export function createCommandHistoryState(): CommandHistoryState {
  return {
    entries: [],
    index: null,
    draft: '',
  };
}

export function pushCommandHistory(state: CommandHistoryState, command: string): CommandHistoryState {
  const normalized = command.trim();
  if (!normalized) return { ...state, index: null, draft: '' };

  const withoutDuplicate =
    state.entries[state.entries.length - 1] === normalized
      ? state.entries
      : [...state.entries, normalized];

  return {
    entries: withoutDuplicate.slice(-30),
    index: null,
    draft: '',
  };
}

export function historyUp(state: CommandHistoryState, currentBuffer: string): { state: CommandHistoryState; buffer: string } {
  if (state.entries.length === 0) return { state, buffer: currentBuffer };

  if (state.index === null) {
    return {
      state: { ...state, index: state.entries.length - 1, draft: currentBuffer },
      buffer: state.entries[state.entries.length - 1]!,
    };
  }

  const nextIndex = Math.max(0, state.index - 1);
  return {
    state: { ...state, index: nextIndex },
    buffer: state.entries[nextIndex]!,
  };
}

export function historyDown(state: CommandHistoryState): { state: CommandHistoryState; buffer: string } {
  if (state.index === null) return { state, buffer: state.draft };

  const nextIndex = state.index + 1;
  if (nextIndex >= state.entries.length) {
    return {
      state: { ...state, index: null },
      buffer: state.draft,
    };
  }

  return {
    state: { ...state, index: nextIndex },
    buffer: state.entries[nextIndex]!,
  };
}

// Tiny event bus used to decouple game logic, quests, achievements and UI.
const handlers = new Map();

export const bus = {
  on(evt, fn) {
    if (!handlers.has(evt)) handlers.set(evt, new Set());
    handlers.get(evt).add(fn);
    return () => handlers.get(evt).delete(fn);
  },
  emit(evt, payload) {
    const set = handlers.get(evt);
    if (set) for (const fn of [...set]) fn(payload);
    const any = handlers.get('*');
    if (any) for (const fn of [...any]) fn(evt, payload);
  },
};

export function ok<T>(id: string, result: T) {
  return { id, ok: true as const, result };
}

export function err(id: string, code: string, message: string) {
  return { id, ok: false as const, error: { code, message } };
}

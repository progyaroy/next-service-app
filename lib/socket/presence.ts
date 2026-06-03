type SocketRegistry = Map<string, Set<string>>;

const globalScope = globalThis as typeof globalThis & {
  __chatSocketRegistry?: SocketRegistry;
};

const registry: SocketRegistry = globalScope.__chatSocketRegistry ?? new Map<string, Set<string>>();

if (!globalScope.__chatSocketRegistry) {
  globalScope.__chatSocketRegistry = registry;
}

export function addSocket(userId: string, socketId: string): number {
  const existing = registry.get(userId) ?? new Set<string>();
  existing.add(socketId);
  registry.set(userId, existing);
  return existing.size;
}

export function removeSocket(userId: string, socketId: string): number {
  const existing = registry.get(userId);
  if (!existing) return 0;

  existing.delete(socketId);
  if (existing.size === 0) {
    registry.delete(userId);
    return 0;
  }

  registry.set(userId, existing);
  return existing.size;
}

export function getSockets(userId: string): string[] {
  return [...(registry.get(userId) ?? new Set<string>())];
}

export function isOnline(userId: string): boolean {
  return (registry.get(userId)?.size ?? 0) > 0;
}

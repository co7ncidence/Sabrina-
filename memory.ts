interface Message {
  role: "user" | "assistant";
  content: string;
  authorName: string;
  timestamp: number;
}

const channelHistory = new Map<string, Message[]>();
const MAX_HISTORY = 30;
const MAX_AGE_MS = 1000 * 60 * 60;

export function addMessage(
  channelId: string,
  role: "user" | "assistant",
  content: string,
  authorName: string,
): void {
  if (!channelHistory.has(channelId)) {
    channelHistory.set(channelId, []);
  }
  const history = channelHistory.get(channelId)!;
  history.push({ role, content, authorName, timestamp: Date.now() });
  if (history.length > MAX_HISTORY) {
    history.splice(0, history.length - MAX_HISTORY);
  }
}

export function getHistory(
  channelId: string,
): Array<{ role: "user" | "assistant"; content: string }> {
  const history = channelHistory.get(channelId) ?? [];
  const cutoff = Date.now() - MAX_AGE_MS;
  const recent = history.filter((m) => m.timestamp > cutoff);

  return recent.map((m) => ({
    role: m.role,
    content: m.role === "user" ? `${m.authorName}: ${m.content}` : m.content,
  }));
}

export function clearHistory(channelId: string): void {
  channelHistory.delete(channelId);
}

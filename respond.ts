import { SYSTEM_PROMPT } from "./personality.js";
import { addMessage, getHistory } from "./memory.js";
import { buildMemoryContext } from "./memberMemory.js";
import { extractAndStoreMemories } from "./extractMemories.js";
import { logger } from "../lib/logger.js";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const MODEL = "openai/gpt-oss-20b:free";

const EXTRACT_EVERY_N = 5;
let messagesSinceExtract = 0;
const recentSnippetLines: string[] = [];

async function openrouterChat(
  messages: { role: string; content: string }[],
  maxTokens = 300,
): Promise<string> {
  const apiKey = process.env["OPENROUTER_API_KEY"];
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");

  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, messages }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`OpenRouter error ${res.status}: ${text}`);
  }

  const data = await res.json() as {
    choices?: { message?: { content?: string } }[];
  };

  return data.choices?.[0]?.message?.content?.trim() ?? "lol";
}

export { openrouterChat };

export async function generateReply(
  channelId: string,
  authorName: string,
  messageContent: string,
): Promise<string> {
  addMessage(channelId, "user", messageContent, authorName);

  recentSnippetLines.push(`${authorName}: ${messageContent}`);
  if (recentSnippetLines.length > 20) recentSnippetLines.shift();

  const history = getHistory(channelId);

  const activeMemberNames = [
    ...new Set(
      recentSnippetLines
        .map((l) => l.split(":")[0]?.trim())
        .filter((n): n is string => !!n && n !== "bot"),
    ),
  ];

  const memoryContext = buildMemoryContext(activeMemberNames);
  const systemPrompt = SYSTEM_PROMPT + memoryContext;

  let reply: string;
  try {
    reply = await openrouterChat(
      [
        { role: "system", content: systemPrompt },
        ...history,
      ],
      300,
    );
  } catch (err) {
    logger.error({ err }, "OpenRouter chat failed");
    reply = "lol";
  }

  addMessage(channelId, "assistant", reply, "bot");

  messagesSinceExtract++;
  if (messagesSinceExtract >= EXTRACT_EVERY_N) {
    messagesSinceExtract = 0;
    const snippet = recentSnippetLines.join("\n");
    extractAndStoreMemories(snippet).catch(() => {});
  }

  return reply;
}

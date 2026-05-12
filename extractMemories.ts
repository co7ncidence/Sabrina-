import { addMemory } from "./memberMemory.js";
import { logger } from "../lib/logger.js";
import { openrouterChat } from "./respond.js";

interface ExtractedMemory {
  member: string;
  memory: string;
}

const EXTRACT_PROMPT = `You are reading a Discord chat snippet from a friend group server. Your job is to extract any noteworthy, funny, embarrassing, or memorable facts about specific named people in the conversation.

Rules:
- Only extract things that are genuinely notable: embarrassing moments, funny fails, things they got wrong, wins, losses, personal quirks revealed, roast-worthy moments, strong opinions stated, or anything the group would remember and reference later.
- Do NOT extract generic or boring info (e.g. "John said hi", "Sarah likes pizza").
- Each memory should be a short, punchy, third-person fact like: "tripped and fell at the mall", "confidently said the wrong answer and doubled down", "lost 3 games in a row and rage quit".
- Only include real named people from the conversation. Ignore "bot" or unnamed speakers.
- If nothing noteworthy happened, return an empty array.

Respond ONLY with a valid JSON array of objects: [{"member": "name", "memory": "short punchy fact"}, ...]
If nothing to extract, respond with: []`;

export async function extractAndStoreMemories(
  conversationSnippet: string,
): Promise<void> {
  if (!conversationSnippet.trim()) return;

  try {
    const raw = await openrouterChat(
      [
        { role: "system", content: EXTRACT_PROMPT },
        { role: "user", content: conversationSnippet },
      ],
      400,
    );

    let extracted: ExtractedMemory[] = [];
    try {
      extracted = JSON.parse(raw) as ExtractedMemory[];
    } catch {
      return;
    }

    if (!Array.isArray(extracted)) return;

    for (const item of extracted) {
      if (
        typeof item.member === "string" &&
        typeof item.memory === "string" &&
        item.member.trim() &&
        item.memory.trim()
      ) {
        addMemory(item.member.trim(), item.memory.trim());
      }
    }
  } catch (err) {
    logger.error({ err }, "Memory extraction failed");
  }
}

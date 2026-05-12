import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { logger } from "../lib/logger.js";

const DATA_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "data",
);
const MEMORY_FILE = join(DATA_DIR, "member-memories.json");
const MAX_MEMORIES_PER_MEMBER = 20;

type MemberMemories = Record<string, string[]>;

function load(): MemberMemories {
  try {
    if (!existsSync(MEMORY_FILE)) return {};
    return JSON.parse(readFileSync(MEMORY_FILE, "utf8")) as MemberMemories;
  } catch {
    return {};
  }
}

function save(data: MemberMemories): void {
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(MEMORY_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    logger.error({ err }, "Failed to save member memories");
  }
}

export function addMemory(memberName: string, memory: string): void {
  const data = load();
  if (!data[memberName]) data[memberName] = [];
  if (data[memberName].includes(memory)) return;
  data[memberName].unshift(memory);
  if (data[memberName].length > MAX_MEMORIES_PER_MEMBER) {
    data[memberName] = data[memberName].slice(0, MAX_MEMORIES_PER_MEMBER);
  }
  save(data);
  logger.info({ memberName, memory }, "Stored new member memory");
}

export function getMemories(memberName: string): string[] {
  const data = load();
  return data[memberName] ?? [];
}

export function getAllMemories(): MemberMemories {
  return load();
}

export function buildMemoryContext(activeMemberNames: string[]): string {
  const data = load();
  const lines: string[] = [];

  for (const name of activeMemberNames) {
    const memories = data[name];
    if (memories && memories.length > 0) {
      lines.push(`${name}: ${memories.slice(0, 5).join(" | ")}`);
    }
  }

  if (lines.length === 0) return "";
  return `\n\nThings you remember about people in this server:\n${lines.join("\n")}\nFeel free to bring these up naturally when relevant — especially to clown on people.`;
}

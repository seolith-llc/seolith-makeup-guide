#!/usr/bin/env node
// Claude Code hook: saves every user prompt and the assistant's response into
// docs/prompts-history/<timestamp>-<slug>.md
//
// Wired up in .claude/settings.json for the UserPromptSubmit and Stop events.
// Reads the hook payload from stdin. Never throws: a failure here must not
// block the session, so every error is swallowed and logged to stderr.

import fs from 'node:fs';
import path from 'node:path';

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const historyDir = path.join(root, 'docs', 'prompts-history');
const stateFile = path.join(root, '.claude', '.prompt-history-state.json');

function readStdin() {
  try { return fs.readFileSync(0, 'utf8'); } catch { return ''; }
}

function timestamp(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function slugify(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .split('-')
    .slice(0, 6)
    .join('-') || 'prompt';
}

function readState() {
  try { return JSON.parse(fs.readFileSync(stateFile, 'utf8')); } catch { return {}; }
}

function writeState(state) {
  try { fs.mkdirSync(path.dirname(stateFile), { recursive: true }); fs.writeFileSync(stateFile, JSON.stringify(state, null, 2)); } catch {}
}

function onPromptSubmit(payload) {
  const prompt = String(payload.prompt || '').trim();
  if (!prompt) return;
  fs.mkdirSync(historyDir, { recursive: true });
  const now = new Date();
  const file = path.join(historyDir, `${timestamp(now)}-${slugify(prompt)}.md`);
  const body = [
    `# Prompt ${now.toISOString()}`,
    '',
    `- Session: \`${payload.session_id || 'unknown'}\``,
    `- Saved by: scripts/prompt-history.mjs (UserPromptSubmit hook)`,
    '',
    '## Request',
    '',
    prompt,
    '',
    '## Response',
    '',
    '_pending_',
    '',
  ].join('\n');
  fs.writeFileSync(file, body);
  const state = readState();
  state[payload.session_id || 'default'] = { file, promptAt: now.toISOString() };
  writeState(state);
}

function extractText(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content
    .filter((b) => b && b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text)
    .join('\n\n');
}

function collectResponse(transcriptPath) {
  let lines;
  try { lines = fs.readFileSync(transcriptPath, 'utf8').split('\n').filter(Boolean); } catch { return ''; }
  // Walk backwards to the last real user prompt, collecting assistant text on the way.
  const parts = [];
  for (let i = lines.length - 1; i >= 0; i--) {
    let entry;
    try { entry = JSON.parse(lines[i]); } catch { continue; }
    const msg = entry.message || {};
    if (entry.type === 'assistant') {
      const t = extractText(msg.content).trim();
      if (t) parts.unshift(t);
    } else if (entry.type === 'user') {
      // Tool results also arrive as user entries; only a plain text prompt ends the walk.
      const c = msg.content;
      const isToolResult = Array.isArray(c) && c.some((b) => b && b.type === 'tool_result');
      if (!isToolResult && !entry.isMeta) break;
    }
  }
  return parts.join('\n\n---\n\n');
}

function onStop(payload) {
  const state = readState();
  const rec = state[payload.session_id || 'default'];
  if (!rec || !rec.file || !fs.existsSync(rec.file)) return;
  const response = collectResponse(payload.transcript_path || '') || '_(no text response captured)_';
  let md = fs.readFileSync(rec.file, 'utf8');
  const marker = '## Response\n\n';
  const idx = md.indexOf(marker);
  if (idx === -1) {
    md += `\n## Response\n\n${response}\n`;
  } else {
    md = md.slice(0, idx + marker.length) + response + '\n\n' + `_Completed ${new Date().toISOString()}_\n`;
  }
  fs.writeFileSync(rec.file, md);
}

try {
  const raw = readStdin();
  const payload = raw ? JSON.parse(raw) : {};
  const event = payload.hook_event_name || process.argv[2] || '';
  if (event === 'UserPromptSubmit') onPromptSubmit(payload);
  else if (event === 'Stop') onStop(payload);
} catch (err) {
  process.stderr.write(`prompt-history hook: ${err && err.message}\n`);
}
process.exit(0);

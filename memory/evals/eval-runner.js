#!/usr/bin/env node
/**
 * Phase 1 eval runner for affective memory roadmap.
 * Runs structural reliability checks and logs failures.
 * Called by heartbeat skill weekly or manually.
 *
 * Usage: node memory/evals/eval-runner.js
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

const HOME = os.homedir();
const AEON_DIR = path.join(HOME, "aeon");
const VAULT = path.join(HOME, "OneDrive", "Documents", "Agentic knowledge");
const FAILURES_PATH = path.join(AEON_DIR, "memory", "failures.jsonl");
const SUITE_PATH = path.join(AEON_DIR, "memory", "evals", "suite.json");
const TODAY = new Date().toISOString().slice(0, 10);

function logFailure(id, message, tags = []) {
  const entry = {
    timestamp: new Date().toISOString(),
    evalId: id,
    message,
    tags,
  };
  fs.appendFileSync(FAILURES_PATH, JSON.stringify(entry) + "\n");
  console.log(`FAIL: ${id} — ${message}`);
}

function checkMemorySync() {
  const obsidianMemory = path.join(VAULT, "Memory");
  if (!fs.existsSync(obsidianMemory)) {
    logFailure("memory-sync-completes", "Obsidian Memory folder missing", ["memory", "sync"]);
    return false;
  }
  const files = fs.readdirSync(obsidianMemory).filter((f) => f.endsWith(".md"));
  if (files.length === 0) {
    logFailure("memory-sync-completes", "Obsidian Memory folder empty", ["memory", "sync"]);
    return false;
  }
  console.log(`PASS: memory-sync-completes (${files.length} files)`);
  return true;
}

function checkObsidianSync() {
  const mindmap = path.join(VAULT, "MindMap.md");
  if (!fs.existsSync(mindmap)) {
    logFailure("obsidian-synced", "MindMap.md missing from vault", ["obsidian", "sync"]);
    return false;
  }
  const stat = fs.statSync(mindmap);
  const ageHours = (Date.now() - stat.mtimeMs) / 3600000;
  if (ageHours > 24) {
    logFailure("obsidian-synced", `MindMap.md is ${Math.round(ageHours)}h old (>24h)`, ["obsidian", "stale"]);
    return false;
  }
  console.log(`PASS: obsidian-synced (MindMap.md updated ${Math.round(ageHours)}h ago)`);
  return true;
}

function checkHeartbeatLogs() {
  const logsDir = path.join(AEON_DIR, "memory", "logs");
  if (!fs.existsSync(logsDir)) {
    logFailure("heartbeat-response", "No logs directory", ["heartbeat"]);
    return false;
  }
  const logs = fs.readdirSync(logsDir).filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f)).sort().reverse();
  if (logs.length === 0) {
    logFailure("heartbeat-response", "No log files found", ["heartbeat"]);
    return false;
  }
  const latest = logs[0].replace(".md", "");
  const daysAgo = Math.round((Date.now() - new Date(latest).getTime()) / 86400000);
  if (daysAgo > 7) {
    logFailure("heartbeat-response", `Latest log is ${daysAgo} days old (>${7})`, ["heartbeat", "stale"]);
    return false;
  }
  console.log(`PASS: heartbeat-response (latest log: ${latest})`);
  return true;
}

function checkSkillsIntegrity() {
  const skillsDir = path.join(AEON_DIR, "skills");
  if (!fs.existsSync(skillsDir)) {
    logFailure("identity-persists", "Skills directory missing", ["integrity"]);
    return false;
  }
  const skills = fs.readdirSync(skillsDir).filter((f) => {
    const skillFile = path.join(skillsDir, f, "SKILL.md");
    return fs.existsSync(skillFile);
  });
  if (skills.length < 30) {
    logFailure("identity-persists", `Only ${skills.length} skills found (expected 30+)`, ["integrity"]);
    return false;
  }
  console.log(`PASS: identity-persists (${skills.length} skills intact)`);
  return true;
}

function run() {
  console.log(`Eval Suite — ${TODAY}\n`);

  const results = [
    checkMemorySync(),
    checkObsidianSync(),
    checkHeartbeatLogs(),
    checkSkillsIntegrity(),
  ];

  const passed = results.filter(Boolean).length;
  const failed = results.length - passed;

  console.log(`\nResults: ${passed} passed, ${failed} failed`);

  // Log daily result to track clean weeks
  const trackingPath = path.join(AEON_DIR, "memory", "evals", "daily-results.jsonl");
  const dayResult = {
    date: TODAY,
    passed,
    failed,
    clean: failed === 0,
  };
  fs.appendFileSync(trackingPath, JSON.stringify(dayResult) + "\n");

  // Check for 2 consecutive clean weeks
  if (fs.existsSync(trackingPath)) {
    const lines = fs.readFileSync(trackingPath, "utf8").trim().split("\n").map(JSON.parse);
    const last14 = lines.slice(-14);
    if (last14.length >= 14 && last14.every((d) => d.clean)) {
      console.log("\n🎯 PHASE 1 EXIT CRITERIA MET: 14 consecutive clean days!");
    } else {
      const cleanStreak = [...last14].reverse().findIndex((d) => !d.clean);
      const streak = cleanStreak === -1 ? last14.length : cleanStreak;
      console.log(`\nClean streak: ${streak}/${14} days needed`);
    }
  }

  process.exit(failed > 0 ? 1 : 0);
}

run();

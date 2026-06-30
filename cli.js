#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  green:  '\x1b[32m',
  cyan:   '\x1b[36m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  blue:   '\x1b[34m',
};

// ─── Args ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run') || args.includes('-d');
const isForce  = args.includes('--force')   || args.includes('-f');
const isSimple = args.includes('--simple');

// ─── Wizard state ─────────────────────────────────────────────────────────────
const state = {
  step: 1,          // 1=welcome 2=agents 3=stack 4=extras 5=preview 6=summary
  stackSubStep: 0,  // 0–4 within step 3
  cursorIdx: 0,
  projectName: '',
  existingFiles: [],
  agents: new Set(),
  stack: { frontend: null, orm: null, database: null, queue: null, tenancy: null },
  extras: new Set(),
};

// ─── Step definitions ─────────────────────────────────────────────────────────
const agentOpts = [
  { value: 'claude',      label: 'Claude Code',    dest: 'CLAUDE.md',                         defaultOn: true  },
  { value: 'cursor',      label: 'Cursor',          dest: '.cursorrules',                      defaultOn: true  },
  { value: 'devin',       label: 'Devin',           dest: '.devin/rules/rules.md + AGENTS.md', defaultOn: false },
  { value: 'antigravity', label: 'Antigravity',     dest: '.antigravityrules',                 defaultOn: false },
  { value: 'codex',       label: 'Codex / Copilot', dest: '.github/copilot-instructions.md',   defaultOn: false },
];

const stackQuestions = [
  {
    key: 'frontend',
    q: 'Frontend / framework?',
    opts: [
      { value: 'Next.js App Router', label: 'Next.js App Router', tag: 'Recommended',          desc: 'full-stack React, file-based routing, RSC' },
      { value: 'React + Vite',       label: 'React + Vite',                                    desc: 'client-side SPA, fast dev server' },
      { value: 'Vue / Nuxt',         label: 'Vue / Nuxt',                                      desc: 'Vue ecosystem, SSR optional' },
      { value: 'Express / Node API', label: 'Express / Node API',                              desc: 'API-only backend, no frontend' },
      { value: null,                 label: 'Other / Skip',                                    desc: 'leave blank, fill in manually later' },
    ],
  },
  {
    key: 'orm',
    q: 'ORM / DB layer?',
    opts: [
      { value: 'Prisma ORM',     label: 'Prisma',         tag: 'Recommended', desc: 'type-safe ORM, migrations, great DX' },
      { value: 'Drizzle ORM',    label: 'Drizzle ORM',                        desc: 'lightweight, SQL-first, zero overhead' },
      { value: 'Raw SQL / None', label: 'Raw SQL / None',                     desc: 'direct queries or no ORM' },
      { value: null,             label: 'Other / Skip',                       desc: 'leave blank, fill in manually later' },
    ],
  },
  {
    key: 'database',
    q: 'Primary database?',
    opts: [
      { value: 'PostgreSQL', label: 'PostgreSQL', tag: 'Recommended', desc: 'full-featured, production standard' },
      { value: 'SQLite',     label: 'SQLite',                          desc: 'embedded, great for local-first or solo projects' },
      { value: 'MySQL',      label: 'MySQL',                           desc: 'legacy or hosted DB preference' },
      { value: null,         label: 'Other / Skip',                    desc: 'leave blank, fill in manually later' },
    ],
  },
  {
    key: 'queue',
    q: 'Background queue?',
    opts: [
      { value: 'None',            label: 'None',            tag: 'Recommended for solo', desc: 'no async queue needed' },
      { value: 'BullMQ on Redis', label: 'BullMQ on Redis',                              desc: 'robust job queue, retries, scheduling' },
      { value: null,              label: 'Other / Skip',                                 desc: 'leave blank, fill in manually later' },
    ],
  },
  {
    key: 'tenancy',
    q: 'Multi-tenant project?',
    opts: [
      { value: 'Single tenant', label: 'No — single tenant', tag: 'Recommended for solo', desc: 'no tenantId filtering needed' },
      { value: 'Multi-tenant',  label: 'Yes — multi-tenant',                               desc: 'every DB query must filter by tenantId' },
    ],
  },
];

const extraOpts = [
  {
    value: 'design',
    label: 'Prism Design System',
    desc1: 'Zero-decision B2B/SaaS design language — tokens, React components,',
    desc2: '25 component specs (accordion, tabs, pagination, form controls, and more).',
    dest:  'src/design/  or  design/',
  },
  {
    value: 'guidelines',
    label: 'Engineering Guidelines',
    desc1: 'Reference playbook — Architecture, Security, Performance, API Design,',
    desc2: 'Testing, Code Quality, AI Workflow, and more (15 docs total).',
    dest:  'docs/guidelines/',
  },
];

// ─── Screen helpers ───────────────────────────────────────────────────────────
function clearScreen() {
  readline.cursorTo(process.stdout, 0, 0);
  readline.clearScreenDown(process.stdout);
}

function hr(char = '─', len = 47) { return char.repeat(len); }

function printHeader(stepLabel) {
  console.log(`\n${s.cyan}${s.bold}${hr('═')}${s.reset}`);
  console.log(`${s.cyan}${s.bold}       aayushus-skills  ·  Setup Wizard       ${s.reset}`);
  if (isDryRun) console.log(`${s.yellow}${s.bold}               [ DRY RUN MODE ]               ${s.reset}`);
  console.log(`${s.cyan}${s.bold}${hr('═')}${s.reset}`);
  if (stepLabel) console.log(`${s.dim}  ${stepLabel}${s.reset}`);
  console.log('');
}

// ─── Project detection ────────────────────────────────────────────────────────
function detectProject() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    state.projectName = pkg.name || '';
  } catch {}

  const checks = [
    { file: 'CLAUDE.md' },
    { file: '.cursorrules' },
    { file: 'AGENTS.md' },
    { file: '.antigravityrules' },
    { file: path.join('.github', 'copilot-instructions.md') },
  ];
  state.existingFiles = checks
    .filter(c => fs.existsSync(path.join(process.cwd(), c.file)))
    .map(c => c.file);
}

function agentDestFile(value) {
  return {
    claude:      'CLAUDE.md',
    cursor:      '.cursorrules',
    devin:       'AGENTS.md',
    antigravity: '.antigravityrules',
    codex:       path.join('.github', 'copilot-instructions.md'),
  }[value] || null;
}

// ─── Template rendering ───────────────────────────────────────────────────────
function applyStack(content, stack) {
  if (!stack) return content;
  let out = content;
  const { frontend, orm, database, queue, tenancy } = stack;

  if (frontend) {
    out = out.replace('[e.g., Next.js 14 App Router, React + Vite, Express, FastAPI]', frontend);
    out = out.replace('[e.g., Next.js App Router / React + Vite]', frontend);
  }
  if (orm) {
    out = out.replace('[e.g., Drizzle ORM, Prisma, SQLAlchemy, raw SQL]', orm);
    out = out.replace('[e.g., Drizzle ORM, Prisma, SQLAlchemy]', orm);
  }
  if (database) {
    out = out.replace(/\[e\.g\., PostgreSQL, SQLite, MySQL\]/g, database);
  }
  if (queue) {
    out = out.replace('[e.g., BullMQ, Celery, None/Direct Background Streaming]', queue);
    out = out.replace('[e.g., BullMQ on Redis / Celery on RabbitMQ / none]', queue);
  }
  const dbDecision = [orm, database].filter(Boolean).join(' + ');
  if (dbDecision) {
    out = out.replace('[e.g., Prisma + PostgreSQL / Drizzle + SQLite]', dbDecision);
  }
  if (tenancy === 'Single tenant') {
    out = out.replace(
      '<!-- CUSTOMIZE: Adjust tenancy rules to match your data model (multi-tenant vs single-tenant) -->',
      '<!-- Single tenant — tenantId rules below do not apply to this project -->'
    );
  }

  return out;
}

// ─── File operations ──────────────────────────────────────────────────────────
function listFilesRecursively(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...listFilesRecursively(full));
    else results.push(full);
  }
  return results;
}

function writeFile(src, dest, templateStack) {
  if (isDryRun) {
    const exists = fs.existsSync(dest);
    const note = exists ? ` ${s.red}(would overwrite)${s.reset}` : '';
    console.log(`${s.yellow}  [Dry Run] ${path.relative(process.cwd(), dest)}${note}${s.reset}`);
    return;
  }
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (fs.existsSync(dest) && !isForce) {
    console.log(`${s.yellow}  ⚠ Skipped (exists): ${path.relative(process.cwd(), dest)} — use --force to overwrite${s.reset}`);
    return;
  }
  if (templateStack) {
    const content = fs.readFileSync(src, 'utf8');
    fs.writeFileSync(dest, applyStack(content, templateStack));
  } else {
    fs.copyFileSync(src, dest);
  }
}

function writeFolder(src, dest) {
  if (isDryRun) {
    listFilesRecursively(src).forEach(f => {
      const rel = path.relative(src, f);
      const d = path.join(dest, rel);
      const note = fs.existsSync(d) ? ` ${s.red}(would overwrite)${s.reset}` : '';
      console.log(`${s.yellow}  [Dry Run] ${path.relative(process.cwd(), d)}${note}${s.reset}`);
    });
    return;
  }
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const sp = path.join(src, entry.name);
    const dp = path.join(dest, entry.name);
    if (entry.isDirectory()) writeFolder(sp, dp);
    else writeFile(sp, dp);
  }
}

// ─── Step 1 — Welcome ─────────────────────────────────────────────────────────
function renderStep1() {
  clearScreen();
  printHeader(null);
  console.log(`  Welcome! This wizard configures your project's AI agents`);
  console.log(`  and installs the components you need.\n`);

  if (state.projectName) {
    console.log(`  ${s.green}Detected project:${s.reset}  ${s.bold}${state.projectName}${s.reset}`);
  }
  if (state.existingFiles.length > 0) {
    console.log(`  ${s.yellow}Existing files:${s.reset}  ${state.existingFiles.join(', ')}`);
    console.log(`  ${s.dim}These will be skipped unless you run with --force${s.reset}`);
  }
  console.log(`\n  ${s.dim}Press Enter to begin  ·  q to quit${s.reset}\n`);
}

function handleStep1Key(key) {
  if (key.name === 'q') { console.log('\n  Cancelled.\n'); process.exit(0); }
  if (key.name === 'return' || key.name === 'enter') {
    agentOpts.forEach(opt => {
      const dest = agentDestFile(opt.value);
      if (dest && fs.existsSync(path.join(process.cwd(), dest))) {
        state.agents.add(opt.value);
      } else if (opt.defaultOn) {
        state.agents.add(opt.value);
      }
    });
    state.step = 2;
    state.cursorIdx = 0;
    renderStep2();
  }
}

// ─── Step 2 — Agent selection ─────────────────────────────────────────────────
function renderStep2() {
  clearScreen();
  printHeader('Step 1 of 5  ·  Agent rules');
  console.log(`  ${s.bold}Which AI agents do you use in this project?${s.reset}`);
  console.log(`  ${s.dim}↑/↓ navigate  ·  space toggle  ·  enter continue  ·  b back${s.reset}\n`);

  agentOpts.forEach((opt, i) => {
    const cur     = i === state.cursorIdx;
    const checked = state.agents.has(opt.value);
    const box     = checked ? `[${s.green}x${s.reset}]` : '[ ]';
    const prefix  = cur ? `${s.cyan}❯ ` : '  ';
    const label   = cur ? `${s.cyan}${s.bold}${opt.label}${s.reset}` : opt.label;
    const dest    = `${s.dim}→ ${opt.dest}${s.reset}`;
    console.log(`${prefix}${box} ${label.padEnd(cur ? label.length : 14)}  ${dest}`);
  });
  console.log('');
}

function handleStep2Key(key) {
  const n = agentOpts.length;
  if (key.name === 'up')    { state.cursorIdx = (state.cursorIdx - 1 + n) % n; renderStep2(); return; }
  if (key.name === 'down')  { state.cursorIdx = (state.cursorIdx + 1) % n;     renderStep2(); return; }
  if (key.name === 'space') {
    const v = agentOpts[state.cursorIdx].value;
    state.agents.has(v) ? state.agents.delete(v) : state.agents.add(v);
    renderStep2();
    return;
  }
  if (key.name === 'b') { state.step = 1; renderStep1(); return; }
  if (key.name === 'q') { console.log('\n  Cancelled.\n'); process.exit(0); }
  if (key.name === 'return' || key.name === 'enter') {
    state.cursorIdx = 0;
    if (state.agents.size > 0) {
      state.step = 3; state.stackSubStep = 0; renderStep3();
    } else {
      state.step = 4; renderStep4();
    }
  }
}

// ─── Step 3 — Stack questions (5 sub-steps) ───────────────────────────────────
function renderStep3() {
  const q = stackQuestions[state.stackSubStep];
  clearScreen();
  printHeader(`Step 2 of 5  ·  Stack  ·  Question ${state.stackSubStep + 1} of ${stackQuestions.length}`);
  console.log(`  ${s.bold}${q.q}${s.reset}`);
  console.log(`  ${s.dim}↑/↓ navigate  ·  enter select  ·  b back${s.reset}\n`);

  q.opts.forEach((opt, i) => {
    const cur    = i === state.cursorIdx;
    const prefix = cur ? `${s.cyan}❯ ` : '  ';
    const label  = cur ? `${s.cyan}${s.bold}${opt.label}${s.reset}` : `${s.bold}${opt.label}${s.reset}`;
    const tag    = opt.tag  ? ` ${s.green}(${opt.tag})${s.reset}` : '';
    const desc   = opt.desc ? `  ${s.dim}${opt.desc}${s.reset}`   : '';
    console.log(`${prefix}${label}${tag}${desc}`);
  });
  console.log('');
}

function handleStep3Key(key) {
  const q = stackQuestions[state.stackSubStep];
  const n = q.opts.length;
  if (key.name === 'up')   { state.cursorIdx = (state.cursorIdx - 1 + n) % n; renderStep3(); return; }
  if (key.name === 'down') { state.cursorIdx = (state.cursorIdx + 1) % n;     renderStep3(); return; }
  if (key.name === 'q') { console.log('\n  Cancelled.\n'); process.exit(0); }
  if (key.name === 'b') {
    if (state.stackSubStep > 0) { state.stackSubStep--; state.cursorIdx = 0; renderStep3(); }
    else { state.step = 2; state.cursorIdx = 0; renderStep2(); }
    return;
  }
  if (key.name === 'return' || key.name === 'enter') {
    state.stack[q.key] = q.opts[state.cursorIdx].value;
    state.cursorIdx = 0;
    if (state.stackSubStep < stackQuestions.length - 1) {
      state.stackSubStep++;
      renderStep3();
    } else {
      state.step = 4; renderStep4();
    }
  }
}

// ─── Step 4 — Extras ──────────────────────────────────────────────────────────
function renderStep4() {
  clearScreen();
  printHeader('Step 3 of 5  ·  Additional components');
  console.log(`  ${s.bold}Add any of these to your project?${s.reset}`);
  console.log(`  ${s.dim}↑/↓ navigate  ·  space toggle  ·  enter continue  ·  b back${s.reset}\n`);

  extraOpts.forEach((opt, i) => {
    const cur     = i === state.cursorIdx;
    const checked = state.extras.has(opt.value);
    const box     = checked ? `[${s.green}x${s.reset}]` : '[ ]';
    const prefix  = cur ? `${s.cyan}❯ ` : '  ';
    const label   = cur ? `${s.cyan}${s.bold}${opt.label}${s.reset}` : `${s.bold}${opt.label}${s.reset}`;
    console.log(`${prefix}${box} ${label}`);
    console.log(`       ${s.dim}${opt.desc1}${s.reset}`);
    console.log(`       ${s.dim}${opt.desc2}${s.reset}`);
    console.log(`       ${s.dim}Installs to: ${opt.dest}${s.reset}\n`);
  });
}

function handleStep4Key(key) {
  const n = extraOpts.length;
  if (key.name === 'up')    { state.cursorIdx = (state.cursorIdx - 1 + n) % n; renderStep4(); return; }
  if (key.name === 'down')  { state.cursorIdx = (state.cursorIdx + 1) % n;     renderStep4(); return; }
  if (key.name === 'space') {
    const v = extraOpts[state.cursorIdx].value;
    state.extras.has(v) ? state.extras.delete(v) : state.extras.add(v);
    renderStep4();
    return;
  }
  if (key.name === 'q') { console.log('\n  Cancelled.\n'); process.exit(0); }
  if (key.name === 'b') {
    state.cursorIdx = 0;
    if (state.agents.size > 0) { state.step = 3; state.stackSubStep = stackQuestions.length - 1; renderStep3(); }
    else { state.step = 2; renderStep2(); }
    return;
  }
  if (key.name === 'return' || key.name === 'enter') { state.step = 5; renderStep5(); }
}

// ─── Step 5 — Preview ────────────────────────────────────────────────────────
function buildFileList() {
  const pkgRoot   = __dirname;
  const targetRoot = process.cwd();
  const hasStack  = Object.values(state.stack).some(v => v !== null);
  const files = [];

  if (state.agents.has('claude')) {
    files.push({ label: 'CLAUDE.md', dest: path.join(targetRoot, 'CLAUDE.md'), note: hasStack ? 'configured with your stack' : null });
  }
  if (state.agents.has('cursor')) {
    files.push({ label: '.cursorrules', dest: path.join(targetRoot, '.cursorrules'), note: hasStack ? 'configured with your stack' : null });
  }
  if (state.agents.has('devin')) {
    files.push({ label: '.devin/rules/rules.md', dest: path.join(targetRoot, '.devin', 'rules', 'rules.md'), note: hasStack ? 'configured with your stack' : null });
    files.push({ label: 'AGENTS.md', dest: path.join(targetRoot, 'AGENTS.md') });
  }
  if (state.agents.has('antigravity')) {
    files.push({ label: '.antigravityrules', dest: path.join(targetRoot, '.antigravityrules') });
  }
  if (state.agents.has('codex')) {
    files.push({ label: '.github/copilot-instructions.md', dest: path.join(targetRoot, '.github', 'copilot-instructions.md') });
  }
  if (state.extras.has('design')) {
    const destDir = fs.existsSync(path.join(targetRoot, 'src'))
      ? path.join(targetRoot, 'src', 'design') : path.join(targetRoot, 'design');
    files.push({ label: `${path.relative(targetRoot, destDir)}/`, dest: destDir, isFolder: true });
  }
  if (state.extras.has('guidelines')) {
    files.push({ label: 'docs/guidelines/', dest: path.join(targetRoot, 'docs', 'guidelines'), isFolder: true });
  }
  return files;
}

function renderStep5() {
  clearScreen();
  printHeader('Step 4 of 5  ·  Preview');
  console.log(`  ${s.bold}Files that will be written:${s.reset}\n`);

  const files = buildFileList();
  if (files.length === 0) {
    console.log(`  ${s.dim}Nothing selected — go back and choose at least one option.${s.reset}\n`);
  } else {
    files.forEach(f => {
      const exists = !f.isFolder && fs.existsSync(f.dest);
      const icon   = exists ? `${s.yellow}⚠${s.reset}` : `${s.green}✓${s.reset}`;
      const note   = f.note    ? `  ${s.dim}(${f.note})${s.reset}`      : '';
      const warn   = exists    ? `  ${s.yellow}will overwrite${s.reset}` : '';
      console.log(`  ${icon}  ${f.label}${note}${warn}`);
    });

    const skips = files.filter(f => !f.isFolder && fs.existsSync(f.dest));
    if (skips.length > 0 && !isForce) {
      console.log(`\n  ${s.dim}⚠ items above will be skipped. Use --force to overwrite.${s.reset}`);
    }
  }

  console.log(`\n  ${s.dim}[Enter] continue  ·  [b] back  ·  [q] quit${s.reset}\n`);
}

function handleStep5Key(key) {
  if (key.name === 'b') { state.step = 4; state.cursorIdx = 0; renderStep4(); return; }
  if (key.name === 'q') { console.log('\n  Cancelled.\n'); process.exit(0); }
  if (key.name === 'return' || key.name === 'enter') { state.step = 6; renderStep6(); }
}

// ─── Step 6 — Summary + Confirm ───────────────────────────────────────────────
function renderStep6() {
  clearScreen();
  printHeader('Step 5 of 5  ·  Summary');
  console.log(`  ${s.bold}Review your setup before installing:${s.reset}`);
  console.log(`  ${s.dim}${hr('─', 45)}${s.reset}\n`);

  if (state.projectName) {
    console.log(`  ${s.dim}Project${s.reset}   ${s.bold}${state.projectName}${s.reset}\n`);
  }

  if (state.agents.size > 0) {
    console.log(`  ${s.bold}Agent rules${s.reset}`);
    agentOpts.filter(o => state.agents.has(o.value)).forEach(o => {
      console.log(`  ${s.green}✓${s.reset}  ${o.label.padEnd(16)} ${s.dim}→ ${o.dest}${s.reset}`);
    });
    console.log('');
  }

  const hasStack = Object.values(state.stack).some(v => v !== null);
  if (hasStack) {
    console.log(`  ${s.bold}Stack${s.reset}  ${s.dim}(written into your agent rules)${s.reset}`);
    const labels = { frontend: 'Framework', orm: 'ORM', database: 'Database', queue: 'Queue', tenancy: 'Tenancy' };
    Object.entries(state.stack).forEach(([k, v]) => {
      if (v) console.log(`  ${s.dim}${labels[k].padEnd(10)}${s.reset}  ${v}`);
      else   console.log(`  ${s.dim}${labels[k].padEnd(10)}  — (skipped)${s.reset}`);
    });
    console.log('');
  }

  console.log(`  ${s.bold}Additional components${s.reset}`);
  extraOpts.forEach(o => {
    const sel  = state.extras.has(o.value);
    const icon = sel ? `${s.green}✓${s.reset}` : `${s.dim}✗${s.reset}`;
    const label = sel ? o.label : `${s.dim}${o.label}  (not selected)${s.reset}`;
    console.log(`  ${icon}  ${label}`);
  });

  const totalFiles = buildFileList().length;
  console.log(`\n  ${s.dim}${hr('─', 45)}${s.reset}`);
  console.log(`  ${s.dim}${totalFiles} file${totalFiles !== 1 ? 's' : ''} will be written${isDryRun ? ' (dry run — nothing modified)' : ''}.${s.reset}`);
  console.log(`\n  ${s.bold}[Enter]${s.reset} Install now   ${s.bold}[b]${s.reset} Go back   ${s.bold}[q]${s.reset} Quit\n`);
}

function handleStep6Key(key) {
  if (key.name === 'b') { state.step = 5; renderStep5(); return; }
  if (key.name === 'q') { console.log('\n  Cancelled.\n'); process.exit(0); }
  if (key.name === 'return' || key.name === 'enter') {
    if (process.stdin.isTTY) process.stdin.setRawMode(false);
    runWizardInstallation();
  }
}

// ─── Wizard installation ──────────────────────────────────────────────────────
function runWizardInstallation() {
  clearScreen();
  console.log(`\n${s.yellow}${s.bold}  ${isDryRun ? 'Dry run simulation' : 'Installing...'}${s.reset}\n`);

  const pkgRoot    = __dirname;
  const targetRoot = process.cwd();
  const agentDir   = path.join(pkgRoot, 'agent-config');
  const hasStack   = Object.values(state.stack).some(v => v !== null);
  const stack      = hasStack ? state.stack : null;

  if (!fs.existsSync(agentDir) && state.agents.size > 0) {
    console.log(`${s.red}  ✗ agent-config directory not found — agent configs skipped.${s.reset}`);
  } else {
    const rulesFile   = path.join(agentDir, 'rules.md');
    const claudeFile  = path.join(agentDir, 'CLAUDE.md');
    const copilotFile = path.join(agentDir, 'copilot-instructions.md');

    if (state.agents.has('claude')) {
      console.log(`${s.blue}  Configuring Claude (CLAUDE.md)...${s.reset}`);
      writeFile(claudeFile, path.join(targetRoot, 'CLAUDE.md'), stack);
    }
    if (state.agents.has('cursor')) {
      console.log(`${s.blue}  Configuring Cursor (.cursorrules)...${s.reset}`);
      writeFile(rulesFile, path.join(targetRoot, '.cursorrules'), stack);
    }
    if (state.agents.has('devin')) {
      console.log(`${s.blue}  Configuring Devin rules...${s.reset}`);
      writeFile(rulesFile, path.join(targetRoot, '.devin', 'rules', 'rules.md'), stack);
      writeFile(rulesFile, path.join(targetRoot, 'AGENTS.md'), stack);
    }
    if (state.agents.has('antigravity')) {
      console.log(`${s.blue}  Configuring Antigravity rules...${s.reset}`);
      writeFile(rulesFile, path.join(targetRoot, '.antigravityrules'), stack);
    }
    if (state.agents.has('codex')) {
      console.log(`${s.blue}  Configuring Codex/Copilot rules...${s.reset}`);
      writeFile(copilotFile, path.join(targetRoot, '.github', 'copilot-instructions.md'));
    }
  }

  if (state.extras.has('design')) {
    const srcDir  = path.join(pkgRoot, 'design');
    const destDir = fs.existsSync(path.join(targetRoot, 'src'))
      ? path.join(targetRoot, 'src', 'design') : path.join(targetRoot, 'design');
    console.log(`${s.blue}  Installing Prism Design System...${s.reset}`);
    if (fs.existsSync(srcDir)) {
      writeFolder(srcDir, destDir);
      if (!isDryRun) console.log(`${s.green}  ✓ Installed to ${path.relative(targetRoot, destDir)}/${s.reset}`);
    } else {
      console.log(`${s.red}  ✗ Source design directory not found.${s.reset}`);
    }
  }

  if (state.extras.has('guidelines')) {
    const srcDir  = path.join(pkgRoot, 'guidelines');
    const destDir = path.join(targetRoot, 'docs', 'guidelines');
    console.log(`${s.blue}  Installing Engineering Guidelines...${s.reset}`);
    if (fs.existsSync(srcDir)) {
      writeFolder(srcDir, destDir);
      if (!isDryRun) console.log(`${s.green}  ✓ Installed to docs/guidelines/${s.reset}`);
    } else {
      console.log(`${s.red}  ✗ Source guidelines directory not found.${s.reset}`);
    }
  }

  console.log(`\n${s.green}${s.bold}  ${isDryRun ? '✓ Dry run complete — no files were modified.' : '✓ Setup complete!'}${s.reset}\n`);
  process.exit(0);
}

// ─── Key dispatch ─────────────────────────────────────────────────────────────
function handleKey(key) {
  switch (state.step) {
    case 1: handleStep1Key(key); break;
    case 2: handleStep2Key(key); break;
    case 3: handleStep3Key(key); break;
    case 4: handleStep4Key(key); break;
    case 5: handleStep5Key(key); break;
    case 6: handleStep6Key(key); break;
  }
}

// ─── Legacy simple menu (--simple flag) ───────────────────────────────────────
const simpleOptions = [
  { name: 'Antigravity Rules (.antigravityrules)',               value: 'antigravity', checked: true  },
  { name: 'Devin Rules (.devin/rules/rules.md & AGENTS.md)',     value: 'devin',       checked: true  },
  { name: 'Cursor Rules (.cursorrules)',                          value: 'cursor',      checked: true  },
  { name: 'Claude Rules (CLAUDE.md)',                            value: 'claude',      checked: true  },
  { name: 'Codex/Copilot Rules (.github/copilot-instructions.md)', value: 'codex',    checked: true  },
  { name: 'Prism Design System (tokens, components CSS/TSX)',                  value: 'design',      checked: false },
  { name: 'Engineering Guidelines (Architecture, Security, AI Workflow...)',  value: 'guidelines',  checked: false },
];
let simpleCursorIdx = 0;

function printSimpleMenu() {
  readline.cursorTo(process.stdout, 0, 0);
  readline.clearScreenDown(process.stdout);
  console.log(`\n${s.cyan}${s.bold}=========================================${s.reset}`);
  console.log(`${s.cyan}${s.bold}      aayushus-skills CLI Installer      ${s.reset}`);
  if (isDryRun) console.log(`${s.yellow}${s.bold}             [ DRY RUN MODE ]            ${s.reset}`);
  console.log(`${s.cyan}${s.bold}=========================================${s.reset}\n`);
  console.log(`${s.dim}↑/↓ navigate  ·  space toggle  ·  enter install${s.reset}\n`);
  simpleOptions.forEach((opt, idx) => {
    const cur     = idx === simpleCursorIdx;
    const checkbox = opt.checked ? `[${s.green}x${s.reset}]` : '[ ]';
    const prefix   = cur ? `${s.cyan}❯ ` : '  ';
    const label    = cur ? `${s.cyan}${s.bold}${opt.name}${s.reset}` : opt.name;
    console.log(`${prefix}${checkbox} ${label}`);
  });
  console.log('\n');
}

function runSimpleInstallation() {
  const modeText = isDryRun ? 'Dry run simulation' : 'Installation';
  console.log(`\n${s.yellow}Starting ${modeText}...${s.reset}\n`);

  const pkgRoot    = __dirname;
  const targetRoot = process.cwd();
  const selected   = simpleOptions.filter(o => o.checked).map(o => o.value);

  if (selected.length === 0) {
    console.log(`${s.red}No options selected. Aborting.${s.reset}\n`);
    process.exit(0);
  }

  const agentDir       = path.join(pkgRoot, 'agent-config');
  const hasAgentConfigs = fs.existsSync(agentDir);
  const agentKeys      = ['antigravity', 'devin', 'cursor', 'claude', 'codex'];
  const wantsAgent     = agentKeys.some(v => selected.includes(v));

  if (wantsAgent && !hasAgentConfigs) {
    console.log(`${s.red}  ✗ agent-config directory not found. Agent configs will be skipped.${s.reset}`);
  }

  if (hasAgentConfigs) {
    const rulesFile   = path.join(agentDir, 'rules.md');
    const claudeFile  = path.join(agentDir, 'CLAUDE.md');
    const copilotFile = path.join(agentDir, 'copilot-instructions.md');

    if (selected.includes('antigravity')) { console.log(`${s.blue} Configuring Antigravity rules...${s.reset}`);   writeFile(rulesFile,   path.join(targetRoot, '.antigravityrules')); }
    if (selected.includes('devin'))       { console.log(`${s.blue} Configuring Devin rules...${s.reset}`);         writeFile(rulesFile,   path.join(targetRoot, '.devin', 'rules', 'rules.md')); writeFile(rulesFile, path.join(targetRoot, 'AGENTS.md')); }
    if (selected.includes('cursor'))      { console.log(`${s.blue} Configuring Cursor rules...${s.reset}`);        writeFile(rulesFile,   path.join(targetRoot, '.cursorrules')); }
    if (selected.includes('claude'))      { console.log(`${s.blue} Configuring Claude CLAUDE.md...${s.reset}`);    writeFile(claudeFile,  path.join(targetRoot, 'CLAUDE.md')); }
    if (selected.includes('codex'))       { console.log(`${s.blue} Configuring Codex/Copilot rules...${s.reset}`); writeFile(copilotFile, path.join(targetRoot, '.github', 'copilot-instructions.md')); }
  }

  if (selected.includes('design')) {
    const srcDir  = path.join(pkgRoot, 'design');
    const destDir = fs.existsSync(path.join(targetRoot, 'src'))
      ? path.join(targetRoot, 'src', 'design') : path.join(targetRoot, 'design');
    console.log(`${s.blue} Installing Prism Design System...${s.reset}`);
    if (fs.existsSync(srcDir)) { writeFolder(srcDir, destDir); if (!isDryRun) console.log(`${s.green}  ✓ Copied to ${path.relative(targetRoot, destDir)}${s.reset}`); }
    else console.log(`${s.red}  ✗ Source design directory not found.${s.reset}`);
  }

  if (selected.includes('guidelines')) {
    const srcDir  = path.join(pkgRoot, 'guidelines');
    const destDir = path.join(targetRoot, 'docs', 'guidelines');
    console.log(`${s.blue} Installing Engineering Guidelines...${s.reset}`);
    if (fs.existsSync(srcDir)) { writeFolder(srcDir, destDir); if (!isDryRun) console.log(`${s.green}  ✓ Copied to docs/guidelines${s.reset}`); }
    else console.log(`${s.red}  ✗ Source guidelines directory not found.${s.reset}`);
  }

  const msg = isDryRun ? '✓ Dry run complete — no files were modified.' : '✓ Installation complete!';
  console.log(`\n${s.green}${s.bold}${msg}${s.reset}\n`);
  process.exit(0);
}

// ─── Help ─────────────────────────────────────────────────────────────────────
if (args.includes('--help') || args.includes('-h') || args.includes('help')) {
  console.log(`
aayushus-skills — Setup Wizard & CLI Installer

Usage:
  npx aayushus-skills               Interactive setup wizard (default)
  npx aayushus-skills --simple      Flat checklist menu (no wizard)
  npx aayushus-skills all           Install everything directly
  npx aayushus-skills design        Install Prism Design System only
  npx aayushus-skills guidelines    Install Engineering Guidelines only
  npx aayushus-skills cursor        Install Cursor rules only
  npx aayushus-skills antigravity   Install Antigravity rules only
  npx aayushus-skills devin         Install Devin rules only
  npx aayushus-skills claude        Install Claude rules only
  npx aayushus-skills codex         Install Codex/Copilot rules only
  npx aayushus-skills copilot       Alias for codex

Flags:
  -d, --dry-run    Preview what would be installed without writing files
  -f, --force      Overwrite files that already exist
      --simple     Skip the wizard and use the flat checklist menu
  `);
  process.exit(0);
}

// ─── Direct subcommands ───────────────────────────────────────────────────────
const argMap = { antigravity: 'antigravity', devin: 'devin', cursor: 'cursor', claude: 'claude', codex: 'codex', copilot: 'codex', design: 'design', guidelines: 'guidelines' };
const directArgs = args.filter(a => a !== '--dry-run' && a !== '-d' && a !== '--force' && a !== '-f' && a !== '--simple');
const hasDirectCmd = directArgs.some(a => argMap[a] || a === 'all');

if (hasDirectCmd) {
  if (directArgs.includes('all')) simpleOptions.forEach(o => o.checked = true);
  else simpleOptions.forEach(o => { o.checked = directArgs.some(a => argMap[a] === o.value); });
  runSimpleInstallation();
  process.exit(0);
}

// ─── Non-interactive (CI/pipe) ────────────────────────────────────────────────
if (!process.stdin.isTTY) {
  console.log('Non-interactive environment detected. Installing all components...');
  simpleOptions.forEach(o => o.checked = true);
  runSimpleInstallation();
  process.exit(0);
}

// ─── Simple menu (--simple flag) ──────────────────────────────────────────────
if (isSimple) {
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  printSimpleMenu();
  process.stdin.on('keypress', (str, key) => {
    if (key.ctrl && key.name === 'c') { console.log('\nCancelled.'); process.exit(0); }
    const n = simpleOptions.length;
    if (key.name === 'up')    { simpleCursorIdx = (simpleCursorIdx - 1 + n) % n; printSimpleMenu(); return; }
    if (key.name === 'down')  { simpleCursorIdx = (simpleCursorIdx + 1) % n;     printSimpleMenu(); return; }
    if (key.name === 'space') { simpleOptions[simpleCursorIdx].checked = !simpleOptions[simpleCursorIdx].checked; printSimpleMenu(); return; }
    if (key.name === 'return' || key.name === 'enter') { process.stdin.setRawMode(false); runSimpleInstallation(); }
  });
  // event listener keeps process alive — no process.exit here
}

// ─── Wizard (default) ─────────────────────────────────────────────────────────
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

detectProject();
renderStep1();

process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') { console.log('\n  Cancelled.\n'); process.exit(0); }
  handleKey(key);
});

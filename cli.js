#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ANSI escape codes for styling
const styles = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  inverse: '\x1b[7m'
};

const options = [
  { name: 'AI Agent Configurations (rules files, CLAUDE.md, etc.)', value: 'agent-config', checked: true },
  { name: 'Prism Design System (tokens, components CSS/TSX)', value: 'design', checked: true },
  { name: 'Development Guidelines (Architecture, Quality, Security)', value: 'guidelines', checked: true },
  { name: 'Solo Developer AI SOP (Standard Operating Procedure)', value: 'sop', checked: true }
];

const toolOptions = [
  { name: 'Antigravity (.antigravityrules)', value: 'antigravity', checked: true },
  { name: 'Devin (.devin/rules/rules.md & AGENTS.md)', value: 'devin', checked: true },
  { name: 'Cursor (.cursorrules)', value: 'cursor', checked: true },
  { name: 'Claude (CLAUDE.md)', value: 'claude', checked: true },
  { name: 'Codex/Copilot (.github/copilot-instructions.md)', value: 'codex', checked: true }
];

let currentStep = 0; // 0 = Component selection, 1 = AI Tool selection
let cursorIndex = 0;

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run') || args.includes('-d');

function printMenu() {
  readline.cursorTo(process.stdout, 0, 0);
  readline.clearScreenDown(process.stdout);

  console.log(`\n${styles.cyan}${styles.bold}=========================================${styles.reset}`);
  console.log(`${styles.cyan}${styles.bold}      aayushus-skills CLI Installer      ${styles.reset}`);
  if (isDryRun) {
    console.log(`${styles.yellow}${styles.bold}             [ DRY RUN MODE ]            ${styles.reset}`);
  }
  console.log(`${styles.cyan}${styles.bold}=========================================${styles.reset}\n`);

  if (currentStep === 0) {
    console.log(`${styles.dim}Step 1: What would you like to install?${styles.reset}`);
    console.log(`${styles.dim}Use ${styles.bold}↑/↓${styles.reset}${styles.dim} to navigate, ${styles.bold}space${styles.reset}${styles.dim} to toggle, and ${styles.bold}enter${styles.reset}${styles.dim} to continue.\n${styles.reset}`);

    options.forEach((opt, idx) => {
      const isCursor = idx === cursorIndex;
      const checkbox = opt.checked ? `[${styles.green}x${styles.reset}]` : '[ ]';
      const prefix = isCursor ? `${styles.cyan}❯ ` : '  ';
      const styledName = isCursor ? `${styles.cyan}${styles.bold}${opt.name}${styles.reset}` : opt.name;
      console.log(`${prefix}${checkbox} ${styledName}`);
    });
  } else {
    console.log(`${styles.dim}Step 2: Which AI coding tools do you use?${styles.reset}`);
    console.log(`${styles.dim}Use ${styles.bold}↑/↓${styles.reset}${styles.dim} to navigate, ${styles.bold}space${styles.reset}${styles.dim} to toggle, and ${styles.bold}enter${styles.reset}${styles.dim} to install.\n${styles.reset}`);

    toolOptions.forEach((opt, idx) => {
      const isCursor = idx === cursorIndex;
      const checkbox = opt.checked ? `[${styles.green}x${styles.reset}]` : '[ ]';
      const prefix = isCursor ? `${styles.cyan}❯ ` : '  ';
      const styledName = isCursor ? `${styles.cyan}${styles.bold}${opt.name}${styles.reset}` : opt.name;
      console.log(`${prefix}${checkbox} ${styledName}`);
    });
  }

  console.log('\n');
}

function copyFileSync(src, dest) {
  if (isDryRun) {
    console.log(`${styles.yellow}[Dry Run] Would copy: ${path.basename(src)} -> ${path.relative(process.cwd(), dest)}${styles.reset}`);
    return;
  }
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

function copyFolderSync(src, dest) {
  if (isDryRun) {
    console.log(`${styles.yellow}[Dry Run] Would copy folder: ${path.basename(src)}/ -> ${path.relative(process.cwd(), dest)}/${styles.reset}`);
    return;
  }
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyFolderSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function runInstallation() {
  const modeText = isDryRun ? 'Dry run simulation' : 'Installation';
  console.log(`\n${styles.yellow}Starting ${modeText}...${styles.reset}\n`);

  const packageRoot = __dirname;
  const targetRoot = process.cwd();

  const selected = options.filter(opt => opt.checked).map(opt => opt.value);
  const selectedTools = toolOptions.filter(opt => opt.checked).map(opt => opt.value);

  if (selected.length === 0) {
    console.log(`${styles.red}No options selected. Aborting.${styles.reset}\n`);
    process.exit(0);
  }

  // 1. Agent Configs
  if (selected.includes('agent-config')) {
    console.log(`${styles.blue} Installing AI Agent Configurations...${styles.reset}`);
    const srcAgentDir = path.join(packageRoot, 'agent-config');

    if (fs.existsSync(srcAgentDir)) {
      const genericRulesFile = path.join(srcAgentDir, 'rules.md');
      const claudeFile = path.join(srcAgentDir, 'CLAUDE.md');
      const copilotFile = path.join(srcAgentDir, 'copilot-instructions.md');

      if (selectedTools.includes('antigravity')) {
        copyFileSync(genericRulesFile, path.join(targetRoot, '.antigravityrules'));
      }
      if (selectedTools.includes('devin')) {
        copyFileSync(genericRulesFile, path.join(targetRoot, '.devin', 'rules', 'rules.md'));
        copyFileSync(genericRulesFile, path.join(targetRoot, 'AGENTS.md'));
      }
      if (selectedTools.includes('cursor')) {
        copyFileSync(genericRulesFile, path.join(targetRoot, '.cursorrules'));
      }
      if (selectedTools.includes('claude')) {
        copyFileSync(claudeFile, path.join(targetRoot, 'CLAUDE.md'));
      }
      if (selectedTools.includes('codex')) {
        copyFileSync(copilotFile, path.join(targetRoot, '.github', 'copilot-instructions.md'));
      }

      console.log(`${styles.green}  ✓ Configured selected AI rules files.${styles.reset}`);
    } else {
      console.log(`${styles.red}  ✗ Source agent-config directory not found.${styles.reset}`);
    }
  }

  // 2. Design System
  if (selected.includes('design')) {
    console.log(`${styles.blue} Installing Prism Design System...${styles.reset}`);
    const srcDesignDir = path.join(packageRoot, 'design');
    const destDesignDir = fs.existsSync(path.join(targetRoot, 'src')) 
      ? path.join(targetRoot, 'src', 'design') 
      : path.join(targetRoot, 'design');

    if (fs.existsSync(srcDesignDir)) {
      copyFolderSync(srcDesignDir, destDesignDir);
      console.log(`${styles.green}  ✓ Copied Prism Design System to ${path.relative(targetRoot, destDesignDir)}${styles.reset}`);
    } else {
      console.log(`${styles.red}  ✗ Source design directory not found.${styles.reset}`);
    }
  }

  // 3. Development Guidelines
  if (selected.includes('guidelines')) {
    console.log(`${styles.blue} Installing Development Guidelines...${styles.reset}`);
    const srcGuidelinesDir = path.join(packageRoot, 'guidelines');
    const destGuidelinesDir = path.join(targetRoot, 'docs', 'guidelines');

    if (fs.existsSync(srcGuidelinesDir)) {
      copyFolderSync(srcGuidelinesDir, destGuidelinesDir);
      console.log(`${styles.green}  ✓ Copied Development Guidelines to ${path.relative(targetRoot, destGuidelinesDir)}${styles.reset}`);
    } else {
      console.log(`${styles.red}  ✗ Source guidelines directory not found.${styles.reset}`);
    }
  }

  // 4. SOP
  if (selected.includes('sop')) {
    console.log(`${styles.blue} Installing Solo Developer AI SOP...${styles.reset}`);
    const srcSopFile = path.join(packageRoot, 'Solo Developer AI SOP.md');

    if (fs.existsSync(srcSopFile)) {
      copyFileSync(srcSopFile, path.join(targetRoot, 'Solo-Developer-AI-SOP.md'));
      console.log(`${styles.green}  ✓ Copied Solo-Developer-AI-SOP.md to project root${styles.reset}`);
    } else {
      console.log(`${styles.red}  ✗ Source Solo Developer AI SOP.md file not found.${styles.reset}`);
    }
  }

  const completeMsg = isDryRun 
    ? '✓ Dry run completed successfully! No files were modified.'
    : '✓ Installation completed successfully!';
  console.log(`\n${styles.green}${styles.bold}${completeMsg}${styles.reset}\n`);
  process.exit(0);
}

// Help documentation
if (args.includes('--help') || args.includes('-h') || args.includes('help')) {
  console.log(`
aayushus-skills CLI Installer

Usage:
  npx aayushus-skills               Interactive installation menu (default)
  npx aayushus-skills all           Install everything directly
  npx aayushus-skills design        Install Prism Design System only
  npx aayushus-skills agent-config  Install all AI Agent Configurations
  npx aayushus-skills guidelines    Install Development Guidelines only
  npx aayushus-skills sop           Install Solo Developer AI SOP only

Flags:
  -d, --dry-run                     Preview installation without making actual changes
  `);
  process.exit(0);
}

// Check for direct subcommands
const argMap = {
  'design': 'design',
  'agent-config': 'agent-config',
  'agent': 'agent-config',
  'guidelines': 'guidelines',
  'sop': 'sop'
};

const directArgs = args.filter(arg => arg !== '--dry-run' && arg !== '-d');
const hasDirectCommand = directArgs.some(arg => argMap[arg] || arg === 'all');

if (hasDirectCommand) {
  if (directArgs.includes('all')) {
    options.forEach(opt => opt.checked = true);
  } else {
    options.forEach(opt => {
      opt.checked = directArgs.some(arg => argMap[arg] === opt.value);
    });
  }
  // If non-interactive, default to configuring rules for all AI tools
  runInstallation();
}

// Start interactive CLI
if (!process.stdin.isTTY) {
  console.log('Non-interactive environment detected. Installing all components...');
  options.forEach(opt => opt.checked = true);
  runInstallation();
}

readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}

printMenu();

process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    console.log('\nInstallation cancelled.');
    process.exit(0);
  }

  const currentList = currentStep === 0 ? options : toolOptions;

  switch (key.name) {
    case 'up':
      cursorIndex = (cursorIndex - 1 + currentList.length) % currentList.length;
      printMenu();
      break;
    case 'down':
      cursorIndex = (cursorIndex + 1) % currentList.length;
      printMenu();
      break;
    case 'space':
      currentList[cursorIndex].checked = !currentList[cursorIndex].checked;
      printMenu();
      break;
    case 'return':
    case 'enter':
      if (currentStep === 0) {
        const isAgentSelected = options.find(o => o.value === 'agent-config').checked;
        if (isAgentSelected) {
          currentStep = 1;
          cursorIndex = 0;
          printMenu();
        } else {
          if (process.stdin.isTTY) {
            process.stdin.setRawMode(false);
          }
          runInstallation();
        }
      } else {
        if (process.stdin.isTTY) {
          process.stdin.setRawMode(false);
        }
        runInstallation();
      }
      break;
  }
});

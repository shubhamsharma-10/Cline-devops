#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { analyzeCommand } from './commands/analyze.js';
import { generateCommand } from './commands/generate.js';
import { validateCommand } from './commands/validate.js';

const program = new Command();

program
  .name('cline-devops')
  .description('DevOps Pipeline Generator using Cline CLI')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize DevOps configuration for your project')
  .option('-p, --path <path>', 'Project path', '.')
  .option('-i, --interactive', 'Interactive mode with Cline')
  .action(initCommand);

program
  .command('analyze')
  .description('Analyze codebase and detect technologies')
  .option('-p, --path <path>', 'Project path', '.')
  .option('--deep', 'Deep analysis using Cline AI')
  .action(analyzeCommand);

program.parse(process.argv);
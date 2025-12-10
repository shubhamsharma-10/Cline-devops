#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program
  .name('cline-devops')
  .description('DevOps Pipeline Generator using Cline CLI')
  .version('1.0.0');
  
program.parse(process.argv);
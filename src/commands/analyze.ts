import { CLINE_PROMPTS } from '../cline/prompts.js';
import { clineClient } from '../cline/cline.js';
import * as path from 'path';
import chalk from 'chalk';
import * as fs from 'fs';
import ora from 'ora';

interface ProjectAnalysis {
  languages: string[];
  frameworks: string[];
  packageManager: string;
  databases: string[];
  hasDocker: boolean;
  hasCI: boolean;
  testCommand?: string;
  buildCommand?: string;
  startCommand?: string;
}

export async function analyzeCommand(options: { path: string; deep?: boolean }) {
  const projectPath = path.resolve(options.path);
  const spinner = ora('Analyzing project...').start();

  try {
    // Quick static analysis
    const quickAnalysis = await quickAnalyze(projectPath);
    spinner.succeed('Quick analysis complete');

    console.log(chalk.cyan('\n📊 Quick Analysis Results:\n'));
    console.log(chalk.white('Languages:'), quickAnalysis.languages.join(', '));
    console.log(chalk.white('Frameworks:'), quickAnalysis.frameworks.join(', ') || 'None detected');
    console.log(chalk.white('Package Manager:'), quickAnalysis.packageManager);
    console.log(chalk.white('Databases:'), quickAnalysis.databases.join(', ') || 'None detected');
    console.log(chalk.white('Has Docker:'), quickAnalysis.hasDocker ? '✅' : '❌');
    console.log(chalk.white('Has CI/CD:'), quickAnalysis.hasCI ? '✅' : '❌');

    // Deep analysis with Cline - it is slow as compared to quick analysis
    if (options.deep) {
      spinner.start('Running deep analysis with Cline AI...');

      const response = await clineClient.sendTask(
        CLINE_PROMPTS.analyzeProject(projectPath),
        { autonomous: true, outputFormat: 'json' }
      );

      if (response.success) {
        spinner.succeed('Deep analysis complete');
        console.log(chalk.cyan('\n🤖 Cline AI Analysis:\n'));
        console.log(response.output);
      } else {
        spinner.fail('Deep analysis failed');
        console.error(chalk.red(response.output));
      }
    }

    // Save analysis to file
    const analysisPath = path.join(projectPath, '.devops-gen.json');
    fs.writeFileSync(analysisPath, JSON.stringify(quickAnalysis, null, 2));
    console.log(chalk.green(`\n✅ Analysis saved to ${analysisPath}`));

  } catch (error: any) {
    spinner.fail('Analysis failed');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

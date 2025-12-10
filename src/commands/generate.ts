import { generateGitHubActions } from '../generators/github-actions.js';
import { generateKubernetes } from '../generators/kubernetes.js';
import { generateDocker } from '../generators/gendockerfile.js';
import { analyzeCommand } from './analyze.js';
import * as path from 'path';
import chalk from 'chalk';
import * as fs from 'fs';
import ora from 'ora';

type GenerationType = 'all' | 'github-actions' | 'docker' | 'kubernetes';

export async function generateCommand(options: {
  path: string;
  type: GenerationType;
  autonomous?: boolean;
}) {
  const projectPath = path.resolve(options.path);
  const spinner = ora('Starting generation...').start();
  const generatedFiles: string[] = [];
  const errors: string[] = [];

  try {
    const analysisPath = path.join(projectPath, '.devops-gen.json');
    let analysis: string;

    if (fs.existsSync(analysisPath)) {
      analysis = fs.readFileSync(analysisPath, 'utf-8');
      spinner.succeed('Loaded existing analysis');
    } else {
      spinner.text = 'No analysis found, running analysis first...';
      await analyzeCommand({ path: options.path });
      analysis = fs.readFileSync(analysisPath, 'utf-8');
    }

    console.log(chalk.cyan('\n Generating DevOps Configurations with Cline CLI...\n'));

    const clineOptions = {
      autonomous: options.autonomous || false,
      mode: 'act' as const,
    };

    // Generate based on type
    switch (options.type) {
      case 'github-actions':
        await generateGitHubActions(projectPath, analysis, clineOptions, generatedFiles, errors);
        break;
      case 'docker':
        await generateDocker(projectPath, analysis, clineOptions, generatedFiles, errors);
        break;
      case 'kubernetes':
        await generateKubernetes(projectPath, analysis, clineOptions, generatedFiles, errors);
        break;
      case 'all':
      default:
        await generateGitHubActions(projectPath, analysis, clineOptions, generatedFiles, errors);
        await generateDocker(projectPath, analysis, clineOptions, generatedFiles, errors);
        await generateKubernetes(projectPath, analysis, clineOptions, generatedFiles, errors);
        break;
    }

    console.log(chalk.green('\n All configurations generated successfully!'));
    console.log(chalk.cyan('\nNext steps:'));
    console.log('  1. Review the generated files');
    console.log('  2. Run: cline-devops validate');
    console.log('  3. Commit and push to trigger CI/CD');

  } catch (error: any) {
    spinner.fail('Generation failed');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}
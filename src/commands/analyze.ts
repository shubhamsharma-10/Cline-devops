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

async function quickAnalyze(projectPath: string): Promise<ProjectAnalysis> {
  const analysis: ProjectAnalysis = {
    languages: [],
    frameworks: [],
    packageManager: 'unknown',
    databases: [],
    hasDocker: false,
    hasCI: false,
  };

  // Detect package.json (Node.js)
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    analysis.languages.push('JavaScript/TypeScript');
    analysis.packageManager = fs.existsSync(path.join(projectPath, 'yarn.lock'))
      ? 'yarn'
      : fs.existsSync(path.join(projectPath, 'pnpm-lock.yaml'))
        ? 'pnpm'
        : 'npm';

    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    // Detect frameworks
    if (deps['next']) analysis.frameworks.push('Next.js');
    if (deps['react']) analysis.frameworks.push('React');
    if (deps['express']) analysis.frameworks.push('Express');
    if (deps['nestjs'] || deps['@nestjs/core']) analysis.frameworks.push('NestJS');
    if (deps['vue']) analysis.frameworks.push('Vue.js');

    // Get scripts
    analysis.testCommand = pkg.scripts?.test;
    analysis.buildCommand = pkg.scripts?.build;
    analysis.startCommand = pkg.scripts?.start;
  }

  // Detect requirements.txt (Python)
  const requirementsPath = path.join(projectPath, 'requirements.txt');
  const pyprojectPath = path.join(projectPath, 'pyproject.toml');
  if (fs.existsSync(requirementsPath) || fs.existsSync(pyprojectPath)) {
    analysis.languages.push('Python');
    analysis.packageManager = fs.existsSync(pyprojectPath) ? 'poetry' : 'pip';

    if (fs.existsSync(requirementsPath)) {
      const requirements = fs.readFileSync(requirementsPath, 'utf-8');
      if (requirements.includes('django')) analysis.frameworks.push('Django');
      if (requirements.includes('fastapi')) analysis.frameworks.push('FastAPI');
      if (requirements.includes('flask')) analysis.frameworks.push('Flask');
    }
  }

  // Detect Go
  if (fs.existsSync(path.join(projectPath, 'go.mod'))) {
    analysis.languages.push('Go');
    analysis.packageManager = 'go modules';
  }

  // Detect Docker
  analysis.hasDocker = fs.existsSync(path.join(projectPath, 'Dockerfile')) ||
    fs.existsSync(path.join(projectPath, 'docker-compose.yml'));

  // Detect CI/CD
  analysis.hasCI = fs.existsSync(path.join(projectPath, '.github/workflows')) ||
    fs.existsSync(path.join(projectPath, '.gitlab-ci.yml')) ||
    fs.existsSync(path.join(projectPath, 'Jenkinsfile'));

  return analysis;
}
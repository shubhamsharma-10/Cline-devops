import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { glob } from 'glob';
import { clineClient } from '../cline/cline.js';
import { CLINE_PROMPTS } from '../cline/prompts.js';
import YAML from 'yaml';

export async function validateCommand(options: { path: string }) {
  const projectPath = path.resolve(options.path);
  const spinner = ora('Validating configurations...').start();

  const configFiles: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Find all config files
    const possibleConfigs = [
      '.github/workflows/*.yml',
      'Dockerfile',
      'docker-compose.yml',
      'k8s/*.yml',
    ];

    for (const pattern of possibleConfigs) {
      const files = glob.sync(path.join(projectPath, pattern));
      configFiles.push(...files);
    }

    spinner.succeed(`Found ${configFiles.length} configuration files`);

    // Basic YAML validation
    console.log(chalk.cyan('\n📋 Validating YAML syntax...\n'));

    let passedFiles = 0;

    for (const file of configFiles) {
      if (file.endsWith('.yml') || file.endsWith('.yaml')) {
        try {
          const content = fs.readFileSync(file, 'utf-8');
          YAML.parse(content);
          passedFiles++;
          console.log(chalk.green(`  ✓ ${path.relative(projectPath, file)}`));
        } catch (e: any) {
          errors.push(`${file}: ${e.message}`);
          console.log(chalk.red(`  ✗ ${path.relative(projectPath, file)}: ${e.message}`));
        }
      } else if (file.includes('Dockerfile')) {
        // Basic Dockerfile validation
        const content = fs.readFileSync(file, 'utf-8');
        if (!content.includes('FROM')) {
          errors.push(`${file}: Missing FROM instruction`);
          console.log(chalk.red(`  ✗ ${path.relative(projectPath, file)}: Missing FROM`));
        } else {
          passedFiles++;
          console.log(chalk.green(`  ✓ ${path.relative(projectPath, file)}`));
        }
      }
    }

    // Deep validation with Cline
    console.log(chalk.cyan('\n🤖 Running AI-powered validation with Cline...\n'));

    const response = await clineClient.sendTask(
      CLINE_PROMPTS.validateConfigs(configFiles),
      { autonomous: true }
    );

    if (response.success) {
      console.log(response.output);
    }

    // Summary
    console.log(chalk.cyan('\n📊 Validation Summary:\n'));
    console.log(chalk.white(`  Total files: ${configFiles.length}`));
    console.log(chalk.green(`  Passed: ${passedFiles}`));
    console.log(chalk.red(`  Errors: ${errors.length}`));
    console.log(chalk.yellow(`  Warnings: ${warnings.length}`));

    if (errors.length > 0) {
      process.exit(1);
    }

  } catch (error: any) {
    spinner.fail('Validation failed');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}
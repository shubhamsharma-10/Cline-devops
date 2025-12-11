import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { clineClient } from '../cline/cline.js';

interface DevOpsConfig {
  name: string;
  version: string;
  environments: string[];
  cicd: {
    provider: 'github-actions' | 'gitlab-ci' | 'jenkins';
    enabled: boolean;
  };
  docker: {
    enabled: boolean;
    registry?: string;
  };
  kubernetes: {
    enabled: boolean;
    namespace?: string;
  };
}

export async function initCommand(options: { path: string; interactive?: boolean }) {
  const projectPath = path.resolve(options.path);
  const configPath = path.join(projectPath, 'devops-gen.config.yml');

  console.log(chalk.cyan('\n Initializing DevOps Pipeline Generator\n'));

  if (fs.existsSync(configPath)) {
    console.log(chalk.yellow('⚠️  Configuration already exists. Use --force to overwrite.'));
    return;
  }

  let config;

  if (options.interactive) {
    // Use Cline for interactive setup
    console.log(chalk.cyan('Starting interactive setup with Cline AI...\n'));

    const response = await clineClient.sendTask(`
      I'm setting up a DevOps pipeline generator for a project. 
      Please analyze the project at "${projectPath}" and suggest: 
      1. Appropriate CI/CD provider
      2. Docker configuration options
      3. Kubernetes setup if applicable
      4. Environment configurations (dev, staging, prod)
      
      Return your recommendations as a structured configuration. 
    `, { autonomous: false, mode: 'plan' });

    console.log(response.output);

    // For now, use defaults
    config = getDefaultConfig(projectPath);
  } else {
    config = getDefaultConfig(projectPath);
  }

  // Write configuration
  const yaml = await import('yaml');
  fs.writeFileSync(configPath, yaml.stringify(config));

  console.log(chalk.green(`\n✅ Configuration created at ${configPath}`));
  console.log(chalk.cyan('\nNext steps:'));
  console.log('  1. Edit devops-gen.config.yml to customize settings');
  console.log('  2. Run: devops-gen analyze --deep');
  console.log('  3. Run: devops-gen generate --autonomous');
}

function getDefaultConfig(projectPath: string): DevOpsConfig {
  const packageJsonPath = path.join(projectPath, 'package.json');
  let name = 'my-app';

  if (fs.existsSync(packageJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    name = pkg.name || name;
  }

  return {
    name,
    version: '1.0.0',
    environments: ['development', 'staging', 'production'],
    cicd: {
      provider: 'github-actions',
      enabled: true,
    },
    docker: {
      enabled: true,
      registry: 'ghcr.io',
    },
    kubernetes: {
      enabled: false,
      namespace: name,
    },
  };
}
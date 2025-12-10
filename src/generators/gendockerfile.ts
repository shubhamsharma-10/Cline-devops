import { extractDockerfile, extractDockerCompose, createDockerignore } from '../utils/helper.js';
import ora from 'ora';
import chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs';
import { clineClient } from '../cline/cline.js';
import { CLINE_PROMPTS } from '../cline/prompts.js';

// Generate Dockerfile
export async function generateDocker(
  projectPath: string,
  analysis: string,
  options: { autonomous: boolean },
  generatedFiles: string[],
  errors: string[]
) {
  const spinner = ora('Generating Docker configurations...').start();

  const prompt = CLINE_PROMPTS.generateDockerfile(analysis);

  const response = await clineClient.sendTask(prompt, {
    autonomous: options.autonomous,
    mode: 'act',
    cwd: projectPath,
  });

  if (response.success) {
    // Extract and save Dockerfile
    const dockerfileContent = extractDockerfile(response.output);
    if (dockerfileContent) {
      const dockerfilePath = path.join(projectPath, 'Dockerfile');
      fs.writeFileSync(dockerfilePath, dockerfileContent);
      generatedFiles.push(dockerfilePath);
      console.log(chalk.green('  ✓ Created Dockerfile'));
    }

    // Extract and save docker-compose.yml
    const composeContent = extractDockerCompose(response.output);
    if (composeContent) {
      const composePath = path.join(projectPath, 'docker-compose.yml');
      fs.writeFileSync(composePath, composeContent);
      generatedFiles.push(composePath);
      console.log(chalk.green('  ✓ Created docker-compose.yml'));
    }

    // Create .dockerignore
    const dockerignore = createDockerignore(analysis);
    const dockerignorePath = path.join(projectPath, '.dockerignore');
    fs.writeFileSync(dockerignorePath, dockerignore);
    generatedFiles.push(dockerignorePath);
    console.log(chalk.green('  ✓ Created .dockerignore'));

    spinner.succeed('Docker configurations generated');
  } else {
    errors.push('Failed to generate Docker configs: ' + response.output);
    spinner.fail('Failed to generate Docker configs');
    console.error(chalk.red(response.output));
  }
}

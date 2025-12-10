import ora from 'ora';
import chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs';
import { clineClient } from '../cline/cline.js';
import { CLINE_PROMPTS } from '../cline/prompts.js';
import { extractYamlFiles } from '../utils/helper.js';

// Generate GitHub Actions workflows
export async function generateGitHubActions(
    projectPath: string,
    analysis: string,
    options: { autonomous: boolean },
    generatedFiles: string[]
) {
    const spinner = ora('Generating GitHub Actions workflows...').start();

    const prompt = CLINE_PROMPTS.generateGitHubActions(analysis);

    const response = await clineClient.sendTask(prompt, {
        autonomous: options.autonomous,
        mode: 'act',
        cwd: projectPath,
    });

    if (response.success) {
        // Create .github/workflows directory
        const workflowsDir = path.join(projectPath, '.github', 'workflows');
        fs.mkdirSync(workflowsDir, { recursive: true });

        // this parse Cline's response and extract YAML files
        const files = extractYamlFiles(response.output);

        for (const [filename, content] of Object.entries(files)) {
            const filePath = path.join(workflowsDir, filename);
            fs.writeFileSync(filePath, content);
            generatedFiles.push(filePath);
            console.log(chalk.green(`  ✓ Created ${filePath}`));
        }

        spinner.succeed('GitHub Actions workflows generated');
    } else {
        console.error(chalk.red(response.output));
    }
}
import { extractK8sManifests } from '../utils/helper.js';
import ora from 'ora';
import chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs';
import { clineClient } from '../cline/cline.js';
import { CLINE_PROMPTS } from '../cline/prompts.js';

// Generate Kubernetes manifests
export async function generateKubernetes(
    projectPath: string,
    analysis: string,
    options: { autonomous: boolean },
    generatedFiles: string[],
    errors: string[]
) {
    const spinner = ora('Generating Kubernetes manifests...').start();

    const prompt = CLINE_PROMPTS.generateKubernetes(analysis);

    const response = await clineClient.sendTask(prompt, {
        autonomous: options.autonomous,
        mode: 'act',
        cwd: projectPath,
    });

    if (response.success) {
        // Create k8s directory
        const k8sDir = path.join(projectPath, 'k8s');
        fs.mkdirSync(k8sDir, { recursive: true });

        // Extract and save K8s manifests
        const manifests = extractK8sManifests(response.output);

        for (const [filename, content] of Object.entries(manifests)) {
            const filePath = path.join(k8sDir, filename);
            fs.writeFileSync(filePath, content);
            generatedFiles.push(filePath);
            console.log(chalk.green(`  ✓ Created ${filePath}`));
        }

        spinner.succeed('Kubernetes manifests generated');
    } else {
        errors.push('Failed to generate Kubernetes manifests: ' + response.output);
        spinner.fail('Failed to generate Kubernetes manifests');
        console.error(chalk.red(response.output));
    }
}
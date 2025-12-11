export function extractYamlFiles(output: string): Record<string, string> {
    const files: Record<string, string> = {};
    const yamlRegex = /```ya?ml\s*(?:name=)?(\S+\.ya?ml)?\n([\s\S]*?)```/gi;

    let match;
    let index = 0;
    while ((match = yamlRegex.exec(output)) !== null) {
        const filename = match[1] || `workflow-${++index}.yml`;
        if (match[2]) {
            files[filename] = match[2].trim();
        }
    }

    return files;
}

export function extractDockerfile(output: string): string | null {
    const match = output.match(/```dockerfile?\n([\s\S]*?)```/i);
    return match && match[1] ? match[1].trim() : null;
}

export function extractDockerCompose(output: string): string | null {
    const match = output.match(/```ya?ml\s*(?:name=)?docker-compose\.ya?ml?\n([\s\S]*?)```/i);
    return match && match[1] ? match[1].trim() : null;
}

export function extractK8sManifests(output: string): Record<string, string> {
    const manifests: Record<string, string> = {};
    const manifestTypes = ['deployment', 'service', 'configmap', 'secret', 'ingress', 'hpa'];

    for (const type of manifestTypes) {
        const regex = new RegExp(`\`\`\`ya?ml\\s*(?:name=)?(${type}\\.ya?ml)?\\n([\\s\\S]*?)\`\`\``, 'gi');
        const match = regex.exec(output);
        if (match && match[2]) {
            manifests[`${type}.yml`] = match[2].trim();
        }
    }

    return manifests;
}

export function createDockerignore(analysis: string): string {
    const parsed = JSON.parse(analysis);
    const lines = [
        'node_modules',
        '.git',
        '.gitignore',
        '*.md',
        '.env*',
        '!.env.example',
        'coverage',
        '.nyc_output',
        'dist',
        '*.log',
    ];

    if (parsed.languages?.includes('Python')) {
        lines.push('__pycache__', '*.pyc', '.pytest_cache', 'venv', '.venv');
    }

    return lines.join('\n');
}
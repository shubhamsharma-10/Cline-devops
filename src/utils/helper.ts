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

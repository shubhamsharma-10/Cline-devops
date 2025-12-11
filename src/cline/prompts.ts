export const CLINE_PROMPTS = {
   analyzeProject: (projectPath: string) => `
Analyze the project at "${projectPath}" and provide a comprehensive DevOps assessment: 

1. **Language & Runtime Detection**
   - Primary programming language(s)
   - Runtime versions required (Node.js, Python, Go, etc.)
   - Package managers used

2. **Framework Detection**
   - Web frameworks (Express, Django, FastAPI, Next.js, etc.)
   - Testing frameworks
   - Build tools

3. **Infrastructure Requirements**
   - Databases needed (PostgreSQL, MongoDB, Redis, etc.)
   - External services (AWS S3, email, etc.)
   - Environment variables required

4. **CI/CD Recommendations**
   - Suggested test commands
   - Build commands
   - Deployment strategy

Return the analysis as structured JSON. 
`,

   generateGitHubActions: (analysis: string) => `
Based on this project analysis: 
${analysis}

Generate a complete GitHub Actions workflow that includes:
1. **CI Pipeline** (. github/workflows/ci.yml)
   - Trigger on push and pull_request
   - Matrix testing for multiple versions
   - Caching for dependencies
   - Linting and type checking
   - Unit tests with coverage
   - Integration tests

2. **CD Pipeline** (.github/workflows/deploy.yml)
   - Trigger on push to main
   - Build Docker image
   - Push to container registry
   - Deploy to staging/production

Create the complete YAML files with proper syntax.
`,

   generateDockerfile: (analysis: string) => `
Based on this project analysis:
${analysis}

Generate an optimized Dockerfile that: 
1. Uses multi-stage builds for smaller image size
2. Follows security best practices (non-root user)
3. Properly caches dependency layers
4. Includes health checks
5. Has proper labels and metadata

Also generate a docker-compose.yml that includes:
- The main application service
- Required databases/caches
- Proper networking
- Volume mounts for persistence
- Environment variable handling

Create the complete Dockerfile and docker-compose.yml files.
`,

   generateKubernetes: (analysis: string) => `
Based on this project analysis: 
${analysis}

Generate Kubernetes manifests including:
1. **Deployment** with: 
   - Proper resource limits
   - Health probes (liveness, readiness)
   - Rolling update strategy
   - Environment configuration

2. **Service** for internal/external access

3. **ConfigMap** for configuration

4. **Secret** template for sensitive data

5. **HorizontalPodAutoscaler** for scaling

6. **Ingress** for external access

Create complete YAML files for each resource. 
`,

   validateConfigs: (configPaths: string[]) => `
Validate the following DevOps configuration files:
${configPaths.join('\n')}

Check for:
1. YAML syntax errors
2. Security issues (exposed secrets, privileged containers)
3. Best practice violations
4. Missing required fields
5. Version compatibility issues

Provide a detailed report with: 
- ✅ Valid configurations
- ⚠️ Warnings
- ❌ Errors with fix suggestions
`,

   customizeForEnvironment: (env: 'development' | 'staging' | 'production') => `
Customize all generated DevOps configurations for the ${env} environment: 
- Adjust resource allocations
- Configure appropriate replicas
- Set correct environment variables
- Update secrets references
- Modify logging levels
`,
};
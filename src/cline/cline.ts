import { execa } from 'execa';
import { EventEmitter } from 'events';

export interface ClineOptions {
  autonomous?: boolean;  // -y flag
  mode?: 'act' | 'plan';
  outputFormat?: 'json' | 'plain' | 'rich';
  cwd?: string;  // Working directory for Cline to run in
}

export interface ClineResponse {
  success: boolean;
  output: string;
  taskId?: string;
}

export class ClineClient extends EventEmitter {
  private instanceAddress?: string;

  async startInstance(): Promise<string> {
    const { stdout } = await execa('cline', ['instance', 'new', '--default']);
    this.instanceAddress = stdout.trim();
    return this.instanceAddress;
  }

  async sendTask(prompt: string, options: ClineOptions = {}): Promise<ClineResponse> {
    const args: string[] = [];

    // Add prompt as the first argument (required by Cline CLI)
    args.push(prompt);

    if (options.autonomous) {
        args.push('-o', '--yolo', '--no-interactive');
    }

    if (options.mode) {
      args.push('-m', options.mode);
    }

    if (options.outputFormat) {
      args.push('-F', options.outputFormat);
    }

    try {
      const execaOptions: { timeout: number; cwd?: string } = {
        timeout: 300000, // 5 min timeout
      };
      if (options.cwd) {
        execaOptions.cwd = options.cwd;
      }

      const { stdout } = await execa('cline', args, execaOptions);

      return {
        success: true,
        output: stdout,
      };
    } catch (error: any) {
      return {
        success: false,
        output: error.message,
      };
    }
  }

  async sendTaskWithFiles(
    prompt: string,
    files: string[],
    options: ClineOptions = {}
  ): Promise<ClineResponse> {
    const args: string[] = [];

    // Add prompt first
    args.push(prompt);

    // Add file attachments
    for (const file of files) {
      args.push('-f', file);
    }

    if (options.autonomous) {
      args.push('-o', '--yolo', '--no-interactive');
    }

    if (options.mode) {
      args.push('-m', options.mode);
    }

    try {
      const execaOptions: { timeout: number; cwd?: string } = {
        timeout: 300000,
      };
      if (options.cwd) {
        execaOptions.cwd = options.cwd;
      }

      const { stdout } = await execa('cline', args, execaOptions);
      return { success: true, output: stdout };
    } catch (error: any) {
      return { success: false, output: error.message };
    }
  }

  async createTask(prompt: string, options: ClineOptions = {}): Promise<string> {
    const args: string[] = [];

    args.push(prompt);

    if (options.autonomous) {
      args.push('-o', '--yolo', '--no-interactive');
    }

    if (options.mode) {
      args.push('-m', options.mode);
    }

    const execaOptions: { timeout: number; cwd?: string } = {
      timeout: 300000,
    };
    if (options.cwd) {
      execaOptions.cwd = options.cwd;
    }

    const { stdout } = await execa('cline', args, execaOptions);

    // Extract task ID from output
    const match = stdout.match(/task[:\s]+(\d+)/i);
    return match && match[1] ? match[1] : stdout;
  }

  async startChat(): Promise<void> {
    await execa('cline', ['task', 'chat'], {
      stdio: 'inherit',
    });
  }
  async killInstance(): Promise<void> {
    if (this.instanceAddress) {
      await execa('cline', ['instance', 'kill', this.instanceAddress]);
    }
  }
}

export const clineClient = new ClineClient();
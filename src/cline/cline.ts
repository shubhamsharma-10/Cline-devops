import { execa } from 'execa';
import { EventEmitter } from 'events';

export class ClineClient extends EventEmitter {
  private instanceAddress?: string;

  async startInstance(): Promise<string> {
    const { stdout } = await execa('cline', ['instance', 'new', '--default']);
    this.instanceAddress = stdout.trim();
    return this.instanceAddress;
  }
}

export const clineClient = new ClineClient();
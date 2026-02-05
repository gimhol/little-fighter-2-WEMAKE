import readline from 'readline';
import { info } from './utils/log';

export function waitForKeyPress() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  info('Press any key to exit...');

  rl.on('keypress', (str, key) => {
    rl.close();
    process.exit(0);
  });

  rl.question('', () => {
    rl.close();
    process.exit(0);
  });

  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
}

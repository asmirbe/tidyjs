import * as vscode from 'vscode';

const OUTPUT_CHANNEL = vscode.window.createOutputChannel('Import Formatter');
const DEBUG_MODE = () => process.env.VSCODE_DEBUG_MODE === 'true';
console.log('🚀 ~ log.ts:5 ~ DEBUG_MODE:', DEBUG_MODE);

export function logDebug(message: string, ...args: unknown[]): void {
  if (!DEBUG_MODE) {
    return;
  }
  
  const timestamp = new Date().toISOString();
  let formattedMessage = `[${timestamp}] [DEBUG] ${message}`;
  
  if (args.length > 0) {
    formattedMessage += ' ' + args.map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        return JSON.stringify(arg);
      }
      return String(arg);
    }).join(' ');
  }
  
  OUTPUT_CHANNEL.appendLine(formattedMessage);
}

export function logError(message: string, ...args: unknown[]): void {
  const timestamp = new Date().toISOString();
  let formattedMessage = `[${timestamp}] [ERROR] ${message}`;
  
  if (args.length > 0) {
    formattedMessage += ' ' + args.map(arg => {
      if (arg instanceof Error) {
        return `${arg.message}\n${arg.stack}`;
      } else if (typeof arg === 'object' && arg !== null) {
        return JSON.stringify(arg);
      }
      return String(arg);
    }).join(' ');
  }
  
  OUTPUT_CHANNEL.appendLine(formattedMessage);
  OUTPUT_CHANNEL.show();
}

export function showOutputChannel(): void {
  OUTPUT_CHANNEL.show();
}
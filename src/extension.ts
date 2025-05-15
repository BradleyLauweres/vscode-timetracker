import * as vscode from 'vscode';

let sessionStart: number;
let interval: ReturnType<typeof setInterval>;

export function activate(context: vscode.ExtensionContext) {
  sessionStart = Date.now();
  const TOTAL_KEY = 'totalTime';

  // Save session time every minute
  interval = setInterval(() => {
    saveTime(context);
  }, 60 * 1000);

  context.subscriptions.push(
    vscode.commands.registerCommand('usageTracker.showTime', () => {
      const totalMs = context.globalState.get<number>(TOTAL_KEY, 0);
      const totalMinutes = Math.floor(totalMs / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      vscode.window.showInformationMessage(`VS Code Usage: ${hours}h ${minutes}m`);
    })
  );
}

function saveTime(context: vscode.ExtensionContext) {
  const now = Date.now();
  const duration = now - sessionStart;
  sessionStart = now;

  const previousTotal = context.globalState.get<number>('totalTime', 0);
  context.globalState.update('totalTime', previousTotal + duration);
}

export function deactivate() {
  clearInterval(interval);
  // Note: 'context' is not available here, so use workaround below:
  try {
    const globalState = (vscode.extensions.getExtension('yourPublisher.vscode-usage-tracker') as any)?.exports?.context?.globalState;
    if (globalState) {
      const duration = Date.now() - sessionStart;
      const previous = globalState.get('totalTime', 0) as number;
      globalState.update('totalTime', previous + duration);
    }
  } catch (e) {
    console.error('Failed to persist usage time on deactivate', e);
  }
}

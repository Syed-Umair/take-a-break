import * as vscode from 'vscode';

let activeJob: NodeJS.Timeout | null | undefined = null;

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "take-a-break" is now active!');

	let startCmd = vscode.commands.registerCommand('take-a-break.reminderForBreak', async () => {
    const mins = await vscode.window.showInputBox({
      value: '30',
      validateInput: (val) => {
        let parsedVal = parseInt(val, 10);
        if (parsedVal && parsedVal >= 15 && parsedVal <= 300) {
          return null;
        }
        return 'Please Enter a valid integer between 15 and 300';
      },
			ignoreFocusOut: true,
			prompt: 'How many minutes later would you like to take a break?',
		});

		if (!mins) {
			return;
    }

    context.globalState.update('reminderForBreak:mins', mins);
    clearActiveJobs();
    activeJob = parseAndSetupCron(mins);

    vscode.window.showInformationMessage(`I will notify you every ${mins} minutes to take a break!`);
  });

  const mins = context.globalState.get('reminderForBreak:mins');
  activeJob = parseAndSetupCron(mins as string);

  let stopCmd = vscode.commands.registerCommand('take-a-break.turnOffReminderForBreak', () => {
    clearActiveJobs();
    context.globalState.update('reminderForBreak:mins', null);
    vscode.window.showInformationMessage(`Reminders to take break purged!`);
  });

  context.subscriptions.push(startCmd);
  context.subscriptions.push(stopCmd);
}

export function deactivate() {
  console.log('Deactivated the extension');
  clearActiveJobs();
}

export function parseAndSetupCron(mins: string) {
  if (mins && typeof mins === 'string') {
    const parsedMins = parseInt(mins, 10);
    return setInterval(() => {
      console.log(`You will see this message every ${parsedMins} minutes`);
      vscode.window.showInformationMessage(`You need to take a break, you have been programming straight for ${mins} minutes. You deserve a break! 🙂`, {
        modal: true
      });
    }, parsedMins * 60 * 1000);
  }
}

export function clearActiveJobs() {
  if (activeJob) {
    clearInterval(activeJob);
  }
}

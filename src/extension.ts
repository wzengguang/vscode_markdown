import * as vscode from 'vscode';
import { VditormdProvider } from './vditormd';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(VditormdProvider.register(context));
}

// this method is called when your extension is deactivated
export function deactivate() { }

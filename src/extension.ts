// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { prepareScriptPrompt } from './helpers';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "quaqa-chat" is now active!');

	let processScript = vscode.commands.registerCommand(
		// Esse comando gera código Gherkin para um script Python como um todo
		'quaqa-chat.processPythonFile',
		(uri: vscode.Uri) => {
			if (!uri) {
				vscode.window.showErrorMessage("No file selected.");
				return;
			}
			let scriptPrompt = prepareScriptPrompt(uri.fsPath);
			console.log(scriptPrompt);
	}
	);

	let processFunction = vscode.commands.registerCommand(
		// Gera testes Gherkin para funções Python
		'quaqa-chat.processPythonFunction',
		async (uri: vscode.Uri, range: vscode.Range) => {
			if (!uri) {
				vscode.window.showErrorMessage("No file selected.");
				return;
			}
		}
	);

	// let pythonCodeLens = vscode.languages.registerCodeLensProvider(
	// 	{ scheme: 'file', language: 'python' }, new PythonFunctionCodeLensProvider()
	// );

	vscode.chat.createChatParticipant("quaqa-chat", (request, context, response, token) => {
		
	});

	context.subscriptions.push(processScript);
	context.subscriptions.push(processFunction);
}

// This method is called when your extension is deactivated
export function deactivate() {}

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {readFileSync} from 'fs';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "quaqa-chat" is now active!');

	vscode.chat.createChatParticipant("quaqa-chat", async (request, context, response, token) => {

		const chatModels = await vscode.lm.selectChatModels({ "family": "gpt-4"});

		const BASE_PROMPT = 
		`You are a code assistant responsible for generating Gherkin test case for scripts provided to you.
		When generating code, consider the whole context of the code, including its contents.
		
		You should output a code block that starts with "\`\`\`gherkin" and ends with "\`\`\`.
		Remember to include the "Feature", "Scenario", "Given", "When", and "Then" keywords in your output.
		You can also include "And" and "But" keywords if necessary.
		
		It there is no test to be written, simply output a blank code block.`;
		const messages = [
			vscode.LanguageModelChatMessage.User(BASE_PROMPT),
			vscode.LanguageModelChatMessage.User(request.prompt)
		];

		const chatRequest = await chatModels[0].sendRequest(messages, undefined, token);

		for await (const token of chatRequest.text) {
			response.markdown(token);
		}

	});
	let processScript = vscode.commands.registerCommand(
		// Esse comando gera código Gherkin para um script Python como um todo
		'quaqa-chat.processPythonFile',
		async (uri: vscode.Uri) => {
			if (!uri) {
				vscode.window.showErrorMessage("No file selected.");
				return;
			}

			let language = "";
			await vscode.workspace.openTextDocument(uri).then((doc) => {
				language = doc.languageId;
			});

			if (!language) {
				vscode.window.showErrorMessage("Could not determine language.");
				return;
			}
			let file = readFileSync(uri.fsPath, 'utf8');
			let script = "```" + `${language}\n` + file +"\n```";
			console.log(script);

			
	}
	);

	// let pythonCodeLens = vscode.languages.registerCodeLensProvider(
	// 	{ scheme: 'file', language: 'python' }, new PythonFunctionCodeLensProvider()
	// );

	vscode.chat.createChatParticipant("quaqa-chat", (request, context, response, token) => {
		
	});

	context.subscriptions.push(processScript);
}

// This method is called when your extension is deactivated
export function deactivate() {}

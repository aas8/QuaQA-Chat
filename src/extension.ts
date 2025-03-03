// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "quaqa-chat" is now active!');

	const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;

	if (!workspaceFolder) {
		vscode.window.showErrorMessage("No workspace folder found.");
		return;
	}

	const testDirectory = path.join(workspaceFolder, "features");
	if (!fs.existsSync(testDirectory) || !fs.statSync(testDirectory).isDirectory()) {
		fs.mkdirSync(testDirectory, { recursive: true });
		vscode.window.showInformationMessage(`Directory "${testDirectory}" created.`);
	}


	let processScript = vscode.commands.registerCommand(
		// Esse comando gera código Gherkin para um script como um todo
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
			let file = fs.readFileSync(uri.fsPath, 'utf8');
			let script = "```" + `${language}\n` + file +"\n```";

			const BASE_PROMPT = 
			`You are a code assistant responsible for generating Gherkin test case for scripts provided to you.
When generating code, consider the whole context of the code, including its contents.

You should output a code block that starts with "\`\`\`gherkin" and ends with "\`\`\`.
Remember to include the "Feature", "Scenario", "Given", "When", and "Then" keywords in your output.
You can also include "And" and "But" keywords if necessary.

It there is no test to be written, simply output a blank code block.`;

			const messages = [
				vscode.LanguageModelChatMessage.User(BASE_PROMPT),
				vscode.LanguageModelChatMessage.User(script)
			];

			const chatModels = await vscode.lm.selectChatModels({ "family": "gpt-4"});
			const chatRequest = await chatModels[0].sendRequest(messages, undefined);

			let responseContent = [];

			for await (const token of chatRequest.text) {
				responseContent.push(token);
			}

			let chatResponse = responseContent.join("");

			const gherkinRegex = /```gherkin\n([\s\S]*)\n```/;
			const match = chatResponse.match(gherkinRegex);
			let gherkinContent = "";
			if (match && match[1]) {
				gherkinContent += match[1];
			}

			let featureName = path.basename(uri.fsPath).split(".")[0] + ".feature";
			let featureScript = path.join(testDirectory, featureName);
			// Adiciona "_n" ao nome do arquivo se já existir um arquivo com o mesmo nome
			let n = 0;
			while (fs.existsSync(featureScript)) {
				n++;
				featureName = path.basename(uri.fsPath).split(".")[0] + `_${n}.feature`;
				featureScript = path.join(testDirectory, featureName);
			}

			if (!gherkinContent) {
				vscode.window.showInformationMessage("No Gherkin feature generated.");
				return;
			}
			fs.writeFileSync(featureScript, gherkinContent);
			vscode.window.showInformationMessage(`Gherkin feature writen to "${featureScript}"`);
	}
	);

	vscode.chat.createChatParticipant("quaqa-chat", (request, context, response, token) => {
		
	});

	context.subscriptions.push(processScript);
}

// This method is called when your extension is deactivated
export function deactivate() {}

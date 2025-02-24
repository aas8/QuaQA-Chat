// Script auxiliar.
// Contém funções para prepação de contexto para os prompts

import * as fs from 'fs';
import * as vscode from 'vscode';

export function prepareScriptPrompt(filePath: string) {
    // Lê o conteúdo do arquivo e remove as linhas de comentário
    let file = fs.readFileSync(filePath, 'utf8');
    let lines = file.split('\n');
    let script = '';
    for (let line of lines) {
        if (line.startsWith('#!')) {
            continue;
        }
        script += line + '\n';
    }
    return script;
}

export class PythonFunctionCodeLensProvider implements vscode.CodeLensProvider {
    provideCodeLenses(document: vscode.TextDocument, _: vscode.CancellationToken): vscode.CodeLens[] {
      const lenses: vscode.CodeLens[] = [];
      const functionRegex = /^\s*def\s+(\w+)\s*\(/gm; // Match Python functions
  
      let match;
      while ((match = functionRegex.exec(document.getText())) !== null) {
        const startPos = document.positionAt(match.index);
        const range = new vscode.Range(startPos, startPos);
  
        lenses.push(
          new vscode.CodeLens(range, {
            title: "▶ Generate Test for Function",
            command: "extension.processPythonFunction",
            arguments: [document.uri, new vscode.Range(startPos, document.lineAt(startPos.line).range.end)],
          })
        );
      }
  
      return lenses;
    }
  }
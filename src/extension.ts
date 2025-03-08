import * as vscode from 'vscode';
import { loadConfiguration, formatImports } from './formatter';

export function activate(context: vscode.ExtensionContext) {
  loadConfiguration();

  vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration('importFormatter')) {
      loadConfiguration();
    }
  });

  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider(
      ['typescript', 'javascript', 'typescriptreact', 'javascriptreact'],
      {
        provideDocumentFormattingEdits(document) {
          const text = document.getText();
          const formatted = formatImports(text);
          const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(text.length)
          );
          return [vscode.TextEdit.replace(fullRange, formatted)];
        },
      }
    )
  );

  context.subscriptions.push(
    vscode.languages.registerDocumentRangeFormattingEditProvider(
      ['typescript', 'javascript', 'typescriptreact', 'javascriptreact'],
      {
        provideDocumentRangeFormattingEdits(document, range) {
          const text = document.getText(range);
          const formatted = formatImports(text);
          return [vscode.TextEdit.replace(range, formatted)];
        },
      }
    )
  );

  const formatImportsCommand = vscode.commands.registerCommand(
    'extension.formatImports',
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('No active editor found');
        return;
      }

      const document = editor.document;
      
      // Option 1: Format selected text if there is a selection
      if (!editor.selection.isEmpty) {
        const selectedText = document.getText(editor.selection);
        const formattedText = formatImports(selectedText);
        
        editor.edit((editBuilder) => {
          editBuilder.replace(editor.selection, formattedText);
        }).then((success) => {
          if (success) {
            vscode.window.showInformationMessage('Imports formatted successfully!');
          } else {
            vscode.window.showErrorMessage('Failed to format imports');
          }
        });
        return;
      }
    }
  );

  context.subscriptions.push(formatImportsCommand);
}

export function deactivate() {}
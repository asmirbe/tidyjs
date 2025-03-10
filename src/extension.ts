import * as vscode from 'vscode';

import { formatImports } from './formatter';
import { configManager } from './utils/config';
import { logDebug, logError } from './utils/log';

export function activate(context: vscode.ExtensionContext) : void {
  configManager.loadConfiguration();

  vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration('importFormatter')) {
      configManager.loadConfiguration();
    }
  });

  const formatImportsCommand = vscode.commands.registerCommand(
    'extension.formatImports',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('No active editor found');
        return;
      }

      const document = editor.document;
      const documentText = document.getText();

      // Si une sélection existe, formatter uniquement les imports dans cette sélection
      if (!editor.selection.isEmpty) {
        const selectedRange = editor.selection;
        const selectedText = document.getText(selectedRange);

        try {
          // Tenter de formater les imports uniquement dans cette sélection
          const formattedText = await formatImports(selectedText);

          if (formattedText !== selectedText) {
            editor.edit((editBuilder) => {
              editBuilder.replace(selectedRange, formattedText);
            }).then((success) => {
              if (success) {
                logDebug('Successfully formatted imports in selection');
                vscode.window.showInformationMessage('Imports formatted successfully!');
              } else {
                vscode.window.showErrorMessage('Failed to format imports in selection');
              }
            });
          } else {
            logDebug('No changes needed for the selection');
          }
        } catch (error) {
          logError('Error formatting imports in selection:', error);
          vscode.window.showErrorMessage('Error formatting imports: ' + String(error));
        }
        return;
      }

      try {
        // Formater tout le document en ne modifiant que les imports
        const formattedDocument = await formatImports(documentText);

        // Vérifier si le texte a été modifié avant d'appliquer les changements
        if (formattedDocument !== documentText) {
          const fullDocumentRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(documentText.length)
          );

          // Remplacer tout le document par la version formatée
          await editor.edit((editBuilder) => {
            editBuilder.replace(fullDocumentRange, formattedDocument);
          }).then((success) => {
            if (success) {
              logDebug('Successfully formatted imports in document');
              vscode.window.showInformationMessage('Imports formatted successfully!');
            } else {
              vscode.window.showErrorMessage('Failed to format imports in document');
            }
          });
        } else {
          logDebug('No changes needed for the document');
        }
      } catch (error) {
        logError('Error formatting imports:', error);
        vscode.window.showErrorMessage('Error formatting imports: ' + String(error));
      }
    }
  );

  context.subscriptions.push(formatImportsCommand);
}

// export function deactivate() : void { }
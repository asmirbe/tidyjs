import * as vscode from 'vscode';
import { logDebug, logError } from './utils/log';
import { loadConfiguration } from './utils/config';
import { formatImports } from './formatter';

export function activate(context: vscode.ExtensionContext) {
  loadConfiguration();

  vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration('importFormatter')) {
      loadConfiguration();
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
        } catch (error) {
          logError('Error formatting imports in selection:', error);
          vscode.window.showErrorMessage('Error formatting imports: ' + String(error));
        }
        return;
      }
      
      // Si aucune sélection n'existe, détecter et formatter automatiquement la section d'imports
      try {
        // Afficher un indicateur de progression pour les gros fichiers
        vscode.window.withProgress({
          location: vscode.ProgressLocation.Notification,
          title: "Formatting imports...",
          cancellable: false
        }, async (progress) => {
          progress.report({ increment: 30, message: "Analyzing imports..." });
          
          try {
            // Formater tout le document en ne modifiant que les imports
            const formattedDocument = await formatImports(documentText);
            
            progress.report({ increment: 40, message: "Applying changes..." });
            
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
                  progress.report({ increment: 30, message: "Complete!" });
                  vscode.window.showInformationMessage('Imports formatted successfully!');
                } else {
                  logError('Edit operation failed');
                  vscode.window.showErrorMessage('Failed to format imports');
                }
              }, (error) => {
                logError('Error during edit operation:', error);
                vscode.window.showErrorMessage('Error formatting imports: ' + String(error));
              });
            } else {
              logDebug('No changes needed for imports');
              progress.report({ increment: 30, message: "No changes needed!" });
              vscode.window.showInformationMessage('No imports needed formatting');
            }
          } catch (error) {
            logError('Error formatting imports:', error);
            vscode.window.showErrorMessage('Error formatting imports: ' + String(error));
          }
        });
      } catch (error) {
        logError('Error formatting imports:', error);
        vscode.window.showErrorMessage('Error formatting imports: ' + String(error));
      }
    }
  );

  context.subscriptions.push(formatImportsCommand);
}

export function deactivate() {}
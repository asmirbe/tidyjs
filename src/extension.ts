import * as vscode from 'vscode';
import { loadConfiguration, formatImports } from './formatter';
import { logDebug, logError } from './utils/utils';

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

      // Vérifier le type de fichier (uniquement TypeScript/JavaScript)
      const document = editor.document;
      const supportedLanguages = ['typescript', 'javascript', 'typescriptreact', 'javascriptreact'];
      if (!supportedLanguages.includes(document.languageId)) {
        vscode.window.showInformationMessage(`Format imports is only available for TypeScript and JavaScript files. Current language: ${document.languageId}`);
        return;
      }

      // Capturer l'état du document avant modification
      const documentText = document.getText();
      
      try {
        // Si une sélection existe, formatter uniquement les imports dans cette sélection
        if (!editor.selection.isEmpty) {
          const selectedRange = editor.selection;
          const selectedText = document.getText(selectedRange);
          
          // Valider que la sélection contient des imports
          if (!selectedText.includes('import ')) {
            vscode.window.showInformationMessage('No imports found in the selection.');
            return;
          }
          
          try {
            const formattedText = formatImports(selectedText);
            
            // Vérifier si le formatage a apporté des changements
            if (formattedText === selectedText) {
              vscode.window.showInformationMessage('Imports are already properly formatted.');
              return;
            }
            
            // Appliquer les modifications
            await editor.edit((editBuilder) => {
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
            vscode.window.showErrorMessage(`Error formatting imports: ${error instanceof Error ? error.message : String(error)}`);
          }
          return;
        }
        
        // Si aucune sélection n'existe, formatter tout le document
        try {
          // Formater le document en ne touchant que les imports
          const formattedDocument = formatImports(documentText);
          
          // Vérifier si le texte a été modifié
          if (formattedDocument === documentText) {
            vscode.window.showInformationMessage('Imports are already properly formatted.');
            return;
          }
          
          // Protection supplémentaire pour vérifier qu'on n'a pas supprimé de code
          const significantTextLoss = documentText.length - formattedDocument.length > documentText.length * 0.1;
          if (significantTextLoss) {
            logError('Significant text loss detected. Operation aborted.', {
              originalLength: documentText.length,
              formattedLength: formattedDocument.length
            });
            vscode.window.showErrorMessage('Operation aborted: Formatting would result in significant content loss. Please report this issue.');
            return;
          }
          
          // Appliquer les modifications
          const fullDocumentRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(documentText.length)
          );
          
          await editor.edit((editBuilder) => {
            editBuilder.replace(fullDocumentRange, formattedDocument);
          }).then((success) => {
            if (success) {
              logDebug('Successfully formatted imports in document');
              vscode.window.showInformationMessage('Imports formatted successfully!');
            } else {
              logError('Edit operation failed');
              vscode.window.showErrorMessage('Failed to format imports');
            }
          }, (error) => {
            logError('Error during edit operation:', error);
            vscode.window.showErrorMessage(`Error formatting imports: ${error instanceof Error ? error.message : String(error)}`);
          });
        } catch (error) {
          logError('Error formatting imports:', error);
          vscode.window.showErrorMessage(`Error formatting imports: ${error instanceof Error ? error.message : String(error)}`);
          
          // Offrir une restauration en cas d'erreur
          const restore = await vscode.window.showWarningMessage(
            'An error occurred during formatting. Would you like to restore the original document?',
            'Restore', 'Cancel'
          );
          
          if (restore === 'Restore') {
            try {
              const fullDocumentRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(document.getText().length)
              );
              
              await editor.edit((editBuilder) => {
                editBuilder.replace(fullDocumentRange, documentText);
              });
              
              vscode.window.showInformationMessage('Document restored to its original state.');
            } catch (restoreError) {
              logError('Error restoring document:', restoreError);
              vscode.window.showErrorMessage('Failed to restore document. Please undo manually.');
            }
          }
        }
      } catch (criticalError) {
        logError('Critical error in import formatter command:', criticalError);
        vscode.window.showErrorMessage(`Critical error: ${criticalError instanceof Error ? criticalError.message : String(criticalError)}`);
        
        // Log de diagnostic pour aider au débogage
        const diagnosticInfo = {
          vscodeVersion: vscode.version,
          extensionVersion: vscode.extensions.getExtension('user.importtidy')?.packageJSON.version,
          platform: process.platform,
          documentLanguage: document.languageId,
          documentSize: documentText.length,
          selectionActive: !editor.selection.isEmpty
        };
        
        logError('Diagnostic information:', diagnosticInfo);
      }
    }
  );

  context.subscriptions.push(formatImportsCommand);
}

export function deactivate() {}
// Misc
import { formatImports, findImportsRange, needsFormatting } from './formatter';

// Parser
import { ImportParser, ParserResult, InvalidImport } from 'tidyjs-parser';

// VSCode
import { Range, window, commands, workspace } from 'vscode';
import type { ExtensionContext } from 'vscode';

// Utils
import { configManager } from './utils/config';
import { logDebug, logError } from './utils/log';
import { getUnusedImports, removeUnusedImports, showMessage } from './utils/misc';

let parser = new ImportParser(configManager.getParserConfig());

/**
 * Applique une mise à jour du document en utilisant le résultat d'un parser
 * @param document Document à mettre à jour
 * @param parserResult Résultat du parser
 * @returns Promise indiquant si l'opération a réussi
 */
async function applyDocumentUpdate(document: import('vscode').TextDocument, parserResult: ParserResult, formatterConfig: ReturnType<typeof configManager.getConfig>): Promise<boolean> {
  const editor = window.activeTextEditor;
  if (!editor || editor.document !== document) {
    return false;
  }

  const documentText = document.getText();

  try {
    const formattedDocument = formatImports(documentText, formatterConfig, parserResult);

    if (formattedDocument.error) {
      showMessage.error(formattedDocument.error);
      return false;
    }

    if (formattedDocument.text !== documentText) {
      const fullDocumentRange = new Range(document.positionAt(0), document.positionAt(documentText.length));

      return await editor
        .edit((editBuilder) => {
          editBuilder.replace(fullDocumentRange, formattedDocument.text);
        })
        .then((success) => {
          if (success) {
            logDebug('Successfully updated document');
          } else {
            showMessage.warning('Failed to update document');
          }
          return success;
        });
    }

    return true;
  } catch (error) {
    logError('Error applying document update:', error);
    const errorMessage = String(error);
    showMessage.error(`Error updating document: ${errorMessage}`);
    return false;
  }
}

/**
 * Commande de formatage pour séparer clairement l'étape de suppression des imports
 */
async function formatImportsCommand(): Promise<void> {
  const editor = window.activeTextEditor;
  if (!editor) {
    showMessage.warning('No active editor found');
    return;
  }

  const document = editor.document;
  const documentText = document.getText();
  const importRange = findImportsRange(documentText);

  if (!importRange || importRange.start === importRange.end) {
    showMessage.info('No imports found in document');
    return;
  }

  const importsText = documentText.substring(importRange.start, importRange.end);

  try {
    let parserResult = parser.parse(importsText) as ParserResult;
    logDebug('Parser result:', JSON.stringify(parserResult, null, 2));

    if (parserResult.invalidImports && parserResult.invalidImports.length > 0) {
      const errorMessages = parserResult.invalidImports.map((invalidImport) => {
        return formatImportError(invalidImport);
      });

      showMessage.error(`Invalid import syntax: ${errorMessages[0]}`);
      logError('Invalid imports found:', errorMessages.join('\n'));
      return;
    }

    if (configManager.getConfig().format.removeUnused) {
      const unusedImports = getUnusedImports(document.uri, parserResult);
      logDebug('Unused imports:', unusedImports);
      if (unusedImports.length > 0) {
        parserResult = removeUnusedImports(parserResult, unusedImports);
      }
    }

    if (!needsFormatting(documentText, configManager.getConfig(), parserResult)) {
      showMessage.info('No formatting needed');
      logDebug('No formatting needed – skipping edit');
      return;
    }

    const success = await applyDocumentUpdate(document, parserResult, configManager.getConfig());

    if (success) {
      showMessage.info('Imports formatted successfully!');
    }
  } catch (error) {
    logError('Error formatting imports:', error);
    const errorMessage = String(error);
    showMessage.error(`Error formatting imports: ${errorMessage}`);
  }
}

export function activate(context: ExtensionContext): void {
  try {
    configManager.loadConfiguration();

    workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('tidyjs')) {
        configManager.loadConfiguration();
        parser = new ImportParser(configManager.getParserConfig());
      }
    });

    const formatCommand = commands.registerCommand('extension.format', formatImportsCommand);

    const formatOnSaveDisposable = workspace.onDidSaveTextDocument((document) => {
      if (configManager.getConfig().format.onSave) {
        const editor = window.activeTextEditor;
        if (editor && editor.document === document) {
          commands.executeCommand('extension.format');
        }
      }
    });

    logDebug('Extension activated with config:', JSON.stringify(configManager.getConfig(), null, 2));

    context.subscriptions.push(formatCommand);
    context.subscriptions.push(formatOnSaveDisposable);
  } catch (error) {
    logError('Error activating extension:', error);
    showMessage.error(`Extension activation error: ${error}`);
  }
}

function formatImportError(invalidImport: InvalidImport): string {
  if (!invalidImport || !invalidImport.error) {
    return 'Unknown import error';
  }

  const errorMessage = invalidImport.error;
  const importStatement = invalidImport.raw || '';
  const lineMatch = errorMessage.match(/\((\d+):(\d+)\)/);
  let formattedError = errorMessage;

  if (lineMatch && lineMatch.length >= 3) {
    const line = parseInt(lineMatch[1], 10);
    const column = parseInt(lineMatch[2], 10);

    const lines = importStatement.split('\n');

    if (line <= lines.length) {
      const problematicLine = lines[line - 1];

      const indicator = ' '.repeat(Math.max(0, column - 1)) + '^';
      formattedError = `${errorMessage}\nIn: ${problematicLine.trim()}\n${indicator}`;
    }

    formattedError = `${errorMessage}\nIn: ${importStatement.trim()}`;
  }

  return formattedError;
}

import * as vscode from 'vscode';
import { ImportNode, getImportGroup } from './formatter';
import { logDebug, logError } from './utils/utils';

export function parseImports(document: vscode.TextDocument): ImportNode[] {
    const text = document.getText();
    const imports: ImportNode[] = [];
    
    const importRegex = /^(?:\/\/[^\n]*\n)?import\s+(?:(type)\s+)?(?:([^{},\s]+)(?:\s*,\s*)?)?(?:{([^}]*)})?\s+from\s+['"]([^'"]+)['"]\s*;/gm;
    
    let match;
    while ((match = importRegex.exec(text)) !== null) {
        try {
            const fullMatch = match[0];
            const hasComment = fullMatch.startsWith('//');
            
            const typeKeyword = match[1];
            const defaultImport = match[2];
            const namedImportsStr = match[3];
            const source = match[4];
            
            if (!source) {
                logDebug('Source d\'import non trouvée:', fullMatch);
                continue;
            }
            
            const startPosition = document.positionAt(match.index + (hasComment ? fullMatch.indexOf('import') : 0));
            const endPosition = document.positionAt(match.index + fullMatch.length);
            
            if (startPosition.line < 0 || endPosition.line < 0) {
                logDebug('Position de ligne négative détectée pour l\'import:', fullMatch);
                continue;
            }
            
            const range = new vscode.Range(startPosition, endPosition);
            
            let namedImports: string[] = [];
            let typeImports: string[] = [];
            
            if (namedImportsStr) {
                const cleanedImportsStr = namedImportsStr
                    .replace(/\n\s*/g, ' ')
                    .trim();
                
                const importItems = cleanedImportsStr
                    .split(',')
                    .map(item => item.trim())
                    .filter(item => item.length > 0);
                
                for (const item of importItems) {
                    if (item.startsWith('type ')) {
                        typeImports.push(item.substring(5).trim());
                    } else {
                        namedImports.push(item);
                    }
                }
                
                namedImports.sort((a, b) => a.length - b.length);
                typeImports.sort((a, b) => a.length - b.length);
            }
            
            const group = getImportGroup(source);
            
            imports.push({
                text: fullMatch.substring(hasComment ? fullMatch.indexOf('import') : 0),
                defaultImport: defaultImport || null,
                namedImports,
                typeImports,
                source,
                isTypeOnly: !!typeKeyword,
                originalText: fullMatch,
                range,
                group
            });
            
            logDebug(`Import parsé: source=${source}, defaultImport=${defaultImport}, namedImports=${namedImports.length}, typeImports=${typeImports.length}, groupe=${group}`);
        } catch (error) {
            logError('Erreur lors de l\'analyse de l\'import:', match ? match[0] : 'inconnu', error);
        }
    }
    
    return imports;
}

export function findImportBlocks(document: vscode.TextDocument): vscode.Range[] {
    const text = document.getText();
    const blocks: vscode.Range[] = [];
    
    const blockRegex = /^(\/\/\s+(Misc|DS|@app\/.*|@core|@library|Utils|@yutils)\s*\n)?import\s+.*?['"].*?['"]\s*;/gm;
    
    let match;
    let startLine = -1;
    let endLine = -1;
    let lastGroupCommentLine = -1;
    let lastGroupCommentText = '';
    
    try {
        while ((match = blockRegex.exec(text)) !== null) {
            const hasComment = match[1] !== undefined;
            
            const blockStartIndex = match.index;
            const blockEndIndex = match.index + match[0].length;
            
            const startPos = document.positionAt(blockStartIndex);
            const endPos = document.positionAt(blockEndIndex);
            
            if (startPos.line < 0 || endPos.line < 0) {
                logDebug('Position de ligne négative détectée');
                continue;
            }
            
            // Si un nouveau groupe est détecté
            if (hasComment) {
                const currentGroupText = match[2].trim();
                
                // Vérifier si le commentaire est trop proche du précédent ou s'il est dupliqué
                const isTooClose = lastGroupCommentLine >= 0 && startPos.line - lastGroupCommentLine < 3;
                const isDuplicate = currentGroupText === lastGroupCommentText;
                
                if (isTooClose || isDuplicate) {
                    logDebug(`Commentaire de groupe ignoré: ${isTooClose ? 'trop proche' : 'dupliqué'} - "${currentGroupText}" à la ligne ${startPos.line}`);
                } else {
                    lastGroupCommentLine = startPos.line;
                    lastGroupCommentText = currentGroupText;
                }
            }
            
            if (startLine === -1) {
                startLine = startPos.line;
                endLine = endPos.line;
            } else if (endPos.line - endLine <= 2) {
                endLine = endPos.line;
            } else {
                if (startLine >= 0 && endLine >= 0) {
                    let adjustedStartLine = startLine;
                    while (adjustedStartLine > 0) {
                        const prevLine = document.lineAt(adjustedStartLine - 1).text.trim();
                        if (prevLine.match(/^\/\/\s+(Misc|DS|@app\/.*|@core|@library|Utils|@yutils)\s*$/)) {
                            adjustedStartLine--;
                        } else {
                            break;
                        }
                    }
                    
                    const startLineObj = document.lineAt(adjustedStartLine);
                    const endLineObj = document.lineAt(endLine);
                    blocks.push(new vscode.Range(
                        startLineObj.range.start,
                        endLineObj.range.end
                    ));
                    logDebug(`Bloc d'imports identifié: lignes ${adjustedStartLine}-${endLine}`);
                }
                
                startLine = startPos.line;
                endLine = endPos.line;
                lastGroupCommentLine = hasComment ? startPos.line : -1;
                lastGroupCommentText = hasComment ? match[2].trim() : '';
            }
        }
        
        if (startLine >= 0 && endLine >= 0) {
            let adjustedStartLine = startLine;
            while (adjustedStartLine > 0) {
                const prevLine = document.lineAt(adjustedStartLine - 1).text.trim();
                if (prevLine.match(/^\/\/\s+(Misc|DS|@app\/.*|@core|@library|Utils|@yutils)\s*$/)) {
                    adjustedStartLine--;
                } else {
                    break;
                }
            }
            
            const startLineObj = document.lineAt(adjustedStartLine);
            const endLineObj = document.lineAt(endLine);
            blocks.push(new vscode.Range(
                startLineObj.range.start,
                endLineObj.range.end
            ));
            logDebug(`Dernier bloc d'imports identifié: lignes ${adjustedStartLine}-${endLine}`);
        }
    } catch (error) {
        logError('Erreur lors de la recherche des blocs d\'imports:', error);
    }
    
    logDebug(`Nombre total de blocs d'imports trouvés: ${blocks.length}`);
    return blocks;
}

export function findImportComments(document: vscode.TextDocument): Map<number, string> {
    const text = document.getText();
    const comments = new Map<number, string>();
    
    const commentRegex = /^\/\/\s+(Misc|DS|@app\/.*|@core|@library|Utils|@yutils)\s*$/gm;
    
    let match;
    while ((match = commentRegex.exec(text)) !== null) {
        try {
            const startPos = document.positionAt(match.index);
            if (startPos.line >= 0) {
                comments.set(startPos.line, match[1]);
                logDebug(`Commentaire de section trouvé: "${match[1]}" à la ligne ${startPos.line}`);
            }
        } catch (error) {
            logError('Erreur lors de l\'analyse des commentaires:', error);
        }
    }
    
    const linesToRemove: number[] = [];
    let previousCommentLine = -1;
    let previousCommentGroup = '';
    
    comments.forEach((group, line) => {
        if (previousCommentLine !== -1) {
            if (line - previousCommentLine < 3) {
                logDebug(`Commentaire trop proche détecté à la ligne ${line} (précédent à la ligne ${previousCommentLine})`);
                linesToRemove.push(line);
            } 
            else if (group === previousCommentGroup) {
                logDebug(`Commentaire dupliqué détecté à la ligne ${line} (groupe: ${group})`);
                linesToRemove.push(line);
            }
        }
        previousCommentLine = line;
        previousCommentGroup = group;
    });
    
    for (const line of linesToRemove) {
        comments.delete(line);
    }
    
    logDebug(`Nombre de commentaires de section valides: ${comments.size}`);
    return comments;
}
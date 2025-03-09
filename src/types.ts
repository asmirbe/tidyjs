import * as vscode from 'vscode';

export interface ImportGroup {
    name: string;
    regex: RegExp;
    order: number;
}

export interface ImportNode {
    text: string;
    defaultImport: string | null;
    namedImports: string[];
    typeImports: string[];
    source: string;
    isTypeOnly: boolean;
    originalText: string;
    range: vscode.Range;
    group: string;
}

export interface FormattedImport {
    statement: string;
    group: ImportGroup;
    moduleName: string;
    importNames: string[];
    isTypeImport: boolean;
    isDefaultImport: boolean;
    hasNamedImports: boolean;
}
import * as ts from 'typescript';
import { parseImportsStream, generateFormattedCode } from './parser';

/**
 * Demo to show the stream-based import formatter in action
 */
function runStreamFormatterDemo(): void {
  // Example TypeScript code with various import styles
  const sampleCode = `
// Misc
import CsvDownloader  from 'react-csv-downloader';
import type { FC }    from 'react';
import type { Datas } from 'react-csv-downloader/dist/esm/lib/csv';
// DS
import {
    YpModal,
    YpElement,
    YpTypography,
    YpTable,
    YpTag,
    YpButton
} from 'ds';
// @app/dossier
import {
    StatutImportEnum,
    type TRapportLigneImport
}                            from '@app/dossier/models/RapportImportModel';
import { getKeyByValue }     from '@app/dossier/utils/enum';

type TProps = {
    isOpen: boolean;
    toggleModal: () => void;
    ligne_imports?: TRapportLigneImport[];
}

const AbsenceRapportComponent: FC<TProps> = (props) => {

    const {
        isOpen,
        toggleModal,
        ligne_imports
    } = props;

    const sortedLignes = ligne_imports?.sort(
        (a, b) => a.numero_ligne - b.numero_ligne).filter((ligne) => ligne.statut_import !== StatutImportEnum.OK);

    return (
  `;

  // Create source file
  const sourceFile = ts.createSourceFile(
    'sample.ts',
    sampleCode,
    ts.ScriptTarget.Latest,
    true
  );

  // Find all import declarations
  const importNodes: ts.ImportDeclaration[] = [];
  function visit(node: ts.Node): void {
    if (ts.isImportDeclaration(node)) {
      importNodes.push(node);
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);

  console.log(`Found ${importNodes.length} import declarations`);

  // Process imports
  console.time('Processing imports');
  const formattedImports = parseImportsStream(importNodes, sourceFile);
  console.timeEnd('Processing imports');
  
  console.log(`Processed ${formattedImports.length} formatted imports`);

  // Generate formatted code
  console.time('Generating code');
  const formattedCode = generateFormattedCode(formattedImports);
  console.timeEnd('Generating code');
  
  console.log('\n--- Original Imports ---\n');
  console.log(sampleCode);
  
  console.log('\n--- Formatted Imports ---\n');
  console.log(formattedCode);

  // Run a performance benchmark
  console.log('\n--- Performance Benchmark ---\n');
  runBenchmark(importNodes, sourceFile);
}

/**
 * Run a performance benchmark comparing different parsing strategies
 */
function runBenchmark(
  importNodes: ts.ImportDeclaration[],
  sourceFile: ts.SourceFile,
  iterations: number = 1000
): void {
  console.log(`Running benchmark with ${iterations} iterations...`);
  
  console.time('Stream parser total time');
  for (let i = 0; i < iterations; i++) {
    parseImportsStream(importNodes, sourceFile);
  }
  console.timeEnd('Stream parser total time');
  
  // Show detailed analysis of what was processed
  console.log('\n--- Import Analysis ---\n');
  
  const formattedImports = parseImportsStream(importNodes, sourceFile);
  const groupedByModule = new Map<string, FormattedImport[]>();
  
  for (const imp of formattedImports) {
    if (!groupedByModule.has(imp.moduleName)) {
      groupedByModule.set(imp.moduleName, []);
    }
    groupedByModule.get(imp.moduleName)!.push(imp);
  }
  
  for (const [module, imports] of groupedByModule.entries()) {
    console.log(`Module: ${module}`);
    console.log(`  Group: ${imports[0].group.name}`);
    
    for (const imp of imports) {
      console.log(`  Import type: ${imp.isTypeImport ? 'type' : 'regular'}`);
      console.log(`  Names: ${imp.importNames.join(', ')}`);
      console.log(`  Default import: ${imp.isDefaultImport}`);
      console.log(`  Named imports: ${imp.hasNamedImports}`);
      console.log();
    }
  }
  
  // Benefits of the stream processing approach
  console.log('\n--- Stream Processing Benefits ---\n');
  console.log('1. Functional approach with clear transformation pipeline');
  console.log('2. Each operation is isolated and can be independently tested');
  console.log('3. Better memory efficiency with fewer intermediate objects');
  console.log('4. More declarative code style focusing on data transformations');
  console.log('5. Easier to add new transformations to the pipeline');
}

// Sample type definition to resolve imports in the demo
interface FormattedImport {
  statement: string;
  group: { name: string; order: number; regex: RegExp };
  moduleName: string;
  importNames: string[];
  isTypeImport: boolean;
  isDefaultImport: boolean;
  hasNamedImports: boolean;
  emptyLinesBefore?: number;
}

// Run the demo
runStreamFormatterDemo();
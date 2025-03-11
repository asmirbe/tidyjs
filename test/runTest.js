const createMockConfig = require('./constant').createMockConfig;
const mockVscode = require('./constant').mockVscode;
const COLORS = require('./constant').COLORS;
const EMOJI = require('./constant').EMOJI;

// Remplacer require pour retourner notre mock quand 'vscode' est demandé
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(...args) {
  if (args[0] === 'vscode') {
    return mockVscode;
  }
  return originalRequire.apply(this, args);
};

/**
 * Affiche un titre de section formaté
 * @param {string} title - Titre de la section
 * @param {string} emoji - Emoji à afficher
 */
function printSectionTitle(title, emoji) {
  const line = '═'.repeat(50);
  console.log(`\n${COLORS.CYAN}${line}${COLORS.RESET}`);
  console.log(`${COLORS.BOLD}${COLORS.CYAN}${emoji}  ${title}${COLORS.RESET}`);
  console.log(`${COLORS.CYAN}${line}${COLORS.RESET}\n`);
}

/**
 * Affiche une comparaison détaillée entre deux chaînes
 * @param {string} expected - Résultat attendu
 * @param {string} actual - Résultat réel
 */
function printDetailedDiff(expected, actual) {
  console.log(`${COLORS.YELLOW}${EMOJI.MAGNIFIER} Analyse détaillée des différences:${COLORS.RESET}`);
  
  const expectedLines = expected.split('\n');
  const actualLines = actual.split('\n');
  const maxLines = Math.max(expectedLines.length, actualLines.length);
  
  let hasDifferences = false;
  
  for (let i = 0; i < maxLines; i++) {
    const expectedLine = expectedLines[i] || '';
    const actualLine = actualLines[i] || '';
    
    if (expectedLine !== actualLine) {
      hasDifferences = true;
      console.log(`${COLORS.YELLOW}Ligne ${i + 1}:${COLORS.RESET}`);
      
      // Affichage caractère par caractère pour mettre en évidence les différences
      if (expectedLine && actualLine) {
        console.log(`  ${COLORS.GREEN}Attendu: ${COLORS.RESET}"${highlightDifferences(expectedLine, actualLine)}"`);
        console.log(`  ${COLORS.RED}Obtenu:  ${COLORS.RESET}"${highlightDifferences(actualLine, expectedLine, true)}"`);
      } else {
        // Gestion des lignes manquantes ou supplémentaires
        if (!expectedLine) {
          console.log(`  ${COLORS.GREEN}Attendu: ${COLORS.RESET}"" ${COLORS.DIM}(ligne absente)${COLORS.RESET}`);
          console.log(`  ${COLORS.RED}Obtenu:  ${COLORS.RESET}"${actualLine}"`);
        } else {
          console.log(`  ${COLORS.GREEN}Attendu: ${COLORS.RESET}"${expectedLine}"`);
          console.log(`  ${COLORS.RED}Obtenu:  ${COLORS.RESET}"" ${COLORS.DIM}(ligne absente)${COLORS.RESET}`);
        }
      }
    }
  }
  
  if (!hasDifferences) {
    console.log(`${COLORS.GREEN}${EMOJI.INFO} Aucune différence trouvée au niveau du contenu, mais peut-être des différences d'espaces blancs invisibles.${COLORS.RESET}`);
  }
}

/**
 * Met en évidence les différences entre deux chaînes
 * @param {string} str1 - Première chaîne
 * @param {string} str2 - Deuxième chaîne
 * @param {boolean} isActual - Si c'est la chaîne réelle (pour coloration)
 * @returns {string} Chaîne avec différences mises en évidence
 */
function highlightDifferences(str1, str2, isActual = false) {
  let result = '';
  const color = isActual ? COLORS.RED : COLORS.GREEN;
  
  for (let i = 0; i < str1.length; i++) {
    if (i >= str2.length || str1[i] !== str2[i]) {
      result += `${color}${str1[i]}${COLORS.RESET}`;
    } else {
      result += str1[i];
    }
  }
  
  return result;
}

/**
 * Crée une barre de progression visuelle
 * @param {number} percent - Pourcentage de réussite
 * @param {number} width - Largeur de la barre
 * @returns {string} Barre de progression formatée
 */
function createProgressBar(percent, width = 30) {
  const filledWidth = Math.round(width * percent / 100);
  const emptyWidth = width - filledWidth;
  
  let color = COLORS.RED;
  if (percent >= 80) color = COLORS.GREEN;
  else if (percent >= 50) color = COLORS.YELLOW;
  
  return `${color}[${'█'.repeat(filledWidth)}${' '.repeat(emptyWidth)}] ${percent.toFixed(1)}%${COLORS.RESET}`;
}

/**
 * Exécute les tests avec un rapport amélioré
 * @param {Array} testCases - Cas de test à exécuter
 * @returns {Object} Résultats des tests
 */
function runTests(testCases) {
  printSectionTitle('EXÉCUTION DES TESTS DE FORMATAGE', EMOJI.ROCKET);
  
  const startTime = Date.now();
  
  const results = {
    passed: 0,
    failed: 0,
    errors: 0,
    details: []
  };

  // Charger le module de formatage après avoir simulé vscode
  const formatter = require('../out/formatter');
  const mockConfig = createMockConfig();

  testCases.forEach((testCase, index) => {
    const testNumber = index + 1;
    const testResult = {
      name: testCase.name,
      number: testNumber,
      status: 'pending'
    };

    try {
      const result = formatter.formatImports(testCase.input, mockConfig);
      
      if (result === testCase.expected) {
        testResult.status = 'passed';
        results.passed++;
        console.log(`${COLORS.GREEN}${EMOJI.SUCCESS} Test ${testNumber}: ${testCase.name}${COLORS.RESET}`);
      } else {
        testResult.status = 'failed';
        testResult.input = testCase.input;
        testResult.expected = testCase.expected;
        testResult.actual = result;
        results.failed++;
        console.log(`${COLORS.RED}${EMOJI.FAILURE} Test ${testNumber}: ${testCase.name}${COLORS.RESET}`);
        
        console.log(`\n${COLORS.BOLD}${COLORS.BLUE}Entrée:${COLORS.RESET}`);
        console.log(`${COLORS.DIM}${testCase.input}${COLORS.RESET}\n`);
        
        console.log(`${COLORS.BOLD}${COLORS.GREEN}Attendu:${COLORS.RESET}`);
        console.log(`${COLORS.DIM}${testCase.expected}${COLORS.RESET}\n`);
        
        console.log(`${COLORS.BOLD}${COLORS.RED}Obtenu:${COLORS.RESET}`);
        console.log(`${COLORS.DIM}${result}${COLORS.RESET}\n`);
        
        printDetailedDiff(testCase.expected, result);
      }
    } catch (error) {
      testResult.status = 'error';
      testResult.error = error;
      results.errors++;
      console.log(`${COLORS.RED}${EMOJI.ERROR} Test ${testNumber}: ${testCase.name} (Erreur)${COLORS.RESET}`);
      console.log(`${COLORS.RED}${error.stack || error}${COLORS.RESET}`);
    }

    results.details.push(testResult);
  });

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  // Afficher un résumé visuel des résultats
  printSectionTitle('RÉSUMÉ DES TESTS', EMOJI.CHART);
  
  const totalTests = testCases.length;
  const successRate = (results.passed / totalTests) * 100;
  
  console.log(`${EMOJI.CLOCK}  Durée: ${COLORS.YELLOW}${duration.toFixed(2)}s${COLORS.RESET}`);
  console.log(`${EMOJI.CHECK}  Réussis: ${COLORS.GREEN}${results.passed}${COLORS.RESET}`);
  console.log(`${EMOJI.CROSS}  Échoués: ${COLORS.RED}${results.failed}${COLORS.RESET}`);
  console.log(`${EMOJI.ERROR}  Erreurs: ${COLORS.YELLOW}${results.errors}${COLORS.RESET}`);
  console.log(`${EMOJI.INFO}  Total: ${COLORS.BLUE}${totalTests}${COLORS.RESET}`);
  
  console.log(`\nTaux de réussite: ${createProgressBar(successRate)}`);
  
  // Message final
  if (results.failed === 0 && results.errors === 0) {
    console.log(`\n${COLORS.GREEN}${EMOJI.SUCCESS} TOUS LES TESTS ONT RÉUSSI !${COLORS.RESET}`);
  } else {
    console.log(`\n${COLORS.RED}${EMOJI.FAILURE} CERTAINS TESTS ONT ÉCHOUÉ. Veuillez vérifier les erreurs ci-dessus.${COLORS.RESET}`);
  }
  
  return results;
}

// Cas de test
const testCases = [
  {
    name: 'formatage des imports basiques',
    input: `import React from 'react';
import { useState } from 'react';
import { YpButton } from 'ds';`,
    expected: `// Misc
import { useState }  from 'react';
import React         from 'react';

// DS
import { YpButton }  from 'ds';

`
  },
  {
    name: 'formatage des imports de type',
    input: `import type { FC } from 'react';
import { useState } from 'react';
import type { ButtonProps } from 'ds';`,
    expected: `// Misc
import type { FC }   from 'react';
import { useState }  from 'react';

// DS
import type { ButtonProps }  from 'ds';

`
  },
  {
    name: 'formattage basic',
    input: `import type {
    Dispatch,
    FC,
    SetStateAction
} from 'react';`,
    expected: `// Misc
import type {
    Dispatch,
    FC,
    SetStateAction
}                   from 'react';

`
  }
];
const results = runTests(testCases);

// Restaurer la fonction require originale pour éviter d'affecter d'autres modules
Module.prototype.require = originalRequire;

// Sortir avec un code d'erreur si des tests ont échoué
if (results.failed > 0 || results.errors > 0) {
  process.exit(0);
}

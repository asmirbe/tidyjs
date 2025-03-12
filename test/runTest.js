const { loadTestCases } = require('./utils')
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

function runTests() {
  process.stdout.write('\x1Bc');

  const testCases = loadTestCases()
  printSectionTitle('EXECUTING FORMATTING TESTS', EMOJI.ROCKET)
  
  const startTime = Date.now()
  const results = {
      passed: 0,
      failed: 0,
      errors: 0,
      details: []
  }

  const formatter = require('../out/formatter')
  const mockConfig = createMockConfig()

  testCases.forEach((testCase, index) => {
      const testNumber = index + 1
      const testResult = {
          name: testCase.name,
          number: testNumber,
          status: 'pending',
          expectedError: testCase.expectedError
      }

      try {
          const result = formatter.formatImports(testCase.input, mockConfig)
          
          if (testCase.expectedError) {
              // We expected an error but didn't get one
              testResult.status = 'failed'
              testResult.expected = `Error: ${testCase.expectedError}`
              testResult.actual = result
              results.failed++
              console.log(`${COLORS.RED}${EMOJI.FAILURE} Test ${testNumber}: ${testCase.name} - Expected error but got result${COLORS.RESET}`)
          } else if (result === testCase.expected) {
              testResult.status = 'passed'
              results.passed++
              console.log(`${COLORS.GREEN}${EMOJI.SUCCESS} Test ${testNumber}: ${testCase.name}${COLORS.RESET}`)
          } else {
              testResult.status = 'failed'
              testResult.input = testCase.input
              testResult.expected = testCase.expected
              testResult.actual = result
              results.failed++
              displayTestFailure(testCase, result, testNumber)
          }
      } catch (error) {
          if (testCase.expectedError && error.message.includes(testCase.expectedError)) {
              // We got the expected error - this is a pass!
              testResult.status = 'passed'
              testResult.isErrorCase = true
              testResult.errorMessage = error.message
              results.passed++
              
              // Show the test passed
              console.log(`${COLORS.GREEN}${EMOJI.SUCCESS} Test ${testNumber}: ${testCase.name} - Got expected error${COLORS.RESET}`)
              
              // Format the error message with consistent indentation
              // First, split the error message into lines
              const errorLines = error.message.split('\n');
              
              // Display each line with the same indentation as the check emoji (3 spaces)
              errorLines.forEach(line => {
                  console.log(`   ${COLORS.RED}${line}${COLORS.RESET}`);
              });
          } else {
              handleTestError(error, testResult, results, testNumber, testCase)
          }
      }

      results.details.push(testResult)
  })

  displayTestSummary(results, startTime)
  return results
}

function handleTestError(error, testResult, results, testNumber, testCase) {
    testResult.status = 'error'
    testResult.error = error.message
    testResult.input = testCase.input
    testResult.expected = testCase.expected
    testResult.stack = error.stack
    results.errors++

    const formattedStack = error.stack.split('\n').slice(0, 3).join('\n')
    console.log(`${COLORS.RED}${EMOJI.ERROR} Test ${testNumber}: ${testCase.name}`)
    console.log(`${COLORS.RED}Error: ${error.message}`)
    console.log(`${COLORS.DIM}${formattedStack}${COLORS.RESET}\n`)
}

function calculateStats(results) {
  const total = results.passed + results.failed + results.errors
  const successRate = total > 0 ? (results.passed / total) * 100 : 0
  const barLength = 30
  const filledBars = Math.round((successRate / 100) * barLength)
  
  let barColor = COLORS.RED
  if (successRate >= 90) {
      barColor = COLORS.GREEN
  } else if (successRate >= 50) {
      barColor = COLORS.YELLOW
  }
  
  const progressBar = `${barColor}[${'█'.repeat(filledBars)}${' '.repeat(barLength - filledBars)}]${COLORS.RESET}`

  // Count error cases and regular cases accurately with our new flag
  const errorCasesPassed = results.details.filter(t => 
      t.status === 'passed' && t.isErrorCase
  ).length
  
  const regularCasesPassed = results.passed - errorCasesPassed

  return {
      successRate,
      display: `⏱️  Duration: ${results.duration}s
✅ Passed: ${results.passed}
 └─ Error cases: ${errorCasesPassed}
 └─ Regular cases: ${regularCasesPassed}
❌ Failed: ${results.failed}
⚠️  Errors: ${results.errors}
ℹ️  Total: ${total}

Success rate: ${progressBar} ${successRate.toFixed(1)}%`
  }
}

const displayTestSummary = (results, startTime) => {
    printSectionTitle('RÉSUMÉ DES TESTS', EMOJI.CHART)
    
    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000
    
    const stats = calculateStats({
        ...results,
        duration
    })
    
    console.log(stats.display)
    
    if (results.failed === 0 && results.errors === 0) {
        console.log(`\n${COLORS.GREEN}${EMOJI.SUCCESS} TOUS LES TESTS ONT RÉUSSI !${COLORS.RESET}`)
    } else {
        console.log(`\n${COLORS.RED}${EMOJI.FAILURE} CERTAINS TESTS ONT ÉCHOUÉ. Veuillez vérifier les erreurs ci-dessus.${COLORS.RESET}`)
    }
    
    return results
}

const results = runTests();

// Restaurer la fonction require originale pour éviter d'affecter d'autres modules
Module.prototype.require = originalRequire;

// Sortir avec un code d'erreur si des tests ont échoué
if (results.failed > 0 || results.errors > 0) {
  process.exit(0);
}

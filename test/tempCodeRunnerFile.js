const { loadTestCases } = require('./utils')
const createMockConfig = require('./constant').createMockConfig;
const mockVscode = require('./constant').mockVscode;
const COLORS = require('./constant').COLORS;
const EMOJI = require('./constant').EMOJI;
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(...args) {
  if (args[0] === 'vscode') {
    return mockVscode;
  }
  return originalRequire.apply(this, args);
};

function printSectionTitle(title, emoji) {
  const line = '═'.repeat(50);
  console.log(`\n${COLORS.CYAN}${line}${COLORS.RESET}`);
  console.log(`${COLORS.BOLD}${COLORS.CYAN}${emoji}  ${title}${COLORS.RESET}`);
  console.log(`${COLORS.CYAN}${line}${COLORS.RESET}\n`);
}

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
      
      if (expectedLine && actualLine) {
        console.log(`  ${COLORS.GREEN}Attendu: ${COLORS.RESET}"${highlightDifferences(expectedLine, actualLine)}"`);
        console.log(`  ${COLORS.RED}Obtenu:  ${COLORS.RESET}"${highlightDifferences(actualLine, expectedLine, true)}"`);
      } else {
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

function createProgressBar(percent, width = 30) {
  const filledWidth = Math.round(width * percent / 100);
  const emptyWidth = width - filledWidth;
  
  let color = COLORS.RED;
  if (percent >= 80) color = COLORS.GREEN;
  else if (percent >= 50) color = COLORS.YELLOW;
  
  return `${color}[${'█'.repeat(filledWidth)}${' '.repeat(emptyWidth)}] ${percent.toFixed(1)}%${COLORS.RESET}`;
}

function runTests() {
  process.stdout.write('\x1Bc');

  const testCases = loadTestCases()
  printSectionTitle('EXECUTING FORMATTING TESTS', EMOJI.ROCKET)
  
  const startTime = Date.now()
  const results = {
      passed: 0,
      failed: 0,
      errors: 0,
      details: [],
      performance: []
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

      // Mesure de performance pour chaque fichier
      const fileStartTime = process.hrtime.bigint();
      
      try {
          const result = formatter.formatImports(testCase.input, mockConfig)
          
          // Calculer le temps d'exécution en millisecondes
          const fileEndTime = process.hrtime.bigint();
          const executionTimeMs = Number(fileEndTime - fileStartTime) / 1_000_000;
          
          // Stocker les informations de performance
          results.performance.push({
              name: testCase.name,
              executionTimeMs: executionTimeMs.toFixed(2)
          });
          
          // Afficher le temps d'exécution avec un code couleur basé sur la performance
          let timeColor = COLORS.GREEN;
          if (executionTimeMs > 10) timeColor = COLORS.YELLOW;
          if (executionTimeMs > 20) timeColor = COLORS.RED;
          
          if (testCase.expectedError) {
              testResult.status = 'failed'
              testResult.expected = `Error: ${testCase.expectedError}`
              testResult.actual = result
              results.failed++
              console.log(`${COLORS.RED}${EMOJI.FAILURE} Test ${testNumber}: ${testCase.name} - Expected error but got result ${timeColor}[${executionTimeMs.toFixed(2)}ms]${COLORS.RESET}`)
          } else if (result === testCase.expected) {
              testResult.status = 'passed'
              results.passed++
              console.log(`${COLORS.GREEN}${EMOJI.SUCCESS} Test ${testNumber}: ${testCase.name} ${timeColor}[${executionTimeMs.toFixed(2)}ms]${COLORS.RESET}`)
          } else {
              testResult.status = 'failed'
              testResult.input = testCase.input
              testResult.expected = testCase.expected
              testResult.actual = result
              results.failed++
              console.log(`${COLORS.RED}${EMOJI.FAILURE} Test ${testNumber}: ${testCase.name} ${timeColor}[${executionTimeMs.toFixed(2)}ms]${COLORS.RESET}`)
              displayTestFailure(testCase, result, testNumber)
          }
      } catch (error) {
          // Calculer le temps d'exécution même en cas d'erreur
          const fileEndTime = process.hrtime.bigint();
          const executionTimeMs = Number(fileEndTime - fileStartTime) / 1_000_000;
          
          // Stocker les informations de performance
          results.performance.push({
              name: testCase.name,
              executionTimeMs: executionTimeMs.toFixed(2)
          });
          
          // Afficher le temps d'exécution avec un code couleur basé sur la performance
          let timeColor = COLORS.GREEN;
          if (executionTimeMs > 10) timeColor = COLORS.YELLOW;
          if (executionTimeMs > 20) timeColor = COLORS.RED;
          
          if (testCase.expectedError && error.message.includes(testCase.expectedError)) {
              testResult.status = 'passed'
              testResult.isErrorCase = true
              testResult.errorMessage = error.message
              results.passed++
              
              console.log(`${COLORS.GREEN}${EMOJI.SUCCESS} Test ${testNumber}: ${testCase.name} - Got expected error ${timeColor}[${executionTimeMs.toFixed(2)}ms]${COLORS.RESET}`)
              
              const errorLines = error.message.split('\n');
              
              errorLines.forEach(line => {
                  console.log(`   ${COLORS.RED}${line}${COLORS.RESET}`);
              });
          } else {
              handleTestError(error, testResult, results, testNumber, testCase)
              console.log(`   ${timeColor}[${executionTimeMs.toFixed(2)}ms]${COLORS.RESET}`);
          }
      }

      results.details.push(testResult)
  })

  // Afficher un résumé des performances
  printSectionTitle('PERFORMANCE SUMMARY', EMOJI.STOPWATCH)
  
  // Trier les résultats de performance par temps d'exécution (du plus lent au plus rapide)
  const sortedPerformance = [...results.performance].sort((a, b) => 
      parseFloat(b.executionTimeMs) - parseFloat(a.executionTimeMs)
  );
  
  // Afficher les 5 fichiers les plus lents
  console.log(`${COLORS.BOLD}${COLORS.YELLOW}Top 5 des fichiers les plus lents:${COLORS.RESET}`);
  for (let i = 0; i < Math.min(5, sortedPerformance.length); i++) {
      const perf = sortedPerformance[i];
      let timeColor = COLORS.GREEN;
      if (parseFloat(perf.executionTimeMs) > 10) timeColor = COLORS.YELLOW;
      if (parseFloat(perf.executionTimeMs) > 20) timeColor = COLORS.RED;
      console.log(`${i + 1}. ${perf.name}: ${timeColor}${perf.executionTimeMs}ms${COLORS.RESET}`);
  }
  
  // Calculer et afficher la moyenne
  const totalTime = results.performance.reduce((sum, perf) => sum + parseFloat(perf.executionTimeMs), 0);
  const averageTime = totalTime / results.performance.length;
  let avgTimeColor = COLORS.GREEN;
  if (averageTime > 10) avgTimeColor = COLORS.YELLOW;
  if (averageTime > 20) avgTimeColor = COLORS.RED;
  console.log(`\n${COLORS.BOLD}Temps moyen: ${avgTimeColor}${averageTime.toFixed(2)}ms${COLORS.RESET}`);
  
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
 
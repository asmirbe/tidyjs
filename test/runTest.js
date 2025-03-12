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
  console.log(`${COLORS.BOLD}${COLORS.CYAN}${emoji} ${title}${COLORS.RESET}`);
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

      
      const fileStartTime = process.hrtime.bigint();
      
      try {
          const result = formatter.formatImports(testCase.input, mockConfig)
          
          
          const fileEndTime = process.hrtime.bigint();
          const executionTimeMs = Number(fileEndTime - fileStartTime) / 1_000_000;
          
          
          results.performance.push({
              name: testCase.name,
              executionTimeMs: executionTimeMs.toFixed(2)
          });
          
          if (testCase.expectedError) {
              testResult.status = 'failed'
              testResult.expected = `Error: ${testCase.expectedError}`
              testResult.actual = result
              results.failed++
              console.log(`${COLORS.RED}${EMOJI.FAILURE} Test ${testNumber}: ${testCase.name} - Expected error but got result ${COLORS.DIM}[${executionTimeMs.toFixed(2)}ms]${COLORS.RESET}`)
          } else if (result === testCase.expected) {
              testResult.status = 'passed'
              results.passed++
              console.log(`${COLORS.GREEN}${EMOJI.SUCCESS} Test ${testNumber}: ${testCase.name} ${COLORS.DIM}[${executionTimeMs.toFixed(2)}ms]${COLORS.RESET}`)
          } else {
              testResult.status = 'failed'
              testResult.input = testCase.input
              testResult.expected = testCase.expected
              testResult.actual = result
              results.failed++
              console.log(`${COLORS.RED}${EMOJI.FAILURE} Test ${testNumber}: ${testCase.name} ${COLORS.DIM}[${executionTimeMs.toFixed(2)}ms]${COLORS.RESET}`)
              displayTestFailure(testCase, result, testNumber)
          }
      } catch (error) {
          
          const fileEndTime = process.hrtime.bigint();
          const executionTimeMs = Number(fileEndTime - fileStartTime) / 1_000_000;
          
          
          results.performance.push({
              name: testCase.name,
              executionTimeMs: executionTimeMs.toFixed(2)
          });
          
          if (testCase.expectedError && error.message.includes(testCase.expectedError)) {
              testResult.status = 'passed'
              testResult.isErrorCase = true
              testResult.errorMessage = error.message
              results.passed++
              
              console.log(`${COLORS.GREEN}${EMOJI.SUCCESS} Test ${testNumber}: ${testCase.name} - Got expected error ${COLORS.DIM}[${executionTimeMs.toFixed(2)}ms]${COLORS.RESET}`)
              
              const errorLines = error.message.split('\n');
              
              errorLines.forEach(line => {
                  console.log(`   ${COLORS.RED}${line}${COLORS.RESET}`);
              });
          } else {
              handleTestError(error, testResult, results, testNumber, testCase)
              console.log(`   ${COLORS.DIM}[${executionTimeMs.toFixed(2)}ms]${COLORS.RESET}`);
          }
      }

      results.details.push(testResult)
  })

  
  const totalTime = results.performance.reduce((sum, perf) => sum + parseFloat(perf.executionTimeMs), 0);
  const averageTime = totalTime / results.performance.length;
  console.log(`\n${COLORS.BOLD}Temps moyen d'exécution: ${COLORS.DIM}${averageTime.toFixed(2)}ms${COLORS.RESET}`);
  
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

Module.prototype.require = originalRequire;

if (results.failed > 0 || results.errors > 0) {
  process.exit(0);
}

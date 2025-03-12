const fs = require('fs')
const path = require('path')

function loadTestCases() {
  const inputDir = path.join(__dirname, 'fixtures/input')
  const expectedDir = path.join(__dirname, 'fixtures/expected')
  const errorDir = path.join(__dirname, 'fixtures/errors')
  const testCases = []

  if (!fs.existsSync(errorDir)) {
      fs.mkdirSync(errorDir, { recursive: true })
  }

  const inputFiles = fs.readdirSync(inputDir)
      .filter(file => file.endsWith('.tsx'))

  for (const file of inputFiles) {
      const name = path.basename(file, '.tsx')
      const input = fs.readFileSync(path.join(inputDir, file), 'utf8')
      
      const errorFile = path.join(errorDir, `${name}.tsx`)
      
      if (fs.existsSync(errorFile)) {
          const errorContent = fs.readFileSync(errorFile, 'utf8')
          const expectedError = errorContent.match(/\/\/\s*(.+)/)
          if (expectedError) {
              testCases.push({
                  name,
                  input,
                  expected: null,
                  expectedError: expectedError[1].trim()
              })
          }
      } else {
          const expectedFile = path.join(expectedDir, file)
          if (fs.existsSync(expectedFile)) {
              testCases.push({
                  name,
                  input,
                  expected: fs.readFileSync(expectedFile, 'utf8')
              })
          }
      }
  }

  return testCases
}

const mockVscode = {
  window: {
    createOutputChannel: (name) => ({
      name,
      appendLine: () => {},
      show: () => {},
      dispose: () => {},
      clear: () => {},
      replace: () => {},
      append: () => {},
      hide: () => {},
    }),
    showErrorMessage: (msg) => console.error(`[VSCode Error]: ${msg}`),
    showInformationMessage: (msg) => console.log(`[VSCode Info]: ${msg}`),
  },
  workspace: {
    getConfiguration: (section) => ({
      get: (key) => {
        const config = {
          importFormatter: {
            groups: [
              { name: "Misc", regex: "^(react|react-.*|lodash)$", order: 0 },
              { name: "DS", regex: "^ds$", order: 1 },
              { name: "@app", regex: "^@app$", order: 2 },
            ],
            alignmentSpacing: 1,
          },
        };

        return config[section]?.[key] || null;
      },
    }),
  },
  EventEmitter: class EventEmitter {
    constructor() {
      this.listeners = [];
    }
    event = (listener) => {
      this.listeners.push(listener);
      return { dispose: () => {} };
    };
    fire = (data) => {
      this.listeners.forEach((listener) => listener(data));
    };
  },
  Position: class Position {
    constructor(line, character) {
      this.line = line;
      this.character = character;
    }
  },
  Range: class Range {
    constructor(startLine, startCharacter, endLine, endCharacter) {
      this.start = { line: startLine, character: startCharacter };
      this.end = { line: endLine, character: endCharacter };
    }
  },
  commands: {
    registerCommand: (id, handler) => ({
      dispose: () => {},
      id,
      handler,
    }),
  },
};

function createMockConfig() {
  return {
    importGroups: [
      {
        name: "Misc",
        regex:
          /^(react|react-.*|lodash|date-fns|classnames|@fortawesome|@reach|uuid|@tanstack|ag-grid-community|framer-motion)$/,
        order: 0,
      },
      { name: "DS", regex: /^ds$/, order: 1 },
      { name: "@app/dossier", regex: /^@app\/dossier/, order: 2 },
      { name: "@app", regex: /^@app/, order: 2 },
      { name: "@core", regex: /^@core/, order: 3 },
      { name: "@library", regex: /^@library/, order: 4 },
      { name: "Utils", regex: /^yutils/, order: 5 },
    ],
    alignmentSpacing: 1,
    regexPatterns: {
      importLine: /^\s*import\s+.*?(?:from\s+['"][^'"]+['"])?\s*;?.*$/gm,
      sectionComment:
        /^\s*\/\/\s*(?:Misc|DS|@app(?:\/[a-zA-Z0-9_-]+)?|@core|@library|Utils|.*\b(?:misc|ds|dossier|client|notification|core|library|utils)\b.*)\s*$/gim,
      importFragment:
        /^\s*([a-zA-Z0-9_]+,|[{}],?|\s*[a-zA-Z0-9_]+,?|\s*[a-zA-Z0-9_]+\s+from|\s*from|^[,}]\s*)$/,
      sectionCommentPattern:
        /^\s*\/\/\s*(?:Misc|DS|@app(?:\/[a-zA-Z0-9_-]+)?|@core|@library|Utils)/,
      anyComment: /^\s*\/\//,
      typeDeclaration: /^type\s+[A-Za-z0-9_]+(<.*>)?\s*=/,
      codeDeclaration:
        /^(interface|class|enum|function|const|let|var|export)\s+[A-Za-z0-9_]+/,
      orphanedFragments:
        /(?:^\s*from|^\s*[{}]|\s*[a-zA-Z0-9_]+,|\s*[a-zA-Z0-9_]+\s+from)/gm,
      possibleCommentFragment:
        /^\s*[a-z]{1,5}\s*$|^\s*\/?\s*[A-Z][a-z]+\s*$|(^\s*\/+\s*$)/,
      appSubfolderPattern: /^@app\/([a-zA-Z0-9_-]+)/,
    },
  };
}

function runTests(testCases, formatterModule) {
  const formatter = formatterModule || require("../out/formatter");
  const mockConfig = createMockConfig();

  const results = {
    passed: 0,
    failed: 0,
    errors: 0,
    details: [],
  };

  console.log(`Running ${testCases.length} tests...\n`);

  testCases.forEach((testCase, index) => {
    const testNumber = index + 1;
    const testResult = {
      name: testCase.name,
      number: testNumber,
      status: "pending",
    };

    try {
      const result = formatter.formatImports(testCase.input, mockConfig);

      if (result === testCase.expected) {
        testResult.status = "passed";
        results.passed++;
        console.log(`✅ Test ${testNumber}: ${testCase.name}`);
      } else {
        testResult.status = "failed";
        testResult.input = testCase.input;
        testResult.expected = testCase.expected;
        testResult.actual = result;
        results.failed++;
        console.log(`❌ Test ${testNumber}: ${testCase.name}`);
        console.log(`Input:\n${testCase.input}\n`);
        console.log(`Expected:\n${testCase.expected}\n`);
        console.log(`Actual:\n${result}\n`);

        const expectedLines = testCase.expected.split("\n");
        const actualLines = result.split("\n");
        const maxLines = Math.max(expectedLines.length, actualLines.length);

        for (let i = 0; i < maxLines; i++) {
          const expectedLine = expectedLines[i] || "";
          const actualLine = actualLines[i] || "";

          if (expectedLine !== actualLine) {
            console.log(`Line ${i + 1}:`);
            console.log(`  Expected: "${expectedLine}"`);
            console.log(`  Actual:   "${actualLine}"`);
          }
        }
      }
    } catch (error) {
      testResult.status = "error";
      testResult.error = error;
      results.errors++;
      console.log(`❌ Test ${testNumber}: ${testCase.name} (Error)`);
      console.log(error);
    }

    results.details.push(testResult);
  });

  console.log(
    `\nTest Results: ${results.passed} passed, ${results.failed} failed, ${results.errors} errors`
  );

  return results;
}

function loadFixture(filename) {
  const fixturePath = path.join(__dirname, "fixtures", filename);
  try {
    return fs.readFileSync(fixturePath, "utf8");
  } catch (err) {
    console.error(`Could not load test fixture: ${filename}`);
    return "";
  }
}

module.exports = {
  mockVscode,
  createMockConfig,
  runTests,
  loadFixture,
  loadTestCases
};
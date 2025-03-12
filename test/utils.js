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
  loadFixture,
  loadTestCases
};
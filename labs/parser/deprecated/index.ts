import { formatImports, FormatterConfig } from './parser';

// Test the import formatter with various examples
function testImportFormatter() {
  console.log('Testing Import Parser and Formatter\n');
  
  // Sample code with various import styles
  const sampleCode = `
// External libraries
import React, { useState, useEffect, type FC, useCallback, /* important hook */ useRef } from 'react';
import * as lodash from 'lodash';
import axios from 'axios'; // HTTP client

// Design system components
import { Button, Card, Modal } from 'ds';

// App core modules
import { 
  getUser, 
  updateUser, 
  type UserProfile,
  type UserPreferences
} from '@core/user';
import type { Theme, ColorScheme } from '@core/theme';
import { formatDate } from '@library/date-utils';
import { logger } from '@library/logging';

// App-specific modules
import { ClientComponent } from '@app/client/components';
import { DossierService } from '@app/dossier/services';
import { NotificationManager } from '@app/notification/managers';

// Utilities
import { sanitize, escape, type HtmlOptions } from 'yutils/html';
import { debounce } from 'yutils/performance';

// Styles
import './styles.css';

// This is not an import
const Component = () => {
  // Component code...
};
  `;
  
  // Configure the formatter with advanced options
  const config: Partial<FormatterConfig> = {
    importGroups: [
      { name: 'React', regex: /^react(-dom)?$/, order: 0 },
      { name: 'External', regex: /^(?!(@core|@library|@app|yutils|ds|\.))/i, order: 1 },
      { name: 'Design System', regex: /^ds$/, order: 2 },
      { name: 'Core', regex: /^@core/, order: 3 },
      { name: 'Library', regex: /^@library/, order: 4 },
      { name: 'Utils', regex: /^yutils/, order: 5 },
      { name: 'Styles', regex: /\.css$/, order: 6 }
    ],
    alignmentSpacing: true,
    indentSize: 4,
    singleLineNamedImportLimit: 1,
    preserveSectionComments: true,
    preserveLeadingComments: true,
    preserveTrailingComments: true,
    emptyLinesBetweenGroups: 1,
    splitDefaultAndNamed: true,
    useMultipleLines: true,
    useTypeImports: true,
    sortImportsByLength: true,
    regexPatterns: {
      appSubfolderPattern: /@app\/([^/]+)/,
      typeDeclaration: /^type\s+/,
      codeDeclaration: /^(const|let|var|function|class|interface|enum)\s+/
    }
  };
  
  // Format the imports
  console.log('Original code:');
  console.log('=============');
  console.log(sampleCode);
  
  console.log('\nFormatted code:');
  console.log('==============');
  const formattedCode = formatImports(sampleCode, config);
  console.log(formattedCode);
  
  // Test specific formatting features
  console.log('\nTesting specific formatting features:');
  console.log('===================================');
  
  // Test 1: Alignment of from keywords
  const alignmentTest = `
import React from 'react';
import { veryLongNamedImport, anotherLongName } from 'some-module';
import shortName from 'short';
`;
  
  console.log('\nAlignment test:');
  console.log(formatImports(alignmentTest, config));
  
  // Test 2: Multi-line formatting
  const multilineTest = `
import { one, two, three, four, five, six, seven, eight, nine, ten } from 'numbers';
`;
  
  console.log('\nMulti-line formatting:');
  console.log(formatImports(multilineTest, config));
  
  // Test 3: Type imports
  const typeImportsTest = `
import { Component, type Props, type State } from 'component';
import type { Config } from 'config';
`;
  
  console.log('\nType imports:');
  console.log(formatImports(typeImportsTest, config));
  
  // Test 4: Dynamic app subfolders
  const dynamicGroupsTest = `
import { UserService } from '@app/user/services';
import { ProfileComponent } from '@app/profile/components';
import { AccountAPI } from '@app/account/api';
`;
  
  console.log('\nDynamic groups:');
  console.log(formatImports(dynamicGroupsTest, config));
  
  // Test 5: Comments preservation
  const commentsTest = `
// Important React import
import React from 'react'; // Core React
// Component import
import { Component } from 'react'; // React Component
`;
  
  console.log('\nComments preservation:');
  console.log(formatImports(commentsTest, config));
  
  // Test 6: Side-effect imports
  const sideEffectTest = `
import 'normalize.css';
import React from 'react';
import 'custom-polyfills';
`;
  
  console.log('\nSide-effect imports:');
  console.log(formatImports(sideEffectTest, config));
}

// Run the tests
testImportFormatter();
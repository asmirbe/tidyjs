// Test case for dynamic imports issue

// Test case that reproduces the issue
const dynamicImportTest = {
  name: 'formatage avec imports dynamiques',
  input: `// Regular imports at the top
import React from 'react';
import { useState } from 'react';
import type { FC } from 'react';

// Dynamic imports
const DynamicComponent = React.lazy(() => import('./DynamicComponent'));
const module = await import('./dynamicModule');

// Static import AFTER dynamic imports (causing the problem)
import '../../style.css';

// Rest of component code
const Component = () => {
  return <div>Test</div>;
};`,
  expected: `// Misc
import type { FC }   from 'react';
import React         from 'react';
import { useState }  from 'react';

// Dynamic imports
const DynamicComponent = React.lazy(() => import('./DynamicComponent'));
const module = await import('./dynamicModule');

// Static import AFTER dynamic imports (should be preserved)
import '../../style.css';

// Rest of component code
const Component = () => {
  return <div>Test</div>;
};`
};

module.exports = dynamicImportTest;

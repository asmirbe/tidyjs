// Misc
import React        from 'react';
import { useState } from 'react';
import type { FC }  from 'react';

const DynamicComponent = React.lazy(() => import('./DynamicComponent'));
const module = await import('./dynamicModule');

import '../../style.css';

const DynamicImports: FC = () => {
  const [state, setState] = useState(0);

  return (
    <div>
      <button onClick={() => setState(state + 1)}>Increment</button>
      <DynamicComponent />
    </div>
  );
};
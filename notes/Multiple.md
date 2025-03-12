### List of tasks to improve formatter :

---
✅: Fait
**Task 1: Alphabetical and Length-based Import Alignment**
- Align all imports alphabetically by import name.
- Within each alphabetical order, align imports by the length of their import names (longest to shortest).
- Group imports clearly by their path.
- Example:
```typescript
import AbsenceInitFormComponent                       from '@app/dossier/components/absences/init/AbsenceInitFormComponent';
import AbsenceParamFormComponent                      from '@app/dossier/components/absences/param/AbsenceParamFormComponent';
import AbsenceRecapDetailComponent                    from '@app/dossier/components/absences/recap/AbsenceRecapDetailComponent';
```
---
✅: Fait
**Task 2: Grouping Related Imports**
- Keep related imports together based on their path similarity.
- Example:
```typescript
// Grouped by similarity
import AbsenceDsnComponent                            from '@app/dossier/components/absences/dsn/AbsenceDsnComponent';
import AbsenceImportFormComponent                     from '@app/dossier/components/absences/import/AbsenceImportFormComponent';
```
---
~~✅: Fait~~
**Task 3: Aligning "from" Keywords**
- Align the keyword `from` based on the longest import name, followed by one space character.
- Ensure consistent alignment across all import statements.
---
⌛️: En cours
**Task 4: Import Order Rules**
- Always place imports  from `react` default first then named, followed by React type imports (`type`), and finally other miscellaneous imports.
- Example:
```typescript
// React imports first
import { useState, useEffect }                        from 'react';
import type { FC }                                    from 'react';

// Followed by miscellaneous imports
import { debounce }                                   from 'lodash';
```
---
✅: Fait
**Task 5: Handling Side-effect Imports**
- Keep and do not remove side-effect imports (e.g., `import '../../style.css';`).
---
⌛️: En cours
**Task 6: Line Length Enforcement**
- Ensure no import line exceeds 150 characters.
- Make the maximum line length configurable via an option named `tidyimport.maxLineLength`.
- Add a newline to break the line in 2 lines e.g

```JS
import AbsenceRecapDetailComponent                    from '@app/dossier/components/absences/recap/AbsenceRecapDetailComponent';
```
---
✅: Fait
**Task 7: Adjusting Import Grouping Regex**
- Update regex rules to categorize and group imports correctly, following the below grouping structure:
```
"react-csv-downloader", // Misc
"react",                // Misc
"ds",                   // DS
"@app",                 // @app
"classnames",           // Misc
"date-fns",             // Misc
"@fortawesome",         // Misc
"lodash",               // Misc
"@reach",               // Misc
"uuid",                 // Misc
"@tanstack",            // Misc
"@core",                // @core
"@library",             // @library
"yutils",               // Utils
"react-hook-form-new",  // Misc
"ag-grid-community",    // Misc
"react-hook-form",      // Misc
"framer-motion"         // Misc
```

**Task Summary:**
- Clearly organize and align imports alphabetically and by length.
- Group related imports based on their paths.
- Prioritize React and its types.
- Preserve side-effect imports.
- Enforce configurable line length limits.
- Adjust and clarify import grouping rules.


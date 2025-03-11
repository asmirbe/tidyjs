// Misc
import type { FC }     from 'react';
// DS
import { YpElement } from 'ds';
// @app/dossier
import CumulGridComponent   from '@app/dossier/components/cumuls/CumulGridComponent';
import TypeEvpGrilleEnum    from '@app/dossier/models/enums/TypeEvpGrilleEnum';
import useCumulEvpDetail    from '@app/dossier/providers/cumuls/PeriodeCumulDetailProvider';
import usePeriodesEvpList   from '@app/dossier/providers/evp/PeriodesEvpListProvider';
import useSalariesEvpsList  from '@app/dossier/providers/salaries/SalariesEvpsListProvider';
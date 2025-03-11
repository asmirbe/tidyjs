// Misc
import format       from 'date-fns/format';
import {
    useEffect,
    type FC
}                   from 'react';
// DS
import {
    YpElement,
    useYpWrapperContext
} from 'ds';
// @app/dossier
import EvpGridComponent          from '@app/dossier/components/evp/saisieManuelle/EvpGridComponent';
import TypeEvpGrilleEnum         from '@app/dossier/models/enums/TypeEvpGrilleEnum';
import usePeriodesEvpList        from '@app/dossier/providers/evp/PeriodesEvpListProvider';
import useSalariesEvpsList       from '@app/dossier/providers/salaries/SalariesEvpsListProvider';
import usePeriodeEvpDetail       from '@app/dossier/providers/evp/PeriodeEvpDetailProvider';
import type DossierModel         from '@app/dossier/models/DossierModel';
import type PeriodesEvpListModel from '@app/dossier/models/PeriodesEvpListModel';
// Misc libs
import { memo }     from 'react';
import { navigate } from '@reach/router';
import type {
    FC,
    Dispatch,
    SetStateAction
}                   from 'react';
// DS
import {
    YpButton,
    YpDivider,
    YpElement,
    YpMultiSelect,
    YpSkeleton
}                               from 'ds';
import type { TYpSelectOption } from 'ds';
// @app/dossier
import DualSearchWithPopulation         from '@app/dossier/components/base/DualSearchWithPopulation';
import SalariesTabsComponent            from '@app/dossier/components/salaries/SalariesTabsComponent';
import { useDossierContext }            from '@app/dossier/providers/contexts/DossierContextProvider';
import useFichesHistorisationList       from '@app/dossier/providers/fiches/FichesHistorisationListProvider';
import { moduleRoute as DossierModule } from '@app/dossier/resources/common/Router';
import { getValorisationByPropertyKey } from '@app/dossier/utils/fiche';
import type { TSalariesCount }          from '@app/dossier/components/salaries/SalariesTabsComponent';
import type { TTabsType }               from '@app/dossier/components/salaries/SalariesTableComponent';
import type PopulationModel             from '@app/dossier/models/populations/PopulationModel';
import type SalariesGroupByIndListModel from '@app/dossier/models/SalariesGroupByIndListModel';
// @core
import { useUserContext } from '@core/providers/contexts/UserContextProvider';
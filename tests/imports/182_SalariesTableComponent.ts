// Misc
import {
    memo,
    useMemo,
    useState,
    useEffect
}                   from 'react';
import cn           from 'classnames';
import {
    map,
    find,
    uniq,
    filter,
    reject,
    flatten,
    forEach,
    isEmpty,
    isEqual
}                   from 'lodash';
import type {
    FC,
    Dispatch,
    SetStateAction
}                   from 'react';
// DS
import {
    YpAlert,
    YpButton,
    YpElement,
    YpTooltip,
    useYpModal,
    YpSkeleton,
    YpDataTable,
    YpTypography,
    YpSkeletonList,
    YpConfirmModal,
    useToastContext,
    useYpWrapperContext
} from 'ds';
// @app/dossier
import SalariesRapportDeletionModal        from '@app/dossier/components/salaries/SalariesRapportDeletionModal';
import { useSalariesColumn }               from '@app/dossier/components/salaries/SalariesTableDefinition';
import SalariesMenuComponent               from '@app/dossier/components/salaries/SalariesMenuComponent';
import useIndividusMultiDeletion           from '@app/dossier/providers/fiches/individus/IndividusMultiDeletionProvider';
import { useFicheDelete }                  from '@app/dossier/providers/fiches/FicheDeleteProvider';
import useFichesHistorisationList          from '@app/dossier/providers/fiches/FichesHistorisationListProvider';
import { useReferencialContext }           from '@app/dossier/providers/referencial/ReferencialContextProvider';
import type { TSalariesCount }             from '@app/dossier/components/salaries/SalariesTabsComponent';
import type PopulationModel                from '@app/dossier/models/populations/PopulationModel';
import type HistorisationModel             from '@app/dossier/models/fiches/HistorisationModel';
import type SalariesGroupByIndListModel    from '@app/dossier/models/SalariesGroupByIndListModel';
// @core
import { useUserContext }           from '@core/providers/contexts/UserContextProvider';
import type { TDataProviderReturn } from '@core/models/ProviderModel';
import type { TErrorModel }         from '@core/models/ErrorModel';
// @library
import { useTable }                 from '@library/utils/table';
import { useSearchSalariesWithPop } from '@library/utils/search';
// Utils
import { conjugate } from 'yutils/text';
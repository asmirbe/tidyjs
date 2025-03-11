// Misc
import {
    useState,
    useEffect
}                      from 'react';
import {
    find,
    isEmpty,
    map
}                      from 'lodash';
import { LayoutGroup } from 'framer-motion';
import type {
    FC,
    Dispatch,
    SetStateAction
}                      from 'react';
// DS
import {
    YpContentSwitcher,
    YpContentSwitcherItem,
    YpDivider,
    YpElement,
    YpFormModal
} from 'ds';
// @app/dossier
import FicheModalFormComponent              from '@app/dossier/components/fiches/FicheModalFormComponent';
import TempsTravailTabComponent             from '@app/dossier/components/fiches/contrat/TempsTravailTabComponent';
import ClassificationTabComponent           from '@app/dossier/components/fiches/contrat/ClassificationTabComponent';
import { conventionCodeDuTravail }          from '@app/dossier/pages/creationSalarie/CreationSalariePage';
import useFichesHistorisationFilteredList   from '@app/dossier/providers/fiches/FichesHistorisationFilteredListProvider';
import { useDossierContext }                from '@app/dossier/providers/contexts/DossierContextProvider';
import { useReferencialContext }            from '@app/dossier/providers/referencial/ReferencialContextProvider';
import {
    getDCByCodes,
    getDCDirtyReport,
    getListFieldRules,
    getDCListFromAdditionnalsGroupements,
    getValorisationByPropertyKey
}                                           from '@app/dossier/utils/fiche';
import type FicheFormModel                  from '@app/dossier/models/fiches/FicheFormModel';
import type ContratModel                    from '@app/dossier/models/fiches/contrat/ContratModel';
import type FicheModel                      from '@app/dossier/models/fiches/FicheModel';
import type HistorisationModel              from '@app/dossier/models/fiches/HistorisationModel';
import type { TConventionsTags }            from '@app/dossier/pages/creationSalarie/CreationSalariePage';
import type {
    TFicheFormActions,
    TFicheFormAdditionals
}                                           from '@app/dossier/providers/fiches/FicheFormProvider';
// @core
import type {
    WsDataModel,
    TActionProviderReturn
} from '@core/models/ProviderModel';
// @library
import type FormFieldModel from '@library/form/models/FormFieldModel';
// Utils
import { getTextPreview } from 'yutils/text';
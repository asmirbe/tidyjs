// Misc
import cn           from 'classnames';
import {
    keys,
    map,
    reject
}                   from 'lodash';
import {
    type FC,
    type MouseEvent
}                   from 'react';
// DS
import {
    YpButton,
    YpDivider,
    YpElement,
    YpSkeleton,
    YpSkeletonList,
    YpThumbnail,
    YpTypography
} from 'ds';
// @app/dossier
import WCDEtablissementDetailComponent             from '@app/dossier/components/creation-dossier/WCDEtablissementDetailComponent';
import FicheMultiFormComponent                     from '@app/dossier/components/fiches/FicheMultiFormComponent';
import EtablissementFormModel                      from '@app/dossier/models/fiches/etablissement/EtablissementFormModel';
import { useDossierContext }                       from '@app/dossier/providers/contexts/DossierContextProvider';
import {
    getListFieldRules,
    getDCListFromAdditionnalsGroupements
}                                                  from '@app/dossier/utils/fiche';
import type FicheFormModel                         from '@app/dossier/models/fiches/FicheFormModel';
import type EtablissementMultiFormModel            from '@app/dossier/models/fiches/etablissement/EtablissementMultiFormModel';
import type { TFicheMultiFormActions }             from '@app/dossier/providers/fiches/FicheMultiFormProvider';
import type { TWCDEtablissementDetailAdditionals } from '@app/dossier/providers/creation-dossier/WCDEtablissementsProvider';
// @library
import FormContextProvider from '@library/form/providers/FormProvider';
import FormComponent       from '@library/form/components/FormComponent';
// @core
import type { TActionProviderReturn } from '@core/models/ProviderModel';
// Utils
import {
    formattedSiren,
    getTextPreview
} from 'yutils/text';
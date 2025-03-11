// Misc Libs
import {
    Fragment,
    useState
}                          from 'react';
import {
    keys,
    reject
}                          from 'lodash';
import cn                  from 'classnames';
import { v4 as uuidv4  }   from 'uuid';
import type {
    FC,
    Dispatch,
    SetStateAction,
    MouseEvent
}                          from 'react';
// DS
import {
    YpButton,
    YpElement,
    YpSkeleton,
    YpFormModal,
    YpTypography,
    YpSkeletonList
} from 'ds';
// @app/dossier
import AffiliationFormComponent         from '@app/dossier/components/fiche-salarie/detail/affiliation/AffiliationFormComponent';
import AffiliationFormDetailComponent   from '@app/dossier/components/fiche-salarie/detail/affiliation/AffiliationFormDetailComponent';
import AffiliationFormModel             from '@app/dossier/models/fiches/affiliation/AffiliationFormModel';
import { useDossierContext }            from '@app/dossier/providers/contexts/DossierContextProvider';
import { useReferencialContext }        from '@app/dossier/providers/referencial/ReferencialContextProvider';
import type TypeCotisationModel         from '@app/dossier/models/adhesions/cotisations/TypeCotisationModel';
import type { TAffiliationFormActions } from '@app/dossier/providers/fiches/affiliations/AffiliationMultiFormProvider';
import type {
    TAffiliationsAdditionals,
    TAdhesionTypesWithFamille
}                                       from '@app/dossier/providers/fiches/affiliations/AffiliationsListProvider';
import type {
    TCotisationPlage,
    TCotisationPlageDispense
}                                       from '@app/dossier/models/fiches/affiliation/AffiliationAllModel';
import type AffiliationModel            from '@app/dossier/models/fiches/affiliation/AffiliationModel';
import type CotisationModel             from '@app/dossier/models/fiches/affiliation/CotisationModel';
// @core
import type {
    WsDataModel,
    TDataProviderReturn,
    TActionProviderReturn
} from '@core/models/ProviderModel';
// @library
import FormComponent                from '@library/form/components/FormComponent';
import FormContextProvider          from '@library/form/providers/FormProvider';
import {
    getDCByCodes,
    getValorisationByPropertyKey
}                                   from '@library/form-new/test/providers/fiches/utils/fiche';
import type ContratModel            from '@library/form-new/test/models/ContratModel';
// Utils
import { getTextPreview } from 'yutils/text';
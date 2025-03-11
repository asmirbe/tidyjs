// Misc
import {
    useMemo,
    useState,
    useEffect,
    useCallback
}                       from 'react';
import {
    map,
    filter,
    isEmpty
}                       from 'lodash';
import type {
    FC,
    Dispatch,
    SetStateAction
}                       from 'react';
// DS
import {
    YpAlert,
    YpElement,
    YpStepper,
    YpSkeleton,
    YpTypography,
    YpSkeletonList
}                                 from 'ds';
import type { TYpStepperHandler } from 'ds';
// @app/dossier
import OCActivationFormComponent            from '@app/dossier/components/adhesions/oc/activation/OCActivationFormComponent';
import OCConfigurationFormComponent         from '@app/dossier/components/adhesions/oc/configuration/OCConfigurationFormComponent';
import OCDesactivationDSNFormComponent      from '@app/dossier/components/adhesions/oc/desactivation_dsn/OCDesactivationDSNFormComponent';
import OCContratsCotisationListComponent    from '@app/dossier/components/adhesions/oc/cotisations/OCContratsCotisationListComponent';
import OCEtablissementPayeurFormComponent   from '@app/dossier/components/adhesions/oc/paiements/OCEtablissementsPayeursFormComponent';
import useOCDetail                          from '@app/dossier/providers/adhesions/oc/OCDetailProvider';
import useOCDispenseDetail                  from '@app/dossier/providers/adhesions/oc/dispense/OCDispenseDetailProvider';
import useOCCotisationsList                 from '@app/dossier/providers/adhesions/oc/cotisations/OCCotisationsListProvider';
import useOCActivationDetail                from '@app/dossier/providers/adhesions/oc/activation/OCActivationDetailProvider';
import useOCDesactivationDSNDetail          from '@app/dossier/providers/adhesions/oc/desactivation_dsn/OCDesactivationDSNDetailProvider';
import useOCEtablissementsPayeursList       from '@app/dossier/providers/adhesions/oc/paiements/OCEtablissementsPayeursListProvider';
import type OCFormModel                     from '@app/dossier/models/adhesions/cotisations/put/OCFormModel';
import type AdhesionCommonModel             from '@app/dossier/models/AdhesionCommonModel';
import type TableReferenceModel             from '@app/dossier/models/TableReferenceModel';
// @core
import { WsDataModel } from '@core/models/ProviderModel';
// @library
import type EtablissementModel from '@library/form-new/test/models/EtablissementModel';
// Utils
import { getTextPreview } from 'yutils/text';
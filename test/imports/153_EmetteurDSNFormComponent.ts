// Misc
import {
    useEffect,
    type FC
} from 'react';
// DS
import {
    YpIcon,
    YpButton,
    YpDivider,
    YpElement,
    YpTypography,
    YpSkeletonList,
    YpConfirmModal
} from 'ds';
// @app/dossier
import EmetteurDSNModel                     from '@app/dossier/models/EmetteurDSNModel';
import useEmetteurDSNActions                from '@app/dossier/providers/parametrage-dossier/administration/emetteur-dsn/EmetteurDSNActionsProvider';
import type { TEmetteurDSNFormActions }     from '@app/dossier/providers/parametrage-dossier/administration/emetteur-dsn/EmetteurDSNFormProvider';
import type { TParametrageProviderReturn }  from '@app/dossier/providers/parametrage-dossier/ParametrageDossierProvider';
// @core
import card_empty_users     from '@core/resources/assets/images/patterns/card_empty_users.png';
import type {
    WsDataModel,
    TDataProviderReturn,
    TActionProviderReturn
} from '@core/models/ProviderModel';
// @library
import FormFieldComponent   from '@library/form/components/FormFieldComponent';
import FormContextProvider  from '@library/form/providers/FormProvider';
import type FormFieldModel  from '@library/form/models/FormFieldModel';
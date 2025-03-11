// Misc
import { useEffect }    from 'react';
import type { FC }      from 'react';
// DS
import {
    YpDivider,
    YpElement,
    YpFormModal,
    YpTypography
} from 'ds';
// @app/dossier
import type FicheMultiFormModel         from '@app/dossier/models/fiches/FicheMultiFormModel';
import type { TFicheMultiFormActions }  from '@app/dossier/providers/fiches/FicheMultiFormProvider';
// @core
import type {
    WsDataModel,
    TActionProviderReturn
} from '@core/models/ProviderModel';
// @library
import FormFieldComponent   from '@library/form/components/FormFieldComponent';
import FormContextProvider  from '@library/form/providers/FormProvider';
import type FormFieldModel  from '@library/form/models/FormFieldModel';
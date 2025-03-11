// Misc
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import { reject }           from 'lodash';
import type { FC }          from 'react';
// DS
import {
    YpButton,
    YpElement,
    YpTypography,
    YpHeaderedElement
}                                       from 'ds';
import type { TYpHeaderedElementProps } from 'ds';
// @app/dossier
import AdhesionUrssafEtablissementFormModel  from '@app/dossier/models/AdhesionUrssafEtablissementFormModel';
import type AdhesionUrssafFormModel          from '@app/dossier/models/AdhesionUrssafFormModel';
import type { TAdhesionUrssafFormActions }   from '@app/dossier/providers/adhesions/urssaf/AdhesionUrssafFormProvider';
// @core
import type {
    TDataProviderReturn,
    TActionProviderReturn
} from '@core/models/ProviderModel';
// @library
import FormComponent                  from '@library/form/components/FormComponent';
import FormFieldComponent             from '@library/form/components/FormFieldComponent';
import FormContextProvider            from '@library/form/providers/FormProvider';
import { useListRendering }           from '@library/utils/list';
import type FormFieldModel            from '@library/form/models/FormFieldModel';
import type { TUseFormContextValues } from '@library/form/providers/useFormProvider';
import { getColorFromString } from '@library/utils/styles';
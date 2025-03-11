// Misc
import { map }      from 'lodash';
import type { FC }  from 'react';
// DS
import {
    YpAlert,
    YpElement,
    YpTypography
} from 'ds';
// @app/dossier
import type RegroupementAbsenceModel            from '@app/dossier/models/absences/RegroupementAbsenceModel';
import type { TRegroupementAbsenceFormActions } from '@app/dossier/providers/absences/RegroupementAbsenceFormProvider';
// @core
import type { TActionProviderReturn } from '@core/models/ProviderModel';
// @library
import FormComponent        from '@library/form/components/FormComponent';
import FormFieldComponent   from '@library/form/components/FormFieldComponent';
import FormContextProvider  from '@library/form/providers/FormProvider';
import type FormFieldModel  from '@library/form/models/FormFieldModel';
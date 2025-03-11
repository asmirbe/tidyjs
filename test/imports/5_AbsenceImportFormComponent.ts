// Misc
import { type FC } from 'react';
// DS
import {
    YpElement,
    YpFormModal
} from 'ds';
// @app/dossier
import type { TAbsenceImportContext }     from '@app/dossier/providers/absences/import/AbsenceImportChannelProvider';
import type { TAbsenceImportFormActions } from '@app/dossier/providers/absences/import/AbsenceImportFormProvider';
// @core
import type { TActionProviderReturn } from '@core/models/ProviderModel';
// @library
import FormComponent        from '@library/form/components/FormComponent';
import FormFieldComponent   from '@library/form/components/FormFieldComponent';
import FormContextProvider  from '@library/form/providers/FormProvider';
import type FormFieldModel  from '@library/form/models/FormFieldModel';
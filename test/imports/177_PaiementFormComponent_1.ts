// Misc
import type { FC } from 'react';
// DS
import {
    YpElement,
    YpFormModal,
    YpTypography
} from 'ds';
// @app/dossier
import { useDossierContext }          from '@app/dossier/providers/contexts/DossierContextProvider';
import type { TReglementFormActions } from '@app/dossier/providers/reglements/ReglementFormProvider';
import type ReglementFormModel        from '@app/dossier/models/reglements/ReglementFormModel';
// @core
import type { TActionProviderReturn } from '@core/models/ProviderModel';
// @library
import FormComponent        from '@library/form/components/FormComponent';
import FormFieldComponent   from '@library/form/components/FormFieldComponent';
import FormContextProvider  from '@library/form/providers/FormProvider';
import type FormFieldModel  from '@library/form/models/FormFieldModel';
// Utils
import { getTextPreview } from 'yutils/text';
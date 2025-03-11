// Misc
import type { FC } from 'react';
// DS
import { YpElement } from 'ds';
// @app/dossier
import type OCConfigurationFormModel        from '@app/dossier/models/adhesions/configuration/OCConfigurationFormModel';
import type { TOCConfigurationFormActions } from '@app/dossier/providers/adhesions/oc/configuration/OCConfigurationFormProvider';
// @core
import type { TActionProviderReturn } from '@core/models/ProviderModel';
// @library
import FormComponent        from '@library/form/components/FormComponent';
import FormFieldComponent   from '@library/form/components/FormFieldComponent';
import FormContextProvider  from '@library/form/providers/FormProvider';
import { renderFields }     from '@library/utils/fields';
import type FormFieldModel  from '@library/form/models/FormFieldModel';
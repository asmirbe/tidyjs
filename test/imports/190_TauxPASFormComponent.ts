// Misc
import type { FC }   from 'react';
import { useEffect } from 'react';
// DS
import { YpFormModal } from 'ds';
// @app/dosier
import type TauxPASFormModel         from '@app/dossier/models/TauxPASFormModel';
import type { TTauxPASFormActions }  from '@app/dossier/providers/tauxPAS/TauxPASFormProvider';
// @core
import type { TActionProviderReturn } from '@core/models/ProviderModel';
// @library
import FormComponent        from '@library/form/components/FormComponent';
import FormFieldComponent   from '@library/form/components/FormFieldComponent';
import FormContextProvider  from '@library/form/providers/FormProvider';
import type FormFieldModel  from '@library/form/models/FormFieldModel';
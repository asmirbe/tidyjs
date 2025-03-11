// Misc
import type { FC }   from 'react';
import { useEffect } from 'react';
// DS
import {
    YpElement,
    YpTypography
} from 'ds';
// @app/dossier
import type AdhesionDetailModel              from '@app/dossier/models/AdhesionDetailModel';
import type AdhesionBanqueFormModel          from '@app/dossier/models/AdhesionBanqueFormModel';
import type { TBanqueRetraiteFormActions }   from '@app/dossier/providers/adhesions/retraite/banque/BanqueRetraiteFormProvider';
// @core
import type { TActionProviderReturn } from '@core/models/ProviderModel';
// @library
import FormComponent        from '@library/form/components/FormComponent';
import FormFieldComponent   from '@library/form/components/FormFieldComponent';
import FormContextProvider  from '@library/form/providers/FormProvider';
import type FormFieldModel  from '@library/form/models/FormFieldModel';
// Misc
import { useEffect } from 'react';
import type { FC }   from 'react';
// DS
import {
    YpElement,
    YpTypography
} from 'ds';
// @app/dossier
import type AdhesionBanqueFormModel      from '@app/dossier/models/AdhesionBanqueFormModel';
import type AdhesionDetailModel          from '@app/dossier/models/AdhesionDetailModel';
import type { TBanqueUrssafFormActions } from '@app/dossier/providers/adhesions/urssaf/banque/BanqueUrssafFormProvider';
// @core
import type { TActionProviderReturn } from '@core/models/ProviderModel';
// @library
import FormComponent        from '@library/form/components/FormComponent';
import FormFieldComponent   from '@library/form/components/FormFieldComponent';
import FormContextProvider  from '@library/form/providers/FormProvider';
import type FormFieldModel  from '@library/form/models/FormFieldModel';
// Misc
import {
    Fragment,
    useEffect
}                   from 'react';
import {
    map,
    find,
    reject,
    isEmpty
}                   from 'lodash';
import type { FC }  from 'react';
// DS
import {
    YpTab,
    YpButton,
    YpElement,
    YpTypography
} from 'ds';
// @app/dossier
import OCEtablissementPayeurFormModel                   from '@app/dossier/models/adhesions/paiements/OCEtablissementPayeurFormModel';
import type OCEtablissementPayeurMultiFormModel         from '@app/dossier/models/adhesions/paiements/OCEtablissementPayeurMultiFormModel';
import type { TOCEtablissementPayeurMultiFormActions }  from '@app/dossier/providers/adhesions/oc/paiements/OCEtablissementPayeurMultiFormProvider';
// @core
import type { TActionProviderReturn }               from '@core/models/ProviderModel';
// @library
import FormComponent                    from '@library/form/components/FormComponent';
import FormFieldComponent               from '@library/form/components/FormFieldComponent';
import FormContextProvider              from '@library/form/providers/FormProvider';
import { getValorisationByPropertyKey } from '@library/form-new/test/providers/fiches/utils/fiche';
import type EtablissementModel          from '@library/form-new/test/models/EtablissementModel';
import type FormFieldModel              from '@library/form/models/FormFieldModel';
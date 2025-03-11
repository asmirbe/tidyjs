// Misc
import { useEffect } from 'react';
import type { FC }   from 'react';
// DS
import {
    YpHeader,
    YpElement,
    YpDivider,
    YpTypography
} from 'ds';
//@app/dossier
import type AdhesionDgfipModel            from '@app/dossier/models/AdhesionDgfipModel';
import type AdhesionDgfipFormModel        from '@app/dossier/models/AdhesionDgfipFormModel';
import type { IAdhesionDgfipFormActions } from '@app/dossier/providers/adhesions/dgfip/AdhesionDgfipFormProvider';
// @core
import type { TWsException } from '@core/models/CoreModel';
// @Library
import FormComponent                    from '@library/form/components/FormComponent';
import FormFieldComponent               from '@library/form/components/FormFieldComponent';
import FormContextProvider              from '@library/form/providers/FormProvider';
import { getValorisationByPropertyKey } from '@library/form-new/test/providers/fiches/utils/fiche';
import { getColorFromString }           from '@library/utils/styles';
import type FormModel                   from '@library/form/models/FormModel';
import type FormFieldModel              from '@library/form/models/FormFieldModel';
import type EtablissementModel          from '@library/form-new/test/models/EtablissementModel';
import type { TUseFormContextValues }   from '@library/form/providers/useFormProvider';
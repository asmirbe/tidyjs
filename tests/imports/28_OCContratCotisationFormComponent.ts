// Misc
import { Fragment }        from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    map,
    reject
}                          from 'lodash';
import type {
    FC,
    Dispatch,
    SetStateAction
}                          from 'react';
// DS
import {
    YpAlert,
    YpButton,
    YpElement,
    YpHeader,
    YpSwitch,
    YpTypography
} from 'ds';
// @app/dossier
import OCElementCotisationFormComponent  from '@app/dossier/components/adhesions/oc/cotisations/OCElementCotisationFormComponent';
import type OCFormModel                  from '@app/dossier/models/adhesions/cotisations/put/OCFormModel';
import type OCElementCotisationModel     from '@app/dossier/models/adhesions/cotisations/common/OCElementCotisationModel';
import type { TOCCotisationFormActions } from '@app/dossier/providers/adhesions/oc/cotisations/OCCotisationFormProvider';
import type {
    TOCCotisationsListActions,
    TOCCotisationsListAdditionals
}                                        from '@app/dossier/providers/adhesions/oc/cotisations/OCCotisationsListProvider';
// @core
import type { TActionProviderReturn } from '@core/models/ProviderModel';
// @library
import FormComponent            from '@library/form/components/FormComponent';
import FormFieldComponent       from '@library/form/components/FormFieldComponent';
import FormContextProvider      from '@library/form/providers/FormProvider';
import { renderFields }         from '@library/utils/fields';
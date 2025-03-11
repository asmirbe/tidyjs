// Misc
import { useEffect }        from 'react';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import {
    map,
    isEmpty
}                           from 'lodash';
import type {
    FC,
    Dispatch,
    SetStateAction
}                           from 'react';
// DS
import {
    YpTab,
    YpButton,
    YpElement,
    YpTypography
} from 'ds';
// @app/dossier
import OCContratCotisationFormComponent  from '@app/dossier/components/adhesions/oc/cotisations/OCContratCotisationFormComponent';
import type OCFormModel                  from '@app/dossier/models/adhesions/cotisations/put/OCFormModel';
import type OCDetailModel                from '@app/dossier/models/adhesions/cotisations/get/OCDetailModel';
import type RessourceModel               from '@app/dossier/models/RessourceModel';
import type { TOCCotisationFormActions } from '@app/dossier/providers/adhesions/oc/cotisations/OCCotisationFormProvider';
import type {
    TOCCotisationsListActions,
    TOCCotisationsListAdditionals
}                                        from '@app/dossier/providers/adhesions/oc/cotisations/OCCotisationsListProvider';
// @core
import type {
    TActionProviderReturn,
    TDataProviderReturn
} from '@core/models/ProviderModel';
// @library
import { renderNoResult } from '@library/utils/list';
// Misc Libs
import {
    find,
}                          from 'lodash';
import cn                  from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type {
    FC,
    Dispatch,
    MouseEvent,
    SetStateAction
}                          from 'react';
// DS
import {
    YpIcon,
    YpElement,
    YpTypography
} from 'ds';
// @app/dossier
import { useReferencialContext }        from '@app/dossier/providers/referencial/ReferencialContextProvider';
import type { TCotisationPlage }        from '@app/dossier/models/fiches/affiliation/AffiliationAllModel';
import type AffiliationFormModel        from '@app/dossier/models/fiches/affiliation/AffiliationFormModel';
import type { TAffiliationFormActions } from '@app/dossier/providers/fiches/affiliations/AffiliationMultiFormProvider';
// @core
import type { TActionProviderReturn } from '@core/models/ProviderModel';
// @library
import { getDateFormat } from '@library/utils/dates';
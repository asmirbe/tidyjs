// Misc
import { Fragment }         from 'react';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import { reject }           from 'lodash';
import { v4 as uuidv4 }     from 'uuid';
import type {
    FC,
    MouseEvent
}                           from 'react';
// DS
import {
    YpIcon,
    YpButton,
    YpDivider,
    YpElement,
    YpTypography
} from 'ds';
// @app/dossier
import type AffiliationFormModel        from '@app/dossier/models/fiches/affiliation/AffiliationFormModel';
import type { TAffiliationFormActions } from '@app/dossier/providers/fiches/affiliations/AffiliationMultiFormProvider';
import type {
    TCotisationPlage,
    TCotisationPlageDispense
}                                       from '@app/dossier/models/fiches/affiliation/AffiliationAllModel';
// @core
import type { TActionProviderReturn } from '@core/models/ProviderModel';
// @library
import FormFieldComponent   from '@library/form/components/FormFieldComponent';
import { getDCByCodes }     from '@library/form-new/test/providers/fiches/utils/fiche';
import { getDateFormat }    from '@library/utils/dates';
import type ContratModel    from '@library/form-new/test/models/ContratModel';
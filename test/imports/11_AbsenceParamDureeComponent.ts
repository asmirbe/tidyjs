// Misc
import cn                   from 'classnames';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import {
    map,
    find,
    delay,
    reject
}                           from 'lodash';
import { v4 as uuidv4  }    from 'uuid';
import { type FC }          from 'react';
// DS
import {
    YpTable,
    YpLabel,
    YpInput,
    YpButton,
    YpElement,
    YpTypography
} from 'ds';
// @app/dossier
import ModeDemarrageAbsenceEnum                 from '@app/dossier/models/enums/ModeDemarrageAbsence';
import NatureEvenementAbsenceEnum               from '@app/dossier/models/enums/NatureEvenementAbsence';
import type RegroupementAbsenceModel            from '@app/dossier/models/absences/RegroupementAbsenceModel';
import type { TRegroupementAbsenceFormActions } from '@app/dossier/providers/absences/RegroupementAbsenceFormProvider';
import type { TRegroupementAbsenceAdditionals } from '@app/dossier/providers/absences/RegroupementAbsenceDetailProvider';
// @core
import type { TActionProviderReturn } from '@core/models/ProviderModel';
// @library
import FormFieldComponent               from '@library/form/components/FormFieldComponent';
import { getFormattedDecimalDigits }    from '@library/utils/number';
import type FormFieldModel              from '@library/form/models/FormFieldModel';
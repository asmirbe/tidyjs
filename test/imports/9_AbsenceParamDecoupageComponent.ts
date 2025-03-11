// Misc
import {
    useState,
    useEffect,
    type FC
}                           from 'react';
import cn                   from 'classnames';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import {
    map,
    find,
    keys,
    first,
    delay,
    reject,
    isEmpty,
    groupBy,
    orderBy,
    findIndex
}                           from 'lodash';
import { v4 as uuidv4 }     from 'uuid';
// DS
import {
    YpTable,
    YpButton,
    YpElement,
    useYpModal,
    YpTypography
} from 'ds';
// @app/dossier
import AbsenceParamDecoupageFormComponent       from '@app/dossier/components/absences/param/decoupage/AbsenceParamDecoupageFormComponent';
import type RegroupementAbsenceModel            from '@app/dossier/models/absences/RegroupementAbsenceModel';
import type { TRegroupementAbsenceDecoupage }   from '@app/dossier/models/absences/RegroupementAbsenceModel';
import type { TRegroupementAbsenceFormActions } from '@app/dossier/providers/absences/RegroupementAbsenceFormProvider';
import type { TRegroupementAbsenceAdditionals } from '@app/dossier/providers/absences/RegroupementAbsenceDetailProvider';
// @core
import type { TOpenState }              from '@core/models/CoreModel';
import type { TActionProviderReturn }   from '@core/models/ProviderModel';
// @library
import { getFormattedDecimalDigits } from '@library/utils/number';
import RegroupementAbsenceStatutEnum from '@app/dossier/models/enums/RegroupementAbsenceStatut';
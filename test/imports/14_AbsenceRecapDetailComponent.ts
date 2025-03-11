// Misc
import {
    Fragment,
    useState,
    type FC,
    type Dispatch,
    type SetStateAction
}                           from 'react';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import {
    map,
    last,
    find,
    first,
    orderBy,
    capitalize,
}                           from 'lodash';
import cn                   from 'classnames';
import type { IconProp }    from '@fortawesome/fontawesome-svg-core';
// DS
import {
    YpTag,
    YpMenu,
    YpTable,
    YpButton,
    YpElement,
    YpSkeleton,
    YpTypography,
    type TTailwindColorPalette,
    YpDivider
}                                       from 'ds';
// @app/dossier
import DsnAtStatut                              from '@app/dossier/models/enums/DsnAtStatus';
import ModeDemarrageAbsenceEnum                 from '@app/dossier/models/enums/ModeDemarrageAbsence';
import NatureEvenementAbsenceEnum               from '@app/dossier/models/enums/NatureEvenementAbsence';
import RegroupementAbsenceStatutEnum            from '@app/dossier/models/enums/RegroupementAbsenceStatut';
import { RegroupementAbsenceOrigineEnum }       from '@app/dossier/models/enums/RegroupementAbsenceOrigineEnum';
import { getKeyByValue }                        from '@app/dossier/utils/enum';
import type TypeAbsenceModel                    from '@app/dossier/models/absences/TypeAbsenceModel';
import type FamilleAbsenceModel                 from '@app/dossier/models/absences/FamilleAbsenceModel';
import type RegroupementAbsenceModel            from '@app/dossier/models/absences/RegroupementAbsenceModel';
import type {
    DsnAtResumeDetailModel,
    DsnAtResumeModel
}                                               from '@app/dossier/models/dsn/DsnAtModel';
import type SalariesAbsencesListModel           from '@app/dossier/models/SalariesAbsencesListModel';
import type { TRegroupementAbsenceAdditionals } from '@app/dossier/providers/absences/RegroupementAbsenceDetailProvider';
import type { TRegroupementAbsenceFormActions } from '@app/dossier/providers/absences/RegroupementAbsenceFormProvider';
// @app/client
import type UtilisateurModel from '@app/client/models/UtilisateurModel';
// @core
import { useUserContext }   from '@core/providers/contexts/UserContextProvider';
import type {
    TDataProviderReturn,
    TActionProviderReturn
}                           from '@core/models/ProviderModel';
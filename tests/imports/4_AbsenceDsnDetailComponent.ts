// Misc
import {
    Fragment,
    useState,
    type FC
}                           from 'react';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import { map }              from 'lodash';
import type { IconProp }    from '@fortawesome/fontawesome-svg-core';
// DS
import {
    YpTag,
    YpTable,
    YpButton,
    YpElement,
    YpTooltip,
    YpTypography
}                                       from 'ds';
import type { TTailwindColorPalette }   from 'ds';
// @app/dossier
import DsnAtStatut                      from '@app/dossier/models/enums/DsnAtStatus';
import NatureEvenementAbsenceEnum       from '@app/dossier/models/enums/NatureEvenementAbsence';
import { useDossierContext }            from '@app/dossier/providers/contexts/DossierContextProvider';
import useDsnAtErrorsListProvider       from '@app/dossier/providers/dsn/DsnAtErrorsListProvider';
import type DsnAtModel                  from '@app/dossier/models/dsn/DsnAtModel';
import type RessourceModel              from '@app/dossier/models/RessourceModel';
import type RegroupementAbsenceModel    from '@app/dossier/models/absences/RegroupementAbsenceModel';
import type { TDsnAtActions }           from '@app/dossier/providers/dsn/DsnAtActionsProvider';
// @core
import type {
    TActionProviderReturn,
    WsDataModel
} from '@core/models/ProviderModel';
// @library
import { getDateFormat } from '@library/utils/dates';
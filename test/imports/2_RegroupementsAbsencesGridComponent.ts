// Misc
import {
    useRef,
    useState,
    useEffect,
    useCallback,
    Fragment,
    useMemo
}                           from 'react';
import cn                   from 'classnames';
import {
    format,
    getWeek,
    subWeeks,
    addWeeks,
    parseISO,
    endOfDay,
    isBefore,
    isWeekend,
    isSameDay,
    startOfDay,
    startOfMonth,
    lastDayOfWeek,
    lastDayOfMonth,
    differenceInDays,
    isWithinInterval,
    eachDayOfInterval,
    eachWeekOfInterval
}                           from 'date-fns';
import { fr }               from 'date-fns/locale';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import {
    map,
    find,
    last,
    first,
    filter,
    orderBy,
    isEmpty
}                           from 'lodash';
import { navigate }         from '@reach/router';
import { v4 as uuidv4  }    from 'uuid';
import type {
    FC,
    ChangeEvent
}                           from 'react';
import {
    createColumnHelper,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable,
    type ColumnDef,
    type Cell
}                           from '@tanstack/react-table';
// DS
import {
    YpInput,
    YpAlert,
    YpButton,
    YpSelect,
    YpElement,
    YpTooltip,
    YpPopover,
    YpSkeleton,
    useYpModal,
    YpFormModal,
    YpTypography,
    YpStepperNew,
    useYpStepper,
    YpConfirmModal,
    YpDataTableTimeline,
    useYpWrapperContext,
    YpTag,
} from 'ds';
// @app/notification
import { useClientNotification } from '@app/notification/ClientNotificationProvider';
// @app/dossier
import AbsenceInitFormComponent                       from '@app/dossier/components/absences/init/AbsenceInitFormComponent';
import AbsenceParamFormComponent                      from '@app/dossier/components/absences/param/AbsenceParamFormComponent';
import AbsenceRecapDetailComponent                    from '@app/dossier/components/absences/recap/AbsenceRecapDetailComponent';
import AbsenceRapportComponent                        from '@app/dossier/components/absences/AbsenceRapportComponent';
import AbsenceImportFormComponent                     from '@app/dossier/components/absences/import/AbsenceImportFormComponent';
import AbsenceDsnComponent                            from '@app/dossier/components/absences/dsn/AbsenceDsnComponent';
import SalarieCellRenderer                            from '@app/dossier/components/salaries/SalarieCellRenderer';
import { StatutImportEnum }                           from '@app/dossier/models/RapportImportModel';
import ModeDemarrageAbsenceEnum                       from '@app/dossier/models/enums/ModeDemarrageAbsence';
import NatureEvenementAbsenceEnum                     from '@app/dossier/models/enums/NatureEvenementAbsence';
import StatutRegroupementAbsenceEnum                  from '@app/dossier/models/enums/StatutRegroupementAbsence';
import DsnAtStatut                                    from '@app/dossier/models/enums/DsnAtStatus';
import { AbsenceFilterEnum }                          from '@app/dossier/models/enums/AbsenceFilterEnum';
import GenerationDsnStatutDepot                       from '@app/dossier/models/enums/GenerationDsnStatutDepot';
import RegroupementAbsenceStatutEnum                  from '@app/dossier/models/enums/RegroupementAbsenceStatut';
import useRegroupementAbsenceDetail                   from '@app/dossier/providers/absences/RegroupementAbsenceDetailProvider';
import useAbsenceImport                               from '@app/dossier/providers/absences/import/AbsenceImportProvider';
import { useDossierContext }                          from '@app/dossier/providers/contexts/DossierContextProvider';
import useDsnAtListProvider                           from '@app/dossier/providers/dsn/DsnAtListProvider';
import useFichesHistorisationList                     from '@app/dossier/providers/fiches/FichesHistorisationListProvider';
import useRapportImportDetail                         from '@app/dossier/providers/edp/RapportImportDetailProvider';
import useRapportImportLast                           from '@app/dossier/providers/edp/RapportImportLastProvider';
import useDsnAtActionsProvider                        from '@app/dossier/providers/dsn/DsnAtActionsProvider';
import useRegroupementsAbsencesList                   from '@app/dossier/providers/absences/RegroupementsAbsencesListProvider';
import useDsnAtResumeListProvider                     from '@app/dossier/providers/dsn/DsnAtResumeListProvider';
import { moduleRoute as DossierModule }               from '@app/dossier/resources/common/Router';
import type DossierModel                              from '@app/dossier/models/DossierModel';
import type RegroupementAbsenceModel                  from '@app/dossier/models/absences/RegroupementAbsenceModel';
import type SalariesAbsencesListModel                 from '@app/dossier/models/SalariesAbsencesListModel';
import type { TRegroupementAbsenceAdditionals }       from '@app/dossier/providers/absences/RegroupementAbsenceDetailProvider';
import type { TRegroupementsAbsencesListAdditionals } from '@app/dossier/providers/absences/RegroupementsAbsencesListProvider';
// @app/client
import useUtilisateurSearch from '@app/client/providers/parametrage/utilisateurs/UtilisateurSearchProvider';
// @core
import { getLocationId }  from '@core/utils/misc';
import { useUserContext } from '@core/providers/contexts/UserContextProvider';
import type {
    WsDataModel,
    TDataProviderReturn
}                         from '@core/models/ProviderModel';
// @library
import { getDateFormat }      from '@library/utils/dates';
import { getPageStyleHeight } from '@library/utils/styles';
import { useSearch }          from '@library/utils/search';
// Utils
import {
    conjugate,
    getTextPreview
}                     from 'yutils/text';
import { getPalette } from 'yutils/colors';
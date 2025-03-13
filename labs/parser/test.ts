import { writeFileSync } from 'fs';
import { parseImports, DEFAULT_CONFIG, ParserConfig } from './parser';
import path from 'path';

const config: ParserConfig = {
  importGroups: [
    { name: 'Misc', regex: /^(lodash|react|uuid)$/, order: 0, isDefault: true },
    { name: 'Composants', regex: /^@components/, order: 1 },
    { name: 'Utils', regex: /^@utils/, order: 2 },
  ],
//   priorityImports: [/^react(-dom)?$/],
  patterns: {
    ...DEFAULT_CONFIG.patterns,
    appSubfolderPattern: /@app\/([^/]+)/
  }
};

const sourceCode = `
import React from 'react';
import React as R from 'react';
import type Danger from 'danger';
import { Fragment, useCallback, type ChangeEvent } from 'react';
import type { ChangeEvent, FC } from 'react';
import {
    Fragment,
    useCallback,
    useEffect,
    type ChangeEvent,
    useMemo,
    useRef,
    useState
}                          from 'react';
import type {
    ChangeEvent,
    FC
}                          from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { navigate }        from '@reach/router';
import {
    createColumnHelper,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable
}                          from '@tanstack/react-table';
import type {
    Cell,
    ColumnDef
}                          from '@tanstack/react-table';
import cn                  from 'classnames';
import {
    addWeeks,
    differenceInDays,
    eachDayOfInterval,
    eachWeekOfInterval,
    endOfDay,
    format,
    getWeek,
    isBefore,
    isSameDay,
    isWeekend,
    isWithinInterval,
    lastDayOfMonth,
    lastDayOfWeek,
    parseISO,
    startOfDay,
    startOfMonth,
    subWeeks
}                          from 'date-fns';
import { fr }              from 'date-fns/locale';
import {
    filter,
    find,
    first,
    isEmpty,
    last,
    map,
    orderBy
}                          from 'lodash';
import { v4 as uuidv4 }    from 'uuid';
// DS (Alphabetical order + group DS + aligned from based on longest length name)
import {
    useYpModal,
    useYpStepper,
    useYpWrapperContext,
    YpAlert,
    YpButton,
    YpConfirmModal,
    YpDataTableTimeline,
    YpElement,
    YpFormModal,
    YpInput,
    YpPopover,
    YpSelect,
    YpSkeleton,
    YpStepperNew,
    YpTag,
    YpTooltip,
    YpTypography
}                        from 'ds';
// @app/client (group @app/client)
import useUtilisateurSearch  from '@app/client/providers/parametrage/utilisateurs/UtilisateurSearchProvider';
// @app/dossier (Alphabetical order + group @app/dossier + path subfolders alphabetical order order)
import AbsenceRapportComponent                        from '@app/dossier/components/absences/AbsenceRapportComponent';
import AbsenceDsnComponent                            from '@app/dossier/components/absences/dsn/AbsenceDsnComponent';
import AbsenceImportFormComponent                     from '@app/dossier/components/absences/import/AbsenceImportFormComponent';
import AbsenceInitFormComponent                       from '@app/dossier/components/absences/init/AbsenceInitFormComponent';
import AbsenceParamFormComponent                      from '@app/dossier/components/absences/param/AbsenceParamFormComponent';
import AbsenceRecapDetailComponent                    from '@app/dossier/components/absences/recap/AbsenceRecapDetailComponent';
import SalarieCellRenderer                            from '@app/dossier/components/salaries/SalarieCellRenderer';
import type RegroupementAbsenceModel                  from '@app/dossier/models/absences/RegroupementAbsenceModel';
import type DossierModel                              from '@app/dossier/models/DossierModel';
import { AbsenceFilterEnum }                          from '@app/dossier/models/enums/AbsenceFilterEnum';
import DsnAtStatut                                    from '@app/dossier/models/enums/DsnAtStatus';
import GenerationDsnStatutDepot                       from '@app/dossier/models/enums/GenerationDsnStatutDepot';
import ModeDemarrageAbsenceEnum                       from '@app/dossier/models/enums/ModeDemarrageAbsence';
import NatureEvenementAbsenceEnum                     from '@app/dossier/models/enums/NatureEvenementAbsence';
import RegroupementAbsenceStatutEnum                  from '@app/dossier/models/enums/RegroupementAbsenceStatut';
import StatutRegroupementAbsenceEnum                  from '@app/dossier/models/enums/StatutRegroupementAbsence';
import { StatutImportEnum }                           from '@app/dossier/models/RapportImportModel';
import type SalariesAbsencesListModel                 from '@app/dossier/models/SalariesAbsencesListModel';
import useAbsenceImport                               from '@app/dossier/providers/absences/import/AbsenceImportProvider';
import useRegroupementAbsenceDetail                   from '@app/dossier/providers/absences/RegroupementAbsenceDetailProvider';
import type { TRegroupementAbsenceAdditionals }       from '@app/dossier/providers/absences/RegroupementAbsenceDetailProvider';
import useRegroupementsAbsencesList                   from '@app/dossier/providers/absences/RegroupementsAbsencesListProvider';
import type { TRegroupementsAbsencesListAdditionals } from '@app/dossier/providers/absences/RegroupementsAbsencesListProvider';
import { useDossierContext }                          from '@app/dossier/providers/contexts/DossierContextProvider';
import useDsnAtActionsProvider                        from '@app/dossier/providers/dsn/DsnAtActionsProvider';
import useDsnAtListProvider                           from '@app/dossier/providers/dsn/DsnAtListProvider';
import useDsnAtResumeListProvider                     from '@app/dossier/providers/dsn/DsnAtResumeListProvider';
import useRapportImportDetail                         from '@app/dossier/providers/edp/RapportImportDetailProvider';
import useRapportImportLast                           from '@app/dossier/providers/edp/RapportImportLastProvider';
import useFichesHistorisationList                     from '@app/dossier/providers/fiches/FichesHistorisationListProvider';
import { moduleRoute as DossierModule }               from '@app/dossier/resources/common/Router';
// @app/notification (group @app/notification)
import { useClientNotification } from '@app/notification/ClientNotificationProvider';
// @core (Here from is aligned based on the whole group because of useUserContext length)
import type {
    TDataProviderReturn,
    WsDataModel
}                         from '@core/models/ProviderModel';
import { useUserContext } from '@core/providers/contexts/UserContextProvider';
import { getLocationId }  from '@core/utils/misc';
// @library (group @library)
import { getDateFormat }      from '@library/utils/dates';
import { useSearch }          from '@library/utils/search';
import { getPageStyleHeight } from '@library/utils/styles';
/*
*  Utils (group Utils)
*  Import nommée donc nous faisons ce raisonnement :
*  On parcour les noms des imports par longueur = getTextPreview.length : Ce qui ici nous donne 14 charactère
*  Nous avons ensuite 4 espace d'indentation
*  Sur la ligne on a donc 4 charactère (Parce que on as 3 espaces et une accolade de fermeture '}')
*  + 1 charactère d'espacement avant from (Toujours)
*  Ce qui nous donne 19 charactères avant "from 'yutils/text'".
*/
import { getPalette } from 'yutils/colors';
import {
    conjugate,
    getTextPreview
}                     from 'yutils/text';
`;

const sourceCode2 = `
// @app/dossier
import AbsenceInitFormComponent from '@app/dossier/components/absences/init/AbsenceInitFormComponent';
import AbsencesFormComponent    from '@app/dossier/components/absences/init/AbsencesFormComponent';
import AccordFormComponent      from '@app/dossier/components/britania/init/AbsenceInitFormComponent';

import { 
    AbsenceInitFormComponent, 
    BritaniaFormComponent,
    CaledoniaFormComponent
    DossierFormComponent,
    AbsencesFormComponent 
} from '@app/dossier/components/absences/init/AbsenceInitFormComponent';

// @app/alient
import useUtilisateurSearch from '@app/client/providers/parametrage/utilisateurs/UtilisateurSearchProvider';

// @app/notification
import { useClientNotification } from '@app/notification/ClientNotificationProvider';
`;

const sourceCode3 = `import{Component1,Component2}from'module';`;

const run = () => {
    const timestamp = Date.now();
    console.time('Parse imports execution time');
    const results = parseImports(sourceCode3, config);
    // console.log(JSON.stringify(results.groups, null, 2));
    console.timeEnd('Parse imports execution time');
    const outputPath = path.resolve(__dirname, `./results/test-${timestamp}.json`);
    writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`Results written to: ${outputPath}`);
}

run();
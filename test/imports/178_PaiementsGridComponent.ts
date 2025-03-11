// Misc
import {
    useMemo,
    useState,
    useEffect,
    type FC,
    type ChangeEvent
}                           from 'react';
import {
    format,
    parseISO,
    startOfMonth,
    lastDayOfMonth
}                           from 'date-fns';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import type {
    GridApi,
    ColumnApi,
    GridReadyEvent,
    CellClassParams,
    ValueGetterParams
}                           from 'ag-grid-community';
import {
    map,
    join,
    uniqBy
}                           from 'lodash';

// DS
import {
    YpInput,
    YpAlert,
    YpButton,
    YpElement,
    YpTooltip,
    YpDatagrid,
    YpTypography,
    YpMasterpicker,
    useYpWrapperContext,
    YpDatagridCellTagRenderer,
    type TYpMasterpickerRange
} from 'ds';
// @app/dossier
import PaiementFormComponent                    from '@app/dossier/components/postproduction/paiements/PaiementFormComponent';
import BulletinStatutEnum                       from '@app/dossier/models/enums/bulletin/BulletinStatut';
import BulletinTypeEnum                         from '@app/dossier/models/enums/BulletinType';
import useBanquesList                           from '@app/dossier/providers/fiches/banques/BanquesListProvider';
import useGEDSearchProvider                     from '@app/dossier/providers/ged/GEDSearchProvider';
import { useDossierContext }                    from '@app/dossier/providers/contexts/DossierContextProvider';
import useSalariesGroupByIndList                from '@app/dossier/providers/salaries/SalariesGroupByIndListProvider';
import useReglementSearchProvider               from '@app/dossier/providers/reglements/ReglementSearchProvider';
import { moduleRoute as DossierModule }         from '@app/dossier/resources/common/Router';
import type { TRouterStateParametrageDossier }  from '@app/dossier/components/parametrage-dossier/ParametrageDossierTabsComponent';
import type DossierModel                        from '@app/dossier/models/DossierModel';
import type ReglementModel                      from '@app/dossier/models/reglements/ReglementModel';
//@app/notification
import { useClientNotification } from '@app/notification/ClientNotificationProvider';
// @core
import { navigateState } from '@core/utils/routing';
// @library
import { getDateFormat }        from '@library/utils/dates';
import { getPageStyleHeight }   from '@library/utils/styles';
// Utils
import { conjugate } from 'yutils/text';
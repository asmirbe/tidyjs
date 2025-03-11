import {
    useMemo,
    useState,
    useEffect
}                               from 'react';
import {
    map,
    uniqBy,
    isEmpty,
    find
}                               from 'lodash';
import {
    parse,
    format,
    getTime,
    parseISO
}                               from 'date-fns';
import { fr }                   from 'date-fns/locale';
import type { FC }              from 'react';
import type { IconName }        from '@fortawesome/fontawesome-svg-core';
import type {
    ColDef,
    GridApi,
    ColumnApi,
    GridReadyEvent,
    ValueGetterParams,
    IDetailCellRendererParams
}                               from 'ag-grid-community';
// DS
import {
    YpButton,
    YpElement,
    useYpModal,
    YpDatagrid,
    YpFormModal,
    YpTypography,
    YpDatagridColumn,
    useYpWrapperContext,
    YpDatagridCellRenderer,
    YpDatagridHeaderRenderer,
    YpDatagridCellTagRenderer,
    YpDatagridCellLabelRenderer,
    YpDatagridCellActionRenderer
} from 'ds';
//@app/dossier
import DsnFormComponent                        from '@app/dossier/components/dsn/DsnFormComponent';
import DsnAnnuelleFormComponent                from '@app/dossier/components/dsn/DsnAnnuelleFormComponent';
import MoisEnum                                from '@app/dossier/models/enums/Mois';
import DsnGenereeNature                        from '@app/dossier/models/enums/DSnGenereeNature';
import GenerationDsnNature                     from '@app/dossier/models/enums/GenerationDsnNature';
import GenerationDsnStatutDepot                from '@app/dossier/models/enums/GenerationDsnStatutDepot';
import GenerationDsnTypeDsn                    from '@app/dossier/models/enums/GenerationDsnTypeDsn';
import DsnGenereeChamp                         from '@app/dossier/models/enums/DsnGenereeChamp';
import useGEDDetailProvider                    from '@app/dossier/providers/ged/GEDDetailProvider';
import useGenerationsDsnList                   from '@app/dossier/providers/dsn/GenerationsDsnListProvider';
import useGenerationDsnDetail                  from '@app/dossier/providers/dsn/GenerationDsnDetailProvider';
import { useDossierContext }                   from '@app/dossier/providers/contexts/DossierContextProvider';
import { useReferencialContext }               from '@app/dossier/providers/referencial/ReferencialContextProvider';
import { moduleRoute as PostproductionModule } from '@app/dossier/resources/common/Router';
import type GenerationDsnBodyModel             from '@app/dossier/models/dsn/GenerationDsnBodyModel';
import type { TRouterStatePostproduction }     from '@app/dossier/pages/postproduction/PostProductionWrapperTabsComponent';
import type DsnGenereeModel                    from '@app/dossier/models/dsn/DsnGenereeModel';
import type GenerationDsnModel                 from '@app/dossier/models/dsn/GenerationDsnModel';
import type DossierModel                       from '@app/dossier/models/DossierModel';
import type { DsnStatutColor }                 from '@app/dossier/models/enums/GenerationDsnStatutDepot';
// @core
import { navigateState }    from '@core/utils/routing';
import type { WsDataModel } from '@core/models/ProviderModel';
// @library
import { getPageStyleHeight } from '@library/utils/styles';
// Utils
import { formatSiret } from 'yutils/text';
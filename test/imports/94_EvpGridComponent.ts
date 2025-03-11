// Misc
import {
    useMemo,
    useState,
    useEffect,
    useCallback
}                          from 'react';
import {
    map,
    find,
    sortBy,
    reduce,
    filter,
    flatMap
}                                           from 'lodash';
import { navigate }                         from '@reach/router';
import type {
    FC,
    ChangeEvent
}                          from 'react';
import type {
    RowNode,
    GridApi,
    ColumnApi,
    GridReadyEvent,
    NewValueParams,
    ValueFormatterParams,
    EditableCallbackParams
}                                           from 'ag-grid-community';
// DS
import {
    YpTag,
    YpInput,
    YpAlert,
    YpSwitch,
    YpButton,
    YpElement,
    YpTooltip,
    YpDatagrid,
    useYpModal,
    YpMarkdown,
    YpTypography,
    YpConfirmModal,
    useToastContext,
    YpDatagridColumn,
    useYpWrapperContext,
    YpDataGridCellComposedwithDatesRenderer
}                                           from 'ds';
// @app/dossier
import EvpFormComponent                     from '@app/dossier/components/evp/saisieManuelle/EvpFormComponent';
import EvpImportFormComponent               from '@app/dossier/components/evp/saisieManuelle/EvpImportFormComponent';
import IngredientRubriqueColonne            from '@app/dossier/models/enums/IngredientRubriqueColonne';
import useEvpDetail                         from '@app/dossier/providers/evp/EvpDetailProvider';
import useEvpImport                         from '@app/dossier/providers/evp/import/EvpImportProvider';
import useEvpSaisieDetail                   from '@app/dossier/providers/evp/EvpSaisieDetailProvider';
import { useDossierContext }                from '@app/dossier/providers/contexts/DossierContextProvider';
import useEvpDownloadProvider               from '@app/dossier/providers/evp/import/EvpDownloadProvider';
import useIngredientsListSearchProvider     from '@app/dossier/providers/ingredients/IngredientsListSearchProvider';
import useIngredientsListSearchFullProvider from '@app/dossier/providers/ingredients/IngredientsListSearchFullProvider';
import { moduleRoute as DossierModule }     from '@app/dossier/resources/common/Router';
import useFichesHistorisationList           from '@app/dossier/providers/fiches/FichesHistorisationListProvider';
import type EvpModel                        from '@app/dossier/models/EvpModel';
import type PeriodeEvpModel                 from '@app/dossier/models/PeriodeEvpDetailModel';
import type IngredientModel                 from '@app/dossier/models/ingredients/IngredientModel';
import type SalariesListModel               from '@app/dossier/models/SalariesListModel';
import type PeriodesEvpListModel            from '@app/dossier/models/PeriodesEvpListModel';
import type { TPeriodeEvpDetailActions }    from '@app/dossier/providers/evp/PeriodeEvpDetailProvider';
// @app/notification
import { useClientNotification }            from '@app/notification/ClientNotificationProvider';
// @core
import { useUserContext } from '@core/providers/contexts/UserContextProvider';
import type {
    WsDataModel,
    TDataProviderReturn,
    TActionProviderReturn
}                         from '@core/models/ProviderModel';
// @library
import { getDateFormat }      from '@library/utils/dates';
import { getPageStyleHeight } from '@library/utils/styles';
import { downloadS3File }     from '@library/utils/files';
// Utils
import { conjugate }                        from 'yutils/text';
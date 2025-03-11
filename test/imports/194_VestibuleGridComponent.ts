// Misc
import {
    useMemo,
    useState,
    useEffect,
    type FC,
    type ChangeEvent
}                           from 'react';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import {
    map,
    find,
    uniq,
    reject,
    filter,
    reduce,
    flatMap,
    orderBy
}                           from 'lodash';
import type {
    ColDef,
    GridApi,
    ColumnApi,
    GridReadyEvent,
    ICellRendererParams,
    ValueFormatterParams
}                           from 'ag-grid-community';
// DS
import {
    YpInput,
    YpButton,
    YpTooltip,
    YpElement,
    YpDatagrid,
    useYpModal,
    YpTypography
} from 'ds';
// @app/dossier
import YpTagMultiSelect                     from '@app/dossier/components/cumuls/tag/YpTagMultiSelect';
import VestibuleImportComponent             from '@app/dossier/components/vestibule/VestibuleImportComponent';
import VestibuleActionsComponent            from '@app/dossier/components/vestibule/VestibuleActionsComponent';
import VestibuleFicheFormComponent          from '@app/dossier/components/vestibule/VestibuleFicheFormComponent';
import { DonneeTypeEnum }                   from '@app/dossier/models/enums/DonneeContextuelle';
import VestibuleTypeFicheEnum               from '@app/dossier/models/enums/VestibuleTypeFicheEnum';
import { useReferencialContext }            from '@app/dossier/providers/referencial/ReferencialContextProvider';
import useFichesHistorisationList           from '@app/dossier/providers/fiches/FichesHistorisationListProvider';
import useIngredientsListProvider           from '@app/dossier/providers/ingredients/IngredientsListProvider';
import useTablesReferenceSearchProvider     from '@app/dossier/providers/tablesReference/TablesReferenceSearchProvider';
import type { SelectItem }                  from '@app/dossier/components/cumuls/tag/YpTagSelectItem';
import type ImportLotModel                  from '@app/dossier/models/LotModel';
import type GroupementModel                 from '@app/dossier/models/GroupementModel';
import type LigneImportModel                from '@app/dossier/models/LigneImportModel';
import type SqueletteFicheModel             from '@app/dossier/models/SqueletteFicheModel';
import type DonneeContextuelleModel         from '@app/dossier/models/DonneeContextuelleModel';
import type { TVestibuleTypeFicheCode }     from '@app/dossier/models/enums/VestibuleTypeFicheEnum';
import type { TLignesImportListActions }    from '@app/dossier/providers/vestibule/LignesImportListProvider';
import type { THistorisationValorisation }  from '@app/dossier/models/fiches/HistorisationModel';
// @core
import {
    WsDataModel
} from '@core/models/ProviderModel';
import type {
    TDataProviderReturn,
    TActionProviderReturn
} from '@core/models/ProviderModel';
// @library
import { getDateFormat }        from '@library/utils/dates';
import { getPageStyleHeight }   from '@library/utils/styles';
// Utils
import {
    formattedIban,
    formattedNir
}   from 'yutils/text';
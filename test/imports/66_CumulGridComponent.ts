// Misc
import {
    useMemo,
    useState,
    Fragment,
    useEffect,
    type FC,
    type ChangeEvent
}                           from 'react';
import cn                   from 'classnames';
import {
    map,
    find,
    sortBy,
    reduce,
    uniqBy,
    filter,
    flatMap,
    capitalize,
    startsWith
}                           from 'lodash';
import { format }           from 'date-fns';
import { fr }               from 'date-fns/locale';
import { navigate }         from '@reach/router';
import type { IconName }    from '@fortawesome/fontawesome-svg-core';
import type {
    ColDef,
    GridApi,
    RowNode,
    ColumnApi,
    GridReadyEvent,
    NewValueParams,
    ValueGetterParams,
    ValueFormatterParams,
    EditableCallbackParams
}                           from 'ag-grid-community';
// DS
import {
    YpInput,
    YpButton,
    YpElement,
    YpDatagrid,
    YpMarkdown,
    YpTypography,
    YpDatagridColumn,
    useYpWrapperContext,
    YpDatagridCellTagRenderer,
    YpDataGridCellComposedwithDatesRenderer,
    type TTailwindColorPalette
}                                       from 'ds';
// @app/dossier
import YpTagMultiSelect                     from '@app/dossier/components/cumuls/tag/YpTagMultiSelect';
import IngredientRubriqueColonne            from '@app/dossier/models/enums/IngredientRubriqueColonne';
import { useDossierContext }                from '@app/dossier/providers/contexts/DossierContextProvider';
import useEvpDetail                         from '@app/dossier/providers/evp/EvpDetailProvider';
import useEvpSaisieDetail                   from '@app/dossier/providers/evp/EvpSaisieDetailProvider';
import useIngredientsListSearchFullProvider from '@app/dossier/providers/ingredients/IngredientsListSearchFullProvider';
import { moduleRoute as DossierModule }     from '@app/dossier/resources/common/Router';
import useFichesHistorisationList           from '@app/dossier/providers/fiches/FichesHistorisationListProvider';
import type { SelectItem }                  from '@app/dossier/components/cumuls/tag/YpTagSelectItem';
import type EvpModel                        from '@app/dossier/models/EvpModel';
import type IngredientModel                 from '@app/dossier/models/ingredients/IngredientModel';
import type { TIngredientTag }              from '@app/dossier/models/ingredients/IngredientModel';
import type SalariesListModel               from '@app/dossier/models/SalariesListModel';
import type PeriodeEvpModel                 from '@app/dossier/models/PeriodeEvpDetailModel';
// @core
import type { TDataProviderReturn } from '@core/models/ProviderModel';
// @library
import { getDateFormat }            from '@library/utils/dates';
import { getPageStyleHeight }       from '@library/utils/styles';
import { getComposedDataForExport } from '@library/utils/grid';
// Utils
import { conjugate } from 'yutils/text';
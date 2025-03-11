// Misc
import {
    useEffect,
    useState,
    useMemo,
    type FC
}                               from 'react';
import {
    isDate,
    format,
    parseISO,
    startOfMonth,
    lastDayOfMonth
}                               from 'date-fns';
import cn                       from 'classnames';
import {
    map,
    sortBy,
    isNumber
}                               from 'lodash';
import type {
    ColDef,
    GridApi,
    ColumnApi,
    GridReadyEvent,
    ValueFormatterParams,
    ProcessCellForExportParams
}                              from 'ag-grid-community';
// DS
import {
    YpSelect,
    YpElement,
    YpDatagrid,
    YpSkeleton,
    YpMultiSelect,
    YpMasterpicker,
    YpContentSwitcher,
    useYpWrapperContext
}                        from 'ds';
import type {
    TYpSelectOption,
    TYpMasterpickerRange
}                        from 'ds';
// @app/dossier
import { VueColumnTypeEnum }         from '@app/dossier/models/enums/vue/VueColumnTypeEnum';
import useVuesSearchProvider         from '@app/dossier/providers/vue/VueSearchProvider';
import { useDossierContext }         from '@app/dossier/providers/contexts/DossierContextProvider';
import useEtablissementsList         from '@app/dossier/providers/fiches/etablissements/EtablissementsListProvider';
import useDatasourcesListProvider    from '@app/dossier/providers/vue/DatasourcesListProvider';
import useDatasourceDetailProvider   from '@app/dossier/providers/vue/DatasourceDetailProvider';
import usePostproductionListProvider from '@app/dossier/providers/postproduction/PostproductionListProvider';
import useVueDetailProvider, {
    onVueUpdateVisibility
}                                    from '@app/dossier/providers/vue/VueDetailProvider';
import { getDCByCodes }              from '@app/dossier/utils/fiche';
import { getKeyByValue }             from '@app/dossier/utils/enum';
import type DossierModel             from '@app/dossier/models/DossierModel';
import type { PostProductionModel }  from '@app/dossier/models/PostproductionModel';
// @library
import {
    getDateFormat,
    isStringDate
}                             from '@library/utils/dates';
import { getPageStyleHeight } from '@library/utils/styles';
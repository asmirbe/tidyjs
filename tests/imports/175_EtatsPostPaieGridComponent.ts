// Misc
import {
    useMemo,
    useState,
    useEffect
}                              from 'react';
import {
    format,
    parseISO,
    startOfMonth,
    lastDayOfMonth
}                              from 'date-fns';
import { FontAwesomeIcon }     from '@fortawesome/react-fontawesome';
import {
    map,
    find,
    join,
    delay,
    isDate,
    filter,
    uniqBy,
    sortBy,
    replace,
    orderBy
}                              from 'lodash';
import type { FC }             from 'react';
import type {
    ColDef,
    GridApi,
    ColumnApi,
    GridReadyEvent,
    RowClassParams,
    CellClassParams,
    ProcessCellForExportParams
}                              from 'ag-grid-community';
// DS
import {
    YpModal,
    YpAlert,
    YpSelect,
    YpButton,
    YpElement,
    YpDivider,
    YpDatagrid,
    useYpModal,
    YpSkeleton,
    YpTypography,
    YpMasterpicker,
    useToastContext,
    YpContentSwitcher,
    useYpWrapperContext,
    YpMultiSelect
}                           from 'ds';
import type {
    TTextWeight,
    TYpMasterpickerRange,
    TYpSelectOption
}                           from 'ds';
// @app/dossier
import { getTypesBulletinByNumber }         from '@app/dossier/components/bulletins/utils/bulletin';
import DocumentFormModel                    from '@app/dossier/models/ged/documents/DocumentFormModel';
import { TypeDocumentEnum }                 from '@app/dossier/models/enums/ged/GEDEnums';
import { VueColumnTypeEnum }                from '@app/dossier/models/enums/vue/VueColumnTypeEnum';
import useDocumentForm                      from '@app/dossier/providers/ged/documents/DocumentFormProvider';
import useVueDetailProvider                 from '@app/dossier/providers/vue/VueDetailProvider';
import useVuesSearchProvider                from '@app/dossier/providers/vue/VueSearchProvider';
import { useDossierContext }                from '@app/dossier/providers/contexts/DossierContextProvider';
import { onVueUpdateVisibility }            from '@app/dossier/providers/vue/VueDetailProvider';
import useDatasourcesListProvider           from '@app/dossier/providers/vue/DatasourcesListProvider';
import useDatasourceDetailProvider          from '@app/dossier/providers/vue/DatasourceDetailProvider';
import useTypesDocumentSearchProvider       from '@app/dossier/providers/ged/types/TypesDocumentSearchProvider';
import useFamillesDocumentSearchProvider    from '@app/dossier/providers/ged/familles/FamillesDocumentSearchProvider';
import useEtablissementsList                from '@app/dossier/providers/fiches/etablissements/EtablissementsListProvider';
import usePostproductionListProvider        from '@app/dossier/providers/postproduction/PostproductionListProvider';
import { moduleRoute as DossierModule }     from '@app/dossier/resources/common/Router';
import { getKeyByValue }                    from '@app/dossier/utils/enum';
import { getDCByCodes }                     from '@app/dossier/utils/fiche';
import {
    createPDF,
    previewToPDF,
    downloadToPDF,
    getDocumentTitle
}                                           from '@app/dossier/utils/pdf';
import type VueModel                        from '@app/dossier/models/vue/VueModel';
import type DossierModel                    from '@app/dossier/models/DossierModel';
import type VueDetailModel                  from '@app/dossier/models/vue/VueDetailModel';
import type TypeDocumentModel               from '@app/dossier/models/ged/types/TypeDocumentModel';
import type FamilleDocumentModel            from '@app/dossier/models/ged/familles/FamilleDocumentModel';
import type { PostProductionModel }         from '@app/dossier/models/PostproductionModel';
import type { TGEDRouter }                  from '@app/dossier/pages/ged/GEDWrapperTabsComponent';
import type { TPDFArgs }                    from '@app/dossier/utils/pdf';
// @core
import { navigateState } from '@core/utils/routing';
// @library
import { getDateFormat }        from '@library/utils/dates';
import { getPageStyleHeight }   from '@library/utils/styles';
// yutils
import FormFieldComponent   from '@library/form/components/FormFieldComponent';
import FormContextProvider  from '@library/form/providers/FormProvider';
import type FormFieldModel  from '@library/form/models/FormFieldModel';
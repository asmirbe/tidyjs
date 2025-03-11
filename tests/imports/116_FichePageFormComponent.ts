// Misc
import {
    useState,
    useEffect
}                       from 'react';
import cn               from 'classnames';
import {
    orderBy,
    isEmpty,
    filter,
    reduce,
    first,
    find,
    map,
    reject
}                       from 'lodash';
import type { FC }      from 'react';
// DS
import {
    YpTab,
    YpGrid,
    YpElement,
    YpCollapse,
    YpFormModal,
    YpSkeletonList
} from 'ds';
import type {
    TYpGridColumType,
    TYpTabVariantType
} from 'ds';
// @app/dossier
import FicheReportDetailComponent   from '@app/dossier/components/fiches/FicheReportDetailComponent';
import { useReferencialContext }    from '@app/dossier/providers/referencial/ReferencialContextProvider';
import { getDCDirtyReport }         from '@app/dossier/utils/fiche';
import type FicheFormModel          from '@app/dossier/models/fiches/FicheFormModel';
import type GroupementModel         from '@app/dossier/models/GroupementModel';
import type {
    TFicheFormActions,
    TFicheFormAdditionals
}                                   from '@app/dossier/providers/fiches/FicheFormProvider';
import type { FieldRules }          from '@app/dossier/utils/fiche';
// @core
import type { TOpenState }          from '@core/models/CoreModel';
import type {
    TActionProviderReturn,
    WsDataModel
}                                   from '@core/models/ProviderModel';
// @library
import FormComponent        from '@library/form/components/FormComponent';
import FormFieldComponent   from '@library/form/components/FormFieldComponent';
import FormContextProvider  from '@library/form/providers/FormProvider';
import type FormFieldModel  from '@library/form/models/FormFieldModel';
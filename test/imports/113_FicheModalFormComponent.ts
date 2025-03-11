// Misc
import {
    useState,
    useEffect,
    useRef
}                  from 'react';
import {
    map,
    find,
    sortBy,
    filter,
    orderBy
}                  from 'lodash';
import type { FC } from 'react';
import cn          from 'classnames';
// DS
import {
    YpTab,
    YpElement,
    YpSkeletonList,
    YpTypography
} from 'ds';
// @app/dossier
import FicheReportDetailComponent   from '@app/dossier/components/fiches/FicheReportDetailComponent';
import type FicheFormModel          from '@app/dossier/models/fiches/FicheFormModel';
import type GroupementModel         from '@app/dossier/models/GroupementModel';
import type {
    TFicheFormActions,
    TFicheFormAdditionals
}                                   from '@app/dossier/providers/fiches/FicheFormProvider';
import type { FieldRules }          from '@app/dossier/utils/fiche';
// @core
import type { TActionProviderReturn } from '@core/models/ProviderModel';
// @library
import FormComponent        from '@library/form/components/FormComponent';
import FormFieldComponent   from '@library/form/components/FormFieldComponent';
import FormContextProvider  from '@library/form/providers/FormProvider';
import useAnchor            from '@library/utils/anchor';
import type FormFieldModel  from '@library/form/models/FormFieldModel';
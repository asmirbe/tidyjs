// Misc
import {
    useState,
    useEffect,
    Fragment
}              from 'react';
import {
    map,
    filter,
    reject
}              from 'lodash';
import type {
    FC,
    MouseEvent
}              from 'react';
// DS
import {
    YpTab,
    YpButton,
    YpDivider,
    YpElement,
    YpTypography,
    YpConfirmModal,
    useYpModal,
    YpSkeletonList
} from 'ds';
// @app/dossier
import SignataireModel                      from '@app/dossier/models/SignataireModel';
import useSignataireActions                 from '@app/dossier/providers/parametrage-dossier/signataires/SignataireActionsProvider';
import type SignataireMultiFormModel        from '@app/dossier/models/SignataireMultiFormModel';
import type { TSignataireType }             from '@app/dossier/models/SignataireModel';
import type { TSignataireMultiFormActions } from '@app/dossier/providers/parametrage-dossier/signataires/SignataireMultiFormProvider';
import type { TParametrageProviderReturn }  from '@app/dossier/providers/parametrage-dossier/ParametrageDossierProvider';
// @core
import type {
    TActionProviderReturn,
    TDataProviderReturn
} from '@core/models/ProviderModel';
// @library
import FormComponent        from '@library/form/components/FormComponent';
import FormFieldComponent   from '@library/form/components/FormFieldComponent';
import FormContextProvider  from '@library/form/providers/FormProvider';
import { required }         from '@library/form/providers/validation';
import { EmptyComponent }   from '@library/utils/list';
import type FormFieldModel  from '@library/form/models/FormFieldModel';
// Utils
import { conjugate } from 'yutils/text';
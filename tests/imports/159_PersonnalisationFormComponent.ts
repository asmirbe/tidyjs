// Misc
import {
    useRef,
    useState,
    type FC
}                   from 'react';
import {
    map,
    omit
}                   from 'lodash';
import cn           from 'classnames';
// DS
import {
    YpElement,
    YpTypography,
    YpTag,
    YpGroupSelect,
    YpFormModal,
    type TYpModalProviderReturn,
    type OptionsGroup,
    YpLabel
} from 'ds';
// @app/dossier
import PersonnalisationFormSection
    from '@app/dossier/components/parametrage-dossier/personnalisation/PersonnalisationFormSectionComponent';
import IngredientTypeEnum                     from '@app/dossier/models/enums/IngredientType';
import type {
    TIngredientLie,
    TIngredientTag
}                                             from '@app/dossier/models/ingredients/IngredientModel';
import type { TFormSection }                  from '@app/dossier/components/parametrage-dossier/personnalisation/utils';
import type { TPersonnalisationListProvider } from '@app/dossier/providers/parametrage-dossier/ingredients/PersonnalisationListProvider';
// @library
import FormFieldComponent       from '@library/form/components/FormFieldComponent';
import FormComponent            from '@library/form/components/FormComponent';
import FormContextProvider      from '@library/form/providers/FormProvider';
import useAnchor                from '@library/utils/anchor';
import type FormFieldModel      from '@library/form/models/FormFieldModel';
// @core
import type {
    TCallParams,
    WsDataModel
} from '@core/models/ProviderModel';
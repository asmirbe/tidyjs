// Misc
import {
    useState,
    useEffect,
    type FC
}              from 'react';
import {
    orderBy,
    filter,
    find,
    map
}              from 'lodash';
// DS
import {
    YpElement,
    YpTypography,
    YpDivider
} from 'ds';
// @app/dossier
import type GroupementModel            from '@app/dossier/models/GroupementModel';
import type FicheMultiFormModel        from '@app/dossier/models/fiches/FicheMultiFormModel';
import type { TFicheFormAdditionals }  from '@app/dossier/providers/fiches/FicheFormProvider';
import type { TFicheMultiFormActions } from '@app/dossier/providers/fiches/FicheMultiFormProvider';
import type { FieldRules }             from '@app/dossier/utils/fiche';
// @core
import type { TActionProviderReturn } from '@core/models/ProviderModel';
// @library
import FormFieldComponent  from '@library/form/components/FormFieldComponent';
import type FormFieldModel from '@library/form/models/FormFieldModel';
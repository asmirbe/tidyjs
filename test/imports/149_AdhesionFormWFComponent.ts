// Misc
import {
    useState,
    type FC,
    type Dispatch,
    type SetStateAction
}                           from 'react';
import {
    map,
    find,
    filter,
    orderBy,
    findIndex
}                           from 'lodash';
import { v4 as uuidv4 }     from 'uuid';
// DS
import {
    YpInput,
    YpButton,
    YpElement,
    YpDivider,
    YpTypography,
    YpMultiSelect,
} from 'ds';
// @app/dossier
import AdhesionFormModel                from '@app/dossier/models/fiches/adhesion/AdhesionFormModel';
import { useReferencialContext }        from '@app/dossier/providers/referencial/ReferencialContextProvider';
import {
    getDCByCodeGroupement,
    getValorisationByPropertyKey
}                                       from '@app/dossier/utils/fiche';
import type FicheFormModel              from '@app/dossier/models/fiches/FicheFormModel';
import type FamilleAdhesionModel        from '@app/dossier/models/adhesions/famille/FamilleAdhesionModel';
import type AdhesionMultiFormModel      from '@app/dossier/models/fiches/adhesion/AdhesionMultiFormModel';
import type { TFicheMultiFormActions }  from '@app/dossier/providers/fiches/FicheMultiFormProvider';
// @core
import type { TActionProviderReturn } from '@core/models/ProviderModel';
// @library
import FormContextProvider  from '@library/form/providers/FormProvider';
import FormComponent        from '@library/form/components/FormComponent';
import FormFieldComponent   from '@library/form/components/FormFieldComponent';
import type FormFieldModel  from '@library/form/models/FormFieldModel';
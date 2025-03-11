// Misc
import {
    map,
    find,
    filter
}                   from 'lodash';
import type { FC }  from 'react';
// DS
import {
    YpElement,
    YpTypography
}                               from 'ds';
import type { TYpSelectOption } from 'ds';
// @app/dossier
import { useReferencialContext }   from '@app/dossier/providers/referencial/ReferencialContextProvider';
import { getFicheFieldDefinition } from '@app/dossier/providers/fiches/utils/fields';
import type {
    TFicheFormActions,
    TFicheFormAdditionals
}                                  from '@app/dossier/providers/fiches/FicheFormProvider';
import type HistorisationModel     from '@app/dossier/models/fiches/HistorisationModel';
import type ContratFormModel       from '@app/dossier/models/fiches/contrat/ContratFormModel';
// @core
import type { TActionProviderReturn } from '@core/models/ProviderModel';
// @library
import FormComponent        from '@library/form/components/FormComponent';
import FormFieldComponent   from '@library/form/components/FormFieldComponent';
import FormContextProvider  from '@library/form/providers/FormProvider';
import type FormFieldModel  from '@library/form/models/FormFieldModel';
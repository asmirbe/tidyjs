// Misc
import type { FC }          from 'react';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
// DS
import {
    YpElement,
    YpTypography,
    YpHeaderedElement
}                                       from 'ds';
import type { TYpHeaderedElementProps } from 'ds';
//@app/dossier
import type AdhesionRetraiteFormModel         from '@app/dossier/models/AdhesionRetraiteFormModel';
import type { TAdhesionRetraiteFormActions }  from '@app/dossier/providers/adhesions/retraite/AdhesionRetraiteFormProvider';
// Library
import FormComponent        from '@library/form/components/FormComponent';
import FormFieldComponent   from '@library/form/components/FormFieldComponent';
import FormContextProvider  from '@library/form/providers/FormProvider';
import type FormFieldModel  from '@library/form/models/FormFieldModel';
// @core
import type { TActionProviderReturn } from '@core/models/ProviderModel';
import { getColorFromString } from '@library/utils/styles';
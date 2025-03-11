// Misc
import {
    map,
    find,
    groupBy,
    upperCase
}                   from 'lodash';
import type { FC }  from 'react';
// DS
import {
    YpElement,
    YpMarkdown,
    YpTypography
} from 'ds';
// @app/dossier
import { useReferencialContext }                from '@app/dossier/providers/referencial/ReferencialContextProvider';
import { DonneeTypeEnum }                       from '@app/dossier/models/enums/DonneeContextuelle';
import type GroupementModel                     from '@app/dossier/models/GroupementModel';
import type DonneeContextuelleModel             from '@app/dossier/models/DonneeContextuelleModel';
import type RegroupementAbsenceModel            from '@app/dossier/models/absences/RegroupementAbsenceModel';
import type { TRegroupementAbsenceFormActions } from '@app/dossier/providers/absences/RegroupementAbsenceFormProvider';
import type { TRegroupementAbsenceAdditionals } from '@app/dossier/providers/absences/RegroupementAbsenceDetailProvider';
// @core
import type { TActionProviderReturn } from '@core/models/ProviderModel';
// @library
import FormFieldComponent   from '@library/form/components/FormFieldComponent';
import type FormFieldModel  from '@library/form/models/FormFieldModel';
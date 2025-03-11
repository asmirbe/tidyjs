// Misc
import {
    useState,
    useEffect,
    type FC,
    type MouseEvent
}                           from 'react';
import cn                   from 'classnames';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import {
    map,
    find,
    first,
    reject,
    filter,
    orderBy,
    flatMap,
    findIndex,
    capitalize
}                           from 'lodash';
import { v4 as uuidv4 }     from 'uuid';
// DS
import {
    YpButton,
    YpElement,
    YpTypography
} from 'ds';
// @app/dossier
import PaiementFormModel                        from '@app/dossier/models/fiches/paiement/PaiementFormModel';
import { getValorisationValue }                 from '@app/dossier/providers/historique/HistorisationDetailProvider';
import { useReferencialContext }                from '@app/dossier/providers/referencial/ReferencialContextProvider';
import {
    getDcLienName,
    getDCByCodeGroupement,
    getValorisationByPropertyKey
}                                               from '@app/dossier/utils/fiche';
import type FicheFormModel                      from '@app/dossier/models/fiches/FicheFormModel';
import type SqueletteFicheModel                 from '@app/dossier/models/SqueletteFicheModel';
import type FamilleAdhesionModel                from '@app/dossier/models/adhesions/famille/FamilleAdhesionModel';
import type AdhesionMultiFormModel              from '@app/dossier/models/fiches/adhesion/AdhesionMultiFormModel';
import type { TFicheMultiFormActions }          from '@app/dossier/providers/fiches/FicheMultiFormProvider';
import type { TFicheReferencial }               from '@app/dossier/providers/referencial/ReferencialContextProvider';
// @core
import type { TActionProviderReturn } from '@core/models/ProviderModel';
// @library
import FormComponent        from '@library/form/components/FormComponent';
import FormFieldComponent   from '@library/form/components/FormFieldComponent';
import FormContextProvider  from '@library/form/providers/FormProvider';
import { getDateFormat }    from '@library/utils/dates';
import type FormFieldModel  from '@library/form/models/FormFieldModel';
// @yutils
import {
    formatSiret,
    formattedSiren
}   from 'yutils/text';
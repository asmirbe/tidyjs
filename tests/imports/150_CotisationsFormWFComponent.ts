// Misc
import {
    Fragment,
    useState,
    useEffect,
    type FC,
    type MouseEvent
}                           from 'react';
import cn                   from 'classnames';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import {
    map,
    uniq,
    find,
    first,
    reject,
    filter,
    orderBy,
    findIndex
}                           from 'lodash';
import { v4 as uuidv4 }     from 'uuid';
// DS
import {
    YpButton,
    YpElement,
    YpTypography,
    YpMultiSelect
} from 'ds';
// @app/dossier
import { useReferencialContext }                from '@app/dossier/providers/referencial/ReferencialContextProvider';
import CotisationFormModel                      from '@app/dossier/models/fiches/cotisations/CotisationFormModel';
import {
    datas,
    getDcLienName,
    getDCByCodeGroupement
}                                               from '@app/dossier/utils/fiche';
import TypeLienAdhesionEnum                     from '@app/dossier/models/enums/TypeLienAdhesionEnum';
import type FicheFormModel                      from '@app/dossier/models/fiches/FicheFormModel';
import type AdhesionFormModel                   from '@app/dossier/models/fiches/adhesion/AdhesionFormModel';
import type TypeCotisationModel                 from '@app/dossier/models/adhesions/cotisations/TypeCotisationModel';
import type FamilleAdhesionModel                from '@app/dossier/models/adhesions/famille/FamilleAdhesionModel';
import type AdhesionMultiFormModel              from '@app/dossier/models/fiches/adhesion/AdhesionMultiFormModel';
import type SqueletteFicheModel                 from '@app/dossier/models/SqueletteFicheModel';
import type { TFicheMultiFormActions }          from '@app/dossier/providers/fiches/FicheMultiFormProvider';
// @core
import picto                            from '@core/resources/assets/images/yeap/picto-yeap.png';
import type { TActionProviderReturn }   from '@core/models/ProviderModel';
// @library
import FormComponent        from '@library/form/components/FormComponent';
import FormFieldComponent   from '@library/form/components/FormFieldComponent';
import { required }         from '@library/form/providers/validation';
import FormContextProvider  from '@library/form/providers/FormProvider';
import { getDateFormat }    from '@library/utils/dates';
import type FormFieldModel  from '@library/form/models/FormFieldModel';
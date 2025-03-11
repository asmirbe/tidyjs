// Misc
import {
    format,
    parseISO
}                           from 'date-fns';
import cn                   from 'classnames';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import {
    map,
    filter,
    orderBy
}                           from 'lodash';
import type { FC }          from 'react';
// DS
import {
    YpElement,
    YpFormModal,
    YpTypography,
    YpSkeletonList,
    useYpWrapperContext,
    useToastContext
} from 'ds';
// @app/dossier
import BulletinStatutEnum                   from '@app/dossier/models/enums/bulletin/BulletinStatut';
import BulletinTypeEnum                     from '@app/dossier/models/enums/BulletinType';
import { useDossierContext }                from '@app/dossier/providers/contexts/DossierContextProvider';
import { getValorisationByPropertyKey }     from '@app/dossier/utils/fiche';
import BulletinAnnuleIcon                   from '@app/dossier/utils/bulletin/bulletin-annule.svg?react';
import BulletinAnnulationIcon               from '@app/dossier/utils/bulletin/bulletin-annulation.svg?react';
import BulletinRemplacementIcon             from '@app/dossier/utils/bulletin/bulletin-remplacement.svg?react';
import BulletinComplementaireIcon           from '@app/dossier/utils/bulletin/bulletin-complementaire.svg?react';
import type BulletinChronologiqueModel      from '@app/dossier/models/BulletinChronologiqueModel';
import type BulletinAnnulationFormModel     from '@app/dossier/models/bulletin/BulletinAnnulationFormModel';
import type BulletinPeriodeModel            from '@app/dossier/models/BulletinPeriodeModel';
import type HistorisationModel              from '@app/dossier/models/fiches/HistorisationModel';
import type { TBulletinsActions }           from '@app/dossier/providers/bulletins/BulletinChronoSearchProvider';
// @app/notification
import { useClientNotification } from '@app/notification/ClientNotificationProvider';
// @core
import type {
    TDataProviderReturn,
    TFormProviderReturn,
    WsDataModel
} from '@core/models/ProviderModel';
// @library
import FormFieldComponent       from '@library/form/components/FormFieldComponent';
import FormComponent            from '@library/form/components/FormComponent';
import FormContextProvider      from '@library/form/providers/FormProvider';
import { formatLeadingZeros }   from '@library/utils/number';
import type FormFieldModel      from '@library/form/models/FormFieldModel';
// yutils
import {
    conjugate,
    getTextPreview
} from 'yutils/text';
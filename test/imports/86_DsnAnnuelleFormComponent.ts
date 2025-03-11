// Misc
import {
    useState,
    useEffect
}                           from 'react';
import cn                   from 'classnames';
import { format }           from 'date-fns';
import {
    map,
    find,
    keys,
    range,
    reduce,
    reject,
    filter,
    orderBy,
    isEmpty,
    capitalize
}                           from 'lodash';
import { v4 as uuidv4  }    from 'uuid';
import type { FC }          from 'react';
// DS
import {
    YpTag,
    YpIcon,
    YpSelect,
    YpElement,
    YpDivider,
    useYpModal,
    YpFormModal,
    YpTypography,
    YpConfirmModal
} from 'ds';
// @app/dossier
import FicheFormModel               from '@app/dossier/models/fiches/FicheFormModel';
import useFicheMultiForm            from '@app/dossier/providers/fiches/FicheMultiFormProvider';
import { useFicheDelete }           from '@app/dossier/providers/fiches/FicheDeleteProvider';
import { useFicheActions }          from '@app/dossier/providers/fiches/FicheActionsProvider';
import { useDossierContext }        from '@app/dossier/providers/contexts/DossierContextProvider';
import { useReferencialContext }    from '@app/dossier/providers/referencial/ReferencialContextProvider';
import useFichesHistorisationList   from '@app/dossier/providers/fiches/FichesHistorisationListProvider';
import { datas }                    from '@app/dossier/utils/fiche';
import type GroupementModel         from '@app/dossier/models/GroupementModel';
import type HistorisationModel      from '@app/dossier/models/fiches/HistorisationModel';
import type SqueletteFicheModel     from '@app/dossier/models/SqueletteFicheModel';
import type DonneeContextuelleModel from '@app/dossier/models/DonneeContextuelleModel';
// @core
import type { WsDataModel } from '@core/models/ProviderModel';
// @library
import FormFieldComponent  from '@library/form/components/FormFieldComponent';
import FormContextProvider from '@library/form/providers/FormProvider';
import { EmptyComponent }  from '@library/utils/list';
import type FormFieldModel from '@library/form/models/FormFieldModel';
// yutils
import {
    conjugate,
    getTextPreview
} from 'yutils/text';
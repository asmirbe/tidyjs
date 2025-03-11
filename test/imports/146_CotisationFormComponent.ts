// Misc
import { useEffect }    from 'react';
import cn               from 'classnames';
import {
    map,
    find,
    filter,
    orderBy
}                       from 'lodash';
import type {
    FC,
    ChangeEvent
}                       from 'react';
// DS
import {
    YpElement,
    YpFormModal,
    YpTypography
} from 'ds';
// @app/dossier
import FieldVisibiliteEnum          from '@app/dossier/models/enums/FieldVisibiliteEnum';
import useFicheForm                 from '@app/dossier/providers/fiches/FicheFormProvider';
import { useDossierContext }        from '@app/dossier/providers/contexts/DossierContextProvider';
import { useReferencialContext }    from '@app/dossier/providers/referencial/ReferencialContextProvider';
import { getDCByCodeGroupement }    from '@app/dossier/utils/fiche';
import type DonneeContextuelleModel from '@app/dossier/models/DonneeContextuelleModel';
import type CotisationFormModel     from '@app/dossier/models/fiches/cotisations/CotisationFormModel';
import type FicheFormModel          from '@app/dossier/models/fiches/FicheFormModel';
import type HistorisationModel      from '@app/dossier/models/fiches/HistorisationModel';
import type GroupementModel         from '@app/dossier/models/GroupementModel';
import type SqueletteFicheModel     from '@app/dossier/models/SqueletteFicheModel';
// @core
import {
    WsDataModel,
    type TDataProviderReturn
} from '@core/models/ProviderModel';
// @library
import FormComponent        from '@library/form/components/FormComponent';
import { required }         from '@library/form/providers/validation';
import FormFieldComponent   from '@library/form/components/FormFieldComponent';
import FormContextProvider  from '@library/form/providers/FormProvider';
// yutils
import { getTextPreview } from 'yutils/text';
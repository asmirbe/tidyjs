// Misc libs
import type { FC }   from 'react';
import { useEffect } from 'react';
import { head }      from 'lodash';
// DS
import {
    YpElement,
    YpFormModal
} from 'ds';
// @app/dossier
import type EtablissementModel       from '@app/dossier/models/fiches/etablissement/EtablissementModel';
import type TacheModel               from '@app/dossier/models/TacheModel';
import type TacheFormModel           from '@app/dossier/models/TacheFormModel';
import type { TTacheFormActions }    from '@app/dossier/providers/taches/TachesFormProvider';
// @core
import type {
    TActionProviderReturn,
    WsDataModel
} from '@core/models/ProviderModel';
// @library
import FormComponent        from '@library/form/components/FormComponent';
import FormFieldComponent   from '@library/form/components/FormFieldComponent';
import FormContextProvider  from '@library/form/providers/FormProvider';
import { getDateFormat }    from '@library/utils/dates';
import type FormFieldModel  from '@library/form/models/FormFieldModel';
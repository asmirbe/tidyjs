// Misc
import { useEffect } from 'react';
import type { FC }   from 'react';
// DS
import {
    YpElement,
    YpFormModal,
    YpThumbnail,
    YpTypography
} from 'ds';
// @app/dossier
import type NoteFormModel        from '@app/dossier/models/NoteFormModel';
import type { TNoteFormActions } from '@app/dossier/providers/notes/NoteFormProvider';
// @core
import type {
    TActionProviderReturn,
    WsDataModel
}                           from '@core/models/ProviderModel';
import { useUserContext }   from '@core/providers/contexts/UserContextProvider';
// @library
import FormComponent        from '@library/form/components/FormComponent';
import FormFieldComponent   from '@library/form/components/FormFieldComponent';
import FormContextProvider  from '@library/form/providers/FormProvider';
import type FormFieldModel  from '@library/form/models/FormFieldModel';
// Misc
import type {
    FC,
    Dispatch,
    SetStateAction
}                    from 'react';
import { useEffect } from 'react';
import { head }      from 'lodash';
// DS
import {
    YpElement,
    YpSkeleton
} from 'ds';
// @app/dossier
import ImportsFpocListComponent          from '@app/dossier/components/adhesions/import/ImportsFpocListComponent';
import type ImportAdhesionModel          from '@app/dossier/models/ImportAdhesionModel';
import type EtatImportAdhesionModel      from '@app/dossier/models/AdhesionFpocEtatImportModel';
import type { TImportFpocFormActions }   from '@app/dossier/providers/adhesions/import/ImportFpocFormProvider';
// @core
import type {
    TActionProviderReturn,
    TDataProviderReturn,
    WsDataModel
}                            from '@core/models/ProviderModel';
import type { TWsException } from '@core/models/CoreModel';
// @library
import FormComponent        from '@library/form/components/FormComponent';
import FormFieldComponent   from '@library/form/components/FormFieldComponent';
import FormContextProvider  from '@library/form/providers/FormProvider';
import type FormFieldModel  from '@library/form/models/FormFieldModel';
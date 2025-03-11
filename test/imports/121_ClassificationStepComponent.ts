// Misc
import {
    Fragment,
    useEffect,
    useCallback
}                  from 'react';
import {
    find,
    first,
    uniqBy
}                  from 'lodash';
import type {
    FC,
    Dispatch,
    SetStateAction
}                  from 'react';
// DS
import {
    YpTag,
    YpDivider,
    YpElement
} from 'ds';
// @app/dossier
import ClassificationDetailStepComponent            from '@app/dossier/components/fiches/classification/ClassificationDetailStepComponent';
import { FilterSymbolEnum }                         from '@app/dossier/models/enums/FilterSymbolEnum';
import useFichesHistorisationFilteredList           from '@app/dossier/providers/fiches/FichesHistorisationFilteredListProvider';
import usePopulationsGetMatchsList                  from '@app/dossier/providers/populations/PopulationGetMatchsListProvider';
import { useReferencialContext }                    from '@app/dossier/providers/referencial/ReferencialContextProvider';
import type ContratFormModel                        from '@app/dossier/models/fiches/contrat/ContratFormModel';
import type { TConventionsTags }                    from '@app/dossier/pages/creationSalarie/CreationSalariePage';
import type { TFicheDCs }                           from '@app/dossier/providers/populations/PopulationGetMatchsListProvider';
import type { TFicheFormActions }                   from '@app/dossier/providers/fiches/FicheFormProvider';
import type { TReferencialContextProviderProps }    from '@app/dossier/providers/referencial/ReferencialContextProvider';
// @core
import type { TActionProviderReturn } from '@core/models/ProviderModel';
// @library
import FormContextProvider from '@library/form/providers/FormProvider';
import FormComponent       from '@library/form/components/FormComponent';
import FormFieldComponent  from '@library/form/components/FormFieldComponent';
import { required }        from '@library/form/providers/validation';
import type FormFieldModel from '@library/form/models/FormFieldModel';
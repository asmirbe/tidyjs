// Misc
import {
    memo,
    useMemo,
    useState,
    useEffect,
    useCallback
}                          from 'react';
import cn                  from 'classnames';
import {
    map,
    find,
    filter,
    reject,
    orderBy
}                          from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type {
    FC,
    Dispatch,
    SetStateAction
}                          from 'react';
// DS
import {
    YpTag,
    YpLabel,
    YpElement,
    YpMarkdown,
    YpFormModal,
    YpDataTable,
    YpTypography,
    YpStepperNew,
    useYpStepper
} from 'ds';
// @app/dossier
import DualSearchWithPopulation                  from '@app/dossier/components/base/DualSearchWithPopulation';
import { evpsColumns }                           from '@app/dossier/components/evp/saisieManuelle/EvpListDefinition';
import IngredientRubriqueColonne                 from '@app/dossier/models/enums/IngredientRubriqueColonne';
import { useDossierContext }                     from '@app/dossier/providers/contexts/DossierContextProvider';
import useAccordsList                            from '@app/dossier/providers/fiches/accords/AccordsListProvider';
import { getValorisationValue }                  from '@app/dossier/providers/historique/HistorisationDetailProvider';
import { useReferencialContext }                 from '@app/dossier/providers/referencial/ReferencialContextProvider';
import { useSearchByPop }                        from '@app/dossier/utils/search-by-pop';
import type EvpModel                             from '@app/dossier/models/EvpModel';
import type EvpFormModel                         from '@app/dossier/models/EvpFormModel';
import type IngredientModel                      from '@app/dossier/models/ingredients/IngredientModel';
import type { TTagFilterLibelle }                from '@app/dossier/models/ingredients/IngredientModel';
import type { IngredientSearchModel }            from '@app/dossier/models/ingredients/IngredientsSearchListModel';
import type PeriodeEvpModel                      from '@app/dossier/models/PeriodeEvpDetailModel';
import type PeriodesEvpListModel                 from '@app/dossier/models/PeriodesEvpListModel';
import type PopulationModel                      from '@app/dossier/models/populations/PopulationModel';
import type { TEVPFormColonnes }                 from '@app/dossier/models/EvpFormModel';
import type { TEvpFormActions }                  from '@app/dossier/providers/evp/EvpFormProvider';
// @core
import grid_empty         from '@core/resources/assets/images/patterns/grid_empty.png';
import type {
    WsDataModel,
    TActionProviderReturn
}                         from '@core/models/ProviderModel';
// @library
import FormComponent       from '@library/form/components/FormComponent';
import FormFieldComponent  from '@library/form/components/FormFieldComponent';
import FormContextProvider from '@library/form/providers/FormProvider';
import { useTable }        from '@library/utils/table';
import { getDateFormat }   from '@library/utils/dates';
import type FormFieldModel from '@library/form/models/FormFieldModel';
// Utils
import { getTextPreview } from 'yutils/text';
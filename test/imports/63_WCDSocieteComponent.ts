// Misc Libs
import {
    Fragment,
    useState,
    useEffect,
    type Dispatch,
    type SetStateAction,
    type FC
}                          from 'react';
import { map }             from 'lodash';
import cn                  from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// DS
import {
    YpInput,
    YpButton,
    YpElement,
    YpFormModal,
    YpTypography,
    YpSkeletonList
} from 'ds';
// @app/dossier
import FicheFormComponent                    from '@app/dossier/components/fiches/FicheFormComponent';
import {
    getListFieldRules,
    getDCListFromAdditionnalsGroupements
}                                            from '@app/dossier/utils/fiche';
import type SocieteFormModel                 from '@app/dossier/models/fiches/societe/SocieteFormModel';
import type ImportLotModel                   from '@app/dossier/models/LotModel';
import type { TFicheFormActions }            from '@app/dossier/providers/fiches/FicheFormProvider';
import type { TWCDSocieteDetailAdditionals } from '@app/dossier/providers/creation-dossier/WCDSocieteProvider';
import type { TImportLotFormActions }        from '@app/dossier/providers/creation-dossier/import/WCDImportDSNFormProvider';
// @core
import type {
    TActionProviderReturn,
    TDataProviderReturn
}                            from '@core/models/ProviderModel';
import type { TWsException } from '@core/models/CoreModel';
// @library
import FormContextProvider from '@library/form/providers/FormProvider';
import FormComponent       from '@library/form/components/FormComponent';
import FormFieldComponent  from '@library/form/components/FormFieldComponent';
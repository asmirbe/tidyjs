// Misc
import {
    useState,
    useEffect
}                           from 'react';
import {
    map,
    reject
}                           from 'lodash';
import { v4 as uuidv4 }     from 'uuid';
import type {
    FC,
    MouseEvent
}                           from 'react';
// DS
import {
    YpButton,
    YpDivider,
    YpElement,
    useYpModal,
    YpSkeleton,
    YpConfirmModal
} from 'ds';
// @app/dossier
import FicheMultiReportDetailComponent      from '@app/dossier/components/fiches/FicheMultiReportDetailComponent';
import BanqueFormModel                      from '@app/dossier/models/fiches/banque/BanqueFormModel';
import { useFicheDelete }                   from '@app/dossier/providers/fiches/FicheDeleteProvider';
import { useReferencialContext }            from '@app/dossier/providers/referencial/ReferencialContextProvider';
import { banqueFicheTypes }                 from '@app/dossier/providers/fiches/banques/BanquesListProvider';
import { banqueRulesMapping }               from '@app/dossier/providers/fiches/banques/BanqueFormProvider';
import {
    getDCByCodes,
    getDCByGroupement
}                                           from '@app/dossier/utils/fiche';
import type BanqueModel                     from '@app/dossier/models/fiches/banque/BanqueModel';
import type BanqueMultiFormModel            from '@app/dossier/models/fiches/banque/BanqueMultiFormModel';
import type {
    TFicheMultiFormActions,
    TFicheMultiFormAdditionals
}                                           from '@app/dossier/providers/fiches/FicheMultiFormProvider';
import type { TParametrageProviderReturn }  from '@app/dossier/providers/parametrage-dossier/ParametrageDossierProvider';
// @core
import type {
    TDataProviderReturn,
    TActionProviderReturn
} from '@core/models/ProviderModel';
// @library
import FormComponent       from '@library/form/components/FormComponent';
import FormFieldComponent  from '@library/form/components/FormFieldComponent';
import FormContextProvider from '@library/form/providers/FormProvider';
import { EmptyComponent }  from '@library/utils/list';
// Utils
import { conjugate } from 'yutils/text';
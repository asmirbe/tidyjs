import { useEffect } from 'react';
import type { FC }   from 'react';
// DS
import {
    YpElement,
    YpFormModal
} from 'ds';
// @app/dossier
import FicheModalFormComponent           from '@app/dossier/components/fiches/FicheModalFormComponent';
import { useReferencialContext }         from '@app/dossier/providers/referencial/ReferencialContextProvider';
import { useDossierContext }             from '@app/dossier/providers/contexts/DossierContextProvider';
import {
    getDCByCodes,
    getDCDirtyReport,
    getListFieldRules,
    getDCListFromAdditionnalsGroupements
}                                        from '@app/dossier/utils/fiche';
import type FicheFormModel               from '@app/dossier/models/fiches/FicheFormModel';
import type EtablissementModel           from '@app/dossier/models/fiches/etablissement/EtablissementModel';
import type {
    TFicheFormActions,
    TFicheFormAdditionals
}                                        from '@app/dossier/providers/fiches/FicheFormProvider';
// @core
import type {
    TActionProviderReturn,
    WsDataModel
} from '@core/models/ProviderModel';
// Utils
import { getTextPreview }                from 'yutils/text';
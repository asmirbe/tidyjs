// Misc
import {
    Fragment,
    useState,
    useEffect,
    type FC,
    type ElementType
}                        from 'react';
import {
    map,
    head,
    find,
    filter,
    isEmpty,
    findIndex
}                        from 'lodash';
import cn                from 'classnames';
import type { IconName } from '@fortawesome/fontawesome-svg-core';
// DS
import {
    YpTab,
    YpAlert,
    YpButton,
    YpElement,
    YpSkeleton,
    YpTypography,
    type TYpStatus
} from 'ds';
// @app/dossier
import BanqueMultiFormComponent
    from '@app/dossier/components/parametrage-dossier/banques/BanqueMultiFormComponent';
import ReglesAbsencesIndemListComponent
    from '@app/dossier/components/parametrage-dossier/regles-absences-indem/ReglesAbsencesIndemListComponent';
import ParametrageCalculatoireTabComponent
    from '@app/dossier/components/parametrage-dossier/parametrage-calculatoire/ParametrageCalculatoireTabComponent';
import AdhesionsCotisationsTabComponent
    from '@app/dossier/components/parametrage-dossier/adhesions-cotisations/AdhesionsCotisationsTabComponent';
import AdministrationTabComponent               from '@app/dossier/components/parametrage-dossier/administration/AdministrationTabComponent';
import AccordsMultiFormComponent                from '@app/dossier/components/parametrage-dossier/accords/AccordListComponent';
import EffectifFormComponent                    from '@app/dossier/components/parametrage-dossier/effectifs/EffectifFormComponent';
import SignataireMultiFormComponent             from '@app/dossier/components/parametrage-dossier/signataires/SignataireMultiFormComponent';
import PersonnalisationListComponent            from '@app/dossier/components/parametrage-dossier/personnalisation/PersonnalisationListComponent';
import ParametrageStructureComponent            from '@app/dossier/components/parametrage-dossier/structure/ParametrageStructureComponent';
import TempsTravailListComponent                from '@app/dossier/components/parametrage-dossier/temps-travail/TempsTravailListComponent';
import { useReferencialContext }                from '@app/dossier/providers/referencial/ReferencialContextProvider';
import useParametrageDossierProvider            from '@app/dossier/providers/parametrage-dossier/ParametrageDossierProvider';
import ParametrageDossierContextProvider        from '@app/dossier/providers/parametrage-dossier/context/ParametrageDossierContextProvider';
import { getDCDirtyReport }                     from '@app/dossier/utils/fiche';
import type FicheFormModel                      from '@app/dossier/models/fiches/FicheFormModel';
import type { TFicheMultiFormAdditionals }      from '@app/dossier/providers/fiches/FicheMultiFormProvider';
import type {
    TParametrageDossierTitleTab,
    TParametrageProviderReturn
}                                               from '@app/dossier/providers/parametrage-dossier/ParametrageDossierProvider';
import type {
    TFicheFormActions,
    TFicheFormAdditionals
}                                               from '@app/dossier/providers/fiches/FicheFormProvider';
// @core
import { useUserContext }       from '@core/providers/contexts/UserContextProvider';
import { useLocationState }     from '@core/utils/routing';
import type {
    WsDataModel,
    TActionProviderReturn
}                               from '@core/models/ProviderModel';
import type { TWsException }    from '@core/models/CoreModel';
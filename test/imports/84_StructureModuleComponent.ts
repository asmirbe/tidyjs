// Misc
import {
    Fragment,
    useState,
    useEffect
}                           from 'react';
import cn                   from 'classnames';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import { map }              from 'lodash';
import type { FC }          from 'react';
import type { IconProp }    from '@fortawesome/fontawesome-svg-core';
// DS
import {
    YpButton,
    YpDivider,
    YpElement,
    useYpModal,
    YpTypography,
    YpConfirmModal,
    YpSkeletonList
} from 'ds';
// @app/dossier
import { StatutCreationDossierEnum }        from '@app/dossier/models/enums/StatutCreationDossierEnum';
import { useFicheDelete }                   from '@app/dossier/providers/fiches/FicheDeleteProvider';
import { useDossierContext }                from '@app/dossier/providers/contexts/DossierContextProvider';
// @library
import SocieteFormComponent                     from '@library/form-new/test/components/societe/SocieteFormComponent';
import EtablissementFormComponent               from '@library/form-new/test/components/etablissements/EtablissementFormComponent';
import useSocieteForm                           from '@library/form-new/test/providers/societe/SocieteFormProvider';
import useSocieteDetail                         from '@library/form-new/test/providers/societe/SocieteDetailProvider';
import useEtablissementForm                     from '@library/form-new/test/providers/etablissements/EtablissementFormProvider';
import {
    getDCByCodes,
    getValorisationByPropertyKey
}                                               from '@library/form-new/test/providers/fiches/utils/fiche';
import { EmptyComponent }                       from '@library/utils/list';
import type SocieteModel                        from '@library/form-new/test/models/SocieteModel';
import type { TCallReturn }                     from '@library/form-new/models/ProviderModel';
import type EtablissementModel                  from '@library/form-new/test/models/EtablissementModel';
import type { THistorisationsListSearchModel }  from '@library/form-new/test/models/HistorisationModel';
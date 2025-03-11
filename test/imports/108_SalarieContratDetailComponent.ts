// Misc
import cn                  from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type {
    FC,
    Dispatch,
    SetStateAction
}                          from 'react';
// DS
import {
    YpMenu,
    YpAlert,
    YpElement,
    useYpModal,
    YpSkeleton,
    YpTypography,
    YpConfirmModal,
    useToastContext
} from 'ds';
// @app/dossier
import PopulationsTagsListComponent         from '@app/dossier/components/population/PopulationsTagsListComponent';
import SalarieContratParametrageComponent   from '@app/dossier/components/fiche-salarie/detail/contrat/SalarieContratParametrageComponent';
import { useFicheDelete }                   from '@app/dossier/providers/fiches/FicheDeleteProvider';
import usePopulationsByContratList          from '@app/dossier/providers/populations/PopulationsListByContratProvider';
import type IndividuModel                   from '@app/dossier/models/fiches/individu/IndividuModel';
import type CotisationModel                 from '@app/dossier/models/fiches/affiliation/CotisationModel';
import type TableReferenceModel             from '@app/dossier/models/TableReferenceModel';
import type FamilleAdhesionModel            from '@app/dossier/models/adhesions/famille/FamilleAdhesionModel';
// @core
import { useUserContext }           from '@core/providers/contexts/UserContextProvider';
import type { TDataProviderReturn } from '@core/models/ProviderModel';
import type { TErrorModel }         from '@core/models/ErrorModel';
// @library
import ContratFormComponent                     from '@library/form-new/test/components/contrats/ContratFormComponent';
import useContratForm                           from '@library/form-new/test/providers/contrats/ContratFormProvider';
import { getDCByCodes }                         from '@library/form-new/test/providers/fiches/utils/fiche';
import { getPageStyleHeight }                   from '@library/utils/styles';
import type ContratModel                        from '@library/form-new/test/models/ContratModel';
import type { TCallReturn }                     from '@library/form-new/models/ProviderModel';
import type { THistorisationsListSearchModel }  from '@library/form-new/test/models/HistorisationModel';
import type { FicheOverloadModel }              from '@library/form-new/test/providers/fiches/FichesDossierListProvider';
// @yutils
import { conjugate } from 'yutils/text';
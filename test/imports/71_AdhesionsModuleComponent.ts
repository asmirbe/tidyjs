// Misc libs
import {
    useRef,
    Fragment,
    useEffect,
    type FC
}                           from 'react';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import {
    map,
    find,
    filter
}                           from 'lodash';
import { navigate }         from '@reach/router';
// DS
import {
    useYpModal,
    YpButton,
    YpDivider,
    YpElement,
    YpSkeleton,
    YpThumbnail,
    YpTypography,
} from 'ds';
// @app/dossier
import AdhesionCreationComponent            from '@app/dossier/components/adhesions/AdhesionCreationComponent';
import FpocDetailComponent                  from '@app/dossier/components/dashboard/general/adhesions/FpocDetailComponent';
import UrssafDetailComponent                from '@app/dossier/components/dashboard/general/adhesions/UrssafDetailComponent';
import { useDossierContext }                from '@app/dossier/providers/contexts/DossierContextProvider';
import useFamillesAdhesionList              from '@app/dossier/providers/adhesions/famille/FamillesAdhesionListProvider';
import useTableReferenceDetailProvider      from '@app/dossier/providers/tablesReference/TableReferenceDetailProvider';
import { moduleRoute as DossierModule }     from '@app/dossier/resources/common/Router';
import type { TAdhesionCreationForm }       from '@app/dossier/components/adhesions/AdhesionCreationComponent';
import type AdhesionEtablissementModel      from '@app/dossier/models/AdhesionEtablissementModel';
import type { THistorisationSearchModel }   from '@app/dossier/models/fiches/HistorisationModel';
// @core
import type { TDataProviderReturn } from '@core/models/ProviderModel';
// @library
import { EmptyComponent }       from '@library/utils/list';
import type { TCallReturn }     from '@library/form-new/models/ProviderModel';
import type EtablissementModel  from '@library/form-new/test/models/EtablissementModel';
// Utils
import { getTextPreview } from 'yutils/text';
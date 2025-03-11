// Misc
import cn                   from 'classnames';
import {
    map,
    find,
    slice,
    orderBy,
    filter
}                           from 'lodash';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import { navigate }         from '@reach/router';
import type { FC }          from 'react';
// DS
import {
    YpButton,
    YpDivider,
    YpElement,
    YpTypography,
    YpSkeletonList
} from 'ds';
// @app/dossier
import { useDossierContext }                from '@app/dossier/providers/contexts/DossierContextProvider';
import useFamillesDocumentSearchProvider    from '@app/dossier/providers/ged/familles/FamillesDocumentSearchProvider';
import useFamillesDocumentCounterProvider   from '@app/dossier/providers/ged/familles/FamillesDocumentCounterProvider';
import { moduleRoute as DossierModule }     from '@app/dossier/resources/common/Router';
import { moduleRoute as PortailModule }     from '@app/portail/resources/common/Router';
import type FamilleDocumentModel            from '@app/dossier/models/ged/familles/FamilleDocumentModel';
import type { TGEDRouter }                  from '@app/dossier/pages/ged/GEDWrapperTabsComponent';
// @core
import { useUserContext }   from '@core/providers/contexts/UserContextProvider';
import { navigateState }    from '@core/utils/routing';
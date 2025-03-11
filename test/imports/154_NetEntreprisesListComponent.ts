// Misc
import {
    useEffect,
    useState,
    type FC
}               from 'react';
import {
    map,
    filter,
    isEmpty
}               from 'lodash';
// DS
import {
    YpTag,
    YpButton,
    YpElement,
    YpTypography,
    YpSkeletonList,
    YpConfirmModal
} from 'ds';
// @app/client
import NetEntreprisesFormComponent              from '@app/client/components/parametrage/portails-declaratifs/NetEntreprisesFormComponent';
import RegimeDSNEnum                            from '@app/client/models/enum/RegimeDSN';
import useNetEntreprisesClientDetail            from '@app/client/providers/parametrage/portails-declaratifs/NetEntreprisesClientDetailProvider';
import { moduleRoute as ClientModule }          from '@app/client/resources/common/Router';
import type NetEntreprisesModel                 from '@app/client/models/NetEntreprisesModel';
import type NetEntreprisesResponseModel         from '@app/client/models/NetEntreprisesResponseModel';
import type { TRouterStateParametrageClient }   from '@app/client/pages/ParametragePage';
// @app/dossier
import useNetEntreprisesDossierActions
    from '@app/dossier/providers/parametrage-dossier/administration/portails-declaratifs/NetEntreprisesDossierActionsProvider';
import type { TNetEntreprisesDossierFormActions }
    from '@app/dossier/providers/parametrage-dossier/administration/portails-declaratifs/NetEntreprisesDossierFormProvider';
import type { TParametrageProviderReturn } from '@app/dossier/providers/parametrage-dossier/ParametrageDossierProvider';
// @core
import { useUserContext }   from '@core/providers/contexts/UserContextProvider';
import { navigateState }    from '@core/utils/routing';
import type {
    TDataProviderReturn,
    TActionProviderReturn
}                           from '@core/models/ProviderModel';
// Misc
import {
    useEffect,
    useState,
    Fragment,
    type FC
}                           from 'react';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import cn                   from 'classnames';
import { isEmpty }          from 'lodash';
import { navigate }         from '@reach/router';

// DS
import {
    YpModal,
    YpAlert,
    YpButton,
    YpElement,
    YpDivider,
    useYpModal,
    YpThumbnail,
    useYpStepper,
    YpStepperNew,
    YpTypography,
    YpStepperItem,
    YpConfirmModal,
    useYpWrapperContext,
    type TYpStep
} from 'ds';
// @app/dossier
import WCDSocieteComponent                     from '@app/dossier/components/creation-dossier/WCDSocieteComponent';
import WCDEtablissementsComponent              from '@app/dossier/components/creation-dossier/WCDEtablissementsComponent';
import StatutDossierEnum                       from '@app/dossier/models/enums/StatutDossier';
import { StatutCreationDossierEnum }           from '@app/dossier/models/enums/StatutCreationDossierEnum';
import useDossierActions                       from '@app/dossier/providers/dossier/DossierActionsProvider';
import useWCDSocieteDetail                     from '@app/dossier/providers/creation-dossier/WCDSocieteProvider';
import { useDossierContext }                   from '@app/dossier/providers/contexts/DossierContextProvider';
import useWCDEtablissementsList                from '@app/dossier/providers/creation-dossier/WCDEtablissementsProvider';
import WCDImportDSNDetailProvider              from '@app/dossier/providers/creation-dossier/import/WCDImportDSNDetailProvider';
import WCDImportDSNLignesDetailProvider        from '@app/dossier/providers/creation-dossier/import/WCDImportDSNLignesDetailProvider';
import { moduleRoute as DossierModule }        from '@app/dossier/resources/common/Router';
import type DossierModel                       from '@app/dossier/models/DossierModel';
import type { TRouterStateParametrageDossier } from '@app/dossier/components/parametrage-dossier/ParametrageDossierTabsComponent';
// @app/client
import StructureComponent           from '@app/client/components/parametrage/structure/StructureComponent';
import useStructureList             from '@app/client/providers/parametrage/structure/StructureListProvider';
import { getParentsBlockTitles }    from '@app/client/components/parametrage/structure/helpers';
import type { TSelection }          from '@app/client/providers/parametrage/structure/utils';
// @core
import { useDataListContext } from '@core/providers/contexts/DataListContextProvider';
import { navigateState }      from '@core/utils/routing';
import type { WsDataModel }   from '@core/models/ProviderModel';
// Utils
import {
    conjugate,
    getTextPreview
} from 'yutils/text';
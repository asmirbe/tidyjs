// Misc
import { navigate } from '@reach/router';
import type { FC }  from 'react';
// DS
import {
    YpTab,
    YpElement
} from 'ds';
// @app/dossier
import { useDossierContext }                   from '@app/dossier/providers/contexts/DossierContextProvider';
import { moduleRoute as DossierModule }        from '@app/dossier/resources/common/Router';
import type { TRouterStateParametrageDossier } from '@app/dossier/components/parametrage-dossier/ParametrageDossierTabsComponent';
// @core
import { navigateState } from '@core/utils/routing';
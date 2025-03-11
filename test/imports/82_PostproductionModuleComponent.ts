// Misc
import cn                   from 'classnames';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import type { FC }          from 'react';
// DS
import {
    YpButton,
    YpDivider,
    YpElement,
    YpTypography
} from 'ds';
// @app/dossier
import { useDossierContext }               from '@app/dossier/providers/contexts/DossierContextProvider';
import { moduleRoute as DossierModule }    from '@app/dossier/resources/common/Router';
import type { TRouterStatePostproduction } from '@app/dossier/pages/postproduction/PostProductionWrapperTabsComponent';
// @core
import { navigateState } from '@core/utils/routing';
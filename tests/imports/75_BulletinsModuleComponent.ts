// Misc
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { navigate }        from '@reach/router';
import type { FC }         from 'react';
// DS
import {
    YpButton,
    YpDivider,
    YpElement,
    YpTypography
} from 'ds';
// @app/dossier
import { useDossierContext }            from '@app/dossier/providers/contexts/DossierContextProvider';
import { moduleRoute as DossierModule } from '@app/dossier/resources/common/Router';
// @library
import { EmptyComponent } from '@library/utils/list';
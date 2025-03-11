// Misc
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import { navigate }         from '@reach/router';
import type { FC }          from 'react';
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
import visuel_absences                  from '@app/dossier/resources/assets/images/visuel_absences.svg';
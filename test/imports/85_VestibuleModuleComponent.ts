// Misc
import cn                   from 'classnames';
import type { FC }          from 'react';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import { filter }           from 'lodash';
// DS
import {
    YpButton,
    YpDivider,
    YpElement,
    YpTypography
} from 'ds';
// @app/dossier
import VestibuleTypeFicheEnum           from '@app/dossier/models/enums/VestibuleTypeFicheEnum';
import { useDossierContext }            from '@app/dossier/providers/contexts/DossierContextProvider';
import useImportLignesList              from '@app/dossier/providers/vestibule/LignesImportListProvider';
import { moduleRoute as DossierModule } from '@app/dossier/resources/common/Router';
import type { TVestibuleTypeFicheCode } from '@app/dossier/models/enums/VestibuleTypeFicheEnum';
// @core
import { navigateState } from '@core/utils/routing';
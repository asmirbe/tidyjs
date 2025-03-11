// Misc
import {
    useRef,
    useState,
    forwardRef,
    useImperativeHandle
}                           from 'react';
import { navigate }         from '@reach/router';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
// DS
import {
    YpButton,
    YpDivider,
    YpElement,
    YpTypography,
} from 'ds';
// @app/dossier
import { useDossierContext }            from '@app/dossier/providers/contexts/DossierContextProvider';
import useSalariesGroupByIndList        from '@app/dossier/providers/salaries/SalariesGroupByIndListProvider';
import SalariesTableComponent           from '@app/dossier/components/salaries/SalariesTableComponent';
import useFichesHistorisationList       from '@app/dossier/providers/fiches/FichesHistorisationListProvider';
import { moduleRoute as DossierModule } from '@app/dossier/resources/common/Router';
// @core
import { useUserContext } from '@core/providers/contexts/UserContextProvider';
// Utils
import { conjugate } from 'yutils/text';
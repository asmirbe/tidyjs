// Misc
import { Fragment }         from 'react';
import {
    getMonth,
    getYear,
    parseISO
}                           from 'date-fns';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import { map }              from 'lodash';
import { navigate }         from '@reach/router';
import type { FC }          from 'react';
// DS
import {
    YpTag,
    YpElement,
    YpTypography
} from 'ds';
// @app/dossier
import { getTypesBulletin }             from '@app/dossier/components/bulletins/utils/bulletin';
import BulletinStatutEnum               from '@app/dossier/models/enums/bulletin/BulletinStatut';
import BulletinTypeEnum                 from '@app/dossier/models/enums/BulletinType';
import MoisEnum                         from '@app/dossier/models/enums/Mois';
import { useDossierContext }            from '@app/dossier/providers/contexts/DossierContextProvider';
import { moduleRoute as DossierModule } from '@app/dossier/resources/common/Router';
import { getValorisationByPropertyKey } from '@app/dossier/utils/fiche';
import type BulletinChronologiqueModel  from '@app/dossier/models/BulletinChronologiqueModel';
import type { TSalarieWithBulletin }    from '@app/dossier/pages/bulletins/BulletinsPage';
// @library
import {
    getDateFormat,
    getDifferenceInYear,
    convertToMonthsAndYears
} from '@library/utils/dates';
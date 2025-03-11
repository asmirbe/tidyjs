// Misc
import { Fragment }        from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    map,
    capitalize
}                          from 'lodash';
import cn                  from 'classnames';
import type { IconProp }   from '@fortawesome/fontawesome-svg-core';
import type { FC }         from 'react';
// DS
import {
    YpElement,
    YpTypography
} from 'ds';
// @app/dossier
import {
    formatNumber,
    getBulletinData,
    getJoursRestants
}                                       from '@app/dossier/components/bulletins/utils/bulletin';
import { getValorisationByPropertyKey } from '@app/dossier/utils/fiche';
import type BulletinModel               from '@app/dossier/models/bulletin/BulletinModel';
import type HistorisationModel          from '@app/dossier/models/fiches/HistorisationModel';
// Misc
import { Fragment }         from 'react';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import { filter }           from 'lodash';
import type { FC }          from 'react';
import type { IconProp }    from '@fortawesome/fontawesome-svg-core';
// DS
import {
    YpButton,
    YpDivider,
    YpElement
}                               from 'ds';
import type { TYpDividerProps } from 'ds';
// @app/dossier
import ValorisationListComponent        from '@app/dossier/components/historique/ValorisationsListComponent';
import useHistorisationList             from '@app/dossier/providers/historique/ValorisationsListProvider';
import type SocieteModel                from '@app/dossier/models/fiches/societe/SocieteModel';
import type ContratModel                from '@app/dossier/models/fiches/contrat/ContratModel';
import type IndividuModel               from '@app/dossier/models/fiches/individu/IndividuModel';
import type EtablissementModel          from '@app/dossier/models/fiches/etablissement/EtablissementModel';
import type DonneeContextuelleModel     from '@app/dossier/models/DonneeContextuelleModel';
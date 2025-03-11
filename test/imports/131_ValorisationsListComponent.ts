import {
    Fragment,
    useState
}                           from 'react';
import {
    map,
    filter,
    flatMap,
    orderBy,
}                           from 'lodash';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import type { FC }          from 'react';
// DS
import {
    YpHeader,
    YpElement,
    YpCollapse,
    YpTypography
}   from 'ds';
// @app/dossier
import ValorisationDetailComponent      from '@app/dossier/components/historique/ValorisationDetailComponent';
import type DonneeContextuelleModel     from '@app/dossier/models/DonneeContextuelleModel';
import type HistorisationModel          from '@app/dossier/models/fiches/HistorisationModel';
import type ContratModel                from '@app/dossier/models/fiches/contrat/ContratModel';
import type SocieteModel                from '@app/dossier/models/fiches/societe/SocieteModel';
import type IndividuModel               from '@app/dossier/models/fiches/individu/IndividuModel';
import type EtablissementModel          from '@app/dossier/models/fiches/etablissement/EtablissementModel';
// @core
import type { TOpenState }          from '@core/models/CoreModel';
import type { TDataProviderReturn } from '@core/models/ProviderModel';
// @library
import { renderLoader } from '@library/utils/list';
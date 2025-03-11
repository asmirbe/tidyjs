// Misc
import type { FC }  from 'react';
import {
    map,
    uniq,
    filter
}                   from 'lodash';
// DS
import { YpElement } from 'ds';
// @app/dossier
import HistoriqueDetailComponent            from '@app/dossier/components/historique/HistorisationDetailComponent';
import useIndividuContratsList              from '@app/dossier/providers/fiches/individus/contrats/IndividuContratsListProvider';
import { getDCByCodes }                     from '@app/dossier/utils/fiche';
import useFichesHistorisationList           from '@app/dossier/providers/fiches/FichesHistorisationListProvider';
import { useReferencialContext }            from '@app/dossier/providers/referencial/ReferencialContextProvider';
import type IndividuModel                   from '@app/dossier/models/fiches/individu/IndividuModel';
import type ContratModel                    from '@app/dossier/models/fiches/contrat/ContratModel';
// @core
import type { TDataProviderReturn } from '@core/models/ProviderModel';
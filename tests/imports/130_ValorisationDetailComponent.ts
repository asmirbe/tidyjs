// Misc
import { Fragment } from 'react';
import {
    format,
    parseISO
}                   from 'date-fns';
import { find }     from 'lodash';
import type { FC }  from 'react';
// DS
import { YpGrid }                from 'ds';
import type { TYpGridColumType } from 'ds';
// @app/dossier
import ValorisationEditionFormComponent     from '@app/dossier/components/dashboard/general/historique/ValorisationEditionFormComponent';
import ValorisationDeletionFormComponent    from '@app/dossier/components/dashboard/general/historique/ValorisationDeletionFormComponent';
import useHistorisationDetail               from '@app/dossier/providers/historique/HistorisationDetailProvider';
import { useReferencialContext }            from '@app/dossier/providers/referencial/ReferencialContextProvider';
import useTableReferenceDetailProvider      from '@app/dossier/providers/tablesReference/TableReferenceDetailProvider';
import {
    getDCByCodes,
    getFormattedValue,
    getListFieldRules
}                                           from '@app/dossier/utils/fiche';
import type DonneeContextuelleModel         from '@app/dossier/models/DonneeContextuelleModel';
import type ContratModel                    from '@app/dossier/models/fiches/contrat/ContratModel';
import type EtablissementModel              from '@app/dossier/models/fiches/etablissement/EtablissementModel';
import type IndividuModel                   from '@app/dossier/models/fiches/individu/IndividuModel';
import type HistorisationModel              from '@app/dossier/models/fiches/HistorisationModel';
import type SocieteModel                    from '@app/dossier/models/fiches/societe/SocieteModel';
import type { THistorisationValorisation }  from '@app/dossier/models/fiches/HistorisationModel';
// @core
import type { WsDataModel }                  from '@core/models/ProviderModel';
// @library
import { getDateFormat } from '@library/utils/dates';
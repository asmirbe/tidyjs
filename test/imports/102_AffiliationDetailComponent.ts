import type { FC } from 'react';
// DS
import { YpElement } from 'ds';
// @app/dossier
import AffiliationCotisationTableComponent from '@app/dossier/components/fiche-salarie/detail/affiliation/AffiliationCotisationTableComponent';
import useFichesHistorisationList          from '@app/dossier/providers/fiches/FichesHistorisationListProvider';
import type { TAffiliation }               from '@app/dossier/models/fiches/affiliation/AffiliationModel';
import type { TAdhesionTypesWithFamille }  from '@app/dossier/providers/fiches/affiliations/AffiliationsListProvider';
import type HistorisationModel             from '@app/dossier/models/fiches/HistorisationModel';
// Misc Libs
import cn                  from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    find,
    isEmpty,
}                          from 'lodash';
import type { FC }         from 'react';
// DS
import {
    YpTag,
    YpElement,
    YpTypography,
    YpSkeleton
} from 'ds';
// @app/dossier
import { useReferencialContext }          from '@app/dossier/providers/referencial/ReferencialContextProvider';
import useTablesReferenceSearchProvider   from '@app/dossier/providers/tablesReference/TablesReferenceSearchProvider';
import useFichesHistorisationList         from '@app/dossier/providers/fiches/FichesHistorisationListProvider';
import { getValorisationByPropertyKey }   from '@app/dossier/utils/fiche';
import TrancheCotisationEnum              from '@app/dossier/models/enums/TrancheCotisation';
import {
    getValeurDC,
    detailGroupement
}                                         from '@app/dossier/providers/fiches/affiliations/utils';
import type HistorisationModel            from '@app/dossier/models/fiches/HistorisationModel';
import type { TAdhesionTypesWithFamille } from '@app/dossier/providers/fiches/affiliations/AffiliationsListProvider';
import type { TAffiliationCotisation }    from '@app/dossier/models/fiches/affiliation/AffiliationModel';
// @library
import { getDateFormat } from '@library/utils/dates';
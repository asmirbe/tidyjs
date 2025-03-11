// Misc
import {
    useMemo,
    useState,
    useCallback,
    type FC
}                               from 'react';
import cn                       from 'classnames';
import { FontAwesomeIcon }      from '@fortawesome/react-fontawesome';
import {
    map,
    find,
    uniq,
    filter,
    orderBy,
    flatMap,
    findIndex,
    capitalize
}                               from 'lodash';
import { navigate }             from '@reach/router';
import { v4 as uuidv4 }         from 'uuid';
import { createColumnHelper }   from '@tanstack/react-table';
import type { IconProp }        from '@fortawesome/fontawesome-svg-core';
import type { ChangeEvent }     from 'react';
// DS
import {
    YpTag,
    YpTab,
    YpInput,
    YpSelect,
    YpDrawer,
    YpButton,
    YpElement,
    YpDivider,
    YpTooltip,
    useYpModal,
    YpDataTable,
    YpTypography,
    YpSkeletonList,
    YpConfirmModal
} from 'ds';
// @app/dossier
import AdhesionDetailComponent
    from '@app/dossier/components/parametrage-dossier/adhesions-cotisations/adhesions/AdhesionDetailComponent';
import CotisationFormComponent
    from '@app/dossier/components/parametrage-dossier/adhesions-cotisations/cotisations/CotisationFormComponent';
import CotisationDetailComponent
    from '@app/dossier/components/parametrage-dossier/adhesions-cotisations/cotisations/CotisationDetailComponent';
import AdhesionCotisationsWFComponent
    from '@app/dossier/components/parametrage-dossier/adhesions-cotisations/workflow/AdhesionCotisationsWFComponent';
import PopulationsTagsListComponent             from '@app/dossier/components/population/PopulationsTagsListComponent';
import TypeLienAdhesionEnum                     from '@app/dossier/models/enums/TypeLienAdhesionEnum';
import useBanquesList                           from '@app/dossier/providers/fiches/banques/BanquesListProvider';
import { useDossierContext }                    from '@app/dossier/providers/contexts/DossierContextProvider';
import { useFicheMultiDelete }                  from '@app/dossier/providers/fiches/FicheMultiDeleteProvider';
import useFamillesAdhesionList                  from '@app/dossier/providers/adhesions/famille/FamillesAdhesionListProvider';
import useTypesCotisationsList                  from '@app/dossier/providers/adhesions/cotisations/TypeCotisationsListProvider';
import useSquelettesFichesList                  from '@app/dossier/providers/squelettes-fiches/SquelettesFichesListProvider';
import { getValorisationValue }                 from '@app/dossier/providers/historique/HistorisationDetailProvider';
import { useReferencialContext }                from '@app/dossier/providers/referencial/ReferencialContextProvider';
import useFichesHistorisationList               from '@app/dossier/providers/fiches/FichesHistorisationListProvider';
import useTableReferenceDetailProvider          from '@app/dossier/providers/tablesReference/TableReferenceDetailProvider';
import { moduleRoute as DossierModule }         from '@app/dossier/resources/common/Router';
import { datas }                                from '@app/dossier/utils/fiche';
import type { TRouterStateParametrageDossier }  from '@app/dossier/components/parametrage-dossier/ParametrageDossierTabsComponent';
import type FicheFormModel                      from '@app/dossier/models/fiches/FicheFormModel';
import type PopulationModel                     from '@app/dossier/models/populations/PopulationModel';
import type HistorisationModel                  from '@app/dossier/models/fiches/HistorisationModel';
import type TypeCotisationModel                 from '@app/dossier/models/adhesions/cotisations/TypeCotisationModel';
import type FamilleAdhesionModel                from '@app/dossier/models/adhesions/famille/FamilleAdhesionModel';
// @core
import picto                from '@core/resources/assets/images/yeap/picto-yeap.png';
import grid_empty           from '@core/resources/assets/images/patterns/grid_empty.png';
import { navigateState }    from '@core/utils/routing';
// @library
import { getDateFormat }             from '@library/utils/dates';
import { getFormattedDecimalDigits } from '@library/utils/number';
import { useSearch }                 from '@library/utils/search';
import { useTable }                  from '@library/utils/table';
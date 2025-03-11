// Misc
import { Fragment }         from 'react';
import {
    find,
    uniq,
    filter,
    reduce
}                           from 'lodash';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import type { FC }          from 'react';
// DS
import {
    YpTag,
    YpButton,
    YpDivider,
    YpElement,
    YpSkeleton,
    useYpModal,
    YpTypography,
    useYpWrapperContext
}   from 'ds';
// @app/dossier
import SalarieContratAffiliationPanelComponent
    from '@app/dossier/components/fiche-salarie/detail/affiliation/SalarieContratAffiliationPanelComponent';
import useFichesHistorisationList       from '@app/dossier/providers/fiches/FichesHistorisationListProvider';
import useTableReferenceDetailProvider  from '@app/dossier/providers/tablesReference/TableReferenceDetailProvider';
import useTablesReferenceSearchProvider from '@app/dossier/providers/tablesReference/TablesReferenceSearchProvider';
import { useReferencialContext }        from '@app/dossier/providers/referencial/ReferencialContextProvider';
import type FicheFormModel              from '@app/dossier/models/fiches/FicheFormModel';
import type CotisationModel             from '@app/dossier/models/fiches/affiliation/CotisationModel';
import type HistorisationModel          from '@app/dossier/models/fiches/HistorisationModel';
import type TableReferenceModel         from '@app/dossier/models/TableReferenceModel';
import type FamilleAdhesionModel        from '@app/dossier/models/adhesions/famille/FamilleAdhesionModel';
// @core
import { useUserContext }           from '@core/providers/contexts/UserContextProvider';
import type { TDataProviderReturn } from '@core/models/ProviderModel';
// @library
import {
    getDateFormat,
    convertDateToMonthsAndYears
}                                   from '@library/utils/dates';
import {
    datas,
    getDCByCodes
}                                   from '@library/form-new/test/providers/fiches/utils/fiche';
import type ContratModel            from '@library/form-new/test/models/ContratModel';
import type { FicheOverloadModel }  from '@library/form-new/test/providers/fiches/FichesDossierListProvider';
// Misc
import {
    useState,
    useEffect
}                          from 'react';
import {
    sortBy,
    orderBy
}                          from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cn                  from 'classnames';
import type { IconName }   from '@fortawesome/fontawesome-svg-core';
import type { FC }         from 'react';
// DS
import {
    YpTag,
    YpLabel,
    YpAlert,
    YpDrawer,
    YpButton,
    YpSelect,
    YpElement,
    YpSkeleton,
    YpTypography
} from 'ds';
// @app/dossier
import AffiliationDetailComponent       from '@app/dossier/components/fiche-salarie/detail/affiliation/AffiliationDetailComponent';
import AffiliationMultiFormComponent    from '@app/dossier/components/fiche-salarie/detail/affiliation/AffiliationMultiFormComponent';
import useAffiliationsList              from '@app/dossier/providers/fiches/affiliations/AffiliationsListProvider';
import useTypesCotisationsList          from '@app/dossier/providers/adhesions/cotisations/TypeCotisationsListProvider';
import { CardinaliteAffiliationEnum }   from '@app/dossier/models/enums/CardinaliteAffiliationEnum';
import type CotisationModel             from '@app/dossier/models/fiches/affiliation/CotisationModel';
import type TypeCotisationModel         from '@app/dossier/models/adhesions/cotisations/TypeCotisationModel';
import type FamilleAdhesionModel        from '@app/dossier/models/adhesions/famille/FamilleAdhesionModel';
import type {
    TAdhesionTypesWithFamille,
    TAffiliationsAdditionals
}                                       from '@app/dossier/providers/fiches/affiliations/AffiliationsListProvider';
// @core
import { useUserContext }           from '@core/providers/contexts/UserContextProvider';
import type { TDataProviderReturn } from '@core/models/ProviderModel';
// @library
import type ContratModel from '@library/form-new/test/models/ContratModel';
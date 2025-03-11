// Misc
import {
    useState,
    type FC
}                          from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// DS
import {
    YpGrid,
    YpButton,
    YpDivider,
    YpElement,
    YpFormModal,
    YpTypography,
    YpSkeletonList,
    useYpModal,
    YpConfirmModal,
    type TYpGridColumType
} from 'ds';
// @app/dossier
import BanqueFormComponent                     from '@app/dossier/components/fiches/banque/BanqueFormComponent';
import { useDossierContext }                   from '@app/dossier/providers/contexts/DossierContextProvider';
import useBanquesList, { banqueFicheTypes }    from '@app/dossier/providers/fiches/banques/BanquesListProvider';
import useBanqueDetail                         from '@app/dossier/providers/fiches/banques/BanqueDetailProvider';
import { useFicheDelete }                      from '@app/dossier/providers/fiches/FicheDeleteProvider';
import { moduleRoute as DossierModule }        from '@app/dossier/resources/common/Router';
import { getValorisationByPropertyKey }        from '@app/dossier/utils/fiche';
import type { TRouterStateParametrageDossier } from '@app/dossier/components/parametrage-dossier/ParametrageDossierTabsComponent';
import type BanqueModel                        from '@app/dossier/models/fiches/banque/BanqueModel';
// @core
import { navigateState }    from '@core/utils/routing';
import { useUserContext }   from '@core/providers/contexts/UserContextProvider';
// @Library
import { EmptyComponent } from '@library/utils/list';
// Utils
import {
    conjugate,
    getTextPreview
} from 'yutils/text';
// Misc
import {
    Fragment,
    useState,
    type FC
}                           from 'react';
import cn                   from 'classnames';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import {
    map,
    max,
    find,
    filter,
    orderBy,
    capitalize
}                           from 'lodash';
import type { IconProp }    from '@fortawesome/fontawesome-svg-core';
// DS
import {
    YpTab,
    YpTag,
    YpTable,
    YpButton,
    YpElement,
    useYpModal,
    YpTypography
}                                       from 'ds';
import type { TTailwindColorPalette }   from 'ds';
// @app/dossier
import CotisationAdhesionsFormComponent
    from '@app/dossier/components/parametrage-dossier/adhesions-cotisations/cotisations/CotisationAdhesionsFormComponent';
import AdhesionFormComponent
    from '@app/dossier/components/parametrage-dossier/adhesions-cotisations/adhesions/AdhesionFormComponent';
import CotisationFormComponent
    from '@app/dossier/components/parametrage-dossier/adhesions-cotisations/cotisations/CotisationFormComponent';
import FichePopulationsFormComponent    from '@app/dossier/components/parametrage-dossier/adhesions-cotisations/FichePopulationsFormComponent';
import { DonneeTypeEnum }               from '@app/dossier/models/enums/DonneeContextuelle';
import FieldVisibiliteEnum              from '@app/dossier/models/enums/FieldVisibiliteEnum';
import { useDossierContext }            from '@app/dossier/providers/contexts/DossierContextProvider';
import { useReferencialContext }        from '@app/dossier/providers/referencial/ReferencialContextProvider';
import { getValorisationValue }         from '@app/dossier/providers/historique/HistorisationDetailProvider';
import {
    datas,
    getDCByCodeGroupement
}                                       from '@app/dossier/utils/fiche';
import type FicheFormModel              from '@app/dossier/models/fiches/FicheFormModel';
import type PopulationModel             from '@app/dossier/models/populations/PopulationModel';
import type HistorisationModel          from '@app/dossier/models/fiches/HistorisationModel';
import type TableReferenceModel         from '@app/dossier/models/TableReferenceModel';
import type TypeCotisationModel         from '@app/dossier/models/adhesions/cotisations/TypeCotisationModel';
import type SqueletteFicheModel         from '@app/dossier/models/SqueletteFicheModel';
import type FamilleAdhesionModel        from '@app/dossier/models/adhesions/famille/FamilleAdhesionModel';
import type { TDataProviderReturn }     from '@core/models/ProviderModel';
import type DonneeContextuelleModel     from '@app/dossier/models/DonneeContextuelleModel';
import type { TElementTableReference }  from '@app/dossier/models/TableReferenceModel';
// @core
import picto from '@core/resources/assets/images/yeap/picto-yeap.png';
// @library
import { getDateFormat }                from '@library/utils/dates';
import { getFormattedDecimalDigits }    from '@library/utils/number';
// yutils
import { conjugate } from 'yutils/text';
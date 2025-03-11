// Misc
import {
    useState,
    useEffect
}                   from 'react';
import {
    map,
    find,
    uniq,
    filter,
    reject,
    uniqBy,
    capitalize
}                   from 'lodash';
import type { FC }  from 'react';
// DS
import {
    YpAlert,
    YpElement,
    YpFormModal,
    YpTypography,
    YpMultiSelect
} from 'ds';
// @app/dossier
import { useDossierContext }        from '@app/dossier/providers/contexts/DossierContextProvider';
import { useAdhesionActions }       from '@app/dossier/providers/fiches/adhesion/AdhesionActionsProvider';
import { getValorisationValue }     from '@app/dossier/providers/historique/HistorisationDetailProvider';
import { useReferencialContext }    from '@app/dossier/providers/referencial/ReferencialContextProvider';
import type HistorisationModel      from '@app/dossier/models/fiches/HistorisationModel';
import type TableReferenceModel     from '@app/dossier/models/TableReferenceModel';
import type SqueletteFicheModel     from '@app/dossier/models/SqueletteFicheModel';
import type TypeCotisationModel     from '@app/dossier/models/adhesions/cotisations/TypeCotisationModel';
import type FamilleAdhesionModel    from '@app/dossier/models/adhesions/famille/FamilleAdhesionModel';
// @core
import type { TDataProviderReturn } from '@core/models/ProviderModel';
// yutils
import { getTextPreview } from 'yutils/text';
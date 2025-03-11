// Misc
import {
    useState,
    useEffect
}                   from 'react';
import {
    map,
    find
}                   from 'lodash';
import type { FC }  from 'react';
// DS
import {
    YpAlert,
    YpLabel,
    YpElement,
    YpFormModal,
    YpTypography,
    YpMultiSelect
} from 'ds';
// @app/dossier
import { useFicheActions }          from '@app/dossier/providers/fiches/FicheActionsProvider';
import { useDossierContext }        from '@app/dossier/providers/contexts/DossierContextProvider';
import { getValorisationValue }     from '@app/dossier/providers/historique/HistorisationDetailProvider';
import { useReferencialContext }    from '@app/dossier/providers/referencial/ReferencialContextProvider';
import type HistorisationModel      from '@app/dossier/models/fiches/HistorisationModel';
import type SqueletteFicheModel     from '@app/dossier/models/SqueletteFicheModel';

// yutils
import { getTextPreview } from 'yutils/text';
// @core
import type { TDataProviderReturn } from '@core/models/ProviderModel';
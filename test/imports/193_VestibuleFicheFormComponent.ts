// Misc
import {
    useEffect,
    type FC
}               from 'react';
import {
    map,
    find,
    filter,
    isEmpty
}               from 'lodash';
// DS
import type { TYpSelectOption } from 'ds';
import {
    YpElement,
    YpFormModal
} from 'ds';
// @app/dossier
import FicheModalFormComponent          from '@app/dossier/components/fiches/FicheModalFormComponent';
import useFicheForm                     from '@app/dossier/providers/fiches/FicheFormProvider';
import { useReferencialContext }        from '@app/dossier/providers/referencial/ReferencialContextProvider';
import useLigneImportDetailProvider     from '@app/dossier/providers/vestibule/LigneImportDetailProvider';
import { datas }                        from '@app/dossier/utils/fiche';
import type LigneImportModel            from '@app/dossier/models/LigneImportModel';
import type HistorisationModel          from '@app/dossier/models/fiches/HistorisationModel';
import type SqueletteFicheModel         from '@app/dossier/models/SqueletteFicheModel';
import type { TVestibuleTypeFiche }     from '@app/dossier/models/enums/VestibuleTypeFicheEnum';
import type VestibuleFicheFormModel     from '@app/dossier/models/vestibule/VestibuleFicheFormModel';
// @core
import type {
    WsDataModel,
    TDataProviderReturn
} from '@core/models/ProviderModel';
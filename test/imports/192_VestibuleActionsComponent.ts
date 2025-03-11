// Misc
import type { FC }  from 'react';
import {
    map,
    filter
}                   from 'lodash';
// DS
import { YpConfirmModal } from 'ds';
// @app/dossier
import EtatImportVestibuleEnum              from '@app/dossier/models/enums/EtatImportVestibule';
import type {
    TVestibuleRowData,
    TVestibuleActionType
}                                           from '@app/dossier/components/vestibule/VestibuleGridComponent';
import type LigneImportModel                from '@app/dossier/models/LigneImportModel';
import type { TVestibuleTypeFiche }         from '@app/dossier/models/enums/VestibuleTypeFicheEnum';
import type { TLignesImportListActions }    from '@app/dossier/providers/vestibule/LignesImportListProvider';

// @core
import type {
    WsDataModel,
    TActionProviderReturn
} from '@core/models/ProviderModel';
// Utils
import { conjugate } from 'yutils/text';
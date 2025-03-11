// Misc libs
import {
    useState,
    useEffect
}                       from 'react';
import { filter }       from 'lodash';
import type {
    FC,
    Dispatch,
    SetStateAction
}                       from 'react';
// DS
import {
    YpGrid,
    YpElement,
    YpDivider
}                       from 'ds';
import type {
    TYpGridColorType,
    TYpGridColumType
}                       from 'ds';
// @app/dossier
import EtatImportAdhesionModel          from '@app/dossier/models/AdhesionFpocEtatImportModel';
import ImportAdhesionStatutEnum         from '@app/dossier/models/enums/ImportAdhesionStatut';
import ImportAdhesionStatutGlobalEnum   from '@app/dossier/models/enums/ImportAdhesionsStatutGlobal';
import type {
    TAdhesionFpocEtatImportErreurs,
    TAdhesionFpocEtatImportDetails
}                                       from '@app/dossier/models/AdhesionFpocEtatImportModel';
import type ImportAdhesionModel         from '@app/dossier/models/ImportAdhesionModel';
import type { TImportFpocFormActions }  from '@app/dossier/providers/adhesions/import/ImportFpocFormProvider';
// @core
import type {
    TActionProviderReturn,
    TDataProviderReturn,
    WsDataModel
} from '@core/models/ProviderModel';
// Utils
import { conjugate } from 'yutils/text';
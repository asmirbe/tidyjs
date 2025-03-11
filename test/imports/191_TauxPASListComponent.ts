// Misc libs
import {
    Fragment,
    useState,
    useEffect
}                       from 'react';
import type { FC }      from 'react';
// DS
import {
    YpGrid,
    YpAlert,
    YpButton,
    YpElement,
    YpCollapse,
    useYpModal,
    YpConfirmModal
}                                from 'ds';
import type { TYpGridColumType } from 'ds';
// @app/dossier
import TauxPASFileDetailComponent        from '@app/dossier/components/tauxPAS/TauxPASFileDetailComponent';
import StatutImportTauxPASEnum           from '@app/dossier/models/enums/StatutImportTauxPAS';
import { useDossierContext }             from '@app/dossier/providers/contexts/DossierContextProvider';
import type TauxPASModel                 from '@app/dossier/models/TauxPASModel';
import type { TStatutImportTauxPASCode } from '@app/dossier/models/enums/StatutImportTauxPAS';
import type TauxPASFormModel             from '@app/dossier/models/TauxPASFormModel';
import type RessourceModel               from '@app/dossier/models/RessourceModel';
import type { TTauxPASFormActions }      from '@app/dossier/providers/tauxPAS/TauxPASFormProvider';
// @core
import type { TOpenState }   from '@core/models/CoreModel';
import type {
    TActionProviderReturn,
    TDataProviderReturn,
    WsDataModel
}                           from '@core/models/ProviderModel';
import type { TCallReturn } from '@core/providers/NetworkProvider';
// @library
import { getDateFormat }    from '@library/utils/dates';
import { useListRendering } from '@library/utils/list';
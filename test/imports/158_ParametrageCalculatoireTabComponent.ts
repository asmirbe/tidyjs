// Misc
import type { FC } from 'react';
// DS
import {
    YpDivider,
    YpElement
} from 'ds';
// @app/dossier
import ParametrageCalculatoireFormComponent
    from '@app/dossier/components/parametrage-dossier/parametrage-calculatoire/ParametrageCalculatoireFormComponent';
import { getDCByCodes }                         from '@app/dossier/utils/fiche';
import type FicheModel                          from '@app/dossier/models/fiches/FicheModel';
import type ParametrageCalculatoireFormModel    from '@app/dossier/models/fiches/parametrage-calculatoire/ParametrageCalculatoireFormModel';
import type {
    TFicheFormActions,
    TFicheFormAdditionals
}                                               from '@app/dossier/providers/fiches/FicheFormProvider';
import type { TParametrageProviderReturn }      from '@app/dossier/providers/parametrage-dossier/ParametrageDossierProvider';
// @core
import type {
    TDataProviderReturn,
    TActionProviderReturn
} from '@core/models/ProviderModel';
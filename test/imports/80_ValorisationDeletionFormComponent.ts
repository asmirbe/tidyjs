// Misc
import type { FC }  from 'react';
import { isEmpty }  from 'lodash';
// DS
import {
    YpModal,
    YpInput,
    YpLabel,
    YpButton,
    YpElement,
    YpTypography,
    YpNativeSelect,
}   from 'ds';
import type { TYpInputType } from 'ds';
// @app/dossier
import SubHeaderComponent                   from '@app/dossier/components/base/SubHeaderComponent';
import {
    getFormattedValue,
    getTypeValue
}                                           from '@app/dossier/utils/fiche';
import type HistorisationModel              from '@app/dossier/models/fiches/HistorisationModel';
import type ValorisationFormModel           from '@app/dossier/models/fiches/ValorisationFormModel';
import type { THistorisationValorisation }  from '@app/dossier/models/fiches/HistorisationModel';
import type { THistorisationFormActions }   from '@app/dossier/providers/historique/HistorisationDetailProvider';
import type{ TElementTableReference }       from '@app/dossier/models/TableReferenceModel';
// @core
import type { WsDataModel }           from '@core/models/ProviderModel';
import type { TActionProviderReturn } from '@core/models/ProviderModel';
// @library
import { getDateFormat } from '@library/utils/dates';
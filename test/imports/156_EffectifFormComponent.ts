// Misc
import {
    useState,
    useEffect
}                       from 'react';
import {
    sum,
    map,
    find,
    filter,
    reduce,
    flatMap
}                       from 'lodash';
import type {
    RowNode,
    GridApi,
    ColumnApi,
    GridReadyEvent,
    NewValueParams
}                       from 'ag-grid-community';
import type { FC }      from 'react';
// DS
import {
    YpDivider,
    YpElement,
    YpDatagrid,
    YpDatagridColumn
} from 'ds';
// @app/dossier
import { getDCByCodes }                     from '@app/dossier/utils/fiche';
import type EffectifModel                   from '@app/dossier/models/EffectifModel';
import type EffectifFormModel               from '@app/dossier/models/EffectifFormModel';
import type EtablissementModel              from '@app/dossier/models/fiches/etablissement/EtablissementModel';
import type { TEffectifFormActions }        from '@app/dossier/providers/parametrage-dossier/effectifs/EffectifFormProvider';
import type { TParametrageProviderReturn }  from '@app/dossier/providers/parametrage-dossier/ParametrageDossierProvider';
// @core
import type {
    TActionProviderReturn,
    TDataProviderReturn
} from '@core/models/ProviderModel';
// @library
import FormContextProvider from '@library/form/providers/FormProvider';
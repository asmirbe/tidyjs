// Misc
import {
    useState,
    useEffect
}                   from 'react';
import {
    map,
    first,
    reject,
    includes,
    isEmpty,
}                   from 'lodash';
import type { FC }  from 'react';
// DS
import {
    YpTab,
    YpButton,
    YpElement,
    YpFormModal
} from 'ds';
// @app/dossier
import OCStepperComponent                   from '@app/dossier/components/adhesions/oc/OCStepperComponent';
import UrssafFormComponent                  from '@app/dossier/components/adhesions/urssaf/UrssafFormComponent';
import RetraiteFormComponent                from '@app/dossier/components/adhesions/retraite/RetraiteFormComponent';
import ImportFpocFormComponent              from '@app/dossier/components/adhesions/import/ImportFpocFormComponent';
import ImportAdhesionStatutEnum             from '@app/dossier/models/enums/ImportAdhesionStatut';
import ImportAdhesionStatutGlobalEnum       from '@app/dossier/models/enums/ImportAdhesionsStatutGlobal';
import useImportFpocDetail                  from '@app/dossier/providers/adhesions/import/ImportFpocDetailProvider';
import useAdhesionUrssafDetail              from '@app/dossier/providers/adhesions/urssaf/AdhesionUrssafDetailProvider';
import useAdhesionRetraiteDetail            from '@app/dossier/providers/adhesions/retraite/AdhesionsRetraiteDetailProvider';
import type TableReferenceModel             from '@app/dossier/models/TableReferenceModel';
import type AdhesionsListModel              from '@app/dossier/models/AdhesionsListModel';
import type AdhesionCommonModel             from '@app/dossier/models/AdhesionCommonModel';
import type { THistorisationSearchModel }   from '@app/dossier/models/fiches/HistorisationModel';
// @core
import { WsDataModel }              from '@core/models/ProviderModel';
import type { TDataProviderReturn } from '@core/models/ProviderModel';
// @library
import type { TCallReturn }     from '@library/form-new/models/ProviderModel';
import type EtablissementModel  from '@library/form-new/test/models/EtablissementModel';
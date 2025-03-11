// Misc
import {
    Fragment,
    useState,
    useEffect
}                       from 'react';
import {
    map,
    find,
    slice,
    filter,
    flatMap,
    findIndex
}                       from 'lodash';
import cn               from 'classnames';
import type { FC }      from 'react';
// DS
import {
    YpGrid,
    YpAlert,
    YpElement,
    useYpModal,
    YpConfirmModal,
    YpButton
}                       from 'ds';
import type {
    TYpGridRowType,
    TYpGridColumType
}                       from 'ds';
// @app/dossier
import AdhesionCreationComponent        from '@app/dossier/components/adhesions/AdhesionCreationComponent';
import DgfipTabsComponent               from '@app/dossier/components/adhesions/dgfip/DgfipTabsComponent';
import OCCollapseComponent              from '@app/dossier/components/adhesions/oc/OCCollapseComponent';
import ContratsDgfipListComponent       from '@app/dossier/components/adhesions/dgfip/contrats/ContratsDgfipListComponent';
import BanqueUrssafDetailComponent      from '@app/dossier/components/adhesions/urssaf/banque/BanqueUrssafDetailComponent';
import BanqueRetraiteDetailComponent    from '@app/dossier/components/adhesions/retraite/banque/BanqueRetraiteDetailComponent';
import AdhesionTypeEnum                 from '@app/dossier/models/enums/AdhesionType';
import StatutAdhesionEnum               from '@app/dossier/models/enums/StatutAdhesion';
import StatutAdhesionFpocEnum           from '@app/dossier/models/enums/StatutAdhesionFpoc';
import useBanquesList                   from '@app/dossier/providers/fiches/banques/BanquesListProvider';
import type { TAdhesionsTabs }          from '@app/dossier/components/adhesions/AdhesionsTabsComponent';
import type RessourceModel              from '@app/dossier/models/RessourceModel';
import type AdhesionDgfipModel          from '@app/dossier/models/AdhesionDgfipModel';
import type AdhesionsListModel          from '@app/dossier/models/AdhesionsListModel';
import type TableReferenceModel         from '@app/dossier/models/TableReferenceModel';
import type AdhesionCommonModel         from '@app/dossier/models/AdhesionCommonModel';
import type AdhesionDetailModel         from '@app/dossier/models/AdhesionDetailModel';
import type ImportAdhesionModel         from '@app/dossier/models/ImportAdhesionModel';
import type { TAdhesionTypeCode }       from '@app/dossier/models/enums/AdhesionType';
import type { TElementTableReference }  from '@app/dossier/models/TableReferenceModel';
import type OCDetailModel               from '@app/dossier/models/adhesions/cotisations/get/OCDetailModel';
import type { TAdhesionsListActions }   from '@app/dossier/providers/adhesions/AdhesionsListProvider';
// @core
import { WsDataModel }          from '@core/models/ProviderModel';
import type { TWsException }    from '@core/models/CoreModel';
import type {
    TActionProviderReturn,
    TDataProviderReturn
}                               from '@core/models/ProviderModel';
// @library
import { getValorisationByPropertyKey }         from '@library/form-new/test/providers/fiches/utils/fiche';
import { getDateFormat }                        from '@library/utils/dates';
import { useListRendering }                     from '@library/utils/list';
import { getColorFromString }                   from '@library/utils/styles';
import type { TCallReturn }                     from '@library/form-new/models/ProviderModel';
import type EtablissementModel                  from '@library/form-new/test/models/EtablissementModel';
import type { THistorisationsListSearchModel }  from '@library/form-new/test/models/HistorisationModel';
// Utils
import {
    conjugate,
    getTextPreview
} from 'yutils/text';
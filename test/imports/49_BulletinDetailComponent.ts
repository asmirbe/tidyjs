// Misc
import {
    Fragment,
    useState,
    useEffect
}                           from 'react';
import cn                   from 'classnames';
import { format }           from 'date-fns';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import {
    map,
    find,
    delay,
    reject,
    isEmpty
}                           from 'lodash';
import { navigate }         from '@reach/router';
import type {
    IconName,
    IconPrefix
}                           from '@fortawesome/fontawesome-svg-core';
import type { FC }          from 'react';
// DS
import {
    YpTag,
    YpAlert,
    YpModal,
    YpButton,
    YpElement,
    useYpModal,
    YpSkeleton,
    YpTypography,
    YpProgressBar,
    useYpWrapperContext,
    useToastContext
} from 'ds';
// @app/client
import { useClientNotification } from '@app/notification/ClientNotificationProvider';
// @app/dossier
import { getBulletinData }                  from '@app/dossier/components/bulletins/utils/bulletin';
import BulletinContratDetailComponent       from '@app/dossier/components/bulletins/contrat/BulletinContratDetailComponent';
import BulletinDataListComponent            from '@app/dossier/components/bulletins/data/BulletinDataListComponent';
import BulletinGridDetailComponent          from '@app/dossier/components/bulletins/grid/BulletinGridDetailComponent';
import BulletinStatutEnum                   from '@app/dossier/models/enums/bulletin/BulletinStatut';
import BulletinTypeEnum                     from '@app/dossier/models/enums/BulletinType';
import useBulletinDetail                    from '@app/dossier/providers/bulletins/BulletinDetailProvider';
import { useDossierContext }                from '@app/dossier/providers/contexts/DossierContextProvider';
import useGEDListProvider                   from '@app/dossier/providers/ged/GEDListProvider';
import useGEDSearchProvider                 from '@app/dossier/providers/ged/GEDSearchProvider';
import useFicheHistorisationDetail          from '@app/dossier/providers/fiches/FicheHistorisationDetailProvider';
import { getValorisationValue }             from '@app/dossier/providers/historique/HistorisationDetailProvider';
import { moduleRoute as DossierModule }     from '@app/dossier/resources/common/Router';
import type BulletinChronologiqueModel      from '@app/dossier/models/BulletinChronologiqueModel';
import type BulletinPeriodeModel            from '@app/dossier/models/BulletinPeriodeModel';
import type { TBulletinsListByIndCntModel } from '@app/dossier/pages/bulletins/BulletinsPage';
import {
    type TSelectedBulletin,
    type TSalarieWithBulletin
}                                           from '@app/dossier/pages/bulletins/BulletinsPage';
import type {
    TBulletinGeneration,
    TGenerationsListActions
}                                           from '@app/dossier/providers/generations/GenerationsListProvider';
// @core
import type { TWsException }    from '@core/models/CoreModel';
import type {
    TDataProviderReturn,
    TActionProviderReturn
}                               from '@core/models/ProviderModel';
// @library
import { getDateFormat }        from '@library/utils/dates';
import { EmptyComponent }       from '@library/utils/list';
import { formatLeadingZeros }   from '@library/utils/number';
// Utils
import { conjugate } from 'yutils/text';
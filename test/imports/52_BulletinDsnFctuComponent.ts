// Misc
import {
    useState,
    Fragment,
    useEffect
}                           from 'react';
import cn                   from 'classnames';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import { isEmpty }          from 'lodash';
import type { FC }          from 'react';
import type { IconName }    from '@fortawesome/fontawesome-svg-core';
// DS
import {
    YpAlert,
    YpModal,
    YpButton,
    YpElement,
    useYpModal,
    YpTypography,
    YpTable,
    YpTag
}                       from 'ds';
import type { TColors } from 'ds';
// @app/dossier
import BulletinDsnFctuTabsComponent  from '@app/dossier/components/bulletins/dsnFctu/BulletinDsnFctuTabsComponent';
import DsnFctuType                   from '@app/dossier/models/enums/DsnFctuType';
import DsnFctuStatut                 from '@app/dossier/models/enums/DsnFctuStatus';
import { DsnFctuTabEnum }            from '@app/dossier/models/enums/DsnFctuTabEnum';
import { useDossierContext }         from '@app/dossier/providers/contexts/DossierContextProvider';
import useDsnFctuDetail              from '@app/dossier/providers/dsn/DsnFctuDetailProvider';
import { getValorisationValue }      from '@app/dossier/providers/historique/HistorisationDetailProvider';
import type DsnFctuEtatModel         from '@app/dossier/models/dsn/DsnFctuEtatModel';
import type { TSalarieWithBulletin } from '@app/dossier/pages/bulletins/BulletinsPage';
// @app/notification
import { useClientNotification }    from '@app/notification/ClientNotificationProvider';
// @core
import type {
    TDataProviderReturn,
    WsDataModel
}   from '@core/models/ProviderModel';
// @library
import { getDateFormat }    from '@library/utils/dates';
import { renderLoader }     from '@library/utils/list';
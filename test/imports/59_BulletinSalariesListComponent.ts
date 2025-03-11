// Misc
import {
    Fragment,
    useState,
    useEffect
}                          from 'react';
import cn                  from 'classnames';
import { format }          from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    map,
    find,
    keys,
    filter,
    reject,
    sortBy,
    isEmpty,
    flatMap,
    orderBy,
    groupBy,
    compact,
    findIndex
}                          from 'lodash';
import type {
    FC,
    Dispatch,
    ChangeEvent,
    SetStateAction
}                          from 'react';
// DS
import {
    YpTag,
    YpIcon,
    YpMenu,
    YpInput,
    YpLabel,
    YpModal,
    YpButton,
    YpPopover,
    YpTooltip,
    YpDivider,
    YpElement,
    useYpModal,
    YpSkeleton,
    YpTypography,
    YpCollapsible,
    YpSkeletonList,
    useToastContext,
    useYpWrapperContext
}                               from 'ds';
import type { TYpSelectOption } from 'ds';
// @app/dossier
import FilterByComponent                      from '@app/dossier/components/base/FilterByComponent';
import { isEqualBulletin }                    from '@app/dossier/components/bulletins/utils/bulletin';
import BulletinCollapseEtablissementComponent from '@app/dossier/components/bulletins/salaries/BulletinCollapseEtablissementComponent';
import BulletinSalarieDetailComponent         from '@app/dossier/components/bulletins/salaries/BulletinSalarieDetailComponent';
import SortByComponent                        from '@app/dossier/components/base/SortByComponent';
import BulletinTypeEnum                       from '@app/dossier/models/enums/BulletinType';
import BulletinStatutEnum                     from '@app/dossier/models/enums/bulletin/BulletinStatut';
import BulletinPdfStatutEnum                  from '@app/dossier/models/enums/bulletin/BulletinPdfStatut';
import { getValorisationByPropertyKey }       from '@app/dossier/utils/fiche';
import { useDossierContext }                  from '@app/dossier/providers/contexts/DossierContextProvider';
import useGEDListProvider                     from '@app/dossier/providers/ged/GEDListProvider';
import useGEDSearchProvider                   from '@app/dossier/providers/ged/GEDSearchProvider';
import useFichesHistorisationList             from '@app/dossier/providers/fiches/FichesHistorisationListProvider';
import type { TFilterBy }                     from '@app/dossier/components/base/FilterByComponent';
import type { TSortBy }                       from '@app/dossier/components/base/SortByComponent';
import type {
    TBulletinsListByIndCntModel,
    TSalarieWithBulletin,
    TSelectedBulletin
}                                       from '@app/dossier/pages/bulletins/BulletinsPage';
import type BulletinChronologiqueModel  from '@app/dossier/models/BulletinChronologiqueModel';
import type HistorisationModel          from '@app/dossier/models/fiches/HistorisationModel';
import type BulletinPeriodeModel        from '@app/dossier/models/BulletinPeriodeModel';
import type { TBulletinsActions }       from '@app/dossier/providers/bulletins/BulletinChronoSearchProvider';
import type {
    TBulletinGeneration,
    TGenerationsListActions
}                                       from '@app/dossier/providers/generations/GenerationsListProvider';
// @app/notification
import { useClientNotification } from '@app/notification/ClientNotificationProvider';
// @core
import type { TWsException } from '@core/models/CoreModel';
import type {
    TActionProviderReturn,
    TDataProviderReturn
}                            from '@core/models/ProviderModel';
// @library
import { useSearch } from '@library/utils/search';
// @yutils
import { conjugate } from 'yutils/text';
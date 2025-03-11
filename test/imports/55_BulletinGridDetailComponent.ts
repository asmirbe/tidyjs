// Misc
import {
    useState,
    useEffect,
    useCallback
}                          from 'react';
import {
    map,
    find,
    filter,
    orderBy,
    includes
}                          from 'lodash';
import cn                  from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type {
    ColumnApi,
    GridApi,
    GridReadyEvent,
    ColumnVisibleEvent
}                          from 'ag-grid-community';
import type { FC }         from 'react';
// DS
import {
    YpButton,
    YpElement,
    YpDatagrid,
    YpTypography,
    useToastContext,
    YpDatagridColumn,
    YpContentSwitcher,
    YpDatagridCellLabelRenderer
}                                     from 'ds';
import type { TYpDatagridTextWeight } from 'ds';
// @app/dossier
import BulletinDsnFctuComponent                      from '@app/dossier/components/bulletins/dsnFctu/BulletinDsnFctuComponent';
import BulletinBandeauErreurs                        from '@app/dossier/components/bulletins/erreurs/BulletinBandeauErreurs';
import IngredientTypeEnum                            from '@app/dossier/models/enums/IngredientType';
import BulletinTypeEnum                              from '@app/dossier/models/enums/BulletinType';
import useDsnFctuEtatDetail                          from '@app/dossier/providers/dsn/DsnFctuEtatDetailProvider';
import { useDossierContext }                         from '@app/dossier/providers/contexts/DossierContextProvider';
import IngredientRubriqueColonne                     from '@app/dossier/models/enums/IngredientRubriqueColonne';
import { BulletinTypeRetourValeurEnum }              from '@app/dossier/models/enums/bulletin/BulletinTypeRetourValeurEnum';
import { IngredientTypeSourceEnum }                  from '@app/dossier/models/enums/bulletin/IngredientTypeSourceEnum';
import type BulletinChronologiqueModel               from '@app/dossier/models/BulletinChronologiqueModel';
import type BulletinModel                            from '@app/dossier/models/bulletin/BulletinModel';
import type BulletinPeriodeModel                     from '@app/dossier/models/BulletinPeriodeModel';
import type { TIngredientTypeCode }                  from '@app/dossier/models/enums/IngredientType';
import type { TIngredientRubriqueColonneCode }       from '@app/dossier/models/enums/IngredientRubriqueColonne';
import type {
    TBulletinCalqueLigne,
    TBulletinCalqueComposante,
    TBulletinCalqueComposanteErreurs
}                                                    from '@app/dossier/models/bulletin/BulletinModel';
import type {
    TSalarieWithBulletin,
    TBulletinsListByIndCntModel
}                                                    from '@app/dossier/pages/bulletins/BulletinsPage';
import type {
    TBulletinGeneration,
    TGenerationsListActions
}                                                    from '@app/dossier/providers/generations/GenerationsListProvider';
// @app/notification
import { useClientNotification } from '@app/notification/ClientNotificationProvider';
// @core
import { useUserContext }   from '@core/providers/contexts/UserContextProvider';
import type {
    TActionProviderReturn,
    TDataProviderReturn
}                           from '@core/models/ProviderModel';
// @library
import { EmptyComponent }           from '@library/utils/list';
import { getComposedDataForExport } from '@library/utils/grid';
import { getDateFormat }            from '@library/utils/dates';
// Utils
import { capitalizeFirstLetter } from 'yutils/text';
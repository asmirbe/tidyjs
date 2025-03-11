// Misc
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import { navigate }         from '@reach/router';
import type { FC }          from 'react';
// DS
import {
    YpButton,
    YpDivider,
    YpElement,
    YpGrid,
    YpIcon,
    YpSkeleton,
    YpTypography,
}                                from 'ds';
import type { TYpGridColumType } from 'ds';
// @app/dossier
import MoisEnum                         from '@app/dossier/models/enums/Mois';
import { useDossierContext }            from '@app/dossier/providers/contexts/DossierContextProvider';
import { moduleRoute as DossierModule } from '@app/dossier/resources/common/Router';
import type PeriodesEvpListModel        from '@app/dossier/models/PeriodesEvpListModel';
// @core
import type { TDataProviderReturn } from '@core/models/ProviderModel';
// @library
import { getDateFormat }  from '@library/utils/dates';
import { EmptyComponent } from '@library/utils/list';
// Misc
import { useMemo }         from 'react';
import cn                  from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    format,
    isAfter
}                          from 'date-fns';
import { navigate }        from '@reach/router';
import type { IconName }   from '@fortawesome/fontawesome-svg-core';
import type { FC }         from 'react';
// DS
import {
    YpMenu,
    YpDivider,
    YpElement,
    YpSkeleton,
    useYpModal,
    YpThumbnail,
    YpTypography,
    YpConfirmModal,
    useToastContext,
    useYpWrapperContext
} from 'ds';
// @app/dossier
import IndividuFormComponent               from '@app/dossier/components/fiches/individu/IndividuFormComponent';
import { getDCByCodes }                    from '@app/dossier/utils/fiche';
import useIndividuTauxPASList              from '@app/dossier/providers/tauxPAS/IndividuTauxPASListProvider';
import { useDossierContext }               from '@app/dossier/providers/contexts/DossierContextProvider';
import { moduleRoute as DossierModule }    from '@app/dossier/resources/common/Router';
import type IndividuModel                  from '@app/dossier/models/fiches/individu/IndividuModel';
import type FicheFormModel                 from '@app/dossier/models/fiches/FicheFormModel';
import type {
    TFicheFormActions,
    TFicheFormAdditionals
}                                          from '@app/dossier/providers/fiches/FicheFormProvider';
// @core
import { useUserContext }   from '@core/providers/contexts/UserContextProvider';
import type { TCallReturn } from '@core/providers/NetworkProvider';
import type {
    TActionProviderReturn,
    TDataProviderReturn
}                           from '@core/models/ProviderModel';
import type { TErrorModel } from '@core/models/ErrorModel';
// @library
import {
    getDateFormat,
    isDateInRange,
    parseStringToDate
} from '@library/utils/dates';
// Utils
import {
    formattedNir,
    getTextPreview
} from 'yutils/text';
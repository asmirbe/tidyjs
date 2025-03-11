// Misc
import {
    Fragment,
    useState
}                               from 'react';
import type { FC }              from 'react';
import cn                       from 'classnames';
import { FontAwesomeIcon }      from '@fortawesome/react-fontawesome';
// DS
import type {
    TTailwindColor
}                                    from 'ds';
import {
    YpElement,
    YpTypography,
    YpTab,
    YpTable,
    YpTooltip,
    YpDivider
}                                     from 'ds';
// @app/dossier
import { useReferencialContext }      from '@app/dossier/providers/referencial/ReferencialContextProvider';
import { getDCDirtyReport }           from '@app/dossier/utils/fiche';
import type { TRecapDatas }           from '@app/dossier/utils/fiche';
import type FicheFormModel            from '@app/dossier/models/fiches/FicheFormModel';
import type {
    TFicheFormActions,
    TFicheFormAdditionals
}                                     from '@app/dossier/providers/fiches/FicheFormProvider';
// @library
import FormFieldComponent             from '@library/form/components/FormFieldComponent';
import type FormModel                 from '@library/form/models/FormModel';
import type FormFieldModel            from '@library/form/models/FormFieldModel';
import type { TUseFormContextValues } from '@library/form/providers/useFormProvider';
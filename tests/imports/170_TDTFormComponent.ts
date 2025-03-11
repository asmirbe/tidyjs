// Misc
import { useEffect }        from 'react';
import cn                   from 'classnames';
import {
    sum,
    map,
    reject,
    filter,
    orderBy
}                           from 'lodash';
import { v4 as uuidv4  }    from 'uuid';
import type {
    FC,
    Dispatch,
    SetStateAction
}                           from 'react';
// DS
import {
    YpTable,
    YpButton,
    YpElement,
    YpTypography
} from 'ds';
// @app/dossier
import RDTFormComponent                 from '@app/dossier/components/parametrage-dossier/temps-travail/RDTFormComponent';
import FieldVisibiliteEnum              from '@app/dossier/models/enums/FieldVisibiliteEnum';
import { useReferencialContext }        from '@app/dossier/providers/referencial/ReferencialContextProvider';
import { getDCByGroupement }            from '@app/dossier/utils/fiche';
import type FicheFormModel              from '@app/dossier/models/fiches/FicheFormModel';
import type TempsTravailFormModel       from '@app/dossier/models/fiches/temps-travail/TempsTravailFormModel';
import type DonneeContextuelleModel     from '@app/dossier/models/DonneeContextuelleModel';
import type { TFicheMultiFormActions }  from '@app/dossier/providers/fiches/FicheMultiFormProvider';
// @core
import card_empty                       from '@core/resources/assets/images/patterns/card_empty.png';
import type { TActionProviderReturn }   from '@core/models/ProviderModel';
// @library
import FormFieldComponent               from '@library/form/components/FormFieldComponent';
import { getFormattedDecimalDigits }    from '@library/utils/number';
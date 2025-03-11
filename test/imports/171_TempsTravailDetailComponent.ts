// Misc
import cn               from 'classnames';
import {
    map,
    find,
    filter,
    orderBy
}                       from 'lodash';
import { type FC }      from 'react';
// DS
import {
    YpTag,
    YpTable,
    YpButton,
    YpElement,
    YpDivider,
    YpTypography
} from 'ds';
// @app/dossier
import { DonneeTypeEnum }               from '@app/dossier/models/enums/DonneeContextuelle';
import FieldVisibiliteEnum              from '@app/dossier/models/enums/FieldVisibiliteEnum';
import { useReferencialContext }        from '@app/dossier/providers/referencial/ReferencialContextProvider';
import useIngredientsListProvider       from '@app/dossier/providers/ingredients/IngredientsListProvider';
import { getDCByGroupement }            from '@app/dossier/utils/fiche';
import type FicheFormModel              from '@app/dossier/models/fiches/FicheFormModel';
import type TempsTravailModel           from '@app/dossier/models/fiches/temps-travail/TempsTravailModel';
import type HistorisationModel          from '@app/dossier/models/fiches/HistorisationModel';
import type TableReferenceModel         from '@app/dossier/models/TableReferenceModel';
import type TempsTravailFormModel       from '@app/dossier/models/fiches/temps-travail/TempsTravailFormModel';
import type DonneeContextuelleModel     from '@app/dossier/models/DonneeContextuelleModel';
import type { TFicheMultiFormActions }  from '@app/dossier/providers/fiches/FicheMultiFormProvider';
// @core
import { useUserContext }   from '@core/providers/contexts/UserContextProvider';
import picto                from '@core/resources/assets/images/yeap/picto-yeap.png';
import type {
    TDataProviderReturn,
    TActionProviderReturn
}                           from '@core/models/ProviderModel';
// @library
import { getFormattedDecimalDigits } from '@library/utils/number';
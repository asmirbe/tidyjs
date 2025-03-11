// Misc
import { useEffect }    from 'react';
import cn               from 'classnames';
import {
    map,
    sum,
    reject,
    filter,
    orderBy,
    findIndex
}                       from 'lodash';
import type {
    FC,
    Dispatch,
    SetStateAction
}                       from 'react';
// DS
import {
    YpTable,
    YpButton,
    YpElement
} from 'ds';
// @app/dossier
import FieldVisibiliteEnum              from '@app/dossier/models/enums/FieldVisibiliteEnum';
import { useReferencialContext }        from '@app/dossier/providers/referencial/ReferencialContextProvider';
import { getDCByGroupement }            from '@app/dossier/utils/fiche';
import type FicheFormModel              from '@app/dossier/models/fiches/FicheFormModel';
import type TempsTravailFormModel       from '@app/dossier/models/fiches/temps-travail/TempsTravailFormModel';
import type DonneeContextuelleModel     from '@app/dossier/models/DonneeContextuelleModel';
import type { TFicheMultiFormActions }  from '@app/dossier/providers/fiches/FicheMultiFormProvider';
// @core
import type { TActionProviderReturn } from '@core/models/ProviderModel';
// @library
import FormFieldComponent from '@library/form/components/FormFieldComponent';
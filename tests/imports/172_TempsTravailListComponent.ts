// Misc
import {
    useMemo,
    useState,
    useCallback
}                               from 'react';
import type {
    FC,
    ChangeEvent
}                               from 'react';
import cn                       from 'classnames';
import { FontAwesomeIcon }      from '@fortawesome/react-fontawesome';
import {
    map,
    max,
    find,
    filter,
    orderBy,
    flatMap
}                               from 'lodash';
import { createColumnHelper }   from '@tanstack/react-table';
import { v4 as uuidv4  }        from 'uuid';
// DS
import {
    YpTag,
    YpInput,
    YpSelect,
    YpDrawer,
    YpDivider,
    YpElement,
    useYpModal,
    YpDataTable,
    YpFormModal,
    YpTypography,
    YpConfirmModal,
    YpSkeletonList
} from 'ds';
// @app/dossier
import TDTFormComponent                     from '@app/dossier/components/parametrage-dossier/temps-travail/TDTFormComponent';
import TempsTravailDetailComponent          from '@app/dossier/components/parametrage-dossier/temps-travail/TempsTravailDetailComponent';
import { useDossierContext }                from '@app/dossier/providers/contexts/DossierContextProvider';
import { useFicheMultiDelete }              from '@app/dossier/providers/fiches/FicheMultiDeleteProvider';
import { useReferencialContext }            from '@app/dossier/providers/referencial/ReferencialContextProvider';
import useTableReferenceDetailProvider      from '@app/dossier/providers/tablesReference/TableReferenceDetailProvider';
import {
    datas,
    getValorisationByPropertyKey,
    getIntValorisationByPropertyKey
}                                           from '@app/dossier/utils/fiche';
import type FicheFormModel                  from '@app/dossier/models/fiches/FicheFormModel';
import type TempsTravailModel               from '@app/dossier/models/fiches/temps-travail/TempsTravailModel';
import type HistorisationModel              from '@app/dossier/models/fiches/HistorisationModel';
import type TempsTravailFormModel           from '@app/dossier/models/fiches/temps-travail/TempsTravailFormModel';
import type DonneeContextuelleModel         from '@app/dossier/models/DonneeContextuelleModel';
import type { TFicheMultiFormActions }      from '@app/dossier/providers/fiches/FicheMultiFormProvider';
import type { TParametrageProviderReturn }  from '@app/dossier/providers/parametrage-dossier/ParametrageDossierProvider';
// @core
import { useUserContext }   from '@core/providers/contexts/UserContextProvider';
import picto                from '@core/resources/assets/images/yeap/picto-yeap.png';
import card_empty           from '@core/resources/assets/images/patterns/card_empty.png';
import type {
    TDataProviderReturn,
    TActionProviderReturn
}                           from '@core/models/ProviderModel';
// @library
import FormComponent                    from '@library/form/components/FormComponent';
import FormContextProvider              from '@library/form/providers/FormProvider';
import { useSearch }                    from '@library/utils/search';
import { getFormattedDecimalDigits }    from '@library/utils/number';
// yutils
import {
    conjugate,
    getTextPreview
} from 'yutils/text';
// @library
import { useTable } from '@library/utils/table';
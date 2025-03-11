// Misc
import {
    useMemo,
    useCallback
}                             from 'react';
import type {
    FC,
    Dispatch,
    ChangeEvent,
    SetStateAction
}                             from 'react';
import cn                     from 'classnames';
import {
    map,
    find,
    slice,
    filter,
    orderBy
}                             from 'lodash';
import { createColumnHelper } from '@tanstack/react-table';
// DS
import {
    YpInput,
    YpElement,
    YpDataTable,
    YpTypography,
    YpTag,
    YpTooltip
} from 'ds';
// @app/dossier
import { useReferencialContext }            from '@app/dossier/providers/referencial/ReferencialContextProvider';
import { getValorisationByPropertyKey }     from '@app/dossier/utils/fiche';
import type PopulationModel                 from '@app/dossier/models/populations/PopulationModel';
import type { THistorisationValorisation }  from '@app/dossier/models/fiches/HistorisationModel';
// @core
import grid_empty from '@core/resources/assets/images/patterns/grid_empty.png';
// @library
import { useTable }                  from '@library/utils/table';
import { useSearch }                 from '@library/utils/search';
import { getFormattedDecimalDigits } from '@library/utils/number';
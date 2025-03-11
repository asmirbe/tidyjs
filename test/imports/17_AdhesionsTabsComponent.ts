// Misc libs
import {
    map,
    keys,
    reduce,
    flatMap
}                   from 'lodash';
import type {
    FC,
    Dispatch,
    SetStateAction
}                   from 'react';
// DS
import {
    YpTab,
    YpElement
} from 'ds';
// @app/dossier
import AdhesionTypeEnum           from '@app/dossier/models/enums/AdhesionType';
import type AdhesionsListModel    from '@app/dossier/models/AdhesionsListModel';
import type { TAdhesionTypeCode } from '@app/dossier/models/enums/AdhesionType';
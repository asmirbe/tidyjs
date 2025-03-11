// Misc
import {
    useState,
    useCallback
}                   from 'react';
import cn           from 'classnames';
import {
    find,
    filter,
    reject
}                   from 'lodash';
import type {
    Dispatch,
    MouseEvent,
    SetStateAction
}                   from 'react';
// DS
import {
    YpTag,
    YpInput,
    YpElement,
    YpTooltip,
    YpTypography
} from 'ds';
// @app/dossier
import { isEqualBulletin }              from '@app/dossier/components/bulletins/utils/bulletin';
import { getValorisationByPropertyKey } from '@app/dossier/utils/fiche';
import type HistorisationModel          from '@app/dossier/models/fiches/HistorisationModel';
import type {
    TBulletinsListByIndCntModel,
    TSalarieWithBulletin,
    TSelectedBulletin
}                                       from '@app/dossier/pages/bulletins/BulletinsPage';
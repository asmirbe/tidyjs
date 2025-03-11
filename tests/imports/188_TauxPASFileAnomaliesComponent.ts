// Misc libs
import {
    useEffect,
    useState
}                  from 'react';
import type { FC } from 'react';
// DS
import {
    YpGrid,
    YpModal,
    YpButton,
    YpDivider,
    YpElement,
    useYpModal,
    YpTypography,
    YpSkeletonList
}                                from 'ds';
import type { TYpGridColumType } from 'ds';
// @app/core
import type { TDataProviderReturn } from '@core/models/ProviderModel';
// @app/dossier
import type TauxPASFileDetailModel      from '@app/dossier/models/TauxPasFileDetailModel';
import type { TTauxPASSalarieModel }    from '@app/dossier/models/TauxPasFileDetailModel';
import type { TAnomaliesSalariesModel } from '@app/dossier/models/TauxPasFileDetailModel';
// Utils
import {
    conjugate,
    getTextPreview
} from 'yutils/text';
// Misc
import type {
    FC } from 'react';
import {
    useState,
    useEffect
}                   from 'react';
import { isEmpty }  from 'lodash';
import {
    YpGrid,
    YpAlert,
    YpDivider,
    YpElement,
    useYpModal,
    YpFormModal,
    YpTypography,
    YpSkeletonList,
    type TYpGridRowType,
    type TYpGridColumType
}                           from 'ds';
// @app/dossier
import OCContratCotisationFormComponent       from '@app/dossier/components/adhesions/oc/cotisations/OCContratCotisationFormComponent';
import useOCCotisationsList                   from '@app/dossier/providers/adhesions/oc/cotisations/OCCotisationsListProvider';
import useOCDetail                            from '@app/dossier/providers/adhesions/oc/OCDetailProvider';
import type OCDetailModel                     from '@app/dossier/models/adhesions/cotisations/get/OCDetailModel';
import type AdhesionFpocModel                 from '@app/dossier/models/AdhesionFpocModel';
import type OCContratCotisationModel          from '@app/dossier/models/adhesions/cotisations/get/OCContratCotisationModel';
import type { TOCCotisationsListAdditionals } from '@app/dossier/providers/adhesions/oc/cotisations/OCCotisationsListProvider';
// @core
import type { WsDataModel } from '@core/models/ProviderModel';
// @library
import {
    getDateFormat,
    getPeriodFormat
}                             from '@library/utils/dates';
import { getColorFromString } from '@library/utils/styles';
// Utils
import { conjugate } from 'yutils/text';
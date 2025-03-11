// Misc libs
import type { FC } from 'react';
import {
    isNumber,
    map
}                  from 'lodash';
// DS
import {
    YpDivider,
    YpElement,
    YpSkeleton,
    YpThumbnail,
    YpTypography,
} from 'ds';
// @app/dossier
import type AdhesionEtablissementModel from '@app/dossier/models/AdhesionEtablissementModel';
// @core
import type { TDataProviderReturn } from '@core/models/ProviderModel';
// @library
import { getDateFormat } from '@library/utils/dates';
// Utils
import { getTextPreview } from 'yutils/text';
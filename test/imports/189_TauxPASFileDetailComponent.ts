// Misc libs
import type { FC } from 'react';
// DS
import {
    YpGrid,
    YpDivider,
    YpElement,
    YpTypography,
    YpSkeletonList
}                                from 'ds';
import type { TYpGridColumType } from 'ds';
// @app/dossier
import TauxPASFileAnomaliesComponent from '@app/dossier/components/tauxPAS/TauxPASFileAnomaliesComponent';
import useTauxPASFileDetail          from '@app/dossier/providers/tauxPAS/TauxPASFileDetailProvider';
import type TauxPASModel             from '@app/dossier/models/TauxPASModel';
// Utils
import {
    conjugate,
    getTextPreview
} from 'yutils/text';
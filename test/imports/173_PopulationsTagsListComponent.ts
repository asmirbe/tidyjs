import {
    map,
    reject,
    sortBy
}                  from 'lodash';
import type { FC } from 'react';
// DS
import {
    YpTag,
    YpElement,
    YpTagsList,
    YpTypography,
    YpSkeleton
}   from 'ds';
// @app/dossier
import type PopulationModel from '@app/dossier/models/populations/PopulationModel';
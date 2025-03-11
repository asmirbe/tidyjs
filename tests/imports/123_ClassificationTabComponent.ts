// Misc
import {
    useEffect,
    useState
}                  from 'react';
import { uniqBy }  from 'lodash';
import type {
    FC,
    Dispatch,
    SetStateAction
}                  from 'react';
// DS
import { YpElement } from 'ds';
// @app/dossier
import ClassificationStepComponent from '@app/dossier/components/fiches/classification/ClassificationStepComponent';
import { conventionCodeDuTravail } from '@app/dossier/pages/creationSalarie/CreationSalariePage';
import type ContratFormModel       from '@app/dossier/models/fiches/contrat/ContratFormModel';
import type { TConventionsTags }   from '@app/dossier/pages/creationSalarie/CreationSalariePage';
import type { TFicheFormActions }  from '@app/dossier/providers/fiches/FicheFormProvider';
// @core
import type { TActionProviderReturn } from '@core/models/ProviderModel';
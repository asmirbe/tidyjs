// Misc libs
// Misc
import  { orderBy }  from 'lodash';
import  { useState } from 'react';
import  type { FC }  from 'react';

// DS
import  {
    YpButton,
    YpSelect,
    YpDivider,
    YpElement,
} from 'ds';

// @app/dossier
import  TacheDetailComponent  from '@app/dossier/components/taches/TacheDetailComponent';
import  TacheFormComponent    from '@app/dossier/components/taches/TacheFormComponent';
import  TacheModel            from '@app/dossier/models/TacheModel';
import  useEtablissementsList from '@app/dossier/providers/fiches/etablissements/EtablissementsListProvider';
import  useTachesList         from '@app/dossier/providers/taches/TachesListProvider';

// @core
import  type {
    WsDataModel,
    TDataProviderReturn,
} from '@core/models/ProviderModel';

// @library
import  { useListRendering } from '@library/utils/list';

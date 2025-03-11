// Misc
import { useState }      from 'react';
import type { FC }       from 'react';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
// DS
import { YpCard } from 'ds';
// @app/dossier
import EvenementEnum              from '@app/dossier/models/enums/Evenement';
import MoisEnum                   from '@app/dossier/models/enums/Mois';
import type EvenementModel        from '@app/dossier/models/EvenementModel';
import type  {
    TEvenementContentBulletin,
    TEvenementContentFpoc
}                                 from '@app/dossier/models/EvenementModel';
import type { TEvenementActions } from '@app/dossier/providers/evenements/EvenementsListProvider';
// @core
import type { TActionProviderReturn } from '@core/models/ProviderModel';
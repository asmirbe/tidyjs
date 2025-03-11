// Misc
import {
    useEffect
}                           from 'react';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import {
    find,
    truncate
}                           from 'lodash';
import type { FC }          from 'react';
// DS
import {
    YpGrid,
    YpSelect,
    YpElement
}                                   from 'ds';
import type { TYpGridColumType }    from 'ds';
// @app/dossier
import TacheFormComponent      from '@app/dossier/components/taches/TacheFormComponent';
import StatutTacheEnum         from '@app/dossier/models/enums/StatutTache';
import TacheEnum               from '@app/dossier/models/enums/Tache';
import useTacheDetail          from '@app/dossier/providers/taches/TacheDetailProvider';
import { getDCByCodes }        from '@app/dossier/utils/fiche';
import type EtablissementModel from '@app/dossier/models/fiches/etablissement/EtablissementModel';
import type TacheModel         from '@app/dossier/models/TacheModel';
// @core
import type {
    TDataProviderReturn,
    WsDataModel
} from '@core/models/ProviderModel';
// @library
import { getDateFormat }    from '@library/utils/dates';
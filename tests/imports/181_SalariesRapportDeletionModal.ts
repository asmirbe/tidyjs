// Misc libs
import { memo }       from 'react';
import { sortBy }     from 'lodash';
import CsvDownloader  from 'react-csv-downloader';
import type { FC }    from 'react';
import type { Datas } from 'react-csv-downloader/dist/esm/lib/csv';
// DS
import {
    YpModal,
    YpTable,
    YpButton,
    YpElement,
    YpTypography
} from 'ds';
// @app/dossier
import { getValorisationByPropertyKey }    from '@app/dossier/utils/fiche';
import type { THistorisationValorisation } from '@app/dossier/models/fiches/HistorisationModel';
import type HistorisationModel             from '@app/dossier/models/fiches/HistorisationModel';
// @core
import type { TErrorModel } from '@core/models/ErrorModel';
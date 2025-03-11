// Misc libs
import { findIndex } from 'lodash';
import type { FC }   from 'react';
// DS
import {
    YpElement,
    YpDivider
} from 'ds';
// @app/dossier
import ContratDgfipDetailComponent from '@app/dossier/components/adhesions/dgfip/contrats/ContratDgfipDetailComponent';
import type AdhesionDetailModel    from '@app/dossier/models/AdhesionDetailModel';
import type AdhesionsListModel     from '@app/dossier/models/AdhesionsListModel';
import type BanqueModel            from '@app/dossier/models/fiches/banque/BanqueModel';
// @library
import { useListRendering }     from '@library/utils/list';
import type EtablissementModel  from '@library/form-new/test/models/EtablissementModel';
// @core
import { WsDataModel }              from '@core/models/ProviderModel';
import type { TDataProviderReturn } from '@core/models/ProviderModel';
// Utils
import { conjugate } from 'yutils/text';
// Misc libs
import {
    Fragment,
    type FC
}                          from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { find }            from 'lodash';
// DS
import {
    YpGrid,
    YpDivider,
    YpElement,
    YpFormModal,
    YpButton
} from 'ds';
// @app/dossier
import BanqueUrssafFormComponent        from '@app/dossier/components/adhesions/urssaf/banque/BanqueUrssafFormComponent';
import StatutAdhesionEnum               from '@app/dossier/models/enums/StatutAdhesion';
import useBanqueUrssafDetail            from '@app/dossier/providers/adhesions/urssaf/banque/BanqueUrssafDetailProvider';
import { getValorisationByPropertyKey } from '@app/dossier/utils/fiche';
import type AdhesionDetailModel         from '@app/dossier/models/AdhesionDetailModel';
import type BanqueModel                 from '@app/dossier/models/fiches/banque/BanqueModel';
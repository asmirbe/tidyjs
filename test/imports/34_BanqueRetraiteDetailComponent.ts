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
import BanqueRetraiteFormComponent      from '@app/dossier/components/adhesions/retraite/banque/BanqueRetraiteFormComponent';
import StatutAdhesionEnum               from '@app/dossier/models/enums/StatutAdhesion';
import useBanqueRetraiteDetail          from '@app/dossier/providers/adhesions/retraite/banque/BanqueRetraiteDetailProvider';
import { getValorisationByPropertyKey } from '@app/dossier/utils/fiche';
import type AdhesionDetailModel         from '@app/dossier/models/AdhesionDetailModel';
import type BanqueModel                 from '@app/dossier/models/fiches/banque/BanqueModel';
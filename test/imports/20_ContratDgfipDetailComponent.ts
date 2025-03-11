import { Fragment }   from 'react';
import { find }       from 'lodash';
import type { FC }    from 'react';
// DS
import {
    YpGrid,
    YpElement,
    YpFormModal,
    YpTypography,
    YpButton
}                                from 'ds';
import type { TYpGridColumType } from 'ds';
// @app/dossier
import DgfipFormComponent        from '@app/dossier/components/adhesions/dgfip/DgfipFormComponent';
import MoyensPaiementEnum        from '@app/dossier/models/enums/MoyensPaiement';
import PeriodicitePaiementEnum   from '@app/dossier/models/enums/PeriodicitePaiement';
import useAdhesionDgfipDetail    from '@app/dossier/providers/adhesions/dgfip/AdhesionDgfipDetailProvider';
import type BanqueModel          from '@app/dossier/models/fiches/banque/BanqueModel';
// @library
import { getValorisationByPropertyKey } from '@library/form-new/test/providers/fiches/utils/fiche';
import { getColorFromString }           from '@library/utils/styles';
import type EtablissementModel          from '@library/form-new/test/models/EtablissementModel';
// Utils
import { getTextPreview } from 'yutils/text';
// Misc
import {
    useState,
    useEffect
}                       from 'react';
import { LayoutGroup }  from 'framer-motion';
import { map }          from 'lodash';
import type { FC }      from 'react';
// DS
import {
    YpButton,
    YpDivider,
    YpElement,
    YpSkeleton,
    YpContentSwitcher
} from 'ds';
// @app/dossier
import SalarieContratDetailComponent    from '@app/dossier/components/fiche-salarie/detail/contrat/SalarieContratDetailComponent';
import { useReferencialContext }        from '@app/dossier/providers/referencial/ReferencialContextProvider';
import useCotisationsList               from '@app/dossier/providers/fiches/affiliations/CotisationsListProvider';
import useFamillesAdhesionList          from '@app/dossier/providers/adhesions/famille/FamillesAdhesionListProvider';
import useTableReferenceDetailProvider  from '@app/dossier/providers/tablesReference/TableReferenceDetailProvider';
import type IndividuModel               from '@app/dossier/models/fiches/individu/IndividuModel';
// @core
import { useUserContext }           from '@core/providers/contexts/UserContextProvider';
import type { TDataProviderReturn } from '@core/models/ProviderModel';
// @library
import ContratFormComponent         from '@library/form-new/test/components/contrats/ContratFormComponent';
import useContratForm               from '@library/form-new/test/providers/contrats/ContratFormProvider';
import useIndividuContratsList      from '@library/form-new/test/providers/contrats/IndividuContratsListProvider';
import { getDCByCodes }             from '@library/form-new/test/providers/fiches/utils/fiche';
import { EmptyComponent }           from '@library/utils/list';
import type ContratModel            from '@library/form-new/test/models/ContratModel';
import type { FicheOverloadModel }  from '@library/form-new/test/providers/fiches/FichesDossierListProvider';
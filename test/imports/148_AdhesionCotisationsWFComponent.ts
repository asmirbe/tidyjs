// Misc
import {
    useState,
    useEffect,
    type FC
}               from 'react';
import cn       from 'classnames';
import {
    find,
    keys,
    filter,
    flatMap,
    isNumber,
    findIndex,
    startsWith,
    map,
    capitalize
}               from 'lodash';
// DS
import {
    YpDivider,
    YpElement,
    YpFormModal,
    YpStepperNew,
    YpTypography,
    useYpStepper
} from 'ds';
// @app/dossier
import AdhesionFormWFComponent
    from '@app/dossier/components/parametrage-dossier/adhesions-cotisations/workflow/adhesion/AdhesionFormWFComponent';
import CotisationsFormWFComponent
    from '@app/dossier/components/parametrage-dossier/adhesions-cotisations/workflow/cotisations/CotisationsFormWFComponent';
import PaiementsFormWFComponent
    from '@app/dossier/components/parametrage-dossier/adhesions-cotisations/workflow/paiements/PaiementsFormWFComponent';
import TypeLienAdhesionEnum             from '@app/dossier/models/enums/TypeLienAdhesionEnum';
import useAdhesionsList                 from '@app/dossier/providers/fiches/adhesion/AdhesionsListProvider';
import { useFicheActions }              from '@app/dossier/providers/fiches/FicheActionsProvider';
import { useDossierContext }            from '@app/dossier/providers/contexts/DossierContextProvider';
import type FicheFormModel              from '@app/dossier/models/fiches/FicheFormModel';
import type AdhesionFormModel           from '@app/dossier/models/fiches/adhesion/AdhesionFormModel';
import type HistorisationModel          from '@app/dossier/models/fiches/HistorisationModel';
import type TableReferenceModel         from '@app/dossier/models/TableReferenceModel';
import type TypeCotisationModel         from '@app/dossier/models/adhesions/cotisations/TypeCotisationModel';
import type SqueletteFicheModel         from '@app/dossier/models/SqueletteFicheModel';
import type FamilleAdhesionModel        from '@app/dossier/models/adhesions/famille/FamilleAdhesionModel';
// @core
import type { TDataProviderReturn } from '@core/models/ProviderModel';
// @library
import FormFieldComponent   from '@library/form/components/FormFieldComponent';
import FormContextProvider  from '@library/form/providers/FormProvider';
import type FormFieldModel  from '@library/form/models/FormFieldModel';
// @ yutils
import { getTextPreview } from 'yutils/text';
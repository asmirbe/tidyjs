// Misc
import { isEmpty }                                  from 'lodash';
import type { FC }                                  from 'react';
import type { RegisterOptions as ValidationRules }  from 'react-hook-form/dist/types';
// DS
import {
    YpElement,
    YpFormModal,
    YpInput,
    YpLabel,
    YpTypography
}   from 'ds';
// @app/dossier
import SubHeaderComponent                   from '@app/dossier/components/base/SubHeaderComponent';
import { getTypeValue }                     from '@app/dossier/utils/fiche';
import type HistorisationModel              from '@app/dossier/models/fiches/HistorisationModel';
import type ContratModel                    from '@app/dossier/models/fiches/contrat/ContratModel';
import type EtablissementModel              from '@app/dossier/models/fiches/etablissement/EtablissementModel';
import type IndividuModel                   from '@app/dossier/models/fiches/individu/IndividuModel';
import type SocieteModel                    from '@app/dossier/models/fiches/societe/SocieteModel';
import type ValorisationFormModel           from '@app/dossier/models/fiches/ValorisationFormModel';
import type { THistorisationValorisation }  from '@app/dossier/models/fiches/HistorisationModel';
import type { THistorisationFormActions }   from '@app/dossier/providers/historique/HistorisationDetailProvider';
// @core
import type { WsDataModel }                  from '@core/models/ProviderModel';
import type { TActionProviderReturn }   from '@core/models/ProviderModel';
// @library
import FormFieldComponent       from '@library/form/components/FormFieldComponent';
import FormComponent            from '@library/form/components/FormComponent';
import FormContextProvider      from '@library/form/providers/FormProvider';
import { getDateFormat }        from '@library/utils/dates';
import type FormFieldModel      from '@library/form/models/FormFieldModel';
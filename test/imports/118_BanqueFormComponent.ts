// Misc
import { map }     from 'lodash';
import type { FC } from 'react';
// DS
import { YpElement } from 'ds';
// @app/dossier
import { banqueRulesMapping }     from '@app/dossier/providers/fiches/banques/BanqueFormProvider';
import { banqueFicheTypes }       from '@app/dossier/providers/fiches/banques/BanquesListProvider';
import { useReferencialContext }  from '@app/dossier/providers/referencial/ReferencialContextProvider';
import { getDCByGroupement }      from '@app/dossier/utils/fiche';
import type BanqueFormModel       from '@app/dossier/models/fiches/banque/BanqueFormModel';
import type {
    TFicheFormActions,
    TFicheFormAdditionals
}                                 from '@app/dossier/providers/fiches/FicheFormProvider';
// @library
import FormComponent       from '@library/form/components/FormComponent';
import FormFieldComponent  from '@library/form/components/FormFieldComponent';
import FormContextProvider from '@library/form/providers/FormProvider';
// @core
import type { TActionProviderReturn } from '@core/models/ProviderModel';
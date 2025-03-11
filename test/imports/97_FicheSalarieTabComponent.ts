// Misc
import type { FC } from 'react';
// DS
import { YpElement } from 'ds';
// @app/dossier
import IndividuDetailComponent              from '@app/dossier/components/fiche-salarie/detail/IndividuDetailComponent';
import SalarieContratsListComponent         from '@app/dossier/components/fiche-salarie/detail/contrat/SalarieContratsListComponent';
import SalarieComptesBancairesListComponent from '@app/dossier/components/fiche-salarie/detail/compteBancaire/SalarieComptesBancairesListComponent';
import type IndividuModel                   from '@app/dossier/models/fiches/individu/IndividuModel';
import type FicheFormModel                  from '@app/dossier/models/fiches/FicheFormModel';
import type {
    TFicheFormActions,
    TFicheFormAdditionals
}                                           from '@app/dossier/providers/fiches/FicheFormProvider';
// @core
import type { TCallReturn } from '@core/providers/NetworkProvider';
import type {
    TActionProviderReturn,
    TDataProviderReturn
}                           from '@core/models/ProviderModel';
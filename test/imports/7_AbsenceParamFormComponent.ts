// Misc
import {
    useState,
    type FC
}                           from 'react';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import {
    map,
    last,
    first,
    filter
}                           from 'lodash';
// DS
import {
    YpTab,
    YpTag,
    YpElement,
    YpSkeleton,
    YpTypography,
    YpSkeletonList
} from 'ds';
// @app/dossier
import AbsenceParamDureeComponent               from '@app/dossier/components/absences/param/duree/AbsenceParamDureeComponent';
import AbsenceParamDecoupageComponent           from '@app/dossier/components/absences/param/decoupage/AbsenceParamDecoupageComponent';
import AbsenceParamSubrogationComponent         from '@app/dossier/components/absences/param/subrogation/AbsenceParamSubrogationComponent';
import AbsenceParamCommentairesComponent        from '@app/dossier/components/absences/param/commentaires/AbsenceParamCommentairesComponent';
import AbsenceParamIndemnisationComponent       from '@app/dossier/components/absences/param/indemnisation/AbsenceParamIndemnisationComponent';
import ModeDemarrageAbsenceEnum                 from '@app/dossier/models/enums/ModeDemarrageAbsence';
import type RegroupementAbsenceModel            from '@app/dossier/models/absences/RegroupementAbsenceModel';
import type SalariesAbsencesListModel           from '@app/dossier/models/SalariesAbsencesListModel';
import type { TRegroupementAbsenceFormActions } from '@app/dossier/providers/absences/RegroupementAbsenceFormProvider';
import type { TRegroupementAbsenceAdditionals } from '@app/dossier/providers/absences/RegroupementAbsenceDetailProvider';
// @core
import type {
    TDataProviderReturn,
    TActionProviderReturn
} from '@core/models/ProviderModel';
// @library
import FormComponent        from '@library/form/components/FormComponent';
import FormContextProvider  from '@library/form/providers/FormProvider';
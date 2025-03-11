// Misc
import {
    useState,
    useEffect,
    useCallback
}                       from 'react';
import {
    isNaN,
    isNumber,
    isBoolean
}                       from 'lodash';
import type {
    FC,
    ChangeEvent
}                       from 'react';
// DS
import { YpElement }    from 'ds';
// @app/dossier
import ProfileCotisationIndEnum          from '@app/dossier/models/enums/ProfileCotisationInd';
import ProfileCotisationEtaEnum          from '@app/dossier/models/enums/ProfileCotisationEta';
import type OCFormModel                  from '@app/dossier/models/adhesions/cotisations/put/OCFormModel';
import type { TOCContratCotisationType } from '@app/dossier/models/adhesions/cotisations/get/OCContratCotisationModel';
import type { TOCCotisationFormActions } from '@app/dossier/providers/adhesions/oc/cotisations/OCCotisationFormProvider';
// @core
import type { TActionProviderReturn } from '@core/models/ProviderModel';
// @library
import FormFieldComponent   from '@library/form/components/FormFieldComponent';
import type FormFieldModel  from '@library/form/models/FormFieldModel';
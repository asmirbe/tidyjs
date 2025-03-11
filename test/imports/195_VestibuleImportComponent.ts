// Misc
import {
    useState,
    useEffect,
    type FC
}                           from 'react';
import cn                   from 'classnames';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import { map }              from 'lodash';
// DS
import {
    YpTypography,
    YpDivider,
    YpElement,
    YpButton,
    YpModal
} from 'ds';
// @app/dossier
import EtatImportVestibuleEnum  from '@app/dossier/models/enums/EtatImportVestibule';
import useImportLotDetail       from '@app/dossier/providers/vestibule/ImportLotDetailProvider';
import { useDossierContext }    from '@app/dossier/providers/contexts/DossierContextProvider';
import type ImportLotModel      from '@app/dossier/models/LotModel';
// @core
import type { TWsException }    from '@core/models/CoreModel';
// @library
import FormComponent        from '@library/form/components/FormComponent';
import FormFieldComponent   from '@library/form/components/FormFieldComponent';
import FormContextProvider  from '@library/form/providers/FormProvider';
import type FormFieldModel  from '@library/form/models/FormFieldModel';
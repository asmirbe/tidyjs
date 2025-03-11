// Misc
import {
    useState,
    useEffect
}                           from 'react';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import {
    find,
    first,
    findIndex,
}                           from 'lodash';
import type {
    FC,
    Dispatch,
    SetStateAction
}                           from 'react';
// DS
import {
    YpTab,
    YpElement,
    YpFormModal,
    YpHeaderedElement
}                                       from 'ds';
import type { TYpHeaderedElementProps } from 'ds';
// @app/dossier
import DgfipFormComponent       from '@app/dossier/components/adhesions/dgfip/DgfipFormComponent';
import StatutAdhesionEnum       from '@app/dossier/models/enums/StatutAdhesion';
import useAdhesionDgfipDetail   from '@app/dossier/providers/adhesions/dgfip/AdhesionDgfipDetailProvider';
import type AdhesionsListModel  from '@app/dossier/models/AdhesionsListModel';
import type AdhesionDgfipModel  from '@app/dossier/models/AdhesionDgfipModel';
import type AdhesionCommonModel from '@app/dossier/models/AdhesionCommonModel';
// @core
import type { WsDataModel } from '@core/models/ProviderModel';
// @library
import { getValorisationByPropertyKey } from '@library/form-new/test/providers/fiches/utils/fiche';
import { getColorFromString }           from '@library/utils/styles';
import type EtablissementModel          from '@library/form-new/test/models/EtablissementModel';
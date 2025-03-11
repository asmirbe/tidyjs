// Misc
import {
    Fragment,
    useEffect,
    useState
}                           from 'react';
import cn                   from 'classnames';
import { LayoutGroup }      from 'framer-motion';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import {
    sortBy,
    isEmpty
}                           from 'lodash';
import type {
    FC,
    Dispatch,
    SetStateAction
}                           from 'react';
// DS
import {
    YpElement,
    YpSkeleton,
    YpTypography,
    YpContentSwitcher
} from 'ds';
// @app/dossier
import ClassificationsListComponent from '@app/dossier/components/fiches/classification/ClassificationsListComponent';
import type ClassificationModel     from '@app/dossier/models/fiches/classification/ClassificationModel';
// @core
import { useUserContext } from '@core/providers/contexts/UserContextProvider';
// Misc libs
import {
    useCallback,
    useMemo,
}                             from 'react';
import { Link }               from '@reach/router';
import { FontAwesomeIcon }    from '@fortawesome/react-fontawesome';
import { createColumnHelper } from '@tanstack/react-table';
import cn                     from 'classnames';
import {
    map,
    slice,
    filter,
    reject
}                             from 'lodash';
import type { Table }         from '@tanstack/react-table';
import type {
    Dispatch,
    ChangeEvent,
    SetStateAction
}                             from 'react';
// DS
import {
    YpTag,
    YpMenu,
    YpElement,
    YpTooltip,
    YpTypography
}                          from 'ds';
import type { TColumnDef } from 'ds';
// @app/dossier
import type { TSalariesDataRow } from '@app/dossier/components/salaries/SalariesTableComponent';
import type PopulationModel      from '@app/dossier/models/populations/PopulationModel';
// @library
import { getDateFormat } from '@library/utils/dates';
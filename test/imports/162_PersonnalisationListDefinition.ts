// Misc
import cn                              from 'classnames';
import { Fragment }                    from 'react';
import { FontAwesomeIcon }             from '@fortawesome/react-fontawesome';
import {
    find,
    map,
    slice
}                                      from 'lodash';
import { createColumnHelper }          from '@tanstack/react-table';
// DS
import {
    YpTag,
    YpMenu,
    YpTooltip,
    YpElement,
    YpMarkdown,
    YpTypography
}                                      from 'ds';
import type { TColumnDef }             from 'ds';
// @app
import type { TIngredientRow }          from '@app/dossier/components/parametrage-dossier/personnalisation/PersonnalisationListComponent';
import type { EnhancedIngredientModel } from '@app/dossier/models/ingredients/IngredientModel';
import type PopulationModel             from '@app/dossier/models/populations/PopulationModel';
// @library
import { getDateFormat }               from '@library/utils/dates';
// @core
import picto                           from '@core/resources/assets/images/yeap/picto-yeap.png';
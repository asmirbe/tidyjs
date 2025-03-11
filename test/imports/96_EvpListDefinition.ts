// Misc
import { createColumnHelper }          from '@tanstack/react-table';
import { map, slice }                  from 'lodash';
import cn                              from 'classnames';
// DS
import {
    YpElement,
    YpTypography,
    YpInput,
    YpTag,
    YpTooltip
}                                      from 'ds';
import type { TColumnDef }             from 'ds';
// @library
import { getDateFormat }               from '@library/utils/dates';
// @app
import type { TEvpDataRow }            from '@app/dossier/components/evp/saisieManuelle/EvpFormComponent';
import type EvpFormModel               from '@app/dossier/models/EvpFormModel';
import type PopulationModel            from '@app/dossier/models/populations/PopulationModel';
import type { TEvpFormActions }        from '@app/dossier/providers/evp/EvpFormProvider';
// @core
import picto                           from '@core/resources/assets/images/yeap/picto-yeap.png';
import type { TActionProviderReturn }  from '@core/models/ProviderModel';
// Misc
import {
    useMemo,
    useState,
    useEffect,
    useCallback
}                               from 'react';
import {
    map,
    find,
    filter,
    orderBy
}                               from 'lodash';
import cn                       from 'classnames';
import type { FC }              from 'react';
// DS
import {
    YpTag,
    YpAlert,
    YpDivider,
    YpElement,
    useYpModal,
    YpDataTable,
    YpTypography,
    YpConfirmModal,
    YpSkeletonList,
}                               from 'ds';
import type { OptionsGroup }    from 'ds';
// @app/dossier
import DualSearchWithPopulation                    from '@app/dossier/components/base/DualSearchWithPopulation';
import PersonnalisationFormComponent               from '@app/dossier/components/parametrage-dossier/personnalisation/PersonnalisationFormComponent';
import { ingredientsColumns }                      from '@app/dossier/components/parametrage-dossier/personnalisation/PersonnalisationListDefinition';
import { formSections }                            from '@app/dossier/components/parametrage-dossier/personnalisation/utils';
import { EnhancedIngredientModel }                 from '@app/dossier/models/ingredients/IngredientModel';
import useSyntaxProvider                           from '@app/dossier/providers/SyntaxProvider';
import usePersonnalisationActions                  from '@app/dossier/providers/parametrage-dossier/ingredients/PersonnalisationActionsProvider';
import usePersonnalisationList                     from '@app/dossier/providers/parametrage-dossier/ingredients/PersonnalisationListProvider';
import { useReferencialContext }                   from '@app/dossier/providers/referencial/ReferencialContextProvider';
import { useSearchByPop }                          from '@app/dossier/utils/search-by-pop';
import type IngredientModel                        from '@app/dossier/models/ingredients/IngredientModel';
import type { TTagFilterLibelle }                  from '@app/dossier/models/ingredients/IngredientModel';
import type PopulationModel                        from '@app/dossier/models/populations/PopulationModel';
import type { TParametrageProviderReturn }         from '@app/dossier/providers/parametrage-dossier/ParametrageDossierProvider';
import type { TPersonnalisationListAdditionals }   from '@app/dossier/providers/parametrage-dossier/ingredients/PersonnalisationListProvider';
// @core
import grid_empty               from '@core/resources/assets/images/patterns/grid_empty.png';
import type { WsDataModel }     from '@core/models/ProviderModel';
// @library
import { useTable }             from '@library/utils/table';
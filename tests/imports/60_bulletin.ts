// Misc
import {
    map,
    sum,
    isArray,
    isNumber,
    toNumber,
    find
} from 'lodash';
// @app/dossier
import BulletinTypeEnum                        from '@app/dossier/models/enums/BulletinType';
import IngredientRubriqueColonne               from '@app/dossier/models/enums/IngredientRubriqueColonne';
import type BulletinChronologiqueModel         from '@app/dossier/models/BulletinChronologiqueModel';
import type BulletinModel                      from '@app/dossier/models/bulletin/BulletinModel';
import type { TBulletinType }                  from '@app/dossier/models/enums/BulletinType';
import type { TIngredientRubriqueColonneCode } from '@app/dossier/models/enums/IngredientRubriqueColonne';
import type { TSelectedBulletin }              from '@app/dossier/pages/bulletins/BulletinsPage';
// Misc
import {
    useRef,
    useState,
    useEffect,
    type FC,
}                           from 'react';
import cn                   from 'classnames';
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome';
import { isEmpty }          from 'lodash';
// DS
import {
    YpTag,
    YpInput,
    YpElement,
    YpTypography
}   from 'ds';
// @app/dossier
import { YpTagSelectItem } from '@app/dossier/components/cumuls/tag/YpTagSelectItem';
import type { SelectItem } from '@app/dossier/components/cumuls/tag/YpTagSelectItem';
// @library
import { useSearch } from '@library/utils/search';
// Misc
import type { FC }          from 'react';
import {
    parseISO,
    formatDistance
}                           from 'date-fns';
import { fr }               from 'date-fns/locale';
import { truncate }         from 'lodash';
// DS
import {
    useYpModal,
    YpButton,
    YpConfirmModal,
    YpElement,
    YpThumbnail,
    YpTypography
} from 'ds';
// @app/dossier
import useNoteDetail  from '@app/dossier/providers/notes/NoteDetailProvider';
import type NoteModel from '@app/dossier/models/NoteModel';
// Utils
import { getTextPreview } from 'yutils/text';
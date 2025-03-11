// Misc libs
import type { FC }  from 'react';
import { useState } from 'react';
// DS
import {
    YpButton,
    YpDivider,
    YpElement
} from 'ds';
// @core
import type { TDataProviderReturn } from '@core/models/ProviderModel';
// @app/dossier
import NoteDetailComponent     from '@app/dossier/components/notes/NoteDetailComponent';
import NoteFormComponent       from '@app/dossier/components/notes/NoteFormComponent';
import useNotesList            from '@app/dossier/providers/notes/NotesListProvider';
import type NoteModel          from '@app/dossier/models/NoteModel';
// @library
import { useListRendering } from '@library/utils/list';
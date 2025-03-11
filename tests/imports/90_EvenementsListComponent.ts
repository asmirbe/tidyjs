// Misc libs
import type { FC }  from 'react';
import { useState } from 'react';
// DS
import {
    YpButton,
    YpDivider,
    YpElement,
} from 'ds';
// @app/dossier
import EvenementDetailComponent from '@app/dossier/components/evenements/EvenementDetailComponent';
import useEvenementsList        from '@app/dossier/providers/evenements/EvenementsListProvider';
import type EvenementModel      from '@app/dossier/models/EvenementModel';
// @library
import { useListRendering } from '@library/utils/list';
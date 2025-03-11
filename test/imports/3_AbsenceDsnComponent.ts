// Misc
// Misc
import { FC }                                   from 'react';
import {
    map,
    last,
    first
}                                               from 'lodash';
import { FontAwesomeIcon }                      from '@fortawesome/react-fontawesome';

// DS
import {
    YpTag,
    YpTable,
    YpElement,
    YpTypography,
    YpSkeletonList
}                                               from 'ds';

// @app/dossier
import ModeDemarrageAbsenceEnum                 from '@app/dossier/models/enums/ModeDemarrageAbsence';
import AbsenceDsnDetailComponent                from '@app/dossier/components/absences/dsn/AbsenceDsnDetailComponent';
import type DsnAtModel                          from '@app/dossier/models/dsn/DsnAtModel';
import type { TDsnAtActions }                   from '@app/dossier/providers/dsn/DsnAtActionsProvider';
import type RessourceModel                      from '@app/dossier/models/RessourceModel';
import type RegroupementAbsenceModel            from '@app/dossier/models/absences/RegroupementAbsenceModel';
import type SalariesAbsencesListModel           from '@app/dossier/models/SalariesAbsencesListModel';
import type { TRegroupementAbsenceAdditionals } from '@app/dossier/providers/absences/RegroupementAbsenceDetailProvider';
import type { TRegroupementAbsenceFormActions } from '@app/dossier/providers/absences/RegroupementAbsenceFormProvider';

// @core
import type {
    TDataProviderReturn,
    TActionProviderReturn
}                                               from '@core/models/ProviderModel';

type TProps = {
    isLoading?: boolean;
    salarie: SalariesAbsencesListModel | null;
    additionals: TRegroupementAbsenceAdditionals;
    dsnAtList?: TDataProviderReturn<DsnAtModel[]>;
    downloadDsnAt: TActionProviderReturn<undefined, TDsnAtActions, RessourceModel, unknown>
    regroupementAbsenceDetail?: TDataProviderReturn<RegroupementAbsenceModel>;
    edition?: TActionProviderReturn<RegroupementAbsenceModel, TRegroupementAbsenceFormActions>;
}

const AbsenceDsnComponent: FC<TProps> = (props) => {

    // Variables
    const {
        edition,
        salarie,
        dsnAtList,
        additionals,
        downloadDsnAt,
        isLoading = true,
        regroupementAbsenceDetail
    } = props;

    const formEntity        = edition?.form?.entity;
    const firstEvenement    = first(formEntity?.evenements);
    const lastEvenement     = last(formEntity?.evenements);

    return (
        <YpElement className='flex flex-col items-center overflow-y-auto p-4 space-y-4 w-full'>
            <YpElement className='flex flex-col space-y-2'>
                <YpElement className='flex justify-center space-x-2'>
                    <YpTypography weight='semibold' size={ 16 }>
                        { `${ salarie?.prenom ?? '' } ${ salarie?.nom ?? '' }` }
                    </YpTypography>
                    <YpTypography weight='semibold' size={ 16 }>
                        { '-' }
                    </YpTypography>
                    <YpTypography weight='semibold' size={ 16 }>
                        { `${ additionals?.typeAbsence?.libelle ?? '' }` }
                    </YpTypography>
                </YpElement>
                <YpElement className='flex justify-center w-full'>
                    <YpElement className='border border-neutral-200 flex items-center p-2 rounded-lg space-x-4'>
                        <YpElement className='flex items-center space-x-2'>
                            <YpTypography
                                size={ 12 }
                                weight='semibold'
                            >
                                { additionals?.getDateDisplayFormat(firstEvenement?.date_debut) }
                            </YpTypography>
                            <YpTag sizeComponent='small' tagColor='neutral'>
                                { ModeDemarrageAbsenceEnum.text(firstEvenement?.demarrage_debut ?? 0) }
                            </YpTag>
                        </YpElement>
                        <FontAwesomeIcon icon={ ['far', 'arrow-right-long'] } />
                        <YpElement className='flex items-center space-x-2'>
                            <YpTypography
                                size={ 12 }
                                weight='semibold'
                            >
                                { additionals?.getDateDisplayFormat(lastEvenement?.date_fin) }
                            </YpTypography>
                            <YpTag sizeComponent='small' tagColor='neutral'>
                                { ModeDemarrageAbsenceEnum.text(lastEvenement?.demarrage_fin ?? 0) }
                            </YpTag>
                        </YpElement>
                    </YpElement>
                </YpElement>
            </YpElement>
            {
                isLoading
                    ? <YpElement className='flex flex-col p-2 w-full'>
                        <YpSkeletonList
                            count={ 3 }
                            size='medium'
                            spacing={ 2 }
                        />
                    </YpElement>
                    : <YpElement className='flex w-full'>
                        <YpElement
                            className='border border-neutral-200 flex flex-col gap-y-2 px-4 py-6 rounded-lg shadow-sm shadow-neutral-200 w-full'
                        >
                            <YpTypography
                                size={ 12 }
                                weight='semibold'
                            >
                                { `DSN ${additionals?.typeAbsence?.libelle}` }
                            </YpTypography>
                            <YpElement className='border border-neutral-200 overflow-auto rounded-lg'>
                                <YpTable className="border-collapse divide-y divide-neutral-200 min-w-full table-auto">
                                    <YpTable.THead className="bg-neutral-100">
                                        <YpTable.Tr>
                                            <YpTable.Th scope="col" className="border-none px-3 py-2 text-start whitespace-nowrap">
                                                <YpTypography size={ 12 } color='neutral-500'>
                                                    { 'Évènement' }
                                                </YpTypography>
                                            </YpTable.Th>
                                            <YpTable.Th scope="col" className="py-2 text-start whitespace-nowrap">
                                                <YpTypography size={ 12 } color='neutral-500'>
                                                    { 'Modalité d\'envoi' }
                                                </YpTypography>
                                            </YpTable.Th>
                                            <YpTable.Th scope="col" className="py-2 text-start whitespace-nowrap">
                                                <YpTypography size={ 12 } color='neutral-500'>
                                                    { 'Statut' }
                                                </YpTypography>
                                            </YpTable.Th>
                                            <YpTable.Th scope="col" className="py-2 text-start whitespace-nowrap">
                                                <YpTypography size={ 12 } color='neutral-500'>
                                                    { 'Nature' }
                                                </YpTypography>
                                            </YpTable.Th>
                                            <YpTable.Th scope="col" className="py-2 text-start whitespace-nowrap">
                                                <YpTypography size={ 12 } color='neutral-500'>
                                                    { 'Version de norme' }
                                                </YpTypography>
                                            </YpTable.Th>
                                            <YpTable.Th scope="col" className="py-2 text-center whitespace-nowrap" />
                                        </YpTable.Tr>
                                    </YpTable.THead>
                                    <YpTable.TBody className="bg-white divide-y divide-neutral-200">
                                        {
                                            dsnAtList?.data && dsnAtList.data.length > 0
                                                ? map(dsnAtList?.data, (dsn, dsnIndex) => (
                                                    <AbsenceDsnDetailComponent
                                                        dsn={ dsn }
                                                        key={ dsnIndex }
                                                        downloadDsnAt={ downloadDsnAt }
                                                        regroupementAbsenceDetail={ regroupementAbsenceDetail?.data }
                                                    />
                                                ))
                                                : <YpTable.Tr className='bg-neutral-50'>
                                                    <YpTable.Td colSpan={ 6 }>
                                                        <YpElement className='bg-white flex justify-center p-2'>
                                                            <YpTypography
                                                                size={ 10 }
                                                                weight='regular'
                                                            >
                                                                { 'Aucune ligne' }
                                                            </YpTypography>
                                                        </YpElement>
                                                    </YpTable.Td>
                                                </YpTable.Tr>
                                        }
                                    </YpTable.TBody>
                                </YpTable>
                            </YpElement>
                        </YpElement>
                    </YpElement>
            }
        </YpElement>
    );
};

export default AbsenceDsnComponent;


import { Factor } from '../../data-environment/workspace/factor/factor';
import { Section } from 'src/app/data-environment/workspace/section/section';

export interface Evidence {
    id: number;
    propositionId: number;
    factor: Factor;
    section: Section;
    userGroupRelationId: number;
    profileId: number;
    groupId: number;
    favorable: number;
    desfavorable: number;
    weight: number;
    confirmed: boolean;
}


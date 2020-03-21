
import { Factor } from '../../data-environment/workspace/factor/factor';
import { Section } from 'src/app/data-environment/workspace/section/section';

export interface Evidence {
    id: number;
    propositionId: number;
    factor: Factor;
    section: Section;
    profileId: number;
    groupId: number;
    favorable: number;
    unfavorable: number;
    weight: number;
    confirmed: boolean;
}


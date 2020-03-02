import { Profile } from '../profile/profile';

export interface Group {
    id: number
    propositionId: number
    description: string
    summary: string
    profiles: Profile[]
}
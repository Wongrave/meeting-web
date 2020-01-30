import { BusinessUnit } from '../business-unit/business-unit';
import { User } from 'src/app/core/user/user';

export interface Department {
    id: number
    description: string
    summary: string
    businessUnit: BusinessUnit
    users: User[]
}
import { Organization } from '../../organizations/organization/organization';
import { Department } from '../department/department';

export interface BusinessUnit {
    id : number
    description : string
    summary : string
    local : string
    organization : Organization
    departments : Department[]
}
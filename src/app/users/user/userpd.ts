import { Department } from 'src/app/organization-environment/management/department/department';

export interface UserPd {

    id:number
	  name:string
    username:string
    password:string
    email:string
    enabled: boolean
    role: string
    departments: Department[]


}

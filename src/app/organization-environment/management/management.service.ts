import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { BusinessUnit } from './business-unit/business-unit';
import { Department } from './department/department';
import { Organization } from '../organizations/organization/organization';
import { UserPd } from 'src/app/users/user/userpd';

const APIBUSINESSUNIT = 'http://177.70.27.122:8080/businessunits'
const APIDEPARTMENT = 'http://177.70.27.122:8080/departments'

@Injectable({ providedIn: 'root' })
export class ManagementService {

    private propositionSubject = new BehaviorSubject<Object>(null);

    constructor(private http: HttpClient) { }

    listFromOrganization(organization: number) {
        return this.http
            .get<BusinessUnit[]>(APIBUSINESSUNIT + '/fromOrganization/' + organization.toString());
    }

    newUnit(local: string, description: string, summary: string, organization: Organization) {
        return this.http.post<BusinessUnit>(APIBUSINESSUNIT + '/new', {local, description, summary, organization}).toPromise();
    }

    deleteUnit(id: number) {
        return this.http.delete(APIBUSINESSUNIT + '/delete' + id, {}).toPromise();

    }

    newDepartment(description: string, summary: string, businessUnit: BusinessUnit) {
        return this.http.post(APIDEPARTMENT + '/new', {description, summary, businessUnit}).toPromise();
    }

    newDepartmentWithUser(description: string, summary: string, businessUnit: BusinessUnit, usersTo: UserPd[]) {
        console.log( {description, summary, businessUnit, usersTo})
        var users = JSON.parse(JSON.stringify(usersTo))
        console.log( {description, summary, businessUnit, users})
        return this.http.post(APIDEPARTMENT + '/new', {description, summary, businessUnit, users }).toPromise();
    }

    deleteDepartment(id: number) {
        return this.http.delete(APIDEPARTMENT + '/delete' + id, {}).toPromise();
    }
}

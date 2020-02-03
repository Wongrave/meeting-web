import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { BusinessUnit } from './business-unit/business-unit';
import { Department } from './department/department'
import { Organization } from '../organizations/organization/organization';

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
        return this.http.post(APIBUSINESSUNIT + '/new', {local, description, summary, organization}).toPromise();
    }

    deleteUnit(id: number) {
        return this.http.post(APIBUSINESSUNIT + '/delete' + id, {}).toPromise();
    
    }

    newDepartment(description: string, summary: string, unit: BusinessUnit) {
        return this.http.post(APIDEPARTMENT + '/new', {description, summary, unit}).toPromise();
    }

    deleteDepartment(id: number) {
        return this.http.post(APIDEPARTMENT + '/delete' + id, {}).toPromise();
    }
}

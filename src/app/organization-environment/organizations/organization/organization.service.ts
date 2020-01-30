import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Organization } from './organization';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

const API = 'http://177.70.27.122:8080/organizations'
const ORGKEY = 'organizationId'

@Injectable({ providedIn: 'root' })
export class OrganizationService {

    organizationId: number

    private organizationSubject = new BehaviorSubject<Organization>(null);

    constructor(private http: HttpClient) { }

    listFromUser(user: number) {

        return this.http
            .get<Organization[]>(API + '/fromUser/' + user);

    }

    selectOrganization(id: number) {

        return this.http
            .get(API + '/' + id,
                { observe: 'body', responseType: 'text' })
            .pipe(map(
                res => {
                    const org = res;
                    this.setOrganization(org.toString());
                }
            ))


    }

    hasOrganization() {
        return !!this.getOrganization();
    }

    setOrganization(organization) {

        window.localStorage.setItem(ORGKEY, organization);
    }

    decodify() {
        const organization = window.localStorage.getItem(ORGKEY);
        const org = JSON.parse(organization) as Organization;
        this.organizationSubject.next(org);
    }

    getOrganization() {
        this.decodify();
        return this.organizationSubject.asObservable();
    }

    getOrganizationId() {
        const organization = window.localStorage.getItem(ORGKEY)
        const org = JSON.parse(organization) as Organization
        return org.id

    }

    removeOrganization() {
        window.localStorage.removeItem(ORGKEY);
    }

    newOrganization(description: string, summary: string, active: true) {

        return this.http.post(API + '/new', { description, summary, active }).subscribe();

    }

}
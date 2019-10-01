import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Organization } from './organization';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

const API = 'http://localhost:8080/organizations'
const PROPKEY = 'organizationId'

@Injectable({ providedIn: 'root' })
export class OrganizationService {

    private organizationSubject = new BehaviorSubject<Organization>(null);

    constructor(private http: HttpClient) { }

    listFromUser(user: string) {

        return this.http
            .get<Organization[]>(API + '/fromUser/' + user);

    }

    selectOrganization(id: number) {

        return this.http
            .get(API + '/' + id, 
            { observe: 'body', responseType: 'text'} )
            .pipe(map(
                res => {
                    const org = res;
                    this.setOrganization(org.toString());
                }
            ))
            

    }

    hasOrganization(){
        return !!this.getOrganization();
    }

    setOrganization(organization){
        
        window.localStorage.setItem(PROPKEY, organization);
    }

    decodify(){
        const organization = window.localStorage.getItem(PROPKEY);
        const prop = JSON.parse(organization) as Organization;
        this.organizationSubject.next(prop);
    }

    getOrganization() {
        this.decodify();
        return this.organizationSubject.asObservable();
    }

    removeOrganization() {
        window.localStorage.removeItem(PROPKEY);
    }

    newOrganization( description: string, summary: string, active: true){
        
        return this.http.post(API+'/new', { description, summary, active }).subscribe();

    }

}
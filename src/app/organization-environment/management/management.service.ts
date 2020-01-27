import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { BusinessUnit } from './business-unit/business-unit';

const APIFACTOR = 'http://localhost:8080/factors'
const APISECTION = 'http://localhost:8080/sections'

@Injectable({ providedIn: 'root' })
export class ManagementService {

    private propositionSubject = new BehaviorSubject<Object>(null);

    constructor(private http: HttpClient) { }

    listFromProposition(proposition: number) {
        return this.http
            .get<BusinessUnit[]>(APIFACTOR + '/fromProposition/' + proposition.toString());
    }

}
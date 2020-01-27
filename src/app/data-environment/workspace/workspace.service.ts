import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { Factor } from './factor/factor';

const APIFACTOR = 'http://177.70.27.122:8080/factors'
const APISECTION = 'http://177.70.27.122:8080/sections'

@Injectable({ providedIn: 'root' })
export class WorkspaceService {

    private propositionSubject = new BehaviorSubject<Object>(null);

    constructor(private http: HttpClient) { }

    listFromProposition(proposition: number) {
        return this.http
            .get<Factor[]>(APIFACTOR + '/fromProposition/' + proposition.toString());
    }

}
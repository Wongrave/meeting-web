import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

const APIFACTOR = 'http://localhost:8080/factors'
const APISECTION = 'http://localhost:8080/sections'

@Injectable({ providedIn: 'root' })
export class WorkspaceService {

    private propositionSubject = new BehaviorSubject<Object>(null);

    constructor(private http: HttpClient) { }

    listFromProposition(user: string) {

    }

}
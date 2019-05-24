import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Proposition } from './proposition';

const API = 'http://localhost:8080/meeting-web'

@Injectable({ providedIn: 'root' })
export class PropositionService {

    constructor(private http: HttpClient) { }

    listFromUser(userID: number) {

        return this.http
            .get<Proposition[]>(API + '/listaProposicoes');

    }

}
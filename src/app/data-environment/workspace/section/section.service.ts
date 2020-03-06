import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { Factor } from '../factor/factor';
import { Proposition } from '../../propositions/proposition/proposition';
import { Section } from './section';

const APISECTION = 'http://177.70.27.122:8080/sections'

@Injectable({ providedIn: 'root' })

export class SectionService {

    private propositionSubject = new BehaviorSubject<Object>(null);

    constructor(private http: HttpClient) { }

    newSection(tag: string, description: string, summary: string, selected: boolean, factor: Factor) {
        return this.http.post(APISECTION + '/new', { tag, description, summary, selected, factor }).toPromise();
    }

    deleteSection(id: number) {

      //ALTERAR MÉTODO NO SERVIDOR PARA ACEITAR METHOD DELETE

      return this.http.delete(APISECTION+'/delete/'+id, {}).toPromise();

    }
}

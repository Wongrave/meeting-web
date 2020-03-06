import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Group } from './group';

const API = 'http://177.70.27.122:8080/groups'


@Injectable({ providedIn: 'root' })
export class GroupService {

    constructor(private http: HttpClient) { }

    newGroup(description: string, propositionId: number) {
      return this.http.post<Group>(API + '/new', {description, propositionId}).toPromise();
    }

    getGroups(propositionId: number) {
      return this.http.get<Group[]>(API+'/from/'+propositionId, {})

    }
}

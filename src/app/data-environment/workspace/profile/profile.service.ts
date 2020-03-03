import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { Proposition } from '../../propositions/proposition/proposition';
import { Profile } from './profile';
import { UserPd } from '../../../users/user/userpd'

const APIPROFILE = 'http://177.70.27.122:8080/profiles';

@Injectable({ providedIn: 'root' })
export class ProfileService {

    private propositionSubject = new BehaviorSubject<Object>(null);

    constructor(private http: HttpClient) { }

    changeAdmin(id: number, admin: boolean) {
      return this.http.put(APIPROFILE+'/changeAdmin/'+id, { id, admin }).subscribe();
    }

    changeExpert(id: number, expert: boolean) {
      return this.http.put(APIPROFILE+'/changeExpert/'+id, { id, expert }).subscribe();
    }

    changeAnalyst(id: number, analyst: boolean) {
      return this.http.put(APIPROFILE+'/changeAnalyst/'+id, { id, analyst }).subscribe();
    }

    addProfile( propositionId: number, userId: number, name: string ) {
      return this.http.post<Profile>(APIPROFILE+'/new', { propositionId, userId, name }).toPromise();
    }

    getSuggestedUsers(propositionId:number) {
      return this.http.get<UserPd[]>(APIPROFILE+'/suggestedUsers/'+propositionId, {});
    }

    getProfiles(propositionId: number){
      return this.http.get<Profile[]>(APIPROFILE+'/from/'+propositionId, {})

    }

    deleteProfile(id:number) {
      return this.http.delete(APIPROFILE+'/delete/'+id, {}).toPromise();

    }
}

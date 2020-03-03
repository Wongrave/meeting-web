import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { UserService } from 'src/app/core/user/user.service';
import { UserPd } from '../../../users/user/userpd';
import { Proposition } from '../../propositions/proposition/proposition';
import { PropositionService } from '../../propositions/proposition/proposition.service';
import { ProfileService } from './profile.service'
import { Profile } from '../profile/profile';


@Component({
  styleUrls: ['./profile.component.css'],
  selector: 'pd-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {

  proposition: Proposition;
  changeAdminProfile = false;
  changeExpertProfile = false;
  changeAnalystProfile = false;
  username: string;

  profiles: Profile[] = [];
  suggestedUsers: UserPd[] = [];




  constructor(private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private userService: UserService,
    private propositionService: PropositionService,
    private profileService: ProfileService) { }


    changeAdmin( id: number, checked: boolean ) {

      this.profileService.changeAdmin( id, checked );

    }

    changeExpert( id: number, checked: boolean ) {

      this.profileService.changeExpert( id, checked );

    }

    changeAnalyst( id: number, checked: boolean ) {

      this.profileService.changeAnalyst( id, checked );

    }

    async addProfile(userId: number, name:string) {

      await this.profileService.addProfile( this.proposition.id, userId, name);

      this.router.navigateByUrl('/refresh', {skipLocationChange: true}).then(() => {
        console.log(decodeURI(this.location.path()))
        this.router.navigate([decodeURI(this.location.path())])
      });

    }

    async deleteProfile(id: number) {

      await this.profileService.deleteProfile( id );

      this.router.navigateByUrl('/refresh', {skipLocationChange: true}).then(() => {
        console.log(decodeURI(this.location.path()))
        this.router.navigate([decodeURI(this.location.path())])
      });

    }


  ngOnInit(): void {

    this.username = this.userService.getUsername();
    this.propositionService.getProposition().subscribe(
      proposition => this.proposition = proposition
    )

    this.profileService.getSuggestedUsers( this.proposition.id).subscribe(
      suggestedUsers => this.suggestedUsers = suggestedUsers
    )

    this.profileService.getProfiles(this.proposition.id).subscribe(
      profiles => this.profiles = profiles
    )
    console.log(this.profiles)

  }

}

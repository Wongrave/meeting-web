import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/auth/auth.service';
import { formatDate, Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/core/user/user.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { GroupService } from './group.service';
import { PropositionService } from '../../propositions/proposition/proposition.service';
import { Proposition } from '../../propositions/proposition/proposition';
import { Group } from './group';
import { ProfileService } from '../profile/profile.service';
import { Profile } from '../profile/profile';
import { UserPd } from '../../../users/user/userpd';

@Component({
  styleUrls: ['./group.component.css'],
  selector: 'pd-group',
  templateUrl: './group.component.html'
})
export class GroupComponent implements OnInit {

  proposition: Proposition
  username: string
  closeResult: string;
  profile: Profile;

  groups: Group[] = []
  newGroupName = "Novo Grupo"
  newGroupSummary = ""

  suggestedProfiles: Profile[] = []


    constructor(private modalService: NgbModal,
      private router: Router,
      private location: Location,
      private propositionService: PropositionService,
      private groupService: GroupService,
      private profileService: ProfileService
    ) { }

    open(content) {
      this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
      this.groupService.getSuggestedProfiles( this.profile.id).subscribe(
        suggestedProfiles => this.suggestedProfiles = suggestedProfiles
      )
    }

    async addToGroup(pId: number, gId: number) {
      await this.groupService.addToGroup(pId, gId);
        
    }

    private getDismissReason(reason: any): string {
      if (reason === ModalDismissReasons.ESC) {
        return 'by pressing ESC';
      } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
        return 'by clicking on a backdrop';
      } else {
        return  `with: ${reason}`;
      }
    }

    async newGroup(){
        await this.groupService.newGroup(this.newGroupName, this.proposition.id).then(group => this.groups.push(group))
        this.modalService.dismissAll();
    }

    visible = false;
    toggle() {
      this.visible = !this.visible;
    }

    ngOnInit(): void {
   
        this.propositionService.getProposition().subscribe(
        proposition => this.proposition = proposition
        )

        this.groupService.getGroups(this.proposition.id).subscribe(
        groups => this.groups = groups
        )

    }

}

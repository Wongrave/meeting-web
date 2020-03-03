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

@Component({
  styleUrls: ['./group.component.css'],
  selector: 'pd-group',
  templateUrl: './group.component.html'
})
export class GroupComponent implements OnInit {

  proposition: Proposition
  username: string

  groups: Group[] = []
  newGroupName = "Novo Grupo"

    constructor(
      private router: Router,
      private location: Location,
      private propositionService: PropositionService,
      private groupService: GroupService
    ) { }

    async newGroup(){
        await this.groupService
        .newGroup(this.newGroupName, this.proposition.id)

        this.router.navigateByUrl('/refresh', { skipLocationChange: true }).then(() => {
        console.log(decodeURI(this.location.path()))
        this.router.navigate([decodeURI(this.location.path())])
        })
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

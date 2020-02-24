import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/auth/auth.service';
import { formatDate, Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/core/user/user.service';
import { UserPd } from '../../users/user/userpd';
import { Proposition } from '../propositions/proposition/proposition';
import { PropositionService } from '../propositions/proposition/proposition.service';
import { Factor } from './factor/factor';
import { WorkspaceService } from './workspace.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Section } from './section/section';
import { Profile } from './profile/profile'

@Component({
  styleUrls: ['./workspace.component.css'],
  selector: 'pd-workspace',
  templateUrl: './workspace.component.html'
})
export class WorkspaceComponent implements OnInit {

  proposition: Proposition;
  newFactorTag = "";
  newFactorDescription = "";
  newFactorSummary = "";
  newFactorSelected = false;
  newSectionTag = "";
  newSectionDescription = "";
  newSectionSummary = "";
  newSectionSelected = false;
  changeAdminProfile = false;
  changeExpertProfile = false;
  changeAnalystProfile = false;
  username: string;
  factors: Factor[] = [];
  profiles: Profile[] = [];
  users: UserPd[] = [];




  constructor(private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private location: Location,
    private userService: UserService,
    private propositionService: PropositionService,
    private workspaceService: WorkspaceService,
    private modalService: NgbModal) { }

  closeResult: string;

  open(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  async newFactor(newFactorTag: string, newFactorDescription: string, newFactorSummary: string, newFactorSelected: boolean) {

    await this.workspaceService
      .newFactor(newFactorTag, newFactorDescription, newFactorSummary, newFactorSelected, this.proposition);

    this.modalService.dismissAll();

    this.router.navigateByUrl('/refresh', { skipLocationChange: true }).then(() => {
      console.log(decodeURI(this.location.path()))
      this.router.navigate([decodeURI(this.location.path())])
    });

  }

    async deleteFactor(id: number) {

      await this.workspaceService
        .deleteFactor(id)


    this.router.navigateByUrl('/refresh', { skipLocationChange: true }).then(() => {
      console.log(decodeURI(this.location.path()))
      this.router.navigate([decodeURI(this.location.path())])
    });

  }

  async newSection(newSectionTag: string, newSectionDescription: string, newSectionSummary: string, newSectionSelected: boolean, factor: Factor) {

    await this.workspaceService
      .newSection(newSectionTag, newSectionDescription, newSectionSummary, newSectionSelected, factor);

    this.router.navigateByUrl('/refresh', { skipLocationChange: true }).then(() => {
      console.log(decodeURI(this.location.path()))
      this.router.navigate([decodeURI(this.location.path())])
    });

  }

    async deleteSection(id: number) {

      await this.workspaceService
              .deleteSection(id)

      this.router.navigateByUrl('/refresh', {skipLocationChange: true}).then(() => {
        console.log(decodeURI(this.location.path()))
        this.router.navigate([decodeURI(this.location.path())])
      });

    }

    visible = false;
    toggle() {
      this.visible = !this.visible;
    }

    changeAdmin( id: number, checked: boolean ) {

      this.workspaceService.changeAdmin( id, checked );

    }

    changeExpert( id: number, checked: boolean ) {

      this.workspaceService.changeAdmin( id, checked );

    }

    changeAnalyst( id: number, checked: boolean ) {

      this.workspaceService.changeAdmin( id, checked );

    }

    addProfile( propositionId:number, userId: number) {

      this.workspaceService.addProfile( propositionId, userId )

    }


  ngOnInit(): void {
    this.username = this.userService.getUsername();
    this.propositionService.getProposition().subscribe(
      proposition => this.proposition = proposition
    )

    this.workspaceService.listFromProposition(this.proposition.id).subscribe(
      factors => this.factors = factors
    )

  }

}

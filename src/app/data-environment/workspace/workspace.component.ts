import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/auth/auth.service';
import { formatDate, Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/core/user/user.service';
import { User } from 'src/app/core/user/user';
import { Proposition } from '../propositions/proposition/proposition';
import { PropositionService } from '../propositions/proposition/proposition.service';
import { Factor } from './factor/factor';
import { WorkspaceService } from './workspace.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

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
  username: string;
  factors: Factor[] = []


  constructor(private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private location: Location,

    private userService: UserService,
    private propositionService: PropositionService,
    private workspaceService: WorkspaceService,
    private modalService: NgbModal ){ }

    closeResult: string;

    open(content) {
      this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
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
        return  `with: ${reason}`;
      }
    }

    newFactor(newFactorTag: string, newFactorDescription: string, newFactorSummary: string, newFactorSelected: boolean) {

      this.workspaceService
        .newFactor(newFactorTag, newFactorDescription, newFactorSummary, newFactorSelected, this.proposition);

        this.modalService.dismissAll();

        this.router.navigateByUrl('/refresh', {skipLocationChange: true}).then(() => {
          console.log(decodeURI(this.location.path()))
          this.router.navigate([decodeURI(this.location.path())])
        });

    }
    newSection(newSectionTag: string, newSectionDescription: string, newSectionSummary: string, newSectionSelected: boolean, factor: Factor){
      this.workspaceService.newSection(newSectionTag, newSectionDescription, newSectionSummary, newSectionSelected, factor)
      this.router.navigateByUrl('/refresh', {skipLocationChange: true}).then(() => {
        console.log(decodeURI(this.location.path()))
        this.router.navigate([decodeURI(this.location.path())])});
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

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/auth/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/core/user/user.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Organization } from '../organizations/organization/organization';

@Component({
  styleUrls: ['./workspace.component.css'],
  selector: 'pd-workspace',
  templateUrl: './workspace.component.html'
})
export class WorkspaceComponent implements OnInit {

  organization: Organization;
  username: string;
  factors: Factor[] = []

  constructor(private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private auth: AuthService,
    private formBuilder: FormBuilder,
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

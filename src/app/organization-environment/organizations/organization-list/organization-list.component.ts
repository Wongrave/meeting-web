import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Organization } from '../organization/organization';
import { OrganizationService } from '../organization/organization.service';
import { formatDate, Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/core/user/user.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { User } from 'src/app/core/user/user';
import { ManagementService } from '../../management/management.service';
import { BusinessUnit } from '../../management/business-unit/business-unit'

@Component({
  selector: 'app-organization-list',
  templateUrl: './organization-list.component.html',
})
export class OrganizationListComponent implements OnInit {

  organizations: Organization[] = [];

  newDescription = "";
  newSummary = "";
  newUnitLocal = "";
  newUnitDescription = "";
  newUnitSummary = "";
  newDepartmentDescription = "";
  newDepartmentSummary = "";
  organization: Organization;
  unit: BusinessUnit;

  newOrganizationForm: FormGroup;

  closeResult: string;
  username: string;
  userId: number;
  organizationId: number;

  constructor(
    private router: Router,
    private location: Location,
    private auth: AuthService,
    private organizationService: OrganizationService,
    private userService: UserService,
    private modalService: NgbModal,
    private managementService: ManagementService
    ){ }


  selectOrganization(id: number){

    this.userService.getUser().subscribe(user => this.username = user.username, err => console.log(err.message))

    this.organizationService.selectOrganization(id)
      .subscribe(
        () => this.router.navigate(['propositions/fromUser', this.username]),

        err => {
            console.log('erro na escolha')
        }
      )
    console.log(id);

  }

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


  async newOrganization(description: string, summary: string, localUnit: string, descriptionUnit: string, summaryUnit: string, descriptionDepartment: string, summaryDepartment: string) {

    await this.organizationService
      .newOrganization(description, summary, true).then(organization => this.organization = organization)

      await this.managementService
        .newUnit(localUnit, descriptionUnit, summaryUnit, this.organization).then(unit => this.unit = unit);

      await this.managementService
        .newDepartment(descriptionDepartment, summaryDepartment, this.unit).then(
          object => console.log("adicionou")
        );




  }

  ngOnInit() {

    // this.newOrganizationForm = this.formBuilder.group({
    //   newDescription: ['', Validators.required],
    //   newSummary: ['', Validators.required],
    //   newDate: ['', Validators.required],
    //   newCollection: ['', Validators.required]
    // });

    if(!!this.auth.username) {
      this.userId = this.userService.getUserId();
    } else {
      this.userService.getUser().subscribe(user => this.userId = user.sub, err => console.log(err.message));
    }

    this.organizationService
      .listFromUser(this.userId)
      .subscribe(organizations => this.organizations = organizations, err => console.log(err.message));

  }

}

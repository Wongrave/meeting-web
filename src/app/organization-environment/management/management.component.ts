import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/auth/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/core/user/user.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Organization } from '../organizations/organization/organization';
import { ManagementService } from './management.service'
import { OrganizationService } from '../organizations/organization/organization.service'
import { BusinessUnit } from './business-unit/business-unit'
import { Department } from './department/department'
import { Location } from '@angular/common'

@Component({
  selector: 'pd-management',
  templateUrl: './management.component.html'
})
export class ManagementComponent implements OnInit {

  username: string;
  organization: Organization;
  newUnitLocal = "";
  newUnitDescription = "";
  newUnitSummary = "";
  units: BusinessUnit[] = [];

  newDepartmentDescription = "";
  newDepartmentSummary = "";

    constructor(private route: ActivatedRoute,
        private router: Router,
        private http: HttpClient,
        private auth: AuthService,
        private formBuilder: FormBuilder,
        private location: Location,
        private userService: UserService,
        private managementService: ManagementService,
        private organizationService: OrganizationService,
        private modalService: NgbModal) { } 

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

    async newUnit(local: string, description: string, summary: string, organization: Organization) {
        await this.managementService
            .newUnit(local, description, summary, organization);

        this.modalService.dismissAll();

        this.router.navigateByUrl('/refresh', { skipLocationChange: true }).then(() => {
            console.log(decodeURI(this.location.path()))
            this.router.navigate([decodeURI(this.location.path())])
        })
    }

    async deleteUnit(id: number) {
        await this.managementService
            .deleteUnit(id);

        this.router.navigateByUrl('/refresh', { skipLocationChange: true }).then(() => {
            console.log(decodeURI(this.location.path()))
            this.router.navigate([decodeURI(this.location.path())])
        })
    }

    async newDepartment(description: string, summary: string, unit: BusinessUnit) {
        await this.managementService
            .newDepartment(description, summary, unit);

        this.router.navigateByUrl('/refresh', { skipLocationChange: true }).then(() => {
            console.log(decodeURI(this.location.path()))
            this.router.navigate([decodeURI(this.location.path())])
        })
    }

    async deleteDepartment(id: number) {
        await this.managementService
            .deleteDepartment(id);

        this.router.navigateByUrl('/refresh', { skipLocationChange: true }).then(() => {
            console.log(decodeURI(this.location.path()))
            this.router.navigate([decodeURI(this.location.path())])
        })
    }

    visible = false;
    toggle() {
      this.visible = !this.visible;
    }

    ngOnInit(): void {
        this.username = this.userService.getUsername();

        this.organizationService.getOrganization().subscribe(
          organization => this.organization = organization
        )
      
        this.managementService.listFromOrganization(this.organization.id).subscribe(
          units => this.units = units
        )

    



  }

}

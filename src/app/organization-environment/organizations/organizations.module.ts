import { NgModule } from "@angular/core";
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { OrganizationComponent } from './organization/organization.component';
import { OrganizationListComponent } from './organization-list/organization-list.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';

@NgModule({
    declarations: [ 
      OrganizationComponent, OrganizationListComponent 
    ],
    imports: [
      HttpClientModule,
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      AngularFontAwesomeModule,
    ],
    exports: [
        OrganizationComponent
    ]
  })
export class OrganizationsModule{

}
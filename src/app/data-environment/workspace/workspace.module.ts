import { NgModule } from "@angular/core";
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WorkspaceComponent } from './workspace.component';
import { ProfileModule } from './profile/profile.module'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { from } from 'rxjs';

@NgModule({
    declarations: [
        WorkspaceComponent
    ],
    imports: [
      HttpClientModule,
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      NgbModule,
      AngularFontAwesomeModule,
      ProfileModule
    ],
    exports: [
        WorkspaceComponent
    ]
  })
export class WorkspaceModule{

}

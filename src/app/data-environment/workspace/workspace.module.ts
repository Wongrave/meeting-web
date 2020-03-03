import { NgModule } from "@angular/core";
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WorkspaceComponent } from './workspace.component';
import { ProfileModule } from './profile/profile.module'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { from } from 'rxjs';
import { FactorModule } from './factor/factor.module';
import { GroupComponent } from './group/group.component';

@NgModule({
    declarations: [
        WorkspaceComponent,
        GroupComponent
    ],
    imports: [
      HttpClientModule,
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      NgbModule,
      AngularFontAwesomeModule,
      ProfileModule,
      FactorModule
    ],
    exports: [
        WorkspaceComponent,
        GroupComponent
    ]
  })
export class WorkspaceModule{

}

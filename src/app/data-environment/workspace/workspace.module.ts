import { NgModule } from "@angular/core";
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WorkspaceComponent } from './workspace.component';
import { ProfileModule } from './profile/profile.module'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { FactorModule } from './factor/factor.module';
import { GroupModule } from './group/group.module';
import { SectionComponent } from './section/section.component';

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
      ProfileModule,
      FactorModule,
      GroupModule,
    ],
    exports: [
        WorkspaceComponent,
    ]
  })
export class WorkspaceModule{

}

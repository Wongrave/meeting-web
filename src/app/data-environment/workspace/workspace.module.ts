import { NgModule } from "@angular/core";
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WorkspaceComponent } from './workspace.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { FactorModule } from './factor/factor.module';

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
      FactorModule
    ],
    exports: [
        WorkspaceComponent
    ]
  })
export class WorkspaceModule{

}

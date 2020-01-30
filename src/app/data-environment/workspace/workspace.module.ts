import { NgModule } from "@angular/core";
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WorkspaceComponent } from './workspace.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
<<<<<<< HEAD
import { AngularFontAwesomeModule } from 'angular-font-awesome'
=======
import { AngularFontAwesomeModule } from 'angular-font-awesome';
>>>>>>> a22b52f0d188844e9a8c55896f3a8587fd426f8d

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
    ],
    exports: [
        WorkspaceComponent
    ]
  })
export class WorkspaceModule{

}

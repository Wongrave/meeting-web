import { NgModule } from "@angular/core";
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WorkspaceComponent } from './workspace.component';

@NgModule({
    declarations: [ 
        WorkspaceComponent
    ],
    imports: [
      HttpClientModule,
      CommonModule,
      FormsModule,
      ReactiveFormsModule
    ],
    exports: [
        WorkspaceComponent
    ]
  })
export class WorkspaceModule{

}
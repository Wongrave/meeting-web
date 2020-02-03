import { NgModule } from "@angular/core";
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder } from '@angular/forms'
import { CommonModule } from '@angular/common';
import { ManagementComponent } from './management.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';

@NgModule({
    declarations: [
        ManagementComponent
    ],
    imports: [ 
        CommonModule, 
        FormsModule,
        ReactiveFormsModule,
        AngularFontAwesomeModule,
    ],
    exports: [
        ManagementComponent
    ]
})
export class ManagementModule { }

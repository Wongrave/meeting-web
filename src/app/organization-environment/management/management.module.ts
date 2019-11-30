import { NgModule } from "@angular/core";
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms'
import { CommonModule } from '@angular/common';
import { ManagementComponent } from './management.component';

@NgModule({
    declarations: [
        ManagementComponent
    ],
    imports: [ 
        CommonModule, 
        ReactiveFormsModule 
    ],
    exports: [
        ManagementComponent
    ]
})
export class ManagementModule { }
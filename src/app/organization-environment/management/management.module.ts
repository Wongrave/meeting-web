import { NgModule } from "@angular/core";
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms'
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [
        ManagementComponent
    ],
    imports: [ 
        CommonModule, 
        ReactiveFormsModule 
    ],
    exports: [
        ExpertComponent
    ]
})
export class ExpertModule { }
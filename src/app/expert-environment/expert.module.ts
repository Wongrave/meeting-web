import { NgModule } from "@angular/core";
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms'
import { CommonModule } from '@angular/common';
import { ExpertComponent } from './expert.component';

@NgModule({
    declarations: [
        ExpertComponent
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
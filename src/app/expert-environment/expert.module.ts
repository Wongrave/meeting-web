import { NgModule } from "@angular/core";
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms'
import { CommonModule } from '@angular/common';
import { ExpertComponent } from './expert.component';
import { ValueComponent } from './value/value.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';

@NgModule({
    declarations: [
        ExpertComponent,
        ValueComponent
    ],
    imports: [ 
        CommonModule, 
        ReactiveFormsModule,
        AngularFontAwesomeModule
    ],
    exports: [
        ExpertComponent
    ]
})
export class ExpertModule { }

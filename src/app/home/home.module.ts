import { NgModule } from "@angular/core";
import { SigninComponent } from './signin/signin.component';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms'

@NgModule({
    declarations: [SigninComponent],
    imports: [ReactiveFormsModule ]
})
export class HomeModule { }
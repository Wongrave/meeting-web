import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserComponent } from './users/user/user.component';
import { PropositionFormComponent } from './data-environment/propositions/proposition-form/proposition-form.component';
import { PropositionListComponent } from './data-environment/propositions/proposition-list/proposition-list.component';
import { PropositionComponent } from './data-environment/propositions/proposition/proposition.component';
import { SigninComponent } from './home/signin/signin.component';

const routes: Routes = [
    { path: '', component: SigninComponent },
    { path: 'user/:userName', component: UserComponent }, 
    { path: 'proposition/add', component: PropositionComponent },
    { path: 'users/84', component: PropositionListComponent }, 
    
    
];

@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule { }
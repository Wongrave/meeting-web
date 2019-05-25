import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserComponent } from './users/user/user.component';
import { PropositionFormComponent } from './data-environment/propositions/proposition-form/proposition-form.component';
import { PropositionListComponent } from './data-environment/propositions/proposition-list/proposition-list.component';

const routes: Routes = [
    { path: 'user/84', component: PropositionListComponent }, 
    { path: 'proposition/add', component: PropositionFormComponent },
    { path: 'users/84', component: UserComponent }, 
    
];

@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule { }
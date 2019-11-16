import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserComponent } from './users/user/user.component';
import { PropositionFormComponent } from './data-environment/propositions/proposition-form/proposition-form.component';
import { PropositionListComponent } from './data-environment/propositions/proposition-list/proposition-list.component';
import { PropositionComponent } from './data-environment/propositions/proposition/proposition.component';
import { SigninComponent } from './home/signin/signin.component';
import { ResultComponent } from './analysis-environment/results/result/result.component';
import { HomeComponent } from './home/home.component';
import { OrganizationListComponent } from './organization-environment/organizations/organization-list/organization-list.component';
import { WorkspaceComponent } from './data-environment/workspace/workspace.component';
import { AuthGuard } from './core/auth/auth.guard';
import { ExpertComponent } from './expert-environment/expert.component';
import { RefreshComponent } from './refresh/refresh.component';

const routes: Routes = [
    { 
        path: '', 
        component: SigninComponent,
        canActivate: [AuthGuard]
    },
    { 
        path: 'user/:userName', 
        component: UserComponent 
    }, 
    { 
        path: 'proposition/add', 
        component: PropositionComponent 
    },
    { 
        path: 'propositions/fromUser/:username', 
        component: PropositionListComponent 
    },
    { 
        path: 'propositions/fromUser/', 
        component: PropositionListComponent 
    },
    { 
        path: 'organizations/fromUser/:username', 
        component: OrganizationListComponent 
    },
    { 
        path: 'users/84', 
        component: PropositionListComponent 
    }, 
    { 
        path: 'result', 
        component: ResultComponent 
    },
    { 
        path: 'home', 
        component: HomeComponent 
    },
    { 
        path: 'dashboard', 
        component: WorkspaceComponent 
    },
    { 
        path: 'evidences/fromUser/:username', 
        component: ExpertComponent 
    },
    { 
        path: 'refresh', 
        component: RefreshComponent 
    },
    
];

@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule { }
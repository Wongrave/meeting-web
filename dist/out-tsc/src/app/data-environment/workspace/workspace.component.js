import * as tslib_1 from "tslib";
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/auth/auth.service';
import { FormBuilder } from '@angular/forms';
import { UserService } from 'src/app/core/user/user.service';
import { PropositionService } from '../propositions/proposition/proposition.service';
import { WorkspaceService } from './workspace.service';
var WorkspaceComponent = /** @class */ (function () {
    function WorkspaceComponent(route, router, http, auth, formBuilder, userService, propositionService, workspaceService) {
        this.route = route;
        this.router = router;
        this.http = http;
        this.auth = auth;
        this.formBuilder = formBuilder;
        this.userService = userService;
        this.propositionService = propositionService;
        this.workspaceService = workspaceService;
        this.factors = [];
    }
    WorkspaceComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.username = this.userService.getUsername();
        this.propositionService.getProposition().subscribe(function (proposition) { return _this.proposition = proposition; });
        this.workspaceService.listFromProposition(this.proposition.id).subscribe(function (factors) { return _this.factors = factors; });
    };
    WorkspaceComponent = tslib_1.__decorate([
        Component({
            styleUrls: ['./workspace.component.css'],
            selector: 'pd-workspace',
            templateUrl: './workspace.component.html'
        }),
        tslib_1.__metadata("design:paramtypes", [ActivatedRoute,
            Router,
            HttpClient,
            AuthService,
            FormBuilder,
            UserService,
            PropositionService,
            WorkspaceService])
    ], WorkspaceComponent);
    return WorkspaceComponent;
}());
export { WorkspaceComponent };
//# sourceMappingURL=workspace.component.js.map
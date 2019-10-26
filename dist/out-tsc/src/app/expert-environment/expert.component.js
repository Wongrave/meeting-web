import * as tslib_1 from "tslib";
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { UserService } from 'src/app/core/user/user.service';
import { PropositionService } from '../data-environment/propositions/proposition/proposition.service';
import { ExpertService } from './expert.service';
var ExpertComponent = /** @class */ (function () {
    function ExpertComponent(route, router, expertService, auth, propositionService, userService) {
        this.route = route;
        this.router = router;
        this.expertService = expertService;
        this.auth = auth;
        this.propositionService = propositionService;
        this.userService = userService;
        this.factors = [];
        this.gce = Math.round(Math.random() * 100);
        this.gin = Math.round(Math.random() * 100);
    }
    ExpertComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.username = this.userService.getUsername();
        this.propositionService.getProposition().subscribe(function (proposition) { return _this.proposition = proposition; });
        this.expertService.listFromProposition(this.proposition.id).subscribe(function (factors) { return _this.factors = factors; });
    };
    ExpertComponent = tslib_1.__decorate([
        Component({
            selector: 'pd-evidences',
            templateUrl: './expert.component.html',
            styleUrls: ['./expert.component.css']
        }),
        tslib_1.__metadata("design:paramtypes", [ActivatedRoute,
            Router,
            ExpertService,
            AuthService,
            PropositionService,
            UserService])
    ], ExpertComponent);
    return ExpertComponent;
}());
export { ExpertComponent };
//# sourceMappingURL=expert.component.js.map
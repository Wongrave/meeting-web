import * as tslib_1 from "tslib";
import { Component } from '@angular/core';
import { PropositionService } from '../data-environment/propositions/proposition/proposition.service';
import { Router } from '@angular/router';
import { UserService } from '../core/user/user.service';
import { TokenService } from '../core/token/token.service';
import { OrganizationService } from '../organization-environment/organizations/organization/organization.service';
var NavbarComponent = /** @class */ (function () {
    function NavbarComponent(propositionService, router, userService, organizationService, tokenService) {
        var _this = this;
        this.propositionService = propositionService;
        this.router = router;
        this.userService = userService;
        this.organizationService = organizationService;
        this.tokenService = tokenService;
        this.name = 'Meeting';
        this.proposition$ = propositionService.getProposition();
        this.proposition$.subscribe(function (proposition) { return _this.proposition = proposition; });
        this.username = this.userService.getUsername();
    }
    NavbarComponent.prototype.changeProposition = function () {
        this.propositionService.removeProposition();
        this.proposition = null;
        this.router.navigate(['propositions/fromUser', this.username]);
    };
    NavbarComponent.prototype.evaluate = function () {
    };
    NavbarComponent.prototype.disconnect = function () {
        this.propositionService.removeProposition();
        this.organizationService.removeOrganization();
        this.tokenService.removeToken();
        this.router.navigate(['/']);
    };
    NavbarComponent = tslib_1.__decorate([
        Component({
            selector: "pd-navbar",
            templateUrl: "navbar.component.html"
        }),
        tslib_1.__metadata("design:paramtypes", [PropositionService,
            Router,
            UserService,
            OrganizationService,
            TokenService])
    ], NavbarComponent);
    return NavbarComponent;
}());
export { NavbarComponent };
//# sourceMappingURL=navbar.component.js.map
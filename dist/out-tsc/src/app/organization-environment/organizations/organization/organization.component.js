import * as tslib_1 from "tslib";
import { Component } from '@angular/core';
import { OrganizationService } from './organization.service';
var OrganizationComponent = /** @class */ (function () {
    function OrganizationComponent(organizationService) {
        this.organizationService = organizationService;
        this.organizations = [];
    }
    OrganizationComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.organizationService
            .listFromUser(0)
            .subscribe(function (organizations) { return _this.organizations = organizations; }, function (err) { return console.log(err.message); });
    };
    OrganizationComponent = tslib_1.__decorate([
        Component({
            selector: 'pd-organization',
            templateUrl: 'organization.component.html'
        }),
        tslib_1.__metadata("design:paramtypes", [OrganizationService])
    ], OrganizationComponent);
    return OrganizationComponent;
}());
export { OrganizationComponent };
//# sourceMappingURL=organization.component.js.map
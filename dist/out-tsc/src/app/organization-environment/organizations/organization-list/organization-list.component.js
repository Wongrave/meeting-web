import * as tslib_1 from "tslib";
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/auth/auth.service';
import { OrganizationService } from '../organization/organization.service';
import { FormBuilder } from '@angular/forms';
import { UserService } from 'src/app/core/user/user.service';
var OrganizationListComponent = /** @class */ (function () {
    function OrganizationListComponent(route, router, http, auth, organizationService, formBuilder, userService) {
        this.route = route;
        this.router = router;
        this.http = http;
        this.auth = auth;
        this.organizationService = organizationService;
        this.formBuilder = formBuilder;
        this.userService = userService;
        this.organizations = [];
        this.newDescription = "";
        this.newSummary = "";
    }
    OrganizationListComponent.prototype.selectOrganization = function (id) {
        var _this = this;
        this.userService.getUser().subscribe(function (user) { return _this.username = user.username; }, function (err) { return console.log(err.message); });
        this.organizationService.selectOrganization(id)
            .subscribe(function () { return _this.router.navigate(['propositions/fromUser', _this.username]); }, function (err) {
            console.log('erro na escolha');
        });
        console.log(id);
    };
    OrganizationListComponent.prototype.newOrganization = function () {
        this.organizationService
            .newOrganization(this.newDescription, this.newSummary, true);
    };
    OrganizationListComponent.prototype.ngOnInit = function () {
        // this.newOrganizationForm = this.formBuilder.group({
        //   newDescription: ['', Validators.required],
        //   newSummary: ['', Validators.required],
        //   newDate: ['', Validators.required],
        //   newCollection: ['', Validators.required]
        // });
        var _this = this;
        if (!!this.auth.username) {
            this.userId = this.userService.getUserId();
        }
        else {
            this.userService.getUser().subscribe(function (user) { return _this.userId = user.sub; }, function (err) { return console.log(err.message); });
        }
        this.organizationService
            .listFromUser(this.userId)
            .subscribe(function (organizations) { return _this.organizations = organizations; }, function (err) { return console.log(err.message); });
    };
    OrganizationListComponent = tslib_1.__decorate([
        Component({
            selector: 'app-organization-list',
            templateUrl: './organization-list.component.html'
        }),
        tslib_1.__metadata("design:paramtypes", [ActivatedRoute,
            Router,
            HttpClient,
            AuthService,
            OrganizationService,
            FormBuilder,
            UserService])
    ], OrganizationListComponent);
    return OrganizationListComponent;
}());
export { OrganizationListComponent };
//# sourceMappingURL=organization-list.component.js.map
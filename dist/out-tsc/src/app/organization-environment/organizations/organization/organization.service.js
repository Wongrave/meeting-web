import * as tslib_1 from "tslib";
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
var API = 'http://localhost:8080/organizations';
var PROPKEY = 'organizationId';
var OrganizationService = /** @class */ (function () {
    function OrganizationService(http) {
        this.http = http;
        this.organizationSubject = new BehaviorSubject(null);
    }
    OrganizationService.prototype.listFromUser = function (user) {
        return this.http
            .get(API + '/fromUser/' + user);
    };
    OrganizationService.prototype.selectOrganization = function (id) {
        var _this = this;
        return this.http
            .get(API + '/' + id, { observe: 'body', responseType: 'text' })
            .pipe(map(function (res) {
            var org = res;
            _this.setOrganization(org.toString());
        }));
    };
    OrganizationService.prototype.hasOrganization = function () {
        return !!this.getOrganization();
    };
    OrganizationService.prototype.setOrganization = function (organization) {
        window.localStorage.setItem(PROPKEY, organization);
    };
    OrganizationService.prototype.decodify = function () {
        var organization = window.localStorage.getItem(PROPKEY);
        var prop = JSON.parse(organization);
        this.organizationSubject.next(prop);
    };
    OrganizationService.prototype.getOrganization = function () {
        this.decodify();
        return this.organizationSubject.asObservable();
    };
    OrganizationService.prototype.removeOrganization = function () {
        window.localStorage.removeItem(PROPKEY);
    };
    OrganizationService.prototype.newOrganization = function (description, summary, active) {
        return this.http.post(API + '/new', { description: description, summary: summary, active: active }).subscribe();
    };
    OrganizationService = tslib_1.__decorate([
        Injectable({ providedIn: 'root' }),
        tslib_1.__metadata("design:paramtypes", [HttpClient])
    ], OrganizationService);
    return OrganizationService;
}());
export { OrganizationService };
//# sourceMappingURL=organization.service.js.map
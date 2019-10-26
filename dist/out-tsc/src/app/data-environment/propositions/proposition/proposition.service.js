import * as tslib_1 from "tslib";
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
var API = 'http://localhost:8080/propositions';
var PROPKEY = 'propositionId';
var PropositionService = /** @class */ (function () {
    function PropositionService(http) {
        this.http = http;
        this.propositionSubject = new BehaviorSubject(null);
    }
    PropositionService.prototype.listFromUser = function (user) {
        return this.http
            .get(API + '/fromUser/' + user);
    };
    PropositionService.prototype.selectProposition = function (id) {
        var _this = this;
        return this.http
            .get(API + '/' + id, { observe: 'body', responseType: 'text' })
            .pipe(map(function (res) {
            var prop = res;
            _this.setProposition(prop.toString());
        }));
    };
    PropositionService.prototype.hasProposition = function () {
        return !!this.getProposition();
    };
    PropositionService.prototype.setProposition = function (proposition) {
        window.localStorage.setItem(PROPKEY, proposition);
    };
    PropositionService.prototype.decodify = function () {
        var proposition = window.localStorage.getItem(PROPKEY);
        var prop = JSON.parse(proposition);
        this.propositionSubject.next(prop);
    };
    PropositionService.prototype.getProposition = function () {
        this.decodify();
        return this.propositionSubject.asObservable();
    };
    PropositionService.prototype.removeProposition = function () {
        window.localStorage.removeItem(PROPKEY);
    };
    PropositionService.prototype.newProposition = function (description, summary, date, collection) {
        return this.http.post(API + '/new', { description: description, summary: summary, date: date, collection: collection }).subscribe();
    };
    PropositionService = tslib_1.__decorate([
        Injectable({ providedIn: 'root' }),
        tslib_1.__metadata("design:paramtypes", [HttpClient])
    ], PropositionService);
    return PropositionService;
}());
export { PropositionService };
//# sourceMappingURL=proposition.service.js.map
import * as tslib_1 from "tslib";
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
var APIFACTOR = 'http://localhost:8080/factors';
var APISECTION = 'http://localhost:8080/sections';
var WorkspaceService = /** @class */ (function () {
    function WorkspaceService(http) {
        this.http = http;
        this.propositionSubject = new BehaviorSubject(null);
    }
    WorkspaceService.prototype.listFromProposition = function (proposition) {
        return this.http
            .get(APIFACTOR + '/fromProposition/' + proposition.toString());
    };
    WorkspaceService = tslib_1.__decorate([
        Injectable({ providedIn: 'root' }),
        tslib_1.__metadata("design:paramtypes", [HttpClient])
    ], WorkspaceService);
    return WorkspaceService;
}());
export { WorkspaceService };
//# sourceMappingURL=workspace.service.js.map
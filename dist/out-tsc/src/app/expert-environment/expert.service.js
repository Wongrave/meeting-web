import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
var APIFACTOR = 'http://localhost:8080/factors';
var ExpertService = /** @class */ (function () {
    function ExpertService(http) {
        this.http = http;
        this.propositionSubject = new BehaviorSubject(null);
    }
    ExpertService.prototype.listFromProposition = function (proposition) {
        return this.http
            .get(APIFACTOR + '/fromProposition/' + proposition.toString());
    };
    ExpertService = tslib_1.__decorate([
        Injectable({ providedIn: 'root' }),
        tslib_1.__metadata("design:paramtypes", [HttpClient])
    ], ExpertService);
    return ExpertService;
}());
export { ExpertService };
//# sourceMappingURL=expert.service.js.map
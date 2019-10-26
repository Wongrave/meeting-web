import * as tslib_1 from "tslib";
import { Component } from '@angular/core';
import { PropositionService } from './proposition.service';
var PropositionComponent = /** @class */ (function () {
    function PropositionComponent(propositionService) {
        this.propositionService = propositionService;
        this.propositions = [];
    }
    PropositionComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.propositionService
            .listFromUser(0)
            .subscribe(function (propositions) { return _this.propositions = propositions; }, function (err) { return console.log(err.message); });
    };
    PropositionComponent = tslib_1.__decorate([
        Component({
            selector: 'pd-proposition',
            templateUrl: 'proposition.component.html'
        }),
        tslib_1.__metadata("design:paramtypes", [PropositionService])
    ], PropositionComponent);
    return PropositionComponent;
}());
export { PropositionComponent };
//# sourceMappingURL=proposition.component.js.map
import * as tslib_1 from "tslib";
import { Component, Input, Output, EventEmitter } from "@angular/core";
var ValueComponent = /** @class */ (function () {
    function ValueComponent() {
        this.selectedValue = 0;
        this.valueChange = new EventEmitter();
    }
    Object.defineProperty(ValueComponent.prototype, "valor", {
        get: function () {
            return this.selectedValue;
        },
        set: function (val) {
            this.selectedValue = val;
            this.valueChange.emit(this.selectedValue);
        },
        enumerable: true,
        configurable: true
    });
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Object),
        tslib_1.__metadata("design:paramtypes", [Object])
    ], ValueComponent.prototype, "valor", null);
    tslib_1.__decorate([
        Output(),
        tslib_1.__metadata("design:type", Object)
    ], ValueComponent.prototype, "valueChange", void 0);
    ValueComponent = tslib_1.__decorate([
        Component({
            selector: 'pd-expert-value',
            templateUrl: 'value.component.html',
            styleUrls: ['value.component.css']
        })
    ], ValueComponent);
    return ValueComponent;
}());
export { ValueComponent };
//# sourceMappingURL=value.component.js.map
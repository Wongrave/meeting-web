/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { toString } from '../util/util';
/**
 * The context for the typeahead result template in case you want to override the default one.
 * @record
 */
export function ResultTemplateContext() { }
if (false) {
    /**
     * Your typeahead result item.
     * @type {?}
     */
    ResultTemplateContext.prototype.result;
    /**
     * Search term from the `<input>` used to get current result.
     * @type {?}
     */
    ResultTemplateContext.prototype.term;
}
export class NgbTypeaheadWindow {
    constructor() {
        this.activeIdx = 0;
        /**
         * Flag indicating if the first row should be active initially
         */
        this.focusFirst = true;
        /**
         * A function used to format a given result before display. This function should return a formatted string without any
         * HTML markup
         */
        this.formatter = toString;
        /**
         * Event raised when user selects a particular result row
         */
        this.selectEvent = new EventEmitter();
        this.activeChangeEvent = new EventEmitter();
    }
    /**
     * @return {?}
     */
    hasActive() { return this.activeIdx > -1 && this.activeIdx < this.results.length; }
    /**
     * @return {?}
     */
    getActive() { return this.results[this.activeIdx]; }
    /**
     * @param {?} activeIdx
     * @return {?}
     */
    markActive(activeIdx) {
        this.activeIdx = activeIdx;
        this._activeChanged();
    }
    /**
     * @return {?}
     */
    next() {
        if (this.activeIdx === this.results.length - 1) {
            this.activeIdx = this.focusFirst ? (this.activeIdx + 1) % this.results.length : -1;
        }
        else {
            this.activeIdx++;
        }
        this._activeChanged();
    }
    /**
     * @return {?}
     */
    prev() {
        if (this.activeIdx < 0) {
            this.activeIdx = this.results.length - 1;
        }
        else if (this.activeIdx === 0) {
            this.activeIdx = this.focusFirst ? this.results.length - 1 : -1;
        }
        else {
            this.activeIdx--;
        }
        this._activeChanged();
    }
    /**
     * @return {?}
     */
    resetActive() {
        this.activeIdx = this.focusFirst ? 0 : -1;
        this._activeChanged();
    }
    /**
     * @param {?} item
     * @return {?}
     */
    select(item) { this.selectEvent.emit(item); }
    /**
     * @return {?}
     */
    ngOnInit() { this.resetActive(); }
    /**
     * @private
     * @return {?}
     */
    _activeChanged() {
        this.activeChangeEvent.emit(this.activeIdx >= 0 ? this.id + '-' + this.activeIdx : undefined);
    }
}
NgbTypeaheadWindow.decorators = [
    { type: Component, args: [{
                selector: 'ngb-typeahead-window',
                exportAs: 'ngbTypeaheadWindow',
                host: { '(mousedown)': '$event.preventDefault()', 'class': 'dropdown-menu show', 'role': 'listbox', '[id]': 'id' },
                template: `
    <ng-template #rt let-result="result" let-term="term" let-formatter="formatter">
      <ngb-highlight [result]="formatter(result)" [term]="term"></ngb-highlight>
    </ng-template>
    <ng-template ngFor [ngForOf]="results" let-result let-idx="index">
      <button type="button" class="dropdown-item" role="option"
        [id]="id + '-' + idx"
        [class.active]="idx === activeIdx"
        (mouseenter)="markActive(idx)"
        (click)="select(result)">
          <ng-template [ngTemplateOutlet]="resultTemplate || rt"
          [ngTemplateOutletContext]="{result: result, term: term, formatter: formatter}"></ng-template>
      </button>
    </ng-template>
  `
            }] }
];
NgbTypeaheadWindow.propDecorators = {
    id: [{ type: Input }],
    focusFirst: [{ type: Input }],
    results: [{ type: Input }],
    term: [{ type: Input }],
    formatter: [{ type: Input }],
    resultTemplate: [{ type: Input }],
    selectEvent: [{ type: Output, args: ['select',] }],
    activeChangeEvent: [{ type: Output, args: ['activeChange',] }]
};
if (false) {
    /** @type {?} */
    NgbTypeaheadWindow.prototype.activeIdx;
    /**
     *  The id for the typeahead window. The id should be unique and the same
     *  as the associated typeahead's id.
     * @type {?}
     */
    NgbTypeaheadWindow.prototype.id;
    /**
     * Flag indicating if the first row should be active initially
     * @type {?}
     */
    NgbTypeaheadWindow.prototype.focusFirst;
    /**
     * Typeahead match results to be displayed
     * @type {?}
     */
    NgbTypeaheadWindow.prototype.results;
    /**
     * Search term used to get current results
     * @type {?}
     */
    NgbTypeaheadWindow.prototype.term;
    /**
     * A function used to format a given result before display. This function should return a formatted string without any
     * HTML markup
     * @type {?}
     */
    NgbTypeaheadWindow.prototype.formatter;
    /**
     * A template to override a matching result default display
     * @type {?}
     */
    NgbTypeaheadWindow.prototype.resultTemplate;
    /**
     * Event raised when user selects a particular result row
     * @type {?}
     */
    NgbTypeaheadWindow.prototype.selectEvent;
    /** @type {?} */
    NgbTypeaheadWindow.prototype.activeChangeEvent;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZWFoZWFkLXdpbmRvdy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BuZy1ib290c3RyYXAvbmctYm9vdHN0cmFwLyIsInNvdXJjZXMiOlsidHlwZWFoZWFkL3R5cGVhaGVhZC13aW5kb3cudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFTLE1BQU0sZUFBZSxDQUFDO0FBRTFGLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxjQUFjLENBQUM7Ozs7O0FBS3RDLDJDQVVDOzs7Ozs7SUFOQyx1Q0FBWTs7Ozs7SUFLWixxQ0FBYTs7QUF1QmYsTUFBTSxPQUFPLGtCQUFrQjtJQXBCL0I7UUFxQkUsY0FBUyxHQUFHLENBQUMsQ0FBQzs7OztRQVdMLGVBQVUsR0FBRyxJQUFJLENBQUM7Ozs7O1FBZ0JsQixjQUFTLEdBQUcsUUFBUSxDQUFDOzs7O1FBVVosZ0JBQVcsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBRTNCLHNCQUFpQixHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7SUEyQ2pFLENBQUM7Ozs7SUF6Q0MsU0FBUyxLQUFLLE9BQU8sSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzs7OztJQUVuRixTQUFTLEtBQUssT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7O0lBRXBELFVBQVUsQ0FBQyxTQUFpQjtRQUMxQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDeEIsQ0FBQzs7OztJQUVELElBQUk7UUFDRixJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQzlDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNwRjthQUFNO1lBQ0wsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1NBQ2xCO1FBQ0QsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQ3hCLENBQUM7Ozs7SUFFRCxJQUFJO1FBQ0YsSUFBSSxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsRUFBRTtZQUN0QixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztTQUMxQzthQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxDQUFDLEVBQUU7WUFDL0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pFO2FBQU07WUFDTCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7U0FDbEI7UUFDRCxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDeEIsQ0FBQzs7OztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQ3hCLENBQUM7Ozs7O0lBRUQsTUFBTSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7SUFFN0MsUUFBUSxLQUFLLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7Ozs7O0lBRTFCLGNBQWM7UUFDcEIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDaEcsQ0FBQzs7O1lBdEdGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsc0JBQXNCO2dCQUNoQyxRQUFRLEVBQUUsb0JBQW9CO2dCQUM5QixJQUFJLEVBQUUsRUFBQyxhQUFhLEVBQUUseUJBQXlCLEVBQUUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBQztnQkFDaEgsUUFBUSxFQUFFOzs7Ozs7Ozs7Ozs7OztHQWNUO2FBQ0Y7OztpQkFRRSxLQUFLO3lCQUtMLEtBQUs7c0JBS0wsS0FBSzttQkFLTCxLQUFLO3dCQU1MLEtBQUs7NkJBS0wsS0FBSzswQkFLTCxNQUFNLFNBQUMsUUFBUTtnQ0FFZixNQUFNLFNBQUMsY0FBYzs7OztJQXZDdEIsdUNBQWM7Ozs7OztJQU1kLGdDQUFvQjs7Ozs7SUFLcEIsd0NBQTJCOzs7OztJQUszQixxQ0FBaUI7Ozs7O0lBS2pCLGtDQUFzQjs7Ozs7O0lBTXRCLHVDQUE4Qjs7Ozs7SUFLOUIsNENBQTREOzs7OztJQUs1RCx5Q0FBbUQ7O0lBRW5ELCtDQUErRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29tcG9uZW50LCBJbnB1dCwgT3V0cHV0LCBFdmVudEVtaXR0ZXIsIFRlbXBsYXRlUmVmLCBPbkluaXR9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge3RvU3RyaW5nfSBmcm9tICcuLi91dGlsL3V0aWwnO1xuXG4vKipcbiAqIFRoZSBjb250ZXh0IGZvciB0aGUgdHlwZWFoZWFkIHJlc3VsdCB0ZW1wbGF0ZSBpbiBjYXNlIHlvdSB3YW50IHRvIG92ZXJyaWRlIHRoZSBkZWZhdWx0IG9uZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZXN1bHRUZW1wbGF0ZUNvbnRleHQge1xuICAvKipcbiAgICogWW91ciB0eXBlYWhlYWQgcmVzdWx0IGl0ZW0uXG4gICAqL1xuICByZXN1bHQ6IGFueTtcblxuICAvKipcbiAgICogU2VhcmNoIHRlcm0gZnJvbSB0aGUgYDxpbnB1dD5gIHVzZWQgdG8gZ2V0IGN1cnJlbnQgcmVzdWx0LlxuICAgKi9cbiAgdGVybTogc3RyaW5nO1xufVxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICduZ2ItdHlwZWFoZWFkLXdpbmRvdycsXG4gIGV4cG9ydEFzOiAnbmdiVHlwZWFoZWFkV2luZG93JyxcbiAgaG9zdDogeycobW91c2Vkb3duKSc6ICckZXZlbnQucHJldmVudERlZmF1bHQoKScsICdjbGFzcyc6ICdkcm9wZG93bi1tZW51IHNob3cnLCAncm9sZSc6ICdsaXN0Ym94JywgJ1tpZF0nOiAnaWQnfSxcbiAgdGVtcGxhdGU6IGBcbiAgICA8bmctdGVtcGxhdGUgI3J0IGxldC1yZXN1bHQ9XCJyZXN1bHRcIiBsZXQtdGVybT1cInRlcm1cIiBsZXQtZm9ybWF0dGVyPVwiZm9ybWF0dGVyXCI+XG4gICAgICA8bmdiLWhpZ2hsaWdodCBbcmVzdWx0XT1cImZvcm1hdHRlcihyZXN1bHQpXCIgW3Rlcm1dPVwidGVybVwiPjwvbmdiLWhpZ2hsaWdodD5cbiAgICA8L25nLXRlbXBsYXRlPlxuICAgIDxuZy10ZW1wbGF0ZSBuZ0ZvciBbbmdGb3JPZl09XCJyZXN1bHRzXCIgbGV0LXJlc3VsdCBsZXQtaWR4PVwiaW5kZXhcIj5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiZHJvcGRvd24taXRlbVwiIHJvbGU9XCJvcHRpb25cIlxuICAgICAgICBbaWRdPVwiaWQgKyAnLScgKyBpZHhcIlxuICAgICAgICBbY2xhc3MuYWN0aXZlXT1cImlkeCA9PT0gYWN0aXZlSWR4XCJcbiAgICAgICAgKG1vdXNlZW50ZXIpPVwibWFya0FjdGl2ZShpZHgpXCJcbiAgICAgICAgKGNsaWNrKT1cInNlbGVjdChyZXN1bHQpXCI+XG4gICAgICAgICAgPG5nLXRlbXBsYXRlIFtuZ1RlbXBsYXRlT3V0bGV0XT1cInJlc3VsdFRlbXBsYXRlIHx8IHJ0XCJcbiAgICAgICAgICBbbmdUZW1wbGF0ZU91dGxldENvbnRleHRdPVwie3Jlc3VsdDogcmVzdWx0LCB0ZXJtOiB0ZXJtLCBmb3JtYXR0ZXI6IGZvcm1hdHRlcn1cIj48L25nLXRlbXBsYXRlPlxuICAgICAgPC9idXR0b24+XG4gICAgPC9uZy10ZW1wbGF0ZT5cbiAgYFxufSlcbmV4cG9ydCBjbGFzcyBOZ2JUeXBlYWhlYWRXaW5kb3cgaW1wbGVtZW50cyBPbkluaXQge1xuICBhY3RpdmVJZHggPSAwO1xuXG4gIC8qKlxuICAgKiAgVGhlIGlkIGZvciB0aGUgdHlwZWFoZWFkIHdpbmRvdy4gVGhlIGlkIHNob3VsZCBiZSB1bmlxdWUgYW5kIHRoZSBzYW1lXG4gICAqICBhcyB0aGUgYXNzb2NpYXRlZCB0eXBlYWhlYWQncyBpZC5cbiAgICovXG4gIEBJbnB1dCgpIGlkOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEZsYWcgaW5kaWNhdGluZyBpZiB0aGUgZmlyc3Qgcm93IHNob3VsZCBiZSBhY3RpdmUgaW5pdGlhbGx5XG4gICAqL1xuICBASW5wdXQoKSBmb2N1c0ZpcnN0ID0gdHJ1ZTtcblxuICAvKipcbiAgICogVHlwZWFoZWFkIG1hdGNoIHJlc3VsdHMgdG8gYmUgZGlzcGxheWVkXG4gICAqL1xuICBASW5wdXQoKSByZXN1bHRzO1xuXG4gIC8qKlxuICAgKiBTZWFyY2ggdGVybSB1c2VkIHRvIGdldCBjdXJyZW50IHJlc3VsdHNcbiAgICovXG4gIEBJbnB1dCgpIHRlcm06IHN0cmluZztcblxuICAvKipcbiAgICogQSBmdW5jdGlvbiB1c2VkIHRvIGZvcm1hdCBhIGdpdmVuIHJlc3VsdCBiZWZvcmUgZGlzcGxheS4gVGhpcyBmdW5jdGlvbiBzaG91bGQgcmV0dXJuIGEgZm9ybWF0dGVkIHN0cmluZyB3aXRob3V0IGFueVxuICAgKiBIVE1MIG1hcmt1cFxuICAgKi9cbiAgQElucHV0KCkgZm9ybWF0dGVyID0gdG9TdHJpbmc7XG5cbiAgLyoqXG4gICAqIEEgdGVtcGxhdGUgdG8gb3ZlcnJpZGUgYSBtYXRjaGluZyByZXN1bHQgZGVmYXVsdCBkaXNwbGF5XG4gICAqL1xuICBASW5wdXQoKSByZXN1bHRUZW1wbGF0ZTogVGVtcGxhdGVSZWY8UmVzdWx0VGVtcGxhdGVDb250ZXh0PjtcblxuICAvKipcbiAgICogRXZlbnQgcmFpc2VkIHdoZW4gdXNlciBzZWxlY3RzIGEgcGFydGljdWxhciByZXN1bHQgcm93XG4gICAqL1xuICBAT3V0cHV0KCdzZWxlY3QnKSBzZWxlY3RFdmVudCA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICBAT3V0cHV0KCdhY3RpdmVDaGFuZ2UnKSBhY3RpdmVDaGFuZ2VFdmVudCA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICBoYXNBY3RpdmUoKSB7IHJldHVybiB0aGlzLmFjdGl2ZUlkeCA+IC0xICYmIHRoaXMuYWN0aXZlSWR4IDwgdGhpcy5yZXN1bHRzLmxlbmd0aDsgfVxuXG4gIGdldEFjdGl2ZSgpIHsgcmV0dXJuIHRoaXMucmVzdWx0c1t0aGlzLmFjdGl2ZUlkeF07IH1cblxuICBtYXJrQWN0aXZlKGFjdGl2ZUlkeDogbnVtYmVyKSB7XG4gICAgdGhpcy5hY3RpdmVJZHggPSBhY3RpdmVJZHg7XG4gICAgdGhpcy5fYWN0aXZlQ2hhbmdlZCgpO1xuICB9XG5cbiAgbmV4dCgpIHtcbiAgICBpZiAodGhpcy5hY3RpdmVJZHggPT09IHRoaXMucmVzdWx0cy5sZW5ndGggLSAxKSB7XG4gICAgICB0aGlzLmFjdGl2ZUlkeCA9IHRoaXMuZm9jdXNGaXJzdCA/ICh0aGlzLmFjdGl2ZUlkeCArIDEpICUgdGhpcy5yZXN1bHRzLmxlbmd0aCA6IC0xO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFjdGl2ZUlkeCsrO1xuICAgIH1cbiAgICB0aGlzLl9hY3RpdmVDaGFuZ2VkKCk7XG4gIH1cblxuICBwcmV2KCkge1xuICAgIGlmICh0aGlzLmFjdGl2ZUlkeCA8IDApIHtcbiAgICAgIHRoaXMuYWN0aXZlSWR4ID0gdGhpcy5yZXN1bHRzLmxlbmd0aCAtIDE7XG4gICAgfSBlbHNlIGlmICh0aGlzLmFjdGl2ZUlkeCA9PT0gMCkge1xuICAgICAgdGhpcy5hY3RpdmVJZHggPSB0aGlzLmZvY3VzRmlyc3QgPyB0aGlzLnJlc3VsdHMubGVuZ3RoIC0gMSA6IC0xO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFjdGl2ZUlkeC0tO1xuICAgIH1cbiAgICB0aGlzLl9hY3RpdmVDaGFuZ2VkKCk7XG4gIH1cblxuICByZXNldEFjdGl2ZSgpIHtcbiAgICB0aGlzLmFjdGl2ZUlkeCA9IHRoaXMuZm9jdXNGaXJzdCA/IDAgOiAtMTtcbiAgICB0aGlzLl9hY3RpdmVDaGFuZ2VkKCk7XG4gIH1cblxuICBzZWxlY3QoaXRlbSkgeyB0aGlzLnNlbGVjdEV2ZW50LmVtaXQoaXRlbSk7IH1cblxuICBuZ09uSW5pdCgpIHsgdGhpcy5yZXNldEFjdGl2ZSgpOyB9XG5cbiAgcHJpdmF0ZSBfYWN0aXZlQ2hhbmdlZCgpIHtcbiAgICB0aGlzLmFjdGl2ZUNoYW5nZUV2ZW50LmVtaXQodGhpcy5hY3RpdmVJZHggPj0gMCA/IHRoaXMuaWQgKyAnLScgKyB0aGlzLmFjdGl2ZUlkeCA6IHVuZGVmaW5lZCk7XG4gIH1cbn1cbiJdfQ==
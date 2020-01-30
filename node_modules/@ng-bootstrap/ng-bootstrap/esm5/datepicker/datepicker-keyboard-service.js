/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Injectable } from '@angular/core';
import { Key } from '../util/key';
import * as i0 from "@angular/core";
/**
 * A service that represents the keyboard navigation.
 *
 * Default keyboard shortcuts [are documented in the overview](#/components/datepicker/overview#keyboard-shortcuts)
 *
 * \@since 5.2.0
 */
var NgbDatepickerKeyboardService = /** @class */ (function () {
    function NgbDatepickerKeyboardService() {
    }
    /**
     * Processes a keyboard event.
     */
    /**
     * Processes a keyboard event.
     * @param {?} event
     * @param {?} datepicker
     * @param {?} calendar
     * @return {?}
     */
    NgbDatepickerKeyboardService.prototype.processKey = /**
     * Processes a keyboard event.
     * @param {?} event
     * @param {?} datepicker
     * @param {?} calendar
     * @return {?}
     */
    function (event, datepicker, calendar) {
        /** @type {?} */
        var state = datepicker.state;
        // tslint:disable-next-line:deprecation
        switch (event.which) {
            case Key.PageUp:
                datepicker.focusDate(calendar.getPrev(state.focusedDate, event.shiftKey ? 'y' : 'm', 1));
                break;
            case Key.PageDown:
                datepicker.focusDate(calendar.getNext(state.focusedDate, event.shiftKey ? 'y' : 'm', 1));
                break;
            case Key.End:
                datepicker.focusDate(event.shiftKey ? state.maxDate : state.lastDate);
                break;
            case Key.Home:
                datepicker.focusDate(event.shiftKey ? state.minDate : state.firstDate);
                break;
            case Key.ArrowLeft:
                datepicker.focusDate(calendar.getPrev(state.focusedDate, 'd', 1));
                break;
            case Key.ArrowUp:
                datepicker.focusDate(calendar.getPrev(state.focusedDate, 'd', calendar.getDaysPerWeek()));
                break;
            case Key.ArrowRight:
                datepicker.focusDate(calendar.getNext(state.focusedDate, 'd', 1));
                break;
            case Key.ArrowDown:
                datepicker.focusDate(calendar.getNext(state.focusedDate, 'd', calendar.getDaysPerWeek()));
                break;
            case Key.Enter:
            case Key.Space:
                datepicker.focusSelect();
                break;
            default:
                return;
        }
        event.preventDefault();
        event.stopPropagation();
    };
    NgbDatepickerKeyboardService.decorators = [
        { type: Injectable, args: [{ providedIn: 'root' },] }
    ];
    /** @nocollapse */ NgbDatepickerKeyboardService.ngInjectableDef = i0.ɵɵdefineInjectable({ factory: function NgbDatepickerKeyboardService_Factory() { return new NgbDatepickerKeyboardService(); }, token: NgbDatepickerKeyboardService, providedIn: "root" });
    return NgbDatepickerKeyboardService;
}());
export { NgbDatepickerKeyboardService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci1rZXlib2FyZC1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQG5nLWJvb3RzdHJhcC9uZy1ib290c3RyYXAvIiwic291cmNlcyI6WyJkYXRlcGlja2VyL2RhdGVwaWNrZXIta2V5Ym9hcmQtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUd6QyxPQUFPLEVBQUMsR0FBRyxFQUFDLE1BQU0sYUFBYSxDQUFDOzs7Ozs7Ozs7QUFTaEM7SUFBQTtLQTJDQztJQXpDQzs7T0FFRzs7Ozs7Ozs7SUFDSCxpREFBVTs7Ozs7OztJQUFWLFVBQVcsS0FBb0IsRUFBRSxVQUF5QixFQUFFLFFBQXFCOztZQUN6RSxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUs7UUFDOUIsdUNBQXVDO1FBQ3ZDLFFBQVEsS0FBSyxDQUFDLEtBQUssRUFBRTtZQUNuQixLQUFLLEdBQUcsQ0FBQyxNQUFNO2dCQUNiLFVBQVUsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pGLE1BQU07WUFDUixLQUFLLEdBQUcsQ0FBQyxRQUFRO2dCQUNmLFVBQVUsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pGLE1BQU07WUFDUixLQUFLLEdBQUcsQ0FBQyxHQUFHO2dCQUNWLFVBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN0RSxNQUFNO1lBQ1IsS0FBSyxHQUFHLENBQUMsSUFBSTtnQkFDWCxVQUFVLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDdkUsTUFBTTtZQUNSLEtBQUssR0FBRyxDQUFDLFNBQVM7Z0JBQ2hCLFVBQVUsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsRSxNQUFNO1lBQ1IsS0FBSyxHQUFHLENBQUMsT0FBTztnQkFDZCxVQUFVLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUUsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDMUYsTUFBTTtZQUNSLEtBQUssR0FBRyxDQUFDLFVBQVU7Z0JBQ2pCLFVBQVUsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsRSxNQUFNO1lBQ1IsS0FBSyxHQUFHLENBQUMsU0FBUztnQkFDaEIsVUFBVSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzFGLE1BQU07WUFDUixLQUFLLEdBQUcsQ0FBQyxLQUFLLENBQUM7WUFDZixLQUFLLEdBQUcsQ0FBQyxLQUFLO2dCQUNaLFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDekIsTUFBTTtZQUNSO2dCQUNFLE9BQU87U0FDVjtRQUNELEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN2QixLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDMUIsQ0FBQzs7Z0JBMUNGLFVBQVUsU0FBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUM7Ozt1Q0FaaEM7Q0F1REMsQUEzQ0QsSUEyQ0M7U0ExQ1ksNEJBQTRCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7TmdiQ2FsZW5kYXJ9IGZyb20gJy4vbmdiLWNhbGVuZGFyJztcbmltcG9ydCB7TmdiRGF0ZXBpY2tlcn0gZnJvbSAnLi9kYXRlcGlja2VyJztcbmltcG9ydCB7S2V5fSBmcm9tICcuLi91dGlsL2tleSc7XG5cbi8qKlxuICogQSBzZXJ2aWNlIHRoYXQgcmVwcmVzZW50cyB0aGUga2V5Ym9hcmQgbmF2aWdhdGlvbi5cbiAqXG4gKiBEZWZhdWx0IGtleWJvYXJkIHNob3J0Y3V0cyBbYXJlIGRvY3VtZW50ZWQgaW4gdGhlIG92ZXJ2aWV3XSgjL2NvbXBvbmVudHMvZGF0ZXBpY2tlci9vdmVydmlldyNrZXlib2FyZC1zaG9ydGN1dHMpXG4gKlxuICogQHNpbmNlIDUuMi4wXG4gKi9cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxuZXhwb3J0IGNsYXNzIE5nYkRhdGVwaWNrZXJLZXlib2FyZFNlcnZpY2Uge1xuICAvKipcbiAgICogUHJvY2Vzc2VzIGEga2V5Ym9hcmQgZXZlbnQuXG4gICAqL1xuICBwcm9jZXNzS2V5KGV2ZW50OiBLZXlib2FyZEV2ZW50LCBkYXRlcGlja2VyOiBOZ2JEYXRlcGlja2VyLCBjYWxlbmRhcjogTmdiQ2FsZW5kYXIpIHtcbiAgICBjb25zdCBzdGF0ZSA9IGRhdGVwaWNrZXIuc3RhdGU7XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOmRlcHJlY2F0aW9uXG4gICAgc3dpdGNoIChldmVudC53aGljaCkge1xuICAgICAgY2FzZSBLZXkuUGFnZVVwOlxuICAgICAgICBkYXRlcGlja2VyLmZvY3VzRGF0ZShjYWxlbmRhci5nZXRQcmV2KHN0YXRlLmZvY3VzZWREYXRlLCBldmVudC5zaGlmdEtleSA/ICd5JyA6ICdtJywgMSkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgS2V5LlBhZ2VEb3duOlxuICAgICAgICBkYXRlcGlja2VyLmZvY3VzRGF0ZShjYWxlbmRhci5nZXROZXh0KHN0YXRlLmZvY3VzZWREYXRlLCBldmVudC5zaGlmdEtleSA/ICd5JyA6ICdtJywgMSkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgS2V5LkVuZDpcbiAgICAgICAgZGF0ZXBpY2tlci5mb2N1c0RhdGUoZXZlbnQuc2hpZnRLZXkgPyBzdGF0ZS5tYXhEYXRlIDogc3RhdGUubGFzdERhdGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgS2V5LkhvbWU6XG4gICAgICAgIGRhdGVwaWNrZXIuZm9jdXNEYXRlKGV2ZW50LnNoaWZ0S2V5ID8gc3RhdGUubWluRGF0ZSA6IHN0YXRlLmZpcnN0RGF0ZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBLZXkuQXJyb3dMZWZ0OlxuICAgICAgICBkYXRlcGlja2VyLmZvY3VzRGF0ZShjYWxlbmRhci5nZXRQcmV2KHN0YXRlLmZvY3VzZWREYXRlLCAnZCcsIDEpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEtleS5BcnJvd1VwOlxuICAgICAgICBkYXRlcGlja2VyLmZvY3VzRGF0ZShjYWxlbmRhci5nZXRQcmV2KHN0YXRlLmZvY3VzZWREYXRlLCAnZCcsIGNhbGVuZGFyLmdldERheXNQZXJXZWVrKCkpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEtleS5BcnJvd1JpZ2h0OlxuICAgICAgICBkYXRlcGlja2VyLmZvY3VzRGF0ZShjYWxlbmRhci5nZXROZXh0KHN0YXRlLmZvY3VzZWREYXRlLCAnZCcsIDEpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEtleS5BcnJvd0Rvd246XG4gICAgICAgIGRhdGVwaWNrZXIuZm9jdXNEYXRlKGNhbGVuZGFyLmdldE5leHQoc3RhdGUuZm9jdXNlZERhdGUsICdkJywgY2FsZW5kYXIuZ2V0RGF5c1BlcldlZWsoKSkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgS2V5LkVudGVyOlxuICAgICAgY2FzZSBLZXkuU3BhY2U6XG4gICAgICAgIGRhdGVwaWNrZXIuZm9jdXNTZWxlY3QoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH1cbn1cbiJdfQ==
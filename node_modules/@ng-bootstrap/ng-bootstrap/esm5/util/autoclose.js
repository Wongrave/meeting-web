/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
import { fromEvent, race } from 'rxjs';
import { delay, filter, map, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { Key } from './key';
import { closest } from './util';
/** @type {?} */
var isContainedIn = (/**
 * @param {?} element
 * @param {?=} array
 * @return {?}
 */
function (element, array) {
    return array ? array.some((/**
     * @param {?} item
     * @return {?}
     */
    function (item) { return item.contains(element); })) : false;
});
var ɵ0 = isContainedIn;
/** @type {?} */
var matchesSelectorIfAny = (/**
 * @param {?} element
 * @param {?=} selector
 * @return {?}
 */
function (element, selector) {
    return !selector || closest(element, selector) != null;
});
var ɵ1 = matchesSelectorIfAny;
// we'll have to use 'touch' events instead of 'mouse' events on iOS and add a more significant delay
// to avoid re-opening when handling (click) on a toggling element
// TODO: use proper Angular platform detection when NgbAutoClose becomes a service and we can inject PLATFORM_ID
/** @type {?} */
var iOS = false;
if (typeof navigator !== 'undefined') {
    iOS = !!navigator.userAgent && /iPad|iPhone|iPod/.test(navigator.userAgent);
}
// setting 'ngbAutoClose' synchronously on iOS results in immediate popup closing
// when tapping on the triggering element
/** @type {?} */
var wrapAsyncForiOS = (/**
 * @param {?} fn
 * @return {?}
 */
function (fn) { return iOS ? (/**
 * @return {?}
 */
function () { return setTimeout((/**
 * @return {?}
 */
function () { return fn(); }), 100); }) : fn; });
var ɵ2 = wrapAsyncForiOS;
/**
 * @param {?} zone
 * @param {?} document
 * @param {?} type
 * @param {?} close
 * @param {?} closed$
 * @param {?} insideElements
 * @param {?=} ignoreElements
 * @param {?=} insideSelector
 * @return {?}
 */
export function ngbAutoClose(zone, document, type, close, closed$, insideElements, ignoreElements, insideSelector) {
    // closing on ESC and outside clicks
    if (type) {
        zone.runOutsideAngular(wrapAsyncForiOS((/**
         * @return {?}
         */
        function () {
            /** @type {?} */
            var shouldCloseOnClick = (/**
             * @param {?} event
             * @return {?}
             */
            function (event) {
                /** @type {?} */
                var element = (/** @type {?} */ (event.target));
                if (event.button === 2 || isContainedIn(element, ignoreElements)) {
                    return false;
                }
                if (type === 'inside') {
                    return isContainedIn(element, insideElements) && matchesSelectorIfAny(element, insideSelector);
                }
                else if (type === 'outside') {
                    return !isContainedIn(element, insideElements);
                }
                else /* if (type === true) */ {
                    return matchesSelectorIfAny(element, insideSelector) || !isContainedIn(element, insideElements);
                }
            });
            /** @type {?} */
            var escapes$ = fromEvent(document, 'keydown')
                .pipe(takeUntil(closed$), 
            // tslint:disable-next-line:deprecation
            filter((/**
             * @param {?} e
             * @return {?}
             */
            function (e) { return e.which === Key.Escape; })), tap((/**
             * @param {?} e
             * @return {?}
             */
            function (e) { return e.preventDefault(); })));
            // we have to pre-calculate 'shouldCloseOnClick' on 'mousedown/touchstart',
            // because on 'mouseup/touchend' DOM nodes might be detached
            /** @type {?} */
            var mouseDowns$ = fromEvent(document, 'mousedown').pipe(map(shouldCloseOnClick), takeUntil(closed$));
            /** @type {?} */
            var closeableClicks$ = (/** @type {?} */ (fromEvent(document, 'mouseup')
                .pipe(withLatestFrom(mouseDowns$), filter((/**
             * @param {?} __0
             * @return {?}
             */
            function (_a) {
                var _b = tslib_1.__read(_a, 2), _ = _b[0], shouldClose = _b[1];
                return shouldClose;
            })), delay(0), takeUntil(closed$))));
            race([escapes$, closeableClicks$]).subscribe((/**
             * @return {?}
             */
            function () { return zone.run(close); }));
        })));
    }
}
export { ɵ0, ɵ1, ɵ2 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b2Nsb3NlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQG5nLWJvb3RzdHJhcC9uZy1ib290c3RyYXAvIiwic291cmNlcyI6WyJ1dGlsL2F1dG9jbG9zZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUNBLE9BQU8sRUFBQyxTQUFTLEVBQWMsSUFBSSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ2pELE9BQU8sRUFBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLGNBQWMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ2xGLE9BQU8sRUFBQyxHQUFHLEVBQUMsTUFBTSxPQUFPLENBQUM7QUFDMUIsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLFFBQVEsQ0FBQzs7SUFFekIsYUFBYTs7Ozs7QUFBRyxVQUFDLE9BQW9CLEVBQUUsS0FBcUI7SUFDOUQsT0FBQSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJOzs7O0lBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUF0QixDQUFzQixFQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUs7QUFBMUQsQ0FBMEQsQ0FBQTs7O0lBRXhELG9CQUFvQjs7Ozs7QUFBRyxVQUFDLE9BQW9CLEVBQUUsUUFBaUI7SUFDakUsT0FBQSxDQUFDLFFBQVEsSUFBSSxPQUFPLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxJQUFJLElBQUk7QUFBL0MsQ0FBK0MsQ0FBQTs7Ozs7O0lBSy9DLEdBQUcsR0FBRyxLQUFLO0FBQ2YsSUFBSSxPQUFPLFNBQVMsS0FBSyxXQUFXLEVBQUU7SUFDcEMsR0FBRyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxJQUFJLGtCQUFrQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7Q0FDN0U7Ozs7SUFJSyxlQUFlOzs7O0FBQUcsVUFBQSxFQUFFLElBQUksT0FBQSxHQUFHLENBQUMsQ0FBQzs7O0FBQUMsY0FBTSxPQUFBLFVBQVU7OztBQUFDLGNBQU0sT0FBQSxFQUFFLEVBQUUsRUFBSixDQUFJLEdBQUUsR0FBRyxDQUFDLEVBQTNCLENBQTJCLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBNUMsQ0FBNEMsQ0FBQTs7Ozs7Ozs7Ozs7OztBQUUxRSxNQUFNLFVBQVUsWUFBWSxDQUN4QixJQUFZLEVBQUUsUUFBYSxFQUFFLElBQW9DLEVBQUUsS0FBaUIsRUFBRSxPQUF3QixFQUM5RyxjQUE2QixFQUFFLGNBQThCLEVBQUUsY0FBdUI7SUFDeEYsb0NBQW9DO0lBQ3BDLElBQUksSUFBSSxFQUFFO1FBQ1IsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGVBQWU7OztRQUFDOztnQkFFL0Isa0JBQWtCOzs7O1lBQUcsVUFBQyxLQUFpQjs7b0JBQ3JDLE9BQU8sR0FBRyxtQkFBQSxLQUFLLENBQUMsTUFBTSxFQUFlO2dCQUMzQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLGFBQWEsQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLEVBQUU7b0JBQ2hFLE9BQU8sS0FBSyxDQUFDO2lCQUNkO2dCQUNELElBQUksSUFBSSxLQUFLLFFBQVEsRUFBRTtvQkFDckIsT0FBTyxhQUFhLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxJQUFJLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQztpQkFDaEc7cUJBQU0sSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFO29CQUM3QixPQUFPLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQztpQkFDaEQ7cUJBQU0sd0JBQXdCLENBQUM7b0JBQzlCLE9BQU8sb0JBQW9CLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQztpQkFDakc7WUFDSCxDQUFDLENBQUE7O2dCQUVLLFFBQVEsR0FBRyxTQUFTLENBQWdCLFFBQVEsRUFBRSxTQUFTLENBQUM7aUJBQ3hDLElBQUksQ0FDRCxTQUFTLENBQUMsT0FBTyxDQUFDO1lBQ2xCLHVDQUF1QztZQUN2QyxNQUFNOzs7O1lBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsS0FBSyxLQUFLLEdBQUcsQ0FBQyxNQUFNLEVBQXRCLENBQXNCLEVBQUMsRUFBRSxHQUFHOzs7O1lBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsY0FBYyxFQUFFLEVBQWxCLENBQWtCLEVBQUMsQ0FBQzs7OztnQkFLckYsV0FBVyxHQUNiLFNBQVMsQ0FBYSxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7Z0JBRTVGLGdCQUFnQixHQUFHLG1CQUFBLFNBQVMsQ0FBYSxRQUFRLEVBQUUsU0FBUyxDQUFDO2lCQUNyQyxJQUFJLENBQ0QsY0FBYyxDQUFDLFdBQVcsQ0FBQyxFQUFFLE1BQU07Ozs7WUFBQyxVQUFDLEVBQWdCO29CQUFoQiwwQkFBZ0IsRUFBZixTQUFDLEVBQUUsbUJBQVc7Z0JBQU0sT0FBQSxXQUFXO1lBQVgsQ0FBVyxFQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUNoRixTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBMEI7WUFHOUUsSUFBSSxDQUFRLENBQUMsUUFBUSxFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxTQUFTOzs7WUFBQyxjQUFNLE9BQUEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBZixDQUFlLEVBQUMsQ0FBQztRQUM3RSxDQUFDLEVBQUMsQ0FBQyxDQUFDO0tBQ0w7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtOZ1pvbmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtmcm9tRXZlbnQsIE9ic2VydmFibGUsIHJhY2V9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtkZWxheSwgZmlsdGVyLCBtYXAsIHRha2VVbnRpbCwgdGFwLCB3aXRoTGF0ZXN0RnJvbX0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtLZXl9IGZyb20gJy4va2V5JztcbmltcG9ydCB7Y2xvc2VzdH0gZnJvbSAnLi91dGlsJztcblxuY29uc3QgaXNDb250YWluZWRJbiA9IChlbGVtZW50OiBIVE1MRWxlbWVudCwgYXJyYXk/OiBIVE1MRWxlbWVudFtdKSA9PlxuICAgIGFycmF5ID8gYXJyYXkuc29tZShpdGVtID0+IGl0ZW0uY29udGFpbnMoZWxlbWVudCkpIDogZmFsc2U7XG5cbmNvbnN0IG1hdGNoZXNTZWxlY3RvcklmQW55ID0gKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBzZWxlY3Rvcj86IHN0cmluZykgPT5cbiAgICAhc2VsZWN0b3IgfHwgY2xvc2VzdChlbGVtZW50LCBzZWxlY3RvcikgIT0gbnVsbDtcblxuLy8gd2UnbGwgaGF2ZSB0byB1c2UgJ3RvdWNoJyBldmVudHMgaW5zdGVhZCBvZiAnbW91c2UnIGV2ZW50cyBvbiBpT1MgYW5kIGFkZCBhIG1vcmUgc2lnbmlmaWNhbnQgZGVsYXlcbi8vIHRvIGF2b2lkIHJlLW9wZW5pbmcgd2hlbiBoYW5kbGluZyAoY2xpY2spIG9uIGEgdG9nZ2xpbmcgZWxlbWVudFxuLy8gVE9ETzogdXNlIHByb3BlciBBbmd1bGFyIHBsYXRmb3JtIGRldGVjdGlvbiB3aGVuIE5nYkF1dG9DbG9zZSBiZWNvbWVzIGEgc2VydmljZSBhbmQgd2UgY2FuIGluamVjdCBQTEFURk9STV9JRFxubGV0IGlPUyA9IGZhbHNlO1xuaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnKSB7XG4gIGlPUyA9ICEhbmF2aWdhdG9yLnVzZXJBZ2VudCAmJiAvaVBhZHxpUGhvbmV8aVBvZC8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbn1cblxuLy8gc2V0dGluZyAnbmdiQXV0b0Nsb3NlJyBzeW5jaHJvbm91c2x5IG9uIGlPUyByZXN1bHRzIGluIGltbWVkaWF0ZSBwb3B1cCBjbG9zaW5nXG4vLyB3aGVuIHRhcHBpbmcgb24gdGhlIHRyaWdnZXJpbmcgZWxlbWVudFxuY29uc3Qgd3JhcEFzeW5jRm9yaU9TID0gZm4gPT4gaU9TID8gKCkgPT4gc2V0VGltZW91dCgoKSA9PiBmbigpLCAxMDApIDogZm47XG5cbmV4cG9ydCBmdW5jdGlvbiBuZ2JBdXRvQ2xvc2UoXG4gICAgem9uZTogTmdab25lLCBkb2N1bWVudDogYW55LCB0eXBlOiBib29sZWFuIHwgJ2luc2lkZScgfCAnb3V0c2lkZScsIGNsb3NlOiAoKSA9PiB2b2lkLCBjbG9zZWQkOiBPYnNlcnZhYmxlPGFueT4sXG4gICAgaW5zaWRlRWxlbWVudHM6IEhUTUxFbGVtZW50W10sIGlnbm9yZUVsZW1lbnRzPzogSFRNTEVsZW1lbnRbXSwgaW5zaWRlU2VsZWN0b3I/OiBzdHJpbmcpIHtcbiAgLy8gY2xvc2luZyBvbiBFU0MgYW5kIG91dHNpZGUgY2xpY2tzXG4gIGlmICh0eXBlKSB7XG4gICAgem9uZS5ydW5PdXRzaWRlQW5ndWxhcih3cmFwQXN5bmNGb3JpT1MoKCkgPT4ge1xuXG4gICAgICBjb25zdCBzaG91bGRDbG9zZU9uQ2xpY2sgPSAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGV2ZW50LnRhcmdldCBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgaWYgKGV2ZW50LmJ1dHRvbiA9PT0gMiB8fCBpc0NvbnRhaW5lZEluKGVsZW1lbnQsIGlnbm9yZUVsZW1lbnRzKSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZSA9PT0gJ2luc2lkZScpIHtcbiAgICAgICAgICByZXR1cm4gaXNDb250YWluZWRJbihlbGVtZW50LCBpbnNpZGVFbGVtZW50cykgJiYgbWF0Y2hlc1NlbGVjdG9ySWZBbnkoZWxlbWVudCwgaW5zaWRlU2VsZWN0b3IpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdvdXRzaWRlJykge1xuICAgICAgICAgIHJldHVybiAhaXNDb250YWluZWRJbihlbGVtZW50LCBpbnNpZGVFbGVtZW50cyk7XG4gICAgICAgIH0gZWxzZSAvKiBpZiAodHlwZSA9PT0gdHJ1ZSkgKi8ge1xuICAgICAgICAgIHJldHVybiBtYXRjaGVzU2VsZWN0b3JJZkFueShlbGVtZW50LCBpbnNpZGVTZWxlY3RvcikgfHwgIWlzQ29udGFpbmVkSW4oZWxlbWVudCwgaW5zaWRlRWxlbWVudHMpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBlc2NhcGVzJCA9IGZyb21FdmVudDxLZXlib2FyZEV2ZW50Pihkb2N1bWVudCwgJ2tleWRvd24nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFrZVVudGlsKGNsb3NlZCQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpkZXByZWNhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcihlID0+IGUud2hpY2ggPT09IEtleS5Fc2NhcGUpLCB0YXAoZSA9PiBlLnByZXZlbnREZWZhdWx0KCkpKTtcblxuXG4gICAgICAvLyB3ZSBoYXZlIHRvIHByZS1jYWxjdWxhdGUgJ3Nob3VsZENsb3NlT25DbGljaycgb24gJ21vdXNlZG93bi90b3VjaHN0YXJ0JyxcbiAgICAgIC8vIGJlY2F1c2Ugb24gJ21vdXNldXAvdG91Y2hlbmQnIERPTSBub2RlcyBtaWdodCBiZSBkZXRhY2hlZFxuICAgICAgY29uc3QgbW91c2VEb3ducyQgPVxuICAgICAgICAgIGZyb21FdmVudDxNb3VzZUV2ZW50Pihkb2N1bWVudCwgJ21vdXNlZG93bicpLnBpcGUobWFwKHNob3VsZENsb3NlT25DbGljayksIHRha2VVbnRpbChjbG9zZWQkKSk7XG5cbiAgICAgIGNvbnN0IGNsb3NlYWJsZUNsaWNrcyQgPSBmcm9tRXZlbnQ8TW91c2VFdmVudD4oZG9jdW1lbnQsICdtb3VzZXVwJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aXRoTGF0ZXN0RnJvbShtb3VzZURvd25zJCksIGZpbHRlcigoW18sIHNob3VsZENsb3NlXSkgPT4gc2hvdWxkQ2xvc2UpLCBkZWxheSgwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRha2VVbnRpbChjbG9zZWQkKSkgYXMgT2JzZXJ2YWJsZTxNb3VzZUV2ZW50PjtcblxuXG4gICAgICByYWNlPEV2ZW50PihbZXNjYXBlcyQsIGNsb3NlYWJsZUNsaWNrcyRdKS5zdWJzY3JpYmUoKCkgPT4gem9uZS5ydW4oY2xvc2UpKTtcbiAgICB9KSk7XG4gIH1cbn1cbiJdfQ==
/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { fromEvent, race } from 'rxjs';
import { delay, filter, map, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { Key } from './key';
import { closest } from './util';
/** @type {?} */
const isContainedIn = (/**
 * @param {?} element
 * @param {?=} array
 * @return {?}
 */
(element, array) => array ? array.some((/**
 * @param {?} item
 * @return {?}
 */
item => item.contains(element))) : false);
const ɵ0 = isContainedIn;
/** @type {?} */
const matchesSelectorIfAny = (/**
 * @param {?} element
 * @param {?=} selector
 * @return {?}
 */
(element, selector) => !selector || closest(element, selector) != null);
const ɵ1 = matchesSelectorIfAny;
// we'll have to use 'touch' events instead of 'mouse' events on iOS and add a more significant delay
// to avoid re-opening when handling (click) on a toggling element
// TODO: use proper Angular platform detection when NgbAutoClose becomes a service and we can inject PLATFORM_ID
/** @type {?} */
let iOS = false;
if (typeof navigator !== 'undefined') {
    iOS = !!navigator.userAgent && /iPad|iPhone|iPod/.test(navigator.userAgent);
}
// setting 'ngbAutoClose' synchronously on iOS results in immediate popup closing
// when tapping on the triggering element
/** @type {?} */
const wrapAsyncForiOS = (/**
 * @param {?} fn
 * @return {?}
 */
fn => iOS ? (/**
 * @return {?}
 */
() => setTimeout((/**
 * @return {?}
 */
() => fn()), 100)) : fn);
const ɵ2 = wrapAsyncForiOS;
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
        () => {
            /** @type {?} */
            const shouldCloseOnClick = (/**
             * @param {?} event
             * @return {?}
             */
            (event) => {
                /** @type {?} */
                const element = (/** @type {?} */ (event.target));
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
            const escapes$ = fromEvent(document, 'keydown')
                .pipe(takeUntil(closed$), 
            // tslint:disable-next-line:deprecation
            filter((/**
             * @param {?} e
             * @return {?}
             */
            e => e.which === Key.Escape)), tap((/**
             * @param {?} e
             * @return {?}
             */
            e => e.preventDefault())));
            // we have to pre-calculate 'shouldCloseOnClick' on 'mousedown/touchstart',
            // because on 'mouseup/touchend' DOM nodes might be detached
            /** @type {?} */
            const mouseDowns$ = fromEvent(document, 'mousedown').pipe(map(shouldCloseOnClick), takeUntil(closed$));
            /** @type {?} */
            const closeableClicks$ = (/** @type {?} */ (fromEvent(document, 'mouseup')
                .pipe(withLatestFrom(mouseDowns$), filter((/**
             * @param {?} __0
             * @return {?}
             */
            ([_, shouldClose]) => shouldClose)), delay(0), takeUntil(closed$))));
            race([escapes$, closeableClicks$]).subscribe((/**
             * @return {?}
             */
            () => zone.run(close)));
        })));
    }
}
export { ɵ0, ɵ1, ɵ2 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b2Nsb3NlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQG5nLWJvb3RzdHJhcC9uZy1ib290c3RyYXAvIiwic291cmNlcyI6WyJ1dGlsL2F1dG9jbG9zZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQ0EsT0FBTyxFQUFDLFNBQVMsRUFBYyxJQUFJLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDakQsT0FBTyxFQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsY0FBYyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDbEYsT0FBTyxFQUFDLEdBQUcsRUFBQyxNQUFNLE9BQU8sQ0FBQztBQUMxQixPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sUUFBUSxDQUFDOztNQUV6QixhQUFhOzs7OztBQUFHLENBQUMsT0FBb0IsRUFBRSxLQUFxQixFQUFFLEVBQUUsQ0FDbEUsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSTs7OztBQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUE7OztNQUV4RCxvQkFBb0I7Ozs7O0FBQUcsQ0FBQyxPQUFvQixFQUFFLFFBQWlCLEVBQUUsRUFBRSxDQUNyRSxDQUFDLFFBQVEsSUFBSSxPQUFPLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQTs7Ozs7O0lBSy9DLEdBQUcsR0FBRyxLQUFLO0FBQ2YsSUFBSSxPQUFPLFNBQVMsS0FBSyxXQUFXLEVBQUU7SUFDcEMsR0FBRyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxJQUFJLGtCQUFrQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7Q0FDN0U7Ozs7TUFJSyxlQUFlOzs7O0FBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7O0FBQUMsR0FBRyxFQUFFLENBQUMsVUFBVTs7O0FBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUUsR0FBRyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQTs7Ozs7Ozs7Ozs7OztBQUUxRSxNQUFNLFVBQVUsWUFBWSxDQUN4QixJQUFZLEVBQUUsUUFBYSxFQUFFLElBQW9DLEVBQUUsS0FBaUIsRUFBRSxPQUF3QixFQUM5RyxjQUE2QixFQUFFLGNBQThCLEVBQUUsY0FBdUI7SUFDeEYsb0NBQW9DO0lBQ3BDLElBQUksSUFBSSxFQUFFO1FBQ1IsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGVBQWU7OztRQUFDLEdBQUcsRUFBRTs7a0JBRXBDLGtCQUFrQjs7OztZQUFHLENBQUMsS0FBaUIsRUFBRSxFQUFFOztzQkFDekMsT0FBTyxHQUFHLG1CQUFBLEtBQUssQ0FBQyxNQUFNLEVBQWU7Z0JBQzNDLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksYUFBYSxDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsRUFBRTtvQkFDaEUsT0FBTyxLQUFLLENBQUM7aUJBQ2Q7Z0JBQ0QsSUFBSSxJQUFJLEtBQUssUUFBUSxFQUFFO29CQUNyQixPQUFPLGFBQWEsQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLElBQUksb0JBQW9CLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDO2lCQUNoRztxQkFBTSxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7b0JBQzdCLE9BQU8sQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDO2lCQUNoRDtxQkFBTSx3QkFBd0IsQ0FBQztvQkFDOUIsT0FBTyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDO2lCQUNqRztZQUNILENBQUMsQ0FBQTs7a0JBRUssUUFBUSxHQUFHLFNBQVMsQ0FBZ0IsUUFBUSxFQUFFLFNBQVMsQ0FBQztpQkFDeEMsSUFBSSxDQUNELFNBQVMsQ0FBQyxPQUFPLENBQUM7WUFDbEIsdUNBQXVDO1lBQ3ZDLE1BQU07Ozs7WUFBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssR0FBRyxDQUFDLE1BQU0sRUFBQyxFQUFFLEdBQUc7Ozs7WUFBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxjQUFjLEVBQUUsRUFBQyxDQUFDOzs7O2tCQUtyRixXQUFXLEdBQ2IsU0FBUyxDQUFhLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztrQkFFNUYsZ0JBQWdCLEdBQUcsbUJBQUEsU0FBUyxDQUFhLFFBQVEsRUFBRSxTQUFTLENBQUM7aUJBQ3JDLElBQUksQ0FDRCxjQUFjLENBQUMsV0FBVyxDQUFDLEVBQUUsTUFBTTs7OztZQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLEVBQUUsRUFBRSxDQUFDLFdBQVcsRUFBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFDaEYsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQTBCO1lBRzlFLElBQUksQ0FBUSxDQUFDLFFBQVEsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsU0FBUzs7O1lBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBQyxDQUFDO1FBQzdFLENBQUMsRUFBQyxDQUFDLENBQUM7S0FDTDtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge05nWm9uZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge2Zyb21FdmVudCwgT2JzZXJ2YWJsZSwgcmFjZX0gZnJvbSAncnhqcyc7XG5pbXBvcnQge2RlbGF5LCBmaWx0ZXIsIG1hcCwgdGFrZVVudGlsLCB0YXAsIHdpdGhMYXRlc3RGcm9tfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge0tleX0gZnJvbSAnLi9rZXknO1xuaW1wb3J0IHtjbG9zZXN0fSBmcm9tICcuL3V0aWwnO1xuXG5jb25zdCBpc0NvbnRhaW5lZEluID0gKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBhcnJheT86IEhUTUxFbGVtZW50W10pID0+XG4gICAgYXJyYXkgPyBhcnJheS5zb21lKGl0ZW0gPT4gaXRlbS5jb250YWlucyhlbGVtZW50KSkgOiBmYWxzZTtcblxuY29uc3QgbWF0Y2hlc1NlbGVjdG9ySWZBbnkgPSAoZWxlbWVudDogSFRNTEVsZW1lbnQsIHNlbGVjdG9yPzogc3RyaW5nKSA9PlxuICAgICFzZWxlY3RvciB8fCBjbG9zZXN0KGVsZW1lbnQsIHNlbGVjdG9yKSAhPSBudWxsO1xuXG4vLyB3ZSdsbCBoYXZlIHRvIHVzZSAndG91Y2gnIGV2ZW50cyBpbnN0ZWFkIG9mICdtb3VzZScgZXZlbnRzIG9uIGlPUyBhbmQgYWRkIGEgbW9yZSBzaWduaWZpY2FudCBkZWxheVxuLy8gdG8gYXZvaWQgcmUtb3BlbmluZyB3aGVuIGhhbmRsaW5nIChjbGljaykgb24gYSB0b2dnbGluZyBlbGVtZW50XG4vLyBUT0RPOiB1c2UgcHJvcGVyIEFuZ3VsYXIgcGxhdGZvcm0gZGV0ZWN0aW9uIHdoZW4gTmdiQXV0b0Nsb3NlIGJlY29tZXMgYSBzZXJ2aWNlIGFuZCB3ZSBjYW4gaW5qZWN0IFBMQVRGT1JNX0lEXG5sZXQgaU9TID0gZmFsc2U7XG5pZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgaU9TID0gISFuYXZpZ2F0b3IudXNlckFnZW50ICYmIC9pUGFkfGlQaG9uZXxpUG9kLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xufVxuXG4vLyBzZXR0aW5nICduZ2JBdXRvQ2xvc2UnIHN5bmNocm9ub3VzbHkgb24gaU9TIHJlc3VsdHMgaW4gaW1tZWRpYXRlIHBvcHVwIGNsb3Npbmdcbi8vIHdoZW4gdGFwcGluZyBvbiB0aGUgdHJpZ2dlcmluZyBlbGVtZW50XG5jb25zdCB3cmFwQXN5bmNGb3JpT1MgPSBmbiA9PiBpT1MgPyAoKSA9PiBzZXRUaW1lb3V0KCgpID0+IGZuKCksIDEwMCkgOiBmbjtcblxuZXhwb3J0IGZ1bmN0aW9uIG5nYkF1dG9DbG9zZShcbiAgICB6b25lOiBOZ1pvbmUsIGRvY3VtZW50OiBhbnksIHR5cGU6IGJvb2xlYW4gfCAnaW5zaWRlJyB8ICdvdXRzaWRlJywgY2xvc2U6ICgpID0+IHZvaWQsIGNsb3NlZCQ6IE9ic2VydmFibGU8YW55PixcbiAgICBpbnNpZGVFbGVtZW50czogSFRNTEVsZW1lbnRbXSwgaWdub3JlRWxlbWVudHM/OiBIVE1MRWxlbWVudFtdLCBpbnNpZGVTZWxlY3Rvcj86IHN0cmluZykge1xuICAvLyBjbG9zaW5nIG9uIEVTQyBhbmQgb3V0c2lkZSBjbGlja3NcbiAgaWYgKHR5cGUpIHtcbiAgICB6b25lLnJ1bk91dHNpZGVBbmd1bGFyKHdyYXBBc3luY0ZvcmlPUygoKSA9PiB7XG5cbiAgICAgIGNvbnN0IHNob3VsZENsb3NlT25DbGljayA9IChldmVudDogTW91c2VFdmVudCkgPT4ge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gZXZlbnQudGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xuICAgICAgICBpZiAoZXZlbnQuYnV0dG9uID09PSAyIHx8IGlzQ29udGFpbmVkSW4oZWxlbWVudCwgaWdub3JlRWxlbWVudHMpKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlID09PSAnaW5zaWRlJykge1xuICAgICAgICAgIHJldHVybiBpc0NvbnRhaW5lZEluKGVsZW1lbnQsIGluc2lkZUVsZW1lbnRzKSAmJiBtYXRjaGVzU2VsZWN0b3JJZkFueShlbGVtZW50LCBpbnNpZGVTZWxlY3Rvcik7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ291dHNpZGUnKSB7XG4gICAgICAgICAgcmV0dXJuICFpc0NvbnRhaW5lZEluKGVsZW1lbnQsIGluc2lkZUVsZW1lbnRzKTtcbiAgICAgICAgfSBlbHNlIC8qIGlmICh0eXBlID09PSB0cnVlKSAqLyB7XG4gICAgICAgICAgcmV0dXJuIG1hdGNoZXNTZWxlY3RvcklmQW55KGVsZW1lbnQsIGluc2lkZVNlbGVjdG9yKSB8fCAhaXNDb250YWluZWRJbihlbGVtZW50LCBpbnNpZGVFbGVtZW50cyk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGVzY2FwZXMkID0gZnJvbUV2ZW50PEtleWJvYXJkRXZlbnQ+KGRvY3VtZW50LCAna2V5ZG93bicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWtlVW50aWwoY2xvc2VkJCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOmRlcHJlY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyKGUgPT4gZS53aGljaCA9PT0gS2V5LkVzY2FwZSksIHRhcChlID0+IGUucHJldmVudERlZmF1bHQoKSkpO1xuXG5cbiAgICAgIC8vIHdlIGhhdmUgdG8gcHJlLWNhbGN1bGF0ZSAnc2hvdWxkQ2xvc2VPbkNsaWNrJyBvbiAnbW91c2Vkb3duL3RvdWNoc3RhcnQnLFxuICAgICAgLy8gYmVjYXVzZSBvbiAnbW91c2V1cC90b3VjaGVuZCcgRE9NIG5vZGVzIG1pZ2h0IGJlIGRldGFjaGVkXG4gICAgICBjb25zdCBtb3VzZURvd25zJCA9XG4gICAgICAgICAgZnJvbUV2ZW50PE1vdXNlRXZlbnQ+KGRvY3VtZW50LCAnbW91c2Vkb3duJykucGlwZShtYXAoc2hvdWxkQ2xvc2VPbkNsaWNrKSwgdGFrZVVudGlsKGNsb3NlZCQpKTtcblxuICAgICAgY29uc3QgY2xvc2VhYmxlQ2xpY2tzJCA9IGZyb21FdmVudDxNb3VzZUV2ZW50Pihkb2N1bWVudCwgJ21vdXNldXAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpdGhMYXRlc3RGcm9tKG1vdXNlRG93bnMkKSwgZmlsdGVyKChbXywgc2hvdWxkQ2xvc2VdKSA9PiBzaG91bGRDbG9zZSksIGRlbGF5KDApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFrZVVudGlsKGNsb3NlZCQpKSBhcyBPYnNlcnZhYmxlPE1vdXNlRXZlbnQ+O1xuXG5cbiAgICAgIHJhY2U8RXZlbnQ+KFtlc2NhcGVzJCwgY2xvc2VhYmxlQ2xpY2tzJF0pLnN1YnNjcmliZSgoKSA9PiB6b25lLnJ1bihjbG9zZSkpO1xuICAgIH0pKTtcbiAgfVxufVxuIl19
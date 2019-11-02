/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { NgbDate } from './ngb-date';
import { isDefined } from '../util/util';
/**
 * @param {?} prev
 * @param {?} next
 * @return {?}
 */
export function isChangedDate(prev, next) {
    return !dateComparator(prev, next);
}
/**
 * @param {?} prev
 * @param {?} next
 * @return {?}
 */
export function isChangedMonth(prev, next) {
    return !prev && !next ? false : !prev || !next ? true : prev.year !== next.year || prev.month !== next.month;
}
/**
 * @param {?} prev
 * @param {?} next
 * @return {?}
 */
export function dateComparator(prev, next) {
    return (!prev && !next) || (!!prev && !!next && prev.equals(next));
}
/**
 * @param {?} minDate
 * @param {?} maxDate
 * @return {?}
 */
export function checkMinBeforeMax(minDate, maxDate) {
    if (maxDate && minDate && maxDate.before(minDate)) {
        throw new Error(`'maxDate' ${maxDate} should be greater than 'minDate' ${minDate}`);
    }
}
/**
 * @param {?} date
 * @param {?} minDate
 * @param {?} maxDate
 * @return {?}
 */
export function checkDateInRange(date, minDate, maxDate) {
    if (date && minDate && date.before(minDate)) {
        return minDate;
    }
    if (date && maxDate && date.after(maxDate)) {
        return maxDate;
    }
    return date;
}
/**
 * @param {?} date
 * @param {?} state
 * @return {?}
 */
export function isDateSelectable(date, state) {
    const { minDate, maxDate, disabled, markDisabled } = state;
    // clang-format off
    return !(!isDefined(date) ||
        disabled ||
        (markDisabled && markDisabled(date, { year: date.year, month: date.month })) ||
        (minDate && date.before(minDate)) ||
        (maxDate && date.after(maxDate)));
    // clang-format on
}
/**
 * @param {?} calendar
 * @param {?} date
 * @param {?} minDate
 * @param {?} maxDate
 * @return {?}
 */
export function generateSelectBoxMonths(calendar, date, minDate, maxDate) {
    if (!date) {
        return [];
    }
    /** @type {?} */
    let months = calendar.getMonths(date.year);
    if (minDate && date.year === minDate.year) {
        /** @type {?} */
        const index = months.findIndex((/**
         * @param {?} month
         * @return {?}
         */
        month => month === minDate.month));
        months = months.slice(index);
    }
    if (maxDate && date.year === maxDate.year) {
        /** @type {?} */
        const index = months.findIndex((/**
         * @param {?} month
         * @return {?}
         */
        month => month === maxDate.month));
        months = months.slice(0, index + 1);
    }
    return months;
}
/**
 * @param {?} date
 * @param {?} minDate
 * @param {?} maxDate
 * @return {?}
 */
export function generateSelectBoxYears(date, minDate, maxDate) {
    if (!date) {
        return [];
    }
    /** @type {?} */
    const start = minDate ? Math.max(minDate.year, date.year - 500) : date.year - 10;
    /** @type {?} */
    const end = maxDate ? Math.min(maxDate.year, date.year + 500) : date.year + 10;
    /** @type {?} */
    const length = end - start + 1;
    /** @type {?} */
    const numbers = Array(length);
    for (let i = 0; i < length; i++) {
        numbers[i] = start + i;
    }
    return numbers;
}
/**
 * @param {?} calendar
 * @param {?} date
 * @param {?} maxDate
 * @return {?}
 */
export function nextMonthDisabled(calendar, date, maxDate) {
    /** @type {?} */
    const nextDate = Object.assign(calendar.getNext(date, 'm'), { day: 1 });
    return maxDate && nextDate.after(maxDate);
}
/**
 * @param {?} calendar
 * @param {?} date
 * @param {?} minDate
 * @return {?}
 */
export function prevMonthDisabled(calendar, date, minDate) {
    /** @type {?} */
    const prevDate = Object.assign(calendar.getPrev(date, 'm'), { day: 1 });
    return minDate && (prevDate.year === minDate.year && prevDate.month < minDate.month ||
        prevDate.year < minDate.year && minDate.month === 1);
}
/**
 * @param {?} calendar
 * @param {?} date
 * @param {?} state
 * @param {?} i18n
 * @param {?} force
 * @return {?}
 */
export function buildMonths(calendar, date, state, i18n, force) {
    const { displayMonths, months } = state;
    // move old months to a temporary array
    /** @type {?} */
    const monthsToReuse = months.splice(0, months.length);
    // generate new first dates, nullify or reuse months
    /** @type {?} */
    const firstDates = Array.from({ length: displayMonths }, (/**
     * @param {?} _
     * @param {?} i
     * @return {?}
     */
    (_, i) => {
        /** @type {?} */
        const firstDate = Object.assign(calendar.getNext(date, 'm', i), { day: 1 });
        months[i] = null;
        if (!force) {
            /** @type {?} */
            const reusedIndex = monthsToReuse.findIndex((/**
             * @param {?} month
             * @return {?}
             */
            month => month.firstDate.equals(firstDate)));
            // move reused month back to months
            if (reusedIndex !== -1) {
                months[i] = monthsToReuse.splice(reusedIndex, 1)[0];
            }
        }
        return firstDate;
    }));
    // rebuild nullified months
    firstDates.forEach((/**
     * @param {?} firstDate
     * @param {?} i
     * @return {?}
     */
    (firstDate, i) => {
        if (months[i] === null) {
            months[i] = buildMonth(calendar, firstDate, state, i18n, monthsToReuse.shift() || (/** @type {?} */ ({})));
        }
    }));
    return months;
}
/**
 * @param {?} calendar
 * @param {?} date
 * @param {?} state
 * @param {?} i18n
 * @param {?=} month
 * @return {?}
 */
export function buildMonth(calendar, date, state, i18n, month = (/** @type {?} */ ({}))) {
    const { dayTemplateData, minDate, maxDate, firstDayOfWeek, markDisabled, outsideDays } = state;
    /** @type {?} */
    const calendarToday = calendar.getToday();
    month.firstDate = null;
    month.lastDate = null;
    month.number = date.month;
    month.year = date.year;
    month.weeks = month.weeks || [];
    month.weekdays = month.weekdays || [];
    date = getFirstViewDate(calendar, date, firstDayOfWeek);
    // month has weeks
    for (let week = 0; week < calendar.getWeeksPerMonth(); week++) {
        /** @type {?} */
        let weekObject = month.weeks[week];
        if (!weekObject) {
            weekObject = month.weeks[week] = { number: 0, days: [], collapsed: true };
        }
        /** @type {?} */
        const days = weekObject.days;
        // week has days
        for (let day = 0; day < calendar.getDaysPerWeek(); day++) {
            if (week === 0) {
                month.weekdays[day] = calendar.getWeekday(date);
            }
            /** @type {?} */
            const newDate = new NgbDate(date.year, date.month, date.day);
            /** @type {?} */
            const nextDate = calendar.getNext(newDate);
            /** @type {?} */
            const ariaLabel = i18n.getDayAriaLabel(newDate);
            // marking date as disabled
            /** @type {?} */
            let disabled = !!((minDate && newDate.before(minDate)) || (maxDate && newDate.after(maxDate)));
            if (!disabled && markDisabled) {
                disabled = markDisabled(newDate, { month: month.number, year: month.year });
            }
            // today
            /** @type {?} */
            let today = newDate.equals(calendarToday);
            // adding user-provided data to the context
            /** @type {?} */
            let contextUserData = dayTemplateData ? dayTemplateData(newDate, { month: month.number, year: month.year }) : undefined;
            // saving first date of the month
            if (month.firstDate === null && newDate.month === month.number) {
                month.firstDate = newDate;
            }
            // saving last date of the month
            if (newDate.month === month.number && nextDate.month !== month.number) {
                month.lastDate = newDate;
            }
            /** @type {?} */
            let dayObject = days[day];
            if (!dayObject) {
                dayObject = days[day] = (/** @type {?} */ ({}));
            }
            dayObject.date = newDate;
            dayObject.context = Object.assign(dayObject.context || {}, {
                $implicit: newDate,
                date: newDate,
                data: contextUserData,
                currentMonth: month.number, disabled,
                focused: false,
                selected: false, today
            });
            dayObject.tabindex = -1;
            dayObject.ariaLabel = ariaLabel;
            dayObject.hidden = false;
            date = nextDate;
        }
        weekObject.number = calendar.getWeekNumber(days.map((/**
         * @param {?} day
         * @return {?}
         */
        day => day.date)), firstDayOfWeek);
        // marking week as collapsed
        weekObject.collapsed = outsideDays === 'collapsed' && days[0].date.month !== month.number &&
            days[days.length - 1].date.month !== month.number;
    }
    return month;
}
/**
 * @param {?} calendar
 * @param {?} date
 * @param {?} firstDayOfWeek
 * @return {?}
 */
export function getFirstViewDate(calendar, date, firstDayOfWeek) {
    /** @type {?} */
    const daysPerWeek = calendar.getDaysPerWeek();
    /** @type {?} */
    const firstMonthDate = new NgbDate(date.year, date.month, 1);
    /** @type {?} */
    const dayOfWeek = calendar.getWeekday(firstMonthDate) % daysPerWeek;
    return calendar.getPrev(firstMonthDate, 'd', (daysPerWeek + dayOfWeek - firstDayOfWeek) % daysPerWeek);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci10b29scy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0BuZy1ib290c3RyYXAvbmctYm9vdHN0cmFwLyIsInNvdXJjZXMiOlsiZGF0ZXBpY2tlci9kYXRlcGlja2VyLXRvb2xzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBR25DLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxjQUFjLENBQUM7Ozs7OztBQUd2QyxNQUFNLFVBQVUsYUFBYSxDQUFDLElBQWEsRUFBRSxJQUFhO0lBQ3hELE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3JDLENBQUM7Ozs7OztBQUVELE1BQU0sVUFBVSxjQUFjLENBQUMsSUFBYSxFQUFFLElBQWE7SUFDekQsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQy9HLENBQUM7Ozs7OztBQUVELE1BQU0sVUFBVSxjQUFjLENBQUMsSUFBYSxFQUFFLElBQWE7SUFDekQsT0FBTyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLENBQUM7Ozs7OztBQUVELE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxPQUFnQixFQUFFLE9BQWdCO0lBQ2xFLElBQUksT0FBTyxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ2pELE1BQU0sSUFBSSxLQUFLLENBQUMsYUFBYSxPQUFPLHFDQUFxQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0tBQ3JGO0FBQ0gsQ0FBQzs7Ozs7OztBQUVELE1BQU0sVUFBVSxnQkFBZ0IsQ0FBQyxJQUFhLEVBQUUsT0FBZ0IsRUFBRSxPQUFnQjtJQUNoRixJQUFJLElBQUksSUFBSSxPQUFPLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRTtRQUMzQyxPQUFPLE9BQU8sQ0FBQztLQUNoQjtJQUNELElBQUksSUFBSSxJQUFJLE9BQU8sSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQzFDLE9BQU8sT0FBTyxDQUFDO0tBQ2hCO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDOzs7Ozs7QUFFRCxNQUFNLFVBQVUsZ0JBQWdCLENBQUMsSUFBYSxFQUFFLEtBQTBCO1VBQ2xFLEVBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFDLEdBQUcsS0FBSztJQUN4RCxtQkFBbUI7SUFDbkIsT0FBTyxDQUFDLENBQ04sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO1FBQ2hCLFFBQVE7UUFDUixDQUFDLFlBQVksSUFBSSxZQUFZLENBQUMsSUFBSSxFQUFFLEVBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDO1FBQzFFLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDakMsQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUNqQyxDQUFDO0lBQ0Ysa0JBQWtCO0FBQ3BCLENBQUM7Ozs7Ozs7O0FBRUQsTUFBTSxVQUFVLHVCQUF1QixDQUFDLFFBQXFCLEVBQUUsSUFBYSxFQUFFLE9BQWdCLEVBQUUsT0FBZ0I7SUFDOUcsSUFBSSxDQUFDLElBQUksRUFBRTtRQUNULE9BQU8sRUFBRSxDQUFDO0tBQ1g7O1FBRUcsTUFBTSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztJQUUxQyxJQUFJLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLE9BQU8sQ0FBQyxJQUFJLEVBQUU7O2NBQ25DLEtBQUssR0FBRyxNQUFNLENBQUMsU0FBUzs7OztRQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxLQUFLLE9BQU8sQ0FBQyxLQUFLLEVBQUM7UUFDaEUsTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDOUI7SUFFRCxJQUFJLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLE9BQU8sQ0FBQyxJQUFJLEVBQUU7O2NBQ25DLEtBQUssR0FBRyxNQUFNLENBQUMsU0FBUzs7OztRQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxLQUFLLE9BQU8sQ0FBQyxLQUFLLEVBQUM7UUFDaEUsTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztLQUNyQztJQUVELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7Ozs7Ozs7QUFFRCxNQUFNLFVBQVUsc0JBQXNCLENBQUMsSUFBYSxFQUFFLE9BQWdCLEVBQUUsT0FBZ0I7SUFDdEYsSUFBSSxDQUFDLElBQUksRUFBRTtRQUNULE9BQU8sRUFBRSxDQUFDO0tBQ1g7O1VBRUssS0FBSyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRTs7VUFDMUUsR0FBRyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRTs7VUFFeEUsTUFBTSxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsQ0FBQzs7VUFDeEIsT0FBTyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7SUFDN0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUMvQixPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQztLQUN4QjtJQUVELE9BQU8sT0FBTyxDQUFDO0FBQ2pCLENBQUM7Ozs7Ozs7QUFFRCxNQUFNLFVBQVUsaUJBQWlCLENBQUMsUUFBcUIsRUFBRSxJQUFhLEVBQUUsT0FBZ0I7O1VBQ2hGLFFBQVEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUMsR0FBRyxFQUFFLENBQUMsRUFBQyxDQUFDO0lBQ3JFLE9BQU8sT0FBTyxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDNUMsQ0FBQzs7Ozs7OztBQUVELE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxRQUFxQixFQUFFLElBQWEsRUFBRSxPQUFnQjs7VUFDaEYsUUFBUSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBQyxHQUFHLEVBQUUsQ0FBQyxFQUFDLENBQUM7SUFDckUsT0FBTyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLE9BQU8sQ0FBQyxJQUFJLElBQUksUUFBUSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSztRQUNoRSxRQUFRLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztBQUMxRSxDQUFDOzs7Ozs7Ozs7QUFFRCxNQUFNLFVBQVUsV0FBVyxDQUN2QixRQUFxQixFQUFFLElBQWEsRUFBRSxLQUEwQixFQUFFLElBQXVCLEVBQ3pGLEtBQWM7VUFDVixFQUFDLGFBQWEsRUFBRSxNQUFNLEVBQUMsR0FBRyxLQUFLOzs7VUFFL0IsYUFBYSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUM7OztVQUcvQyxVQUFVLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFDLE1BQU0sRUFBRSxhQUFhLEVBQUM7Ozs7O0lBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7O2NBQ3hELFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUMsQ0FBQztRQUN6RSxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBRWpCLElBQUksQ0FBQyxLQUFLLEVBQUU7O2tCQUNKLFdBQVcsR0FBRyxhQUFhLENBQUMsU0FBUzs7OztZQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUM7WUFDdkYsbUNBQW1DO1lBQ25DLElBQUksV0FBVyxLQUFLLENBQUMsQ0FBQyxFQUFFO2dCQUN0QixNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDckQ7U0FDRjtRQUVELE9BQU8sU0FBUyxDQUFDO0lBQ25CLENBQUMsRUFBQztJQUVGLDJCQUEyQjtJQUMzQixVQUFVLENBQUMsT0FBTzs7Ozs7SUFBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNsQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDdEIsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsYUFBYSxDQUFDLEtBQUssRUFBRSxJQUFJLG1CQUFBLEVBQUUsRUFBa0IsQ0FBQyxDQUFDO1NBQ3pHO0lBQ0gsQ0FBQyxFQUFDLENBQUM7SUFFSCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDOzs7Ozs7Ozs7QUFFRCxNQUFNLFVBQVUsVUFBVSxDQUN0QixRQUFxQixFQUFFLElBQWEsRUFBRSxLQUEwQixFQUFFLElBQXVCLEVBQ3pGLFFBQXdCLG1CQUFBLEVBQUUsRUFBa0I7VUFDeEMsRUFBQyxlQUFlLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBQyxHQUFHLEtBQUs7O1VBQ3RGLGFBQWEsR0FBRyxRQUFRLENBQUMsUUFBUSxFQUFFO0lBRXpDLEtBQUssQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0lBQ3ZCLEtBQUssQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0lBQ3RCLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztJQUMxQixLQUFLLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDdkIsS0FBSyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQztJQUNoQyxLQUFLLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDO0lBRXRDLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBRXhELGtCQUFrQjtJQUNsQixLQUFLLElBQUksSUFBSSxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsUUFBUSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUU7O1lBQ3pELFVBQVUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztRQUNsQyxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2YsVUFBVSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBQyxDQUFDO1NBQ3pFOztjQUNLLElBQUksR0FBRyxVQUFVLENBQUMsSUFBSTtRQUU1QixnQkFBZ0I7UUFDaEIsS0FBSyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLFFBQVEsQ0FBQyxjQUFjLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRTtZQUN4RCxJQUFJLElBQUksS0FBSyxDQUFDLEVBQUU7Z0JBQ2QsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2pEOztrQkFFSyxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUM7O2tCQUN0RCxRQUFRLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7O2tCQUVwQyxTQUFTLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUM7OztnQkFHM0MsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDOUYsSUFBSSxDQUFDLFFBQVEsSUFBSSxZQUFZLEVBQUU7Z0JBQzdCLFFBQVEsR0FBRyxZQUFZLENBQUMsT0FBTyxFQUFFLEVBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDO2FBQzNFOzs7Z0JBR0csS0FBSyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDOzs7Z0JBR3JDLGVBQWUsR0FDZixlQUFlLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsRUFBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7WUFFbkcsaUNBQWlDO1lBQ2pDLElBQUksS0FBSyxDQUFDLFNBQVMsS0FBSyxJQUFJLElBQUksT0FBTyxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsTUFBTSxFQUFFO2dCQUM5RCxLQUFLLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQzthQUMzQjtZQUVELGdDQUFnQztZQUNoQyxJQUFJLE9BQU8sQ0FBQyxLQUFLLEtBQUssS0FBSyxDQUFDLE1BQU0sSUFBSSxRQUFRLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQyxNQUFNLEVBQUU7Z0JBQ3JFLEtBQUssQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO2FBQzFCOztnQkFFRyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztZQUN6QixJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNkLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsbUJBQUEsRUFBRSxFQUFnQixDQUFDO2FBQzVDO1lBQ0QsU0FBUyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUM7WUFDekIsU0FBUyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLElBQUksRUFBRSxFQUFFO2dCQUN6RCxTQUFTLEVBQUUsT0FBTztnQkFDbEIsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsSUFBSSxFQUFFLGVBQWU7Z0JBQ3JCLFlBQVksRUFBRSxLQUFLLENBQUMsTUFBTSxFQUFFLFFBQVE7Z0JBQ3BDLE9BQU8sRUFBRSxLQUFLO2dCQUNkLFFBQVEsRUFBRSxLQUFLLEVBQUUsS0FBSzthQUN2QixDQUFDLENBQUM7WUFDSCxTQUFTLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLFNBQVMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1lBQ2hDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1lBRXpCLElBQUksR0FBRyxRQUFRLENBQUM7U0FDakI7UUFFRCxVQUFVLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUc7Ozs7UUFBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUV0Riw0QkFBNEI7UUFDNUIsVUFBVSxDQUFDLFNBQVMsR0FBRyxXQUFXLEtBQUssV0FBVyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQyxNQUFNO1lBQ3JGLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssS0FBSyxDQUFDLE1BQU0sQ0FBQztLQUN2RDtJQUVELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQzs7Ozs7OztBQUVELE1BQU0sVUFBVSxnQkFBZ0IsQ0FBQyxRQUFxQixFQUFFLElBQWEsRUFBRSxjQUFzQjs7VUFDckYsV0FBVyxHQUFHLFFBQVEsQ0FBQyxjQUFjLEVBQUU7O1VBQ3ZDLGNBQWMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDOztVQUN0RCxTQUFTLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsR0FBRyxXQUFXO0lBQ25FLE9BQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFLENBQUMsV0FBVyxHQUFHLFNBQVMsR0FBRyxjQUFjLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQztBQUN6RyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtOZ2JEYXRlfSBmcm9tICcuL25nYi1kYXRlJztcbmltcG9ydCB7RGF0ZXBpY2tlclZpZXdNb2RlbCwgRGF5Vmlld01vZGVsLCBNb250aFZpZXdNb2RlbH0gZnJvbSAnLi9kYXRlcGlja2VyLXZpZXctbW9kZWwnO1xuaW1wb3J0IHtOZ2JDYWxlbmRhcn0gZnJvbSAnLi9uZ2ItY2FsZW5kYXInO1xuaW1wb3J0IHtpc0RlZmluZWR9IGZyb20gJy4uL3V0aWwvdXRpbCc7XG5pbXBvcnQge05nYkRhdGVwaWNrZXJJMThufSBmcm9tICcuL2RhdGVwaWNrZXItaTE4bic7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NoYW5nZWREYXRlKHByZXY6IE5nYkRhdGUsIG5leHQ6IE5nYkRhdGUpIHtcbiAgcmV0dXJuICFkYXRlQ29tcGFyYXRvcihwcmV2LCBuZXh0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQ2hhbmdlZE1vbnRoKHByZXY6IE5nYkRhdGUsIG5leHQ6IE5nYkRhdGUpIHtcbiAgcmV0dXJuICFwcmV2ICYmICFuZXh0ID8gZmFsc2UgOiAhcHJldiB8fCAhbmV4dCA/IHRydWUgOiBwcmV2LnllYXIgIT09IG5leHQueWVhciB8fCBwcmV2Lm1vbnRoICE9PSBuZXh0Lm1vbnRoO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGF0ZUNvbXBhcmF0b3IocHJldjogTmdiRGF0ZSwgbmV4dDogTmdiRGF0ZSkge1xuICByZXR1cm4gKCFwcmV2ICYmICFuZXh0KSB8fCAoISFwcmV2ICYmICEhbmV4dCAmJiBwcmV2LmVxdWFscyhuZXh0KSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja01pbkJlZm9yZU1heChtaW5EYXRlOiBOZ2JEYXRlLCBtYXhEYXRlOiBOZ2JEYXRlKSB7XG4gIGlmIChtYXhEYXRlICYmIG1pbkRhdGUgJiYgbWF4RGF0ZS5iZWZvcmUobWluRGF0ZSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCdtYXhEYXRlJyAke21heERhdGV9IHNob3VsZCBiZSBncmVhdGVyIHRoYW4gJ21pbkRhdGUnICR7bWluRGF0ZX1gKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tEYXRlSW5SYW5nZShkYXRlOiBOZ2JEYXRlLCBtaW5EYXRlOiBOZ2JEYXRlLCBtYXhEYXRlOiBOZ2JEYXRlKTogTmdiRGF0ZSB7XG4gIGlmIChkYXRlICYmIG1pbkRhdGUgJiYgZGF0ZS5iZWZvcmUobWluRGF0ZSkpIHtcbiAgICByZXR1cm4gbWluRGF0ZTtcbiAgfVxuICBpZiAoZGF0ZSAmJiBtYXhEYXRlICYmIGRhdGUuYWZ0ZXIobWF4RGF0ZSkpIHtcbiAgICByZXR1cm4gbWF4RGF0ZTtcbiAgfVxuXG4gIHJldHVybiBkYXRlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEYXRlU2VsZWN0YWJsZShkYXRlOiBOZ2JEYXRlLCBzdGF0ZTogRGF0ZXBpY2tlclZpZXdNb2RlbCkge1xuICBjb25zdCB7bWluRGF0ZSwgbWF4RGF0ZSwgZGlzYWJsZWQsIG1hcmtEaXNhYmxlZH0gPSBzdGF0ZTtcbiAgLy8gY2xhbmctZm9ybWF0IG9mZlxuICByZXR1cm4gIShcbiAgICAhaXNEZWZpbmVkKGRhdGUpIHx8XG4gICAgZGlzYWJsZWQgfHxcbiAgICAobWFya0Rpc2FibGVkICYmIG1hcmtEaXNhYmxlZChkYXRlLCB7eWVhcjogZGF0ZS55ZWFyLCBtb250aDogZGF0ZS5tb250aH0pKSB8fFxuICAgIChtaW5EYXRlICYmIGRhdGUuYmVmb3JlKG1pbkRhdGUpKSB8fFxuICAgIChtYXhEYXRlICYmIGRhdGUuYWZ0ZXIobWF4RGF0ZSkpXG4gICk7XG4gIC8vIGNsYW5nLWZvcm1hdCBvblxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVTZWxlY3RCb3hNb250aHMoY2FsZW5kYXI6IE5nYkNhbGVuZGFyLCBkYXRlOiBOZ2JEYXRlLCBtaW5EYXRlOiBOZ2JEYXRlLCBtYXhEYXRlOiBOZ2JEYXRlKSB7XG4gIGlmICghZGF0ZSkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIGxldCBtb250aHMgPSBjYWxlbmRhci5nZXRNb250aHMoZGF0ZS55ZWFyKTtcblxuICBpZiAobWluRGF0ZSAmJiBkYXRlLnllYXIgPT09IG1pbkRhdGUueWVhcikge1xuICAgIGNvbnN0IGluZGV4ID0gbW9udGhzLmZpbmRJbmRleChtb250aCA9PiBtb250aCA9PT0gbWluRGF0ZS5tb250aCk7XG4gICAgbW9udGhzID0gbW9udGhzLnNsaWNlKGluZGV4KTtcbiAgfVxuXG4gIGlmIChtYXhEYXRlICYmIGRhdGUueWVhciA9PT0gbWF4RGF0ZS55ZWFyKSB7XG4gICAgY29uc3QgaW5kZXggPSBtb250aHMuZmluZEluZGV4KG1vbnRoID0+IG1vbnRoID09PSBtYXhEYXRlLm1vbnRoKTtcbiAgICBtb250aHMgPSBtb250aHMuc2xpY2UoMCwgaW5kZXggKyAxKTtcbiAgfVxuXG4gIHJldHVybiBtb250aHM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVNlbGVjdEJveFllYXJzKGRhdGU6IE5nYkRhdGUsIG1pbkRhdGU6IE5nYkRhdGUsIG1heERhdGU6IE5nYkRhdGUpIHtcbiAgaWYgKCFkYXRlKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgY29uc3Qgc3RhcnQgPSBtaW5EYXRlID8gTWF0aC5tYXgobWluRGF0ZS55ZWFyLCBkYXRlLnllYXIgLSA1MDApIDogZGF0ZS55ZWFyIC0gMTA7XG4gIGNvbnN0IGVuZCA9IG1heERhdGUgPyBNYXRoLm1pbihtYXhEYXRlLnllYXIsIGRhdGUueWVhciArIDUwMCkgOiBkYXRlLnllYXIgKyAxMDtcblxuICBjb25zdCBsZW5ndGggPSBlbmQgLSBzdGFydCArIDE7XG4gIGNvbnN0IG51bWJlcnMgPSBBcnJheShsZW5ndGgpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgbnVtYmVyc1tpXSA9IHN0YXJ0ICsgaTtcbiAgfVxuXG4gIHJldHVybiBudW1iZXJzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbmV4dE1vbnRoRGlzYWJsZWQoY2FsZW5kYXI6IE5nYkNhbGVuZGFyLCBkYXRlOiBOZ2JEYXRlLCBtYXhEYXRlOiBOZ2JEYXRlKSB7XG4gIGNvbnN0IG5leHREYXRlID0gT2JqZWN0LmFzc2lnbihjYWxlbmRhci5nZXROZXh0KGRhdGUsICdtJyksIHtkYXk6IDF9KTtcbiAgcmV0dXJuIG1heERhdGUgJiYgbmV4dERhdGUuYWZ0ZXIobWF4RGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmV2TW9udGhEaXNhYmxlZChjYWxlbmRhcjogTmdiQ2FsZW5kYXIsIGRhdGU6IE5nYkRhdGUsIG1pbkRhdGU6IE5nYkRhdGUpIHtcbiAgY29uc3QgcHJldkRhdGUgPSBPYmplY3QuYXNzaWduKGNhbGVuZGFyLmdldFByZXYoZGF0ZSwgJ20nKSwge2RheTogMX0pO1xuICByZXR1cm4gbWluRGF0ZSAmJiAocHJldkRhdGUueWVhciA9PT0gbWluRGF0ZS55ZWFyICYmIHByZXZEYXRlLm1vbnRoIDwgbWluRGF0ZS5tb250aCB8fFxuICAgICAgICAgICAgICAgICAgICAgcHJldkRhdGUueWVhciA8IG1pbkRhdGUueWVhciAmJiBtaW5EYXRlLm1vbnRoID09PSAxKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkTW9udGhzKFxuICAgIGNhbGVuZGFyOiBOZ2JDYWxlbmRhciwgZGF0ZTogTmdiRGF0ZSwgc3RhdGU6IERhdGVwaWNrZXJWaWV3TW9kZWwsIGkxOG46IE5nYkRhdGVwaWNrZXJJMThuLFxuICAgIGZvcmNlOiBib29sZWFuKTogTW9udGhWaWV3TW9kZWxbXSB7XG4gIGNvbnN0IHtkaXNwbGF5TW9udGhzLCBtb250aHN9ID0gc3RhdGU7XG4gIC8vIG1vdmUgb2xkIG1vbnRocyB0byBhIHRlbXBvcmFyeSBhcnJheVxuICBjb25zdCBtb250aHNUb1JldXNlID0gbW9udGhzLnNwbGljZSgwLCBtb250aHMubGVuZ3RoKTtcblxuICAvLyBnZW5lcmF0ZSBuZXcgZmlyc3QgZGF0ZXMsIG51bGxpZnkgb3IgcmV1c2UgbW9udGhzXG4gIGNvbnN0IGZpcnN0RGF0ZXMgPSBBcnJheS5mcm9tKHtsZW5ndGg6IGRpc3BsYXlNb250aHN9LCAoXywgaSkgPT4ge1xuICAgIGNvbnN0IGZpcnN0RGF0ZSA9IE9iamVjdC5hc3NpZ24oY2FsZW5kYXIuZ2V0TmV4dChkYXRlLCAnbScsIGkpLCB7ZGF5OiAxfSk7XG4gICAgbW9udGhzW2ldID0gbnVsbDtcblxuICAgIGlmICghZm9yY2UpIHtcbiAgICAgIGNvbnN0IHJldXNlZEluZGV4ID0gbW9udGhzVG9SZXVzZS5maW5kSW5kZXgobW9udGggPT4gbW9udGguZmlyc3REYXRlLmVxdWFscyhmaXJzdERhdGUpKTtcbiAgICAgIC8vIG1vdmUgcmV1c2VkIG1vbnRoIGJhY2sgdG8gbW9udGhzXG4gICAgICBpZiAocmV1c2VkSW5kZXggIT09IC0xKSB7XG4gICAgICAgIG1vbnRoc1tpXSA9IG1vbnRoc1RvUmV1c2Uuc3BsaWNlKHJldXNlZEluZGV4LCAxKVswXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmlyc3REYXRlO1xuICB9KTtcblxuICAvLyByZWJ1aWxkIG51bGxpZmllZCBtb250aHNcbiAgZmlyc3REYXRlcy5mb3JFYWNoKChmaXJzdERhdGUsIGkpID0+IHtcbiAgICBpZiAobW9udGhzW2ldID09PSBudWxsKSB7XG4gICAgICBtb250aHNbaV0gPSBidWlsZE1vbnRoKGNhbGVuZGFyLCBmaXJzdERhdGUsIHN0YXRlLCBpMThuLCBtb250aHNUb1JldXNlLnNoaWZ0KCkgfHwge30gYXMgTW9udGhWaWV3TW9kZWwpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIG1vbnRocztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkTW9udGgoXG4gICAgY2FsZW5kYXI6IE5nYkNhbGVuZGFyLCBkYXRlOiBOZ2JEYXRlLCBzdGF0ZTogRGF0ZXBpY2tlclZpZXdNb2RlbCwgaTE4bjogTmdiRGF0ZXBpY2tlckkxOG4sXG4gICAgbW9udGg6IE1vbnRoVmlld01vZGVsID0ge30gYXMgTW9udGhWaWV3TW9kZWwpOiBNb250aFZpZXdNb2RlbCB7XG4gIGNvbnN0IHtkYXlUZW1wbGF0ZURhdGEsIG1pbkRhdGUsIG1heERhdGUsIGZpcnN0RGF5T2ZXZWVrLCBtYXJrRGlzYWJsZWQsIG91dHNpZGVEYXlzfSA9IHN0YXRlO1xuICBjb25zdCBjYWxlbmRhclRvZGF5ID0gY2FsZW5kYXIuZ2V0VG9kYXkoKTtcblxuICBtb250aC5maXJzdERhdGUgPSBudWxsO1xuICBtb250aC5sYXN0RGF0ZSA9IG51bGw7XG4gIG1vbnRoLm51bWJlciA9IGRhdGUubW9udGg7XG4gIG1vbnRoLnllYXIgPSBkYXRlLnllYXI7XG4gIG1vbnRoLndlZWtzID0gbW9udGgud2Vla3MgfHwgW107XG4gIG1vbnRoLndlZWtkYXlzID0gbW9udGgud2Vla2RheXMgfHwgW107XG5cbiAgZGF0ZSA9IGdldEZpcnN0Vmlld0RhdGUoY2FsZW5kYXIsIGRhdGUsIGZpcnN0RGF5T2ZXZWVrKTtcblxuICAvLyBtb250aCBoYXMgd2Vla3NcbiAgZm9yIChsZXQgd2VlayA9IDA7IHdlZWsgPCBjYWxlbmRhci5nZXRXZWVrc1Blck1vbnRoKCk7IHdlZWsrKykge1xuICAgIGxldCB3ZWVrT2JqZWN0ID0gbW9udGgud2Vla3Nbd2Vla107XG4gICAgaWYgKCF3ZWVrT2JqZWN0KSB7XG4gICAgICB3ZWVrT2JqZWN0ID0gbW9udGgud2Vla3Nbd2Vla10gPSB7bnVtYmVyOiAwLCBkYXlzOiBbXSwgY29sbGFwc2VkOiB0cnVlfTtcbiAgICB9XG4gICAgY29uc3QgZGF5cyA9IHdlZWtPYmplY3QuZGF5cztcblxuICAgIC8vIHdlZWsgaGFzIGRheXNcbiAgICBmb3IgKGxldCBkYXkgPSAwOyBkYXkgPCBjYWxlbmRhci5nZXREYXlzUGVyV2VlaygpOyBkYXkrKykge1xuICAgICAgaWYgKHdlZWsgPT09IDApIHtcbiAgICAgICAgbW9udGgud2Vla2RheXNbZGF5XSA9IGNhbGVuZGFyLmdldFdlZWtkYXkoZGF0ZSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG5ld0RhdGUgPSBuZXcgTmdiRGF0ZShkYXRlLnllYXIsIGRhdGUubW9udGgsIGRhdGUuZGF5KTtcbiAgICAgIGNvbnN0IG5leHREYXRlID0gY2FsZW5kYXIuZ2V0TmV4dChuZXdEYXRlKTtcblxuICAgICAgY29uc3QgYXJpYUxhYmVsID0gaTE4bi5nZXREYXlBcmlhTGFiZWwobmV3RGF0ZSk7XG5cbiAgICAgIC8vIG1hcmtpbmcgZGF0ZSBhcyBkaXNhYmxlZFxuICAgICAgbGV0IGRpc2FibGVkID0gISEoKG1pbkRhdGUgJiYgbmV3RGF0ZS5iZWZvcmUobWluRGF0ZSkpIHx8IChtYXhEYXRlICYmIG5ld0RhdGUuYWZ0ZXIobWF4RGF0ZSkpKTtcbiAgICAgIGlmICghZGlzYWJsZWQgJiYgbWFya0Rpc2FibGVkKSB7XG4gICAgICAgIGRpc2FibGVkID0gbWFya0Rpc2FibGVkKG5ld0RhdGUsIHttb250aDogbW9udGgubnVtYmVyLCB5ZWFyOiBtb250aC55ZWFyfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIHRvZGF5XG4gICAgICBsZXQgdG9kYXkgPSBuZXdEYXRlLmVxdWFscyhjYWxlbmRhclRvZGF5KTtcblxuICAgICAgLy8gYWRkaW5nIHVzZXItcHJvdmlkZWQgZGF0YSB0byB0aGUgY29udGV4dFxuICAgICAgbGV0IGNvbnRleHRVc2VyRGF0YSA9XG4gICAgICAgICAgZGF5VGVtcGxhdGVEYXRhID8gZGF5VGVtcGxhdGVEYXRhKG5ld0RhdGUsIHttb250aDogbW9udGgubnVtYmVyLCB5ZWFyOiBtb250aC55ZWFyfSkgOiB1bmRlZmluZWQ7XG5cbiAgICAgIC8vIHNhdmluZyBmaXJzdCBkYXRlIG9mIHRoZSBtb250aFxuICAgICAgaWYgKG1vbnRoLmZpcnN0RGF0ZSA9PT0gbnVsbCAmJiBuZXdEYXRlLm1vbnRoID09PSBtb250aC5udW1iZXIpIHtcbiAgICAgICAgbW9udGguZmlyc3REYXRlID0gbmV3RGF0ZTtcbiAgICAgIH1cblxuICAgICAgLy8gc2F2aW5nIGxhc3QgZGF0ZSBvZiB0aGUgbW9udGhcbiAgICAgIGlmIChuZXdEYXRlLm1vbnRoID09PSBtb250aC5udW1iZXIgJiYgbmV4dERhdGUubW9udGggIT09IG1vbnRoLm51bWJlcikge1xuICAgICAgICBtb250aC5sYXN0RGF0ZSA9IG5ld0RhdGU7XG4gICAgICB9XG5cbiAgICAgIGxldCBkYXlPYmplY3QgPSBkYXlzW2RheV07XG4gICAgICBpZiAoIWRheU9iamVjdCkge1xuICAgICAgICBkYXlPYmplY3QgPSBkYXlzW2RheV0gPSB7fSBhcyBEYXlWaWV3TW9kZWw7XG4gICAgICB9XG4gICAgICBkYXlPYmplY3QuZGF0ZSA9IG5ld0RhdGU7XG4gICAgICBkYXlPYmplY3QuY29udGV4dCA9IE9iamVjdC5hc3NpZ24oZGF5T2JqZWN0LmNvbnRleHQgfHwge30sIHtcbiAgICAgICAgJGltcGxpY2l0OiBuZXdEYXRlLFxuICAgICAgICBkYXRlOiBuZXdEYXRlLFxuICAgICAgICBkYXRhOiBjb250ZXh0VXNlckRhdGEsXG4gICAgICAgIGN1cnJlbnRNb250aDogbW9udGgubnVtYmVyLCBkaXNhYmxlZCxcbiAgICAgICAgZm9jdXNlZDogZmFsc2UsXG4gICAgICAgIHNlbGVjdGVkOiBmYWxzZSwgdG9kYXlcbiAgICAgIH0pO1xuICAgICAgZGF5T2JqZWN0LnRhYmluZGV4ID0gLTE7XG4gICAgICBkYXlPYmplY3QuYXJpYUxhYmVsID0gYXJpYUxhYmVsO1xuICAgICAgZGF5T2JqZWN0LmhpZGRlbiA9IGZhbHNlO1xuXG4gICAgICBkYXRlID0gbmV4dERhdGU7XG4gICAgfVxuXG4gICAgd2Vla09iamVjdC5udW1iZXIgPSBjYWxlbmRhci5nZXRXZWVrTnVtYmVyKGRheXMubWFwKGRheSA9PiBkYXkuZGF0ZSksIGZpcnN0RGF5T2ZXZWVrKTtcblxuICAgIC8vIG1hcmtpbmcgd2VlayBhcyBjb2xsYXBzZWRcbiAgICB3ZWVrT2JqZWN0LmNvbGxhcHNlZCA9IG91dHNpZGVEYXlzID09PSAnY29sbGFwc2VkJyAmJiBkYXlzWzBdLmRhdGUubW9udGggIT09IG1vbnRoLm51bWJlciAmJlxuICAgICAgICBkYXlzW2RheXMubGVuZ3RoIC0gMV0uZGF0ZS5tb250aCAhPT0gbW9udGgubnVtYmVyO1xuICB9XG5cbiAgcmV0dXJuIG1vbnRoO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Rmlyc3RWaWV3RGF0ZShjYWxlbmRhcjogTmdiQ2FsZW5kYXIsIGRhdGU6IE5nYkRhdGUsIGZpcnN0RGF5T2ZXZWVrOiBudW1iZXIpOiBOZ2JEYXRlIHtcbiAgY29uc3QgZGF5c1BlcldlZWsgPSBjYWxlbmRhci5nZXREYXlzUGVyV2VlaygpO1xuICBjb25zdCBmaXJzdE1vbnRoRGF0ZSA9IG5ldyBOZ2JEYXRlKGRhdGUueWVhciwgZGF0ZS5tb250aCwgMSk7XG4gIGNvbnN0IGRheU9mV2VlayA9IGNhbGVuZGFyLmdldFdlZWtkYXkoZmlyc3RNb250aERhdGUpICUgZGF5c1BlcldlZWs7XG4gIHJldHVybiBjYWxlbmRhci5nZXRQcmV2KGZpcnN0TW9udGhEYXRlLCAnZCcsIChkYXlzUGVyV2VlayArIGRheU9mV2VlayAtIGZpcnN0RGF5T2ZXZWVrKSAlIGRheXNQZXJXZWVrKTtcbn1cbiJdfQ==
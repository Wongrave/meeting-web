/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Component, ContentChildren, Directive, EventEmitter, Host, Input, Optional, Output, QueryList, TemplateRef, ViewEncapsulation } from '@angular/core';
import { isString } from '../util/util';
import { NgbAccordionConfig } from './accordion-config';
/** @type {?} */
var nextId = 0;
/**
 * The context for the [NgbPanelHeader](#/components/accordion/api#NgbPanelHeader) template
 *
 * \@since 4.1.0
 * @record
 */
export function NgbPanelHeaderContext() { }
if (false) {
    /**
     * `True` if current panel is opened
     * @type {?}
     */
    NgbPanelHeaderContext.prototype.opened;
}
/**
 * A directive that wraps an accordion panel header with any HTML markup and a toggling button
 * marked with [`NgbPanelToggle`](#/components/accordion/api#NgbPanelToggle).
 * See the [header customization demo](#/components/accordion/examples#header) for more details.
 *
 * You can also use [`NgbPanelTitle`](#/components/accordion/api#NgbPanelTitle) to customize only the panel title.
 *
 * \@since 4.1.0
 */
var NgbPanelHeader = /** @class */ (function () {
    function NgbPanelHeader(templateRef) {
        this.templateRef = templateRef;
    }
    NgbPanelHeader.decorators = [
        { type: Directive, args: [{ selector: 'ng-template[ngbPanelHeader]' },] }
    ];
    /** @nocollapse */
    NgbPanelHeader.ctorParameters = function () { return [
        { type: TemplateRef }
    ]; };
    return NgbPanelHeader;
}());
export { NgbPanelHeader };
if (false) {
    /** @type {?} */
    NgbPanelHeader.prototype.templateRef;
}
/**
 * A directive that wraps only the panel title with HTML markup inside.
 *
 * You can also use [`NgbPanelHeader`](#/components/accordion/api#NgbPanelHeader) to customize the full panel header.
 */
var NgbPanelTitle = /** @class */ (function () {
    function NgbPanelTitle(templateRef) {
        this.templateRef = templateRef;
    }
    NgbPanelTitle.decorators = [
        { type: Directive, args: [{ selector: 'ng-template[ngbPanelTitle]' },] }
    ];
    /** @nocollapse */
    NgbPanelTitle.ctorParameters = function () { return [
        { type: TemplateRef }
    ]; };
    return NgbPanelTitle;
}());
export { NgbPanelTitle };
if (false) {
    /** @type {?} */
    NgbPanelTitle.prototype.templateRef;
}
/**
 * A directive that wraps the accordion panel content.
 */
var NgbPanelContent = /** @class */ (function () {
    function NgbPanelContent(templateRef) {
        this.templateRef = templateRef;
    }
    NgbPanelContent.decorators = [
        { type: Directive, args: [{ selector: 'ng-template[ngbPanelContent]' },] }
    ];
    /** @nocollapse */
    NgbPanelContent.ctorParameters = function () { return [
        { type: TemplateRef }
    ]; };
    return NgbPanelContent;
}());
export { NgbPanelContent };
if (false) {
    /** @type {?} */
    NgbPanelContent.prototype.templateRef;
}
/**
 * A directive that wraps an individual accordion panel with title and collapsible content.
 */
var NgbPanel = /** @class */ (function () {
    function NgbPanel() {
        /**
         *  If `true`, the panel is disabled an can't be toggled.
         */
        this.disabled = false;
        /**
         *  An optional id for the panel that must be unique on the page.
         *
         *  If not provided, it will be auto-generated in the `ngb-panel-xxx` format.
         */
        this.id = "ngb-panel-" + nextId++;
        this.isOpen = false;
    }
    /**
     * @return {?}
     */
    NgbPanel.prototype.ngAfterContentChecked = /**
     * @return {?}
     */
    function () {
        // We are using @ContentChildren instead of @ContentChild as in the Angular version being used
        // only @ContentChildren allows us to specify the {descendants: false} option.
        // Without {descendants: false} we are hitting bugs described in:
        // https://github.com/ng-bootstrap/ng-bootstrap/issues/2240
        this.titleTpl = this.titleTpls.first;
        this.headerTpl = this.headerTpls.first;
        this.contentTpl = this.contentTpls.first;
    };
    NgbPanel.decorators = [
        { type: Directive, args: [{ selector: 'ngb-panel' },] }
    ];
    NgbPanel.propDecorators = {
        disabled: [{ type: Input }],
        id: [{ type: Input }],
        title: [{ type: Input }],
        type: [{ type: Input }],
        titleTpls: [{ type: ContentChildren, args: [NgbPanelTitle, { descendants: false },] }],
        headerTpls: [{ type: ContentChildren, args: [NgbPanelHeader, { descendants: false },] }],
        contentTpls: [{ type: ContentChildren, args: [NgbPanelContent, { descendants: false },] }]
    };
    return NgbPanel;
}());
export { NgbPanel };
if (false) {
    /**
     *  If `true`, the panel is disabled an can't be toggled.
     * @type {?}
     */
    NgbPanel.prototype.disabled;
    /**
     *  An optional id for the panel that must be unique on the page.
     *
     *  If not provided, it will be auto-generated in the `ngb-panel-xxx` format.
     * @type {?}
     */
    NgbPanel.prototype.id;
    /** @type {?} */
    NgbPanel.prototype.isOpen;
    /**
     *  The panel title.
     *
     *  You can alternatively use [`NgbPanelTitle`](#/components/accordion/api#NgbPanelTitle) to set panel title.
     * @type {?}
     */
    NgbPanel.prototype.title;
    /**
     * Type of the current panel.
     *
     * Bootstrap provides styles for the following types: `'success'`, `'info'`, `'warning'`, `'danger'`, `'primary'`,
     * `'secondary'`, `'light'` and `'dark'`.
     * @type {?}
     */
    NgbPanel.prototype.type;
    /** @type {?} */
    NgbPanel.prototype.titleTpl;
    /** @type {?} */
    NgbPanel.prototype.headerTpl;
    /** @type {?} */
    NgbPanel.prototype.contentTpl;
    /** @type {?} */
    NgbPanel.prototype.titleTpls;
    /** @type {?} */
    NgbPanel.prototype.headerTpls;
    /** @type {?} */
    NgbPanel.prototype.contentTpls;
}
/**
 * An event emitted right before toggling an accordion panel.
 * @record
 */
export function NgbPanelChangeEvent() { }
if (false) {
    /**
     * The id of the accordion panel that is being toggled.
     * @type {?}
     */
    NgbPanelChangeEvent.prototype.panelId;
    /**
     * The next state of the panel.
     *
     * `true` if it will be opened, `false` if closed.
     * @type {?}
     */
    NgbPanelChangeEvent.prototype.nextState;
    /**
     * Calling this function will prevent panel toggling.
     * @type {?}
     */
    NgbPanelChangeEvent.prototype.preventDefault;
}
/**
 * Accordion is a collection of collapsible panels (bootstrap cards).
 *
 * It can ensure only one panel is opened at a time and allows to customize panel
 * headers.
 */
var NgbAccordion = /** @class */ (function () {
    function NgbAccordion(config) {
        /**
         * An array or comma separated strings of panel ids that should be opened **initially**.
         *
         * For subsequent changes use methods like `expand()`, `collapse()`, etc. and
         * the `(panelChange)` event.
         */
        this.activeIds = [];
        /**
         * If `true`, panel content will be detached from DOM and not simply hidden when the panel is collapsed.
         */
        this.destroyOnHide = true;
        /**
         * Event emitted right before the panel toggle happens.
         *
         * See [NgbPanelChangeEvent](#/components/accordion/api#NgbPanelChangeEvent) for payload details.
         */
        this.panelChange = new EventEmitter();
        this.type = config.type;
        this.closeOtherPanels = config.closeOthers;
    }
    /**
     * Checks if a panel with a given id is expanded.
     */
    /**
     * Checks if a panel with a given id is expanded.
     * @param {?} panelId
     * @return {?}
     */
    NgbAccordion.prototype.isExpanded = /**
     * Checks if a panel with a given id is expanded.
     * @param {?} panelId
     * @return {?}
     */
    function (panelId) { return this.activeIds.indexOf(panelId) > -1; };
    /**
     * Expands a panel with a given id.
     *
     * Has no effect if the panel is already expanded or disabled.
     */
    /**
     * Expands a panel with a given id.
     *
     * Has no effect if the panel is already expanded or disabled.
     * @param {?} panelId
     * @return {?}
     */
    NgbAccordion.prototype.expand = /**
     * Expands a panel with a given id.
     *
     * Has no effect if the panel is already expanded or disabled.
     * @param {?} panelId
     * @return {?}
     */
    function (panelId) { this._changeOpenState(this._findPanelById(panelId), true); };
    /**
     * Expands all panels, if `[closeOthers]` is `false`.
     *
     * If `[closeOthers]` is `true`, it will expand the first panel, unless there is already a panel opened.
     */
    /**
     * Expands all panels, if `[closeOthers]` is `false`.
     *
     * If `[closeOthers]` is `true`, it will expand the first panel, unless there is already a panel opened.
     * @return {?}
     */
    NgbAccordion.prototype.expandAll = /**
     * Expands all panels, if `[closeOthers]` is `false`.
     *
     * If `[closeOthers]` is `true`, it will expand the first panel, unless there is already a panel opened.
     * @return {?}
     */
    function () {
        var _this = this;
        if (this.closeOtherPanels) {
            if (this.activeIds.length === 0 && this.panels.length) {
                this._changeOpenState(this.panels.first, true);
            }
        }
        else {
            this.panels.forEach((/**
             * @param {?} panel
             * @return {?}
             */
            function (panel) { return _this._changeOpenState(panel, true); }));
        }
    };
    /**
     * Collapses a panel with the given id.
     *
     * Has no effect if the panel is already collapsed or disabled.
     */
    /**
     * Collapses a panel with the given id.
     *
     * Has no effect if the panel is already collapsed or disabled.
     * @param {?} panelId
     * @return {?}
     */
    NgbAccordion.prototype.collapse = /**
     * Collapses a panel with the given id.
     *
     * Has no effect if the panel is already collapsed or disabled.
     * @param {?} panelId
     * @return {?}
     */
    function (panelId) { this._changeOpenState(this._findPanelById(panelId), false); };
    /**
     * Collapses all opened panels.
     */
    /**
     * Collapses all opened panels.
     * @return {?}
     */
    NgbAccordion.prototype.collapseAll = /**
     * Collapses all opened panels.
     * @return {?}
     */
    function () {
        var _this = this;
        this.panels.forEach((/**
         * @param {?} panel
         * @return {?}
         */
        function (panel) { _this._changeOpenState(panel, false); }));
    };
    /**
     * Toggles a panel with the given id.
     *
     * Has no effect if the panel is disabled.
     */
    /**
     * Toggles a panel with the given id.
     *
     * Has no effect if the panel is disabled.
     * @param {?} panelId
     * @return {?}
     */
    NgbAccordion.prototype.toggle = /**
     * Toggles a panel with the given id.
     *
     * Has no effect if the panel is disabled.
     * @param {?} panelId
     * @return {?}
     */
    function (panelId) {
        /** @type {?} */
        var panel = this._findPanelById(panelId);
        if (panel) {
            this._changeOpenState(panel, !panel.isOpen);
        }
    };
    /**
     * @return {?}
     */
    NgbAccordion.prototype.ngAfterContentChecked = /**
     * @return {?}
     */
    function () {
        var _this = this;
        // active id updates
        if (isString(this.activeIds)) {
            this.activeIds = this.activeIds.split(/\s*,\s*/);
        }
        // update panels open states
        this.panels.forEach((/**
         * @param {?} panel
         * @return {?}
         */
        function (panel) { return panel.isOpen = !panel.disabled && _this.activeIds.indexOf(panel.id) > -1; }));
        // closeOthers updates
        if (this.activeIds.length > 1 && this.closeOtherPanels) {
            this._closeOthers(this.activeIds[0]);
            this._updateActiveIds();
        }
    };
    /**
     * @private
     * @param {?} panel
     * @param {?} nextState
     * @return {?}
     */
    NgbAccordion.prototype._changeOpenState = /**
     * @private
     * @param {?} panel
     * @param {?} nextState
     * @return {?}
     */
    function (panel, nextState) {
        if (panel && !panel.disabled && panel.isOpen !== nextState) {
            /** @type {?} */
            var defaultPrevented_1 = false;
            this.panelChange.emit({ panelId: panel.id, nextState: nextState, preventDefault: (/**
                 * @return {?}
                 */
                function () { defaultPrevented_1 = true; }) });
            if (!defaultPrevented_1) {
                panel.isOpen = nextState;
                if (nextState && this.closeOtherPanels) {
                    this._closeOthers(panel.id);
                }
                this._updateActiveIds();
            }
        }
    };
    /**
     * @private
     * @param {?} panelId
     * @return {?}
     */
    NgbAccordion.prototype._closeOthers = /**
     * @private
     * @param {?} panelId
     * @return {?}
     */
    function (panelId) {
        this.panels.forEach((/**
         * @param {?} panel
         * @return {?}
         */
        function (panel) {
            if (panel.id !== panelId) {
                panel.isOpen = false;
            }
        }));
    };
    /**
     * @private
     * @param {?} panelId
     * @return {?}
     */
    NgbAccordion.prototype._findPanelById = /**
     * @private
     * @param {?} panelId
     * @return {?}
     */
    function (panelId) { return this.panels.find((/**
     * @param {?} p
     * @return {?}
     */
    function (p) { return p.id === panelId; })); };
    /**
     * @private
     * @return {?}
     */
    NgbAccordion.prototype._updateActiveIds = /**
     * @private
     * @return {?}
     */
    function () {
        this.activeIds = this.panels.filter((/**
         * @param {?} panel
         * @return {?}
         */
        function (panel) { return panel.isOpen && !panel.disabled; })).map((/**
         * @param {?} panel
         * @return {?}
         */
        function (panel) { return panel.id; }));
    };
    NgbAccordion.decorators = [
        { type: Component, args: [{
                    selector: 'ngb-accordion',
                    exportAs: 'ngbAccordion',
                    encapsulation: ViewEncapsulation.None,
                    host: { 'class': 'accordion', 'role': 'tablist', '[attr.aria-multiselectable]': '!closeOtherPanels' },
                    template: "\n    <ng-template #t ngbPanelHeader let-panel>\n      <button class=\"btn btn-link\" [ngbPanelToggle]=\"panel\">\n        {{panel.title}}<ng-template [ngTemplateOutlet]=\"panel.titleTpl?.templateRef\"></ng-template>\n      </button>\n    </ng-template>\n    <ng-template ngFor let-panel [ngForOf]=\"panels\">\n      <div class=\"card\">\n        <div role=\"tab\" id=\"{{panel.id}}-header\" [class]=\"'card-header ' + (panel.type ? 'bg-'+panel.type: type ? 'bg-'+type : '')\">\n          <ng-template [ngTemplateOutlet]=\"panel.headerTpl?.templateRef || t\"\n                       [ngTemplateOutletContext]=\"{$implicit: panel, opened: panel.isOpen}\"></ng-template>\n        </div>\n        <div id=\"{{panel.id}}\" role=\"tabpanel\" [attr.aria-labelledby]=\"panel.id + '-header'\"\n             class=\"collapse\" [class.show]=\"panel.isOpen\" *ngIf=\"!destroyOnHide || panel.isOpen\">\n          <div class=\"card-body\">\n               <ng-template [ngTemplateOutlet]=\"panel.contentTpl?.templateRef\"></ng-template>\n          </div>\n        </div>\n      </div>\n    </ng-template>\n  "
                }] }
    ];
    /** @nocollapse */
    NgbAccordion.ctorParameters = function () { return [
        { type: NgbAccordionConfig }
    ]; };
    NgbAccordion.propDecorators = {
        panels: [{ type: ContentChildren, args: [NgbPanel,] }],
        activeIds: [{ type: Input }],
        closeOtherPanels: [{ type: Input, args: ['closeOthers',] }],
        destroyOnHide: [{ type: Input }],
        type: [{ type: Input }],
        panelChange: [{ type: Output }]
    };
    return NgbAccordion;
}());
export { NgbAccordion };
if (false) {
    /** @type {?} */
    NgbAccordion.prototype.panels;
    /**
     * An array or comma separated strings of panel ids that should be opened **initially**.
     *
     * For subsequent changes use methods like `expand()`, `collapse()`, etc. and
     * the `(panelChange)` event.
     * @type {?}
     */
    NgbAccordion.prototype.activeIds;
    /**
     *  If `true`, only one panel could be opened at a time.
     *
     *  Opening a new panel will close others.
     * @type {?}
     */
    NgbAccordion.prototype.closeOtherPanels;
    /**
     * If `true`, panel content will be detached from DOM and not simply hidden when the panel is collapsed.
     * @type {?}
     */
    NgbAccordion.prototype.destroyOnHide;
    /**
     * Type of panels.
     *
     * Bootstrap provides styles for the following types: `'success'`, `'info'`, `'warning'`, `'danger'`, `'primary'`,
     * `'secondary'`, `'light'` and `'dark'`.
     * @type {?}
     */
    NgbAccordion.prototype.type;
    /**
     * Event emitted right before the panel toggle happens.
     *
     * See [NgbPanelChangeEvent](#/components/accordion/api#NgbPanelChangeEvent) for payload details.
     * @type {?}
     */
    NgbAccordion.prototype.panelChange;
}
/**
 * A directive to put on a button that toggles panel opening and closing.
 *
 * To be used inside the [`NgbPanelHeader`](#/components/accordion/api#NgbPanelHeader)
 *
 * \@since 4.1.0
 */
var NgbPanelToggle = /** @class */ (function () {
    function NgbPanelToggle(accordion, panel) {
        this.accordion = accordion;
        this.panel = panel;
    }
    Object.defineProperty(NgbPanelToggle.prototype, "ngbPanelToggle", {
        set: /**
         * @param {?} panel
         * @return {?}
         */
        function (panel) {
            if (panel) {
                this.panel = panel;
            }
        },
        enumerable: true,
        configurable: true
    });
    NgbPanelToggle.decorators = [
        { type: Directive, args: [{
                    selector: 'button[ngbPanelToggle]',
                    host: {
                        'type': 'button',
                        '[disabled]': 'panel.disabled',
                        '[class.collapsed]': '!panel.isOpen',
                        '[attr.aria-expanded]': 'panel.isOpen',
                        '[attr.aria-controls]': 'panel.id',
                        '(click)': 'accordion.toggle(panel.id)'
                    }
                },] }
    ];
    /** @nocollapse */
    NgbPanelToggle.ctorParameters = function () { return [
        { type: NgbAccordion },
        { type: NgbPanel, decorators: [{ type: Optional }, { type: Host }] }
    ]; };
    NgbPanelToggle.propDecorators = {
        ngbPanelToggle: [{ type: Input }]
    };
    return NgbPanelToggle;
}());
export { NgbPanelToggle };
if (false) {
    /** @type {?} */
    NgbPanelToggle.prototype.accordion;
    /** @type {?} */
    NgbPanelToggle.prototype.panel;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3JkaW9uLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQG5nLWJvb3RzdHJhcC9uZy1ib290c3RyYXAvIiwic291cmNlcyI6WyJhY2NvcmRpb24vYWNjb3JkaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPLEVBRUwsU0FBUyxFQUNULGVBQWUsRUFDZixTQUFTLEVBQ1QsWUFBWSxFQUNaLElBQUksRUFDSixLQUFLLEVBQ0wsUUFBUSxFQUNSLE1BQU0sRUFDTixTQUFTLEVBQ1QsV0FBVyxFQUNYLGlCQUFpQixFQUNsQixNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBRXRDLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLG9CQUFvQixDQUFDOztJQUVsRCxNQUFNLEdBQUcsQ0FBQzs7Ozs7OztBQU9kLDJDQUtDOzs7Ozs7SUFEQyx1Q0FBZ0I7Ozs7Ozs7Ozs7O0FBWWxCO0lBRUUsd0JBQW1CLFdBQTZCO1FBQTdCLGdCQUFXLEdBQVgsV0FBVyxDQUFrQjtJQUFHLENBQUM7O2dCQUZyRCxTQUFTLFNBQUMsRUFBQyxRQUFRLEVBQUUsNkJBQTZCLEVBQUM7Ozs7Z0JBL0JsRCxXQUFXOztJQWtDYixxQkFBQztDQUFBLEFBSEQsSUFHQztTQUZZLGNBQWM7OztJQUNiLHFDQUFvQzs7Ozs7OztBQVFsRDtJQUVFLHVCQUFtQixXQUE2QjtRQUE3QixnQkFBVyxHQUFYLFdBQVcsQ0FBa0I7SUFBRyxDQUFDOztnQkFGckQsU0FBUyxTQUFDLEVBQUMsUUFBUSxFQUFFLDRCQUE0QixFQUFDOzs7O2dCQXpDakQsV0FBVzs7SUE0Q2Isb0JBQUM7Q0FBQSxBQUhELElBR0M7U0FGWSxhQUFhOzs7SUFDWixvQ0FBb0M7Ozs7O0FBTWxEO0lBRUUseUJBQW1CLFdBQTZCO1FBQTdCLGdCQUFXLEdBQVgsV0FBVyxDQUFrQjtJQUFHLENBQUM7O2dCQUZyRCxTQUFTLFNBQUMsRUFBQyxRQUFRLEVBQUUsOEJB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dkQsaUNBQW9EOzs7Ozs7O0lBT3BELHdDQUFnRDs7Ozs7SUFLaEQscUNBQThCOzs7Ozs7OztJQVE5Qiw0QkFBc0I7Ozs7Ozs7SUFPdEIsbUNBQWdFOzs7Ozs7Ozs7QUFvSGxFO0lBbUJFLHdCQUFtQixTQUF1QixFQUE2QixLQUFlO1FBQW5FLGNBQVMsR0FBVCxTQUFTLENBQWM7UUFBNkIsVUFBSyxHQUFMLEtBQUssQ0FBVTtJQUFHLENBQUM7SUFQMUYsc0JBQ0ksMENBQWM7Ozs7O1FBRGxCLFVBQ21CLEtBQWU7WUFDaEMsSUFBSSxLQUFLLEVBQUU7Z0JBQ1QsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7YUFDcEI7UUFDSCxDQUFDOzs7T0FBQTs7Z0JBakJGLFNBQVMsU0FBQztvQkFDVCxRQUFRLEVBQUUsd0JBQXdCO29CQUNsQyxJQUFJLEVBQUU7d0JBQ0osTUFBTSxFQUFFLFFBQVE7d0JBQ2hCLFlBQVksRUFBRSxnQkFBZ0I7d0JBQzlCLG1CQUFtQixFQUFFLGVBQWU7d0JBQ3BDLHNCQUFzQixFQUFFLGNBQWM7d0JBQ3RDLHNCQUFzQixFQUFFLFVBQVU7d0JBQ2xDLFNBQVMsRUFBRSw0QkFBNEI7cUJBQ3hDO2lCQUNGOzs7O2dCQVMrQixZQUFZO2dCQUFvQyxRQUFRLHVCQUF6QyxRQUFRLFlBQUksSUFBSTs7O2lDQVA1RCxLQUFLOztJQVFSLHFCQUFDO0NBQUEsQUFwQkQsSUFvQkM7U0FUWSxjQUFjOzs7SUFRYixtQ0FBOEI7O0lBQUUsK0JBQTBDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQWZ0ZXJDb250ZW50Q2hlY2tlZCxcbiAgQ29tcG9uZW50LFxuICBDb250ZW50Q2hpbGRyZW4sXG4gIERpcmVjdGl2ZSxcbiAgRXZlbnRFbWl0dGVyLFxuICBIb3N0LFxuICBJbnB1dCxcbiAgT3B0aW9uYWwsXG4gIE91dHB1dCxcbiAgUXVlcnlMaXN0LFxuICBUZW1wbGF0ZVJlZixcbiAgVmlld0VuY2Fwc3VsYXRpb25cbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7aXNTdHJpbmd9IGZyb20gJy4uL3V0aWwvdXRpbCc7XG5cbmltcG9ydCB7TmdiQWNjb3JkaW9uQ29uZmlnfSBmcm9tICcuL2FjY29yZGlvbi1jb25maWcnO1xuXG5sZXQgbmV4dElkID0gMDtcblxuLyoqXG4gKiBUaGUgY29udGV4dCBmb3IgdGhlIFtOZ2JQYW5lbEhlYWRlcl0oIy9jb21wb25lbnRzL2FjY29yZGlvbi9hcGkjTmdiUGFuZWxIZWFkZXIpIHRlbXBsYXRlXG4gKlxuICogQHNpbmNlIDQuMS4wXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTmdiUGFuZWxIZWFkZXJDb250ZXh0IHtcbiAgLyoqXG4gICAqIGBUcnVlYCBpZiBjdXJyZW50IHBhbmVsIGlzIG9wZW5lZFxuICAgKi9cbiAgb3BlbmVkOiBib29sZWFuO1xufVxuXG4vKipcbiAqIEEgZGlyZWN0aXZlIHRoYXQgd3JhcHMgYW4gYWNjb3JkaW9uIHBhbmVsIGhlYWRlciB3aXRoIGFueSBIVE1MIG1hcmt1cCBhbmQgYSB0b2dnbGluZyBidXR0b25cbiAqIG1hcmtlZCB3aXRoIFtgTmdiUGFuZWxUb2dnbGVgXSgjL2NvbXBvbmVudHMvYWNjb3JkaW9uL2FwaSNOZ2JQYW5lbFRvZ2dsZSkuXG4gKiBTZWUgdGhlIFtoZWFkZXIgY3VzdG9taXphdGlvbiBkZW1vXSgjL2NvbXBvbmVudHMvYWNjb3JkaW9uL2V4YW1wbGVzI2hlYWRlcikgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3UgY2FuIGFsc28gdXNlIFtgTmdiUGFuZWxUaXRsZWBdKCMvY29tcG9uZW50cy9hY2NvcmRpb24vYXBpI05nYlBhbmVsVGl0bGUpIHRvIGN1c3RvbWl6ZSBvbmx5IHRoZSBwYW5lbCB0aXRsZS5cbiAqXG4gKiBAc2luY2UgNC4xLjBcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICduZy10ZW1wbGF0ZVtuZ2JQYW5lbEhlYWRlcl0nfSlcbmV4cG9ydCBjbGFzcyBOZ2JQYW5lbEhlYWRlciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8YW55Pikge31cbn1cblxuLyoqXG4gKiBBIGRpcmVjdGl2ZSB0aGF0IHdyYXBzIG9ubHkgdGhlIHBhbmVsIHRpdGxlIHdpdGggSFRNTCBtYXJrdXAgaW5zaWRlLlxuICpcbiAqIFlvdSBjYW4gYWxzbyB1c2UgW2BOZ2JQYW5lbEhlYWRlcmBdKCMvY29tcG9uZW50cy9hY2NvcmRpb24vYXBpI05nYlBhbmVsSGVhZGVyKSB0byBjdXN0b21pemUgdGhlIGZ1bGwgcGFuZWwgaGVhZGVyLlxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ25nLXRlbXBsYXRlW25nYlBhbmVsVGl0bGVdJ30pXG5leHBvcnQgY2xhc3MgTmdiUGFuZWxUaXRsZSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8YW55Pikge31cbn1cblxuLyoqXG4gKiBBIGRpcmVjdGl2ZSB0aGF0IHdyYXBzIHRoZSBhY2NvcmRpb24gcGFuZWwgY29udGVudC5cbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICduZy10ZW1wbGF0ZVtuZ2JQYW5lbENvbnRlbnRdJ30pXG5leHBvcnQgY2xhc3MgTmdiUGFuZWxDb250ZW50IHtcbiAgY29uc3RydWN0b3IocHVibGljIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxhbnk+KSB7fVxufVxuXG4vKipcbiAqIEEgZGlyZWN0aXZlIHRoYXQgd3JhcHMgYW4gaW5kaXZpZHVhbCBhY2NvcmRpb24gcGFuZWwgd2l0aCB0aXRsZSBhbmQgY29sbGFwc2libGUgY29udGVudC5cbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICduZ2ItcGFuZWwnfSlcbmV4cG9ydCBjbGFzcyBOZ2JQYW5lbCBpbXBsZW1lbnRzIEFmdGVyQ29udGVudENoZWNrZWQge1xuICAvKipcbiAgICogIElmIGB0cnVlYCwgdGhlIHBhbmVsIGlzIGRpc2FibGVkIGFuIGNhbid0IGJlIHRvZ2dsZWQuXG4gICAqL1xuICBASW5wdXQoKSBkaXNhYmxlZCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiAgQW4gb3B0aW9uYWwgaWQgZm9yIHRoZSBwYW5lbCB0aGF0IG11c3QgYmUgdW5pcXVlIG9uIHRoZSBwYWdlLlxuICAgKlxuICAgKiAgSWYgbm90IHByb3ZpZGVkLCBpdCB3aWxsIGJlIGF1dG8tZ2VuZXJhdGVkIGluIHRoZSBgbmdiLXBhbmVsLXh4eGAgZm9ybWF0LlxuICAgKi9cbiAgQElucHV0KCkgaWQgPSBgbmdiLXBhbmVsLSR7bmV4dElkKyt9YDtcblxuICBpc09wZW4gPSBmYWxzZTtcblxuICAvKipcbiAgICogIFRoZSBwYW5lbCB0aXRsZS5cbiAgICpcbiAgICogIFlvdSBjYW4gYWx0ZXJuYXRpdmVseSB1c2UgW2BOZ2JQYW5lbFRpdGxlYF0oIy9jb21wb25lbnRzL2FjY29yZGlvbi9hcGkjTmdiUGFuZWxUaXRsZSkgdG8gc2V0IHBhbmVsIHRpdGxlLlxuICAgKi9cbiAgQElucHV0KCkgdGl0bGU6IHN0cmluZztcblxuICAvKipcbiAgICogVHlwZSBvZiB0aGUgY3VycmVudCBwYW5lbC5cbiAgICpcbiAgICogQm9vdHN0cmFwIHByb3ZpZGVzIHN0eWxlcyBmb3IgdGhlIGZvbGxvd2luZyB0eXBlczogYCdzdWNjZXNzJ2AsIGAnaW5mbydgLCBgJ3dhcm5pbmcnYCwgYCdkYW5nZXInYCwgYCdwcmltYXJ5J2AsXG4gICAqIGAnc2Vjb25kYXJ5J2AsIGAnbGlnaHQnYCBhbmQgYCdkYXJrJ2AuXG4gICAqL1xuICBASW5wdXQoKSB0eXBlOiBzdHJpbmc7XG5cbiAgdGl0bGVUcGw6IE5nYlBhbmVsVGl0bGUgfCBudWxsO1xuICBoZWFkZXJUcGw6IE5nYlBhbmVsSGVhZGVyIHwgbnVsbDtcbiAgY29udGVudFRwbDogTmdiUGFuZWxDb250ZW50IHwgbnVsbDtcblxuICBAQ29udGVudENoaWxkcmVuKE5nYlBhbmVsVGl0bGUsIHtkZXNjZW5kYW50czogZmFsc2V9KSB0aXRsZVRwbHM6IFF1ZXJ5TGlzdDxOZ2JQYW5lbFRpdGxlPjtcbiAgQENvbnRlbnRDaGlsZHJlbihOZ2JQYW5lbEhlYWRlciwge2Rlc2NlbmRhbnRzOiBmYWxzZX0pIGhlYWRlclRwbHM6IFF1ZXJ5TGlzdDxOZ2JQYW5lbEhlYWRlcj47XG4gIEBDb250ZW50Q2hpbGRyZW4oTmdiUGFuZWxDb250ZW50LCB7ZGVzY2VuZGFudHM6IGZhbHNlfSkgY29udGVudFRwbHM6IFF1ZXJ5TGlzdDxOZ2JQYW5lbENvbnRlbnQ+O1xuXG4gIG5nQWZ0ZXJDb250ZW50Q2hlY2tlZCgpIHtcbiAgICAvLyBXZSBhcmUgdXNpbmcgQENvbnRlbnRDaGlsZHJlbiBpbnN0ZWFkIG9mIEBDb250ZW50Q2hpbGQgYXMgaW4gdGhlIEFuZ3VsYXIgdmVyc2lvbiBiZWluZyB1c2VkXG4gICAgLy8gb25seSBAQ29udGVudENoaWxkcmVuIGFsbG93cyB1cyB0byBzcGVjaWZ5IHRoZSB7ZGVzY2VuZGFudHM6IGZhbHNlfSBvcHRpb24uXG4gICAgLy8gV2l0aG91dCB7ZGVzY2VuZGFudHM6IGZhbHNlfSB3ZSBhcmUgaGl0dGluZyBidWdzIGRlc2NyaWJlZCBpbjpcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbmctYm9vdHN0cmFwL25nLWJvb3RzdHJhcC9pc3N1ZXMvMjI0MFxuICAgIHRoaXMudGl0bGVUcGwgPSB0aGlzLnRpdGxlVHBscy5maXJzdDtcbiAgICB0aGlzLmhlYWRlclRwbCA9IHRoaXMuaGVhZGVyVHBscy5maXJzdDtcbiAgICB0aGlzLmNvbnRlbnRUcGwgPSB0aGlzLmNvbnRlbnRUcGxzLmZpcnN0O1xuICB9XG59XG5cbi8qKlxuICogQW4gZXZlbnQgZW1pdHRlZCByaWdodCBiZWZvcmUgdG9nZ2xpbmcgYW4gYWNjb3JkaW9uIHBhbmVsLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIE5nYlBhbmVsQ2hhbmdlRXZlbnQge1xuICAvKipcbiAgICogVGhlIGlkIG9mIHRoZSBhY2NvcmRpb24gcGFuZWwgdGhhdCBpcyBiZWluZyB0b2dnbGVkLlxuICAgKi9cbiAgcGFuZWxJZDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgbmV4dCBzdGF0ZSBvZiB0aGUgcGFuZWwuXG4gICAqXG4gICAqIGB0cnVlYCBpZiBpdCB3aWxsIGJlIG9wZW5lZCwgYGZhbHNlYCBpZiBjbG9zZWQuXG4gICAqL1xuICBuZXh0U3RhdGU6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIENhbGxpbmcgdGhpcyBmdW5jdGlvbiB3aWxsIHByZXZlbnQgcGFuZWwgdG9nZ2xpbmcuXG4gICAqL1xuICBwcmV2ZW50RGVmYXVsdDogKCkgPT4gdm9pZDtcbn1cblxuLyoqXG4gKiBBY2NvcmRpb24gaXMgYSBjb2xsZWN0aW9uIG9mIGNvbGxhcHNpYmxlIHBhbmVscyAoYm9vdHN0cmFwIGNhcmRzKS5cbiAqXG4gKiBJdCBjYW4gZW5zdXJlIG9ubHkgb25lIHBhbmVsIGlzIG9wZW5lZCBhdCBhIHRpbWUgYW5kIGFsbG93cyB0byBjdXN0b21pemUgcGFuZWxcbiAqIGhlYWRlcnMuXG4gKi9cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ25nYi1hY2NvcmRpb24nLFxuICBleHBvcnRBczogJ25nYkFjY29yZGlvbicsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIGhvc3Q6IHsnY2xhc3MnOiAnYWNjb3JkaW9uJywgJ3JvbGUnOiAndGFibGlzdCcsICdbYXR0ci5hcmlhLW11bHRpc2VsZWN0YWJsZV0nOiAnIWNsb3NlT3RoZXJQYW5lbHMnfSxcbiAgdGVtcGxhdGU6IGBcbiAgICA8bmctdGVtcGxhdGUgI3QgbmdiUGFuZWxIZWFkZXIgbGV0LXBhbmVsPlxuICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tbGlua1wiIFtuZ2JQYW5lbFRvZ2dsZV09XCJwYW5lbFwiPlxuICAgICAgICB7e3BhbmVsLnRpdGxlfX08bmctdGVtcGxhdGUgW25nVGVtcGxhdGVPdXRsZXRdPVwicGFuZWwudGl0bGVUcGw/LnRlbXBsYXRlUmVmXCI+PC9uZy10ZW1wbGF0ZT5cbiAgICAgIDwvYnV0dG9uPlxuICAgIDwvbmctdGVtcGxhdGU+XG4gICAgPG5nLXRlbXBsYXRlIG5nRm9yIGxldC1wYW5lbCBbbmdGb3JPZl09XCJwYW5lbHNcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJjYXJkXCI+XG4gICAgICAgIDxkaXYgcm9sZT1cInRhYlwiIGlkPVwie3twYW5lbC5pZH19LWhlYWRlclwiIFtjbGFzc109XCInY2FyZC1oZWFkZXIgJyArIChwYW5lbC50eXBlID8gJ2JnLScrcGFuZWwudHlwZTogdHlwZSA/ICdiZy0nK3R5cGUgOiAnJylcIj5cbiAgICAgICAgICA8bmctdGVtcGxhdGUgW25nVGVtcGxhdGVPdXRsZXRdPVwicGFuZWwuaGVhZGVyVHBsPy50ZW1wbGF0ZVJlZiB8fCB0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XT1cInskaW1wbGljaXQ6IHBhbmVsLCBvcGVuZWQ6IHBhbmVsLmlzT3Blbn1cIj48L25nLXRlbXBsYXRlPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBpZD1cInt7cGFuZWwuaWR9fVwiIHJvbGU9XCJ0YWJwYW5lbFwiIFthdHRyLmFyaWEtbGFiZWxsZWRieV09XCJwYW5lbC5pZCArICctaGVhZGVyJ1wiXG4gICAgICAgICAgICAgY2xhc3M9XCJjb2xsYXBzZVwiIFtjbGFzcy5zaG93XT1cInBhbmVsLmlzT3BlblwiICpuZ0lmPVwiIWRlc3Ryb3lPbkhpZGUgfHwgcGFuZWwuaXNPcGVuXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhcmQtYm9keVwiPlxuICAgICAgICAgICAgICAgPG5nLXRlbXBsYXRlIFtuZ1RlbXBsYXRlT3V0bGV0XT1cInBhbmVsLmNvbnRlbnRUcGw/LnRlbXBsYXRlUmVmXCI+PC9uZy10ZW1wbGF0ZT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L25nLXRlbXBsYXRlPlxuICBgXG59KVxuZXhwb3J0IGNsYXNzIE5nYkFjY29yZGlvbiBpbXBsZW1lbnRzIEFmdGVyQ29udGVudENoZWNrZWQge1xuICBAQ29udGVudENoaWxkcmVuKE5nYlBhbmVsKSBwYW5lbHM6IFF1ZXJ5TGlzdDxOZ2JQYW5lbD47XG5cbiAgLyoqXG4gICAqIEFuIGFycmF5IG9yIGNvbW1hIHNlcGFyYXRlZCBzdHJpbmdzIG9mIHBhbmVsIGlkcyB0aGF0IHNob3VsZCBiZSBvcGVuZWQgKippbml0aWFsbHkqKi5cbiAgICpcbiAgICogRm9yIHN1YnNlcXVlbnQgY2hhbmdlcyB1c2UgbWV0aG9kcyBsaWtlIGBleHBhbmQoKWAsIGBjb2xsYXBzZSgpYCwgZXRjLiBhbmRcbiAgICogdGhlIGAocGFuZWxDaGFuZ2UpYCBldmVudC5cbiAgICovXG4gIEBJbnB1dCgpIGFjdGl2ZUlkczogc3RyaW5nIHwgcmVhZG9ubHkgc3RyaW5nW10gPSBbXTtcblxuICAvKipcbiAgICogIElmIGB0cnVlYCwgb25seSBvbmUgcGFuZWwgY291bGQgYmUgb3BlbmVkIGF0IGEgdGltZS5cbiAgICpcbiAgICogIE9wZW5pbmcgYSBuZXcgcGFuZWwgd2lsbCBjbG9zZSBvdGhlcnMuXG4gICAqL1xuICBASW5wdXQoJ2Nsb3NlT3RoZXJzJykgY2xvc2VPdGhlclBhbmVsczogYm9vbGVhbjtcblxuICAvKipcbiAgICogSWYgYHRydWVgLCBwYW5lbCBjb250ZW50IHdpbGwgYmUgZGV0YWNoZWQgZnJvbSBET00gYW5kIG5vdCBzaW1wbHkgaGlkZGVuIHdoZW4gdGhlIHBhbmVsIGlzIGNvbGxhcHNlZC5cbiAgICovXG4gIEBJbnB1dCgpIGRlc3Ryb3lPbkhpZGUgPSB0cnVlO1xuXG4gIC8qKlxuICAgKiBUeXBlIG9mIHBhbmVscy5cbiAgICpcbiAgICogQm9vdHN0cmFwIHByb3ZpZGVzIHN0eWxlcyBmb3IgdGhlIGZvbGxvd2luZyB0eXBlczogYCdzdWNjZXNzJ2AsIGAnaW5mbydgLCBgJ3dhcm5pbmcnYCwgYCdkYW5nZXInYCwgYCdwcmltYXJ5J2AsXG4gICAqIGAnc2Vjb25kYXJ5J2AsIGAnbGlnaHQnYCBhbmQgYCdkYXJrJ2AuXG4gICAqL1xuICBASW5wdXQoKSB0eXBlOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEV2ZW50IGVtaXR0ZWQgcmlnaHQgYmVmb3JlIHRoZSBwYW5lbCB0b2dnbGUgaGFwcGVucy5cbiAgICpcbiAgICogU2VlIFtOZ2JQYW5lbENoYW5nZUV2ZW50XSgjL2NvbXBvbmVudHMvYWNjb3JkaW9uL2FwaSNOZ2JQYW5lbENoYW5nZUV2ZW50KSBmb3IgcGF5bG9hZCBkZXRhaWxzLlxuICAgKi9cbiAgQE91dHB1dCgpIHBhbmVsQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxOZ2JQYW5lbENoYW5nZUV2ZW50PigpO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogTmdiQWNjb3JkaW9uQ29uZmlnKSB7XG4gICAgdGhpcy50eXBlID0gY29uZmlnLnR5cGU7XG4gICAgdGhpcy5jbG9zZU90aGVyUGFuZWxzID0gY29uZmlnLmNsb3NlT3RoZXJzO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiBhIHBhbmVsIHdpdGggYSBnaXZlbiBpZCBpcyBleHBhbmRlZC5cbiAgICovXG4gIGlzRXhwYW5kZWQocGFuZWxJZDogc3RyaW5nKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmFjdGl2ZUlkcy5pbmRleE9mKHBhbmVsSWQpID4gLTE7IH1cblxuICAvKipcbiAgICogRXhwYW5kcyBhIHBhbmVsIHdpdGggYSBnaXZlbiBpZC5cbiAgICpcbiAgICogSGFzIG5vIGVmZmVjdCBpZiB0aGUgcGFuZWwgaXMgYWxyZWFkeSBleHBhbmRlZCBvciBkaXNhYmxlZC5cbiAgICovXG4gIGV4cGFuZChwYW5lbElkOiBzdHJpbmcpOiB2b2lkIHsgdGhpcy5fY2hhbmdlT3BlblN0YXRlKHRoaXMuX2ZpbmRQYW5lbEJ5SWQocGFuZWxJZCksIHRydWUpOyB9XG5cbiAgLyoqXG4gICAqIEV4cGFuZHMgYWxsIHBhbmVscywgaWYgYFtjbG9zZU90aGVyc11gIGlzIGBmYWxzZWAuXG4gICAqXG4gICAqIElmIGBbY2xvc2VPdGhlcnNdYCBpcyBgdHJ1ZWAsIGl0IHdpbGwgZXhwYW5kIHRoZSBmaXJzdCBwYW5lbCwgdW5sZXNzIHRoZXJlIGlzIGFscmVhZHkgYSBwYW5lbCBvcGVuZWQuXG4gICAqL1xuICBleHBhbmRBbGwoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuY2xvc2VPdGhlclBhbmVscykge1xuICAgICAgaWYgKHRoaXMuYWN0aXZlSWRzLmxlbmd0aCA9PT0gMCAmJiB0aGlzLnBhbmVscy5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5fY2hhbmdlT3BlblN0YXRlKHRoaXMucGFuZWxzLmZpcnN0LCB0cnVlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wYW5lbHMuZm9yRWFjaChwYW5lbCA9PiB0aGlzLl9jaGFuZ2VPcGVuU3RhdGUocGFuZWwsIHRydWUpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ29sbGFwc2VzIGEgcGFuZWwgd2l0aCB0aGUgZ2l2ZW4gaWQuXG4gICAqXG4gICAqIEhhcyBubyBlZmZlY3QgaWYgdGhlIHBhbmVsIGlzIGFscmVhZHkgY29sbGFwc2VkIG9yIGRpc2FibGVkLlxuICAgKi9cbiAgY29sbGFwc2UocGFuZWxJZDogc3RyaW5nKSB7IHRoaXMuX2NoYW5nZU9wZW5TdGF0ZSh0aGlzLl9maW5kUGFuZWxCeUlkKHBhbmVsSWQpLCBmYWxzZSk7IH1cblxuICAvKipcbiAgICogQ29sbGFwc2VzIGFsbCBvcGVuZWQgcGFuZWxzLlxuICAgKi9cbiAgY29sbGFwc2VBbGwoKSB7XG4gICAgdGhpcy5wYW5lbHMuZm9yRWFjaCgocGFuZWwpID0+IHsgdGhpcy5fY2hhbmdlT3BlblN0YXRlKHBhbmVsLCBmYWxzZSk7IH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZXMgYSBwYW5lbCB3aXRoIHRoZSBnaXZlbiBpZC5cbiAgICpcbiAgICogSGFzIG5vIGVmZmVjdCBpZiB0aGUgcGFuZWwgaXMgZGlzYWJsZWQuXG4gICAqL1xuICB0b2dnbGUocGFuZWxJZDogc3RyaW5nKSB7XG4gICAgY29uc3QgcGFuZWwgPSB0aGlzLl9maW5kUGFuZWxCeUlkKHBhbmVsSWQpO1xuICAgIGlmIChwYW5lbCkge1xuICAgICAgdGhpcy5fY2hhbmdlT3BlblN0YXRlKHBhbmVsLCAhcGFuZWwuaXNPcGVuKTtcbiAgICB9XG4gIH1cblxuICBuZ0FmdGVyQ29udGVudENoZWNrZWQoKSB7XG4gICAgLy8gYWN0aXZlIGlkIHVwZGF0ZXNcbiAgICBpZiAoaXNTdHJpbmcodGhpcy5hY3RpdmVJZHMpKSB7XG4gICAgICB0aGlzLmFjdGl2ZUlkcyA9IHRoaXMuYWN0aXZlSWRzLnNwbGl0KC9cXHMqLFxccyovKTtcbiAgICB9XG5cbiAgICAvLyB1cGRhdGUgcGFuZWxzIG9wZW4gc3RhdGVzXG4gICAgdGhpcy5wYW5lbHMuZm9yRWFjaChwYW5lbCA9PiBwYW5lbC5pc09wZW4gPSAhcGFuZWwuZGlzYWJsZWQgJiYgdGhpcy5hY3RpdmVJZHMuaW5kZXhPZihwYW5lbC5pZCkgPiAtMSk7XG5cbiAgICAvLyBjbG9zZU90aGVycyB1cGRhdGVzXG4gICAgaWYgKHRoaXMuYWN0aXZlSWRzLmxlbmd0aCA+IDEgJiYgdGhpcy5jbG9zZU90aGVyUGFuZWxzKSB7XG4gICAgICB0aGlzLl9jbG9zZU90aGVycyh0aGlzLmFjdGl2ZUlkc1swXSk7XG4gICAgICB0aGlzLl91cGRhdGVBY3RpdmVJZHMoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jaGFuZ2VPcGVuU3RhdGUocGFuZWw6IE5nYlBhbmVsLCBuZXh0U3RhdGU6IGJvb2xlYW4pIHtcbiAgICBpZiAocGFuZWwgJiYgIXBhbmVsLmRpc2FibGVkICYmIHBhbmVsLmlzT3BlbiAhPT0gbmV4dFN0YXRlKSB7XG4gICAgICBsZXQgZGVmYXVsdFByZXZlbnRlZCA9IGZhbHNlO1xuXG4gICAgICB0aGlzLnBhbmVsQ2hhbmdlLmVtaXQoXG4gICAgICAgICAge3BhbmVsSWQ6IHBhbmVsLmlkLCBuZXh0U3RhdGU6IG5leHRTdGF0ZSwgcHJldmVudERlZmF1bHQ6ICgpID0+IHsgZGVmYXVsdFByZXZlbnRlZCA9IHRydWU7IH19KTtcblxuICAgICAgaWYgKCFkZWZhdWx0UHJldmVudGVkKSB7XG4gICAgICAgIHBhbmVsLmlzT3BlbiA9IG5leHRTdGF0ZTtcblxuICAgICAgICBpZiAobmV4dFN0YXRlICYmIHRoaXMuY2xvc2VPdGhlclBhbmVscykge1xuICAgICAgICAgIHRoaXMuX2Nsb3NlT3RoZXJzKHBhbmVsLmlkKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl91cGRhdGVBY3RpdmVJZHMoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jbG9zZU90aGVycyhwYW5lbElkOiBzdHJpbmcpIHtcbiAgICB0aGlzLnBhbmVscy5mb3JFYWNoKHBhbmVsID0+IHtcbiAgICAgIGlmIChwYW5lbC5pZCAhPT0gcGFuZWxJZCkge1xuICAgICAgICBwYW5lbC5pc09wZW4gPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2ZpbmRQYW5lbEJ5SWQocGFuZWxJZDogc3RyaW5nKTogTmdiUGFuZWwgfCBudWxsIHsgcmV0dXJuIHRoaXMucGFuZWxzLmZpbmQocCA9PiBwLmlkID09PSBwYW5lbElkKTsgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZUFjdGl2ZUlkcygpIHtcbiAgICB0aGlzLmFjdGl2ZUlkcyA9IHRoaXMucGFuZWxzLmZpbHRlcihwYW5lbCA9PiBwYW5lbC5pc09wZW4gJiYgIXBhbmVsLmRpc2FibGVkKS5tYXAocGFuZWwgPT4gcGFuZWwuaWQpO1xuICB9XG59XG5cbi8qKlxuICogQSBkaXJlY3RpdmUgdG8gcHV0IG9uIGEgYnV0dG9uIHRoYXQgdG9nZ2xlcyBwYW5lbCBvcGVuaW5nIGFuZCBjbG9zaW5nLlxuICpcbiAqIFRvIGJlIHVzZWQgaW5zaWRlIHRoZSBbYE5nYlBhbmVsSGVhZGVyYF0oIy9jb21wb25lbnRzL2FjY29yZGlvbi9hcGkjTmdiUGFuZWxIZWFkZXIpXG4gKlxuICogQHNpbmNlIDQuMS4wXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ2J1dHRvbltuZ2JQYW5lbFRvZ2dsZV0nLFxuICBob3N0OiB7XG4gICAgJ3R5cGUnOiAnYnV0dG9uJyxcbiAgICAnW2Rpc2FibGVkXSc6ICdwYW5lbC5kaXNhYmxlZCcsXG4gICAgJ1tjbGFzcy5jb2xsYXBzZWRdJzogJyFwYW5lbC5pc09wZW4nLFxuICAgICdbYXR0ci5hcmlhLWV4cGFuZGVkXSc6ICdwYW5lbC5pc09wZW4nLFxuICAgICdbYXR0ci5hcmlhLWNvbnRyb2xzXSc6ICdwYW5lbC5pZCcsXG4gICAgJyhjbGljayknOiAnYWNjb3JkaW9uLnRvZ2dsZShwYW5lbC5pZCknXG4gIH1cbn0pXG5leHBvcnQgY2xhc3MgTmdiUGFuZWxUb2dnbGUge1xuICBASW5wdXQoKVxuICBzZXQgbmdiUGFuZWxUb2dnbGUocGFuZWw6IE5nYlBhbmVsKSB7XG4gICAgaWYgKHBhbmVsKSB7XG4gICAgICB0aGlzLnBhbmVsID0gcGFuZWw7XG4gICAgfVxuICB9XG5cbiAgY29uc3RydWN0b3IocHVibGljIGFjY29yZGlvbjogTmdiQWNjb3JkaW9uLCBAT3B0aW9uYWwoKSBASG9zdCgpIHB1YmxpYyBwYW5lbDogTmdiUGFuZWwpIHt9XG59XG4iXX0=
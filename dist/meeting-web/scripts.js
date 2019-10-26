/**!
 * @fileOverview Kickass library to create and place poppers near their reference elements.
 * @version 1.15.0
 * @license
 * Copyright (c) 2016 Federico Zivolo and contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Popper = factory());
}(this, (function () { 'use strict';

var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

var longerTimeoutBrowsers = ['Edge', 'Trident', 'Firefox'];
var timeoutDuration = 0;
for (var i = 0; i < longerTimeoutBrowsers.length; i += 1) {
  if (isBrowser && navigator.userAgent.indexOf(longerTimeoutBrowsers[i]) >= 0) {
    timeoutDuration = 1;
    break;
  }
}

function microtaskDebounce(fn) {
  var called = false;
  return function () {
    if (called) {
      return;
    }
    called = true;
    window.Promise.resolve().then(function () {
      called = false;
      fn();
    });
  };
}

function taskDebounce(fn) {
  var scheduled = false;
  return function () {
    if (!scheduled) {
      scheduled = true;
      setTimeout(function () {
        scheduled = false;
        fn();
      }, timeoutDuration);
    }
  };
}

var supportsMicroTasks = isBrowser && window.Promise;

/**
* Create a debounced version of a method, that's asynchronously deferred
* but called in the minimum time possible.
*
* @method
* @memberof Popper.Utils
* @argument {Function} fn
* @returns {Function}
*/
var debounce = supportsMicroTasks ? microtaskDebounce : taskDebounce;

/**
 * Check if the given variable is a function
 * @method
 * @memberof Popper.Utils
 * @argument {Any} functionToCheck - variable to check
 * @returns {Boolean} answer to: is a function?
 */
function isFunction(functionToCheck) {
  var getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

/**
 * Get CSS computed property of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Eement} element
 * @argument {String} property
 */
function getStyleComputedProperty(element, property) {
  if (element.nodeType !== 1) {
    return [];
  }
  // NOTE: 1 DOM access here
  var window = element.ownerDocument.defaultView;
  var css = window.getComputedStyle(element, null);
  return property ? css[property] : css;
}

/**
 * Returns the parentNode or the host of the element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} parent
 */
function getParentNode(element) {
  if (element.nodeName === 'HTML') {
    return element;
  }
  return element.parentNode || element.host;
}

/**
 * Returns the scrolling parent of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} scroll parent
 */
function getScrollParent(element) {
  // Return body, `getScroll` will take care to get the correct `scrollTop` from it
  if (!element) {
    return document.body;
  }

  switch (element.nodeName) {
    case 'HTML':
    case 'BODY':
      return element.ownerDocument.body;
    case '#document':
      return element.body;
  }

  // Firefox want us to check `-x` and `-y` variations as well

  var _getStyleComputedProp = getStyleComputedProperty(element),
      overflow = _getStyleComputedProp.overflow,
      overflowX = _getStyleComputedProp.overflowX,
      overflowY = _getStyleComputedProp.overflowY;

  if (/(auto|scroll|overlay)/.test(overflow + overflowY + overflowX)) {
    return element;
  }

  return getScrollParent(getParentNode(element));
}

var isIE11 = isBrowser && !!(window.MSInputMethodContext && document.documentMode);
var isIE10 = isBrowser && /MSIE 10/.test(navigator.userAgent);

/**
 * Determines if the browser is Internet Explorer
 * @method
 * @memberof Popper.Utils
 * @param {Number} version to check
 * @returns {Boolean} isIE
 */
function isIE(version) {
  if (version === 11) {
    return isIE11;
  }
  if (version === 10) {
    return isIE10;
  }
  return isIE11 || isIE10;
}

/**
 * Returns the offset parent of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} offset parent
 */
function getOffsetParent(element) {
  if (!element) {
    return document.documentElement;
  }

  var noOffsetParent = isIE(10) ? document.body : null;

  // NOTE: 1 DOM access here
  var offsetParent = element.offsetParent || null;
  // Skip hidden elements which don't have an offsetParent
  while (offsetParent === noOffsetParent && element.nextElementSibling) {
    offsetParent = (element = element.nextElementSibling).offsetParent;
  }

  var nodeName = offsetParent && offsetParent.nodeName;

  if (!nodeName || nodeName === 'BODY' || nodeName === 'HTML') {
    return element ? element.ownerDocument.documentElement : document.documentElement;
  }

  // .offsetParent will return the closest TH, TD or TABLE in case
  // no offsetParent is present, I hate this job...
  if (['TH', 'TD', 'TABLE'].indexOf(offsetParent.nodeName) !== -1 && getStyleComputedProperty(offsetParent, 'position') === 'static') {
    return getOffsetParent(offsetParent);
  }

  return offsetParent;
}

function isOffsetContainer(element) {
  var nodeName = element.nodeName;

  if (nodeName === 'BODY') {
    return false;
  }
  return nodeName === 'HTML' || getOffsetParent(element.firstElementChild) === element;
}

/**
 * Finds the root node (document, shadowDOM root) of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} node
 * @returns {Element} root node
 */
function getRoot(node) {
  if (node.parentNode !== null) {
    return getRoot(node.parentNode);
  }

  return node;
}

/**
 * Finds the offset parent common to the two provided nodes
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element1
 * @argument {Element} element2
 * @returns {Element} common offset parent
 */
function findCommonOffsetParent(element1, element2) {
  // This check is needed to avoid errors in case one of the elements isn't defined for any reason
  if (!element1 || !element1.nodeType || !element2 || !element2.nodeType) {
    return document.documentElement;
  }

  // Here we make sure to give as "start" the element that comes first in the DOM
  var order = element1.compareDocumentPosition(element2) & Node.DOCUMENT_POSITION_FOLLOWING;
  var start = order ? element1 : element2;
  var end = order ? element2 : element1;

  // Get common ancestor container
  var range = document.createRange();
  range.setStart(start, 0);
  range.setEnd(end, 0);
  var commonAncestorContainer = range.commonAncestorContainer;

  // Both nodes are inside #document

  if (element1 !== commonAncestorContainer && element2 !== commonAncestorContainer || start.contains(end)) {
    if (isOffsetContainer(commonAncestorContainer)) {
      return commonAncestorContainer;
    }

    return getOffsetParent(commonAncestorContainer);
  }

  // one of the nodes is inside shadowDOM, find which one
  var element1root = getRoot(element1);
  if (element1root.host) {
    return findCommonOffsetParent(element1root.host, element2);
  } else {
    return findCommonOffsetParent(element1, getRoot(element2).host);
  }
}

/**
 * Gets the scroll value of the given element in the given side (top and left)
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @argument {String} side `top` or `left`
 * @returns {number} amount of scrolled pixels
 */
function getScroll(element) {
  var side = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'top';

  var upperSide = side === 'top' ? 'scrollTop' : 'scrollLeft';
  var nodeName = element.nodeName;

  if (nodeName === 'BODY' || nodeName === 'HTML') {
    var html = element.ownerDocument.documentElement;
    var scrollingElement = element.ownerDocument.scrollingElement || html;
    return scrollingElement[upperSide];
  }

  return element[upperSide];
}

/*
 * Sum or subtract the element scroll values (left and top) from a given rect object
 * @method
 * @memberof Popper.Utils
 * @param {Object} rect - Rect object you want to change
 * @param {HTMLElement} element - The element from the function reads the scroll values
 * @param {Boolean} subtract - set to true if you want to subtract the scroll values
 * @return {Object} rect - The modifier rect object
 */
function includeScroll(rect, element) {
  var subtract = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var scrollTop = getScroll(element, 'top');
  var scrollLeft = getScroll(element, 'left');
  var modifier = subtract ? -1 : 1;
  rect.top += scrollTop * modifier;
  rect.bottom += scrollTop * modifier;
  rect.left += scrollLeft * modifier;
  rect.right += scrollLeft * modifier;
  return rect;
}

/*
 * Helper to detect borders of a given element
 * @method
 * @memberof Popper.Utils
 * @param {CSSStyleDeclaration} styles
 * Result of `getStyleComputedProperty` on the given element
 * @param {String} axis - `x` or `y`
 * @return {number} borders - The borders size of the given axis
 */

function getBordersSize(styles, axis) {
  var sideA = axis === 'x' ? 'Left' : 'Top';
  var sideB = sideA === 'Left' ? 'Right' : 'Bottom';

  return parseFloat(styles['border' + sideA + 'Width'], 10) + parseFloat(styles['border' + sideB + 'Width'], 10);
}

function getSize(axis, body, html, computedStyle) {
  return Math.max(body['offset' + axis], body['scroll' + axis], html['client' + axis], html['offset' + axis], html['scroll' + axis], isIE(10) ? parseInt(html['offset' + axis]) + parseInt(computedStyle['margin' + (axis === 'Height' ? 'Top' : 'Left')]) + parseInt(computedStyle['margin' + (axis === 'Height' ? 'Bottom' : 'Right')]) : 0);
}

function getWindowSizes(document) {
  var body = document.body;
  var html = document.documentElement;
  var computedStyle = isIE(10) && getComputedStyle(html);

  return {
    height: getSize('Height', body, html, computedStyle),
    width: getSize('Width', body, html, computedStyle)
  };
}

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();





var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

/**
 * Given element offsets, generate an output similar to getBoundingClientRect
 * @method
 * @memberof Popper.Utils
 * @argument {Object} offsets
 * @returns {Object} ClientRect like output
 */
function getClientRect(offsets) {
  return _extends({}, offsets, {
    right: offsets.left + offsets.width,
    bottom: offsets.top + offsets.height
  });
}

/**
 * Get bounding client rect of given element
 * @method
 * @memberof Popper.Utils
 * @param {HTMLElement} element
 * @return {Object} client rect
 */
function getBoundingClientRect(element) {
  var rect = {};

  // IE10 10 FIX: Please, don't ask, the element isn't
  // considered in DOM in some circumstances...
  // This isn't reproducible in IE10 compatibility mode of IE11
  try {
    if (isIE(10)) {
      rect = element.getBoundingClientRect();
      var scrollTop = getScroll(element, 'top');
      var scrollLeft = getScroll(element, 'left');
      rect.top += scrollTop;
      rect.left += scrollLeft;
      rect.bottom += scrollTop;
      rect.right += scrollLeft;
    } else {
      rect = element.getBoundingClientRect();
    }
  } catch (e) {}

  var result = {
    left: rect.left,
    top: rect.top,
    width: rect.right - rect.left,
    height: rect.bottom - rect.top
  };

  // subtract scrollbar size from sizes
  var sizes = element.nodeName === 'HTML' ? getWindowSizes(element.ownerDocument) : {};
  var width = sizes.width || element.clientWidth || result.right - result.left;
  var height = sizes.height || element.clientHeight || result.bottom - result.top;

  var horizScrollbar = element.offsetWidth - width;
  var vertScrollbar = element.offsetHeight - height;

  // if an hypothetical scrollbar is detected, we must be sure it's not a `border`
  // we make this check conditional for performance reasons
  if (horizScrollbar || vertScrollbar) {
    var styles = getStyleComputedProperty(element);
    horizScrollbar -= getBordersSize(styles, 'x');
    vertScrollbar -= getBordersSize(styles, 'y');

    result.width -= horizScrollbar;
    result.height -= vertScrollbar;
  }

  return getClientRect(result);
}

function getOffsetRectRelativeToArbitraryNode(children, parent) {
  var fixedPosition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var isIE10 = isIE(10);
  var isHTML = parent.nodeName === 'HTML';
  var childrenRect = getBoundingClientRect(children);
  var parentRect = getBoundingClientRect(parent);
  var scrollParent = getScrollParent(children);

  var styles = getStyleComputedProperty(parent);
  var borderTopWidth = parseFloat(styles.borderTopWidth, 10);
  var borderLeftWidth = parseFloat(styles.borderLeftWidth, 10);

  // In cases where the parent is fixed, we must ignore negative scroll in offset calc
  if (fixedPosition && isHTML) {
    parentRect.top = Math.max(parentRect.top, 0);
    parentRect.left = Math.max(parentRect.left, 0);
  }
  var offsets = getClientRect({
    top: childrenRect.top - parentRect.top - borderTopWidth,
    left: childrenRect.left - parentRect.left - borderLeftWidth,
    width: childrenRect.width,
    height: childrenRect.height
  });
  offsets.marginTop = 0;
  offsets.marginLeft = 0;

  // Subtract margins of documentElement in case it's being used as parent
  // we do this only on HTML because it's the only element that behaves
  // differently when margins are applied to it. The margins are included in
  // the box of the documentElement, in the other cases not.
  if (!isIE10 && isHTML) {
    var marginTop = parseFloat(styles.marginTop, 10);
    var marginLeft = parseFloat(styles.marginLeft, 10);

    offsets.top -= borderTopWidth - marginTop;
    offsets.bottom -= borderTopWidth - marginTop;
    offsets.left -= borderLeftWidth - marginLeft;
    offsets.right -= borderLeftWidth - marginLeft;

    // Attach marginTop and marginLeft because in some circumstances we may need them
    offsets.marginTop = marginTop;
    offsets.marginLeft = marginLeft;
  }

  if (isIE10 && !fixedPosition ? parent.contains(scrollParent) : parent === scrollParent && scrollParent.nodeName !== 'BODY') {
    offsets = includeScroll(offsets, parent);
  }

  return offsets;
}

function getViewportOffsetRectRelativeToArtbitraryNode(element) {
  var excludeScroll = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var html = element.ownerDocument.documentElement;
  var relativeOffset = getOffsetRectRelativeToArbitraryNode(element, html);
  var width = Math.max(html.clientWidth, window.innerWidth || 0);
  var height = Math.max(html.clientHeight, window.innerHeight || 0);

  var scrollTop = !excludeScroll ? getScroll(html) : 0;
  var scrollLeft = !excludeScroll ? getScroll(html, 'left') : 0;

  var offset = {
    top: scrollTop - relativeOffset.top + relativeOffset.marginTop,
    left: scrollLeft - relativeOffset.left + relativeOffset.marginLeft,
    width: width,
    height: height
  };

  return getClientRect(offset);
}

/**
 * Check if the given element is fixed or is inside a fixed parent
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @argument {Element} customContainer
 * @returns {Boolean} answer to "isFixed?"
 */
function isFixed(element) {
  var nodeName = element.nodeName;
  if (nodeName === 'BODY' || nodeName === 'HTML') {
    return false;
  }
  if (getStyleComputedProperty(element, 'position') === 'fixed') {
    return true;
  }
  var parentNode = getParentNode(element);
  if (!parentNode) {
    return false;
  }
  return isFixed(parentNode);
}

/**
 * Finds the first parent of an element that has a transformed property defined
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} first transformed parent or documentElement
 */

function getFixedPositionOffsetParent(element) {
  // This check is needed to avoid errors in case one of the elements isn't defined for any reason
  if (!element || !element.parentElement || isIE()) {
    return document.documentElement;
  }
  var el = element.parentElement;
  while (el && getStyleComputedProperty(el, 'transform') === 'none') {
    el = el.parentElement;
  }
  return el || document.documentElement;
}

/**
 * Computed the boundaries limits and return them
 * @method
 * @memberof Popper.Utils
 * @param {HTMLElement} popper
 * @param {HTMLElement} reference
 * @param {number} padding
 * @param {HTMLElement} boundariesElement - Element used to define the boundaries
 * @param {Boolean} fixedPosition - Is in fixed position mode
 * @returns {Object} Coordinates of the boundaries
 */
function getBoundaries(popper, reference, padding, boundariesElement) {
  var fixedPosition = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

  // NOTE: 1 DOM access here

  var boundaries = { top: 0, left: 0 };
  var offsetParent = fixedPosition ? getFixedPositionOffsetParent(popper) : findCommonOffsetParent(popper, reference);

  // Handle viewport case
  if (boundariesElement === 'viewport') {
    boundaries = getViewportOffsetRectRelativeToArtbitraryNode(offsetParent, fixedPosition);
  } else {
    // Handle other cases based on DOM element used as boundaries
    var boundariesNode = void 0;
    if (boundariesElement === 'scrollParent') {
      boundariesNode = getScrollParent(getParentNode(reference));
      if (boundariesNode.nodeName === 'BODY') {
        boundariesNode = popper.ownerDocument.documentElement;
      }
    } else if (boundariesElement === 'window') {
      boundariesNode = popper.ownerDocument.documentElement;
    } else {
      boundariesNode = boundariesElement;
    }

    var offsets = getOffsetRectRelativeToArbitraryNode(boundariesNode, offsetParent, fixedPosition);

    // In case of HTML, we need a different computation
    if (boundariesNode.nodeName === 'HTML' && !isFixed(offsetParent)) {
      var _getWindowSizes = getWindowSizes(popper.ownerDocument),
          height = _getWindowSizes.height,
          width = _getWindowSizes.width;

      boundaries.top += offsets.top - offsets.marginTop;
      boundaries.bottom = height + offsets.top;
      boundaries.left += offsets.left - offsets.marginLeft;
      boundaries.right = width + offsets.left;
    } else {
      // for all the other DOM elements, this one is good
      boundaries = offsets;
    }
  }

  // Add paddings
  padding = padding || 0;
  var isPaddingNumber = typeof padding === 'number';
  boundaries.left += isPaddingNumber ? padding : padding.left || 0;
  boundaries.top += isPaddingNumber ? padding : padding.top || 0;
  boundaries.right -= isPaddingNumber ? padding : padding.right || 0;
  boundaries.bottom -= isPaddingNumber ? padding : padding.bottom || 0;

  return boundaries;
}

function getArea(_ref) {
  var width = _ref.width,
      height = _ref.height;

  return width * height;
}

/**
 * Utility used to transform the `auto` placement to the placement with more
 * available space.
 * @method
 * @memberof Popper.Utils
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function computeAutoPlacement(placement, refRect, popper, reference, boundariesElement) {
  var padding = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;

  if (placement.indexOf('auto') === -1) {
    return placement;
  }

  var boundaries = getBoundaries(popper, reference, padding, boundariesElement);

  var rects = {
    top: {
      width: boundaries.width,
      height: refRect.top - boundaries.top
    },
    right: {
      width: boundaries.right - refRect.right,
      height: boundaries.height
    },
    bottom: {
      width: boundaries.width,
      height: boundaries.bottom - refRect.bottom
    },
    left: {
      width: refRect.left - boundaries.left,
      height: boundaries.height
    }
  };

  var sortedAreas = Object.keys(rects).map(function (key) {
    return _extends({
      key: key
    }, rects[key], {
      area: getArea(rects[key])
    });
  }).sort(function (a, b) {
    return b.area - a.area;
  });

  var filteredAreas = sortedAreas.filter(function (_ref2) {
    var width = _ref2.width,
        height = _ref2.height;
    return width >= popper.clientWidth && height >= popper.clientHeight;
  });

  var computedPlacement = filteredAreas.length > 0 ? filteredAreas[0].key : sortedAreas[0].key;

  var variation = placement.split('-')[1];

  return computedPlacement + (variation ? '-' + variation : '');
}

/**
 * Get offsets to the reference element
 * @method
 * @memberof Popper.Utils
 * @param {Object} state
 * @param {Element} popper - the popper element
 * @param {Element} reference - the reference element (the popper will be relative to this)
 * @param {Element} fixedPosition - is in fixed position mode
 * @returns {Object} An object containing the offsets which will be applied to the popper
 */
function getReferenceOffsets(state, popper, reference) {
  var fixedPosition = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

  var commonOffsetParent = fixedPosition ? getFixedPositionOffsetParent(popper) : findCommonOffsetParent(popper, reference);
  return getOffsetRectRelativeToArbitraryNode(reference, commonOffsetParent, fixedPosition);
}

/**
 * Get the outer sizes of the given element (offset size + margins)
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Object} object containing width and height properties
 */
function getOuterSizes(element) {
  var window = element.ownerDocument.defaultView;
  var styles = window.getComputedStyle(element);
  var x = parseFloat(styles.marginTop || 0) + parseFloat(styles.marginBottom || 0);
  var y = parseFloat(styles.marginLeft || 0) + parseFloat(styles.marginRight || 0);
  var result = {
    width: element.offsetWidth + y,
    height: element.offsetHeight + x
  };
  return result;
}

/**
 * Get the opposite placement of the given one
 * @method
 * @memberof Popper.Utils
 * @argument {String} placement
 * @returns {String} flipped placement
 */
function getOppositePlacement(placement) {
  var hash = { left: 'right', right: 'left', bottom: 'top', top: 'bottom' };
  return placement.replace(/left|right|bottom|top/g, function (matched) {
    return hash[matched];
  });
}

/**
 * Get offsets to the popper
 * @method
 * @memberof Popper.Utils
 * @param {Object} position - CSS position the Popper will get applied
 * @param {HTMLElement} popper - the popper element
 * @param {Object} referenceOffsets - the reference offsets (the popper will be relative to this)
 * @param {String} placement - one of the valid placement options
 * @returns {Object} popperOffsets - An object containing the offsets which will be applied to the popper
 */
function getPopperOffsets(popper, referenceOffsets, placement) {
  placement = placement.split('-')[0];

  // Get popper node sizes
  var popperRect = getOuterSizes(popper);

  // Add position, width and height to our offsets object
  var popperOffsets = {
    width: popperRect.width,
    height: popperRect.height
  };

  // depending by the popper placement we have to compute its offsets slightly differently
  var isHoriz = ['right', 'left'].indexOf(placement) !== -1;
  var mainSide = isHoriz ? 'top' : 'left';
  var secondarySide = isHoriz ? 'left' : 'top';
  var measurement = isHoriz ? 'height' : 'width';
  var secondaryMeasurement = !isHoriz ? 'height' : 'width';

  popperOffsets[mainSide] = referenceOffsets[mainSide] + referenceOffsets[measurement] / 2 - popperRect[measurement] / 2;
  if (placement === secondarySide) {
    popperOffsets[secondarySide] = referenceOffsets[secondarySide] - popperRect[secondaryMeasurement];
  } else {
    popperOffsets[secondarySide] = referenceOffsets[getOppositePlacement(secondarySide)];
  }

  return popperOffsets;
}

/**
 * Mimics the `find` method of Array
 * @method
 * @memberof Popper.Utils
 * @argument {Array} arr
 * @argument prop
 * @argument value
 * @returns index or -1
 */
function find(arr, check) {
  // use native find if supported
  if (Array.prototype.find) {
    return arr.find(check);
  }

  // use `filter` to obtain the same behavior of `find`
  return arr.filter(check)[0];
}

/**
 * Return the index of the matching object
 * @method
 * @memberof Popper.Utils
 * @argument {Array} arr
 * @argument prop
 * @argument value
 * @returns index or -1
 */
function findIndex(arr, prop, value) {
  // use native findIndex if supported
  if (Array.prototype.findIndex) {
    return arr.findIndex(function (cur) {
      return cur[prop] === value;
    });
  }

  // use `find` + `indexOf` if `findIndex` isn't supported
  var match = find(arr, function (obj) {
    return obj[prop] === value;
  });
  return arr.indexOf(match);
}

/**
 * Loop trough the list of modifiers and run them in order,
 * each of them will then edit the data object.
 * @method
 * @memberof Popper.Utils
 * @param {dataObject} data
 * @param {Array} modifiers
 * @param {String} ends - Optional modifier name used as stopper
 * @returns {dataObject}
 */
function runModifiers(modifiers, data, ends) {
  var modifiersToRun = ends === undefined ? modifiers : modifiers.slice(0, findIndex(modifiers, 'name', ends));

  modifiersToRun.forEach(function (modifier) {
    if (modifier['function']) {
      // eslint-disable-line dot-notation
      console.warn('`modifier.function` is deprecated, use `modifier.fn`!');
    }
    var fn = modifier['function'] || modifier.fn; // eslint-disable-line dot-notation
    if (modifier.enabled && isFunction(fn)) {
      // Add properties to offsets to make them a complete clientRect object
      // we do this before each modifier to make sure the previous one doesn't
      // mess with these values
      data.offsets.popper = getClientRect(data.offsets.popper);
      data.offsets.reference = getClientRect(data.offsets.reference);

      data = fn(data, modifier);
    }
  });

  return data;
}

/**
 * Updates the position of the popper, computing the new offsets and applying
 * the new style.<br />
 * Prefer `scheduleUpdate` over `update` because of performance reasons.
 * @method
 * @memberof Popper
 */
function update() {
  // if popper is destroyed, don't perform any further update
  if (this.state.isDestroyed) {
    return;
  }

  var data = {
    instance: this,
    styles: {},
    arrowStyles: {},
    attributes: {},
    flipped: false,
    offsets: {}
  };

  // compute reference element offsets
  data.offsets.reference = getReferenceOffsets(this.state, this.popper, this.reference, this.options.positionFixed);

  // compute auto placement, store placement inside the data object,
  // modifiers will be able to edit `placement` if needed
  // and refer to originalPlacement to know the original value
  data.placement = computeAutoPlacement(this.options.placement, data.offsets.reference, this.popper, this.reference, this.options.modifiers.flip.boundariesElement, this.options.modifiers.flip.padding);

  // store the computed placement inside `originalPlacement`
  data.originalPlacement = data.placement;

  data.positionFixed = this.options.positionFixed;

  // compute the popper offsets
  data.offsets.popper = getPopperOffsets(this.popper, data.offsets.reference, data.placement);

  data.offsets.popper.position = this.options.positionFixed ? 'fixed' : 'absolute';

  // run the modifiers
  data = runModifiers(this.modifiers, data);

  // the first `update` will call `onCreate` callback
  // the other ones will call `onUpdate` callback
  if (!this.state.isCreated) {
    this.state.isCreated = true;
    this.options.onCreate(data);
  } else {
    this.options.onUpdate(data);
  }
}

/**
 * Helper used to know if the given modifier is enabled.
 * @method
 * @memberof Popper.Utils
 * @returns {Boolean}
 */
function isModifierEnabled(modifiers, modifierName) {
  return modifiers.some(function (_ref) {
    var name = _ref.name,
        enabled = _ref.enabled;
    return enabled && name === modifierName;
  });
}

/**
 * Get the prefixed supported property name
 * @method
 * @memberof Popper.Utils
 * @argument {String} property (camelCase)
 * @returns {String} prefixed property (camelCase or PascalCase, depending on the vendor prefix)
 */
function getSupportedPropertyName(property) {
  var prefixes = [false, 'ms', 'Webkit', 'Moz', 'O'];
  var upperProp = property.charAt(0).toUpperCase() + property.slice(1);

  for (var i = 0; i < prefixes.length; i++) {
    var prefix = prefixes[i];
    var toCheck = prefix ? '' + prefix + upperProp : property;
    if (typeof document.body.style[toCheck] !== 'undefined') {
      return toCheck;
    }
  }
  return null;
}

/**
 * Destroys the popper.
 * @method
 * @memberof Popper
 */
function destroy() {
  this.state.isDestroyed = true;

  // touch DOM only if `applyStyle` modifier is enabled
  if (isModifierEnabled(this.modifiers, 'applyStyle')) {
    this.popper.removeAttribute('x-placement');
    this.popper.style.position = '';
    this.popper.style.top = '';
    this.popper.style.left = '';
    this.popper.style.right = '';
    this.popper.style.bottom = '';
    this.popper.style.willChange = '';
    this.popper.style[getSupportedPropertyName('transform')] = '';
  }

  this.disableEventListeners();

  // remove the popper if user explicity asked for the deletion on destroy
  // do not use `remove` because IE11 doesn't support it
  if (this.options.removeOnDestroy) {
    this.popper.parentNode.removeChild(this.popper);
  }
  return this;
}

/**
 * Get the window associated with the element
 * @argument {Element} element
 * @returns {Window}
 */
function getWindow(element) {
  var ownerDocument = element.ownerDocument;
  return ownerDocument ? ownerDocument.defaultView : window;
}

function attachToScrollParents(scrollParent, event, callback, scrollParents) {
  var isBody = scrollParent.nodeName === 'BODY';
  var target = isBody ? scrollParent.ownerDocument.defaultView : scrollParent;
  target.addEventListener(event, callback, { passive: true });

  if (!isBody) {
    attachToScrollParents(getScrollParent(target.parentNode), event, callback, scrollParents);
  }
  scrollParents.push(target);
}

/**
 * Setup needed event listeners used to update the popper position
 * @method
 * @memberof Popper.Utils
 * @private
 */
function setupEventListeners(reference, options, state, updateBound) {
  // Resize event listener on window
  state.updateBound = updateBound;
  getWindow(reference).addEventListener('resize', state.updateBound, { passive: true });

  // Scroll event listener on scroll parents
  var scrollElement = getScrollParent(reference);
  attachToScrollParents(scrollElement, 'scroll', state.updateBound, state.scrollParents);
  state.scrollElement = scrollElement;
  state.eventsEnabled = true;

  return state;
}

/**
 * It will add resize/scroll events and start recalculating
 * position of the popper element when they are triggered.
 * @method
 * @memberof Popper
 */
function enableEventListeners() {
  if (!this.state.eventsEnabled) {
    this.state = setupEventListeners(this.reference, this.options, this.state, this.scheduleUpdate);
  }
}

/**
 * Remove event listeners used to update the popper position
 * @method
 * @memberof Popper.Utils
 * @private
 */
function removeEventListeners(reference, state) {
  // Remove resize event listener on window
  getWindow(reference).removeEventListener('resize', state.updateBound);

  // Remove scroll event listener on scroll parents
  state.scrollParents.forEach(function (target) {
    target.removeEventListener('scroll', state.updateBound);
  });

  // Reset state
  state.updateBound = null;
  state.scrollParents = [];
  state.scrollElement = null;
  state.eventsEnabled = false;
  return state;
}

/**
 * It will remove resize/scroll events and won't recalculate popper position
 * when they are triggered. It also won't trigger `onUpdate` callback anymore,
 * unless you call `update` method manually.
 * @method
 * @memberof Popper
 */
function disableEventListeners() {
  if (this.state.eventsEnabled) {
    cancelAnimationFrame(this.scheduleUpdate);
    this.state = removeEventListeners(this.reference, this.state);
  }
}

/**
 * Tells if a given input is a number
 * @method
 * @memberof Popper.Utils
 * @param {*} input to check
 * @return {Boolean}
 */
function isNumeric(n) {
  return n !== '' && !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * Set the style to the given popper
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element - Element to apply the style to
 * @argument {Object} styles
 * Object with a list of properties and values which will be applied to the element
 */
function setStyles(element, styles) {
  Object.keys(styles).forEach(function (prop) {
    var unit = '';
    // add unit if the value is numeric and is one of the following
    if (['width', 'height', 'top', 'right', 'bottom', 'left'].indexOf(prop) !== -1 && isNumeric(styles[prop])) {
      unit = 'px';
    }
    element.style[prop] = styles[prop] + unit;
  });
}

/**
 * Set the attributes to the given popper
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element - Element to apply the attributes to
 * @argument {Object} styles
 * Object with a list of properties and values which will be applied to the element
 */
function setAttributes(element, attributes) {
  Object.keys(attributes).forEach(function (prop) {
    var value = attributes[prop];
    if (value !== false) {
      element.setAttribute(prop, attributes[prop]);
    } else {
      element.removeAttribute(prop);
    }
  });
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} data.styles - List of style properties - values to apply to popper element
 * @argument {Object} data.attributes - List of attribute properties - values to apply to popper element
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The same data object
 */
function applyStyle(data) {
  // any property present in `data.styles` will be applied to the popper,
  // in this way we can make the 3rd party modifiers add custom styles to it
  // Be aware, modifiers could override the properties defined in the previous
  // lines of this modifier!
  setStyles(data.instance.popper, data.styles);

  // any property present in `data.attributes` will be applied to the popper,
  // they will be set as HTML attributes of the element
  setAttributes(data.instance.popper, data.attributes);

  // if arrowElement is defined and arrowStyles has some properties
  if (data.arrowElement && Object.keys(data.arrowStyles).length) {
    setStyles(data.arrowElement, data.arrowStyles);
  }

  return data;
}

/**
 * Set the x-placement attribute before everything else because it could be used
 * to add margins to the popper margins needs to be calculated to get the
 * correct popper offsets.
 * @method
 * @memberof Popper.modifiers
 * @param {HTMLElement} reference - The reference element used to position the popper
 * @param {HTMLElement} popper - The HTML element used as popper
 * @param {Object} options - Popper.js options
 */
function applyStyleOnLoad(reference, popper, options, modifierOptions, state) {
  // compute reference element offsets
  var referenceOffsets = getReferenceOffsets(state, popper, reference, options.positionFixed);

  // compute auto placement, store placement inside the data object,
  // modifiers will be able to edit `placement` if needed
  // and refer to originalPlacement to know the original value
  var placement = computeAutoPlacement(options.placement, referenceOffsets, popper, reference, options.modifiers.flip.boundariesElement, options.modifiers.flip.padding);

  popper.setAttribute('x-placement', placement);

  // Apply `position` to popper before anything else because
  // without the position applied we can't guarantee correct computations
  setStyles(popper, { position: options.positionFixed ? 'fixed' : 'absolute' });

  return options;
}

/**
 * @function
 * @memberof Popper.Utils
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Boolean} shouldRound - If the offsets should be rounded at all
 * @returns {Object} The popper's position offsets rounded
 *
 * The tale of pixel-perfect positioning. It's still not 100% perfect, but as
 * good as it can be within reason.
 * Discussion here: https://github.com/FezVrasta/popper.js/pull/715
 *
 * Low DPI screens cause a popper to be blurry if not using full pixels (Safari
 * as well on High DPI screens).
 *
 * Firefox prefers no rounding for positioning and does not have blurriness on
 * high DPI screens.
 *
 * Only horizontal placement and left/right values need to be considered.
 */
function getRoundedOffsets(data, shouldRound) {
  var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;
  var round = Math.round,
      floor = Math.floor;

  var noRound = function noRound(v) {
    return v;
  };

  var referenceWidth = round(reference.width);
  var popperWidth = round(popper.width);

  var isVertical = ['left', 'right'].indexOf(data.placement) !== -1;
  var isVariation = data.placement.indexOf('-') !== -1;
  var sameWidthParity = referenceWidth % 2 === popperWidth % 2;
  var bothOddWidth = referenceWidth % 2 === 1 && popperWidth % 2 === 1;

  var horizontalToInteger = !shouldRound ? noRound : isVertical || isVariation || sameWidthParity ? round : floor;
  var verticalToInteger = !shouldRound ? noRound : round;

  return {
    left: horizontalToInteger(bothOddWidth && !isVariation && shouldRound ? popper.left - 1 : popper.left),
    top: verticalToInteger(popper.top),
    bottom: verticalToInteger(popper.bottom),
    right: horizontalToInteger(popper.right)
  };
}

var isFirefox = isBrowser && /Firefox/i.test(navigator.userAgent);

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function computeStyle(data, options) {
  var x = options.x,
      y = options.y;
  var popper = data.offsets.popper;

  // Remove this legacy support in Popper.js v2

  var legacyGpuAccelerationOption = find(data.instance.modifiers, function (modifier) {
    return modifier.name === 'applyStyle';
  }).gpuAcceleration;
  if (legacyGpuAccelerationOption !== undefined) {
    console.warn('WARNING: `gpuAcceleration` option moved to `computeStyle` modifier and will not be supported in future versions of Popper.js!');
  }
  var gpuAcceleration = legacyGpuAccelerationOption !== undefined ? legacyGpuAccelerationOption : options.gpuAcceleration;

  var offsetParent = getOffsetParent(data.instance.popper);
  var offsetParentRect = getBoundingClientRect(offsetParent);

  // Styles
  var styles = {
    position: popper.position
  };

  var offsets = getRoundedOffsets(data, window.devicePixelRatio < 2 || !isFirefox);

  var sideA = x === 'bottom' ? 'top' : 'bottom';
  var sideB = y === 'right' ? 'left' : 'right';

  // if gpuAcceleration is set to `true` and transform is supported,
  //  we use `translate3d` to apply the position to the popper we
  // automatically use the supported prefixed version if needed
  var prefixedProperty = getSupportedPropertyName('transform');

  // now, let's make a step back and look at this code closely (wtf?)
  // If the content of the popper grows once it's been positioned, it
  // may happen that the popper gets misplaced because of the new content
  // overflowing its reference element
  // To avoid this problem, we provide two options (x and y), which allow
  // the consumer to define the offset origin.
  // If we position a popper on top of a reference element, we can set
  // `x` to `top` to make the popper grow towards its top instead of
  // its bottom.
  var left = void 0,
      top = void 0;
  if (sideA === 'bottom') {
    // when offsetParent is <html> the positioning is relative to the bottom of the screen (excluding the scrollbar)
    // and not the bottom of the html element
    if (offsetParent.nodeName === 'HTML') {
      top = -offsetParent.clientHeight + offsets.bottom;
    } else {
      top = -offsetParentRect.height + offsets.bottom;
    }
  } else {
    top = offsets.top;
  }
  if (sideB === 'right') {
    if (offsetParent.nodeName === 'HTML') {
      left = -offsetParent.clientWidth + offsets.right;
    } else {
      left = -offsetParentRect.width + offsets.right;
    }
  } else {
    left = offsets.left;
  }
  if (gpuAcceleration && prefixedProperty) {
    styles[prefixedProperty] = 'translate3d(' + left + 'px, ' + top + 'px, 0)';
    styles[sideA] = 0;
    styles[sideB] = 0;
    styles.willChange = 'transform';
  } else {
    // othwerise, we use the standard `top`, `left`, `bottom` and `right` properties
    var invertTop = sideA === 'bottom' ? -1 : 1;
    var invertLeft = sideB === 'right' ? -1 : 1;
    styles[sideA] = top * invertTop;
    styles[sideB] = left * invertLeft;
    styles.willChange = sideA + ', ' + sideB;
  }

  // Attributes
  var attributes = {
    'x-placement': data.placement
  };

  // Update `data` attributes, styles and arrowStyles
  data.attributes = _extends({}, attributes, data.attributes);
  data.styles = _extends({}, styles, data.styles);
  data.arrowStyles = _extends({}, data.offsets.arrow, data.arrowStyles);

  return data;
}

/**
 * Helper used to know if the given modifier depends from another one.<br />
 * It checks if the needed modifier is listed and enabled.
 * @method
 * @memberof Popper.Utils
 * @param {Array} modifiers - list of modifiers
 * @param {String} requestingName - name of requesting modifier
 * @param {String} requestedName - name of requested modifier
 * @returns {Boolean}
 */
function isModifierRequired(modifiers, requestingName, requestedName) {
  var requesting = find(modifiers, function (_ref) {
    var name = _ref.name;
    return name === requestingName;
  });

  var isRequired = !!requesting && modifiers.some(function (modifier) {
    return modifier.name === requestedName && modifier.enabled && modifier.order < requesting.order;
  });

  if (!isRequired) {
    var _requesting = '`' + requestingName + '`';
    var requested = '`' + requestedName + '`';
    console.warn(requested + ' modifier is required by ' + _requesting + ' modifier in order to work, be sure to include it before ' + _requesting + '!');
  }
  return isRequired;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function arrow(data, options) {
  var _data$offsets$arrow;

  // arrow depends on keepTogether in order to work
  if (!isModifierRequired(data.instance.modifiers, 'arrow', 'keepTogether')) {
    return data;
  }

  var arrowElement = options.element;

  // if arrowElement is a string, suppose it's a CSS selector
  if (typeof arrowElement === 'string') {
    arrowElement = data.instance.popper.querySelector(arrowElement);

    // if arrowElement is not found, don't run the modifier
    if (!arrowElement) {
      return data;
    }
  } else {
    // if the arrowElement isn't a query selector we must check that the
    // provided DOM node is child of its popper node
    if (!data.instance.popper.contains(arrowElement)) {
      console.warn('WARNING: `arrow.element` must be child of its popper element!');
      return data;
    }
  }

  var placement = data.placement.split('-')[0];
  var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var isVertical = ['left', 'right'].indexOf(placement) !== -1;

  var len = isVertical ? 'height' : 'width';
  var sideCapitalized = isVertical ? 'Top' : 'Left';
  var side = sideCapitalized.toLowerCase();
  var altSide = isVertical ? 'left' : 'top';
  var opSide = isVertical ? 'bottom' : 'right';
  var arrowElementSize = getOuterSizes(arrowElement)[len];

  //
  // extends keepTogether behavior making sure the popper and its
  // reference have enough pixels in conjunction
  //

  // top/left side
  if (reference[opSide] - arrowElementSize < popper[side]) {
    data.offsets.popper[side] -= popper[side] - (reference[opSide] - arrowElementSize);
  }
  // bottom/right side
  if (reference[side] + arrowElementSize > popper[opSide]) {
    data.offsets.popper[side] += reference[side] + arrowElementSize - popper[opSide];
  }
  data.offsets.popper = getClientRect(data.offsets.popper);

  // compute center of the popper
  var center = reference[side] + reference[len] / 2 - arrowElementSize / 2;

  // Compute the sideValue using the updated popper offsets
  // take popper margin in account because we don't have this info available
  var css = getStyleComputedProperty(data.instance.popper);
  var popperMarginSide = parseFloat(css['margin' + sideCapitalized], 10);
  var popperBorderSide = parseFloat(css['border' + sideCapitalized + 'Width'], 10);
  var sideValue = center - data.offsets.popper[side] - popperMarginSide - popperBorderSide;

  // prevent arrowElement from being placed not contiguously to its popper
  sideValue = Math.max(Math.min(popper[len] - arrowElementSize, sideValue), 0);

  data.arrowElement = arrowElement;
  data.offsets.arrow = (_data$offsets$arrow = {}, defineProperty(_data$offsets$arrow, side, Math.round(sideValue)), defineProperty(_data$offsets$arrow, altSide, ''), _data$offsets$arrow);

  return data;
}

/**
 * Get the opposite placement variation of the given one
 * @method
 * @memberof Popper.Utils
 * @argument {String} placement variation
 * @returns {String} flipped placement variation
 */
function getOppositeVariation(variation) {
  if (variation === 'end') {
    return 'start';
  } else if (variation === 'start') {
    return 'end';
  }
  return variation;
}

/**
 * List of accepted placements to use as values of the `placement` option.<br />
 * Valid placements are:
 * - `auto`
 * - `top`
 * - `right`
 * - `bottom`
 * - `left`
 *
 * Each placement can have a variation from this list:
 * - `-start`
 * - `-end`
 *
 * Variations are interpreted easily if you think of them as the left to right
 * written languages. Horizontally (`top` and `bottom`), `start` is left and `end`
 * is right.<br />
 * Vertically (`left` and `right`), `start` is top and `end` is bottom.
 *
 * Some valid examples are:
 * - `top-end` (on top of reference, right aligned)
 * - `right-start` (on right of reference, top aligned)
 * - `bottom` (on bottom, centered)
 * - `auto-end` (on the side with more space available, alignment depends by placement)
 *
 * @static
 * @type {Array}
 * @enum {String}
 * @readonly
 * @method placements
 * @memberof Popper
 */
var placements = ['auto-start', 'auto', 'auto-end', 'top-start', 'top', 'top-end', 'right-start', 'right', 'right-end', 'bottom-end', 'bottom', 'bottom-start', 'left-end', 'left', 'left-start'];

// Get rid of `auto` `auto-start` and `auto-end`
var validPlacements = placements.slice(3);

/**
 * Given an initial placement, returns all the subsequent placements
 * clockwise (or counter-clockwise).
 *
 * @method
 * @memberof Popper.Utils
 * @argument {String} placement - A valid placement (it accepts variations)
 * @argument {Boolean} counter - Set to true to walk the placements counterclockwise
 * @returns {Array} placements including their variations
 */
function clockwise(placement) {
  var counter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var index = validPlacements.indexOf(placement);
  var arr = validPlacements.slice(index + 1).concat(validPlacements.slice(0, index));
  return counter ? arr.reverse() : arr;
}

var BEHAVIORS = {
  FLIP: 'flip',
  CLOCKWISE: 'clockwise',
  COUNTERCLOCKWISE: 'counterclockwise'
};

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function flip(data, options) {
  // if `inner` modifier is enabled, we can't use the `flip` modifier
  if (isModifierEnabled(data.instance.modifiers, 'inner')) {
    return data;
  }

  if (data.flipped && data.placement === data.originalPlacement) {
    // seems like flip is trying to loop, probably there's not enough space on any of the flippable sides
    return data;
  }

  var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, options.boundariesElement, data.positionFixed);

  var placement = data.placement.split('-')[0];
  var placementOpposite = getOppositePlacement(placement);
  var variation = data.placement.split('-')[1] || '';

  var flipOrder = [];

  switch (options.behavior) {
    case BEHAVIORS.FLIP:
      flipOrder = [placement, placementOpposite];
      break;
    case BEHAVIORS.CLOCKWISE:
      flipOrder = clockwise(placement);
      break;
    case BEHAVIORS.COUNTERCLOCKWISE:
      flipOrder = clockwise(placement, true);
      break;
    default:
      flipOrder = options.behavior;
  }

  flipOrder.forEach(function (step, index) {
    if (placement !== step || flipOrder.length === index + 1) {
      return data;
    }

    placement = data.placement.split('-')[0];
    placementOpposite = getOppositePlacement(placement);

    var popperOffsets = data.offsets.popper;
    var refOffsets = data.offsets.reference;

    // using floor because the reference offsets may contain decimals we are not going to consider here
    var floor = Math.floor;
    var overlapsRef = placement === 'left' && floor(popperOffsets.right) > floor(refOffsets.left) || placement === 'right' && floor(popperOffsets.left) < floor(refOffsets.right) || placement === 'top' && floor(popperOffsets.bottom) > floor(refOffsets.top) || placement === 'bottom' && floor(popperOffsets.top) < floor(refOffsets.bottom);

    var overflowsLeft = floor(popperOffsets.left) < floor(boundaries.left);
    var overflowsRight = floor(popperOffsets.right) > floor(boundaries.right);
    var overflowsTop = floor(popperOffsets.top) < floor(boundaries.top);
    var overflowsBottom = floor(popperOffsets.bottom) > floor(boundaries.bottom);

    var overflowsBoundaries = placement === 'left' && overflowsLeft || placement === 'right' && overflowsRight || placement === 'top' && overflowsTop || placement === 'bottom' && overflowsBottom;

    // flip the variation if required
    var isVertical = ['top', 'bottom'].indexOf(placement) !== -1;

    // flips variation if reference element overflows boundaries
    var flippedVariationByRef = !!options.flipVariations && (isVertical && variation === 'start' && overflowsLeft || isVertical && variation === 'end' && overflowsRight || !isVertical && variation === 'start' && overflowsTop || !isVertical && variation === 'end' && overflowsBottom);

    // flips variation if popper content overflows boundaries
    var flippedVariationByContent = !!options.flipVariationsByContent && (isVertical && variation === 'start' && overflowsRight || isVertical && variation === 'end' && overflowsLeft || !isVertical && variation === 'start' && overflowsBottom || !isVertical && variation === 'end' && overflowsTop);

    var flippedVariation = flippedVariationByRef || flippedVariationByContent;

    if (overlapsRef || overflowsBoundaries || flippedVariation) {
      // this boolean to detect any flip loop
      data.flipped = true;

      if (overlapsRef || overflowsBoundaries) {
        placement = flipOrder[index + 1];
      }

      if (flippedVariation) {
        variation = getOppositeVariation(variation);
      }

      data.placement = placement + (variation ? '-' + variation : '');

      // this object contains `position`, we want to preserve it along with
      // any additional property we may add in the future
      data.offsets.popper = _extends({}, data.offsets.popper, getPopperOffsets(data.instance.popper, data.offsets.reference, data.placement));

      data = runModifiers(data.instance.modifiers, data, 'flip');
    }
  });
  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function keepTogether(data) {
  var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var placement = data.placement.split('-')[0];
  var floor = Math.floor;
  var isVertical = ['top', 'bottom'].indexOf(placement) !== -1;
  var side = isVertical ? 'right' : 'bottom';
  var opSide = isVertical ? 'left' : 'top';
  var measurement = isVertical ? 'width' : 'height';

  if (popper[side] < floor(reference[opSide])) {
    data.offsets.popper[opSide] = floor(reference[opSide]) - popper[measurement];
  }
  if (popper[opSide] > floor(reference[side])) {
    data.offsets.popper[opSide] = floor(reference[side]);
  }

  return data;
}

/**
 * Converts a string containing value + unit into a px value number
 * @function
 * @memberof {modifiers~offset}
 * @private
 * @argument {String} str - Value + unit string
 * @argument {String} measurement - `height` or `width`
 * @argument {Object} popperOffsets
 * @argument {Object} referenceOffsets
 * @returns {Number|String}
 * Value in pixels, or original string if no values were extracted
 */
function toValue(str, measurement, popperOffsets, referenceOffsets) {
  // separate value from unit
  var split = str.match(/((?:\-|\+)?\d*\.?\d*)(.*)/);
  var value = +split[1];
  var unit = split[2];

  // If it's not a number it's an operator, I guess
  if (!value) {
    return str;
  }

  if (unit.indexOf('%') === 0) {
    var element = void 0;
    switch (unit) {
      case '%p':
        element = popperOffsets;
        break;
      case '%':
      case '%r':
      default:
        element = referenceOffsets;
    }

    var rect = getClientRect(element);
    return rect[measurement] / 100 * value;
  } else if (unit === 'vh' || unit === 'vw') {
    // if is a vh or vw, we calculate the size based on the viewport
    var size = void 0;
    if (unit === 'vh') {
      size = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    } else {
      size = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    }
    return size / 100 * value;
  } else {
    // if is an explicit pixel unit, we get rid of the unit and keep the value
    // if is an implicit unit, it's px, and we return just the value
    return value;
  }
}

/**
 * Parse an `offset` string to extrapolate `x` and `y` numeric offsets.
 * @function
 * @memberof {modifiers~offset}
 * @private
 * @argument {String} offset
 * @argument {Object} popperOffsets
 * @argument {Object} referenceOffsets
 * @argument {String} basePlacement
 * @returns {Array} a two cells array with x and y offsets in numbers
 */
function parseOffset(offset, popperOffsets, referenceOffsets, basePlacement) {
  var offsets = [0, 0];

  // Use height if placement is left or right and index is 0 otherwise use width
  // in this way the first offset will use an axis and the second one
  // will use the other one
  var useHeight = ['right', 'left'].indexOf(basePlacement) !== -1;

  // Split the offset string to obtain a list of values and operands
  // The regex addresses values with the plus or minus sign in front (+10, -20, etc)
  var fragments = offset.split(/(\+|\-)/).map(function (frag) {
    return frag.trim();
  });

  // Detect if the offset string contains a pair of values or a single one
  // they could be separated by comma or space
  var divider = fragments.indexOf(find(fragments, function (frag) {
    return frag.search(/,|\s/) !== -1;
  }));

  if (fragments[divider] && fragments[divider].indexOf(',') === -1) {
    console.warn('Offsets separated by white space(s) are deprecated, use a comma (,) instead.');
  }

  // If divider is found, we divide the list of values and operands to divide
  // them by ofset X and Y.
  var splitRegex = /\s*,\s*|\s+/;
  var ops = divider !== -1 ? [fragments.slice(0, divider).concat([fragments[divider].split(splitRegex)[0]]), [fragments[divider].split(splitRegex)[1]].concat(fragments.slice(divider + 1))] : [fragments];

  // Convert the values with units to absolute pixels to allow our computations
  ops = ops.map(function (op, index) {
    // Most of the units rely on the orientation of the popper
    var measurement = (index === 1 ? !useHeight : useHeight) ? 'height' : 'width';
    var mergeWithPrevious = false;
    return op
    // This aggregates any `+` or `-` sign that aren't considered operators
    // e.g.: 10 + +5 => [10, +, +5]
    .reduce(function (a, b) {
      if (a[a.length - 1] === '' && ['+', '-'].indexOf(b) !== -1) {
        a[a.length - 1] = b;
        mergeWithPrevious = true;
        return a;
      } else if (mergeWithPrevious) {
        a[a.length - 1] += b;
        mergeWithPrevious = false;
        return a;
      } else {
        return a.concat(b);
      }
    }, [])
    // Here we convert the string values into number values (in px)
    .map(function (str) {
      return toValue(str, measurement, popperOffsets, referenceOffsets);
    });
  });

  // Loop trough the offsets arrays and execute the operations
  ops.forEach(function (op, index) {
    op.forEach(function (frag, index2) {
      if (isNumeric(frag)) {
        offsets[index] += frag * (op[index2 - 1] === '-' ? -1 : 1);
      }
    });
  });
  return offsets;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @argument {Number|String} options.offset=0
 * The offset value as described in the modifier description
 * @returns {Object} The data object, properly modified
 */
function offset(data, _ref) {
  var offset = _ref.offset;
  var placement = data.placement,
      _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var basePlacement = placement.split('-')[0];

  var offsets = void 0;
  if (isNumeric(+offset)) {
    offsets = [+offset, 0];
  } else {
    offsets = parseOffset(offset, popper, reference, basePlacement);
  }

  if (basePlacement === 'left') {
    popper.top += offsets[0];
    popper.left -= offsets[1];
  } else if (basePlacement === 'right') {
    popper.top += offsets[0];
    popper.left += offsets[1];
  } else if (basePlacement === 'top') {
    popper.left += offsets[0];
    popper.top -= offsets[1];
  } else if (basePlacement === 'bottom') {
    popper.left += offsets[0];
    popper.top += offsets[1];
  }

  data.popper = popper;
  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function preventOverflow(data, options) {
  var boundariesElement = options.boundariesElement || getOffsetParent(data.instance.popper);

  // If offsetParent is the reference element, we really want to
  // go one step up and use the next offsetParent as reference to
  // avoid to make this modifier completely useless and look like broken
  if (data.instance.reference === boundariesElement) {
    boundariesElement = getOffsetParent(boundariesElement);
  }

  // NOTE: DOM access here
  // resets the popper's position so that the document size can be calculated excluding
  // the size of the popper element itself
  var transformProp = getSupportedPropertyName('transform');
  var popperStyles = data.instance.popper.style; // assignment to help minification
  var top = popperStyles.top,
      left = popperStyles.left,
      transform = popperStyles[transformProp];

  popperStyles.top = '';
  popperStyles.left = '';
  popperStyles[transformProp] = '';

  var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, boundariesElement, data.positionFixed);

  // NOTE: DOM access here
  // restores the original style properties after the offsets have been computed
  popperStyles.top = top;
  popperStyles.left = left;
  popperStyles[transformProp] = transform;

  options.boundaries = boundaries;

  var order = options.priority;
  var popper = data.offsets.popper;

  var check = {
    primary: function primary(placement) {
      var value = popper[placement];
      if (popper[placement] < boundaries[placement] && !options.escapeWithReference) {
        value = Math.max(popper[placement], boundaries[placement]);
      }
      return defineProperty({}, placement, value);
    },
    secondary: function secondary(placement) {
      var mainSide = placement === 'right' ? 'left' : 'top';
      var value = popper[mainSide];
      if (popper[placement] > boundaries[placement] && !options.escapeWithReference) {
        value = Math.min(popper[mainSide], boundaries[placement] - (placement === 'right' ? popper.width : popper.height));
      }
      return defineProperty({}, mainSide, value);
    }
  };

  order.forEach(function (placement) {
    var side = ['left', 'top'].indexOf(placement) !== -1 ? 'primary' : 'secondary';
    popper = _extends({}, popper, check[side](placement));
  });

  data.offsets.popper = popper;

  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function shift(data) {
  var placement = data.placement;
  var basePlacement = placement.split('-')[0];
  var shiftvariation = placement.split('-')[1];

  // if shift shiftvariation is specified, run the modifier
  if (shiftvariation) {
    var _data$offsets = data.offsets,
        reference = _data$offsets.reference,
        popper = _data$offsets.popper;

    var isVertical = ['bottom', 'top'].indexOf(basePlacement) !== -1;
    var side = isVertical ? 'left' : 'top';
    var measurement = isVertical ? 'width' : 'height';

    var shiftOffsets = {
      start: defineProperty({}, side, reference[side]),
      end: defineProperty({}, side, reference[side] + reference[measurement] - popper[measurement])
    };

    data.offsets.popper = _extends({}, popper, shiftOffsets[shiftvariation]);
  }

  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function hide(data) {
  if (!isModifierRequired(data.instance.modifiers, 'hide', 'preventOverflow')) {
    return data;
  }

  var refRect = data.offsets.reference;
  var bound = find(data.instance.modifiers, function (modifier) {
    return modifier.name === 'preventOverflow';
  }).boundaries;

  if (refRect.bottom < bound.top || refRect.left > bound.right || refRect.top > bound.bottom || refRect.right < bound.left) {
    // Avoid unnecessary DOM access if visibility hasn't changed
    if (data.hide === true) {
      return data;
    }

    data.hide = true;
    data.attributes['x-out-of-boundaries'] = '';
  } else {
    // Avoid unnecessary DOM access if visibility hasn't changed
    if (data.hide === false) {
      return data;
    }

    data.hide = false;
    data.attributes['x-out-of-boundaries'] = false;
  }

  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function inner(data) {
  var placement = data.placement;
  var basePlacement = placement.split('-')[0];
  var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var isHoriz = ['left', 'right'].indexOf(basePlacement) !== -1;

  var subtractLength = ['top', 'left'].indexOf(basePlacement) === -1;

  popper[isHoriz ? 'left' : 'top'] = reference[basePlacement] - (subtractLength ? popper[isHoriz ? 'width' : 'height'] : 0);

  data.placement = getOppositePlacement(placement);
  data.offsets.popper = getClientRect(popper);

  return data;
}

/**
 * Modifier function, each modifier can have a function of this type assigned
 * to its `fn` property.<br />
 * These functions will be called on each update, this means that you must
 * make sure they are performant enough to avoid performance bottlenecks.
 *
 * @function ModifierFn
 * @argument {dataObject} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {dataObject} The data object, properly modified
 */

/**
 * Modifiers are plugins used to alter the behavior of your poppers.<br />
 * Popper.js uses a set of 9 modifiers to provide all the basic functionalities
 * needed by the library.
 *
 * Usually you don't want to override the `order`, `fn` and `onLoad` props.
 * All the other properties are configurations that could be tweaked.
 * @namespace modifiers
 */
var modifiers = {
  /**
   * Modifier used to shift the popper on the start or end of its reference
   * element.<br />
   * It will read the variation of the `placement` property.<br />
   * It can be one either `-end` or `-start`.
   * @memberof modifiers
   * @inner
   */
  shift: {
    /** @prop {number} order=100 - Index used to define the order of execution */
    order: 100,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: shift
  },

  /**
   * The `offset` modifier can shift your popper on both its axis.
   *
   * It accepts the following units:
   * - `px` or unit-less, interpreted as pixels
   * - `%` or `%r`, percentage relative to the length of the reference element
   * - `%p`, percentage relative to the length of the popper element
   * - `vw`, CSS viewport width unit
   * - `vh`, CSS viewport height unit
   *
   * For length is intended the main axis relative to the placement of the popper.<br />
   * This means that if the placement is `top` or `bottom`, the length will be the
   * `width`. In case of `left` or `right`, it will be the `height`.
   *
   * You can provide a single value (as `Number` or `String`), or a pair of values
   * as `String` divided by a comma or one (or more) white spaces.<br />
   * The latter is a deprecated method because it leads to confusion and will be
   * removed in v2.<br />
   * Additionally, it accepts additions and subtractions between different units.
   * Note that multiplications and divisions aren't supported.
   *
   * Valid examples are:
   * ```
   * 10
   * '10%'
   * '10, 10'
   * '10%, 10'
   * '10 + 10%'
   * '10 - 5vh + 3%'
   * '-10px + 5vh, 5px - 6%'
   * ```
   * > **NB**: If you desire to apply offsets to your poppers in a way that may make them overlap
   * > with their reference element, unfortunately, you will have to disable the `flip` modifier.
   * > You can read more on this at this [issue](https://github.com/FezVrasta/popper.js/issues/373).
   *
   * @memberof modifiers
   * @inner
   */
  offset: {
    /** @prop {number} order=200 - Index used to define the order of execution */
    order: 200,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: offset,
    /** @prop {Number|String} offset=0
     * The offset value as described in the modifier description
     */
    offset: 0
  },

  /**
   * Modifier used to prevent the popper from being positioned outside the boundary.
   *
   * A scenario exists where the reference itself is not within the boundaries.<br />
   * We can say it has "escaped the boundaries" — or just "escaped".<br />
   * In this case we need to decide whether the popper should either:
   *
   * - detach from the reference and remain "trapped" in the boundaries, or
   * - if it should ignore the boundary and "escape with its reference"
   *
   * When `escapeWithReference` is set to`true` and reference is completely
   * outside its boundaries, the popper will overflow (or completely leave)
   * the boundaries in order to remain attached to the edge of the reference.
   *
   * @memberof modifiers
   * @inner
   */
  preventOverflow: {
    /** @prop {number} order=300 - Index used to define the order of execution */
    order: 300,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: preventOverflow,
    /**
     * @prop {Array} [priority=['left','right','top','bottom']]
     * Popper will try to prevent overflow following these priorities by default,
     * then, it could overflow on the left and on top of the `boundariesElement`
     */
    priority: ['left', 'right', 'top', 'bottom'],
    /**
     * @prop {number} padding=5
     * Amount of pixel used to define a minimum distance between the boundaries
     * and the popper. This makes sure the popper always has a little padding
     * between the edges of its container
     */
    padding: 5,
    /**
     * @prop {String|HTMLElement} boundariesElement='scrollParent'
     * Boundaries used by the modifier. Can be `scrollParent`, `window`,
     * `viewport` or any DOM element.
     */
    boundariesElement: 'scrollParent'
  },

  /**
   * Modifier used to make sure the reference and its popper stay near each other
   * without leaving any gap between the two. Especially useful when the arrow is
   * enabled and you want to ensure that it points to its reference element.
   * It cares only about the first axis. You can still have poppers with margin
   * between the popper and its reference element.
   * @memberof modifiers
   * @inner
   */
  keepTogether: {
    /** @prop {number} order=400 - Index used to define the order of execution */
    order: 400,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: keepTogether
  },

  /**
   * This modifier is used to move the `arrowElement` of the popper to make
   * sure it is positioned between the reference element and its popper element.
   * It will read the outer size of the `arrowElement` node to detect how many
   * pixels of conjunction are needed.
   *
   * It has no effect if no `arrowElement` is provided.
   * @memberof modifiers
   * @inner
   */
  arrow: {
    /** @prop {number} order=500 - Index used to define the order of execution */
    order: 500,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: arrow,
    /** @prop {String|HTMLElement} element='[x-arrow]' - Selector or node used as arrow */
    element: '[x-arrow]'
  },

  /**
   * Modifier used to flip the popper's placement when it starts to overlap its
   * reference element.
   *
   * Requires the `preventOverflow` modifier before it in order to work.
   *
   * **NOTE:** this modifier will interrupt the current update cycle and will
   * restart it if it detects the need to flip the placement.
   * @memberof modifiers
   * @inner
   */
  flip: {
    /** @prop {number} order=600 - Index used to define the order of execution */
    order: 600,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: flip,
    /**
     * @prop {String|Array} behavior='flip'
     * The behavior used to change the popper's placement. It can be one of
     * `flip`, `clockwise`, `counterclockwise` or an array with a list of valid
     * placements (with optional variations)
     */
    behavior: 'flip',
    /**
     * @prop {number} padding=5
     * The popper will flip if it hits the edges of the `boundariesElement`
     */
    padding: 5,
    /**
     * @prop {String|HTMLElement} boundariesElement='viewport'
     * The element which will define the boundaries of the popper position.
     * The popper will never be placed outside of the defined boundaries
     * (except if `keepTogether` is enabled)
     */
    boundariesElement: 'viewport',
    /**
     * @prop {Boolean} flipVariations=false
     * The popper will switch placement variation between `-start` and `-end` when
     * the reference element overlaps its boundaries.
     *
     * The original placement should have a set variation.
     */
    flipVariations: false,
    /**
     * @prop {Boolean} flipVariationsByContent=false
     * The popper will switch placement variation between `-start` and `-end` when
     * the popper element overlaps its reference boundaries.
     *
     * The original placement should have a set variation.
     */
    flipVariationsByContent: false
  },

  /**
   * Modifier used to make the popper flow toward the inner of the reference element.
   * By default, when this modifier is disabled, the popper will be placed outside
   * the reference element.
   * @memberof modifiers
   * @inner
   */
  inner: {
    /** @prop {number} order=700 - Index used to define the order of execution */
    order: 700,
    /** @prop {Boolean} enabled=false - Whether the modifier is enabled or not */
    enabled: false,
    /** @prop {ModifierFn} */
    fn: inner
  },

  /**
   * Modifier used to hide the popper when its reference element is outside of the
   * popper boundaries. It will set a `x-out-of-boundaries` attribute which can
   * be used to hide with a CSS selector the popper when its reference is
   * out of boundaries.
   *
   * Requires the `preventOverflow` modifier before it in order to work.
   * @memberof modifiers
   * @inner
   */
  hide: {
    /** @prop {number} order=800 - Index used to define the order of execution */
    order: 800,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: hide
  },

  /**
   * Computes the style that will be applied to the popper element to gets
   * properly positioned.
   *
   * Note that this modifier will not touch the DOM, it just prepares the styles
   * so that `applyStyle` modifier can apply it. This separation is useful
   * in case you need to replace `applyStyle` with a custom implementation.
   *
   * This modifier has `850` as `order` value to maintain backward compatibility
   * with previous versions of Popper.js. Expect the modifiers ordering method
   * to change in future major versions of the library.
   *
   * @memberof modifiers
   * @inner
   */
  computeStyle: {
    /** @prop {number} order=850 - Index used to define the order of execution */
    order: 850,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: computeStyle,
    /**
     * @prop {Boolean} gpuAcceleration=true
     * If true, it uses the CSS 3D transformation to position the popper.
     * Otherwise, it will use the `top` and `left` properties
     */
    gpuAcceleration: true,
    /**
     * @prop {string} [x='bottom']
     * Where to anchor the X axis (`bottom` or `top`). AKA X offset origin.
     * Change this if your popper should grow in a direction different from `bottom`
     */
    x: 'bottom',
    /**
     * @prop {string} [x='left']
     * Where to anchor the Y axis (`left` or `right`). AKA Y offset origin.
     * Change this if your popper should grow in a direction different from `right`
     */
    y: 'right'
  },

  /**
   * Applies the computed styles to the popper element.
   *
   * All the DOM manipulations are limited to this modifier. This is useful in case
   * you want to integrate Popper.js inside a framework or view library and you
   * want to delegate all the DOM manipulations to it.
   *
   * Note that if you disable this modifier, you must make sure the popper element
   * has its position set to `absolute` before Popper.js can do its work!
   *
   * Just disable this modifier and define your own to achieve the desired effect.
   *
   * @memberof modifiers
   * @inner
   */
  applyStyle: {
    /** @prop {number} order=900 - Index used to define the order of execution */
    order: 900,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: applyStyle,
    /** @prop {Function} */
    onLoad: applyStyleOnLoad,
    /**
     * @deprecated since version 1.10.0, the property moved to `computeStyle` modifier
     * @prop {Boolean} gpuAcceleration=true
     * If true, it uses the CSS 3D transformation to position the popper.
     * Otherwise, it will use the `top` and `left` properties
     */
    gpuAcceleration: undefined
  }
};

/**
 * The `dataObject` is an object containing all the information used by Popper.js.
 * This object is passed to modifiers and to the `onCreate` and `onUpdate` callbacks.
 * @name dataObject
 * @property {Object} data.instance The Popper.js instance
 * @property {String} data.placement Placement applied to popper
 * @property {String} data.originalPlacement Placement originally defined on init
 * @property {Boolean} data.flipped True if popper has been flipped by flip modifier
 * @property {Boolean} data.hide True if the reference element is out of boundaries, useful to know when to hide the popper
 * @property {HTMLElement} data.arrowElement Node used as arrow by arrow modifier
 * @property {Object} data.styles Any CSS property defined here will be applied to the popper. It expects the JavaScript nomenclature (eg. `marginBottom`)
 * @property {Object} data.arrowStyles Any CSS property defined here will be applied to the popper arrow. It expects the JavaScript nomenclature (eg. `marginBottom`)
 * @property {Object} data.boundaries Offsets of the popper boundaries
 * @property {Object} data.offsets The measurements of popper, reference and arrow elements
 * @property {Object} data.offsets.popper `top`, `left`, `width`, `height` values
 * @property {Object} data.offsets.reference `top`, `left`, `width`, `height` values
 * @property {Object} data.offsets.arrow] `top` and `left` offsets, only one of them will be different from 0
 */

/**
 * Default options provided to Popper.js constructor.<br />
 * These can be overridden using the `options` argument of Popper.js.<br />
 * To override an option, simply pass an object with the same
 * structure of the `options` object, as the 3rd argument. For example:
 * ```
 * new Popper(ref, pop, {
 *   modifiers: {
 *     preventOverflow: { enabled: false }
 *   }
 * })
 * ```
 * @type {Object}
 * @static
 * @memberof Popper
 */
var Defaults = {
  /**
   * Popper's placement.
   * @prop {Popper.placements} placement='bottom'
   */
  placement: 'bottom',

  /**
   * Set this to true if you want popper to position it self in 'fixed' mode
   * @prop {Boolean} positionFixed=false
   */
  positionFixed: false,

  /**
   * Whether events (resize, scroll) are initially enabled.
   * @prop {Boolean} eventsEnabled=true
   */
  eventsEnabled: true,

  /**
   * Set to true if you want to automatically remove the popper when
   * you call the `destroy` method.
   * @prop {Boolean} removeOnDestroy=false
   */
  removeOnDestroy: false,

  /**
   * Callback called when the popper is created.<br />
   * By default, it is set to no-op.<br />
   * Access Popper.js instance with `data.instance`.
   * @prop {onCreate}
   */
  onCreate: function onCreate() {},

  /**
   * Callback called when the popper is updated. This callback is not called
   * on the initialization/creation of the popper, but only on subsequent
   * updates.<br />
   * By default, it is set to no-op.<br />
   * Access Popper.js instance with `data.instance`.
   * @prop {onUpdate}
   */
  onUpdate: function onUpdate() {},

  /**
   * List of modifiers used to modify the offsets before they are applied to the popper.
   * They provide most of the functionalities of Popper.js.
   * @prop {modifiers}
   */
  modifiers: modifiers
};

/**
 * @callback onCreate
 * @param {dataObject} data
 */

/**
 * @callback onUpdate
 * @param {dataObject} data
 */

// Utils
// Methods
var Popper = function () {
  /**
   * Creates a new Popper.js instance.
   * @class Popper
   * @param {Element|referenceObject} reference - The reference element used to position the popper
   * @param {Element} popper - The HTML / XML element used as the popper
   * @param {Object} options - Your custom options to override the ones defined in [Defaults](#defaults)
   * @return {Object} instance - The generated Popper.js instance
   */
  function Popper(reference, popper) {
    var _this = this;

    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    classCallCheck(this, Popper);

    this.scheduleUpdate = function () {
      return requestAnimationFrame(_this.update);
    };

    // make update() debounced, so that it only runs at most once-per-tick
    this.update = debounce(this.update.bind(this));

    // with {} we create a new object with the options inside it
    this.options = _extends({}, Popper.Defaults, options);

    // init state
    this.state = {
      isDestroyed: false,
      isCreated: false,
      scrollParents: []
    };

    // get reference and popper elements (allow jQuery wrappers)
    this.reference = reference && reference.jquery ? reference[0] : reference;
    this.popper = popper && popper.jquery ? popper[0] : popper;

    // Deep merge modifiers options
    this.options.modifiers = {};
    Object.keys(_extends({}, Popper.Defaults.modifiers, options.modifiers)).forEach(function (name) {
      _this.options.modifiers[name] = _extends({}, Popper.Defaults.modifiers[name] || {}, options.modifiers ? options.modifiers[name] : {});
    });

    // Refactoring modifiers' list (Object => Array)
    this.modifiers = Object.keys(this.options.modifiers).map(function (name) {
      return _extends({
        name: name
      }, _this.options.modifiers[name]);
    })
    // sort the modifiers by order
    .sort(function (a, b) {
      return a.order - b.order;
    });

    // modifiers have the ability to execute arbitrary code when Popper.js get inited
    // such code is executed in the same order of its modifier
    // they could add new properties to their options configuration
    // BE AWARE: don't add options to `options.modifiers.name` but to `modifierOptions`!
    this.modifiers.forEach(function (modifierOptions) {
      if (modifierOptions.enabled && isFunction(modifierOptions.onLoad)) {
        modifierOptions.onLoad(_this.reference, _this.popper, _this.options, modifierOptions, _this.state);
      }
    });

    // fire the first update to position the popper in the right place
    this.update();

    var eventsEnabled = this.options.eventsEnabled;
    if (eventsEnabled) {
      // setup event listeners, they will take care of update the position in specific situations
      this.enableEventListeners();
    }

    this.state.eventsEnabled = eventsEnabled;
  }

  // We can't use class properties because they don't get listed in the
  // class prototype and break stuff like Sinon stubs


  createClass(Popper, [{
    key: 'update',
    value: function update$$1() {
      return update.call(this);
    }
  }, {
    key: 'destroy',
    value: function destroy$$1() {
      return destroy.call(this);
    }
  }, {
    key: 'enableEventListeners',
    value: function enableEventListeners$$1() {
      return enableEventListeners.call(this);
    }
  }, {
    key: 'disableEventListeners',
    value: function disableEventListeners$$1() {
      return disableEventListeners.call(this);
    }

    /**
     * Schedules an update. It will run on the next UI update available.
     * @method scheduleUpdate
     * @memberof Popper
     */


    /**
     * Collection of utilities useful when writing custom modifiers.
     * Starting from version 1.7, this method is available only if you
     * include `popper-utils.js` before `popper.js`.
     *
     * **DEPRECATION**: This way to access PopperUtils is deprecated
     * and will be removed in v2! Use the PopperUtils module directly instead.
     * Due to the high instability of the methods contained in Utils, we can't
     * guarantee them to follow semver. Use them at your own risk!
     * @static
     * @private
     * @type {Object}
     * @deprecated since version 1.8
     * @member Utils
     * @memberof Popper
     */

  }]);
  return Popper;
}();

/**
 * The `referenceObject` is an object that provides an interface compatible with Popper.js
 * and lets you use it as replacement of a real DOM node.<br />
 * You can use this method to position a popper relatively to a set of coordinates
 * in case you don't have a DOM node to use as reference.
 *
 * ```
 * new Popper(referenceObject, popperNode);
 * ```
 *
 * NB: This feature isn't supported in Internet Explorer 10.
 * @name referenceObject
 * @property {Function} data.getBoundingClientRect
 * A function that returns a set of coordinates compatible with the native `getBoundingClientRect` method.
 * @property {number} data.clientWidth
 * An ES6 getter that will return the width of the virtual reference element.
 * @property {number} data.clientHeight
 * An ES6 getter that will return the height of the virtual reference element.
 */


Popper.Utils = (typeof window !== 'undefined' ? window : global).PopperUtils;
Popper.placements = placements;
Popper.Defaults = Defaults;

return Popper;

})));
//# sourceMappingURL=popper.js.map

;/*!
 * jQuery JavaScript Library v3.4.1
 * https://jquery.com/
 *
 * Includes Sizzle.js
 * https://sizzlejs.com/
 *
 * Copyright JS Foundation and other contributors
 * Released under the MIT license
 * https://jquery.org/license
 *
 * Date: 2019-05-01T21:04Z
 */
( function( global, factory ) {

	"use strict";

	if ( typeof module === "object" && typeof module.exports === "object" ) {

		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
} )( typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Edge <= 12 - 13+, Firefox <=18 - 45+, IE 10 - 11, Safari 5.1 - 9+, iOS 6 - 9.1
// throw exceptions when non-strict code (e.g., ASP.NET 4.5) accesses strict mode
// arguments.callee.caller (trac-13335). But as of jQuery 3.0 (2016), strict mode should be common
// enough that all such attempts are guarded in a try block.
"use strict";

var arr = [];

var document = window.document;

var getProto = Object.getPrototypeOf;

var slice = arr.slice;

var concat = arr.concat;

var push = arr.push;

var indexOf = arr.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var fnToString = hasOwn.toString;

var ObjectFunctionString = fnToString.call( Object );

var support = {};

var isFunction = function isFunction( obj ) {

      // Support: Chrome <=57, Firefox <=52
      // In some browsers, typeof returns "function" for HTML <object> elements
      // (i.e., `typeof document.createElement( "object" ) === "function"`).
      // We don't want to classify *any* DOM node as a function.
      return typeof obj === "function" && typeof obj.nodeType !== "number";
  };


var isWindow = function isWindow( obj ) {
		return obj != null && obj === obj.window;
	};




	var preservedScriptAttributes = {
		type: true,
		src: true,
		nonce: true,
		noModule: true
	};

	function DOMEval( code, node, doc ) {
		doc = doc || document;

		var i, val,
			script = doc.createElement( "script" );

		script.text = code;
		if ( node ) {
			for ( i in preservedScriptAttributes ) {

				// Support: Firefox 64+, Edge 18+
				// Some browsers don't support the "nonce" property on scripts.
				// On the other hand, just using `getAttribute` is not enough as
				// the `nonce` attribute is reset to an empty string whenever it
				// becomes browsing-context connected.
				// See https://github.com/whatwg/html/issues/2369
				// See https://html.spec.whatwg.org/#nonce-attributes
				// The `node.getAttribute` check was added for the sake of
				// `jQuery.globalEval` so that it can fake a nonce-containing node
				// via an object.
				val = node[ i ] || node.getAttribute && node.getAttribute( i );
				if ( val ) {
					script.setAttribute( i, val );
				}
			}
		}
		doc.head.appendChild( script ).parentNode.removeChild( script );
	}


function toType( obj ) {
	if ( obj == null ) {
		return obj + "";
	}

	// Support: Android <=2.3 only (functionish RegExp)
	return typeof obj === "object" || typeof obj === "function" ?
		class2type[ toString.call( obj ) ] || "object" :
		typeof obj;
}
/* global Symbol */
// Defining this global in .eslintrc.json would create a danger of using the global
// unguarded in another place, it seems safer to define global only for this module



var
	version = "3.4.1",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {

		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	},

	// Support: Android <=4.0 only
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;

jQuery.fn = jQuery.prototype = {

	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {

		// Return all the elements in a clean array
		if ( num == null ) {
			return slice.call( this );
		}

		// Return just the one element from the set
		return num < 0 ? this[ num + this.length ] : this[ num ];
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	each: function( callback ) {
		return jQuery.each( this, callback );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map( this, function( elem, i ) {
			return callback.call( elem, i, elem );
		} ) );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor();
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: arr.sort,
	splice: arr.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[ 0 ] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// Skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !isFunction( target ) ) {
		target = {};
	}

	// Extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {

		// Only deal with non-null/undefined values
		if ( ( options = arguments[ i ] ) != null ) {

			// Extend the base object
			for ( name in options ) {
				copy = options[ name ];

				// Prevent Object.prototype pollution
				// Prevent never-ending loop
				if ( name === "__proto__" || target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
					( copyIsArray = Array.isArray( copy ) ) ) ) {
					src = target[ name ];

					// Ensure proper type for the source value
					if ( copyIsArray && !Array.isArray( src ) ) {
						clone = [];
					} else if ( !copyIsArray && !jQuery.isPlainObject( src ) ) {
						clone = {};
					} else {
						clone = src;
					}
					copyIsArray = false;

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend( {

	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	isPlainObject: function( obj ) {
		var proto, Ctor;

		// Detect obvious negatives
		// Use toString instead of jQuery.type to catch host objects
		if ( !obj || toString.call( obj ) !== "[object Object]" ) {
			return false;
		}

		proto = getProto( obj );

		// Objects with no prototype (e.g., `Object.create( null )`) are plain
		if ( !proto ) {
			return true;
		}

		// Objects with prototype are plain iff they were constructed by a global Object function
		Ctor = hasOwn.call( proto, "constructor" ) && proto.constructor;
		return typeof Ctor === "function" && fnToString.call( Ctor ) === ObjectFunctionString;
	},

	isEmptyObject: function( obj ) {
		var name;

		for ( name in obj ) {
			return false;
		}
		return true;
	},

	// Evaluates a script in a global context
	globalEval: function( code, options ) {
		DOMEval( code, { nonce: options && options.nonce } );
	},

	each: function( obj, callback ) {
		var length, i = 0;

		if ( isArrayLike( obj ) ) {
			length = obj.length;
			for ( ; i < length; i++ ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		} else {
			for ( i in obj ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		}

		return obj;
	},

	// Support: Android <=4.0 only
	trim: function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "" );
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArrayLike( Object( arr ) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		return arr == null ? -1 : indexOf.call( arr, elem, i );
	},

	// Support: Android <=4.0 only, PhantomJS 1 only
	// push.apply(_, arraylike) throws on ancient WebKit
	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		for ( ; j < len; j++ ) {
			first[ i++ ] = second[ j ];
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var length, value,
			i = 0,
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArrayLike( elems ) ) {
			length = elems.length;
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
} );

if ( typeof Symbol === "function" ) {
	jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
}

// Populate the class2type map
jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
function( i, name ) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
} );

function isArrayLike( obj ) {

	// Support: real iOS 8.2 only (not reproducible in simulator)
	// `in` check used to prevent JIT error (gh-2145)
	// hasOwn isn't used here due to false negatives
	// regarding Nodelist length in IE
	var length = !!obj && "length" in obj && obj.length,
		type = toType( obj );

	if ( isFunction( obj ) || isWindow( obj ) ) {
		return false;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v2.3.4
 * https://sizzlejs.com/
 *
 * Copyright JS Foundation and other contributors
 * Released under the MIT license
 * https://js.foundation/
 *
 * Date: 2019-04-08
 */
(function( window ) {

var i,
	support,
	Expr,
	getText,
	isXML,
	tokenize,
	compile,
	select,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + 1 * new Date(),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	nonnativeSelectorCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf as it's faster than native
	// https://jsperf.com/thor-indexof-vs-for/5
	indexOf = function( list, elem ) {
		var i = 0,
			len = list.length;
		for ( ; i < len; i++ ) {
			if ( list[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",

	// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = "(?:\\\\.|[\\w-]|[^\0-\\xa0])+",

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +
		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
		"*\\]",

	pseudos = ":(" + identifier + ")(?:\\((" +
		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp( whitespace + "+", "g" ),
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),
	rdescend = new RegExp( whitespace + "|>" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + identifier + ")" ),
		"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
		"TAG": new RegExp( "^(" + identifier + "|[*])" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rhtml = /HTML$/i,
	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,

	// CSS escapes
	// http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox<24
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			high < 0 ?
				// BMP codepoint
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	},

	// CSS string/identifier serialization
	// https://drafts.csswg.org/cssom/#common-serializing-idioms
	rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,
	fcssescape = function( ch, asCodePoint ) {
		if ( asCodePoint ) {

			// U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
			if ( ch === "\0" ) {
				return "\uFFFD";
			}

			// Control characters and (dependent upon position) numbers get escaped as code points
			return ch.slice( 0, -1 ) + "\\" + ch.charCodeAt( ch.length - 1 ).toString( 16 ) + " ";
		}

		// Other potentially-special ASCII characters get backslash-escaped
		return "\\" + ch;
	},

	// Used for iframes
	// See setDocument()
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE
	unloadHandler = function() {
		setDocument();
	},

	inDisabledFieldset = addCombinator(
		function( elem ) {
			return elem.disabled === true && elem.nodeName.toLowerCase() === "fieldset";
		},
		{ dir: "parentNode", next: "legend" }
	);

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var m, i, elem, nid, match, groups, newSelector,
		newContext = context && context.ownerDocument,

		// nodeType defaults to 9, since context defaults to document
		nodeType = context ? context.nodeType : 9;

	results = results || [];

	// Return early from calls with invalid selector or context
	if ( typeof selector !== "string" || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

		return results;
	}

	// Try to shortcut find operations (as opposed to filters) in HTML documents
	if ( !seed ) {

		if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
			setDocument( context );
		}
		context = context || document;

		if ( documentIsHTML ) {

			// If the selector is sufficiently simple, try using a "get*By*" DOM method
			// (excepting DocumentFragment context, where the methods don't exist)
			if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {

				// ID selector
				if ( (m = match[1]) ) {

					// Document context
					if ( nodeType === 9 ) {
						if ( (elem = context.getElementById( m )) ) {

							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( elem.id === m ) {
								results.push( elem );
								return results;
							}
						} else {
							return results;
						}

					// Element context
					} else {

						// Support: IE, Opera, Webkit
						// TODO: identify versions
						// getElementById can match elements by name instead of ID
						if ( newContext && (elem = newContext.getElementById( m )) &&
							contains( context, elem ) &&
							elem.id === m ) {

							results.push( elem );
							return results;
						}
					}

				// Type selector
				} else if ( match[2] ) {
					push.apply( results, context.getElementsByTagName( selector ) );
					return results;

				// Class selector
				} else if ( (m = match[3]) && support.getElementsByClassName &&
					context.getElementsByClassName ) {

					push.apply( results, context.getElementsByClassName( m ) );
					return results;
				}
			}

			// Take advantage of querySelectorAll
			if ( support.qsa &&
				!nonnativeSelectorCache[ selector + " " ] &&
				(!rbuggyQSA || !rbuggyQSA.test( selector )) &&

				// Support: IE 8 only
				// Exclude object elements
				(nodeType !== 1 || context.nodeName.toLowerCase() !== "object") ) {

				newSelector = selector;
				newContext = context;

				// qSA considers elements outside a scoping root when evaluating child or
				// descendant combinators, which is not what we want.
				// In such cases, we work around the behavior by prefixing every selector in the
				// list with an ID selector referencing the scope context.
				// Thanks to Andrew Dupont for this technique.
				if ( nodeType === 1 && rdescend.test( selector ) ) {

					// Capture the context ID, setting it first if necessary
					if ( (nid = context.getAttribute( "id" )) ) {
						nid = nid.replace( rcssescape, fcssescape );
					} else {
						context.setAttribute( "id", (nid = expando) );
					}

					// Prefix every selector in the list
					groups = tokenize( selector );
					i = groups.length;
					while ( i-- ) {
						groups[i] = "#" + nid + " " + toSelector( groups[i] );
					}
					newSelector = groups.join( "," );

					// Expand context for sibling selectors
					newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
						context;
				}

				try {
					push.apply( results,
						newContext.querySelectorAll( newSelector )
					);
					return results;
				} catch ( qsaError ) {
					nonnativeSelectorCache( selector, true );
				} finally {
					if ( nid === expando ) {
						context.removeAttribute( "id" );
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {function(string, object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key + " " ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created element and returns a boolean result
 */
function assert( fn ) {
	var el = document.createElement("fieldset");

	try {
		return !!fn( el );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( el.parentNode ) {
			el.parentNode.removeChild( el );
		}
		// release memory in IE
		el = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = arr.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			a.sourceIndex - b.sourceIndex;

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for :enabled/:disabled
 * @param {Boolean} disabled true for :disabled; false for :enabled
 */
function createDisabledPseudo( disabled ) {

	// Known :disabled false positives: fieldset[disabled] > legend:nth-of-type(n+2) :can-disable
	return function( elem ) {

		// Only certain elements can match :enabled or :disabled
		// https://html.spec.whatwg.org/multipage/scripting.html#selector-enabled
		// https://html.spec.whatwg.org/multipage/scripting.html#selector-disabled
		if ( "form" in elem ) {

			// Check for inherited disabledness on relevant non-disabled elements:
			// * listed form-associated elements in a disabled fieldset
			//   https://html.spec.whatwg.org/multipage/forms.html#category-listed
			//   https://html.spec.whatwg.org/multipage/forms.html#concept-fe-disabled
			// * option elements in a disabled optgroup
			//   https://html.spec.whatwg.org/multipage/forms.html#concept-option-disabled
			// All such elements have a "form" property.
			if ( elem.parentNode && elem.disabled === false ) {

				// Option elements defer to a parent optgroup if present
				if ( "label" in elem ) {
					if ( "label" in elem.parentNode ) {
						return elem.parentNode.disabled === disabled;
					} else {
						return elem.disabled === disabled;
					}
				}

				// Support: IE 6 - 11
				// Use the isDisabled shortcut property to check for disabled fieldset ancestors
				return elem.isDisabled === disabled ||

					// Where there is no isDisabled, check manually
					/* jshint -W018 */
					elem.isDisabled !== !disabled &&
						inDisabledFieldset( elem ) === disabled;
			}

			return elem.disabled === disabled;

		// Try to winnow out elements that can't be disabled before trusting the disabled property.
		// Some victims get caught in our net (label, legend, menu, track), but it shouldn't
		// even exist on them, let alone have a boolean value.
		} else if ( "label" in elem ) {
			return elem.disabled === disabled;
		}

		// Remaining elements are neither :enabled nor :disabled
		return false;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== "undefined" && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	var namespace = elem.namespaceURI,
		docElem = (elem.ownerDocument || elem).documentElement;

	// Support: IE <=8
	// Assume HTML when documentElement doesn't yet exist, such as inside loading iframes
	// https://bugs.jquery.com/ticket/4833
	return !rhtml.test( namespace || docElem && docElem.nodeName || "HTML" );
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare, subWindow,
		doc = node ? node.ownerDocument || node : preferredDoc;

	// Return early if doc is invalid or already selected
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Update global variables
	document = doc;
	docElem = document.documentElement;
	documentIsHTML = !isXML( document );

	// Support: IE 9-11, Edge
	// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
	if ( preferredDoc !== document &&
		(subWindow = document.defaultView) && subWindow.top !== subWindow ) {

		// Support: IE 11, Edge
		if ( subWindow.addEventListener ) {
			subWindow.addEventListener( "unload", unloadHandler, false );

		// Support: IE 9 - 10 only
		} else if ( subWindow.attachEvent ) {
			subWindow.attachEvent( "onunload", unloadHandler );
		}
	}

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties
	// (excepting IE8 booleans)
	support.attributes = assert(function( el ) {
		el.className = "i";
		return !el.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( el ) {
		el.appendChild( document.createComment("") );
		return !el.getElementsByTagName("*").length;
	});

	// Support: IE<9
	support.getElementsByClassName = rnative.test( document.getElementsByClassName );

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programmatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( el ) {
		docElem.appendChild( el ).id = expando;
		return !document.getElementsByName || !document.getElementsByName( expando ).length;
	});

	// ID filter and find
	if ( support.getById ) {
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var elem = context.getElementById( id );
				return elem ? [ elem ] : [];
			}
		};
	} else {
		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== "undefined" &&
					elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};

		// Support: IE 6 - 7 only
		// getElementById is not reliable as a find shortcut
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var node, i, elems,
					elem = context.getElementById( id );

				if ( elem ) {

					// Verify the id attribute
					node = elem.getAttributeNode("id");
					if ( node && node.value === id ) {
						return [ elem ];
					}

					// Fall back on getElementsByName
					elems = context.getElementsByName( id );
					i = 0;
					while ( (elem = elems[i++]) ) {
						node = elem.getAttributeNode("id");
						if ( node && node.value === id ) {
							return [ elem ];
						}
					}
				}

				return [];
			}
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( tag );

			// DocumentFragment nodes don't have gEBTN
			} else if ( support.qsa ) {
				return context.querySelectorAll( tag );
			}
		} :

		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See https://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( document.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( el ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// https://bugs.jquery.com/ticket/12359
			docElem.appendChild( el ).innerHTML = "<a id='" + expando + "'></a>" +
				"<select id='" + expando + "-\r\\' msallowcapture=''>" +
				"<option selected=''></option></select>";

			// Support: IE8, Opera 11-12.16
			// Nothing should be selected when empty strings follow ^= or $= or *=
			// The test attribute must be unknown in Opera but "safe" for WinRT
			// https://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
			if ( el.querySelectorAll("[msallowcapture^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !el.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
			if ( !el.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
				rbuggyQSA.push("~=");
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !el.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}

			// Support: Safari 8+, iOS 8+
			// https://bugs.webkit.org/show_bug.cgi?id=136851
			// In-page `selector#id sibling-combinator selector` fails
			if ( !el.querySelectorAll( "a#" + expando + "+*" ).length ) {
				rbuggyQSA.push(".#.+[+~]");
			}
		});

		assert(function( el ) {
			el.innerHTML = "<a href='' disabled='disabled'></a>" +
				"<select disabled='disabled'><option/></select>";

			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = document.createElement("input");
			input.setAttribute( "type", "hidden" );
			el.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( el.querySelectorAll("[name=d]").length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( el.querySelectorAll(":enabled").length !== 2 ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Support: IE9-11+
			// IE's :disabled selector does not pick up the children of disabled fieldsets
			docElem.appendChild( el ).disabled = true;
			if ( el.querySelectorAll(":disabled").length !== 2 ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			el.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( el ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( el, "*" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( el, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully self-exclusive
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

			// Choose the first element that is related to our preferred document
			if ( a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
				return -1;
			}
			if ( b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {
		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {
			return a === document ? -1 :
				b === document ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return document;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	if ( support.matchesSelector && documentIsHTML &&
		!nonnativeSelectorCache[ expr + " " ] &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch (e) {
			nonnativeSelectorCache( expr, true );
		}
	}

	return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null;
};

Sizzle.escape = function( sel ) {
	return (sel + "").replace( rcssescape, fcssescape );
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		while ( (node = elem[i++]) ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[6] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] ) {
				match[2] = match[4] || match[5] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, uniqueCache, outerCache, node, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType,
						diff = false;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) {

										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {

							// Seek `elem` from a previously-cached index

							// ...in a gzip-friendly way
							node = parent;
							outerCache = node[ expando ] || (node[ expando ] = {});

							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ node.uniqueID ] ||
								(outerCache[ node.uniqueID ] = {});

							cache = uniqueCache[ type ] || [];
							nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
							diff = nodeIndex && cache[ 2 ];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						} else {
							// Use previously-cached element index if available
							if ( useCache ) {
								// ...in a gzip-friendly way
								node = elem;
								outerCache = node[ expando ] || (node[ expando ] = {});

								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									(outerCache[ node.uniqueID ] = {});

								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex;
							}

							// xml :nth-child(...)
							// or :nth-last-child(...) or :nth(-last)?-of-type(...)
							if ( diff === false ) {
								// Use the same loop as above to seek `elem` from the start
								while ( (node = ++nodeIndex && node && node[ dir ] ||
									(diff = nodeIndex = 0) || start.pop()) ) {

									if ( ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) &&
										++diff ) {

										// Cache the index of each encountered element
										if ( useCache ) {
											outerCache = node[ expando ] || (node[ expando ] = {});

											// Support: IE <9 only
											// Defend against cloned attroperties (jQuery gh-1709)
											uniqueCache = outerCache[ node.uniqueID ] ||
												(outerCache[ node.uniqueID ] = {});

											uniqueCache[ type ] = [ dirruns, diff ];
										}

										if ( node === elem ) {
											break;
										}
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					// Don't keep the element (issue #299)
					input[0] = null;
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			text = text.replace( runescape, funescape );
			return function( elem ) {
				return ( elem.textContent || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": createDisabledPseudo( false ),
		"disabled": createDisabledPseudo( true ),

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ?
				argument + length :
				argument > length ?
					length :
					argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( (tokens = []) );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		skip = combinator.next,
		key = skip || dir,
		checkNonElements = base && key === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
			return false;
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, uniqueCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});

						// Support: IE <9 only
						// Defend against cloned attroperties (jQuery gh-1709)
						uniqueCache = outerCache[ elem.uniqueID ] || (outerCache[ elem.uniqueID ] = {});

						if ( skip && skip === elem.nodeName.toLowerCase() ) {
							elem = elem[ dir ] || elem;
						} else if ( (oldCache = uniqueCache[ key ]) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return (newCache[ 2 ] = oldCache[ 2 ]);
						} else {
							// Reuse newcache so results back-propagate to previous elements
							uniqueCache[ key ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
								return true;
							}
						}
					}
				}
			}
			return false;
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
			// Avoid hanging onto element (issue #299)
			checkContext = null;
			return ret;
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,
				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
				len = elems.length;

			if ( outermost ) {
				outermostContext = context === document || context || outermost;
			}

			// Add elements passing elementMatchers directly to results
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					if ( !context && elem.ownerDocument !== document ) {
						setDocument( elem );
						xml = !documentIsHTML;
					}
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context || document, xml) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// `i` is now the count of elements visited above, and adding it to `matchedCount`
			// makes the latter nonnegative.
			matchedCount += i;

			// Apply set filters to unmatched elements
			// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
			// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
			// no element matchers and no seed.
			// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
			// case, which will result in a "00" `matchedCount` that differs from `i` but is also
			// numerically zero.
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( (selector = compiled.selector || selector) );

	results = results || [];

	// Try to minimize operations if there is only one selector in the list and no seed
	// (the latter of which guarantees us context)
	if ( match.length === 1 ) {

		// Reduce context if the leading compound selector is an ID
		tokens = match[0] = match[0].slice( 0 );
		if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
				context.nodeType === 9 && documentIsHTML && Expr.relative[ tokens[1].type ] ) {

			context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[i];

			// Abort if we hit a combinator
			if ( Expr.relative[ (type = token.type) ] ) {
				break;
			}
			if ( (find = Expr.find[ type ]) ) {
				// Search, expanding context for leading sibling combinators
				if ( (seed = find(
					token.matches[0].replace( runescape, funescape ),
					rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
				)) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome 14-35+
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( el ) {
	// Should return 1, but returns 4 (following)
	return el.compareDocumentPosition( document.createElement("fieldset") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// https://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( el ) {
	el.innerHTML = "<a href='#'></a>";
	return el.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( el ) {
	el.innerHTML = "<input/>";
	el.firstChild.setAttribute( "value", "" );
	return el.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( el ) {
	return el.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
					(val = elem.getAttributeNode( name )) && val.specified ?
					val.value :
				null;
		}
	});
}

return Sizzle;

})( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;

// Deprecated
jQuery.expr[ ":" ] = jQuery.expr.pseudos;
jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;
jQuery.escapeSelector = Sizzle.escape;




var dir = function( elem, dir, until ) {
	var matched = [],
		truncate = until !== undefined;

	while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
		if ( elem.nodeType === 1 ) {
			if ( truncate && jQuery( elem ).is( until ) ) {
				break;
			}
			matched.push( elem );
		}
	}
	return matched;
};


var siblings = function( n, elem ) {
	var matched = [];

	for ( ; n; n = n.nextSibling ) {
		if ( n.nodeType === 1 && n !== elem ) {
			matched.push( n );
		}
	}

	return matched;
};


var rneedsContext = jQuery.expr.match.needsContext;



function nodeName( elem, name ) {

  return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();

};
var rsingleTag = ( /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i );



// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			return !!qualifier.call( elem, i, elem ) !== not;
		} );
	}

	// Single element
	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		} );
	}

	// Arraylike of elements (jQuery, arguments, Array)
	if ( typeof qualifier !== "string" ) {
		return jQuery.grep( elements, function( elem ) {
			return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
		} );
	}

	// Filtered directly for both simple and complex selectors
	return jQuery.filter( qualifier, elements, not );
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	if ( elems.length === 1 && elem.nodeType === 1 ) {
		return jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [];
	}

	return jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
		return elem.nodeType === 1;
	} ) );
};

jQuery.fn.extend( {
	find: function( selector ) {
		var i, ret,
			len = this.length,
			self = this;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter( function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			} ) );
		}

		ret = this.pushStack( [] );

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		return len > 1 ? jQuery.uniqueSort( ret ) : ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow( this, selector || [], false ) );
	},
	not: function( selector ) {
		return this.pushStack( winnow( this, selector || [], true ) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
} );


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	// Shortcut simple #id case for speed
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,

	init = jQuery.fn.init = function( selector, context, root ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Method init() accepts an alternate rootjQuery
		// so migrate can support jQuery.sub (gh-2101)
		root = root || rootjQuery;

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector[ 0 ] === "<" &&
				selector[ selector.length - 1 ] === ">" &&
				selector.length >= 3 ) {

				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && ( match[ 1 ] || !context ) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[ 1 ] ) {
					context = context instanceof jQuery ? context[ 0 ] : context;

					// Option to run scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[ 1 ],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {

							// Properties of context are called as methods if possible
							if ( isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[ 2 ] );

					if ( elem ) {

						// Inject the element directly into the jQuery object
						this[ 0 ] = elem;
						this.length = 1;
					}
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || root ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this[ 0 ] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( isFunction( selector ) ) {
			return root.ready !== undefined ?
				root.ready( selector ) :

				// Execute immediately if ready is not present
				selector( jQuery );
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,

	// Methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend( {
	has: function( target ) {
		var targets = jQuery( target, this ),
			l = targets.length;

		return this.filter( function() {
			var i = 0;
			for ( ; i < l; i++ ) {
				if ( jQuery.contains( this, targets[ i ] ) ) {
					return true;
				}
			}
		} );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			targets = typeof selectors !== "string" && jQuery( selectors );

		// Positional selectors never match, since there's no _selection_ context
		if ( !rneedsContext.test( selectors ) ) {
			for ( ; i < l; i++ ) {
				for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

					// Always skip document fragments
					if ( cur.nodeType < 11 && ( targets ?
						targets.index( cur ) > -1 :

						// Don't pass non-elements to Sizzle
						cur.nodeType === 1 &&
							jQuery.find.matchesSelector( cur, selectors ) ) ) {

						matched.push( cur );
						break;
					}
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
	},

	// Determine the position of an element within the set
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// Index in selector
		if ( typeof elem === "string" ) {
			return indexOf.call( jQuery( elem ), this[ 0 ] );
		}

		// Locate the position of the desired element
		return indexOf.call( this,

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem
		);
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.uniqueSort(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	}
} );

function sibling( cur, dir ) {
	while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
	return cur;
}

jQuery.each( {
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return siblings( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return siblings( elem.firstChild );
	},
	contents: function( elem ) {
		if ( typeof elem.contentDocument !== "undefined" ) {
			return elem.contentDocument;
		}

		// Support: IE 9 - 11 only, iOS 7 only, Android Browser <=4.3 only
		// Treat the template element as a regular one in browsers that
		// don't support it.
		if ( nodeName( elem, "template" ) ) {
			elem = elem.content || elem;
		}

		return jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var matched = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			matched = jQuery.filter( selector, matched );
		}

		if ( this.length > 1 ) {

			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				jQuery.uniqueSort( matched );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				matched.reverse();
			}
		}

		return this.pushStack( matched );
	};
} );
var rnothtmlwhite = ( /[^\x20\t\r\n\f]+/g );



// Convert String-formatted options into Object-formatted ones
function createOptions( options ) {
	var object = {};
	jQuery.each( options.match( rnothtmlwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	} );
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		createOptions( options ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,

		// Last fire value for non-forgettable lists
		memory,

		// Flag to know if list was already fired
		fired,

		// Flag to prevent firing
		locked,

		// Actual callback list
		list = [],

		// Queue of execution data for repeatable lists
		queue = [],

		// Index of currently firing callback (modified by add/remove as needed)
		firingIndex = -1,

		// Fire callbacks
		fire = function() {

			// Enforce single-firing
			locked = locked || options.once;

			// Execute callbacks for all pending executions,
			// respecting firingIndex overrides and runtime changes
			fired = firing = true;
			for ( ; queue.length; firingIndex = -1 ) {
				memory = queue.shift();
				while ( ++firingIndex < list.length ) {

					// Run callback and check for early termination
					if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
						options.stopOnFalse ) {

						// Jump to end and forget the data so .add doesn't re-fire
						firingIndex = list.length;
						memory = false;
					}
				}
			}

			// Forget the data if we're done with it
			if ( !options.memory ) {
				memory = false;
			}

			firing = false;

			// Clean up if we're done firing for good
			if ( locked ) {

				// Keep an empty list if we have data for future add calls
				if ( memory ) {
					list = [];

				// Otherwise, this object is spent
				} else {
					list = "";
				}
			}
		},

		// Actual Callbacks object
		self = {

			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {

					// If we have memory from a past run, we should fire after adding
					if ( memory && !firing ) {
						firingIndex = list.length - 1;
						queue.push( memory );
					}

					( function add( args ) {
						jQuery.each( args, function( _, arg ) {
							if ( isFunction( arg ) ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && toType( arg ) !== "string" ) {

								// Inspect recursively
								add( arg );
							}
						} );
					} )( arguments );

					if ( memory && !firing ) {
						fire();
					}
				}
				return this;
			},

			// Remove a callback from the list
			remove: function() {
				jQuery.each( arguments, function( _, arg ) {
					var index;
					while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
						list.splice( index, 1 );

						// Handle firing indexes
						if ( index <= firingIndex ) {
							firingIndex--;
						}
					}
				} );
				return this;
			},

			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ?
					jQuery.inArray( fn, list ) > -1 :
					list.length > 0;
			},

			// Remove all callbacks from the list
			empty: function() {
				if ( list ) {
					list = [];
				}
				return this;
			},

			// Disable .fire and .add
			// Abort any current/pending executions
			// Clear all callbacks and values
			disable: function() {
				locked = queue = [];
				list = memory = "";
				return this;
			},
			disabled: function() {
				return !list;
			},

			// Disable .fire
			// Also disable .add unless we have memory (since it would have no effect)
			// Abort any pending executions
			lock: function() {
				locked = queue = [];
				if ( !memory && !firing ) {
					list = memory = "";
				}
				return this;
			},
			locked: function() {
				return !!locked;
			},

			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( !locked ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					queue.push( args );
					if ( !firing ) {
						fire();
					}
				}
				return this;
			},

			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},

			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


function Identity( v ) {
	return v;
}
function Thrower( ex ) {
	throw ex;
}

function adoptValue( value, resolve, reject, noValue ) {
	var method;

	try {

		// Check for promise aspect first to privilege synchronous behavior
		if ( value && isFunction( ( method = value.promise ) ) ) {
			method.call( value ).done( resolve ).fail( reject );

		// Other thenables
		} else if ( value && isFunction( ( method = value.then ) ) ) {
			method.call( value, resolve, reject );

		// Other non-thenables
		} else {

			// Control `resolve` arguments by letting Array#slice cast boolean `noValue` to integer:
			// * false: [ value ].slice( 0 ) => resolve( value )
			// * true: [ value ].slice( 1 ) => resolve()
			resolve.apply( undefined, [ value ].slice( noValue ) );
		}

	// For Promises/A+, convert exceptions into rejections
	// Since jQuery.when doesn't unwrap thenables, we can skip the extra checks appearing in
	// Deferred#then to conditionally suppress rejection.
	} catch ( value ) {

		// Support: Android 4.0 only
		// Strict mode functions invoked without .call/.apply get global-object context
		reject.apply( undefined, [ value ] );
	}
}

jQuery.extend( {

	Deferred: function( func ) {
		var tuples = [

				// action, add listener, callbacks,
				// ... .then handlers, argument index, [final state]
				[ "notify", "progress", jQuery.Callbacks( "memory" ),
					jQuery.Callbacks( "memory" ), 2 ],
				[ "resolve", "done", jQuery.Callbacks( "once memory" ),
					jQuery.Callbacks( "once memory" ), 0, "resolved" ],
				[ "reject", "fail", jQuery.Callbacks( "once memory" ),
					jQuery.Callbacks( "once memory" ), 1, "rejected" ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				"catch": function( fn ) {
					return promise.then( null, fn );
				},

				// Keep pipe for back-compat
				pipe: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;

					return jQuery.Deferred( function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {

							// Map tuples (progress, done, fail) to arguments (done, fail, progress)
							var fn = isFunction( fns[ tuple[ 4 ] ] ) && fns[ tuple[ 4 ] ];

							// deferred.progress(function() { bind to newDefer or newDefer.notify })
							// deferred.done(function() { bind to newDefer or newDefer.resolve })
							// deferred.fail(function() { bind to newDefer or newDefer.reject })
							deferred[ tuple[ 1 ] ]( function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && isFunction( returned.promise ) ) {
									returned.promise()
										.progress( newDefer.notify )
										.done( newDefer.resolve )
										.fail( newDefer.reject );
								} else {
									newDefer[ tuple[ 0 ] + "With" ](
										this,
										fn ? [ returned ] : arguments
									);
								}
							} );
						} );
						fns = null;
					} ).promise();
				},
				then: function( onFulfilled, onRejected, onProgress ) {
					var maxDepth = 0;
					function resolve( depth, deferred, handler, special ) {
						return function() {
							var that = this,
								args = arguments,
								mightThrow = function() {
									var returned, then;

									// Support: Promises/A+ section 2.3.3.3.3
									// https://promisesaplus.com/#point-59
									// Ignore double-resolution attempts
									if ( depth < maxDepth ) {
										return;
									}

									returned = handler.apply( that, args );

									// Support: Promises/A+ section 2.3.1
									// https://promisesaplus.com/#point-48
									if ( returned === deferred.promise() ) {
										throw new TypeError( "Thenable self-resolution" );
									}

									// Support: Promises/A+ sections 2.3.3.1, 3.5
									// https://promisesaplus.com/#point-54
									// https://promisesaplus.com/#point-75
									// Retrieve `then` only once
									then = returned &&

										// Support: Promises/A+ section 2.3.4
										// https://promisesaplus.com/#point-64
										// Only check objects and functions for thenability
										( typeof returned === "object" ||
											typeof returned === "function" ) &&
										returned.then;

									// Handle a returned thenable
									if ( isFunction( then ) ) {

										// Special processors (notify) just wait for resolution
										if ( special ) {
											then.call(
												returned,
												resolve( maxDepth, deferred, Identity, special ),
												resolve( maxDepth, deferred, Thrower, special )
											);

										// Normal processors (resolve) also hook into progress
										} else {

											// ...and disregard older resolution values
											maxDepth++;

											then.call(
												returned,
												resolve( maxDepth, deferred, Identity, special ),
												resolve( maxDepth, deferred, Thrower, special ),
												resolve( maxDepth, deferred, Identity,
													deferred.notifyWith )
											);
										}

									// Handle all other returned values
									} else {

										// Only substitute handlers pass on context
										// and multiple values (non-spec behavior)
										if ( handler !== Identity ) {
											that = undefined;
											args = [ returned ];
										}

										// Process the value(s)
										// Default process is resolve
										( special || deferred.resolveWith )( that, args );
									}
								},

								// Only normal processors (resolve) catch and reject exceptions
								process = special ?
									mightThrow :
									function() {
										try {
											mightThrow();
										} catch ( e ) {

											if ( jQuery.Deferred.exceptionHook ) {
												jQuery.Deferred.exceptionHook( e,
													process.stackTrace );
											}

											// Support: Promises/A+ section 2.3.3.3.4.1
											// https://promisesaplus.com/#point-61
											// Ignore post-resolution exceptions
											if ( depth + 1 >= maxDepth ) {

												// Only substitute handlers pass on context
												// and multiple values (non-spec behavior)
												if ( handler !== Thrower ) {
													that = undefined;
													args = [ e ];
												}

												deferred.rejectWith( that, args );
											}
										}
									};

							// Support: Promises/A+ section 2.3.3.3.1
							// https://promisesaplus.com/#point-57
							// Re-resolve promises immediately to dodge false rejection from
							// subsequent errors
							if ( depth ) {
								process();
							} else {

								// Call an optional hook to record the stack, in case of exception
								// since it's otherwise lost when execution goes async
								if ( jQuery.Deferred.getStackHook ) {
									process.stackTrace = jQuery.Deferred.getStackHook();
								}
								window.setTimeout( process );
							}
						};
					}

					return jQuery.Deferred( function( newDefer ) {

						// progress_handlers.add( ... )
						tuples[ 0 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								isFunction( onProgress ) ?
									onProgress :
									Identity,
								newDefer.notifyWith
							)
						);

						// fulfilled_handlers.add( ... )
						tuples[ 1 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								isFunction( onFulfilled ) ?
									onFulfilled :
									Identity
							)
						);

						// rejected_handlers.add( ... )
						tuples[ 2 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								isFunction( onRejected ) ?
									onRejected :
									Thrower
							)
						);
					} ).promise();
				},

				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 5 ];

			// promise.progress = list.add
			// promise.done = list.add
			// promise.fail = list.add
			promise[ tuple[ 1 ] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(
					function() {

						// state = "resolved" (i.e., fulfilled)
						// state = "rejected"
						state = stateString;
					},

					// rejected_callbacks.disable
					// fulfilled_callbacks.disable
					tuples[ 3 - i ][ 2 ].disable,

					// rejected_handlers.disable
					// fulfilled_handlers.disable
					tuples[ 3 - i ][ 3 ].disable,

					// progress_callbacks.lock
					tuples[ 0 ][ 2 ].lock,

					// progress_handlers.lock
					tuples[ 0 ][ 3 ].lock
				);
			}

			// progress_handlers.fire
			// fulfilled_handlers.fire
			// rejected_handlers.fire
			list.add( tuple[ 3 ].fire );

			// deferred.notify = function() { deferred.notifyWith(...) }
			// deferred.resolve = function() { deferred.resolveWith(...) }
			// deferred.reject = function() { deferred.rejectWith(...) }
			deferred[ tuple[ 0 ] ] = function() {
				deferred[ tuple[ 0 ] + "With" ]( this === deferred ? undefined : this, arguments );
				return this;
			};

			// deferred.notifyWith = list.fireWith
			// deferred.resolveWith = list.fireWith
			// deferred.rejectWith = list.fireWith
			deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
		} );

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( singleValue ) {
		var

			// count of uncompleted subordinates
			remaining = arguments.length,

			// count of unprocessed arguments
			i = remaining,

			// subordinate fulfillment data
			resolveContexts = Array( i ),
			resolveValues = slice.call( arguments ),

			// the master Deferred
			master = jQuery.Deferred(),

			// subordinate callback factory
			updateFunc = function( i ) {
				return function( value ) {
					resolveContexts[ i ] = this;
					resolveValues[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( !( --remaining ) ) {
						master.resolveWith( resolveContexts, resolveValues );
					}
				};
			};

		// Single- and empty arguments are adopted like Promise.resolve
		if ( remaining <= 1 ) {
			adoptValue( singleValue, master.done( updateFunc( i ) ).resolve, master.reject,
				!remaining );

			// Use .then() to unwrap secondary thenables (cf. gh-3000)
			if ( master.state() === "pending" ||
				isFunction( resolveValues[ i ] && resolveValues[ i ].then ) ) {

				return master.then();
			}
		}

		// Multiple arguments are aggregated like Promise.all array elements
		while ( i-- ) {
			adoptValue( resolveValues[ i ], updateFunc( i ), master.reject );
		}

		return master.promise();
	}
} );


// These usually indicate a programmer mistake during development,
// warn about them ASAP rather than swallowing them by default.
var rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;

jQuery.Deferred.exceptionHook = function( error, stack ) {

	// Support: IE 8 - 9 only
	// Console exists when dev tools are open, which can happen at any time
	if ( window.console && window.console.warn && error && rerrorNames.test( error.name ) ) {
		window.console.warn( "jQuery.Deferred exception: " + error.message, error.stack, stack );
	}
};




jQuery.readyException = function( error ) {
	window.setTimeout( function() {
		throw error;
	} );
};




// The deferred used on DOM ready
var readyList = jQuery.Deferred();

jQuery.fn.ready = function( fn ) {

	readyList
		.then( fn )

		// Wrap jQuery.readyException in a function so that the lookup
		// happens at the time of error handling instead of callback
		// registration.
		.catch( function( error ) {
			jQuery.readyException( error );
		} );

	return this;
};

jQuery.extend( {

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );
	}
} );

jQuery.ready.then = readyList.then;

// The ready event handler and self cleanup method
function completed() {
	document.removeEventListener( "DOMContentLoaded", completed );
	window.removeEventListener( "load", completed );
	jQuery.ready();
}

// Catch cases where $(document).ready() is called
// after the browser event has already occurred.
// Support: IE <=9 - 10 only
// Older IE sometimes signals "interactive" too soon
if ( document.readyState === "complete" ||
	( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

	// Handle it asynchronously to allow scripts the opportunity to delay ready
	window.setTimeout( jQuery.ready );

} else {

	// Use the handy event callback
	document.addEventListener( "DOMContentLoaded", completed );

	// A fallback to window.onload, that will always work
	window.addEventListener( "load", completed );
}




// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		len = elems.length,
		bulk = key == null;

	// Sets many values
	if ( toType( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			access( elems, fn, i, key[ i ], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {

			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < len; i++ ) {
				fn(
					elems[ i ], key, raw ?
					value :
					value.call( elems[ i ], i, fn( elems[ i ], key ) )
				);
			}
		}
	}

	if ( chainable ) {
		return elems;
	}

	// Gets
	if ( bulk ) {
		return fn.call( elems );
	}

	return len ? fn( elems[ 0 ], key ) : emptyGet;
};


// Matches dashed string for camelizing
var rmsPrefix = /^-ms-/,
	rdashAlpha = /-([a-z])/g;

// Used by camelCase as callback to replace()
function fcamelCase( all, letter ) {
	return letter.toUpperCase();
}

// Convert dashed to camelCase; used by the css and data modules
// Support: IE <=9 - 11, Edge 12 - 15
// Microsoft forgot to hump their vendor prefix (#9572)
function camelCase( string ) {
	return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
}
var acceptData = function( owner ) {

	// Accepts only:
	//  - Node
	//    - Node.ELEMENT_NODE
	//    - Node.DOCUMENT_NODE
	//  - Object
	//    - Any
	return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
};




function Data() {
	this.expando = jQuery.expando + Data.uid++;
}

Data.uid = 1;

Data.prototype = {

	cache: function( owner ) {

		// Check if the owner object already has a cache
		var value = owner[ this.expando ];

		// If not, create one
		if ( !value ) {
			value = {};

			// We can accept data for non-element nodes in modern browsers,
			// but we should not, see #8335.
			// Always return an empty object.
			if ( acceptData( owner ) ) {

				// If it is a node unlikely to be stringify-ed or looped over
				// use plain assignment
				if ( owner.nodeType ) {
					owner[ this.expando ] = value;

				// Otherwise secure it in a non-enumerable property
				// configurable must be true to allow the property to be
				// deleted when data is removed
				} else {
					Object.defineProperty( owner, this.expando, {
						value: value,
						configurable: true
					} );
				}
			}
		}

		return value;
	},
	set: function( owner, data, value ) {
		var prop,
			cache = this.cache( owner );

		// Handle: [ owner, key, value ] args
		// Always use camelCase key (gh-2257)
		if ( typeof data === "string" ) {
			cache[ camelCase( data ) ] = value;

		// Handle: [ owner, { properties } ] args
		} else {

			// Copy the properties one-by-one to the cache object
			for ( prop in data ) {
				cache[ camelCase( prop ) ] = data[ prop ];
			}
		}
		return cache;
	},
	get: function( owner, key ) {
		return key === undefined ?
			this.cache( owner ) :

			// Always use camelCase key (gh-2257)
			owner[ this.expando ] && owner[ this.expando ][ camelCase( key ) ];
	},
	access: function( owner, key, value ) {

		// In cases where either:
		//
		//   1. No key was specified
		//   2. A string key was specified, but no value provided
		//
		// Take the "read" path and allow the get method to determine
		// which value to return, respectively either:
		//
		//   1. The entire cache object
		//   2. The data stored at the key
		//
		if ( key === undefined ||
				( ( key && typeof key === "string" ) && value === undefined ) ) {

			return this.get( owner, key );
		}

		// When the key is not a string, or both a key and value
		// are specified, set or extend (existing objects) with either:
		//
		//   1. An object of properties
		//   2. A key and value
		//
		this.set( owner, key, value );

		// Since the "set" path can have two possible entry points
		// return the expected data based on which path was taken[*]
		return value !== undefined ? value : key;
	},
	remove: function( owner, key ) {
		var i,
			cache = owner[ this.expando ];

		if ( cache === undefined ) {
			return;
		}

		if ( key !== undefined ) {

			// Support array or space separated string of keys
			if ( Array.isArray( key ) ) {

				// If key is an array of keys...
				// We always set camelCase keys, so remove that.
				key = key.map( camelCase );
			} else {
				key = camelCase( key );

				// If a key with the spaces exists, use it.
				// Otherwise, create an array by matching non-whitespace
				key = key in cache ?
					[ key ] :
					( key.match( rnothtmlwhite ) || [] );
			}

			i = key.length;

			while ( i-- ) {
				delete cache[ key[ i ] ];
			}
		}

		// Remove the expando if there's no more data
		if ( key === undefined || jQuery.isEmptyObject( cache ) ) {

			// Support: Chrome <=35 - 45
			// Webkit & Blink performance suffers when deleting properties
			// from DOM nodes, so set to undefined instead
			// https://bugs.chromium.org/p/chromium/issues/detail?id=378607 (bug restricted)
			if ( owner.nodeType ) {
				owner[ this.expando ] = undefined;
			} else {
				delete owner[ this.expando ];
			}
		}
	},
	hasData: function( owner ) {
		var cache = owner[ this.expando ];
		return cache !== undefined && !jQuery.isEmptyObject( cache );
	}
};
var dataPriv = new Data();

var dataUser = new Data();



//	Implementation Summary
//
//	1. Enforce API surface and semantic compatibility with 1.9.x branch
//	2. Improve the module's maintainability by reducing the storage
//		paths to a single mechanism.
//	3. Use the same single mechanism to support "private" and "user" data.
//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
//	5. Avoid exposing implementation details on user objects (eg. expando properties)
//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /[A-Z]/g;

function getData( data ) {
	if ( data === "true" ) {
		return true;
	}

	if ( data === "false" ) {
		return false;
	}

	if ( data === "null" ) {
		return null;
	}

	// Only convert to a number if it doesn't change the string
	if ( data === +data + "" ) {
		return +data;
	}

	if ( rbrace.test( data ) ) {
		return JSON.parse( data );
	}

	return data;
}

function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = getData( data );
			} catch ( e ) {}

			// Make sure we set the data so it isn't changed later
			dataUser.set( elem, key, data );
		} else {
			data = undefined;
		}
	}
	return data;
}

jQuery.extend( {
	hasData: function( elem ) {
		return dataUser.hasData( elem ) || dataPriv.hasData( elem );
	},

	data: function( elem, name, data ) {
		return dataUser.access( elem, name, data );
	},

	removeData: function( elem, name ) {
		dataUser.remove( elem, name );
	},

	// TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to dataPriv methods, these can be deprecated.
	_data: function( elem, name, data ) {
		return dataPriv.access( elem, name, data );
	},

	_removeData: function( elem, name ) {
		dataPriv.remove( elem, name );
	}
} );

jQuery.fn.extend( {
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = dataUser.get( elem );

				if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE 11 only
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = camelCase( name.slice( 5 ) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					dataPriv.set( elem, "hasDataAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each( function() {
				dataUser.set( this, key );
			} );
		}

		return access( this, function( value ) {
			var data;

			// The calling jQuery object (element matches) is not empty
			// (and therefore has an element appears at this[ 0 ]) and the
			// `value` parameter was not undefined. An empty jQuery object
			// will result in `undefined` for elem = this[ 0 ] which will
			// throw an exception if an attempt to read a data cache is made.
			if ( elem && value === undefined ) {

				// Attempt to get data from the cache
				// The key will always be camelCased in Data
				data = dataUser.get( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to "discover" the data in
				// HTML5 custom data-* attrs
				data = dataAttr( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// We tried really hard, but the data doesn't exist.
				return;
			}

			// Set the data...
			this.each( function() {

				// We always store the camelCased key
				dataUser.set( this, key, value );
			} );
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each( function() {
			dataUser.remove( this, key );
		} );
	}
} );


jQuery.extend( {
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = dataPriv.get( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || Array.isArray( data ) ) {
					queue = dataPriv.access( elem, type, jQuery.makeArray( data ) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// Clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// Not public - generate a queueHooks object, or return the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return dataPriv.get( elem, key ) || dataPriv.access( elem, key, {
			empty: jQuery.Callbacks( "once memory" ).add( function() {
				dataPriv.remove( elem, [ type + "queue", key ] );
			} )
		} );
	}
} );

jQuery.fn.extend( {
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[ 0 ], type );
		}

		return data === undefined ?
			this :
			this.each( function() {
				var queue = jQuery.queue( this, type, data );

				// Ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			} );
	},
	dequeue: function( type ) {
		return this.each( function() {
			jQuery.dequeue( this, type );
		} );
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},

	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
} );
var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var documentElement = document.documentElement;



	var isAttached = function( elem ) {
			return jQuery.contains( elem.ownerDocument, elem );
		},
		composed = { composed: true };

	// Support: IE 9 - 11+, Edge 12 - 18+, iOS 10.0 - 10.2 only
	// Check attachment across shadow DOM boundaries when possible (gh-3504)
	// Support: iOS 10.0-10.2 only
	// Early iOS 10 versions support `attachShadow` but not `getRootNode`,
	// leading to errors. We need to check for `getRootNode`.
	if ( documentElement.getRootNode ) {
		isAttached = function( elem ) {
			return jQuery.contains( elem.ownerDocument, elem ) ||
				elem.getRootNode( composed ) === elem.ownerDocument;
		};
	}
var isHiddenWithinTree = function( elem, el ) {

		// isHiddenWithinTree might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;

		// Inline style trumps all
		return elem.style.display === "none" ||
			elem.style.display === "" &&

			// Otherwise, check computed style
			// Support: Firefox <=43 - 45
			// Disconnected elements can have computed display: none, so first confirm that elem is
			// in the document.
			isAttached( elem ) &&

			jQuery.css( elem, "display" ) === "none";
	};

var swap = function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.apply( elem, args || [] );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};




function adjustCSS( elem, prop, valueParts, tween ) {
	var adjusted, scale,
		maxIterations = 20,
		currentValue = tween ?
			function() {
				return tween.cur();
			} :
			function() {
				return jQuery.css( elem, prop, "" );
			},
		initial = currentValue(),
		unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

		// Starting value computation is required for potential unit mismatches
		initialInUnit = elem.nodeType &&
			( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
			rcssNum.exec( jQuery.css( elem, prop ) );

	if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

		// Support: Firefox <=54
		// Halve the iteration target value to prevent interference from CSS upper bounds (gh-2144)
		initial = initial / 2;

		// Trust units reported by jQuery.css
		unit = unit || initialInUnit[ 3 ];

		// Iteratively approximate from a nonzero starting point
		initialInUnit = +initial || 1;

		while ( maxIterations-- ) {

			// Evaluate and update our best guess (doubling guesses that zero out).
			// Finish if the scale equals or crosses 1 (making the old*new product non-positive).
			jQuery.style( elem, prop, initialInUnit + unit );
			if ( ( 1 - scale ) * ( 1 - ( scale = currentValue() / initial || 0.5 ) ) <= 0 ) {
				maxIterations = 0;
			}
			initialInUnit = initialInUnit / scale;

		}

		initialInUnit = initialInUnit * 2;
		jQuery.style( elem, prop, initialInUnit + unit );

		// Make sure we update the tween properties later on
		valueParts = valueParts || [];
	}

	if ( valueParts ) {
		initialInUnit = +initialInUnit || +initial || 0;

		// Apply relative offset (+=/-=) if specified
		adjusted = valueParts[ 1 ] ?
			initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
			+valueParts[ 2 ];
		if ( tween ) {
			tween.unit = unit;
			tween.start = initialInUnit;
			tween.end = adjusted;
		}
	}
	return adjusted;
}


var defaultDisplayMap = {};

function getDefaultDisplay( elem ) {
	var temp,
		doc = elem.ownerDocument,
		nodeName = elem.nodeName,
		display = defaultDisplayMap[ nodeName ];

	if ( display ) {
		return display;
	}

	temp = doc.body.appendChild( doc.createElement( nodeName ) );
	display = jQuery.css( temp, "display" );

	temp.parentNode.removeChild( temp );

	if ( display === "none" ) {
		display = "block";
	}
	defaultDisplayMap[ nodeName ] = display;

	return display;
}

function showHide( elements, show ) {
	var display, elem,
		values = [],
		index = 0,
		length = elements.length;

	// Determine new display value for elements that need to change
	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		display = elem.style.display;
		if ( show ) {

			// Since we force visibility upon cascade-hidden elements, an immediate (and slow)
			// check is required in this first loop unless we have a nonempty display value (either
			// inline or about-to-be-restored)
			if ( display === "none" ) {
				values[ index ] = dataPriv.get( elem, "display" ) || null;
				if ( !values[ index ] ) {
					elem.style.display = "";
				}
			}
			if ( elem.style.display === "" && isHiddenWithinTree( elem ) ) {
				values[ index ] = getDefaultDisplay( elem );
			}
		} else {
			if ( display !== "none" ) {
				values[ index ] = "none";

				// Remember what we're overwriting
				dataPriv.set( elem, "display", display );
			}
		}
	}

	// Set the display of the elements in a second loop to avoid constant reflow
	for ( index = 0; index < length; index++ ) {
		if ( values[ index ] != null ) {
			elements[ index ].style.display = values[ index ];
		}
	}

	return elements;
}

jQuery.fn.extend( {
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each( function() {
			if ( isHiddenWithinTree( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		} );
	}
} );
var rcheckableType = ( /^(?:checkbox|radio)$/i );

var rtagName = ( /<([a-z][^\/\0>\x20\t\r\n\f]*)/i );

var rscriptType = ( /^$|^module$|\/(?:java|ecma)script/i );



// We have to close these tags to support XHTML (#13200)
var wrapMap = {

	// Support: IE <=9 only
	option: [ 1, "<select multiple='multiple'>", "</select>" ],

	// XHTML parsers do not magically insert elements in the
	// same way that tag soup parsers do. So we cannot shorten
	// this by omitting <tbody> or other required elements.
	thead: [ 1, "<table>", "</table>" ],
	col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
	tr: [ 2, "<table><tbody>", "</tbody></table>" ],
	td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

	_default: [ 0, "", "" ]
};

// Support: IE <=9 only
wrapMap.optgroup = wrapMap.option;

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;


function getAll( context, tag ) {

	// Support: IE <=9 - 11 only
	// Use typeof to avoid zero-argument method invocation on host objects (#15151)
	var ret;

	if ( typeof context.getElementsByTagName !== "undefined" ) {
		ret = context.getElementsByTagName( tag || "*" );

	} else if ( typeof context.querySelectorAll !== "undefined" ) {
		ret = context.querySelectorAll( tag || "*" );

	} else {
		ret = [];
	}

	if ( tag === undefined || tag && nodeName( context, tag ) ) {
		return jQuery.merge( [ context ], ret );
	}

	return ret;
}


// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		dataPriv.set(
			elems[ i ],
			"globalEval",
			!refElements || dataPriv.get( refElements[ i ], "globalEval" )
		);
	}
}


var rhtml = /<|&#?\w+;/;

function buildFragment( elems, context, scripts, selection, ignored ) {
	var elem, tmp, tag, wrap, attached, j,
		fragment = context.createDocumentFragment(),
		nodes = [],
		i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		elem = elems[ i ];

		if ( elem || elem === 0 ) {

			// Add nodes directly
			if ( toType( elem ) === "object" ) {

				// Support: Android <=4.0 only, PhantomJS 1 only
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

			// Convert non-html into a text node
			} else if ( !rhtml.test( elem ) ) {
				nodes.push( context.createTextNode( elem ) );

			// Convert html into DOM nodes
			} else {
				tmp = tmp || fragment.appendChild( context.createElement( "div" ) );

				// Deserialize a standard representation
				tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
				wrap = wrapMap[ tag ] || wrapMap._default;
				tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

				// Descend through wrappers to the right content
				j = wrap[ 0 ];
				while ( j-- ) {
					tmp = tmp.lastChild;
				}

				// Support: Android <=4.0 only, PhantomJS 1 only
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, tmp.childNodes );

				// Remember the top-level container
				tmp = fragment.firstChild;

				// Ensure the created nodes are orphaned (#12392)
				tmp.textContent = "";
			}
		}
	}

	// Remove wrapper from fragment
	fragment.textContent = "";

	i = 0;
	while ( ( elem = nodes[ i++ ] ) ) {

		// Skip elements already in the context collection (trac-4087)
		if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
			if ( ignored ) {
				ignored.push( elem );
			}
			continue;
		}

		attached = isAttached( elem );

		// Append to fragment
		tmp = getAll( fragment.appendChild( elem ), "script" );

		// Preserve script evaluation history
		if ( attached ) {
			setGlobalEval( tmp );
		}

		// Capture executables
		if ( scripts ) {
			j = 0;
			while ( ( elem = tmp[ j++ ] ) ) {
				if ( rscriptType.test( elem.type || "" ) ) {
					scripts.push( elem );
				}
			}
		}
	}

	return fragment;
}


( function() {
	var fragment = document.createDocumentFragment(),
		div = fragment.appendChild( document.createElement( "div" ) ),
		input = document.createElement( "input" );

	// Support: Android 4.0 - 4.3 only
	// Check state lost if the name is set (#11217)
	// Support: Windows Web Apps (WWA)
	// `name` and `type` must use .setAttribute for WWA (#14901)
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Android <=4.1 only
	// Older WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE <=11 only
	// Make sure textarea (and checkbox) defaultValue is properly cloned
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;
} )();


var
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

// Support: IE <=9 - 11+
// focus() and blur() are asynchronous, except when they are no-op.
// So expect focus to be synchronous when the element is already active,
// and blur to be synchronous when the element is not already active.
// (focus and blur are always synchronous in other supported browsers,
// this just defines when we can count on it).
function expectSync( elem, type ) {
	return ( elem === safeActiveElement() ) === ( type === "focus" );
}

// Support: IE <=9 only
// Accessing document.activeElement can throw unexpectedly
// https://bugs.jquery.com/ticket/13393
function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

function on( elem, types, selector, data, fn, one ) {
	var origFn, type;

	// Types can be a map of types/handlers
	if ( typeof types === "object" ) {

		// ( types-Object, selector, data )
		if ( typeof selector !== "string" ) {

			// ( types-Object, data )
			data = data || selector;
			selector = undefined;
		}
		for ( type in types ) {
			on( elem, type, selector, data, types[ type ], one );
		}
		return elem;
	}

	if ( data == null && fn == null ) {

		// ( types, fn )
		fn = selector;
		data = selector = undefined;
	} else if ( fn == null ) {
		if ( typeof selector === "string" ) {

			// ( types, selector, fn )
			fn = data;
			data = undefined;
		} else {

			// ( types, data, fn )
			fn = data;
			data = selector;
			selector = undefined;
		}
	}
	if ( fn === false ) {
		fn = returnFalse;
	} else if ( !fn ) {
		return elem;
	}

	if ( one === 1 ) {
		origFn = fn;
		fn = function( event ) {

			// Can use an empty set, since event contains the info
			jQuery().off( event );
			return origFn.apply( this, arguments );
		};

		// Use same guid so caller can remove using origFn
		fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
	}
	return elem.each( function() {
		jQuery.event.add( this, types, fn, data, selector );
	} );
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {

		var handleObjIn, eventHandle, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.get( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Ensure that invalid selectors throw exceptions at attach time
		// Evaluate against documentElement in case elem is a non-element node (e.g., document)
		if ( selector ) {
			jQuery.find.matchesSelector( documentElement, selector );
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !( events = elemData.events ) ) {
			events = elemData.events = {};
		}
		if ( !( eventHandle = elemData.handle ) ) {
			eventHandle = elemData.handle = function( e ) {

				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
					jQuery.event.dispatch.apply( elem, arguments ) : undefined;
			};
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend( {
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join( "." )
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !( handlers = events[ type ] ) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener if the special events handler returns false
				if ( !special.setup ||
					special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var j, origCount, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );

		if ( !elemData || !( events = elemData.events ) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[ 2 ] &&
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector ||
						selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown ||
					special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove data and the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			dataPriv.remove( elem, "handle events" );
		}
	},

	dispatch: function( nativeEvent ) {

		// Make a writable jQuery.Event from the native event object
		var event = jQuery.event.fix( nativeEvent );

		var i, j, ret, matched, handleObj, handlerQueue,
			args = new Array( arguments.length ),
			handlers = ( dataPriv.get( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[ 0 ] = event;

		for ( i = 1; i < arguments.length; i++ ) {
			args[ i ] = arguments[ i ];
		}

		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( ( handleObj = matched.handlers[ j++ ] ) &&
				!event.isImmediatePropagationStopped() ) {

				// If the event is namespaced, then each handler is only invoked if it is
				// specially universal or its namespaces are a superset of the event's.
				if ( !event.rnamespace || handleObj.namespace === false ||
					event.rnamespace.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
						handleObj.handler ).apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( ( event.result = ret ) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, handleObj, sel, matchedHandlers, matchedSelectors,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		if ( delegateCount &&

			// Support: IE <=9
			// Black-hole SVG <use> instance trees (trac-13180)
			cur.nodeType &&

			// Support: Firefox <=42
			// Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
			// https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
			// Support: IE 11 only
			// ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
			!( event.type === "click" && event.button >= 1 ) ) {

			for ( ; cur !== this; cur = cur.parentNode || this ) {

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && !( event.type === "click" && cur.disabled === true ) ) {
					matchedHandlers = [];
					matchedSelectors = {};
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matchedSelectors[ sel ] === undefined ) {
							matchedSelectors[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) > -1 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matchedSelectors[ sel ] ) {
							matchedHandlers.push( handleObj );
						}
					}
					if ( matchedHandlers.length ) {
						handlerQueue.push( { elem: cur, handlers: matchedHandlers } );
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		cur = this;
		if ( delegateCount < handlers.length ) {
			handlerQueue.push( { elem: cur, handlers: handlers.slice( delegateCount ) } );
		}

		return handlerQueue;
	},

	addProp: function( name, hook ) {
		Object.defineProperty( jQuery.Event.prototype, name, {
			enumerable: true,
			configurable: true,

			get: isFunction( hook ) ?
				function() {
					if ( this.originalEvent ) {
							return hook( this.originalEvent );
					}
				} :
				function() {
					if ( this.originalEvent ) {
							return this.originalEvent[ name ];
					}
				},

			set: function( value ) {
				Object.defineProperty( this, name, {
					enumerable: true,
					configurable: true,
					writable: true,
					value: value
				} );
			}
		} );
	},

	fix: function( originalEvent ) {
		return originalEvent[ jQuery.expando ] ?
			originalEvent :
			new jQuery.Event( originalEvent );
	},

	special: {
		load: {

			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		click: {

			// Utilize native event to ensure correct state for checkable inputs
			setup: function( data ) {

				// For mutual compressibility with _default, replace `this` access with a local var.
				// `|| data` is dead code meant only to preserve the variable through minification.
				var el = this || data;

				// Claim the first handler
				if ( rcheckableType.test( el.type ) &&
					el.click && nodeName( el, "input" ) ) {

					// dataPriv.set( el, "click", ... )
					leverageNative( el, "click", returnTrue );
				}

				// Return false to allow normal processing in the caller
				return false;
			},
			trigger: function( data ) {

				// For mutual compressibility with _default, replace `this` access with a local var.
				// `|| data` is dead code meant only to preserve the variable through minification.
				var el = this || data;

				// Force setup before triggering a click
				if ( rcheckableType.test( el.type ) &&
					el.click && nodeName( el, "input" ) ) {

					leverageNative( el, "click" );
				}

				// Return non-false to allow normal event-path propagation
				return true;
			},

			// For cross-browser consistency, suppress native .click() on links
			// Also prevent it if we're currently inside a leveraged native-event stack
			_default: function( event ) {
				var target = event.target;
				return rcheckableType.test( target.type ) &&
					target.click && nodeName( target, "input" ) &&
					dataPriv.get( target, "click" ) ||
					nodeName( target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	}
};

// Ensure the presence of an event listener that handles manually-triggered
// synthetic events by interrupting progress until reinvoked in response to
// *native* events that it fires directly, ensuring that state changes have
// already occurred before other listeners are invoked.
function leverageNative( el, type, expectSync ) {

	// Missing expectSync indicates a trigger call, which must force setup through jQuery.event.add
	if ( !expectSync ) {
		if ( dataPriv.get( el, type ) === undefined ) {
			jQuery.event.add( el, type, returnTrue );
		}
		return;
	}

	// Register the controller as a special universal handler for all event namespaces
	dataPriv.set( el, type, false );
	jQuery.event.add( el, type, {
		namespace: false,
		handler: function( event ) {
			var notAsync, result,
				saved = dataPriv.get( this, type );

			if ( ( event.isTrigger & 1 ) && this[ type ] ) {

				// Interrupt processing of the outer synthetic .trigger()ed event
				// Saved data should be false in such cases, but might be a leftover capture object
				// from an async native handler (gh-4350)
				if ( !saved.length ) {

					// Store arguments for use when handling the inner native event
					// There will always be at least one argument (an event object), so this array
					// will not be confused with a leftover capture object.
					saved = slice.call( arguments );
					dataPriv.set( this, type, saved );

					// Trigger the native event and capture its result
					// Support: IE <=9 - 11+
					// focus() and blur() are asynchronous
					notAsync = expectSync( this, type );
					this[ type ]();
					result = dataPriv.get( this, type );
					if ( saved !== result || notAsync ) {
						dataPriv.set( this, type, false );
					} else {
						result = {};
					}
					if ( saved !== result ) {

						// Cancel the outer synthetic event
						event.stopImmediatePropagation();
						event.preventDefault();
						return result.value;
					}

				// If this is an inner synthetic event for an event with a bubbling surrogate
				// (focus or blur), assume that the surrogate already propagated from triggering the
				// native event and prevent that from happening again here.
				// This technically gets the ordering wrong w.r.t. to `.trigger()` (in which the
				// bubbling surrogate propagates *after* the non-bubbling base), but that seems
				// less bad than duplication.
				} else if ( ( jQuery.event.special[ type ] || {} ).delegateType ) {
					event.stopPropagation();
				}

			// If this is a native event triggered above, everything is now in order
			// Fire an inner synthetic event with the original arguments
			} else if ( saved.length ) {

				// ...and capture the result
				dataPriv.set( this, type, {
					value: jQuery.event.trigger(

						// Support: IE <=9 - 11+
						// Extend with the prototype to reset the above stopImmediatePropagation()
						jQuery.extend( saved[ 0 ], jQuery.Event.prototype ),
						saved.slice( 1 ),
						this
					)
				} );

				// Abort handling of the native event
				event.stopImmediatePropagation();
			}
		}
	} );
}

jQuery.removeEvent = function( elem, type, handle ) {

	// This "if" is needed for plain objects
	if ( elem.removeEventListener ) {
		elem.removeEventListener( type, handle );
	}
};

jQuery.Event = function( src, props ) {

	// Allow instantiation without the 'new' keyword
	if ( !( this instanceof jQuery.Event ) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&

				// Support: Android <=2.3 only
				src.returnValue === false ?
			returnTrue :
			returnFalse;

		// Create target properties
		// Support: Safari <=6 - 7 only
		// Target should not be a text node (#504, #13143)
		this.target = ( src.target && src.target.nodeType === 3 ) ?
			src.target.parentNode :
			src.target;

		this.currentTarget = src.currentTarget;
		this.relatedTarget = src.relatedTarget;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || Date.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// https://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	constructor: jQuery.Event,
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,
	isSimulated: false,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;

		if ( e && !this.isSimulated ) {
			e.preventDefault();
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( e && !this.isSimulated ) {
			e.stopPropagation();
		}
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e && !this.isSimulated ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Includes all common event props including KeyEvent and MouseEvent specific props
jQuery.each( {
	altKey: true,
	bubbles: true,
	cancelable: true,
	changedTouches: true,
	ctrlKey: true,
	detail: true,
	eventPhase: true,
	metaKey: true,
	pageX: true,
	pageY: true,
	shiftKey: true,
	view: true,
	"char": true,
	code: true,
	charCode: true,
	key: true,
	keyCode: true,
	button: true,
	buttons: true,
	clientX: true,
	clientY: true,
	offsetX: true,
	offsetY: true,
	pointerId: true,
	pointerType: true,
	screenX: true,
	screenY: true,
	targetTouches: true,
	toElement: true,
	touches: true,

	which: function( event ) {
		var button = event.button;

		// Add which for key events
		if ( event.which == null && rkeyEvent.test( event.type ) ) {
			return event.charCode != null ? event.charCode : event.keyCode;
		}

		// Add which for click: 1 === left; 2 === middle; 3 === right
		if ( !event.which && button !== undefined && rmouseEvent.test( event.type ) ) {
			if ( button & 1 ) {
				return 1;
			}

			if ( button & 2 ) {
				return 3;
			}

			if ( button & 4 ) {
				return 2;
			}

			return 0;
		}

		return event.which;
	}
}, jQuery.event.addProp );

jQuery.each( { focus: "focusin", blur: "focusout" }, function( type, delegateType ) {
	jQuery.event.special[ type ] = {

		// Utilize native event if possible so blur/focus sequence is correct
		setup: function() {

			// Claim the first handler
			// dataPriv.set( this, "focus", ... )
			// dataPriv.set( this, "blur", ... )
			leverageNative( this, type, expectSync );

			// Return false to allow normal processing in the caller
			return false;
		},
		trigger: function() {

			// Force setup before trigger
			leverageNative( this, type );

			// Return non-false to allow normal event-path propagation
			return true;
		},

		delegateType: delegateType
	};
} );

// Create mouseenter/leave events using mouseover/out and event-time checks
// so that event delegation works in jQuery.
// Do the same for pointerenter/pointerleave and pointerover/pointerout
//
// Support: Safari 7 only
// Safari sends mouseenter too often; see:
// https://bugs.chromium.org/p/chromium/issues/detail?id=470258
// for the description of the bug (it existed in older Chrome versions as well).
jQuery.each( {
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mouseenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
} );

jQuery.fn.extend( {

	on: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn );
	},
	one: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {

			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ?
					handleObj.origType + "." + handleObj.namespace :
					handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {

			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {

			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each( function() {
			jQuery.event.remove( this, types, fn, selector );
		} );
	}
} );


var

	/* eslint-disable max-len */

	// See https://github.com/eslint/eslint/issues/3229
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi,

	/* eslint-enable */

	// Support: IE <=10 - 11, Edge 12 - 13 only
	// In IE/Edge using regex groups here causes severe slowdowns.
	// See https://connect.microsoft.com/IE/feedback/details/1736512/
	rnoInnerhtml = /<script|<style|<link/i,

	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;

// Prefer a tbody over its parent table for containing new rows
function manipulationTarget( elem, content ) {
	if ( nodeName( elem, "table" ) &&
		nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ) {

		return jQuery( elem ).children( "tbody" )[ 0 ] || elem;
	}

	return elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	if ( ( elem.type || "" ).slice( 0, 5 ) === "true/" ) {
		elem.type = elem.type.slice( 5 );
	} else {
		elem.removeAttribute( "type" );
	}

	return elem;
}

function cloneCopyEvent( src, dest ) {
	var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

	if ( dest.nodeType !== 1 ) {
		return;
	}

	// 1. Copy private data: events, handlers, etc.
	if ( dataPriv.hasData( src ) ) {
		pdataOld = dataPriv.access( src );
		pdataCur = dataPriv.set( dest, pdataOld );
		events = pdataOld.events;

		if ( events ) {
			delete pdataCur.handle;
			pdataCur.events = {};

			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type, events[ type ][ i ] );
				}
			}
		}
	}

	// 2. Copy user data
	if ( dataUser.hasData( src ) ) {
		udataOld = dataUser.access( src );
		udataCur = jQuery.extend( {}, udataOld );

		dataUser.set( dest, udataCur );
	}
}

// Fix IE bugs, see support tests
function fixInput( src, dest ) {
	var nodeName = dest.nodeName.toLowerCase();

	// Fails to persist the checked state of a cloned checkbox or radio button.
	if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		dest.checked = src.checked;

	// Fails to return the selected option to the default selected state when cloning options
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

function domManip( collection, args, callback, ignored ) {

	// Flatten any nested arrays
	args = concat.apply( [], args );

	var fragment, first, scripts, hasScripts, node, doc,
		i = 0,
		l = collection.length,
		iNoClone = l - 1,
		value = args[ 0 ],
		valueIsFunction = isFunction( value );

	// We can't cloneNode fragments that contain checked, in WebKit
	if ( valueIsFunction ||
			( l > 1 && typeof value === "string" &&
				!support.checkClone && rchecked.test( value ) ) ) {
		return collection.each( function( index ) {
			var self = collection.eq( index );
			if ( valueIsFunction ) {
				args[ 0 ] = value.call( this, index, self.html() );
			}
			domManip( self, args, callback, ignored );
		} );
	}

	if ( l ) {
		fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
		first = fragment.firstChild;

		if ( fragment.childNodes.length === 1 ) {
			fragment = first;
		}

		// Require either new content or an interest in ignored elements to invoke the callback
		if ( first || ignored ) {
			scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
			hasScripts = scripts.length;

			// Use the original fragment for the last item
			// instead of the first because it can end up
			// being emptied incorrectly in certain situations (#8070).
			for ( ; i < l; i++ ) {
				node = fragment;

				if ( i !== iNoClone ) {
					node = jQuery.clone( node, true, true );

					// Keep references to cloned scripts for later restoration
					if ( hasScripts ) {

						// Support: Android <=4.0 only, PhantomJS 1 only
						// push.apply(_, arraylike) throws on ancient WebKit
						jQuery.merge( scripts, getAll( node, "script" ) );
					}
				}

				callback.call( collection[ i ], node, i );
			}

			if ( hasScripts ) {
				doc = scripts[ scripts.length - 1 ].ownerDocument;

				// Reenable scripts
				jQuery.map( scripts, restoreScript );

				// Evaluate executable scripts on first document insertion
				for ( i = 0; i < hasScripts; i++ ) {
					node = scripts[ i ];
					if ( rscriptType.test( node.type || "" ) &&
						!dataPriv.access( node, "globalEval" ) &&
						jQuery.contains( doc, node ) ) {

						if ( node.src && ( node.type || "" ).toLowerCase()  !== "module" ) {

							// Optional AJAX dependency, but won't run scripts if not present
							if ( jQuery._evalUrl && !node.noModule ) {
								jQuery._evalUrl( node.src, {
									nonce: node.nonce || node.getAttribute( "nonce" )
								} );
							}
						} else {
							DOMEval( node.textContent.replace( rcleanScript, "" ), node, doc );
						}
					}
				}
			}
		}
	}

	return collection;
}

function remove( elem, selector, keepData ) {
	var node,
		nodes = selector ? jQuery.filter( selector, elem ) : elem,
		i = 0;

	for ( ; ( node = nodes[ i ] ) != null; i++ ) {
		if ( !keepData && node.nodeType === 1 ) {
			jQuery.cleanData( getAll( node ) );
		}

		if ( node.parentNode ) {
			if ( keepData && isAttached( node ) ) {
				setGlobalEval( getAll( node, "script" ) );
			}
			node.parentNode.removeChild( node );
		}
	}

	return elem;
}

jQuery.extend( {
	htmlPrefilter: function( html ) {
		return html.replace( rxhtmlTag, "<$1></$2>" );
	},

	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var i, l, srcElements, destElements,
			clone = elem.cloneNode( true ),
			inPage = isAttached( elem );

		// Fix IE cloning issues
		if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
				!jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: https://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			for ( i = 0, l = srcElements.length; i < l; i++ ) {
				fixInput( srcElements[ i ], destElements[ i ] );
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					cloneCopyEvent( srcElements[ i ], destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		// Return the cloned set
		return clone;
	},

	cleanData: function( elems ) {
		var data, elem, type,
			special = jQuery.event.special,
			i = 0;

		for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
			if ( acceptData( elem ) ) {
				if ( ( data = elem[ dataPriv.expando ] ) ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Support: Chrome <=35 - 45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataPriv.expando ] = undefined;
				}
				if ( elem[ dataUser.expando ] ) {

					// Support: Chrome <=35 - 45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataUser.expando ] = undefined;
				}
			}
		}
	}
} );

jQuery.fn.extend( {
	detach: function( selector ) {
		return remove( this, selector, true );
	},

	remove: function( selector ) {
		return remove( this, selector );
	},

	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().each( function() {
					if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
						this.textContent = value;
					}
				} );
		}, null, value, arguments.length );
	},

	append: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		} );
	},

	prepend: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		} );
	},

	before: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		} );
	},

	after: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		} );
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; ( elem = this[ i ] ) != null; i++ ) {
			if ( elem.nodeType === 1 ) {

				// Prevent memory leaks
				jQuery.cleanData( getAll( elem, false ) );

				// Remove any remaining nodes
				elem.textContent = "";
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		} );
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined && elem.nodeType === 1 ) {
				return elem.innerHTML;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = jQuery.htmlPrefilter( value );

				try {
					for ( ; i < l; i++ ) {
						elem = this[ i ] || {};

						// Remove element nodes and prevent memory leaks
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch ( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var ignored = [];

		// Make the changes, replacing each non-ignored context element with the new content
		return domManip( this, arguments, function( elem ) {
			var parent = this.parentNode;

			if ( jQuery.inArray( this, ignored ) < 0 ) {
				jQuery.cleanData( getAll( this ) );
				if ( parent ) {
					parent.replaceChild( elem, this );
				}
			}

		// Force callback invocation
		}, ignored );
	}
} );

jQuery.each( {
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1,
			i = 0;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Support: Android <=4.0 only, PhantomJS 1 only
			// .get() because push.apply(_, arraylike) throws on ancient WebKit
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
} );
var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var getStyles = function( elem ) {

		// Support: IE <=11 only, Firefox <=30 (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		var view = elem.ownerDocument.defaultView;

		if ( !view || !view.opener ) {
			view = window;
		}

		return view.getComputedStyle( elem );
	};

var rboxStyle = new RegExp( cssExpand.join( "|" ), "i" );



( function() {

	// Executing both pixelPosition & boxSizingReliable tests require only one layout
	// so they're executed at the same time to save the second computation.
	function computeStyleTests() {

		// This is a singleton, we need to execute it only once
		if ( !div ) {
			return;
		}

		container.style.cssText = "position:absolute;left:-11111px;width:60px;" +
			"margin-top:1px;padding:0;border:0";
		div.style.cssText =
			"position:relative;display:block;box-sizing:border-box;overflow:scroll;" +
			"margin:auto;border:1px;padding:1px;" +
			"width:60%;top:1%";
		documentElement.appendChild( container ).appendChild( div );

		var divStyle = window.getComputedStyle( div );
		pixelPositionVal = divStyle.top !== "1%";

		// Support: Android 4.0 - 4.3 only, Firefox <=3 - 44
		reliableMarginLeftVal = roundPixelMeasures( divStyle.marginLeft ) === 12;

		// Support: Android 4.0 - 4.3 only, Safari <=9.1 - 10.1, iOS <=7.0 - 9.3
		// Some styles come back with percentage values, even though they shouldn't
		div.style.right = "60%";
		pixelBoxStylesVal = roundPixelMeasures( divStyle.right ) === 36;

		// Support: IE 9 - 11 only
		// Detect misreporting of content dimensions for box-sizing:border-box elements
		boxSizingReliableVal = roundPixelMeasures( divStyle.width ) === 36;

		// Support: IE 9 only
		// Detect overflow:scroll screwiness (gh-3699)
		// Support: Chrome <=64
		// Don't get tricked when zoom affects offsetWidth (gh-4029)
		div.style.position = "absolute";
		scrollboxSizeVal = roundPixelMeasures( div.offsetWidth / 3 ) === 12;

		documentElement.removeChild( container );

		// Nullify the div so it wouldn't be stored in the memory and
		// it will also be a sign that checks already performed
		div = null;
	}

	function roundPixelMeasures( measure ) {
		return Math.round( parseFloat( measure ) );
	}

	var pixelPositionVal, boxSizingReliableVal, scrollboxSizeVal, pixelBoxStylesVal,
		reliableMarginLeftVal,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	// Finish early in limited (non-browser) environments
	if ( !div.style ) {
		return;
	}

	// Support: IE <=9 - 11 only
	// Style of cloned element affects source element cloned (#8908)
	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	jQuery.extend( support, {
		boxSizingReliable: function() {
			computeStyleTests();
			return boxSizingReliableVal;
		},
		pixelBoxStyles: function() {
			computeStyleTests();
			return pixelBoxStylesVal;
		},
		pixelPosition: function() {
			computeStyleTests();
			return pixelPositionVal;
		},
		reliableMarginLeft: function() {
			computeStyleTests();
			return reliableMarginLeftVal;
		},
		scrollboxSize: function() {
			computeStyleTests();
			return scrollboxSizeVal;
		}
	} );
} )();


function curCSS( elem, name, computed ) {
	var width, minWidth, maxWidth, ret,

		// Support: Firefox 51+
		// Retrieving style before computed somehow
		// fixes an issue with getting wrong values
		// on detached elements
		style = elem.style;

	computed = computed || getStyles( elem );

	// getPropertyValue is needed for:
	//   .css('filter') (IE 9 only, #12537)
	//   .css('--customProperty) (#3144)
	if ( computed ) {
		ret = computed.getPropertyValue( name ) || computed[ name ];

		if ( ret === "" && !isAttached( elem ) ) {
			ret = jQuery.style( elem, name );
		}

		// A tribute to the "awesome hack by Dean Edwards"
		// Android Browser returns percentage for some values,
		// but width seems to be reliably pixels.
		// This is against the CSSOM draft spec:
		// https://drafts.csswg.org/cssom/#resolved-values
		if ( !support.pixelBoxStyles() && rnumnonpx.test( ret ) && rboxStyle.test( name ) ) {

			// Remember the original values
			width = style.width;
			minWidth = style.minWidth;
			maxWidth = style.maxWidth;

			// Put in the new values to get a computed value out
			style.minWidth = style.maxWidth = style.width = ret;
			ret = computed.width;

			// Revert the changed values
			style.width = width;
			style.minWidth = minWidth;
			style.maxWidth = maxWidth;
		}
	}

	return ret !== undefined ?

		// Support: IE <=9 - 11 only
		// IE returns zIndex value as an integer.
		ret + "" :
		ret;
}


function addGetHookIf( conditionFn, hookFn ) {

	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			if ( conditionFn() ) {

				// Hook not needed (or it's not possible to use it due
				// to missing dependency), remove it.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.
			return ( this.get = hookFn ).apply( this, arguments );
		}
	};
}


var cssPrefixes = [ "Webkit", "Moz", "ms" ],
	emptyStyle = document.createElement( "div" ).style,
	vendorProps = {};

// Return a vendor-prefixed property or undefined
function vendorPropName( name ) {

	// Check for vendor prefixed names
	var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in emptyStyle ) {
			return name;
		}
	}
}

// Return a potentially-mapped jQuery.cssProps or vendor prefixed property
function finalPropName( name ) {
	var final = jQuery.cssProps[ name ] || vendorProps[ name ];

	if ( final ) {
		return final;
	}
	if ( name in emptyStyle ) {
		return name;
	}
	return vendorProps[ name ] = vendorPropName( name ) || name;
}


var

	// Swappable if display is none or starts with table
	// except "table", "table-cell", or "table-caption"
	// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rcustomProp = /^--/,
	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	};

function setPositiveNumber( elem, value, subtract ) {

	// Any relative (+/-) values have already been
	// normalized at this point
	var matches = rcssNum.exec( value );
	return matches ?

		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
		value;
}

function boxModelAdjustment( elem, dimension, box, isBorderBox, styles, computedVal ) {
	var i = dimension === "width" ? 1 : 0,
		extra = 0,
		delta = 0;

	// Adjustment may not be necessary
	if ( box === ( isBorderBox ? "border" : "content" ) ) {
		return 0;
	}

	for ( ; i < 4; i += 2 ) {

		// Both box models exclude margin
		if ( box === "margin" ) {
			delta += jQuery.css( elem, box + cssExpand[ i ], true, styles );
		}

		// If we get here with a content-box, we're seeking "padding" or "border" or "margin"
		if ( !isBorderBox ) {

			// Add padding
			delta += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// For "border" or "margin", add border
			if ( box !== "padding" ) {
				delta += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );

			// But still keep track of it otherwise
			} else {
				extra += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}

		// If we get here with a border-box (content + padding + border), we're seeking "content" or
		// "padding" or "margin"
		} else {

			// For "content", subtract padding
			if ( box === "content" ) {
				delta -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// For "content" or "padding", subtract border
			if ( box !== "margin" ) {
				delta -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	// Account for positive content-box scroll gutter when requested by providing computedVal
	if ( !isBorderBox && computedVal >= 0 ) {

		// offsetWidth/offsetHeight is a rounded sum of content, padding, scroll gutter, and border
		// Assuming integer scroll gutter, subtract the rest and round down
		delta += Math.max( 0, Math.ceil(
			elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ] -
			computedVal -
			delta -
			extra -
			0.5

		// If offsetWidth/offsetHeight is unknown, then we can't determine content-box scroll gutter
		// Use an explicit zero to avoid NaN (gh-3964)
		) ) || 0;
	}

	return delta;
}

function getWidthOrHeight( elem, dimension, extra ) {

	// Start with computed style
	var styles = getStyles( elem ),

		// To avoid forcing a reflow, only fetch boxSizing if we need it (gh-4322).
		// Fake content-box until we know it's needed to know the true value.
		boxSizingNeeded = !support.boxSizingReliable() || extra,
		isBorderBox = boxSizingNeeded &&
			jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
		valueIsBorderBox = isBorderBox,

		val = curCSS( elem, dimension, styles ),
		offsetProp = "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 );

	// Support: Firefox <=54
	// Return a confounding non-pixel value or feign ignorance, as appropriate.
	if ( rnumnonpx.test( val ) ) {
		if ( !extra ) {
			return val;
		}
		val = "auto";
	}


	// Fall back to offsetWidth/offsetHeight when value is "auto"
	// This happens for inline elements with no explicit setting (gh-3571)
	// Support: Android <=4.1 - 4.3 only
	// Also use offsetWidth/offsetHeight for misreported inline dimensions (gh-3602)
	// Support: IE 9-11 only
	// Also use offsetWidth/offsetHeight for when box sizing is unreliable
	// We use getClientRects() to check for hidden/disconnected.
	// In those cases, the computed value can be trusted to be border-box
	if ( ( !support.boxSizingReliable() && isBorderBox ||
		val === "auto" ||
		!parseFloat( val ) && jQuery.css( elem, "display", false, styles ) === "inline" ) &&
		elem.getClientRects().length ) {

		isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

		// Where available, offsetWidth/offsetHeight approximate border box dimensions.
		// Where not available (e.g., SVG), assume unreliable box-sizing and interpret the
		// retrieved value as a content box dimension.
		valueIsBorderBox = offsetProp in elem;
		if ( valueIsBorderBox ) {
			val = elem[ offsetProp ];
		}
	}

	// Normalize "" and auto
	val = parseFloat( val ) || 0;

	// Adjust for the element's box model
	return ( val +
		boxModelAdjustment(
			elem,
			dimension,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles,

			// Provide the current computed size to request scroll gutter calculation (gh-3589)
			val
		)
	) + "px";
}

jQuery.extend( {

	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {

					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"animationIterationCount": true,
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"gridArea": true,
		"gridColumn": true,
		"gridColumnEnd": true,
		"gridColumnStart": true,
		"gridRow": true,
		"gridRowEnd": true,
		"gridRowStart": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {

		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = camelCase( name ),
			isCustomProp = rcustomProp.test( name ),
			style = elem.style;

		// Make sure that we're working with the right name. We don't
		// want to query the value if it is a CSS custom property
		// since they are user-defined.
		if ( !isCustomProp ) {
			name = finalPropName( origName );
		}

		// Gets hook for the prefixed version, then unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// Convert "+=" or "-=" to relative numbers (#7345)
			if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
				value = adjustCSS( elem, name, ret );

				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set (#7116)
			if ( value == null || value !== value ) {
				return;
			}

			// If a number was passed in, add the unit (except for certain CSS properties)
			// The isCustomProp check can be removed in jQuery 4.0 when we only auto-append
			// "px" to a few hardcoded values.
			if ( type === "number" && !isCustomProp ) {
				value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
			}

			// background-* props affect original clone's values
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !( "set" in hooks ) ||
				( value = hooks.set( elem, value, extra ) ) !== undefined ) {

				if ( isCustomProp ) {
					style.setProperty( name, value );
				} else {
					style[ name ] = value;
				}
			}

		} else {

			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks &&
				( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var val, num, hooks,
			origName = camelCase( name ),
			isCustomProp = rcustomProp.test( name );

		// Make sure that we're working with the right name. We don't
		// want to modify the value if it is a CSS custom property
		// since they are user-defined.
		if ( !isCustomProp ) {
			name = finalPropName( origName );
		}

		// Try prefixed name followed by the unprefixed name
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		// Convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Make numeric if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || isFinite( num ) ? num || 0 : val;
		}

		return val;
	}
} );

jQuery.each( [ "height", "width" ], function( i, dimension ) {
	jQuery.cssHooks[ dimension ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {

				// Certain elements can have dimension info if we invisibly show them
				// but it must have a current display style that would benefit
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&

					// Support: Safari 8+
					// Table columns in Safari have non-zero offsetWidth & zero
					// getBoundingClientRect().width unless display is changed.
					// Support: IE <=11 only
					// Running getBoundingClientRect on a disconnected node
					// in IE throws an error.
					( !elem.getClientRects().length || !elem.getBoundingClientRect().width ) ?
						swap( elem, cssShow, function() {
							return getWidthOrHeight( elem, dimension, extra );
						} ) :
						getWidthOrHeight( elem, dimension, extra );
			}
		},

		set: function( elem, value, extra ) {
			var matches,
				styles = getStyles( elem ),

				// Only read styles.position if the test has a chance to fail
				// to avoid forcing a reflow.
				scrollboxSizeBuggy = !support.scrollboxSize() &&
					styles.position === "absolute",

				// To avoid forcing a reflow, only fetch boxSizing if we need it (gh-3991)
				boxSizingNeeded = scrollboxSizeBuggy || extra,
				isBorderBox = boxSizingNeeded &&
					jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
				subtract = extra ?
					boxModelAdjustment(
						elem,
						dimension,
						extra,
						isBorderBox,
						styles
					) :
					0;

			// Account for unreliable border-box dimensions by comparing offset* to computed and
			// faking a content-box to get border and padding (gh-3699)
			if ( isBorderBox && scrollboxSizeBuggy ) {
				subtract -= Math.ceil(
					elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ] -
					parseFloat( styles[ dimension ] ) -
					boxModelAdjustment( elem, dimension, "border", false, styles ) -
					0.5
				);
			}

			// Convert to pixels if value adjustment is needed
			if ( subtract && ( matches = rcssNum.exec( value ) ) &&
				( matches[ 3 ] || "px" ) !== "px" ) {

				elem.style[ dimension ] = value;
				value = jQuery.css( elem, dimension );
			}

			return setPositiveNumber( elem, value, subtract );
		}
	};
} );

jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
	function( elem, computed ) {
		if ( computed ) {
			return ( parseFloat( curCSS( elem, "marginLeft" ) ) ||
				elem.getBoundingClientRect().left -
					swap( elem, { marginLeft: 0 }, function() {
						return elem.getBoundingClientRect().left;
					} )
				) + "px";
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each( {
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// Assumes a single number if not a string
				parts = typeof value === "string" ? value.split( " " ) : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( prefix !== "margin" ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
} );

jQuery.fn.extend( {
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( Array.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	}
} );


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || jQuery.easing._default;
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			// Use a property on the element directly when it is not a DOM element,
			// or when there is no matching style property that exists.
			if ( tween.elem.nodeType !== 1 ||
				tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
				return tween.elem[ tween.prop ];
			}

			// Passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails.
			// Simple values such as "10px" are parsed to Float;
			// complex values such as "rotate(1rad)" are returned as-is.
			result = jQuery.css( tween.elem, tween.prop, "" );

			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {

			// Use step hook for back compat.
			// Use cssHook if its there.
			// Use .style if available and use plain properties where available.
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.nodeType === 1 && (
					jQuery.cssHooks[ tween.prop ] ||
					tween.elem.style[ finalPropName( tween.prop ) ] != null ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE <=9 only
// Panic based approach to setting things on disconnected nodes
Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	},
	_default: "swing"
};

jQuery.fx = Tween.prototype.init;

// Back compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, inProgress,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rrun = /queueHooks$/;

function schedule() {
	if ( inProgress ) {
		if ( document.hidden === false && window.requestAnimationFrame ) {
			window.requestAnimationFrame( schedule );
		} else {
			window.setTimeout( schedule, jQuery.fx.interval );
		}

		jQuery.fx.tick();
	}
}

// Animations created synchronously will run synchronously
function createFxNow() {
	window.setTimeout( function() {
		fxNow = undefined;
	} );
	return ( fxNow = Date.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		i = 0,
		attrs = { height: type };

	// If we include width, step value is 1 to do all cssExpand values,
	// otherwise step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

			// We're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	var prop, value, toggle, hooks, oldfire, propTween, restoreDisplay, display,
		isBox = "width" in props || "height" in props,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHiddenWithinTree( elem ),
		dataShow = dataPriv.get( elem, "fxshow" );

	// Queue-skipping animations hijack the fx hooks
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always( function() {

			// Ensure the complete handler is called before this completes
			anim.always( function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			} );
		} );
	}

	// Detect show/hide animations
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.test( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// Pretend to be hidden if this is a "show" and
				// there is still data from a stopped show/hide
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;

				// Ignore all other no-op show/hide data
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );
		}
	}

	// Bail out if this is a no-op like .hide().hide()
	propTween = !jQuery.isEmptyObject( props );
	if ( !propTween && jQuery.isEmptyObject( orig ) ) {
		return;
	}

	// Restrict "overflow" and "display" styles during box animations
	if ( isBox && elem.nodeType === 1 ) {

		// Support: IE <=9 - 11, Edge 12 - 15
		// Record all 3 overflow attributes because IE does not infer the shorthand
		// from identically-valued overflowX and overflowY and Edge just mirrors
		// the overflowX value there.
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Identify a display type, preferring old show/hide data over the CSS cascade
		restoreDisplay = dataShow && dataShow.display;
		if ( restoreDisplay == null ) {
			restoreDisplay = dataPriv.get( elem, "display" );
		}
		display = jQuery.css( elem, "display" );
		if ( display === "none" ) {
			if ( restoreDisplay ) {
				display = restoreDisplay;
			} else {

				// Get nonempty value(s) by temporarily forcing visibility
				showHide( [ elem ], true );
				restoreDisplay = elem.style.display || restoreDisplay;
				display = jQuery.css( elem, "display" );
				showHide( [ elem ] );
			}
		}

		// Animate inline elements as inline-block
		if ( display === "inline" || display === "inline-block" && restoreDisplay != null ) {
			if ( jQuery.css( elem, "float" ) === "none" ) {

				// Restore the original display value at the end of pure show/hide animations
				if ( !propTween ) {
					anim.done( function() {
						style.display = restoreDisplay;
					} );
					if ( restoreDisplay == null ) {
						display = style.display;
						restoreDisplay = display === "none" ? "" : display;
					}
				}
				style.display = "inline-block";
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		anim.always( function() {
			style.overflow = opts.overflow[ 0 ];
			style.overflowX = opts.overflow[ 1 ];
			style.overflowY = opts.overflow[ 2 ];
		} );
	}

	// Implement show/hide animations
	propTween = false;
	for ( prop in orig ) {

		// General show/hide setup for this element animation
		if ( !propTween ) {
			if ( dataShow ) {
				if ( "hidden" in dataShow ) {
					hidden = dataShow.hidden;
				}
			} else {
				dataShow = dataPriv.access( elem, "fxshow", { display: restoreDisplay } );
			}

			// Store hidden/visible for toggle so `.stop().toggle()` "reverses"
			if ( toggle ) {
				dataShow.hidden = !hidden;
			}

			// Show elements before animating them
			if ( hidden ) {
				showHide( [ elem ], true );
			}

			/* eslint-disable no-loop-func */

			anim.done( function() {

			/* eslint-enable no-loop-func */

				// The final step of a "hide" animation is actually hiding the element
				if ( !hidden ) {
					showHide( [ elem ] );
				}
				dataPriv.remove( elem, "fxshow" );
				for ( prop in orig ) {
					jQuery.style( elem, prop, orig[ prop ] );
				}
			} );
		}

		// Per-property setup
		propTween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );
		if ( !( prop in dataShow ) ) {
			dataShow[ prop ] = propTween.start;
			if ( hidden ) {
				propTween.end = propTween.start;
				propTween.start = 0;
			}
		}
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( Array.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// Not quite $.extend, this won't overwrite existing keys.
			// Reusing 'index' because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = Animation.prefilters.length,
		deferred = jQuery.Deferred().always( function() {

			// Don't match elem in the :animated selector
			delete tick.elem;
		} ),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

				// Support: Android 2.3 only
				// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ] );

			// If there's more to do, yield
			if ( percent < 1 && length ) {
				return remaining;
			}

			// If this was an empty animation, synthesize a final progress notification
			if ( !length ) {
				deferred.notifyWith( elem, [ animation, 1, 0 ] );
			}

			// Resolve the animation and report its conclusion
			deferred.resolveWith( elem, [ animation ] );
			return false;
		},
		animation = deferred.promise( {
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, {
				specialEasing: {},
				easing: jQuery.easing._default
			}, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,

					// If we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// Resolve when we played the last frame; otherwise, reject
				if ( gotoEnd ) {
					deferred.notifyWith( elem, [ animation, 1, 0 ] );
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		} ),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length; index++ ) {
		result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			if ( isFunction( result.stop ) ) {
				jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
					result.stop.bind( result );
			}
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	// Attach callbacks from options
	animation
		.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		} )
	);

	return animation;
}

jQuery.Animation = jQuery.extend( Animation, {

	tweeners: {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value );
			adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
			return tween;
		} ]
	},

	tweener: function( props, callback ) {
		if ( isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.match( rnothtmlwhite );
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length; index++ ) {
			prop = props[ index ];
			Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
			Animation.tweeners[ prop ].unshift( callback );
		}
	},

	prefilters: [ defaultPrefilter ],

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			Animation.prefilters.unshift( callback );
		} else {
			Animation.prefilters.push( callback );
		}
	}
} );

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !isFunction( easing ) && easing
	};

	// Go to the end state if fx are off
	if ( jQuery.fx.off ) {
		opt.duration = 0;

	} else {
		if ( typeof opt.duration !== "number" ) {
			if ( opt.duration in jQuery.fx.speeds ) {
				opt.duration = jQuery.fx.speeds[ opt.duration ];

			} else {
				opt.duration = jQuery.fx.speeds._default;
			}
		}
	}

	// Normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend( {
	fadeTo: function( speed, to, easing, callback ) {

		// Show any hidden elements after setting opacity to 0
		return this.filter( isHiddenWithinTree ).css( "opacity", 0 ).show()

			// Animate to the value specified
			.end().animate( { opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {

				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || dataPriv.get( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each( function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = dataPriv.get( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this &&
					( type == null || timers[ index ].queue === type ) ) {

					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// Start the next in the queue if the last step wasn't forced.
			// Timers currently will call their complete callbacks, which
			// will dequeue but only if they were gotoEnd.
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		} );
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each( function() {
			var index,
				data = dataPriv.get( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// Enable finishing flag on private data
			data.finish = true;

			// Empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// Look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// Look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// Turn off finishing flag
			delete data.finish;
		} );
	}
} );

jQuery.each( [ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
} );

// Generate shortcuts for custom animations
jQuery.each( {
	slideDown: genFx( "show" ),
	slideUp: genFx( "hide" ),
	slideToggle: genFx( "toggle" ),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
} );

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		i = 0,
		timers = jQuery.timers;

	fxNow = Date.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];

		// Run the timer and safely remove it when done (allowing for external removal)
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	jQuery.fx.start();
};

jQuery.fx.interval = 13;
jQuery.fx.start = function() {
	if ( inProgress ) {
		return;
	}

	inProgress = true;
	schedule();
};

jQuery.fx.stop = function() {
	inProgress = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,

	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// https://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = window.setTimeout( next, time );
		hooks.stop = function() {
			window.clearTimeout( timeout );
		};
	} );
};


( function() {
	var input = document.createElement( "input" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	input.type = "checkbox";

	// Support: Android <=4.3 only
	// Default value for a checkbox should be "on"
	support.checkOn = input.value !== "";

	// Support: IE <=11 only
	// Must access selectedIndex to make default options select
	support.optSelected = opt.selected;

	// Support: IE <=11 only
	// An input loses its value after becoming a radio
	input = document.createElement( "input" );
	input.value = "t";
	input.type = "radio";
	support.radioValue = input.value === "t";
} )();


var boolHook,
	attrHandle = jQuery.expr.attrHandle;

jQuery.fn.extend( {
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each( function() {
			jQuery.removeAttr( this, name );
		} );
	}
} );

jQuery.extend( {
	attr: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set attributes on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		// Attribute hooks are determined by the lowercase version
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			hooks = jQuery.attrHooks[ name.toLowerCase() ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
		}

		if ( value !== undefined ) {
			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;
			}

			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			elem.setAttribute( name, value + "" );
			return value;
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		ret = jQuery.find.attr( elem, name );

		// Non-existent attributes return null, we normalize to undefined
		return ret == null ? undefined : ret;
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" &&
					nodeName( elem, "input" ) ) {
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	removeAttr: function( elem, value ) {
		var name,
			i = 0,

			// Attribute names can contain non-HTML whitespace characters
			// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
			attrNames = value && value.match( rnothtmlwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( ( name = attrNames[ i++ ] ) ) {
				elem.removeAttribute( name );
			}
		}
	}
} );

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {

			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			elem.setAttribute( name, name );
		}
		return name;
	}
};

jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

	attrHandle[ name ] = function( elem, name, isXML ) {
		var ret, handle,
			lowercaseName = name.toLowerCase();

		if ( !isXML ) {

			// Avoid an infinite loop by temporarily removing this function from the getter
			handle = attrHandle[ lowercaseName ];
			attrHandle[ lowercaseName ] = ret;
			ret = getter( elem, name, isXML ) != null ?
				lowercaseName :
				null;
			attrHandle[ lowercaseName ] = handle;
		}
		return ret;
	};
} );




var rfocusable = /^(?:input|select|textarea|button)$/i,
	rclickable = /^(?:a|area)$/i;

jQuery.fn.extend( {
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		return this.each( function() {
			delete this[ jQuery.propFix[ name ] || name ];
		} );
	}
} );

jQuery.extend( {
	prop: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set properties on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			return ( elem[ name ] = value );
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		return elem[ name ];
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {

				// Support: IE <=9 - 11 only
				// elem.tabIndex doesn't always return the
				// correct value when it hasn't been explicitly set
				// https://web.archive.org/web/20141116233347/http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				// Use proper attribute retrieval(#12072)
				var tabindex = jQuery.find.attr( elem, "tabindex" );

				if ( tabindex ) {
					return parseInt( tabindex, 10 );
				}

				if (
					rfocusable.test( elem.nodeName ) ||
					rclickable.test( elem.nodeName ) &&
					elem.href
				) {
					return 0;
				}

				return -1;
			}
		}
	},

	propFix: {
		"for": "htmlFor",
		"class": "className"
	}
} );

// Support: IE <=11 only
// Accessing the selectedIndex property
// forces the browser to respect setting selected
// on the option
// The getter ensures a default option is selected
// when in an optgroup
// eslint rule "no-unused-expressions" is disabled for this code
// since it considers such accessions noop
if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {

			/* eslint no-unused-expressions: "off" */

			var parent = elem.parentNode;
			if ( parent && parent.parentNode ) {
				parent.parentNode.selectedIndex;
			}
			return null;
		},
		set: function( elem ) {

			/* eslint no-unused-expressions: "off" */

			var parent = elem.parentNode;
			if ( parent ) {
				parent.selectedIndex;

				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
		}
	};
}

jQuery.each( [
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
} );




	// Strip and collapse whitespace according to HTML spec
	// https://infra.spec.whatwg.org/#strip-and-collapse-ascii-whitespace
	function stripAndCollapse( value ) {
		var tokens = value.match( rnothtmlwhite ) || [];
		return tokens.join( " " );
	}


function getClass( elem ) {
	return elem.getAttribute && elem.getAttribute( "class" ) || "";
}

function classesToArray( value ) {
	if ( Array.isArray( value ) ) {
		return value;
	}
	if ( typeof value === "string" ) {
		return value.match( rnothtmlwhite ) || [];
	}
	return [];
}

jQuery.fn.extend( {
	addClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		classes = classesToArray( value );

		if ( classes.length ) {
			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );
				cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = stripAndCollapse( cur );
					if ( curValue !== finalValue ) {
						elem.setAttribute( "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( !arguments.length ) {
			return this.attr( "class", "" );
		}

		classes = classesToArray( value );

		if ( classes.length ) {
			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );

				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {

						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = stripAndCollapse( cur );
					if ( curValue !== finalValue ) {
						elem.setAttribute( "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isValidValue = type === "string" || Array.isArray( value );

		if ( typeof stateVal === "boolean" && isValidValue ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( isFunction( value ) ) {
			return this.each( function( i ) {
				jQuery( this ).toggleClass(
					value.call( this, i, getClass( this ), stateVal ),
					stateVal
				);
			} );
		}

		return this.each( function() {
			var className, i, self, classNames;

			if ( isValidValue ) {

				// Toggle individual class names
				i = 0;
				self = jQuery( this );
				classNames = classesToArray( value );

				while ( ( className = classNames[ i++ ] ) ) {

					// Check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( value === undefined || type === "boolean" ) {
				className = getClass( this );
				if ( className ) {

					// Store className if set
					dataPriv.set( this, "__className__", className );
				}

				// If the element has a class name or if we're passed `false`,
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				if ( this.setAttribute ) {
					this.setAttribute( "class",
						className || value === false ?
						"" :
						dataPriv.get( this, "__className__" ) || ""
					);
				}
			}
		} );
	},

	hasClass: function( selector ) {
		var className, elem,
			i = 0;

		className = " " + selector + " ";
		while ( ( elem = this[ i++ ] ) ) {
			if ( elem.nodeType === 1 &&
				( " " + stripAndCollapse( getClass( elem ) ) + " " ).indexOf( className ) > -1 ) {
					return true;
			}
		}

		return false;
	}
} );




var rreturn = /\r/g;

jQuery.fn.extend( {
	val: function( value ) {
		var hooks, ret, valueIsFunction,
			elem = this[ 0 ];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] ||
					jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks &&
					"get" in hooks &&
					( ret = hooks.get( elem, "value" ) ) !== undefined
				) {
					return ret;
				}

				ret = elem.value;

				// Handle most common string cases
				if ( typeof ret === "string" ) {
					return ret.replace( rreturn, "" );
				}

				// Handle cases where value is null/undef or number
				return ret == null ? "" : ret;
			}

			return;
		}

		valueIsFunction = isFunction( value );

		return this.each( function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( valueIsFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";

			} else if ( typeof val === "number" ) {
				val += "";

			} else if ( Array.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				} );
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		} );
	}
} );

jQuery.extend( {
	valHooks: {
		option: {
			get: function( elem ) {

				var val = jQuery.find.attr( elem, "value" );
				return val != null ?
					val :

					// Support: IE <=10 - 11 only
					// option.text throws exceptions (#14686, #14858)
					// Strip and collapse whitespace
					// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
					stripAndCollapse( jQuery.text( elem ) );
			}
		},
		select: {
			get: function( elem ) {
				var value, option, i,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one",
					values = one ? null : [],
					max = one ? index + 1 : options.length;

				if ( index < 0 ) {
					i = max;

				} else {
					i = one ? index : 0;
				}

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// Support: IE <=9 only
					// IE8-9 doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&

							// Don't return options that are disabled or in a disabled optgroup
							!option.disabled &&
							( !option.parentNode.disabled ||
								!nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];

					/* eslint-disable no-cond-assign */

					if ( option.selected =
						jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1
					) {
						optionSet = true;
					}

					/* eslint-enable no-cond-assign */
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	}
} );

// Radios and checkboxes getter/setter
jQuery.each( [ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( Array.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			return elem.getAttribute( "value" ) === null ? "on" : elem.value;
		};
	}
} );




// Return jQuery for attributes-only inclusion


support.focusin = "onfocusin" in window;


var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	stopPropagationCallback = function( e ) {
		e.stopPropagation();
	};

jQuery.extend( jQuery.event, {

	trigger: function( event, data, elem, onlyHandlers ) {

		var i, cur, tmp, bubbleType, ontype, handle, special, lastElement,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

		cur = lastElement = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "." ) > -1 ) {

			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split( "." );
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf( ":" ) < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join( "." );
		event.rnamespace = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === ( elem.ownerDocument || document ) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {
			lastElement = cur;
			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( dataPriv.get( cur, "events" ) || {} )[ event.type ] &&
				dataPriv.get( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( ( !special._default ||
				special._default.apply( eventPath.pop(), data ) === false ) &&
				acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name as the event.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && isFunction( elem[ type ] ) && !isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;

					if ( event.isPropagationStopped() ) {
						lastElement.addEventListener( type, stopPropagationCallback );
					}

					elem[ type ]();

					if ( event.isPropagationStopped() ) {
						lastElement.removeEventListener( type, stopPropagationCallback );
					}

					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	// Piggyback on a donor event to simulate a different one
	// Used only for `focus(in | out)` events
	simulate: function( type, elem, event ) {
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true
			}
		);

		jQuery.event.trigger( e, null, elem );
	}

} );

jQuery.fn.extend( {

	trigger: function( type, data ) {
		return this.each( function() {
			jQuery.event.trigger( type, data, this );
		} );
	},
	triggerHandler: function( type, data ) {
		var elem = this[ 0 ];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
} );


// Support: Firefox <=44
// Firefox doesn't have focus(in | out) events
// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
//
// Support: Chrome <=48 - 49, Safari <=9.0 - 9.1
// focus(in | out) events fire after focus & blur events,
// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
// Related ticket - https://bugs.chromium.org/p/chromium/issues/detail?id=449857
if ( !support.focusin ) {
	jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
			jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
		};

		jQuery.event.special[ fix ] = {
			setup: function() {
				var doc = this.ownerDocument || this,
					attaches = dataPriv.access( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				dataPriv.access( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this,
					attaches = dataPriv.access( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					dataPriv.remove( doc, fix );

				} else {
					dataPriv.access( doc, fix, attaches );
				}
			}
		};
	} );
}
var location = window.location;

var nonce = Date.now();

var rquery = ( /\?/ );



// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml;
	if ( !data || typeof data !== "string" ) {
		return null;
	}

	// Support: IE 9 - 11 only
	// IE throws on parseFromString with invalid input.
	try {
		xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
	} catch ( e ) {
		xml = undefined;
	}

	if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
};


var
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( Array.isArray( obj ) ) {

		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {

				// Treat each array item as a scalar.
				add( prefix, v );

			} else {

				// Item is non-scalar (array or object), encode its numeric index.
				buildParams(
					prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
					v,
					traditional,
					add
				);
			}
		} );

	} else if ( !traditional && toType( obj ) === "object" ) {

		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {

		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, valueOrFunction ) {

			// If value is a function, invoke it and use its return value
			var value = isFunction( valueOrFunction ) ?
				valueOrFunction() :
				valueOrFunction;

			s[ s.length ] = encodeURIComponent( key ) + "=" +
				encodeURIComponent( value == null ? "" : value );
		};

	if ( a == null ) {
		return "";
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( Array.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		} );

	} else {

		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" );
};

jQuery.fn.extend( {
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map( function() {

			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		} )
		.filter( function() {
			var type = this.type;

			// Use .is( ":disabled" ) so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		} )
		.map( function( i, elem ) {
			var val = jQuery( this ).val();

			if ( val == null ) {
				return null;
			}

			if ( Array.isArray( val ) ) {
				return jQuery.map( val, function( val ) {
					return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
				} );
			}

			return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		} ).get();
	}
} );


var
	r20 = /%20/g,
	rhash = /#.*$/,
	rantiCache = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,

	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat( "*" ),

	// Anchor tag for parsing the document origin
	originAnchor = document.createElement( "a" );
	originAnchor.href = location.href;

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnothtmlwhite ) || [];

		if ( isFunction( func ) ) {

			// For each dataType in the dataTypeExpression
			while ( ( dataType = dataTypes[ i++ ] ) ) {

				// Prepend if requested
				if ( dataType[ 0 ] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

				// Otherwise append
				} else {
					( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" &&
				!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		} );
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {

		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}

		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},

		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

			// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {

								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s.throws ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return {
								state: "parsererror",
								error: conv ? e : "No conversion from " + prev + " to " + current
							};
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend( {

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: location.href,
		type: "GET",
		isLocal: rlocalProtocol.test( location.protocol ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",

		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /\bxml\b/,
			html: /\bhtml/,
			json: /\bjson\b/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": JSON.parse,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var transport,

			// URL without anti-cache param
			cacheURL,

			// Response headers
			responseHeadersString,
			responseHeaders,

			// timeout handle
			timeoutTimer,

			// Url cleanup var
			urlAnchor,

			// Request state (becomes false upon send and true upon completion)
			completed,

			// To know if global events are to be dispatched
			fireGlobals,

			// Loop variable
			i,

			// uncached part of the url
			uncached,

			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),

			// Callbacks context
			callbackContext = s.context || s,

			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context &&
				( callbackContext.nodeType || callbackContext.jquery ) ?
					jQuery( callbackContext ) :
					jQuery.event,

			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),

			// Status-dependent callbacks
			statusCode = s.statusCode || {},

			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},

			// Default abort message
			strAbort = "canceled",

			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( completed ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[ 1 ].toLowerCase() + " " ] =
									( responseHeaders[ match[ 1 ].toLowerCase() + " " ] || [] )
										.concat( match[ 2 ] );
							}
						}
						match = responseHeaders[ key.toLowerCase() + " " ];
					}
					return match == null ? null : match.join( ", " );
				},

				// Raw string
				getAllResponseHeaders: function() {
					return completed ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					if ( completed == null ) {
						name = requestHeadersNames[ name.toLowerCase() ] =
							requestHeadersNames[ name.toLowerCase() ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( completed == null ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( completed ) {

							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						} else {

							// Lazy-add the new callbacks in a way that preserves old ones
							for ( code in map ) {
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR );

		// Add protocol if not provided (prefilters might expect it)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || location.href ) + "" )
			.replace( rprotocol, location.protocol + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = ( s.dataType || "*" ).toLowerCase().match( rnothtmlwhite ) || [ "" ];

		// A cross-domain request is in order when the origin doesn't match the current origin.
		if ( s.crossDomain == null ) {
			urlAnchor = document.createElement( "a" );

			// Support: IE <=8 - 11, Edge 12 - 15
			// IE throws exception on accessing the href property if url is malformed,
			// e.g. http://example.com:80x/
			try {
				urlAnchor.href = s.url;

				// Support: IE <=8 - 11 only
				// Anchor's host property isn't correctly set when s.url is relative
				urlAnchor.href = urlAnchor.href;
				s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
					urlAnchor.protocol + "//" + urlAnchor.host;
			} catch ( e ) {

				// If there is an error parsing the URL, assume it is crossDomain,
				// it can be rejected by the transport if it is invalid
				s.crossDomain = true;
			}
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( completed ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
		fireGlobals = jQuery.event && s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		// Remove hash to simplify url manipulation
		cacheURL = s.url.replace( rhash, "" );

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// Remember the hash so we can put it back
			uncached = s.url.slice( cacheURL.length );

			// If data is available and should be processed, append data to url
			if ( s.data && ( s.processData || typeof s.data === "string" ) ) {
				cacheURL += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data;

				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add or update anti-cache param if needed
			if ( s.cache === false ) {
				cacheURL = cacheURL.replace( rantiCache, "$1" );
				uncached = ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ( nonce++ ) + uncached;
			}

			// Put hash and anti-cache on the URL that will be requested (gh-1732)
			s.url = cacheURL + uncached;

		// Change '%20' to '+' if this is encoded form body content (gh-2658)
		} else if ( s.data && s.processData &&
			( s.contentType || "" ).indexOf( "application/x-www-form-urlencoded" ) === 0 ) {
			s.data = s.data.replace( r20, "+" );
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
				s.accepts[ s.dataTypes[ 0 ] ] +
					( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend &&
			( s.beforeSend.call( callbackContext, jqXHR, s ) === false || completed ) ) {

			// Abort if not done already and return
			return jqXHR.abort();
		}

		// Aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		completeDeferred.add( s.complete );
		jqXHR.done( s.success );
		jqXHR.fail( s.error );

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}

			// If request was aborted inside ajaxSend, stop there
			if ( completed ) {
				return jqXHR;
			}

			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = window.setTimeout( function() {
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				completed = false;
				transport.send( requestHeaders, done );
			} catch ( e ) {

				// Rethrow post-completion exceptions
				if ( completed ) {
					throw e;
				}

				// Propagate others as results
				done( -1, e );
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Ignore repeat invocations
			if ( completed ) {
				return;
			}

			completed = true;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				window.clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader( "Last-Modified" );
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader( "etag" );
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {

				// Extract error from statusText and normalize for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
} );

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {

		// Shift arguments if data argument was omitted
		if ( isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		// The url can be an options object (which then must have .url)
		return jQuery.ajax( jQuery.extend( {
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		}, jQuery.isPlainObject( url ) && url ) );
	};
} );


jQuery._evalUrl = function( url, options ) {
	return jQuery.ajax( {
		url: url,

		// Make this explicit, since user can override this through ajaxSetup (#11264)
		type: "GET",
		dataType: "script",
		cache: true,
		async: false,
		global: false,

		// Only evaluate the response if it is successful (gh-4126)
		// dataFilter is not invoked for failure responses, so using it instead
		// of the default converter is kludgy but it works.
		converters: {
			"text script": function() {}
		},
		dataFilter: function( response ) {
			jQuery.globalEval( response, options );
		}
	} );
};


jQuery.fn.extend( {
	wrapAll: function( html ) {
		var wrap;

		if ( this[ 0 ] ) {
			if ( isFunction( html ) ) {
				html = html.call( this[ 0 ] );
			}

			// The elements to wrap the target around
			wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map( function() {
				var elem = this;

				while ( elem.firstElementChild ) {
					elem = elem.firstElementChild;
				}

				return elem;
			} ).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapInner( html.call( this, i ) );
			} );
		}

		return this.each( function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		} );
	},

	wrap: function( html ) {
		var htmlIsFunction = isFunction( html );

		return this.each( function( i ) {
			jQuery( this ).wrapAll( htmlIsFunction ? html.call( this, i ) : html );
		} );
	},

	unwrap: function( selector ) {
		this.parent( selector ).not( "body" ).each( function() {
			jQuery( this ).replaceWith( this.childNodes );
		} );
		return this;
	}
} );


jQuery.expr.pseudos.hidden = function( elem ) {
	return !jQuery.expr.pseudos.visible( elem );
};
jQuery.expr.pseudos.visible = function( elem ) {
	return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
};




jQuery.ajaxSettings.xhr = function() {
	try {
		return new window.XMLHttpRequest();
	} catch ( e ) {}
};

var xhrSuccessStatus = {

		// File protocol always yields status code 0, assume 200
		0: 200,

		// Support: IE <=9 only
		// #1450: sometimes IE returns 1223 when it should be 204
		1223: 204
	},
	xhrSupported = jQuery.ajaxSettings.xhr();

support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
support.ajax = xhrSupported = !!xhrSupported;

jQuery.ajaxTransport( function( options ) {
	var callback, errorCallback;

	// Cross domain only allowed if supported through XMLHttpRequest
	if ( support.cors || xhrSupported && !options.crossDomain ) {
		return {
			send: function( headers, complete ) {
				var i,
					xhr = options.xhr();

				xhr.open(
					options.type,
					options.url,
					options.async,
					options.username,
					options.password
				);

				// Apply custom fields if provided
				if ( options.xhrFields ) {
					for ( i in options.xhrFields ) {
						xhr[ i ] = options.xhrFields[ i ];
					}
				}

				// Override mime type if needed
				if ( options.mimeType && xhr.overrideMimeType ) {
					xhr.overrideMimeType( options.mimeType );
				}

				// X-Requested-With header
				// For cross-domain requests, seeing as conditions for a preflight are
				// akin to a jigsaw puzzle, we simply never set it to be sure.
				// (it can always be set on a per-request basis or even using ajaxSetup)
				// For same-domain requests, won't change header if already provided.
				if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
					headers[ "X-Requested-With" ] = "XMLHttpRequest";
				}

				// Set headers
				for ( i in headers ) {
					xhr.setRequestHeader( i, headers[ i ] );
				}

				// Callback
				callback = function( type ) {
					return function() {
						if ( callback ) {
							callback = errorCallback = xhr.onload =
								xhr.onerror = xhr.onabort = xhr.ontimeout =
									xhr.onreadystatechange = null;

							if ( type === "abort" ) {
								xhr.abort();
							} else if ( type === "error" ) {

								// Support: IE <=9 only
								// On a manual native abort, IE9 throws
								// errors on any property access that is not readyState
								if ( typeof xhr.status !== "number" ) {
									complete( 0, "error" );
								} else {
									complete(

										// File: protocol always yields status 0; see #8605, #14207
										xhr.status,
										xhr.statusText
									);
								}
							} else {
								complete(
									xhrSuccessStatus[ xhr.status ] || xhr.status,
									xhr.statusText,

									// Support: IE <=9 only
									// IE9 has no XHR2 but throws on binary (trac-11426)
									// For XHR2 non-text, let the caller handle it (gh-2498)
									( xhr.responseType || "text" ) !== "text"  ||
									typeof xhr.responseText !== "string" ?
										{ binary: xhr.response } :
										{ text: xhr.responseText },
									xhr.getAllResponseHeaders()
								);
							}
						}
					};
				};

				// Listen to events
				xhr.onload = callback();
				errorCallback = xhr.onerror = xhr.ontimeout = callback( "error" );

				// Support: IE 9 only
				// Use onreadystatechange to replace onabort
				// to handle uncaught aborts
				if ( xhr.onabort !== undefined ) {
					xhr.onabort = errorCallback;
				} else {
					xhr.onreadystatechange = function() {

						// Check readyState before timeout as it changes
						if ( xhr.readyState === 4 ) {

							// Allow onerror to be called first,
							// but that will not handle a native abort
							// Also, save errorCallback to a variable
							// as xhr.onerror cannot be accessed
							window.setTimeout( function() {
								if ( callback ) {
									errorCallback();
								}
							} );
						}
					};
				}

				// Create the abort callback
				callback = callback( "abort" );

				try {

					// Do send the request (this may raise an exception)
					xhr.send( options.hasContent && options.data || null );
				} catch ( e ) {

					// #14683: Only rethrow if this hasn't been notified as an error yet
					if ( callback ) {
						throw e;
					}
				}
			},

			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




// Prevent auto-execution of scripts when no explicit dataType was provided (See gh-2432)
jQuery.ajaxPrefilter( function( s ) {
	if ( s.crossDomain ) {
		s.contents.script = false;
	}
} );

// Install script dataType
jQuery.ajaxSetup( {
	accepts: {
		script: "text/javascript, application/javascript, " +
			"application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /\b(?:java|ecma)script\b/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
} );

// Handle cache's special case and crossDomain
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
	}
} );

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {

	// This transport only deals with cross domain or forced-by-attrs requests
	if ( s.crossDomain || s.scriptAttrs ) {
		var script, callback;
		return {
			send: function( _, complete ) {
				script = jQuery( "<script>" )
					.attr( s.scriptAttrs || {} )
					.prop( { charset: s.scriptCharset, src: s.url } )
					.on( "load error", callback = function( evt ) {
						script.remove();
						callback = null;
						if ( evt ) {
							complete( evt.type === "error" ? 404 : 200, evt.type );
						}
					} );

				// Use native DOM manipulation to avoid our domManip AJAX trickery
				document.head.appendChild( script[ 0 ] );
			},
			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup( {
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
} );

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" &&
				( s.contentType || "" )
					.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
				rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters[ "script json" ] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// Force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always( function() {

			// If previous value didn't exist - remove it
			if ( overwritten === undefined ) {
				jQuery( window ).removeProp( callbackName );

			// Otherwise restore preexisting value
			} else {
				window[ callbackName ] = overwritten;
			}

			// Save back as free
			if ( s[ callbackName ] ) {

				// Make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// Save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		} );

		// Delegate to script
		return "script";
	}
} );




// Support: Safari 8 only
// In Safari 8 documents created via document.implementation.createHTMLDocument
// collapse sibling forms: the second one becomes a child of the first one.
// Because of that, this security measure has to be disabled in Safari 8.
// https://bugs.webkit.org/show_bug.cgi?id=137337
support.createHTMLDocument = ( function() {
	var body = document.implementation.createHTMLDocument( "" ).body;
	body.innerHTML = "<form></form><form></form>";
	return body.childNodes.length === 2;
} )();


// Argument "data" should be string of html
// context (optional): If specified, the fragment will be created in this context,
// defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( typeof data !== "string" ) {
		return [];
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}

	var base, parsed, scripts;

	if ( !context ) {

		// Stop scripts or inline event handlers from being executed immediately
		// by using document.implementation
		if ( support.createHTMLDocument ) {
			context = document.implementation.createHTMLDocument( "" );

			// Set the base href for the created document
			// so any parsed elements with URLs
			// are based on the document's URL (gh-2965)
			base = context.createElement( "base" );
			base.href = document.location.href;
			context.head.appendChild( base );
		} else {
			context = document;
		}
	}

	parsed = rsingleTag.exec( data );
	scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[ 1 ] ) ];
	}

	parsed = buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	var selector, type, response,
		self = this,
		off = url.indexOf( " " );

	if ( off > -1 ) {
		selector = stripAndCollapse( url.slice( off ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax( {
			url: url,

			// If "type" variable is undefined, then "GET" method will be used.
			// Make value of this field explicit since
			// user can override it through ajaxSetup method
			type: type || "GET",
			dataType: "html",
			data: params
		} ).done( function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		// If the request succeeds, this function gets "data", "status", "jqXHR"
		// but they are ignored because response was set above.
		// If it fails, this function gets "jqXHR", "status", "error"
		} ).always( callback && function( jqXHR, status ) {
			self.each( function() {
				callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
			} );
		} );
	}

	return this;
};




// Attach a bunch of functions for handling common AJAX events
jQuery.each( [
	"ajaxStart",
	"ajaxStop",
	"ajaxComplete",
	"ajaxError",
	"ajaxSuccess",
	"ajaxSend"
], function( i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
} );




jQuery.expr.pseudos.animated = function( elem ) {
	return jQuery.grep( jQuery.timers, function( fn ) {
		return elem === fn.elem;
	} ).length;
};




jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// Set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;

		// Need to be able to calculate position if either
		// top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;

		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( isFunction( options ) ) {

			// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
			options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );

		} else {
			curElem.css( props );
		}
	}
};

jQuery.fn.extend( {

	// offset() relates an element's border box to the document origin
	offset: function( options ) {

		// Preserve chaining for setter
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each( function( i ) {
					jQuery.offset.setOffset( this, options, i );
				} );
		}

		var rect, win,
			elem = this[ 0 ];

		if ( !elem ) {
			return;
		}

		// Return zeros for disconnected and hidden (display: none) elements (gh-2310)
		// Support: IE <=11 only
		// Running getBoundingClientRect on a
		// disconnected node in IE throws an error
		if ( !elem.getClientRects().length ) {
			return { top: 0, left: 0 };
		}

		// Get document-relative position by adding viewport scroll to viewport-relative gBCR
		rect = elem.getBoundingClientRect();
		win = elem.ownerDocument.defaultView;
		return {
			top: rect.top + win.pageYOffset,
			left: rect.left + win.pageXOffset
		};
	},

	// position() relates an element's margin box to its offset parent's padding box
	// This corresponds to the behavior of CSS absolute positioning
	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset, doc,
			elem = this[ 0 ],
			parentOffset = { top: 0, left: 0 };

		// position:fixed elements are offset from the viewport, which itself always has zero offset
		if ( jQuery.css( elem, "position" ) === "fixed" ) {

			// Assume position:fixed implies availability of getBoundingClientRect
			offset = elem.getBoundingClientRect();

		} else {
			offset = this.offset();

			// Account for the *real* offset parent, which can be the document or its root element
			// when a statically positioned element is identified
			doc = elem.ownerDocument;
			offsetParent = elem.offsetParent || doc.documentElement;
			while ( offsetParent &&
				( offsetParent === doc.body || offsetParent === doc.documentElement ) &&
				jQuery.css( offsetParent, "position" ) === "static" ) {

				offsetParent = offsetParent.parentNode;
			}
			if ( offsetParent && offsetParent !== elem && offsetParent.nodeType === 1 ) {

				// Incorporate borders into its offset, since they are outside its content origin
				parentOffset = jQuery( offsetParent ).offset();
				parentOffset.top += jQuery.css( offsetParent, "borderTopWidth", true );
				parentOffset.left += jQuery.css( offsetParent, "borderLeftWidth", true );
			}
		}

		// Subtract parent offsets and element margins
		return {
			top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	// This method will return documentElement in the following cases:
	// 1) For the element inside the iframe without offsetParent, this method will return
	//    documentElement of the parent window
	// 2) For the hidden or detached element
	// 3) For body or html element, i.e. in case of the html node - it will return itself
	//
	// but those exceptions were never presented as a real life use-cases
	// and might be considered as more preferable results.
	//
	// This logic, however, is not guaranteed and can change at any point in the future
	offsetParent: function() {
		return this.map( function() {
			var offsetParent = this.offsetParent;

			while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
				offsetParent = offsetParent.offsetParent;
			}

			return offsetParent || documentElement;
		} );
	}
} );

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = "pageYOffset" === prop;

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {

			// Coalesce documents and windows
			var win;
			if ( isWindow( elem ) ) {
				win = elem;
			} else if ( elem.nodeType === 9 ) {
				win = elem.defaultView;
			}

			if ( val === undefined ) {
				return win ? win[ prop ] : elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : win.pageXOffset,
					top ? val : win.pageYOffset
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length );
	};
} );

// Support: Safari <=7 - 9.1, Chrome <=37 - 49
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// Blink bug: https://bugs.chromium.org/p/chromium/issues/detail?id=589347
// getComputedStyle returns percent when specified for top/left/bottom/right;
// rather than make the css module depend on the offset module, just check for it here
jQuery.each( [ "top", "left" ], function( i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );

				// If curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
} );


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
		function( defaultExtra, funcName ) {

		// Margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( isWindow( elem ) ) {

					// $( window ).outerWidth/Height return w/h including scrollbars (gh-1729)
					return funcName.indexOf( "outer" ) === 0 ?
						elem[ "inner" + name ] :
						elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?

					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable );
		};
	} );
} );


jQuery.each( ( "blur focus focusin focusout resize scroll click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup contextmenu" ).split( " " ),
	function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
} );

jQuery.fn.extend( {
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
} );




jQuery.fn.extend( {

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {

		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ?
			this.off( selector, "**" ) :
			this.off( types, selector || "**", fn );
	}
} );

// Bind a function to a context, optionally partially applying any
// arguments.
// jQuery.proxy is deprecated to promote standards (specifically Function#bind)
// However, it is not slated for removal any time soon
jQuery.proxy = function( fn, context ) {
	var tmp, args, proxy;

	if ( typeof context === "string" ) {
		tmp = fn[ context ];
		context = fn;
		fn = tmp;
	}

	// Quick check to determine if target is callable, in the spec
	// this throws a TypeError, but we will just return undefined.
	if ( !isFunction( fn ) ) {
		return undefined;
	}

	// Simulated bind
	args = slice.call( arguments, 2 );
	proxy = function() {
		return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
	};

	// Set the guid of unique handler to the same of original handler, so it can be removed
	proxy.guid = fn.guid = fn.guid || jQuery.guid++;

	return proxy;
};

jQuery.holdReady = function( hold ) {
	if ( hold ) {
		jQuery.readyWait++;
	} else {
		jQuery.ready( true );
	}
};
jQuery.isArray = Array.isArray;
jQuery.parseJSON = JSON.parse;
jQuery.nodeName = nodeName;
jQuery.isFunction = isFunction;
jQuery.isWindow = isWindow;
jQuery.camelCase = camelCase;
jQuery.type = toType;

jQuery.now = Date.now;

jQuery.isNumeric = function( obj ) {

	// As of jQuery 3.0, isNumeric is limited to
	// strings and numbers (primitives or objects)
	// that can be coerced to finite numbers (gh-2662)
	var type = jQuery.type( obj );
	return ( type === "number" || type === "string" ) &&

		// parseFloat NaNs numeric-cast false positives ("")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		!isNaN( obj - parseFloat( obj ) );
};




// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( typeof define === "function" && define.amd ) {
	define( "jquery", [], function() {
		return jQuery;
	} );
}




var

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in AMD
// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( !noGlobal ) {
	window.jQuery = window.$ = jQuery;
}




return jQuery;
} );

;/*!
  * Bootstrap v4.3.1 (https://getbootstrap.com/)
  * Copyright 2011-2019 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('jquery'), require('popper.js')) :
  typeof define === 'function' && define.amd ? define(['exports', 'jquery', 'popper.js'], factory) :
  (global = global || self, factory(global.bootstrap = {}, global.jQuery, global.Popper));
}(this, function (exports, $, Popper) { 'use strict';

  $ = $ && $.hasOwnProperty('default') ? $['default'] : $;
  Popper = Popper && Popper.hasOwnProperty('default') ? Popper['default'] : Popper;

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v4.3.1): util.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
   * --------------------------------------------------------------------------
   */
  /**
   * ------------------------------------------------------------------------
   * Private TransitionEnd Helpers
   * ------------------------------------------------------------------------
   */

  var TRANSITION_END = 'transitionend';
  var MAX_UID = 1000000;
  var MILLISECONDS_MULTIPLIER = 1000; // Shoutout AngusCroll (https://goo.gl/pxwQGp)

  function toType(obj) {
    return {}.toString.call(obj).match(/\s([a-z]+)/i)[1].toLowerCase();
  }

  function getSpecialTransitionEndEvent() {
    return {
      bindType: TRANSITION_END,
      delegateType: TRANSITION_END,
      handle: function handle(event) {
        if ($(event.target).is(this)) {
          return event.handleObj.handler.apply(this, arguments); // eslint-disable-line prefer-rest-params
        }

        return undefined; // eslint-disable-line no-undefined
      }
    };
  }

  function transitionEndEmulator(duration) {
    var _this = this;

    var called = false;
    $(this).one(Util.TRANSITION_END, function () {
      called = true;
    });
    setTimeout(function () {
      if (!called) {
        Util.triggerTransitionEnd(_this);
      }
    }, duration);
    return this;
  }

  function setTransitionEndSupport() {
    $.fn.emulateTransitionEnd = transitionEndEmulator;
    $.event.special[Util.TRANSITION_END] = getSpecialTransitionEndEvent();
  }
  /**
   * --------------------------------------------------------------------------
   * Public Util Api
   * --------------------------------------------------------------------------
   */


  var Util = {
    TRANSITION_END: 'bsTransitionEnd',
    getUID: function getUID(prefix) {
      do {
        // eslint-disable-next-line no-bitwise
        prefix += ~~(Math.random() * MAX_UID); // "~~" acts like a faster Math.floor() here
      } while (document.getElementById(prefix));

      return prefix;
    },
    getSelectorFromElement: function getSelectorFromElement(element) {
      var selector = element.getAttribute('data-target');

      if (!selector || selector === '#') {
        var hrefAttr = element.getAttribute('href');
        selector = hrefAttr && hrefAttr !== '#' ? hrefAttr.trim() : '';
      }

      try {
        return document.querySelector(selector) ? selector : null;
      } catch (err) {
        return null;
      }
    },
    getTransitionDurationFromElement: function getTransitionDurationFromElement(element) {
      if (!element) {
        return 0;
      } // Get transition-duration of the element


      var transitionDuration = $(element).css('transition-duration');
      var transitionDelay = $(element).css('transition-delay');
      var floatTransitionDuration = parseFloat(transitionDuration);
      var floatTransitionDelay = parseFloat(transitionDelay); // Return 0 if element or transition duration is not found

      if (!floatTransitionDuration && !floatTransitionDelay) {
        return 0;
      } // If multiple durations are defined, take the first


      transitionDuration = transitionDuration.split(',')[0];
      transitionDelay = transitionDelay.split(',')[0];
      return (parseFloat(transitionDuration) + parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLIER;
    },
    reflow: function reflow(element) {
      return element.offsetHeight;
    },
    triggerTransitionEnd: function triggerTransitionEnd(element) {
      $(element).trigger(TRANSITION_END);
    },
    // TODO: Remove in v5
    supportsTransitionEnd: function supportsTransitionEnd() {
      return Boolean(TRANSITION_END);
    },
    isElement: function isElement(obj) {
      return (obj[0] || obj).nodeType;
    },
    typeCheckConfig: function typeCheckConfig(componentName, config, configTypes) {
      for (var property in configTypes) {
        if (Object.prototype.hasOwnProperty.call(configTypes, property)) {
          var expectedTypes = configTypes[property];
          var value = config[property];
          var valueType = value && Util.isElement(value) ? 'element' : toType(value);

          if (!new RegExp(expectedTypes).test(valueType)) {
            throw new Error(componentName.toUpperCase() + ": " + ("Option \"" + property + "\" provided type \"" + valueType + "\" ") + ("but expected type \"" + expectedTypes + "\"."));
          }
        }
      }
    },
    findShadowRoot: function findShadowRoot(element) {
      if (!document.documentElement.attachShadow) {
        return null;
      } // Can find the shadow root otherwise it'll return the document


      if (typeof element.getRootNode === 'function') {
        var root = element.getRootNode();
        return root instanceof ShadowRoot ? root : null;
      }

      if (element instanceof ShadowRoot) {
        return element;
      } // when we don't find a shadow root


      if (!element.parentNode) {
        return null;
      }

      return Util.findShadowRoot(element.parentNode);
    }
  };
  setTransitionEndSupport();

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME = 'alert';
  var VERSION = '4.3.1';
  var DATA_KEY = 'bs.alert';
  var EVENT_KEY = "." + DATA_KEY;
  var DATA_API_KEY = '.data-api';
  var JQUERY_NO_CONFLICT = $.fn[NAME];
  var Selector = {
    DISMISS: '[data-dismiss="alert"]'
  };
  var Event = {
    CLOSE: "close" + EVENT_KEY,
    CLOSED: "closed" + EVENT_KEY,
    CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY
  };
  var ClassName = {
    ALERT: 'alert',
    FADE: 'fade',
    SHOW: 'show'
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };

  var Alert =
  /*#__PURE__*/
  function () {
    function Alert(element) {
      this._element = element;
    } // Getters


    var _proto = Alert.prototype;

    // Public
    _proto.close = function close(element) {
      var rootElement = this._element;

      if (element) {
        rootElement = this._getRootElement(element);
      }

      var customEvent = this._triggerCloseEvent(rootElement);

      if (customEvent.isDefaultPrevented()) {
        return;
      }

      this._removeElement(rootElement);
    };

    _proto.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY);
      this._element = null;
    } // Private
    ;

    _proto._getRootElement = function _getRootElement(element) {
      var selector = Util.getSelectorFromElement(element);
      var parent = false;

      if (selector) {
        parent = document.querySelector(selector);
      }

      if (!parent) {
        parent = $(element).closest("." + ClassName.ALERT)[0];
      }

      return parent;
    };

    _proto._triggerCloseEvent = function _triggerCloseEvent(element) {
      var closeEvent = $.Event(Event.CLOSE);
      $(element).trigger(closeEvent);
      return closeEvent;
    };

    _proto._removeElement = function _removeElement(element) {
      var _this = this;

      $(element).removeClass(ClassName.SHOW);

      if (!$(element).hasClass(ClassName.FADE)) {
        this._destroyElement(element);

        return;
      }

      var transitionDuration = Util.getTransitionDurationFromElement(element);
      $(element).one(Util.TRANSITION_END, function (event) {
        return _this._destroyElement(element, event);
      }).emulateTransitionEnd(transitionDuration);
    };

    _proto._destroyElement = function _destroyElement(element) {
      $(element).detach().trigger(Event.CLOSED).remove();
    } // Static
    ;

    Alert._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var $element = $(this);
        var data = $element.data(DATA_KEY);

        if (!data) {
          data = new Alert(this);
          $element.data(DATA_KEY, data);
        }

        if (config === 'close') {
          data[config](this);
        }
      });
    };

    Alert._handleDismiss = function _handleDismiss(alertInstance) {
      return function (event) {
        if (event) {
          event.preventDefault();
        }

        alertInstance.close(this);
      };
    };

    _createClass(Alert, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION;
      }
    }]);

    return Alert;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  $(document).on(Event.CLICK_DATA_API, Selector.DISMISS, Alert._handleDismiss(new Alert()));
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME] = Alert._jQueryInterface;
  $.fn[NAME].Constructor = Alert;

  $.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return Alert._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$1 = 'button';
  var VERSION$1 = '4.3.1';
  var DATA_KEY$1 = 'bs.button';
  var EVENT_KEY$1 = "." + DATA_KEY$1;
  var DATA_API_KEY$1 = '.data-api';
  var JQUERY_NO_CONFLICT$1 = $.fn[NAME$1];
  var ClassName$1 = {
    ACTIVE: 'active',
    BUTTON: 'btn',
    FOCUS: 'focus'
  };
  var Selector$1 = {
    DATA_TOGGLE_CARROT: '[data-toggle^="button"]',
    DATA_TOGGLE: '[data-toggle="buttons"]',
    INPUT: 'input:not([type="hidden"])',
    ACTIVE: '.active',
    BUTTON: '.btn'
  };
  var Event$1 = {
    CLICK_DATA_API: "click" + EVENT_KEY$1 + DATA_API_KEY$1,
    FOCUS_BLUR_DATA_API: "focus" + EVENT_KEY$1 + DATA_API_KEY$1 + " " + ("blur" + EVENT_KEY$1 + DATA_API_KEY$1)
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };

  var Button =
  /*#__PURE__*/
  function () {
    function Button(element) {
      this._element = element;
    } // Getters


    var _proto = Button.prototype;

    // Public
    _proto.toggle = function toggle() {
      var triggerChangeEvent = true;
      var addAriaPressed = true;
      var rootElement = $(this._element).closest(Selector$1.DATA_TOGGLE)[0];

      if (rootElement) {
        var input = this._element.querySelector(Selector$1.INPUT);

        if (input) {
          if (input.type === 'radio') {
            if (input.checked && this._element.classList.contains(ClassName$1.ACTIVE)) {
              triggerChangeEvent = false;
            } else {
              var activeElement = rootElement.querySelector(Selector$1.ACTIVE);

              if (activeElement) {
                $(activeElement).removeClass(ClassName$1.ACTIVE);
              }
            }
          }

          if (triggerChangeEvent) {
            if (input.hasAttribute('disabled') || rootElement.hasAttribute('disabled') || input.classList.contains('disabled') || rootElement.classList.contains('disabled')) {
              return;
            }

            input.checked = !this._element.classList.contains(ClassName$1.ACTIVE);
            $(input).trigger('change');
          }

          input.focus();
          addAriaPressed = false;
        }
      }

      if (addAriaPressed) {
        this._element.setAttribute('aria-pressed', !this._element.classList.contains(ClassName$1.ACTIVE));
      }

      if (triggerChangeEvent) {
        $(this._element).toggleClass(ClassName$1.ACTIVE);
      }
    };

    _proto.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY$1);
      this._element = null;
    } // Static
    ;

    Button._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY$1);

        if (!data) {
          data = new Button(this);
          $(this).data(DATA_KEY$1, data);
        }

        if (config === 'toggle') {
          data[config]();
        }
      });
    };

    _createClass(Button, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION$1;
      }
    }]);

    return Button;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  $(document).on(Event$1.CLICK_DATA_API, Selector$1.DATA_TOGGLE_CARROT, function (event) {
    event.preventDefault();
    var button = event.target;

    if (!$(button).hasClass(ClassName$1.BUTTON)) {
      button = $(button).closest(Selector$1.BUTTON);
    }

    Button._jQueryInterface.call($(button), 'toggle');
  }).on(Event$1.FOCUS_BLUR_DATA_API, Selector$1.DATA_TOGGLE_CARROT, function (event) {
    var button = $(event.target).closest(Selector$1.BUTTON)[0];
    $(button).toggleClass(ClassName$1.FOCUS, /^focus(in)?$/.test(event.type));
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$1] = Button._jQueryInterface;
  $.fn[NAME$1].Constructor = Button;

  $.fn[NAME$1].noConflict = function () {
    $.fn[NAME$1] = JQUERY_NO_CONFLICT$1;
    return Button._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$2 = 'carousel';
  var VERSION$2 = '4.3.1';
  var DATA_KEY$2 = 'bs.carousel';
  var EVENT_KEY$2 = "." + DATA_KEY$2;
  var DATA_API_KEY$2 = '.data-api';
  var JQUERY_NO_CONFLICT$2 = $.fn[NAME$2];
  var ARROW_LEFT_KEYCODE = 37; // KeyboardEvent.which value for left arrow key

  var ARROW_RIGHT_KEYCODE = 39; // KeyboardEvent.which value for right arrow key

  var TOUCHEVENT_COMPAT_WAIT = 500; // Time for mouse compat events to fire after touch

  var SWIPE_THRESHOLD = 40;
  var Default = {
    interval: 5000,
    keyboard: true,
    slide: false,
    pause: 'hover',
    wrap: true,
    touch: true
  };
  var DefaultType = {
    interval: '(number|boolean)',
    keyboard: 'boolean',
    slide: '(boolean|string)',
    pause: '(string|boolean)',
    wrap: 'boolean',
    touch: 'boolean'
  };
  var Direction = {
    NEXT: 'next',
    PREV: 'prev',
    LEFT: 'left',
    RIGHT: 'right'
  };
  var Event$2 = {
    SLIDE: "slide" + EVENT_KEY$2,
    SLID: "slid" + EVENT_KEY$2,
    KEYDOWN: "keydown" + EVENT_KEY$2,
    MOUSEENTER: "mouseenter" + EVENT_KEY$2,
    MOUSELEAVE: "mouseleave" + EVENT_KEY$2,
    TOUCHSTART: "touchstart" + EVENT_KEY$2,
    TOUCHMOVE: "touchmove" + EVENT_KEY$2,
    TOUCHEND: "touchend" + EVENT_KEY$2,
    POINTERDOWN: "pointerdown" + EVENT_KEY$2,
    POINTERUP: "pointerup" + EVENT_KEY$2,
    DRAG_START: "dragstart" + EVENT_KEY$2,
    LOAD_DATA_API: "load" + EVENT_KEY$2 + DATA_API_KEY$2,
    CLICK_DATA_API: "click" + EVENT_KEY$2 + DATA_API_KEY$2
  };
  var ClassName$2 = {
    CAROUSEL: 'carousel',
    ACTIVE: 'active',
    SLIDE: 'slide',
    RIGHT: 'carousel-item-right',
    LEFT: 'carousel-item-left',
    NEXT: 'carousel-item-next',
    PREV: 'carousel-item-prev',
    ITEM: 'carousel-item',
    POINTER_EVENT: 'pointer-event'
  };
  var Selector$2 = {
    ACTIVE: '.active',
    ACTIVE_ITEM: '.active.carousel-item',
    ITEM: '.carousel-item',
    ITEM_IMG: '.carousel-item img',
    NEXT_PREV: '.carousel-item-next, .carousel-item-prev',
    INDICATORS: '.carousel-indicators',
    DATA_SLIDE: '[data-slide], [data-slide-to]',
    DATA_RIDE: '[data-ride="carousel"]'
  };
  var PointerType = {
    TOUCH: 'touch',
    PEN: 'pen'
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };

  var Carousel =
  /*#__PURE__*/
  function () {
    function Carousel(element, config) {
      this._items = null;
      this._interval = null;
      this._activeElement = null;
      this._isPaused = false;
      this._isSliding = false;
      this.touchTimeout = null;
      this.touchStartX = 0;
      this.touchDeltaX = 0;
      this._config = this._getConfig(config);
      this._element = element;
      this._indicatorsElement = this._element.querySelector(Selector$2.INDICATORS);
      this._touchSupported = 'ontouchstart' in document.documentElement || navigator.maxTouchPoints > 0;
      this._pointerEvent = Boolean(window.PointerEvent || window.MSPointerEvent);

      this._addEventListeners();
    } // Getters


    var _proto = Carousel.prototype;

    // Public
    _proto.next = function next() {
      if (!this._isSliding) {
        this._slide(Direction.NEXT);
      }
    };

    _proto.nextWhenVisible = function nextWhenVisible() {
      // Don't call next when the page isn't visible
      // or the carousel or its parent isn't visible
      if (!document.hidden && $(this._element).is(':visible') && $(this._element).css('visibility') !== 'hidden') {
        this.next();
      }
    };

    _proto.prev = function prev() {
      if (!this._isSliding) {
        this._slide(Direction.PREV);
      }
    };

    _proto.pause = function pause(event) {
      if (!event) {
        this._isPaused = true;
      }

      if (this._element.querySelector(Selector$2.NEXT_PREV)) {
        Util.triggerTransitionEnd(this._element);
        this.cycle(true);
      }

      clearInterval(this._interval);
      this._interval = null;
    };

    _proto.cycle = function cycle(event) {
      if (!event) {
        this._isPaused = false;
      }

      if (this._interval) {
        clearInterval(this._interval);
        this._interval = null;
      }

      if (this._config.interval && !this._isPaused) {
        this._interval = setInterval((document.visibilityState ? this.nextWhenVisible : this.next).bind(this), this._config.interval);
      }
    };

    _proto.to = function to(index) {
      var _this = this;

      this._activeElement = this._element.querySelector(Selector$2.ACTIVE_ITEM);

      var activeIndex = this._getItemIndex(this._activeElement);

      if (index > this._items.length - 1 || index < 0) {
        return;
      }

      if (this._isSliding) {
        $(this._element).one(Event$2.SLID, function () {
          return _this.to(index);
        });
        return;
      }

      if (activeIndex === index) {
        this.pause();
        this.cycle();
        return;
      }

      var direction = index > activeIndex ? Direction.NEXT : Direction.PREV;

      this._slide(direction, this._items[index]);
    };

    _proto.dispose = function dispose() {
      $(this._element).off(EVENT_KEY$2);
      $.removeData(this._element, DATA_KEY$2);
      this._items = null;
      this._config = null;
      this._element = null;
      this._interval = null;
      this._isPaused = null;
      this._isSliding = null;
      this._activeElement = null;
      this._indicatorsElement = null;
    } // Private
    ;

    _proto._getConfig = function _getConfig(config) {
      config = _objectSpread({}, Default, config);
      Util.typeCheckConfig(NAME$2, config, DefaultType);
      return config;
    };

    _proto._handleSwipe = function _handleSwipe() {
      var absDeltax = Math.abs(this.touchDeltaX);

      if (absDeltax <= SWIPE_THRESHOLD) {
        return;
      }

      var direction = absDeltax / this.touchDeltaX; // swipe left

      if (direction > 0) {
        this.prev();
      } // swipe right


      if (direction < 0) {
        this.next();
      }
    };

    _proto._addEventListeners = function _addEventListeners() {
      var _this2 = this;

      if (this._config.keyboard) {
        $(this._element).on(Event$2.KEYDOWN, function (event) {
          return _this2._keydown(event);
        });
      }

      if (this._config.pause === 'hover') {
        $(this._element).on(Event$2.MOUSEENTER, function (event) {
          return _this2.pause(event);
        }).on(Event$2.MOUSELEAVE, function (event) {
          return _this2.cycle(event);
        });
      }

      if (this._config.touch) {
        this._addTouchEventListeners();
      }
    };

    _proto._addTouchEventListeners = function _addTouchEventListeners() {
      var _this3 = this;

      if (!this._touchSupported) {
        return;
      }

      var start = function start(event) {
        if (_this3._pointerEvent && PointerType[event.originalEvent.pointerType.toUpperCase()]) {
          _this3.touchStartX = event.originalEvent.clientX;
        } else if (!_this3._pointerEvent) {
          _this3.touchStartX = event.originalEvent.touches[0].clientX;
        }
      };

      var move = function move(event) {
        // ensure swiping with one touch and not pinching
        if (event.originalEvent.touches && event.originalEvent.touches.length > 1) {
          _this3.touchDeltaX = 0;
        } else {
          _this3.touchDeltaX = event.originalEvent.touches[0].clientX - _this3.touchStartX;
        }
      };

      var end = function end(event) {
        if (_this3._pointerEvent && PointerType[event.originalEvent.pointerType.toUpperCase()]) {
          _this3.touchDeltaX = event.originalEvent.clientX - _this3.touchStartX;
        }

        _this3._handleSwipe();

        if (_this3._config.pause === 'hover') {
          // If it's a touch-enabled device, mouseenter/leave are fired as
          // part of the mouse compatibility events on first tap - the carousel
          // would stop cycling until user tapped out of it;
          // here, we listen for touchend, explicitly pause the carousel
          // (as if it's the second time we tap on it, mouseenter compat event
          // is NOT fired) and after a timeout (to allow for mouse compatibility
          // events to fire) we explicitly restart cycling
          _this3.pause();

          if (_this3.touchTimeout) {
            clearTimeout(_this3.touchTimeout);
          }

          _this3.touchTimeout = setTimeout(function (event) {
            return _this3.cycle(event);
          }, TOUCHEVENT_COMPAT_WAIT + _this3._config.interval);
        }
      };

      $(this._element.querySelectorAll(Selector$2.ITEM_IMG)).on(Event$2.DRAG_START, function (e) {
        return e.preventDefault();
      });

      if (this._pointerEvent) {
        $(this._element).on(Event$2.POINTERDOWN, function (event) {
          return start(event);
        });
        $(this._element).on(Event$2.POINTERUP, function (event) {
          return end(event);
        });

        this._element.classList.add(ClassName$2.POINTER_EVENT);
      } else {
        $(this._element).on(Event$2.TOUCHSTART, function (event) {
          return start(event);
        });
        $(this._element).on(Event$2.TOUCHMOVE, function (event) {
          return move(event);
        });
        $(this._element).on(Event$2.TOUCHEND, function (event) {
          return end(event);
        });
      }
    };

    _proto._keydown = function _keydown(event) {
      if (/input|textarea/i.test(event.target.tagName)) {
        return;
      }

      switch (event.which) {
        case ARROW_LEFT_KEYCODE:
          event.preventDefault();
          this.prev();
          break;

        case ARROW_RIGHT_KEYCODE:
          event.preventDefault();
          this.next();
          break;

        default:
      }
    };

    _proto._getItemIndex = function _getItemIndex(element) {
      this._items = element && element.parentNode ? [].slice.call(element.parentNode.querySelectorAll(Selector$2.ITEM)) : [];
      return this._items.indexOf(element);
    };

    _proto._getItemByDirection = function _getItemByDirection(direction, activeElement) {
      var isNextDirection = direction === Direction.NEXT;
      var isPrevDirection = direction === Direction.PREV;

      var activeIndex = this._getItemIndex(activeElement);

      var lastItemIndex = this._items.length - 1;
      var isGoingToWrap = isPrevDirection && activeIndex === 0 || isNextDirection && activeIndex === lastItemIndex;

      if (isGoingToWrap && !this._config.wrap) {
        return activeElement;
      }

      var delta = direction === Direction.PREV ? -1 : 1;
      var itemIndex = (activeIndex + delta) % this._items.length;
      return itemIndex === -1 ? this._items[this._items.length - 1] : this._items[itemIndex];
    };

    _proto._triggerSlideEvent = function _triggerSlideEvent(relatedTarget, eventDirectionName) {
      var targetIndex = this._getItemIndex(relatedTarget);

      var fromIndex = this._getItemIndex(this._element.querySelector(Selector$2.ACTIVE_ITEM));

      var slideEvent = $.Event(Event$2.SLIDE, {
        relatedTarget: relatedTarget,
        direction: eventDirectionName,
        from: fromIndex,
        to: targetIndex
      });
      $(this._element).trigger(slideEvent);
      return slideEvent;
    };

    _proto._setActiveIndicatorElement = function _setActiveIndicatorElement(element) {
      if (this._indicatorsElement) {
        var indicators = [].slice.call(this._indicatorsElement.querySelectorAll(Selector$2.ACTIVE));
        $(indicators).removeClass(ClassName$2.ACTIVE);

        var nextIndicator = this._indicatorsElement.children[this._getItemIndex(element)];

        if (nextIndicator) {
          $(nextIndicator).addClass(ClassName$2.ACTIVE);
        }
      }
    };

    _proto._slide = function _slide(direction, element) {
      var _this4 = this;

      var activeElement = this._element.querySelector(Selector$2.ACTIVE_ITEM);

      var activeElementIndex = this._getItemIndex(activeElement);

      var nextElement = element || activeElement && this._getItemByDirection(direction, activeElement);

      var nextElementIndex = this._getItemIndex(nextElement);

      var isCycling = Boolean(this._interval);
      var directionalClassName;
      var orderClassName;
      var eventDirectionName;

      if (direction === Direction.NEXT) {
        directionalClassName = ClassName$2.LEFT;
        orderClassName = ClassName$2.NEXT;
        eventDirectionName = Direction.LEFT;
      } else {
        directionalClassName = ClassName$2.RIGHT;
        orderClassName = ClassName$2.PREV;
        eventDirectionName = Direction.RIGHT;
      }

      if (nextElement && $(nextElement).hasClass(ClassName$2.ACTIVE)) {
        this._isSliding = false;
        return;
      }

      var slideEvent = this._triggerSlideEvent(nextElement, eventDirectionName);

      if (slideEvent.isDefaultPrevented()) {
        return;
      }

      if (!activeElement || !nextElement) {
        // Some weirdness is happening, so we bail
        return;
      }

      this._isSliding = true;

      if (isCycling) {
        this.pause();
      }

      this._setActiveIndicatorElement(nextElement);

      var slidEvent = $.Event(Event$2.SLID, {
        relatedTarget: nextElement,
        direction: eventDirectionName,
        from: activeElementIndex,
        to: nextElementIndex
      });

      if ($(this._element).hasClass(ClassName$2.SLIDE)) {
        $(nextElement).addClass(orderClassName);
        Util.reflow(nextElement);
        $(activeElement).addClass(directionalClassName);
        $(nextElement).addClass(directionalClassName);
        var nextElementInterval = parseInt(nextElement.getAttribute('data-interval'), 10);

        if (nextElementInterval) {
          this._config.defaultInterval = this._config.defaultInterval || this._config.interval;
          this._config.interval = nextElementInterval;
        } else {
          this._config.interval = this._config.defaultInterval || this._config.interval;
        }

        var transitionDuration = Util.getTransitionDurationFromElement(activeElement);
        $(activeElement).one(Util.TRANSITION_END, function () {
          $(nextElement).removeClass(directionalClassName + " " + orderClassName).addClass(ClassName$2.ACTIVE);
          $(activeElement).removeClass(ClassName$2.ACTIVE + " " + orderClassName + " " + directionalClassName);
          _this4._isSliding = false;
          setTimeout(function () {
            return $(_this4._element).trigger(slidEvent);
          }, 0);
        }).emulateTransitionEnd(transitionDuration);
      } else {
        $(activeElement).removeClass(ClassName$2.ACTIVE);
        $(nextElement).addClass(ClassName$2.ACTIVE);
        this._isSliding = false;
        $(this._element).trigger(slidEvent);
      }

      if (isCycling) {
        this.cycle();
      }
    } // Static
    ;

    Carousel._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY$2);

        var _config = _objectSpread({}, Default, $(this).data());

        if (typeof config === 'object') {
          _config = _objectSpread({}, _config, config);
        }

        var action = typeof config === 'string' ? config : _config.slide;

        if (!data) {
          data = new Carousel(this, _config);
          $(this).data(DATA_KEY$2, data);
        }

        if (typeof config === 'number') {
          data.to(config);
        } else if (typeof action === 'string') {
          if (typeof data[action] === 'undefined') {
            throw new TypeError("No method named \"" + action + "\"");
          }

          data[action]();
        } else if (_config.interval && _config.ride) {
          data.pause();
          data.cycle();
        }
      });
    };

    Carousel._dataApiClickHandler = function _dataApiClickHandler(event) {
      var selector = Util.getSelectorFromElement(this);

      if (!selector) {
        return;
      }

      var target = $(selector)[0];

      if (!target || !$(target).hasClass(ClassName$2.CAROUSEL)) {
        return;
      }

      var config = _objectSpread({}, $(target).data(), $(this).data());

      var slideIndex = this.getAttribute('data-slide-to');

      if (slideIndex) {
        config.interval = false;
      }

      Carousel._jQueryInterface.call($(target), config);

      if (slideIndex) {
        $(target).data(DATA_KEY$2).to(slideIndex);
      }

      event.preventDefault();
    };

    _createClass(Carousel, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION$2;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default;
      }
    }]);

    return Carousel;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  $(document).on(Event$2.CLICK_DATA_API, Selector$2.DATA_SLIDE, Carousel._dataApiClickHandler);
  $(window).on(Event$2.LOAD_DATA_API, function () {
    var carousels = [].slice.call(document.querySelectorAll(Selector$2.DATA_RIDE));

    for (var i = 0, len = carousels.length; i < len; i++) {
      var $carousel = $(carousels[i]);

      Carousel._jQueryInterface.call($carousel, $carousel.data());
    }
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$2] = Carousel._jQueryInterface;
  $.fn[NAME$2].Constructor = Carousel;

  $.fn[NAME$2].noConflict = function () {
    $.fn[NAME$2] = JQUERY_NO_CONFLICT$2;
    return Carousel._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$3 = 'collapse';
  var VERSION$3 = '4.3.1';
  var DATA_KEY$3 = 'bs.collapse';
  var EVENT_KEY$3 = "." + DATA_KEY$3;
  var DATA_API_KEY$3 = '.data-api';
  var JQUERY_NO_CONFLICT$3 = $.fn[NAME$3];
  var Default$1 = {
    toggle: true,
    parent: ''
  };
  var DefaultType$1 = {
    toggle: 'boolean',
    parent: '(string|element)'
  };
  var Event$3 = {
    SHOW: "show" + EVENT_KEY$3,
    SHOWN: "shown" + EVENT_KEY$3,
    HIDE: "hide" + EVENT_KEY$3,
    HIDDEN: "hidden" + EVENT_KEY$3,
    CLICK_DATA_API: "click" + EVENT_KEY$3 + DATA_API_KEY$3
  };
  var ClassName$3 = {
    SHOW: 'show',
    COLLAPSE: 'collapse',
    COLLAPSING: 'collapsing',
    COLLAPSED: 'collapsed'
  };
  var Dimension = {
    WIDTH: 'width',
    HEIGHT: 'height'
  };
  var Selector$3 = {
    ACTIVES: '.show, .collapsing',
    DATA_TOGGLE: '[data-toggle="collapse"]'
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };

  var Collapse =
  /*#__PURE__*/
  function () {
    function Collapse(element, config) {
      this._isTransitioning = false;
      this._element = element;
      this._config = this._getConfig(config);
      this._triggerArray = [].slice.call(document.querySelectorAll("[data-toggle=\"collapse\"][href=\"#" + element.id + "\"]," + ("[data-toggle=\"collapse\"][data-target=\"#" + element.id + "\"]")));
      var toggleList = [].slice.call(document.querySelectorAll(Selector$3.DATA_TOGGLE));

      for (var i = 0, len = toggleList.length; i < len; i++) {
        var elem = toggleList[i];
        var selector = Util.getSelectorFromElement(elem);
        var filterElement = [].slice.call(document.querySelectorAll(selector)).filter(function (foundElem) {
          return foundElem === element;
        });

        if (selector !== null && filterElement.length > 0) {
          this._selector = selector;

          this._triggerArray.push(elem);
        }
      }

      this._parent = this._config.parent ? this._getParent() : null;

      if (!this._config.parent) {
        this._addAriaAndCollapsedClass(this._element, this._triggerArray);
      }

      if (this._config.toggle) {
        this.toggle();
      }
    } // Getters


    var _proto = Collapse.prototype;

    // Public
    _proto.toggle = function toggle() {
      if ($(this._element).hasClass(ClassName$3.SHOW)) {
        this.hide();
      } else {
        this.show();
      }
    };

    _proto.show = function show() {
      var _this = this;

      if (this._isTransitioning || $(this._element).hasClass(ClassName$3.SHOW)) {
        return;
      }

      var actives;
      var activesData;

      if (this._parent) {
        actives = [].slice.call(this._parent.querySelectorAll(Selector$3.ACTIVES)).filter(function (elem) {
          if (typeof _this._config.parent === 'string') {
            return elem.getAttribute('data-parent') === _this._config.parent;
          }

          return elem.classList.contains(ClassName$3.COLLAPSE);
        });

        if (actives.length === 0) {
          actives = null;
        }
      }

      if (actives) {
        activesData = $(actives).not(this._selector).data(DATA_KEY$3);

        if (activesData && activesData._isTransitioning) {
          return;
        }
      }

      var startEvent = $.Event(Event$3.SHOW);
      $(this._element).trigger(startEvent);

      if (startEvent.isDefaultPrevented()) {
        return;
      }

      if (actives) {
        Collapse._jQueryInterface.call($(actives).not(this._selector), 'hide');

        if (!activesData) {
          $(actives).data(DATA_KEY$3, null);
        }
      }

      var dimension = this._getDimension();

      $(this._element).removeClass(ClassName$3.COLLAPSE).addClass(ClassName$3.COLLAPSING);
      this._element.style[dimension] = 0;

      if (this._triggerArray.length) {
        $(this._triggerArray).removeClass(ClassName$3.COLLAPSED).attr('aria-expanded', true);
      }

      this.setTransitioning(true);

      var complete = function complete() {
        $(_this._element).removeClass(ClassName$3.COLLAPSING).addClass(ClassName$3.COLLAPSE).addClass(ClassName$3.SHOW);
        _this._element.style[dimension] = '';

        _this.setTransitioning(false);

        $(_this._element).trigger(Event$3.SHOWN);
      };

      var capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1);
      var scrollSize = "scroll" + capitalizedDimension;
      var transitionDuration = Util.getTransitionDurationFromElement(this._element);
      $(this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
      this._element.style[dimension] = this._element[scrollSize] + "px";
    };

    _proto.hide = function hide() {
      var _this2 = this;

      if (this._isTransitioning || !$(this._element).hasClass(ClassName$3.SHOW)) {
        return;
      }

      var startEvent = $.Event(Event$3.HIDE);
      $(this._element).trigger(startEvent);

      if (startEvent.isDefaultPrevented()) {
        return;
      }

      var dimension = this._getDimension();

      this._element.style[dimension] = this._element.getBoundingClientRect()[dimension] + "px";
      Util.reflow(this._element);
      $(this._element).addClass(ClassName$3.COLLAPSING).removeClass(ClassName$3.COLLAPSE).removeClass(ClassName$3.SHOW);
      var triggerArrayLength = this._triggerArray.length;

      if (triggerArrayLength > 0) {
        for (var i = 0; i < triggerArrayLength; i++) {
          var trigger = this._triggerArray[i];
          var selector = Util.getSelectorFromElement(trigger);

          if (selector !== null) {
            var $elem = $([].slice.call(document.querySelectorAll(selector)));

            if (!$elem.hasClass(ClassName$3.SHOW)) {
              $(trigger).addClass(ClassName$3.COLLAPSED).attr('aria-expanded', false);
            }
          }
        }
      }

      this.setTransitioning(true);

      var complete = function complete() {
        _this2.setTransitioning(false);

        $(_this2._element).removeClass(ClassName$3.COLLAPSING).addClass(ClassName$3.COLLAPSE).trigger(Event$3.HIDDEN);
      };

      this._element.style[dimension] = '';
      var transitionDuration = Util.getTransitionDurationFromElement(this._element);
      $(this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
    };

    _proto.setTransitioning = function setTransitioning(isTransitioning) {
      this._isTransitioning = isTransitioning;
    };

    _proto.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY$3);
      this._config = null;
      this._parent = null;
      this._element = null;
      this._triggerArray = null;
      this._isTransitioning = null;
    } // Private
    ;

    _proto._getConfig = function _getConfig(config) {
      config = _objectSpread({}, Default$1, config);
      config.toggle = Boolean(config.toggle); // Coerce string values

      Util.typeCheckConfig(NAME$3, config, DefaultType$1);
      return config;
    };

    _proto._getDimension = function _getDimension() {
      var hasWidth = $(this._element).hasClass(Dimension.WIDTH);
      return hasWidth ? Dimension.WIDTH : Dimension.HEIGHT;
    };

    _proto._getParent = function _getParent() {
      var _this3 = this;

      var parent;

      if (Util.isElement(this._config.parent)) {
        parent = this._config.parent; // It's a jQuery object

        if (typeof this._config.parent.jquery !== 'undefined') {
          parent = this._config.parent[0];
        }
      } else {
        parent = document.querySelector(this._config.parent);
      }

      var selector = "[data-toggle=\"collapse\"][data-parent=\"" + this._config.parent + "\"]";
      var children = [].slice.call(parent.querySelectorAll(selector));
      $(children).each(function (i, element) {
        _this3._addAriaAndCollapsedClass(Collapse._getTargetFromElement(element), [element]);
      });
      return parent;
    };

    _proto._addAriaAndCollapsedClass = function _addAriaAndCollapsedClass(element, triggerArray) {
      var isOpen = $(element).hasClass(ClassName$3.SHOW);

      if (triggerArray.length) {
        $(triggerArray).toggleClass(ClassName$3.COLLAPSED, !isOpen).attr('aria-expanded', isOpen);
      }
    } // Static
    ;

    Collapse._getTargetFromElement = function _getTargetFromElement(element) {
      var selector = Util.getSelectorFromElement(element);
      return selector ? document.querySelector(selector) : null;
    };

    Collapse._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var $this = $(this);
        var data = $this.data(DATA_KEY$3);

        var _config = _objectSpread({}, Default$1, $this.data(), typeof config === 'object' && config ? config : {});

        if (!data && _config.toggle && /show|hide/.test(config)) {
          _config.toggle = false;
        }

        if (!data) {
          data = new Collapse(this, _config);
          $this.data(DATA_KEY$3, data);
        }

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError("No method named \"" + config + "\"");
          }

          data[config]();
        }
      });
    };

    _createClass(Collapse, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION$3;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default$1;
      }
    }]);

    return Collapse;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  $(document).on(Event$3.CLICK_DATA_API, Selector$3.DATA_TOGGLE, function (event) {
    // preventDefault only for <a> elements (which change the URL) not inside the collapsible element
    if (event.currentTarget.tagName === 'A') {
      event.preventDefault();
    }

    var $trigger = $(this);
    var selector = Util.getSelectorFromElement(this);
    var selectors = [].slice.call(document.querySelectorAll(selector));
    $(selectors).each(function () {
      var $target = $(this);
      var data = $target.data(DATA_KEY$3);
      var config = data ? 'toggle' : $trigger.data();

      Collapse._jQueryInterface.call($target, config);
    });
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$3] = Collapse._jQueryInterface;
  $.fn[NAME$3].Constructor = Collapse;

  $.fn[NAME$3].noConflict = function () {
    $.fn[NAME$3] = JQUERY_NO_CONFLICT$3;
    return Collapse._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$4 = 'dropdown';
  var VERSION$4 = '4.3.1';
  var DATA_KEY$4 = 'bs.dropdown';
  var EVENT_KEY$4 = "." + DATA_KEY$4;
  var DATA_API_KEY$4 = '.data-api';
  var JQUERY_NO_CONFLICT$4 = $.fn[NAME$4];
  var ESCAPE_KEYCODE = 27; // KeyboardEvent.which value for Escape (Esc) key

  var SPACE_KEYCODE = 32; // KeyboardEvent.which value for space key

  var TAB_KEYCODE = 9; // KeyboardEvent.which value for tab key

  var ARROW_UP_KEYCODE = 38; // KeyboardEvent.which value for up arrow key

  var ARROW_DOWN_KEYCODE = 40; // KeyboardEvent.which value for down arrow key

  var RIGHT_MOUSE_BUTTON_WHICH = 3; // MouseEvent.which value for the right button (assuming a right-handed mouse)

  var REGEXP_KEYDOWN = new RegExp(ARROW_UP_KEYCODE + "|" + ARROW_DOWN_KEYCODE + "|" + ESCAPE_KEYCODE);
  var Event$4 = {
    HIDE: "hide" + EVENT_KEY$4,
    HIDDEN: "hidden" + EVENT_KEY$4,
    SHOW: "show" + EVENT_KEY$4,
    SHOWN: "shown" + EVENT_KEY$4,
    CLICK: "click" + EVENT_KEY$4,
    CLICK_DATA_API: "click" + EVENT_KEY$4 + DATA_API_KEY$4,
    KEYDOWN_DATA_API: "keydown" + EVENT_KEY$4 + DATA_API_KEY$4,
    KEYUP_DATA_API: "keyup" + EVENT_KEY$4 + DATA_API_KEY$4
  };
  var ClassName$4 = {
    DISABLED: 'disabled',
    SHOW: 'show',
    DROPUP: 'dropup',
    DROPRIGHT: 'dropright',
    DROPLEFT: 'dropleft',
    MENURIGHT: 'dropdown-menu-right',
    MENULEFT: 'dropdown-menu-left',
    POSITION_STATIC: 'position-static'
  };
  var Selector$4 = {
    DATA_TOGGLE: '[data-toggle="dropdown"]',
    FORM_CHILD: '.dropdown form',
    MENU: '.dropdown-menu',
    NAVBAR_NAV: '.navbar-nav',
    VISIBLE_ITEMS: '.dropdown-menu .dropdown-item:not(.disabled):not(:disabled)'
  };
  var AttachmentMap = {
    TOP: 'top-start',
    TOPEND: 'top-end',
    BOTTOM: 'bottom-start',
    BOTTOMEND: 'bottom-end',
    RIGHT: 'right-start',
    RIGHTEND: 'right-end',
    LEFT: 'left-start',
    LEFTEND: 'left-end'
  };
  var Default$2 = {
    offset: 0,
    flip: true,
    boundary: 'scrollParent',
    reference: 'toggle',
    display: 'dynamic'
  };
  var DefaultType$2 = {
    offset: '(number|string|function)',
    flip: 'boolean',
    boundary: '(string|element)',
    reference: '(string|element)',
    display: 'string'
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };

  var Dropdown =
  /*#__PURE__*/
  function () {
    function Dropdown(element, config) {
      this._element = element;
      this._popper = null;
      this._config = this._getConfig(config);
      this._menu = this._getMenuElement();
      this._inNavbar = this._detectNavbar();

      this._addEventListeners();
    } // Getters


    var _proto = Dropdown.prototype;

    // Public
    _proto.toggle = function toggle() {
      if (this._element.disabled || $(this._element).hasClass(ClassName$4.DISABLED)) {
        return;
      }

      var parent = Dropdown._getParentFromElement(this._element);

      var isActive = $(this._menu).hasClass(ClassName$4.SHOW);

      Dropdown._clearMenus();

      if (isActive) {
        return;
      }

      var relatedTarget = {
        relatedTarget: this._element
      };
      var showEvent = $.Event(Event$4.SHOW, relatedTarget);
      $(parent).trigger(showEvent);

      if (showEvent.isDefaultPrevented()) {
        return;
      } // Disable totally Popper.js for Dropdown in Navbar


      if (!this._inNavbar) {
        /**
         * Check for Popper dependency
         * Popper - https://popper.js.org
         */
        if (typeof Popper === 'undefined') {
          throw new TypeError('Bootstrap\'s dropdowns require Popper.js (https://popper.js.org/)');
        }

        var referenceElement = this._element;

        if (this._config.reference === 'parent') {
          referenceElement = parent;
        } else if (Util.isElement(this._config.reference)) {
          referenceElement = this._config.reference; // Check if it's jQuery element

          if (typeof this._config.reference.jquery !== 'undefined') {
            referenceElement = this._config.reference[0];
          }
        } // If boundary is not `scrollParent`, then set position to `static`
        // to allow the menu to "escape" the scroll parent's boundaries
        // https://github.com/twbs/bootstrap/issues/24251


        if (this._config.boundary !== 'scrollParent') {
          $(parent).addClass(ClassName$4.POSITION_STATIC);
        }

        this._popper = new Popper(referenceElement, this._menu, this._getPopperConfig());
      } // If this is a touch-enabled device we add extra
      // empty mouseover listeners to the body's immediate children;
      // only needed because of broken event delegation on iOS
      // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html


      if ('ontouchstart' in document.documentElement && $(parent).closest(Selector$4.NAVBAR_NAV).length === 0) {
        $(document.body).children().on('mouseover', null, $.noop);
      }

      this._element.focus();

      this._element.setAttribute('aria-expanded', true);

      $(this._menu).toggleClass(ClassName$4.SHOW);
      $(parent).toggleClass(ClassName$4.SHOW).trigger($.Event(Event$4.SHOWN, relatedTarget));
    };

    _proto.show = function show() {
      if (this._element.disabled || $(this._element).hasClass(ClassName$4.DISABLED) || $(this._menu).hasClass(ClassName$4.SHOW)) {
        return;
      }

      var relatedTarget = {
        relatedTarget: this._element
      };
      var showEvent = $.Event(Event$4.SHOW, relatedTarget);

      var parent = Dropdown._getParentFromElement(this._element);

      $(parent).trigger(showEvent);

      if (showEvent.isDefaultPrevented()) {
        return;
      }

      $(this._menu).toggleClass(ClassName$4.SHOW);
      $(parent).toggleClass(ClassName$4.SHOW).trigger($.Event(Event$4.SHOWN, relatedTarget));
    };

    _proto.hide = function hide() {
      if (this._element.disabled || $(this._element).hasClass(ClassName$4.DISABLED) || !$(this._menu).hasClass(ClassName$4.SHOW)) {
        return;
      }

      var relatedTarget = {
        relatedTarget: this._element
      };
      var hideEvent = $.Event(Event$4.HIDE, relatedTarget);

      var parent = Dropdown._getParentFromElement(this._element);

      $(parent).trigger(hideEvent);

      if (hideEvent.isDefaultPrevented()) {
        return;
      }

      $(this._menu).toggleClass(ClassName$4.SHOW);
      $(parent).toggleClass(ClassName$4.SHOW).trigger($.Event(Event$4.HIDDEN, relatedTarget));
    };

    _proto.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY$4);
      $(this._element).off(EVENT_KEY$4);
      this._element = null;
      this._menu = null;

      if (this._popper !== null) {
        this._popper.destroy();

        this._popper = null;
      }
    };

    _proto.update = function update() {
      this._inNavbar = this._detectNavbar();

      if (this._popper !== null) {
        this._popper.scheduleUpdate();
      }
    } // Private
    ;

    _proto._addEventListeners = function _addEventListeners() {
      var _this = this;

      $(this._element).on(Event$4.CLICK, function (event) {
        event.preventDefault();
        event.stopPropagation();

        _this.toggle();
      });
    };

    _proto._getConfig = function _getConfig(config) {
      config = _objectSpread({}, this.constructor.Default, $(this._element).data(), config);
      Util.typeCheckConfig(NAME$4, config, this.constructor.DefaultType);
      return config;
    };

    _proto._getMenuElement = function _getMenuElement() {
      if (!this._menu) {
        var parent = Dropdown._getParentFromElement(this._element);

        if (parent) {
          this._menu = parent.querySelector(Selector$4.MENU);
        }
      }

      return this._menu;
    };

    _proto._getPlacement = function _getPlacement() {
      var $parentDropdown = $(this._element.parentNode);
      var placement = AttachmentMap.BOTTOM; // Handle dropup

      if ($parentDropdown.hasClass(ClassName$4.DROPUP)) {
        placement = AttachmentMap.TOP;

        if ($(this._menu).hasClass(ClassName$4.MENURIGHT)) {
          placement = AttachmentMap.TOPEND;
        }
      } else if ($parentDropdown.hasClass(ClassName$4.DROPRIGHT)) {
        placement = AttachmentMap.RIGHT;
      } else if ($parentDropdown.hasClass(ClassName$4.DROPLEFT)) {
        placement = AttachmentMap.LEFT;
      } else if ($(this._menu).hasClass(ClassName$4.MENURIGHT)) {
        placement = AttachmentMap.BOTTOMEND;
      }

      return placement;
    };

    _proto._detectNavbar = function _detectNavbar() {
      return $(this._element).closest('.navbar').length > 0;
    };

    _proto._getOffset = function _getOffset() {
      var _this2 = this;

      var offset = {};

      if (typeof this._config.offset === 'function') {
        offset.fn = function (data) {
          data.offsets = _objectSpread({}, data.offsets, _this2._config.offset(data.offsets, _this2._element) || {});
          return data;
        };
      } else {
        offset.offset = this._config.offset;
      }

      return offset;
    };

    _proto._getPopperConfig = function _getPopperConfig() {
      var popperConfig = {
        placement: this._getPlacement(),
        modifiers: {
          offset: this._getOffset(),
          flip: {
            enabled: this._config.flip
          },
          preventOverflow: {
            boundariesElement: this._config.boundary
          }
        } // Disable Popper.js if we have a static display

      };

      if (this._config.display === 'static') {
        popperConfig.modifiers.applyStyle = {
          enabled: false
        };
      }

      return popperConfig;
    } // Static
    ;

    Dropdown._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY$4);

        var _config = typeof config === 'object' ? config : null;

        if (!data) {
          data = new Dropdown(this, _config);
          $(this).data(DATA_KEY$4, data);
        }

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError("No method named \"" + config + "\"");
          }

          data[config]();
        }
      });
    };

    Dropdown._clearMenus = function _clearMenus(event) {
      if (event && (event.which === RIGHT_MOUSE_BUTTON_WHICH || event.type === 'keyup' && event.which !== TAB_KEYCODE)) {
        return;
      }

      var toggles = [].slice.call(document.querySelectorAll(Selector$4.DATA_TOGGLE));

      for (var i = 0, len = toggles.length; i < len; i++) {
        var parent = Dropdown._getParentFromElement(toggles[i]);

        var context = $(toggles[i]).data(DATA_KEY$4);
        var relatedTarget = {
          relatedTarget: toggles[i]
        };

        if (event && event.type === 'click') {
          relatedTarget.clickEvent = event;
        }

        if (!context) {
          continue;
        }

        var dropdownMenu = context._menu;

        if (!$(parent).hasClass(ClassName$4.SHOW)) {
          continue;
        }

        if (event && (event.type === 'click' && /input|textarea/i.test(event.target.tagName) || event.type === 'keyup' && event.which === TAB_KEYCODE) && $.contains(parent, event.target)) {
          continue;
        }

        var hideEvent = $.Event(Event$4.HIDE, relatedTarget);
        $(parent).trigger(hideEvent);

        if (hideEvent.isDefaultPrevented()) {
          continue;
        } // If this is a touch-enabled device we remove the extra
        // empty mouseover listeners we added for iOS support


        if ('ontouchstart' in document.documentElement) {
          $(document.body).children().off('mouseover', null, $.noop);
        }

        toggles[i].setAttribute('aria-expanded', 'false');
        $(dropdownMenu).removeClass(ClassName$4.SHOW);
        $(parent).removeClass(ClassName$4.SHOW).trigger($.Event(Event$4.HIDDEN, relatedTarget));
      }
    };

    Dropdown._getParentFromElement = function _getParentFromElement(element) {
      var parent;
      var selector = Util.getSelectorFromElement(element);

      if (selector) {
        parent = document.querySelector(selector);
      }

      return parent || element.parentNode;
    } // eslint-disable-next-line complexity
    ;

    Dropdown._dataApiKeydownHandler = function _dataApiKeydownHandler(event) {
      // If not input/textarea:
      //  - And not a key in REGEXP_KEYDOWN => not a dropdown command
      // If input/textarea:
      //  - If space key => not a dropdown command
      //  - If key is other than escape
      //    - If key is not up or down => not a dropdown command
      //    - If trigger inside the menu => not a dropdown command
      if (/input|textarea/i.test(event.target.tagName) ? event.which === SPACE_KEYCODE || event.which !== ESCAPE_KEYCODE && (event.which !== ARROW_DOWN_KEYCODE && event.which !== ARROW_UP_KEYCODE || $(event.target).closest(Selector$4.MENU).length) : !REGEXP_KEYDOWN.test(event.which)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (this.disabled || $(this).hasClass(ClassName$4.DISABLED)) {
        return;
      }

      var parent = Dropdown._getParentFromElement(this);

      var isActive = $(parent).hasClass(ClassName$4.SHOW);

      if (!isActive || isActive && (event.which === ESCAPE_KEYCODE || event.which === SPACE_KEYCODE)) {
        if (event.which === ESCAPE_KEYCODE) {
          var toggle = parent.querySelector(Selector$4.DATA_TOGGLE);
          $(toggle).trigger('focus');
        }

        $(this).trigger('click');
        return;
      }

      var items = [].slice.call(parent.querySelectorAll(Selector$4.VISIBLE_ITEMS));

      if (items.length === 0) {
        return;
      }

      var index = items.indexOf(event.target);

      if (event.which === ARROW_UP_KEYCODE && index > 0) {
        // Up
        index--;
      }

      if (event.which === ARROW_DOWN_KEYCODE && index < items.length - 1) {
        // Down
        index++;
      }

      if (index < 0) {
        index = 0;
      }

      items[index].focus();
    };

    _createClass(Dropdown, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION$4;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default$2;
      }
    }, {
      key: "DefaultType",
      get: function get() {
        return DefaultType$2;
      }
    }]);

    return Dropdown;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  $(document).on(Event$4.KEYDOWN_DATA_API, Selector$4.DATA_TOGGLE, Dropdown._dataApiKeydownHandler).on(Event$4.KEYDOWN_DATA_API, Selector$4.MENU, Dropdown._dataApiKeydownHandler).on(Event$4.CLICK_DATA_API + " " + Event$4.KEYUP_DATA_API, Dropdown._clearMenus).on(Event$4.CLICK_DATA_API, Selector$4.DATA_TOGGLE, function (event) {
    event.preventDefault();
    event.stopPropagation();

    Dropdown._jQueryInterface.call($(this), 'toggle');
  }).on(Event$4.CLICK_DATA_API, Selector$4.FORM_CHILD, function (e) {
    e.stopPropagation();
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$4] = Dropdown._jQueryInterface;
  $.fn[NAME$4].Constructor = Dropdown;

  $.fn[NAME$4].noConflict = function () {
    $.fn[NAME$4] = JQUERY_NO_CONFLICT$4;
    return Dropdown._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$5 = 'modal';
  var VERSION$5 = '4.3.1';
  var DATA_KEY$5 = 'bs.modal';
  var EVENT_KEY$5 = "." + DATA_KEY$5;
  var DATA_API_KEY$5 = '.data-api';
  var JQUERY_NO_CONFLICT$5 = $.fn[NAME$5];
  var ESCAPE_KEYCODE$1 = 27; // KeyboardEvent.which value for Escape (Esc) key

  var Default$3 = {
    backdrop: true,
    keyboard: true,
    focus: true,
    show: true
  };
  var DefaultType$3 = {
    backdrop: '(boolean|string)',
    keyboard: 'boolean',
    focus: 'boolean',
    show: 'boolean'
  };
  var Event$5 = {
    HIDE: "hide" + EVENT_KEY$5,
    HIDDEN: "hidden" + EVENT_KEY$5,
    SHOW: "show" + EVENT_KEY$5,
    SHOWN: "shown" + EVENT_KEY$5,
    FOCUSIN: "focusin" + EVENT_KEY$5,
    RESIZE: "resize" + EVENT_KEY$5,
    CLICK_DISMISS: "click.dismiss" + EVENT_KEY$5,
    KEYDOWN_DISMISS: "keydown.dismiss" + EVENT_KEY$5,
    MOUSEUP_DISMISS: "mouseup.dismiss" + EVENT_KEY$5,
    MOUSEDOWN_DISMISS: "mousedown.dismiss" + EVENT_KEY$5,
    CLICK_DATA_API: "click" + EVENT_KEY$5 + DATA_API_KEY$5
  };
  var ClassName$5 = {
    SCROLLABLE: 'modal-dialog-scrollable',
    SCROLLBAR_MEASURER: 'modal-scrollbar-measure',
    BACKDROP: 'modal-backdrop',
    OPEN: 'modal-open',
    FADE: 'fade',
    SHOW: 'show'
  };
  var Selector$5 = {
    DIALOG: '.modal-dialog',
    MODAL_BODY: '.modal-body',
    DATA_TOGGLE: '[data-toggle="modal"]',
    DATA_DISMISS: '[data-dismiss="modal"]',
    FIXED_CONTENT: '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top',
    STICKY_CONTENT: '.sticky-top'
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };

  var Modal =
  /*#__PURE__*/
  function () {
    function Modal(element, config) {
      this._config = this._getConfig(config);
      this._element = element;
      this._dialog = element.querySelector(Selector$5.DIALOG);
      this._backdrop = null;
      this._isShown = false;
      this._isBodyOverflowing = false;
      this._ignoreBackdropClick = false;
      this._isTransitioning = false;
      this._scrollbarWidth = 0;
    } // Getters


    var _proto = Modal.prototype;

    // Public
    _proto.toggle = function toggle(relatedTarget) {
      return this._isShown ? this.hide() : this.show(relatedTarget);
    };

    _proto.show = function show(relatedTarget) {
      var _this = this;

      if (this._isShown || this._isTransitioning) {
        return;
      }

      if ($(this._element).hasClass(ClassName$5.FADE)) {
        this._isTransitioning = true;
      }

      var showEvent = $.Event(Event$5.SHOW, {
        relatedTarget: relatedTarget
      });
      $(this._element).trigger(showEvent);

      if (this._isShown || showEvent.isDefaultPrevented()) {
        return;
      }

      this._isShown = true;

      this._checkScrollbar();

      this._setScrollbar();

      this._adjustDialog();

      this._setEscapeEvent();

      this._setResizeEvent();

      $(this._element).on(Event$5.CLICK_DISMISS, Selector$5.DATA_DISMISS, function (event) {
        return _this.hide(event);
      });
      $(this._dialog).on(Event$5.MOUSEDOWN_DISMISS, function () {
        $(_this._element).one(Event$5.MOUSEUP_DISMISS, function (event) {
          if ($(event.target).is(_this._element)) {
            _this._ignoreBackdropClick = true;
          }
        });
      });

      this._showBackdrop(function () {
        return _this._showElement(relatedTarget);
      });
    };

    _proto.hide = function hide(event) {
      var _this2 = this;

      if (event) {
        event.preventDefault();
      }

      if (!this._isShown || this._isTransitioning) {
        return;
      }

      var hideEvent = $.Event(Event$5.HIDE);
      $(this._element).trigger(hideEvent);

      if (!this._isShown || hideEvent.isDefaultPrevented()) {
        return;
      }

      this._isShown = false;
      var transition = $(this._element).hasClass(ClassName$5.FADE);

      if (transition) {
        this._isTransitioning = true;
      }

      this._setEscapeEvent();

      this._setResizeEvent();

      $(document).off(Event$5.FOCUSIN);
      $(this._element).removeClass(ClassName$5.SHOW);
      $(this._element).off(Event$5.CLICK_DISMISS);
      $(this._dialog).off(Event$5.MOUSEDOWN_DISMISS);

      if (transition) {
        var transitionDuration = Util.getTransitionDurationFromElement(this._element);
        $(this._element).one(Util.TRANSITION_END, function (event) {
          return _this2._hideModal(event);
        }).emulateTransitionEnd(transitionDuration);
      } else {
        this._hideModal();
      }
    };

    _proto.dispose = function dispose() {
      [window, this._element, this._dialog].forEach(function (htmlElement) {
        return $(htmlElement).off(EVENT_KEY$5);
      });
      /**
       * `document` has 2 events `Event.FOCUSIN` and `Event.CLICK_DATA_API`
       * Do not move `document` in `htmlElements` array
       * It will remove `Event.CLICK_DATA_API` event that should remain
       */

      $(document).off(Event$5.FOCUSIN);
      $.removeData(this._element, DATA_KEY$5);
      this._config = null;
      this._element = null;
      this._dialog = null;
      this._backdrop = null;
      this._isShown = null;
      this._isBodyOverflowing = null;
      this._ignoreBackdropClick = null;
      this._isTransitioning = null;
      this._scrollbarWidth = null;
    };

    _proto.handleUpdate = function handleUpdate() {
      this._adjustDialog();
    } // Private
    ;

    _proto._getConfig = function _getConfig(config) {
      config = _objectSpread({}, Default$3, config);
      Util.typeCheckConfig(NAME$5, config, DefaultType$3);
      return config;
    };

    _proto._showElement = function _showElement(relatedTarget) {
      var _this3 = this;

      var transition = $(this._element).hasClass(ClassName$5.FADE);

      if (!this._element.parentNode || this._element.parentNode.nodeType !== Node.ELEMENT_NODE) {
        // Don't move modal's DOM position
        document.body.appendChild(this._element);
      }

      this._element.style.display = 'block';

      this._element.removeAttribute('aria-hidden');

      this._element.setAttribute('aria-modal', true);

      if ($(this._dialog).hasClass(ClassName$5.SCROLLABLE)) {
        this._dialog.querySelector(Selector$5.MODAL_BODY).scrollTop = 0;
      } else {
        this._element.scrollTop = 0;
      }

      if (transition) {
        Util.reflow(this._element);
      }

      $(this._element).addClass(ClassName$5.SHOW);

      if (this._config.focus) {
        this._enforceFocus();
      }

      var shownEvent = $.Event(Event$5.SHOWN, {
        relatedTarget: relatedTarget
      });

      var transitionComplete = function transitionComplete() {
        if (_this3._config.focus) {
          _this3._element.focus();
        }

        _this3._isTransitioning = false;
        $(_this3._element).trigger(shownEvent);
      };

      if (transition) {
        var transitionDuration = Util.getTransitionDurationFromElement(this._dialog);
        $(this._dialog).one(Util.TRANSITION_END, transitionComplete).emulateTransitionEnd(transitionDuration);
      } else {
        transitionComplete();
      }
    };

    _proto._enforceFocus = function _enforceFocus() {
      var _this4 = this;

      $(document).off(Event$5.FOCUSIN) // Guard against infinite focus loop
      .on(Event$5.FOCUSIN, function (event) {
        if (document !== event.target && _this4._element !== event.target && $(_this4._element).has(event.target).length === 0) {
          _this4._element.focus();
        }
      });
    };

    _proto._setEscapeEvent = function _setEscapeEvent() {
      var _this5 = this;

      if (this._isShown && this._config.keyboard) {
        $(this._element).on(Event$5.KEYDOWN_DISMISS, function (event) {
          if (event.which === ESCAPE_KEYCODE$1) {
            event.preventDefault();

            _this5.hide();
          }
        });
      } else if (!this._isShown) {
        $(this._element).off(Event$5.KEYDOWN_DISMISS);
      }
    };

    _proto._setResizeEvent = function _setResizeEvent() {
      var _this6 = this;

      if (this._isShown) {
        $(window).on(Event$5.RESIZE, function (event) {
          return _this6.handleUpdate(event);
        });
      } else {
        $(window).off(Event$5.RESIZE);
      }
    };

    _proto._hideModal = function _hideModal() {
      var _this7 = this;

      this._element.style.display = 'none';

      this._element.setAttribute('aria-hidden', true);

      this._element.removeAttribute('aria-modal');

      this._isTransitioning = false;

      this._showBackdrop(function () {
        $(document.body).removeClass(ClassName$5.OPEN);

        _this7._resetAdjustments();

        _this7._resetScrollbar();

        $(_this7._element).trigger(Event$5.HIDDEN);
      });
    };

    _proto._removeBackdrop = function _removeBackdrop() {
      if (this._backdrop) {
        $(this._backdrop).remove();
        this._backdrop = null;
      }
    };

    _proto._showBackdrop = function _showBackdrop(callback) {
      var _this8 = this;

      var animate = $(this._element).hasClass(ClassName$5.FADE) ? ClassName$5.FADE : '';

      if (this._isShown && this._config.backdrop) {
        this._backdrop = document.createElement('div');
        this._backdrop.className = ClassName$5.BACKDROP;

        if (animate) {
          this._backdrop.classList.add(animate);
        }

        $(this._backdrop).appendTo(document.body);
        $(this._element).on(Event$5.CLICK_DISMISS, function (event) {
          if (_this8._ignoreBackdropClick) {
            _this8._ignoreBackdropClick = false;
            return;
          }

          if (event.target !== event.currentTarget) {
            return;
          }

          if (_this8._config.backdrop === 'static') {
            _this8._element.focus();
          } else {
            _this8.hide();
          }
        });

        if (animate) {
          Util.reflow(this._backdrop);
        }

        $(this._backdrop).addClass(ClassName$5.SHOW);

        if (!callback) {
          return;
        }

        if (!animate) {
          callback();
          return;
        }

        var backdropTransitionDuration = Util.getTransitionDurationFromElement(this._backdrop);
        $(this._backdrop).one(Util.TRANSITION_END, callback).emulateTransitionEnd(backdropTransitionDuration);
      } else if (!this._isShown && this._backdrop) {
        $(this._backdrop).removeClass(ClassName$5.SHOW);

        var callbackRemove = function callbackRemove() {
          _this8._removeBackdrop();

          if (callback) {
            callback();
          }
        };

        if ($(this._element).hasClass(ClassName$5.FADE)) {
          var _backdropTransitionDuration = Util.getTransitionDurationFromElement(this._backdrop);

          $(this._backdrop).one(Util.TRANSITION_END, callbackRemove).emulateTransitionEnd(_backdropTransitionDuration);
        } else {
          callbackRemove();
        }
      } else if (callback) {
        callback();
      }
    } // ----------------------------------------------------------------------
    // the following methods are used to handle overflowing modals
    // todo (fat): these should probably be refactored out of modal.js
    // ----------------------------------------------------------------------
    ;

    _proto._adjustDialog = function _adjustDialog() {
      var isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;

      if (!this._isBodyOverflowing && isModalOverflowing) {
        this._element.style.paddingLeft = this._scrollbarWidth + "px";
      }

      if (this._isBodyOverflowing && !isModalOverflowing) {
        this._element.style.paddingRight = this._scrollbarWidth + "px";
      }
    };

    _proto._resetAdjustments = function _resetAdjustments() {
      this._element.style.paddingLeft = '';
      this._element.style.paddingRight = '';
    };

    _proto._checkScrollbar = function _checkScrollbar() {
      var rect = document.body.getBoundingClientRect();
      this._isBodyOverflowing = rect.left + rect.right < window.innerWidth;
      this._scrollbarWidth = this._getScrollbarWidth();
    };

    _proto._setScrollbar = function _setScrollbar() {
      var _this9 = this;

      if (this._isBodyOverflowing) {
        // Note: DOMNode.style.paddingRight returns the actual value or '' if not set
        //   while $(DOMNode).css('padding-right') returns the calculated value or 0 if not set
        var fixedContent = [].slice.call(document.querySelectorAll(Selector$5.FIXED_CONTENT));
        var stickyContent = [].slice.call(document.querySelectorAll(Selector$5.STICKY_CONTENT)); // Adjust fixed content padding

        $(fixedContent).each(function (index, element) {
          var actualPadding = element.style.paddingRight;
          var calculatedPadding = $(element).css('padding-right');
          $(element).data('padding-right', actualPadding).css('padding-right', parseFloat(calculatedPadding) + _this9._scrollbarWidth + "px");
        }); // Adjust sticky content margin

        $(stickyContent).each(function (index, element) {
          var actualMargin = element.style.marginRight;
          var calculatedMargin = $(element).css('margin-right');
          $(element).data('margin-right', actualMargin).css('margin-right', parseFloat(calculatedMargin) - _this9._scrollbarWidth + "px");
        }); // Adjust body padding

        var actualPadding = document.body.style.paddingRight;
        var calculatedPadding = $(document.body).css('padding-right');
        $(document.body).data('padding-right', actualPadding).css('padding-right', parseFloat(calculatedPadding) + this._scrollbarWidth + "px");
      }

      $(document.body).addClass(ClassName$5.OPEN);
    };

    _proto._resetScrollbar = function _resetScrollbar() {
      // Restore fixed content padding
      var fixedContent = [].slice.call(document.querySelectorAll(Selector$5.FIXED_CONTENT));
      $(fixedContent).each(function (index, element) {
        var padding = $(element).data('padding-right');
        $(element).removeData('padding-right');
        element.style.paddingRight = padding ? padding : '';
      }); // Restore sticky content

      var elements = [].slice.call(document.querySelectorAll("" + Selector$5.STICKY_CONTENT));
      $(elements).each(function (index, element) {
        var margin = $(element).data('margin-right');

        if (typeof margin !== 'undefined') {
          $(element).css('margin-right', margin).removeData('margin-right');
        }
      }); // Restore body padding

      var padding = $(document.body).data('padding-right');
      $(document.body).removeData('padding-right');
      document.body.style.paddingRight = padding ? padding : '';
    };

    _proto._getScrollbarWidth = function _getScrollbarWidth() {
      // thx d.walsh
      var scrollDiv = document.createElement('div');
      scrollDiv.className = ClassName$5.SCROLLBAR_MEASURER;
      document.body.appendChild(scrollDiv);
      var scrollbarWidth = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth;
      document.body.removeChild(scrollDiv);
      return scrollbarWidth;
    } // Static
    ;

    Modal._jQueryInterface = function _jQueryInterface(config, relatedTarget) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY$5);

        var _config = _objectSpread({}, Default$3, $(this).data(), typeof config === 'object' && config ? config : {});

        if (!data) {
          data = new Modal(this, _config);
          $(this).data(DATA_KEY$5, data);
        }

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError("No method named \"" + config + "\"");
          }

          data[config](relatedTarget);
        } else if (_config.show) {
          data.show(relatedTarget);
        }
      });
    };

    _createClass(Modal, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION$5;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default$3;
      }
    }]);

    return Modal;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  $(document).on(Event$5.CLICK_DATA_API, Selector$5.DATA_TOGGLE, function (event) {
    var _this10 = this;

    var target;
    var selector = Util.getSelectorFromElement(this);

    if (selector) {
      target = document.querySelector(selector);
    }

    var config = $(target).data(DATA_KEY$5) ? 'toggle' : _objectSpread({}, $(target).data(), $(this).data());

    if (this.tagName === 'A' || this.tagName === 'AREA') {
      event.preventDefault();
    }

    var $target = $(target).one(Event$5.SHOW, function (showEvent) {
      if (showEvent.isDefaultPrevented()) {
        // Only register focus restorer if modal will actually get shown
        return;
      }

      $target.one(Event$5.HIDDEN, function () {
        if ($(_this10).is(':visible')) {
          _this10.focus();
        }
      });
    });

    Modal._jQueryInterface.call($(target), config, this);
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$5] = Modal._jQueryInterface;
  $.fn[NAME$5].Constructor = Modal;

  $.fn[NAME$5].noConflict = function () {
    $.fn[NAME$5] = JQUERY_NO_CONFLICT$5;
    return Modal._jQueryInterface;
  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v4.3.1): tools/sanitizer.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
   * --------------------------------------------------------------------------
   */
  var uriAttrs = ['background', 'cite', 'href', 'itemtype', 'longdesc', 'poster', 'src', 'xlink:href'];
  var ARIA_ATTRIBUTE_PATTERN = /^aria-[\w-]*$/i;
  var DefaultWhitelist = {
    // Global attributes allowed on any supplied element below.
    '*': ['class', 'dir', 'id', 'lang', 'role', ARIA_ATTRIBUTE_PATTERN],
    a: ['target', 'href', 'title', 'rel'],
    area: [],
    b: [],
    br: [],
    col: [],
    code: [],
    div: [],
    em: [],
    hr: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    i: [],
    img: ['src', 'alt', 'title', 'width', 'height'],
    li: [],
    ol: [],
    p: [],
    pre: [],
    s: [],
    small: [],
    span: [],
    sub: [],
    sup: [],
    strong: [],
    u: [],
    ul: []
    /**
     * A pattern that recognizes a commonly useful subset of URLs that are safe.
     *
     * Shoutout to Angular 7 https://github.com/angular/angular/blob/7.2.4/packages/core/src/sanitization/url_sanitizer.ts
     */

  };
  var SAFE_URL_PATTERN = /^(?:(?:https?|mailto|ftp|tel|file):|[^&:/?#]*(?:[/?#]|$))/gi;
  /**
   * A pattern that matches safe data URLs. Only matches image, video and audio types.
   *
   * Shoutout to Angular 7 https://github.com/angular/angular/blob/7.2.4/packages/core/src/sanitization/url_sanitizer.ts
   */

  var DATA_URL_PATTERN = /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[a-z0-9+/]+=*$/i;

  function allowedAttribute(attr, allowedAttributeList) {
    var attrName = attr.nodeName.toLowerCase();

    if (allowedAttributeList.indexOf(attrName) !== -1) {
      if (uriAttrs.indexOf(attrName) !== -1) {
        return Boolean(attr.nodeValue.match(SAFE_URL_PATTERN) || attr.nodeValue.match(DATA_URL_PATTERN));
      }

      return true;
    }

    var regExp = allowedAttributeList.filter(function (attrRegex) {
      return attrRegex instanceof RegExp;
    }); // Check if a regular expression validates the attribute.

    for (var i = 0, l = regExp.length; i < l; i++) {
      if (attrName.match(regExp[i])) {
        return true;
      }
    }

    return false;
  }

  function sanitizeHtml(unsafeHtml, whiteList, sanitizeFn) {
    if (unsafeHtml.length === 0) {
      return unsafeHtml;
    }

    if (sanitizeFn && typeof sanitizeFn === 'function') {
      return sanitizeFn(unsafeHtml);
    }

    var domParser = new window.DOMParser();
    var createdDocument = domParser.parseFromString(unsafeHtml, 'text/html');
    var whitelistKeys = Object.keys(whiteList);
    var elements = [].slice.call(createdDocument.body.querySelectorAll('*'));

    var _loop = function _loop(i, len) {
      var el = elements[i];
      var elName = el.nodeName.toLowerCase();

      if (whitelistKeys.indexOf(el.nodeName.toLowerCase()) === -1) {
        el.parentNode.removeChild(el);
        return "continue";
      }

      var attributeList = [].slice.call(el.attributes);
      var whitelistedAttributes = [].concat(whiteList['*'] || [], whiteList[elName] || []);
      attributeList.forEach(function (attr) {
        if (!allowedAttribute(attr, whitelistedAttributes)) {
          el.removeAttribute(attr.nodeName);
        }
      });
    };

    for (var i = 0, len = elements.length; i < len; i++) {
      var _ret = _loop(i, len);

      if (_ret === "continue") continue;
    }

    return createdDocument.body.innerHTML;
  }

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$6 = 'tooltip';
  var VERSION$6 = '4.3.1';
  var DATA_KEY$6 = 'bs.tooltip';
  var EVENT_KEY$6 = "." + DATA_KEY$6;
  var JQUERY_NO_CONFLICT$6 = $.fn[NAME$6];
  var CLASS_PREFIX = 'bs-tooltip';
  var BSCLS_PREFIX_REGEX = new RegExp("(^|\\s)" + CLASS_PREFIX + "\\S+", 'g');
  var DISALLOWED_ATTRIBUTES = ['sanitize', 'whiteList', 'sanitizeFn'];
  var DefaultType$4 = {
    animation: 'boolean',
    template: 'string',
    title: '(string|element|function)',
    trigger: 'string',
    delay: '(number|object)',
    html: 'boolean',
    selector: '(string|boolean)',
    placement: '(string|function)',
    offset: '(number|string|function)',
    container: '(string|element|boolean)',
    fallbackPlacement: '(string|array)',
    boundary: '(string|element)',
    sanitize: 'boolean',
    sanitizeFn: '(null|function)',
    whiteList: 'object'
  };
  var AttachmentMap$1 = {
    AUTO: 'auto',
    TOP: 'top',
    RIGHT: 'right',
    BOTTOM: 'bottom',
    LEFT: 'left'
  };
  var Default$4 = {
    animation: true,
    template: '<div class="tooltip" role="tooltip">' + '<div class="arrow"></div>' + '<div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    selector: false,
    placement: 'top',
    offset: 0,
    container: false,
    fallbackPlacement: 'flip',
    boundary: 'scrollParent',
    sanitize: true,
    sanitizeFn: null,
    whiteList: DefaultWhitelist
  };
  var HoverState = {
    SHOW: 'show',
    OUT: 'out'
  };
  var Event$6 = {
    HIDE: "hide" + EVENT_KEY$6,
    HIDDEN: "hidden" + EVENT_KEY$6,
    SHOW: "show" + EVENT_KEY$6,
    SHOWN: "shown" + EVENT_KEY$6,
    INSERTED: "inserted" + EVENT_KEY$6,
    CLICK: "click" + EVENT_KEY$6,
    FOCUSIN: "focusin" + EVENT_KEY$6,
    FOCUSOUT: "focusout" + EVENT_KEY$6,
    MOUSEENTER: "mouseenter" + EVENT_KEY$6,
    MOUSELEAVE: "mouseleave" + EVENT_KEY$6
  };
  var ClassName$6 = {
    FADE: 'fade',
    SHOW: 'show'
  };
  var Selector$6 = {
    TOOLTIP: '.tooltip',
    TOOLTIP_INNER: '.tooltip-inner',
    ARROW: '.arrow'
  };
  var Trigger = {
    HOVER: 'hover',
    FOCUS: 'focus',
    CLICK: 'click',
    MANUAL: 'manual'
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };

  var Tooltip =
  /*#__PURE__*/
  function () {
    function Tooltip(element, config) {
      /**
       * Check for Popper dependency
       * Popper - https://popper.js.org
       */
      if (typeof Popper === 'undefined') {
        throw new TypeError('Bootstrap\'s tooltips require Popper.js (https://popper.js.org/)');
      } // private


      this._isEnabled = true;
      this._timeout = 0;
      this._hoverState = '';
      this._activeTrigger = {};
      this._popper = null; // Protected

      this.element = element;
      this.config = this._getConfig(config);
      this.tip = null;

      this._setListeners();
    } // Getters


    var _proto = Tooltip.prototype;

    // Public
    _proto.enable = function enable() {
      this._isEnabled = true;
    };

    _proto.disable = function disable() {
      this._isEnabled = false;
    };

    _proto.toggleEnabled = function toggleEnabled() {
      this._isEnabled = !this._isEnabled;
    };

    _proto.toggle = function toggle(event) {
      if (!this._isEnabled) {
        return;
      }

      if (event) {
        var dataKey = this.constructor.DATA_KEY;
        var context = $(event.currentTarget).data(dataKey);

        if (!context) {
          context = new this.constructor(event.currentTarget, this._getDelegateConfig());
          $(event.currentTarget).data(dataKey, context);
        }

        context._activeTrigger.click = !context._activeTrigger.click;

        if (context._isWithActiveTrigger()) {
          context._enter(null, context);
        } else {
          context._leave(null, context);
        }
      } else {
        if ($(this.getTipElement()).hasClass(ClassName$6.SHOW)) {
          this._leave(null, this);

          return;
        }

        this._enter(null, this);
      }
    };

    _proto.dispose = function dispose() {
      clearTimeout(this._timeout);
      $.removeData(this.element, this.constructor.DATA_KEY);
      $(this.element).off(this.constructor.EVENT_KEY);
      $(this.element).closest('.modal').off('hide.bs.modal');

      if (this.tip) {
        $(this.tip).remove();
      }

      this._isEnabled = null;
      this._timeout = null;
      this._hoverState = null;
      this._activeTrigger = null;

      if (this._popper !== null) {
        this._popper.destroy();
      }

      this._popper = null;
      this.element = null;
      this.config = null;
      this.tip = null;
    };

    _proto.show = function show() {
      var _this = this;

      if ($(this.element).css('display') === 'none') {
        throw new Error('Please use show on visible elements');
      }

      var showEvent = $.Event(this.constructor.Event.SHOW);

      if (this.isWithContent() && this._isEnabled) {
        $(this.element).trigger(showEvent);
        var shadowRoot = Util.findShadowRoot(this.element);
        var isInTheDom = $.contains(shadowRoot !== null ? shadowRoot : this.element.ownerDocument.documentElement, this.element);

        if (showEvent.isDefaultPrevented() || !isInTheDom) {
          return;
        }

        var tip = this.getTipElement();
        var tipId = Util.getUID(this.constructor.NAME);
        tip.setAttribute('id', tipId);
        this.element.setAttribute('aria-describedby', tipId);
        this.setContent();

        if (this.config.animation) {
          $(tip).addClass(ClassName$6.FADE);
        }

        var placement = typeof this.config.placement === 'function' ? this.config.placement.call(this, tip, this.element) : this.config.placement;

        var attachment = this._getAttachment(placement);

        this.addAttachmentClass(attachment);

        var container = this._getContainer();

        $(tip).data(this.constructor.DATA_KEY, this);

        if (!$.contains(this.element.ownerDocument.documentElement, this.tip)) {
          $(tip).appendTo(container);
        }

        $(this.element).trigger(this.constructor.Event.INSERTED);
        this._popper = new Popper(this.element, tip, {
          placement: attachment,
          modifiers: {
            offset: this._getOffset(),
            flip: {
              behavior: this.config.fallbackPlacement
            },
            arrow: {
              element: Selector$6.ARROW
            },
            preventOverflow: {
              boundariesElement: this.config.boundary
            }
          },
          onCreate: function onCreate(data) {
            if (data.originalPlacement !== data.placement) {
              _this._handlePopperPlacementChange(data);
            }
          },
          onUpdate: function onUpdate(data) {
            return _this._handlePopperPlacementChange(data);
          }
        });
        $(tip).addClass(ClassName$6.SHOW); // If this is a touch-enabled device we add extra
        // empty mouseover listeners to the body's immediate children;
        // only needed because of broken event delegation on iOS
        // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html

        if ('ontouchstart' in document.documentElement) {
          $(document.body).children().on('mouseover', null, $.noop);
        }

        var complete = function complete() {
          if (_this.config.animation) {
            _this._fixTransition();
          }

          var prevHoverState = _this._hoverState;
          _this._hoverState = null;
          $(_this.element).trigger(_this.constructor.Event.SHOWN);

          if (prevHoverState === HoverState.OUT) {
            _this._leave(null, _this);
          }
        };

        if ($(this.tip).hasClass(ClassName$6.FADE)) {
          var transitionDuration = Util.getTransitionDurationFromElement(this.tip);
          $(this.tip).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
        } else {
          complete();
        }
      }
    };

    _proto.hide = function hide(callback) {
      var _this2 = this;

      var tip = this.getTipElement();
      var hideEvent = $.Event(this.constructor.Event.HIDE);

      var complete = function complete() {
        if (_this2._hoverState !== HoverState.SHOW && tip.parentNode) {
          tip.parentNode.removeChild(tip);
        }

        _this2._cleanTipClass();

        _this2.element.removeAttribute('aria-describedby');

        $(_this2.element).trigger(_this2.constructor.Event.HIDDEN);

        if (_this2._popper !== null) {
          _this2._popper.destroy();
        }

        if (callback) {
          callback();
        }
      };

      $(this.element).trigger(hideEvent);

      if (hideEvent.isDefaultPrevented()) {
        return;
      }

      $(tip).removeClass(ClassName$6.SHOW); // If this is a touch-enabled device we remove the extra
      // empty mouseover listeners we added for iOS support

      if ('ontouchstart' in document.documentElement) {
        $(document.body).children().off('mouseover', null, $.noop);
      }

      this._activeTrigger[Trigger.CLICK] = false;
      this._activeTrigger[Trigger.FOCUS] = false;
      this._activeTrigger[Trigger.HOVER] = false;

      if ($(this.tip).hasClass(ClassName$6.FADE)) {
        var transitionDuration = Util.getTransitionDurationFromElement(tip);
        $(tip).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
      } else {
        complete();
      }

      this._hoverState = '';
    };

    _proto.update = function update() {
      if (this._popper !== null) {
        this._popper.scheduleUpdate();
      }
    } // Protected
    ;

    _proto.isWithContent = function isWithContent() {
      return Boolean(this.getTitle());
    };

    _proto.addAttachmentClass = function addAttachmentClass(attachment) {
      $(this.getTipElement()).addClass(CLASS_PREFIX + "-" + attachment);
    };

    _proto.getTipElement = function getTipElement() {
      this.tip = this.tip || $(this.config.template)[0];
      return this.tip;
    };

    _proto.setContent = function setContent() {
      var tip = this.getTipElement();
      this.setElementContent($(tip.querySelectorAll(Selector$6.TOOLTIP_INNER)), this.getTitle());
      $(tip).removeClass(ClassName$6.FADE + " " + ClassName$6.SHOW);
    };

    _proto.setElementContent = function setElementContent($element, content) {
      if (typeof content === 'object' && (content.nodeType || content.jquery)) {
        // Content is a DOM node or a jQuery
        if (this.config.html) {
          if (!$(content).parent().is($element)) {
            $element.empty().append(content);
          }
        } else {
          $element.text($(content).text());
        }

        return;
      }

      if (this.config.html) {
        if (this.config.sanitize) {
          content = sanitizeHtml(content, this.config.whiteList, this.config.sanitizeFn);
        }

        $element.html(content);
      } else {
        $element.text(content);
      }
    };

    _proto.getTitle = function getTitle() {
      var title = this.element.getAttribute('data-original-title');

      if (!title) {
        title = typeof this.config.title === 'function' ? this.config.title.call(this.element) : this.config.title;
      }

      return title;
    } // Private
    ;

    _proto._getOffset = function _getOffset() {
      var _this3 = this;

      var offset = {};

      if (typeof this.config.offset === 'function') {
        offset.fn = function (data) {
          data.offsets = _objectSpread({}, data.offsets, _this3.config.offset(data.offsets, _this3.element) || {});
          return data;
        };
      } else {
        offset.offset = this.config.offset;
      }

      return offset;
    };

    _proto._getContainer = function _getContainer() {
      if (this.config.container === false) {
        return document.body;
      }

      if (Util.isElement(this.config.container)) {
        return $(this.config.container);
      }

      return $(document).find(this.config.container);
    };

    _proto._getAttachment = function _getAttachment(placement) {
      return AttachmentMap$1[placement.toUpperCase()];
    };

    _proto._setListeners = function _setListeners() {
      var _this4 = this;

      var triggers = this.config.trigger.split(' ');
      triggers.forEach(function (trigger) {
        if (trigger === 'click') {
          $(_this4.element).on(_this4.constructor.Event.CLICK, _this4.config.selector, function (event) {
            return _this4.toggle(event);
          });
        } else if (trigger !== Trigger.MANUAL) {
          var eventIn = trigger === Trigger.HOVER ? _this4.constructor.Event.MOUSEENTER : _this4.constructor.Event.FOCUSIN;
          var eventOut = trigger === Trigger.HOVER ? _this4.constructor.Event.MOUSELEAVE : _this4.constructor.Event.FOCUSOUT;
          $(_this4.element).on(eventIn, _this4.config.selector, function (event) {
            return _this4._enter(event);
          }).on(eventOut, _this4.config.selector, function (event) {
            return _this4._leave(event);
          });
        }
      });
      $(this.element).closest('.modal').on('hide.bs.modal', function () {
        if (_this4.element) {
          _this4.hide();
        }
      });

      if (this.config.selector) {
        this.config = _objectSpread({}, this.config, {
          trigger: 'manual',
          selector: ''
        });
      } else {
        this._fixTitle();
      }
    };

    _proto._fixTitle = function _fixTitle() {
      var titleType = typeof this.element.getAttribute('data-original-title');

      if (this.element.getAttribute('title') || titleType !== 'string') {
        this.element.setAttribute('data-original-title', this.element.getAttribute('title') || '');
        this.element.setAttribute('title', '');
      }
    };

    _proto._enter = function _enter(event, context) {
      var dataKey = this.constructor.DATA_KEY;
      context = context || $(event.currentTarget).data(dataKey);

      if (!context) {
        context = new this.constructor(event.currentTarget, this._getDelegateConfig());
        $(event.currentTarget).data(dataKey, context);
      }

      if (event) {
        context._activeTrigger[event.type === 'focusin' ? Trigger.FOCUS : Trigger.HOVER] = true;
      }

      if ($(context.getTipElement()).hasClass(ClassName$6.SHOW) || context._hoverState === HoverState.SHOW) {
        context._hoverState = HoverState.SHOW;
        return;
      }

      clearTimeout(context._timeout);
      context._hoverState = HoverState.SHOW;

      if (!context.config.delay || !context.config.delay.show) {
        context.show();
        return;
      }

      context._timeout = setTimeout(function () {
        if (context._hoverState === HoverState.SHOW) {
          context.show();
        }
      }, context.config.delay.show);
    };

    _proto._leave = function _leave(event, context) {
      var dataKey = this.constructor.DATA_KEY;
      context = context || $(event.currentTarget).data(dataKey);

      if (!context) {
        context = new this.constructor(event.currentTarget, this._getDelegateConfig());
        $(event.currentTarget).data(dataKey, context);
      }

      if (event) {
        context._activeTrigger[event.type === 'focusout' ? Trigger.FOCUS : Trigger.HOVER] = false;
      }

      if (context._isWithActiveTrigger()) {
        return;
      }

      clearTimeout(context._timeout);
      context._hoverState = HoverState.OUT;

      if (!context.config.delay || !context.config.delay.hide) {
        context.hide();
        return;
      }

      context._timeout = setTimeout(function () {
        if (context._hoverState === HoverState.OUT) {
          context.hide();
        }
      }, context.config.delay.hide);
    };

    _proto._isWithActiveTrigger = function _isWithActiveTrigger() {
      for (var trigger in this._activeTrigger) {
        if (this._activeTrigger[trigger]) {
          return true;
        }
      }

      return false;
    };

    _proto._getConfig = function _getConfig(config) {
      var dataAttributes = $(this.element).data();
      Object.keys(dataAttributes).forEach(function (dataAttr) {
        if (DISALLOWED_ATTRIBUTES.indexOf(dataAttr) !== -1) {
          delete dataAttributes[dataAttr];
        }
      });
      config = _objectSpread({}, this.constructor.Default, dataAttributes, typeof config === 'object' && config ? config : {});

      if (typeof config.delay === 'number') {
        config.delay = {
          show: config.delay,
          hide: config.delay
        };
      }

      if (typeof config.title === 'number') {
        config.title = config.title.toString();
      }

      if (typeof config.content === 'number') {
        config.content = config.content.toString();
      }

      Util.typeCheckConfig(NAME$6, config, this.constructor.DefaultType);

      if (config.sanitize) {
        config.template = sanitizeHtml(config.template, config.whiteList, config.sanitizeFn);
      }

      return config;
    };

    _proto._getDelegateConfig = function _getDelegateConfig() {
      var config = {};

      if (this.config) {
        for (var key in this.config) {
          if (this.constructor.Default[key] !== this.config[key]) {
            config[key] = this.config[key];
          }
        }
      }

      return config;
    };

    _proto._cleanTipClass = function _cleanTipClass() {
      var $tip = $(this.getTipElement());
      var tabClass = $tip.attr('class').match(BSCLS_PREFIX_REGEX);

      if (tabClass !== null && tabClass.length) {
        $tip.removeClass(tabClass.join(''));
      }
    };

    _proto._handlePopperPlacementChange = function _handlePopperPlacementChange(popperData) {
      var popperInstance = popperData.instance;
      this.tip = popperInstance.popper;

      this._cleanTipClass();

      this.addAttachmentClass(this._getAttachment(popperData.placement));
    };

    _proto._fixTransition = function _fixTransition() {
      var tip = this.getTipElement();
      var initConfigAnimation = this.config.animation;

      if (tip.getAttribute('x-placement') !== null) {
        return;
      }

      $(tip).removeClass(ClassName$6.FADE);
      this.config.animation = false;
      this.hide();
      this.show();
      this.config.animation = initConfigAnimation;
    } // Static
    ;

    Tooltip._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY$6);

        var _config = typeof config === 'object' && config;

        if (!data && /dispose|hide/.test(config)) {
          return;
        }

        if (!data) {
          data = new Tooltip(this, _config);
          $(this).data(DATA_KEY$6, data);
        }

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError("No method named \"" + config + "\"");
          }

          data[config]();
        }
      });
    };

    _createClass(Tooltip, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION$6;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default$4;
      }
    }, {
      key: "NAME",
      get: function get() {
        return NAME$6;
      }
    }, {
      key: "DATA_KEY",
      get: function get() {
        return DATA_KEY$6;
      }
    }, {
      key: "Event",
      get: function get() {
        return Event$6;
      }
    }, {
      key: "EVENT_KEY",
      get: function get() {
        return EVENT_KEY$6;
      }
    }, {
      key: "DefaultType",
      get: function get() {
        return DefaultType$4;
      }
    }]);

    return Tooltip;
  }();
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */


  $.fn[NAME$6] = Tooltip._jQueryInterface;
  $.fn[NAME$6].Constructor = Tooltip;

  $.fn[NAME$6].noConflict = function () {
    $.fn[NAME$6] = JQUERY_NO_CONFLICT$6;
    return Tooltip._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$7 = 'popover';
  var VERSION$7 = '4.3.1';
  var DATA_KEY$7 = 'bs.popover';
  var EVENT_KEY$7 = "." + DATA_KEY$7;
  var JQUERY_NO_CONFLICT$7 = $.fn[NAME$7];
  var CLASS_PREFIX$1 = 'bs-popover';
  var BSCLS_PREFIX_REGEX$1 = new RegExp("(^|\\s)" + CLASS_PREFIX$1 + "\\S+", 'g');

  var Default$5 = _objectSpread({}, Tooltip.Default, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip">' + '<div class="arrow"></div>' + '<h3 class="popover-header"></h3>' + '<div class="popover-body"></div></div>'
  });

  var DefaultType$5 = _objectSpread({}, Tooltip.DefaultType, {
    content: '(string|element|function)'
  });

  var ClassName$7 = {
    FADE: 'fade',
    SHOW: 'show'
  };
  var Selector$7 = {
    TITLE: '.popover-header',
    CONTENT: '.popover-body'
  };
  var Event$7 = {
    HIDE: "hide" + EVENT_KEY$7,
    HIDDEN: "hidden" + EVENT_KEY$7,
    SHOW: "show" + EVENT_KEY$7,
    SHOWN: "shown" + EVENT_KEY$7,
    INSERTED: "inserted" + EVENT_KEY$7,
    CLICK: "click" + EVENT_KEY$7,
    FOCUSIN: "focusin" + EVENT_KEY$7,
    FOCUSOUT: "focusout" + EVENT_KEY$7,
    MOUSEENTER: "mouseenter" + EVENT_KEY$7,
    MOUSELEAVE: "mouseleave" + EVENT_KEY$7
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };

  var Popover =
  /*#__PURE__*/
  function (_Tooltip) {
    _inheritsLoose(Popover, _Tooltip);

    function Popover() {
      return _Tooltip.apply(this, arguments) || this;
    }

    var _proto = Popover.prototype;

    // Overrides
    _proto.isWithContent = function isWithContent() {
      return this.getTitle() || this._getContent();
    };

    _proto.addAttachmentClass = function addAttachmentClass(attachment) {
      $(this.getTipElement()).addClass(CLASS_PREFIX$1 + "-" + attachment);
    };

    _proto.getTipElement = function getTipElement() {
      this.tip = this.tip || $(this.config.template)[0];
      return this.tip;
    };

    _proto.setContent = function setContent() {
      var $tip = $(this.getTipElement()); // We use append for html objects to maintain js events

      this.setElementContent($tip.find(Selector$7.TITLE), this.getTitle());

      var content = this._getContent();

      if (typeof content === 'function') {
        content = content.call(this.element);
      }

      this.setElementContent($tip.find(Selector$7.CONTENT), content);
      $tip.removeClass(ClassName$7.FADE + " " + ClassName$7.SHOW);
    } // Private
    ;

    _proto._getContent = function _getContent() {
      return this.element.getAttribute('data-content') || this.config.content;
    };

    _proto._cleanTipClass = function _cleanTipClass() {
      var $tip = $(this.getTipElement());
      var tabClass = $tip.attr('class').match(BSCLS_PREFIX_REGEX$1);

      if (tabClass !== null && tabClass.length > 0) {
        $tip.removeClass(tabClass.join(''));
      }
    } // Static
    ;

    Popover._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY$7);

        var _config = typeof config === 'object' ? config : null;

        if (!data && /dispose|hide/.test(config)) {
          return;
        }

        if (!data) {
          data = new Popover(this, _config);
          $(this).data(DATA_KEY$7, data);
        }

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError("No method named \"" + config + "\"");
          }

          data[config]();
        }
      });
    };

    _createClass(Popover, null, [{
      key: "VERSION",
      // Getters
      get: function get() {
        return VERSION$7;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default$5;
      }
    }, {
      key: "NAME",
      get: function get() {
        return NAME$7;
      }
    }, {
      key: "DATA_KEY",
      get: function get() {
        return DATA_KEY$7;
      }
    }, {
      key: "Event",
      get: function get() {
        return Event$7;
      }
    }, {
      key: "EVENT_KEY",
      get: function get() {
        return EVENT_KEY$7;
      }
    }, {
      key: "DefaultType",
      get: function get() {
        return DefaultType$5;
      }
    }]);

    return Popover;
  }(Tooltip);
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */


  $.fn[NAME$7] = Popover._jQueryInterface;
  $.fn[NAME$7].Constructor = Popover;

  $.fn[NAME$7].noConflict = function () {
    $.fn[NAME$7] = JQUERY_NO_CONFLICT$7;
    return Popover._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$8 = 'scrollspy';
  var VERSION$8 = '4.3.1';
  var DATA_KEY$8 = 'bs.scrollspy';
  var EVENT_KEY$8 = "." + DATA_KEY$8;
  var DATA_API_KEY$6 = '.data-api';
  var JQUERY_NO_CONFLICT$8 = $.fn[NAME$8];
  var Default$6 = {
    offset: 10,
    method: 'auto',
    target: ''
  };
  var DefaultType$6 = {
    offset: 'number',
    method: 'string',
    target: '(string|element)'
  };
  var Event$8 = {
    ACTIVATE: "activate" + EVENT_KEY$8,
    SCROLL: "scroll" + EVENT_KEY$8,
    LOAD_DATA_API: "load" + EVENT_KEY$8 + DATA_API_KEY$6
  };
  var ClassName$8 = {
    DROPDOWN_ITEM: 'dropdown-item',
    DROPDOWN_MENU: 'dropdown-menu',
    ACTIVE: 'active'
  };
  var Selector$8 = {
    DATA_SPY: '[data-spy="scroll"]',
    ACTIVE: '.active',
    NAV_LIST_GROUP: '.nav, .list-group',
    NAV_LINKS: '.nav-link',
    NAV_ITEMS: '.nav-item',
    LIST_ITEMS: '.list-group-item',
    DROPDOWN: '.dropdown',
    DROPDOWN_ITEMS: '.dropdown-item',
    DROPDOWN_TOGGLE: '.dropdown-toggle'
  };
  var OffsetMethod = {
    OFFSET: 'offset',
    POSITION: 'position'
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };

  var ScrollSpy =
  /*#__PURE__*/
  function () {
    function ScrollSpy(element, config) {
      var _this = this;

      this._element = element;
      this._scrollElement = element.tagName === 'BODY' ? window : element;
      this._config = this._getConfig(config);
      this._selector = this._config.target + " " + Selector$8.NAV_LINKS + "," + (this._config.target + " " + Selector$8.LIST_ITEMS + ",") + (this._config.target + " " + Selector$8.DROPDOWN_ITEMS);
      this._offsets = [];
      this._targets = [];
      this._activeTarget = null;
      this._scrollHeight = 0;
      $(this._scrollElement).on(Event$8.SCROLL, function (event) {
        return _this._process(event);
      });
      this.refresh();

      this._process();
    } // Getters


    var _proto = ScrollSpy.prototype;

    // Public
    _proto.refresh = function refresh() {
      var _this2 = this;

      var autoMethod = this._scrollElement === this._scrollElement.window ? OffsetMethod.OFFSET : OffsetMethod.POSITION;
      var offsetMethod = this._config.method === 'auto' ? autoMethod : this._config.method;
      var offsetBase = offsetMethod === OffsetMethod.POSITION ? this._getScrollTop() : 0;
      this._offsets = [];
      this._targets = [];
      this._scrollHeight = this._getScrollHeight();
      var targets = [].slice.call(document.querySelectorAll(this._selector));
      targets.map(function (element) {
        var target;
        var targetSelector = Util.getSelectorFromElement(element);

        if (targetSelector) {
          target = document.querySelector(targetSelector);
        }

        if (target) {
          var targetBCR = target.getBoundingClientRect();

          if (targetBCR.width || targetBCR.height) {
            // TODO (fat): remove sketch reliance on jQuery position/offset
            return [$(target)[offsetMethod]().top + offsetBase, targetSelector];
          }
        }

        return null;
      }).filter(function (item) {
        return item;
      }).sort(function (a, b) {
        return a[0] - b[0];
      }).forEach(function (item) {
        _this2._offsets.push(item[0]);

        _this2._targets.push(item[1]);
      });
    };

    _proto.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY$8);
      $(this._scrollElement).off(EVENT_KEY$8);
      this._element = null;
      this._scrollElement = null;
      this._config = null;
      this._selector = null;
      this._offsets = null;
      this._targets = null;
      this._activeTarget = null;
      this._scrollHeight = null;
    } // Private
    ;

    _proto._getConfig = function _getConfig(config) {
      config = _objectSpread({}, Default$6, typeof config === 'object' && config ? config : {});

      if (typeof config.target !== 'string') {
        var id = $(config.target).attr('id');

        if (!id) {
          id = Util.getUID(NAME$8);
          $(config.target).attr('id', id);
        }

        config.target = "#" + id;
      }

      Util.typeCheckConfig(NAME$8, config, DefaultType$6);
      return config;
    };

    _proto._getScrollTop = function _getScrollTop() {
      return this._scrollElement === window ? this._scrollElement.pageYOffset : this._scrollElement.scrollTop;
    };

    _proto._getScrollHeight = function _getScrollHeight() {
      return this._scrollElement.scrollHeight || Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    };

    _proto._getOffsetHeight = function _getOffsetHeight() {
      return this._scrollElement === window ? window.innerHeight : this._scrollElement.getBoundingClientRect().height;
    };

    _proto._process = function _process() {
      var scrollTop = this._getScrollTop() + this._config.offset;

      var scrollHeight = this._getScrollHeight();

      var maxScroll = this._config.offset + scrollHeight - this._getOffsetHeight();

      if (this._scrollHeight !== scrollHeight) {
        this.refresh();
      }

      if (scrollTop >= maxScroll) {
        var target = this._targets[this._targets.length - 1];

        if (this._activeTarget !== target) {
          this._activate(target);
        }

        return;
      }

      if (this._activeTarget && scrollTop < this._offsets[0] && this._offsets[0] > 0) {
        this._activeTarget = null;

        this._clear();

        return;
      }

      var offsetLength = this._offsets.length;

      for (var i = offsetLength; i--;) {
        var isActiveTarget = this._activeTarget !== this._targets[i] && scrollTop >= this._offsets[i] && (typeof this._offsets[i + 1] === 'undefined' || scrollTop < this._offsets[i + 1]);

        if (isActiveTarget) {
          this._activate(this._targets[i]);
        }
      }
    };

    _proto._activate = function _activate(target) {
      this._activeTarget = target;

      this._clear();

      var queries = this._selector.split(',').map(function (selector) {
        return selector + "[data-target=\"" + target + "\"]," + selector + "[href=\"" + target + "\"]";
      });

      var $link = $([].slice.call(document.querySelectorAll(queries.join(','))));

      if ($link.hasClass(ClassName$8.DROPDOWN_ITEM)) {
        $link.closest(Selector$8.DROPDOWN).find(Selector$8.DROPDOWN_TOGGLE).addClass(ClassName$8.ACTIVE);
        $link.addClass(ClassName$8.ACTIVE);
      } else {
        // Set triggered link as active
        $link.addClass(ClassName$8.ACTIVE); // Set triggered links parents as active
        // With both <ul> and <nav> markup a parent is the previous sibling of any nav ancestor

        $link.parents(Selector$8.NAV_LIST_GROUP).prev(Selector$8.NAV_LINKS + ", " + Selector$8.LIST_ITEMS).addClass(ClassName$8.ACTIVE); // Handle special case when .nav-link is inside .nav-item

        $link.parents(Selector$8.NAV_LIST_GROUP).prev(Selector$8.NAV_ITEMS).children(Selector$8.NAV_LINKS).addClass(ClassName$8.ACTIVE);
      }

      $(this._scrollElement).trigger(Event$8.ACTIVATE, {
        relatedTarget: target
      });
    };

    _proto._clear = function _clear() {
      [].slice.call(document.querySelectorAll(this._selector)).filter(function (node) {
        return node.classList.contains(ClassName$8.ACTIVE);
      }).forEach(function (node) {
        return node.classList.remove(ClassName$8.ACTIVE);
      });
    } // Static
    ;

    ScrollSpy._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $(this).data(DATA_KEY$8);

        var _config = typeof config === 'object' && config;

        if (!data) {
          data = new ScrollSpy(this, _config);
          $(this).data(DATA_KEY$8, data);
        }

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError("No method named \"" + config + "\"");
          }

          data[config]();
        }
      });
    };

    _createClass(ScrollSpy, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION$8;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default$6;
      }
    }]);

    return ScrollSpy;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  $(window).on(Event$8.LOAD_DATA_API, function () {
    var scrollSpys = [].slice.call(document.querySelectorAll(Selector$8.DATA_SPY));
    var scrollSpysLength = scrollSpys.length;

    for (var i = scrollSpysLength; i--;) {
      var $spy = $(scrollSpys[i]);

      ScrollSpy._jQueryInterface.call($spy, $spy.data());
    }
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$8] = ScrollSpy._jQueryInterface;
  $.fn[NAME$8].Constructor = ScrollSpy;

  $.fn[NAME$8].noConflict = function () {
    $.fn[NAME$8] = JQUERY_NO_CONFLICT$8;
    return ScrollSpy._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$9 = 'tab';
  var VERSION$9 = '4.3.1';
  var DATA_KEY$9 = 'bs.tab';
  var EVENT_KEY$9 = "." + DATA_KEY$9;
  var DATA_API_KEY$7 = '.data-api';
  var JQUERY_NO_CONFLICT$9 = $.fn[NAME$9];
  var Event$9 = {
    HIDE: "hide" + EVENT_KEY$9,
    HIDDEN: "hidden" + EVENT_KEY$9,
    SHOW: "show" + EVENT_KEY$9,
    SHOWN: "shown" + EVENT_KEY$9,
    CLICK_DATA_API: "click" + EVENT_KEY$9 + DATA_API_KEY$7
  };
  var ClassName$9 = {
    DROPDOWN_MENU: 'dropdown-menu',
    ACTIVE: 'active',
    DISABLED: 'disabled',
    FADE: 'fade',
    SHOW: 'show'
  };
  var Selector$9 = {
    DROPDOWN: '.dropdown',
    NAV_LIST_GROUP: '.nav, .list-group',
    ACTIVE: '.active',
    ACTIVE_UL: '> li > .active',
    DATA_TOGGLE: '[data-toggle="tab"], [data-toggle="pill"], [data-toggle="list"]',
    DROPDOWN_TOGGLE: '.dropdown-toggle',
    DROPDOWN_ACTIVE_CHILD: '> .dropdown-menu .active'
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };

  var Tab =
  /*#__PURE__*/
  function () {
    function Tab(element) {
      this._element = element;
    } // Getters


    var _proto = Tab.prototype;

    // Public
    _proto.show = function show() {
      var _this = this;

      if (this._element.parentNode && this._element.parentNode.nodeType === Node.ELEMENT_NODE && $(this._element).hasClass(ClassName$9.ACTIVE) || $(this._element).hasClass(ClassName$9.DISABLED)) {
        return;
      }

      var target;
      var previous;
      var listElement = $(this._element).closest(Selector$9.NAV_LIST_GROUP)[0];
      var selector = Util.getSelectorFromElement(this._element);

      if (listElement) {
        var itemSelector = listElement.nodeName === 'UL' || listElement.nodeName === 'OL' ? Selector$9.ACTIVE_UL : Selector$9.ACTIVE;
        previous = $.makeArray($(listElement).find(itemSelector));
        previous = previous[previous.length - 1];
      }

      var hideEvent = $.Event(Event$9.HIDE, {
        relatedTarget: this._element
      });
      var showEvent = $.Event(Event$9.SHOW, {
        relatedTarget: previous
      });

      if (previous) {
        $(previous).trigger(hideEvent);
      }

      $(this._element).trigger(showEvent);

      if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) {
        return;
      }

      if (selector) {
        target = document.querySelector(selector);
      }

      this._activate(this._element, listElement);

      var complete = function complete() {
        var hiddenEvent = $.Event(Event$9.HIDDEN, {
          relatedTarget: _this._element
        });
        var shownEvent = $.Event(Event$9.SHOWN, {
          relatedTarget: previous
        });
        $(previous).trigger(hiddenEvent);
        $(_this._element).trigger(shownEvent);
      };

      if (target) {
        this._activate(target, target.parentNode, complete);
      } else {
        complete();
      }
    };

    _proto.dispose = function dispose() {
      $.removeData(this._element, DATA_KEY$9);
      this._element = null;
    } // Private
    ;

    _proto._activate = function _activate(element, container, callback) {
      var _this2 = this;

      var activeElements = container && (container.nodeName === 'UL' || container.nodeName === 'OL') ? $(container).find(Selector$9.ACTIVE_UL) : $(container).children(Selector$9.ACTIVE);
      var active = activeElements[0];
      var isTransitioning = callback && active && $(active).hasClass(ClassName$9.FADE);

      var complete = function complete() {
        return _this2._transitionComplete(element, active, callback);
      };

      if (active && isTransitioning) {
        var transitionDuration = Util.getTransitionDurationFromElement(active);
        $(active).removeClass(ClassName$9.SHOW).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
      } else {
        complete();
      }
    };

    _proto._transitionComplete = function _transitionComplete(element, active, callback) {
      if (active) {
        $(active).removeClass(ClassName$9.ACTIVE);
        var dropdownChild = $(active.parentNode).find(Selector$9.DROPDOWN_ACTIVE_CHILD)[0];

        if (dropdownChild) {
          $(dropdownChild).removeClass(ClassName$9.ACTIVE);
        }

        if (active.getAttribute('role') === 'tab') {
          active.setAttribute('aria-selected', false);
        }
      }

      $(element).addClass(ClassName$9.ACTIVE);

      if (element.getAttribute('role') === 'tab') {
        element.setAttribute('aria-selected', true);
      }

      Util.reflow(element);

      if (element.classList.contains(ClassName$9.FADE)) {
        element.classList.add(ClassName$9.SHOW);
      }

      if (element.parentNode && $(element.parentNode).hasClass(ClassName$9.DROPDOWN_MENU)) {
        var dropdownElement = $(element).closest(Selector$9.DROPDOWN)[0];

        if (dropdownElement) {
          var dropdownToggleList = [].slice.call(dropdownElement.querySelectorAll(Selector$9.DROPDOWN_TOGGLE));
          $(dropdownToggleList).addClass(ClassName$9.ACTIVE);
        }

        element.setAttribute('aria-expanded', true);
      }

      if (callback) {
        callback();
      }
    } // Static
    ;

    Tab._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var $this = $(this);
        var data = $this.data(DATA_KEY$9);

        if (!data) {
          data = new Tab(this);
          $this.data(DATA_KEY$9, data);
        }

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError("No method named \"" + config + "\"");
          }

          data[config]();
        }
      });
    };

    _createClass(Tab, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION$9;
      }
    }]);

    return Tab;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  $(document).on(Event$9.CLICK_DATA_API, Selector$9.DATA_TOGGLE, function (event) {
    event.preventDefault();

    Tab._jQueryInterface.call($(this), 'show');
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $.fn[NAME$9] = Tab._jQueryInterface;
  $.fn[NAME$9].Constructor = Tab;

  $.fn[NAME$9].noConflict = function () {
    $.fn[NAME$9] = JQUERY_NO_CONFLICT$9;
    return Tab._jQueryInterface;
  };

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  var NAME$a = 'toast';
  var VERSION$a = '4.3.1';
  var DATA_KEY$a = 'bs.toast';
  var EVENT_KEY$a = "." + DATA_KEY$a;
  var JQUERY_NO_CONFLICT$a = $.fn[NAME$a];
  var Event$a = {
    CLICK_DISMISS: "click.dismiss" + EVENT_KEY$a,
    HIDE: "hide" + EVENT_KEY$a,
    HIDDEN: "hidden" + EVENT_KEY$a,
    SHOW: "show" + EVENT_KEY$a,
    SHOWN: "shown" + EVENT_KEY$a
  };
  var ClassName$a = {
    FADE: 'fade',
    HIDE: 'hide',
    SHOW: 'show',
    SHOWING: 'showing'
  };
  var DefaultType$7 = {
    animation: 'boolean',
    autohide: 'boolean',
    delay: 'number'
  };
  var Default$7 = {
    animation: true,
    autohide: true,
    delay: 500
  };
  var Selector$a = {
    DATA_DISMISS: '[data-dismiss="toast"]'
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };

  var Toast =
  /*#__PURE__*/
  function () {
    function Toast(element, config) {
      this._element = element;
      this._config = this._getConfig(config);
      this._timeout = null;

      this._setListeners();
    } // Getters


    var _proto = Toast.prototype;

    // Public
    _proto.show = function show() {
      var _this = this;

      $(this._element).trigger(Event$a.SHOW);

      if (this._config.animation) {
        this._element.classList.add(ClassName$a.FADE);
      }

      var complete = function complete() {
        _this._element.classList.remove(ClassName$a.SHOWING);

        _this._element.classList.add(ClassName$a.SHOW);

        $(_this._element).trigger(Event$a.SHOWN);

        if (_this._config.autohide) {
          _this.hide();
        }
      };

      this._element.classList.remove(ClassName$a.HIDE);

      this._element.classList.add(ClassName$a.SHOWING);

      if (this._config.animation) {
        var transitionDuration = Util.getTransitionDurationFromElement(this._element);
        $(this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
      } else {
        complete();
      }
    };

    _proto.hide = function hide(withoutTimeout) {
      var _this2 = this;

      if (!this._element.classList.contains(ClassName$a.SHOW)) {
        return;
      }

      $(this._element).trigger(Event$a.HIDE);

      if (withoutTimeout) {
        this._close();
      } else {
        this._timeout = setTimeout(function () {
          _this2._close();
        }, this._config.delay);
      }
    };

    _proto.dispose = function dispose() {
      clearTimeout(this._timeout);
      this._timeout = null;

      if (this._element.classList.contains(ClassName$a.SHOW)) {
        this._element.classList.remove(ClassName$a.SHOW);
      }

      $(this._element).off(Event$a.CLICK_DISMISS);
      $.removeData(this._element, DATA_KEY$a);
      this._element = null;
      this._config = null;
    } // Private
    ;

    _proto._getConfig = function _getConfig(config) {
      config = _objectSpread({}, Default$7, $(this._element).data(), typeof config === 'object' && config ? config : {});
      Util.typeCheckConfig(NAME$a, config, this.constructor.DefaultType);
      return config;
    };

    _proto._setListeners = function _setListeners() {
      var _this3 = this;

      $(this._element).on(Event$a.CLICK_DISMISS, Selector$a.DATA_DISMISS, function () {
        return _this3.hide(true);
      });
    };

    _proto._close = function _close() {
      var _this4 = this;

      var complete = function complete() {
        _this4._element.classList.add(ClassName$a.HIDE);

        $(_this4._element).trigger(Event$a.HIDDEN);
      };

      this._element.classList.remove(ClassName$a.SHOW);

      if (this._config.animation) {
        var transitionDuration = Util.getTransitionDurationFromElement(this._element);
        $(this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
      } else {
        complete();
      }
    } // Static
    ;

    Toast._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var $element = $(this);
        var data = $element.data(DATA_KEY$a);

        var _config = typeof config === 'object' && config;

        if (!data) {
          data = new Toast(this, _config);
          $element.data(DATA_KEY$a, data);
        }

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError("No method named \"" + config + "\"");
          }

          data[config](this);
        }
      });
    };

    _createClass(Toast, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION$a;
      }
    }, {
      key: "DefaultType",
      get: function get() {
        return DefaultType$7;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default$7;
      }
    }]);

    return Toast;
  }();
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */


  $.fn[NAME$a] = Toast._jQueryInterface;
  $.fn[NAME$a].Constructor = Toast;

  $.fn[NAME$a].noConflict = function () {
    $.fn[NAME$a] = JQUERY_NO_CONFLICT$a;
    return Toast._jQueryInterface;
  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap (v4.3.1): index.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
   * --------------------------------------------------------------------------
   */

  (function () {
    if (typeof $ === 'undefined') {
      throw new TypeError('Bootstrap\'s JavaScript requires jQuery. jQuery must be included before Bootstrap\'s JavaScript.');
    }

    var version = $.fn.jquery.split(' ')[0].split('.');
    var minMajor = 1;
    var ltMajor = 2;
    var minMinor = 9;
    var minPatch = 1;
    var maxMajor = 4;

    if (version[0] < ltMajor && version[1] < minMinor || version[0] === minMajor && version[1] === minMinor && version[2] < minPatch || version[0] >= maxMajor) {
      throw new Error('Bootstrap\'s JavaScript requires at least jQuery v1.9.1 but less than v4.0.0');
    }
  })();

  exports.Util = Util;
  exports.Alert = Alert;
  exports.Button = Button;
  exports.Carousel = Carousel;
  exports.Collapse = Collapse;
  exports.Dropdown = Dropdown;
  exports.Modal = Modal;
  exports.Popover = Popover;
  exports.Scrollspy = ScrollSpy;
  exports.Tab = Tab;
  exports.Toast = Toast;
  exports.Tooltip = Tooltip;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=bootstrap.js.map

;/*! p5.js v0.10.2 October 14, 2019 */

;/*! p5.sound.js v0.3.11 2019-03-14 */
/**
 *  p5.sound extends p5 with <a href="http://caniuse.com/audio-api"
 *  target="_blank">Web Audio</a> functionality including audio input,
 *  playback, analysis and synthesis.
 *  <br/><br/>
 *  <a href="#/p5.SoundFile"><b>p5.SoundFile</b></a>: Load and play sound files.<br/>
 *  <a href="#/p5.Amplitude"><b>p5.Amplitude</b></a>: Get the current volume of a sound.<br/>
 *  <a href="#/p5.AudioIn"><b>p5.AudioIn</b></a>: Get sound from an input source, typically
 *    a computer microphone.<br/>
 *  <a href="#/p5.FFT"><b>p5.FFT</b></a>: Analyze the frequency of sound. Returns
 *    results from the frequency spectrum or time domain (waveform).<br/>
 *  <a href="#/p5.Oscillator"><b>p5.Oscillator</b></a>: Generate Sine,
 *    Triangle, Square and Sawtooth waveforms. Base class of
 *    <a href="#/p5.Noise">p5.Noise</a> and <a href="#/p5.Pulse">p5.Pulse</a>.
 *    <br/>
 *  <a href="#/p5.Envelope"><b>p5.Envelope</b></a>: An Envelope is a series
 *    of fades over time. Often used to control an object's
 *    output gain level as an "ADSR Envelope" (Attack, Decay,
 *    Sustain, Release). Can also modulate other parameters.<br/>
 *  <a href="#/p5.Delay"><b>p5.Delay</b></a>: A delay effect with
 *    parameters for feedback, delayTime, and lowpass filter.<br/>
 *  <a href="#/p5.Filter"><b>p5.Filter</b></a>: Filter the frequency range of a
 *    sound.
 *  <br/>
 *  <a href="#/p5.Reverb"><b>p5.Reverb</b></a>: Add reverb to a sound by specifying
 *    duration and decay. <br/>
 *  <b><a href="#/p5.Convolver">p5.Convolver</a>:</b> Extends
 *  <a href="#/p5.Reverb">p5.Reverb</a> to simulate the sound of real
 *    physical spaces through convolution.<br/>
 *  <b><a href="#/p5.SoundRecorder">p5.SoundRecorder</a></b>: Record sound for playback
 *    / save the .wav file.
 *  <b><a href="#/p5.Phrase">p5.Phrase</a></b>, <b><a href="#/p5.Part">p5.Part</a></b> and
 *  <b><a href="#/p5.Score">p5.Score</a></b>: Compose musical sequences.
 *  <br/><br/>
 *  p5.sound is on <a href="https://github.com/therewasaguy/p5.sound/">GitHub</a>.
 *  Download the latest version
 *  <a href="https://github.com/therewasaguy/p5.sound/blob/master/lib/p5.sound.js">here</a>.
 *
 *  @module p5.sound
 *  @submodule p5.sound
 *  @for p5.sound
 *  @main
 */

/**
 *  p5.sound 
 *  https://p5js.org/reference/#/libraries/p5.sound
 *
 *  From the Processing Foundation and contributors
 *  https://github.com/processing/p5.js-sound/graphs/contributors
 *
 *  MIT License (MIT)
 *  https://github.com/processing/p5.js-sound/blob/master/LICENSE
 *
 *  Some of the many audio libraries & resources that inspire p5.sound:
 *   - TONE.js (c) Yotam Mann. Licensed under The MIT License (MIT). https://github.com/TONEnoTONE/Tone.js
 *   - buzz.js (c) Jay Salvat. Licensed under The MIT License (MIT). http://buzz.jaysalvat.com/
 *   - Boris Smus Web Audio API book, 2013. Licensed under the Apache License http://www.apache.org/licenses/LICENSE-2.0
 *   - wavesurfer.js https://github.com/katspaugh/wavesurfer.js
 *   - Web Audio Components by Jordan Santell https://github.com/web-audio-components
 *   - Wilm Thoben's Sound library for Processing https://github.com/processing/processing/tree/master/java/libraries/sound
 *
 *   Web Audio API: http://w3.org/TR/webaudio/
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd)
    define('p5.sound', ['p5'], function (p5) { (factory(p5));});
  else if (typeof exports === 'object')
    factory(require('../p5'));
  else
    factory(root['p5']);
}(this, function (p5) {
  
var shims;
'use strict';  /**
                * This module has shims
                */
shims = function () {
  /* AudioContext Monkeypatch
     Copyright 2013 Chris Wilson
     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at
         http://www.apache.org/licenses/LICENSE-2.0
     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
  */
  (function () {
    function fixSetTarget(param) {
      if (!param)
        // if NYI, just return
        return;
      if (!param.setTargetAtTime)
        param.setTargetAtTime = param.setTargetValueAtTime;
    }
    if (window.hasOwnProperty('webkitAudioContext') && !window.hasOwnProperty('AudioContext')) {
      window.AudioContext = window.webkitAudioContext;
      if (typeof AudioContext.prototype.createGain !== 'function')
        AudioContext.prototype.createGain = AudioContext.prototype.createGainNode;
      if (typeof AudioContext.prototype.createDelay !== 'function')
        AudioContext.prototype.createDelay = AudioContext.prototype.createDelayNode;
      if (typeof AudioContext.prototype.createScriptProcessor !== 'function')
        AudioContext.prototype.createScriptProcessor = AudioContext.prototype.createJavaScriptNode;
      if (typeof AudioContext.prototype.createPeriodicWave !== 'function')
        AudioContext.prototype.createPeriodicWave = AudioContext.prototype.createWaveTable;
      AudioContext.prototype.internal_createGain = AudioContext.prototype.createGain;
      AudioContext.prototype.createGain = function () {
        var node = this.internal_createGain();
        fixSetTarget(node.gain);
        return node;
      };
      AudioContext.prototype.internal_createDelay = AudioContext.prototype.createDelay;
      AudioContext.prototype.createDelay = function (maxDelayTime) {
        var node = maxDelayTime ? this.internal_createDelay(maxDelayTime) : this.internal_createDelay();
        fixSetTarget(node.delayTime);
        return node;
      };
      AudioContext.prototype.internal_createBufferSource = AudioContext.prototype.createBufferSource;
      AudioContext.prototype.createBufferSource = function () {
        var node = this.internal_createBufferSource();
        if (!node.start) {
          node.start = function (when, offset, duration) {
            if (offset || duration)
              this.noteGrainOn(when || 0, offset, duration);
            else
              this.noteOn(when || 0);
          };
        } else {
          node.internal_start = node.start;
          node.start = function (when, offset, duration) {
            if (typeof duration !== 'undefined')
              node.internal_start(when || 0, offset, duration);
            else
              node.internal_start(when || 0, offset || 0);
          };
        }
        if (!node.stop) {
          node.stop = function (when) {
            this.noteOff(when || 0);
          };
        } else {
          node.internal_stop = node.stop;
          node.stop = function (when) {
            node.internal_stop(when || 0);
          };
        }
        fixSetTarget(node.playbackRate);
        return node;
      };
      AudioContext.prototype.internal_createDynamicsCompressor = AudioContext.prototype.createDynamicsCompressor;
      AudioContext.prototype.createDynamicsCompressor = function () {
        var node = this.internal_createDynamicsCompressor();
        fixSetTarget(node.threshold);
        fixSetTarget(node.knee);
        fixSetTarget(node.ratio);
        fixSetTarget(node.reduction);
        fixSetTarget(node.attack);
        fixSetTarget(node.release);
        return node;
      };
      AudioContext.prototype.internal_createBiquadFilter = AudioContext.prototype.createBiquadFilter;
      AudioContext.prototype.createBiquadFilter = function () {
        var node = this.internal_createBiquadFilter();
        fixSetTarget(node.frequency);
        fixSetTarget(node.detune);
        fixSetTarget(node.Q);
        fixSetTarget(node.gain);
        return node;
      };
      if (typeof AudioContext.prototype.createOscillator !== 'function') {
        AudioContext.prototype.internal_createOscillator = AudioContext.prototype.createOscillator;
        AudioContext.prototype.createOscillator = function () {
          var node = this.internal_createOscillator();
          if (!node.start) {
            node.start = function (when) {
              this.noteOn(when || 0);
            };
          } else {
            node.internal_start = node.start;
            node.start = function (when) {
              node.internal_start(when || 0);
            };
          }
          if (!node.stop) {
            node.stop = function (when) {
              this.noteOff(when || 0);
            };
          } else {
            node.internal_stop = node.stop;
            node.stop = function (when) {
              node.internal_stop(when || 0);
            };
          }
          if (!node.setPeriodicWave)
            node.setPeriodicWave = node.setWaveTable;
          fixSetTarget(node.frequency);
          fixSetTarget(node.detune);
          return node;
        };
      }
    }
    if (window.hasOwnProperty('webkitOfflineAudioContext') && !window.hasOwnProperty('OfflineAudioContext')) {
      window.OfflineAudioContext = window.webkitOfflineAudioContext;
    }
  }(window));
  // <-- end MonkeyPatch.
  // Polyfill for AudioIn, also handled by p5.dom createCapture
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  /**
   * Determine which filetypes are supported (inspired by buzz.js)
   * The audio element (el) will only be used to test browser support for various audio formats
   */
  var el = document.createElement('audio');
  p5.prototype.isSupported = function () {
    return !!el.canPlayType;
  };
  var isOGGSupported = function () {
    return !!el.canPlayType && el.canPlayType('audio/ogg; codecs="vorbis"');
  };
  var isMP3Supported = function () {
    return !!el.canPlayType && el.canPlayType('audio/mpeg;');
  };
  var isWAVSupported = function () {
    return !!el.canPlayType && el.canPlayType('audio/wav; codecs="1"');
  };
  var isAACSupported = function () {
    return !!el.canPlayType && (el.canPlayType('audio/x-m4a;') || el.canPlayType('audio/aac;'));
  };
  var isAIFSupported = function () {
    return !!el.canPlayType && el.canPlayType('audio/x-aiff;');
  };
  p5.prototype.isFileSupported = function (extension) {
    switch (extension.toLowerCase()) {
    case 'mp3':
      return isMP3Supported();
    case 'wav':
      return isWAVSupported();
    case 'ogg':
      return isOGGSupported();
    case 'aac':
    case 'm4a':
    case 'mp4':
      return isAACSupported();
    case 'aif':
    case 'aiff':
      return isAIFSupported();
    default:
      return false;
    }
  };
}();
var StartAudioContext;
(function (root, factory) {
  if (true) {
    StartAudioContext = function () {
      return factory();
    }();
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.StartAudioContext = factory();
  }
}(this, function () {
  var TapListener = function (element, context) {
    this._dragged = false;
    this._element = element;
    this._bindedMove = this._moved.bind(this);
    this._bindedEnd = this._ended.bind(this, context);
    element.addEventListener('touchstart', this._bindedEnd);
    element.addEventListener('touchmove', this._bindedMove);
    element.addEventListener('touchend', this._bindedEnd);
    element.addEventListener('mouseup', this._bindedEnd);
  };
  TapListener.prototype._moved = function (e) {
    this._dragged = true;
  };
  TapListener.prototype._ended = function (context) {
    if (!this._dragged) {
      startContext(context);
    }
    this._dragged = false;
  };
  TapListener.prototype.dispose = function () {
    this._element.removeEventListener('touchstart', this._bindedEnd);
    this._element.removeEventListener('touchmove', this._bindedMove);
    this._element.removeEventListener('touchend', this._bindedEnd);
    this._element.removeEventListener('mouseup', this._bindedEnd);
    this._bindedMove = null;
    this._bindedEnd = null;
    this._element = null;
  };
  function startContext(context) {
    var buffer = context.createBuffer(1, 1, context.sampleRate);
    var source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(0);
    if (context.resume) {
      context.resume();
    }
  }
  function isStarted(context) {
    return context.state === 'running';
  }
  function onStarted(context, callback) {
    function checkLoop() {
      if (isStarted(context)) {
        callback();
      } else {
        requestAnimationFrame(checkLoop);
        if (context.resume) {
          context.resume();
        }
      }
    }
    if (isStarted(context)) {
      callback();
    } else {
      checkLoop();
    }
  }
  function bindTapListener(element, tapListeners, context) {
    if (Array.isArray(element) || NodeList && element instanceof NodeList) {
      for (var i = 0; i < element.length; i++) {
        bindTapListener(element[i], tapListeners, context);
      }
    } else if (typeof element === 'string') {
      bindTapListener(document.querySelectorAll(element), tapListeners, context);
    } else if (element.jquery && typeof element.toArray === 'function') {
      bindTapListener(element.toArray(), tapListeners, context);
    } else if (Element && element instanceof Element) {
      var tap = new TapListener(element, context);
      tapListeners.push(tap);
    }
  }
  function StartAudioContext(context, elements, callback) {
    var promise = new Promise(function (success) {
      onStarted(context, success);
    });
    var tapListeners = [];
    if (!elements) {
      elements = document.body;
    }
    bindTapListener(elements, tapListeners, context);
    promise.then(function () {
      for (var i = 0; i < tapListeners.length; i++) {
        tapListeners[i].dispose();
      }
      tapListeners = null;
      if (callback) {
        callback();
      }
    });
    return promise;
  }
  return StartAudioContext;
}));
/** Tone.js module by Yotam Mann, MIT License 2016  http://opensource.org/licenses/MIT **/
var Tone_core_Tone;
Tone_core_Tone = function () {
  'use strict';
  var Tone = function (inputs, outputs) {
    if (this.isUndef(inputs) || inputs === 1) {
      this.input = this.context.createGain();
    } else if (inputs > 1) {
      this.input = new Array(inputs);
    }
    if (this.isUndef(outputs) || outputs === 1) {
      this.output = this.context.createGain();
    } else if (outputs > 1) {
      this.output = new Array(inputs);
    }
  };
  Tone.prototype.set = function (params, value, rampTime) {
    if (this.isObject(params)) {
      rampTime = value;
    } else if (this.isString(params)) {
      var tmpObj = {};
      tmpObj[params] = value;
      params = tmpObj;
    }
    paramLoop:
      for (var attr in params) {
        value = params[attr];
        var parent = this;
        if (attr.indexOf('.') !== -1) {
          var attrSplit = attr.split('.');
          for (var i = 0; i < attrSplit.length - 1; i++) {
            parent = parent[attrSplit[i]];
            if (parent instanceof Tone) {
              attrSplit.splice(0, i + 1);
              var innerParam = attrSplit.join('.');
              parent.set(innerParam, value);
              continue paramLoop;
            }
          }
          attr = attrSplit[attrSplit.length - 1];
        }
        var param = parent[attr];
        if (this.isUndef(param)) {
          continue;
        }
        if (Tone.Signal && param instanceof Tone.Signal || Tone.Param && param instanceof Tone.Param) {
          if (param.value !== value) {
            if (this.isUndef(rampTime)) {
              param.value = value;
            } else {
              param.rampTo(value, rampTime);
            }
          }
        } else if (param instanceof AudioParam) {
          if (param.value !== value) {
            param.value = value;
          }
        } else if (param instanceof Tone) {
          param.set(value);
        } else if (param !== value) {
          parent[attr] = value;
        }
      }
    return this;
  };
  Tone.prototype.get = function (params) {
    if (this.isUndef(params)) {
      params = this._collectDefaults(this.constructor);
    } else if (this.isString(params)) {
      params = [params];
    }
    var ret = {};
    for (var i = 0; i < params.length; i++) {
      var attr = params[i];
      var parent = this;
      var subRet = ret;
      if (attr.indexOf('.') !== -1) {
        var attrSplit = attr.split('.');
        for (var j = 0; j < attrSplit.length - 1; j++) {
          var subAttr = attrSplit[j];
          subRet[subAttr] = subRet[subAttr] || {};
          subRet = subRet[subAttr];
          parent = parent[subAttr];
        }
        attr = attrSplit[attrSplit.length - 1];
      }
      var param = parent[attr];
      if (this.isObject(params[attr])) {
        subRet[attr] = param.get();
      } else if (Tone.Signal && param instanceof Tone.Signal) {
        subRet[attr] = param.value;
      } else if (Tone.Param && param instanceof Tone.Param) {
        subRet[attr] = param.value;
      } else if (param instanceof AudioParam) {
        subRet[attr] = param.value;
      } else if (param instanceof Tone) {
        subRet[attr] = param.get();
      } else if (!this.isFunction(param) && !this.isUndef(param)) {
        subRet[attr] = param;
      }
    }
    return ret;
  };
  Tone.prototype._collectDefaults = function (constr) {
    var ret = [];
    if (!this.isUndef(constr.defaults)) {
      ret = Object.keys(constr.defaults);
    }
    if (!this.isUndef(constr._super)) {
      var superDefs = this._collectDefaults(constr._super);
      for (var i = 0; i < superDefs.length; i++) {
        if (ret.indexOf(superDefs[i]) === -1) {
          ret.push(superDefs[i]);
        }
      }
    }
    return ret;
  };
  Tone.prototype.toString = function () {
    for (var className in Tone) {
      var isLetter = className[0].match(/^[A-Z]$/);
      var sameConstructor = Tone[className] === this.constructor;
      if (this.isFunction(Tone[className]) && isLetter && sameConstructor) {
        return className;
      }
    }
    return 'Tone';
  };
  Object.defineProperty(Tone.prototype, 'numberOfInputs', {
    get: function () {
      if (this.input) {
        if (this.isArray(this.input)) {
          return this.input.length;
        } else {
          return 1;
        }
      } else {
        return 0;
      }
    }
  });
  Object.defineProperty(Tone.prototype, 'numberOfOutputs', {
    get: function () {
      if (this.output) {
        if (this.isArray(this.output)) {
          return this.output.length;
        } else {
          return 1;
        }
      } else {
        return 0;
      }
    }
  });
  Tone.prototype.dispose = function () {
    if (!this.isUndef(this.input)) {
      if (this.input instanceof AudioNode) {
        this.input.disconnect();
      }
      this.input = null;
    }
    if (!this.isUndef(this.output)) {
      if (this.output instanceof AudioNode) {
        this.output.disconnect();
      }
      this.output = null;
    }
    return this;
  };
  Tone.prototype.connect = function (unit, outputNum, inputNum) {
    if (Array.isArray(this.output)) {
      outputNum = this.defaultArg(outputNum, 0);
      this.output[outputNum].connect(unit, 0, inputNum);
    } else {
      this.output.connect(unit, outputNum, inputNum);
    }
    return this;
  };
  Tone.prototype.disconnect = function (destination, outputNum, inputNum) {
    if (this.isArray(this.output)) {
      if (this.isNumber(destination)) {
        this.output[destination].disconnect();
      } else {
        outputNum = this.defaultArg(outputNum, 0);
        this.output[outputNum].disconnect(destination, 0, inputNum);
      }
    } else {
      this.output.disconnect.apply(this.output, arguments);
    }
  };
  Tone.prototype.connectSeries = function () {
    if (arguments.length > 1) {
      var currentUnit = arguments[0];
      for (var i = 1; i < arguments.length; i++) {
        var toUnit = arguments[i];
        currentUnit.connect(toUnit);
        currentUnit = toUnit;
      }
    }
    return this;
  };
  Tone.prototype.chain = function () {
    if (arguments.length > 0) {
      var currentUnit = this;
      for (var i = 0; i < arguments.length; i++) {
        var toUnit = arguments[i];
        currentUnit.connect(toUnit);
        currentUnit = toUnit;
      }
    }
    return this;
  };
  Tone.prototype.fan = function () {
    if (arguments.length > 0) {
      for (var i = 0; i < arguments.length; i++) {
        this.connect(arguments[i]);
      }
    }
    return this;
  };
  AudioNode.prototype.chain = Tone.prototype.chain;
  AudioNode.prototype.fan = Tone.prototype.fan;
  Tone.prototype.defaultArg = function (given, fallback) {
    if (this.isObject(given) && this.isObject(fallback)) {
      var ret = {};
      for (var givenProp in given) {
        ret[givenProp] = this.defaultArg(fallback[givenProp], given[givenProp]);
      }
      for (var fallbackProp in fallback) {
        ret[fallbackProp] = this.defaultArg(given[fallbackProp], fallback[fallbackProp]);
      }
      return ret;
    } else {
      return this.isUndef(given) ? fallback : given;
    }
  };
  Tone.prototype.optionsObject = function (values, keys, defaults) {
    var options = {};
    if (values.length === 1 && this.isObject(values[0])) {
      options = values[0];
    } else {
      for (var i = 0; i < keys.length; i++) {
        options[keys[i]] = values[i];
      }
    }
    if (!this.isUndef(defaults)) {
      return this.defaultArg(options, defaults);
    } else {
      return options;
    }
  };
  Tone.prototype.isUndef = function (val) {
    return typeof val === 'undefined';
  };
  Tone.prototype.isFunction = function (val) {
    return typeof val === 'function';
  };
  Tone.prototype.isNumber = function (arg) {
    return typeof arg === 'number';
  };
  Tone.prototype.isObject = function (arg) {
    return Object.prototype.toString.call(arg) === '[object Object]' && arg.constructor === Object;
  };
  Tone.prototype.isBoolean = function (arg) {
    return typeof arg === 'boolean';
  };
  Tone.prototype.isArray = function (arg) {
    return Array.isArray(arg);
  };
  Tone.prototype.isString = function (arg) {
    return typeof arg === 'string';
  };
  Tone.noOp = function () {
  };
  Tone.prototype._readOnly = function (property) {
    if (Array.isArray(property)) {
      for (var i = 0; i < property.length; i++) {
        this._readOnly(property[i]);
      }
    } else {
      Object.defineProperty(this, property, {
        writable: false,
        enumerable: true
      });
    }
  };
  Tone.prototype._writable = function (property) {
    if (Array.isArray(property)) {
      for (var i = 0; i < property.length; i++) {
        this._writable(property[i]);
      }
    } else {
      Object.defineProperty(this, property, { writable: true });
    }
  };
  Tone.State = {
    Started: 'started',
    Stopped: 'stopped',
    Paused: 'paused'
  };
  Tone.prototype.equalPowerScale = function (percent) {
    var piFactor = 0.5 * Math.PI;
    return Math.sin(percent * piFactor);
  };
  Tone.prototype.dbToGain = function (db) {
    return Math.pow(2, db / 6);
  };
  Tone.prototype.gainToDb = function (gain) {
    return 20 * (Math.log(gain) / Math.LN10);
  };
  Tone.prototype.intervalToFrequencyRatio = function (interval) {
    return Math.pow(2, interval / 12);
  };
  Tone.prototype.now = function () {
    return Tone.context.now();
  };
  Tone.now = function () {
    return Tone.context.now();
  };
  Tone.extend = function (child, parent) {
    if (Tone.prototype.isUndef(parent)) {
      parent = Tone;
    }
    function TempConstructor() {
    }
    TempConstructor.prototype = parent.prototype;
    child.prototype = new TempConstructor();
    child.prototype.constructor = child;
    child._super = parent;
  };
  var audioContext;
  Object.defineProperty(Tone, 'context', {
    get: function () {
      return audioContext;
    },
    set: function (context) {
      if (Tone.Context && context instanceof Tone.Context) {
        audioContext = context;
      } else {
        audioContext = new Tone.Context(context);
      }
      if (Tone.Context) {
        Tone.Context.emit('init', audioContext);
      }
    }
  });
  Object.defineProperty(Tone.prototype, 'context', {
    get: function () {
      return Tone.context;
    }
  });
  Tone.setContext = function (ctx) {
    Tone.context = ctx;
  };
  Object.defineProperty(Tone.prototype, 'blockTime', {
    get: function () {
      return 128 / this.context.sampleRate;
    }
  });
  Object.defineProperty(Tone.prototype, 'sampleTime', {
    get: function () {
      return 1 / this.context.sampleRate;
    }
  });
  Object.defineProperty(Tone, 'supported', {
    get: function () {
      var hasAudioContext = window.hasOwnProperty('AudioContext') || window.hasOwnProperty('webkitAudioContext');
      var hasPromises = window.hasOwnProperty('Promise');
      var hasWorkers = window.hasOwnProperty('Worker');
      return hasAudioContext && hasPromises && hasWorkers;
    }
  });
  Tone.version = 'r10';
  if (!window.TONE_SILENCE_VERSION_LOGGING) {
  }
  return Tone;
}();
/** Tone.js module by Yotam Mann, MIT License 2016  http://opensource.org/licenses/MIT **/
var Tone_core_Emitter;
Tone_core_Emitter = function (Tone) {
  'use strict';
  Tone.Emitter = function () {
    this._events = {};
  };
  Tone.extend(Tone.Emitter);
  Tone.Emitter.prototype.on = function (event, callback) {
    var events = event.split(/\W+/);
    for (var i = 0; i < events.length; i++) {
      var eventName = events[i];
      if (!this._events.hasOwnProperty(eventName)) {
        this._events[eventName] = [];
      }
      this._events[eventName].push(callback);
    }
    return this;
  };
  Tone.Emitter.prototype.off = function (event, callback) {
    var events = event.split(/\W+/);
    for (var ev = 0; ev < events.length; ev++) {
      event = events[ev];
      if (this._events.hasOwnProperty(event)) {
        if (Tone.prototype.isUndef(callback)) {
          this._events[event] = [];
        } else {
          var eventList = this._events[event];
          for (var i = 0; i < eventList.length; i++) {
            if (eventList[i] === callback) {
              eventList.splice(i, 1);
            }
          }
        }
      }
    }
    return this;
  };
  Tone.Emitter.prototype.emit = function (event) {
    if (this._events) {
      var args = Array.apply(null, arguments).slice(1);
      if (this._events.hasOwnProperty(event)) {
        var eventList = this._events[event];
        for (var i = 0, len = eventList.length; i < len; i++) {
          eventList[i].apply(this, args);
        }
      }
    }
    return this;
  };
  Tone.Emitter.mixin = function (object) {
    var functions = [
      'on',
      'off',
      'emit'
    ];
    object._events = {};
    for (var i = 0; i < functions.length; i++) {
      var func = functions[i];
      var emitterFunc = Tone.Emitter.prototype[func];
      object[func] = emitterFunc;
    }
  };
  Tone.Emitter.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._events = null;
    return this;
  };
  return Tone.Emitter;
}(Tone_core_Tone);
/** Tone.js module by Yotam Mann, MIT License 2016  http://opensource.org/licenses/MIT **/
var Tone_core_Context;
Tone_core_Context = function (Tone) {
  if (!window.hasOwnProperty('AudioContext') && window.hasOwnProperty('webkitAudioContext')) {
    window.AudioContext = window.webkitAudioContext;
  }
  Tone.Context = function (context) {
    Tone.Emitter.call(this);
    if (!context) {
      context = new window.AudioContext();
    }
    this._context = context;
    for (var prop in this._context) {
      this._defineProperty(this._context, prop);
    }
    this._latencyHint = 'interactive';
    this._lookAhead = 0.1;
    this._updateInterval = this._lookAhead / 3;
    this._computedUpdateInterval = 0;
    this._worker = this._createWorker();
    this._constants = {};
  };
  Tone.extend(Tone.Context, Tone.Emitter);
  Tone.Emitter.mixin(Tone.Context);
  Tone.Context.prototype._defineProperty = function (context, prop) {
    if (this.isUndef(this[prop])) {
      Object.defineProperty(this, prop, {
        get: function () {
          if (typeof context[prop] === 'function') {
            return context[prop].bind(context);
          } else {
            return context[prop];
          }
        },
        set: function (val) {
          context[prop] = val;
        }
      });
    }
  };
  Tone.Context.prototype.now = function () {
    return this._context.currentTime;
  };
  Tone.Context.prototype._createWorker = function () {
    window.URL = window.URL || window.webkitURL;
    var blob = new Blob(['var timeoutTime = ' + (this._updateInterval * 1000).toFixed(1) + ';' + 'self.onmessage = function(msg){' + '\ttimeoutTime = parseInt(msg.data);' + '};' + 'function tick(){' + '\tsetTimeout(tick, timeoutTime);' + '\tself.postMessage(\'tick\');' + '}' + 'tick();']);
    var blobUrl = URL.createObjectURL(blob);
    var worker = new Worker(blobUrl);
    worker.addEventListener('message', function () {
      this.emit('tick');
    }.bind(this));
    worker.addEventListener('message', function () {
      var now = this.now();
      if (this.isNumber(this._lastUpdate)) {
        var diff = now - this._lastUpdate;
        this._computedUpdateInterval = Math.max(diff, this._computedUpdateInterval * 0.97);
      }
      this._lastUpdate = now;
    }.bind(this));
    return worker;
  };
  Tone.Context.prototype.getConstant = function (val) {
    if (this._constants[val]) {
      return this._constants[val];
    } else {
      var buffer = this._context.createBuffer(1, 128, this._context.sampleRate);
      var arr = buffer.getChannelData(0);
      for (var i = 0; i < arr.length; i++) {
        arr[i] = val;
      }
      var constant = this._context.createBufferSource();
      constant.channelCount = 1;
      constant.channelCountMode = 'explicit';
      constant.buffer = buffer;
      constant.loop = true;
      constant.start(0);
      this._constants[val] = constant;
      return constant;
    }
  };
  Object.defineProperty(Tone.Context.prototype, 'lag', {
    get: function () {
      var diff = this._computedUpdateInterval - this._updateInterval;
      diff = Math.max(diff, 0);
      return diff;
    }
  });
  Object.defineProperty(Tone.Context.prototype, 'lookAhead', {
    get: function () {
      return this._lookAhead;
    },
    set: function (lA) {
      this._lookAhead = lA;
    }
  });
  Object.defineProperty(Tone.Context.prototype, 'updateInterval', {
    get: function () {
      return this._updateInterval;
    },
    set: function (interval) {
      this._updateInterval = Math.max(interval, Tone.prototype.blockTime);
      this._worker.postMessage(Math.max(interval * 1000, 1));
    }
  });
  Object.defineProperty(Tone.Context.prototype, 'latencyHint', {
    get: function () {
      return this._latencyHint;
    },
    set: function (hint) {
      var lookAhead = hint;
      this._latencyHint = hint;
      if (this.isString(hint)) {
        switch (hint) {
        case 'interactive':
          lookAhead = 0.1;
          this._context.latencyHint = hint;
          break;
        case 'playback':
          lookAhead = 0.8;
          this._context.latencyHint = hint;
          break;
        case 'balanced':
          lookAhead = 0.25;
          this._context.latencyHint = hint;
          break;
        case 'fastest':
          lookAhead = 0.01;
          break;
        }
      }
      this.lookAhead = lookAhead;
      this.updateInterval = lookAhead / 3;
    }
  });
  function shimConnect() {
    var nativeConnect = AudioNode.prototype.connect;
    var nativeDisconnect = AudioNode.prototype.disconnect;
    function toneConnect(B, outNum, inNum) {
      if (B.input) {
        if (Array.isArray(B.input)) {
          if (Tone.prototype.isUndef(inNum)) {
            inNum = 0;
          }
          this.connect(B.input[inNum]);
        } else {
          this.connect(B.input, outNum, inNum);
        }
      } else {
        try {
          if (B instanceof AudioNode) {
            nativeConnect.call(this, B, outNum, inNum);
          } else {
            nativeConnect.call(this, B, outNum);
          }
        } catch (e) {
          throw new Error('error connecting to node: ' + B + '\n' + e);
        }
      }
    }
    function toneDisconnect(B, outNum, inNum) {
      if (B && B.input && Array.isArray(B.input)) {
        if (Tone.prototype.isUndef(inNum)) {
          inNum = 0;
        }
        this.disconnect(B.input[inNum], outNum, inNum);
      } else if (B && B.input) {
        this.disconnect(B.input, outNum, inNum);
      } else {
        try {
          nativeDisconnect.apply(this, arguments);
        } catch (e) {
          throw new Error('error disconnecting node: ' + B + '\n' + e);
        }
      }
    }
    if (AudioNode.prototype.connect !== toneConnect) {
      AudioNode.prototype.connect = toneConnect;
      AudioNode.prototype.disconnect = toneDisconnect;
    }
  }
  if (Tone.supported) {
    shimConnect();
    Tone.context = new Tone.Context();
  } else {
    console.warn('This browser does not support Tone.js');
  }
  return Tone.Context;
}(Tone_core_Tone);
var audiocontext;
'use strict';
audiocontext = function (StartAudioContext, Context, Tone) {
  // Create the Audio Context
  const audiocontext = new window.AudioContext();
  Tone.context.dispose();
  Tone.setContext(audiocontext);
  /**
   * <p>Returns the Audio Context for this sketch. Useful for users
   * who would like to dig deeper into the <a target='_blank' href=
   * 'http://webaudio.github.io/web-audio-api/'>Web Audio API
   * </a>.</p>
   *
   * <p>Some browsers require users to startAudioContext
   * with a user gesture, such as touchStarted in the example below.</p>
   *
   * @method getAudioContext
   * @return {Object}    AudioContext for this sketch
   * @example
   * <div><code>
   *  function draw() {
   *    background(255);
   *    textAlign(CENTER);
   *
   *    if (getAudioContext().state !== 'running') {
   *      text('click to start audio', width/2, height/2);
   *    } else {
   *      text('audio is enabled', width/2, height/2);
   *    }
   *  }
   *
   *  function touchStarted() {
   *    if (getAudioContext().state !== 'running') {
   *      getAudioContext().resume();
   *    }
   *    let synth = new p5.MonoSynth();
   *    synth.play('A4', 0.5, 0, 0.2);
   *  }
   *
   * </div></code>
   */
  p5.prototype.getAudioContext = function () {
    return audiocontext;
  };
  /**
   *  <p>It is a good practice to give users control over starting audio playback.
   *  This practice is enforced by Google Chrome's autoplay policy as of r70
   *  (<a href="https://goo.gl/7K7WLu">info</a>), iOS Safari, and other browsers.
   *  </p>
   *
   *  <p>
   *  userStartAudio() starts the <a href="https://developer.mozilla.org/en-US/docs/Web/API/AudioContext"
   *  target="_blank" title="Audio Context @ MDN">Audio Context</a> on a user gesture. It utilizes
   *  the <a href="https://github.com/tambien/StartAudioContext">StartAudioContext</a> library by
   *  Yotam Mann (MIT Licence, 2016). Read more at https://github.com/tambien/StartAudioContext.
   *  </p>
   *
   *  <p>Starting the audio context on a user gesture can be as simple as <code>userStartAudio()</code>.
   *  Optional parameters let you decide on a specific element that will start the audio context,
   *  and/or call a function once the audio context is started.</p>
   *  @param  {Element|Array}   [element(s)] This argument can be an Element,
   *                                Selector String, NodeList, p5.Element,
   *                                jQuery Element, or an Array of any of those.
   *  @param  {Function} [callback] Callback to invoke when the AudioContext has started
   *  @return {Promise}            Returns a Promise which is resolved when
   *                                       the AudioContext state is 'running'
   * @method userStartAudio
   *  @example
   *  <div><code>
   *  function setup() {
   *    let myDiv = createDiv('click to start audio');
   *    myDiv.position(0, 0);
   *
   *    let mySynth = new p5.MonoSynth();
   *
   *    // This won't play until the context has started
   *    mySynth.play('A6');
   *
   *    // Start the audio context on a click/touch event
   *    userStartAudio().then(function() {
   *       myDiv.remove();
   *     });
   *  }
   *  </code></div>
   */
  p5.prototype.userStartAudio = function (elements, callback) {
    var elt = elements;
    if (elements instanceof p5.Element) {
      elt = elements.elt;
    } else if (elements instanceof Array && elements[0] instanceof p5.Element) {
      elt = elements.map(function (e) {
        return e.elt;
      });
    }
    return StartAudioContext(audiocontext, elt, callback);
  };
  return audiocontext;
}(StartAudioContext, Tone_core_Context, Tone_core_Tone);
var master;
'use strict';
master = function (audiocontext) {
  /**
   * Master contains AudioContext and the master sound output.
   */
  var Master = function () {
    this.input = audiocontext.createGain();
    this.output = audiocontext.createGain();
    //put a hard limiter on the output
    this.limiter = audiocontext.createDynamicsCompressor();
    this.limiter.threshold.value = -3;
    this.limiter.ratio.value = 20;
    this.limiter.knee.value = 1;
    this.audiocontext = audiocontext;
    this.output.disconnect();
    // connect input to limiter
    this.input.connect(this.limiter);
    // connect limiter to output
    this.limiter.connect(this.output);
    // meter is just for global Amplitude / FFT analysis
    this.meter = audiocontext.createGain();
    this.fftMeter = audiocontext.createGain();
    this.output.connect(this.meter);
    this.output.connect(this.fftMeter);
    // connect output to destination
    this.output.connect(this.audiocontext.destination);
    // an array of all sounds in the sketch
    this.soundArray = [];
    // an array of all musical parts in the sketch
    this.parts = [];
    // file extensions to search for
    this.extensions = [];
  };
  // create a single instance of the p5Sound / master output for use within this sketch
  var p5sound = new Master();
  /**
   * Returns a number representing the master amplitude (volume) for sound
   * in this sketch.
   *
   * @method getMasterVolume
   * @return {Number} Master amplitude (volume) for sound in this sketch.
   *                  Should be between 0.0 (silence) and 1.0.
   */
  p5.prototype.getMasterVolume = function () {
    return p5sound.output.gain.value;
  };
  /**
   *  <p>Scale the output of all sound in this sketch</p>
   *  Scaled between 0.0 (silence) and 1.0 (full volume).
   *  1.0 is the maximum amplitude of a digital sound, so multiplying
   *  by greater than 1.0 may cause digital distortion. To
   *  fade, provide a <code>rampTime</code> parameter. For more
   *  complex fades, see the Envelope class.
   *
   *  Alternately, you can pass in a signal source such as an
   *  oscillator to modulate the amplitude with an audio signal.
   *
   *  <p><b>How This Works</b>: When you load the p5.sound module, it
   *  creates a single instance of p5sound. All sound objects in this
   *  module output to p5sound before reaching your computer's output.
   *  So if you change the amplitude of p5sound, it impacts all of the
   *  sound in this module.</p>
   *
   *  <p>If no value is provided, returns a Web Audio API Gain Node</p>
   *
   *  @method  masterVolume
   *  @param {Number|Object} volume  Volume (amplitude) between 0.0
   *                                     and 1.0 or modulating signal/oscillator
   *  @param {Number} [rampTime]  Fade for t seconds
   *  @param {Number} [timeFromNow]  Schedule this event to happen at
   *                                 t seconds in the future
   */
  p5.prototype.masterVolume = function (vol, rampTime, tFromNow) {
    if (typeof vol === 'number') {
      var rampTime = rampTime || 0;
      var tFromNow = tFromNow || 0;
      var now = p5sound.audiocontext.currentTime;
      var currentVol = p5sound.output.gain.value;
      p5sound.output.gain.cancelScheduledValues(now + tFromNow);
      p5sound.output.gain.linearRampToValueAtTime(currentVol, now + tFromNow);
      p5sound.output.gain.linearRampToValueAtTime(vol, now + tFromNow + rampTime);
    } else if (vol) {
      vol.connect(p5sound.output.gain);
    } else {
      // return the Gain Node
      return p5sound.output.gain;
    }
  };
  /**
   *  `p5.soundOut` is the p5.sound master output. It sends output to
   *  the destination of this window's web audio context. It contains
   *  Web Audio API nodes including a dyanmicsCompressor (<code>.limiter</code>),
   *  and Gain Nodes for <code>.input</code> and <code>.output</code>.
   *
   *  @property {Object} soundOut
   */
  p5.prototype.soundOut = p5.soundOut = p5sound;
  /**
   *  a silent connection to the DesinationNode
   *  which will ensure that anything connected to it
   *  will not be garbage collected
   *
   *  @private
   */
  p5.soundOut._silentNode = p5sound.audiocontext.createGain();
  p5.soundOut._silentNode.gain.value = 0;
  p5.soundOut._silentNode.connect(p5sound.audiocontext.destination);
  return p5sound;
}(audiocontext);
var helpers;
'use strict';
helpers = function () {
  var p5sound = master;
  /**
   * @for p5
   */
  /**
   * Returns a number representing the sample rate, in samples per second,
   * of all sound objects in this audio context. It is determined by the
   * sampling rate of your operating system's sound card, and it is not
   * currently possile to change.
   * It is often 44100, or twice the range of human hearing.
   *
   * @method sampleRate
   * @return {Number} samplerate samples per second
   */
  p5.prototype.sampleRate = function () {
    return p5sound.audiocontext.sampleRate;
  };
  /**
   *  Returns the closest MIDI note value for
   *  a given frequency.
   *
   *  @method freqToMidi
   *  @param  {Number} frequency A freqeuncy, for example, the "A"
   *                             above Middle C is 440Hz
   *  @return {Number}   MIDI note value
   */
  p5.prototype.freqToMidi = function (f) {
    var mathlog2 = Math.log(f / 440) / Math.log(2);
    var m = Math.round(12 * mathlog2) + 69;
    return m;
  };
  /**
   *  Returns the frequency value of a MIDI note value.
   *  General MIDI treats notes as integers where middle C
   *  is 60, C# is 61, D is 62 etc. Useful for generating
   *  musical frequencies with oscillators.
   *
   *  @method  midiToFreq
   *  @param  {Number} midiNote The number of a MIDI note
   *  @return {Number} Frequency value of the given MIDI note
   *  @example
   *  <div><code>
   *  let notes = [60, 64, 67, 72];
   *  let i = 0;
   *
   *  function setup() {
   *    osc = new p5.Oscillator('Triangle');
   *    osc.start();
   *    frameRate(1);
   *  }
   *
   *  function draw() {
   *    let freq = midiToFreq(notes[i]);
   *    osc.freq(freq);
   *    i++;
   *    if (i >= notes.length){
   *      i = 0;
   *    }
   *  }
   *  </code></div>
   */
  var midiToFreq = p5.prototype.midiToFreq = function (m) {
    return 440 * Math.pow(2, (m - 69) / 12);
  };
  // This method converts ANSI notes specified as a string "C4", "Eb3" to a frequency
  var noteToFreq = function (note) {
    if (typeof note !== 'string') {
      return note;
    }
    var wholeNotes = {
      A: 21,
      B: 23,
      C: 24,
      D: 26,
      E: 28,
      F: 29,
      G: 31
    };
    var value = wholeNotes[note[0].toUpperCase()];
    var octave = ~~note.slice(-1);
    value += 12 * (octave - 1);
    switch (note[1]) {
    case '#':
      value += 1;
      break;
    case 'b':
      value -= 1;
      break;
    default:
      break;
    }
    return midiToFreq(value);
  };
  /**
   *  List the SoundFile formats that you will include. LoadSound
   *  will search your directory for these extensions, and will pick
   *  a format that is compatable with the client's web browser.
   *  <a href="http://media.io/">Here</a> is a free online file
   *  converter.
   *
   *  @method soundFormats
   *  @param {String} [...formats] i.e. 'mp3', 'wav', 'ogg'
   *  @example
   *  <div><code>
   *  function preload() {
   *    // set the global sound formats
   *    soundFormats('mp3', 'ogg');
   *
   *    // load either beatbox.mp3, or .ogg, depending on browser
   *    mySound = loadSound('assets/beatbox.mp3');
   *  }
   *
   *  function setup() {
   *    mySound.play();
   *  }
   *  </code></div>
   */
  p5.prototype.soundFormats = function () {
    // reset extensions array
    p5sound.extensions = [];
    // add extensions
    for (var i = 0; i < arguments.length; i++) {
      arguments[i] = arguments[i].toLowerCase();
      if ([
          'mp3',
          'wav',
          'ogg',
          'm4a',
          'aac'
        ].indexOf(arguments[i]) > -1) {
        p5sound.extensions.push(arguments[i]);
      } else {
        throw arguments[i] + ' is not a valid sound format!';
      }
    }
  };
  p5.prototype.disposeSound = function () {
    for (var i = 0; i < p5sound.soundArray.length; i++) {
      p5sound.soundArray[i].dispose();
    }
  };
  // register removeSound to dispose of p5sound SoundFiles, Convolvers,
  // Oscillators etc when sketch ends
  p5.prototype.registerMethod('remove', p5.prototype.disposeSound);
  p5.prototype._checkFileFormats = function (paths) {
    var path;
    // if path is a single string, check to see if extension is provided
    if (typeof paths === 'string') {
      path = paths;
      // see if extension is provided
      var extTest = path.split('.').pop();
      // if an extension is provided...
      if ([
          'mp3',
          'wav',
          'ogg',
          'm4a',
          'aac'
        ].indexOf(extTest) > -1) {
        if (p5.prototype.isFileSupported(extTest)) {
          path = path;
        } else {
          var pathSplit = path.split('.');
          var pathCore = pathSplit[pathSplit.length - 1];
          for (var i = 0; i < p5sound.extensions.length; i++) {
            var extension = p5sound.extensions[i];
            var supported = p5.prototype.isFileSupported(extension);
            if (supported) {
              pathCore = '';
              if (pathSplit.length === 2) {
                pathCore += pathSplit[0];
              }
              for (var i = 1; i <= pathSplit.length - 2; i++) {
                var p = pathSplit[i];
                pathCore += '.' + p;
              }
              path = pathCore += '.';
              path = path += extension;
              break;
            }
          }
        }
      } else {
        for (var i = 0; i < p5sound.extensions.length; i++) {
          var extension = p5sound.extensions[i];
          var supported = p5.prototype.isFileSupported(extension);
          if (supported) {
            path = path + '.' + extension;
            break;
          }
        }
      }
    } else if (typeof paths === 'object') {
      for (var i = 0; i < paths.length; i++) {
        var extension = paths[i].split('.').pop();
        var supported = p5.prototype.isFileSupported(extension);
        if (supported) {
          // console.log('.'+extension + ' is ' + supported +
          //  ' supported by your browser.');
          path = paths[i];
          break;
        }
      }
    }
    return path;
  };
  /**
   *  Used by Osc and Envelope to chain signal math
   */
  p5.prototype._mathChain = function (o, math, thisChain, nextChain, type) {
    // if this type of math already exists in the chain, replace it
    for (var i in o.mathOps) {
      if (o.mathOps[i] instanceof type) {
        o.mathOps[i].dispose();
        thisChain = i;
        if (thisChain < o.mathOps.length - 1) {
          nextChain = o.mathOps[i + 1];
        }
      }
    }
    o.mathOps[thisChain - 1].disconnect();
    o.mathOps[thisChain - 1].connect(math);
    math.connect(nextChain);
    o.mathOps[thisChain] = math;
    return o;
  };
  // helper methods to convert audio file as .wav format,
  // will use as saving .wav file and saving blob object
  // Thank you to Matt Diamond's RecorderJS (MIT License)
  // https://github.com/mattdiamond/Recorderjs
  function convertToWav(audioBuffer) {
    var leftChannel, rightChannel;
    leftChannel = audioBuffer.getChannelData(0);
    // handle mono files
    if (audioBuffer.numberOfChannels > 1) {
      rightChannel = audioBuffer.getChannelData(1);
    } else {
      rightChannel = leftChannel;
    }
    var interleaved = interleave(leftChannel, rightChannel);
    // create the buffer and view to create the .WAV file
    var buffer = new window.ArrayBuffer(44 + interleaved.length * 2);
    var view = new window.DataView(buffer);
    // write the WAV container,
    // check spec at: https://web.archive.org/web/20171215131933/http://tiny.systems/software/soundProgrammer/WavFormatDocs.pdf
    // RIFF chunk descriptor
    writeUTFBytes(view, 0, 'RIFF');
    view.setUint32(4, 36 + interleaved.length * 2, true);
    writeUTFBytes(view, 8, 'WAVE');
    // FMT sub-chunk
    writeUTFBytes(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    // stereo (2 channels)
    view.setUint16(22, 2, true);
    view.setUint32(24, p5sound.audiocontext.sampleRate, true);
    view.setUint32(28, p5sound.audiocontext.sampleRate * 4, true);
    view.setUint16(32, 4, true);
    view.setUint16(34, 16, true);
    // data sub-chunk
    writeUTFBytes(view, 36, 'data');
    view.setUint32(40, interleaved.length * 2, true);
    // write the PCM samples
    var lng = interleaved.length;
    var index = 44;
    var volume = 1;
    for (var i = 0; i < lng; i++) {
      view.setInt16(index, interleaved[i] * (32767 * volume), true);
      index += 2;
    }
    return view;
  }
  // helper methods to save waves
  function interleave(leftChannel, rightChannel) {
    var length = leftChannel.length + rightChannel.length;
    var result = new Float32Array(length);
    var inputIndex = 0;
    for (var index = 0; index < length;) {
      result[index++] = leftChannel[inputIndex];
      result[index++] = rightChannel[inputIndex];
      inputIndex++;
    }
    return result;
  }
  function writeUTFBytes(view, offset, string) {
    var lng = string.length;
    for (var i = 0; i < lng; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
  return {
    convertToWav: convertToWav,
    midiToFreq: midiToFreq,
    noteToFreq: noteToFreq
  };
}(master);
var errorHandler;
'use strict';
errorHandler = function () {
  /*
      Helper function to generate an error
      with a custom stack trace that points to the sketch
      and removes other parts of the stack trace.
  
      @private
      @class customError
      @constructor
      @param  {String} name         custom  error name
      @param  {String} errorTrace   custom error trace
      @param  {String} failedPath     path to the file that failed to load
      @property {String} name custom error name
      @property {String} message custom error message
      @property {String} stack trace the error back to a line in the user's sketch.
                               Note: this edits out stack trace within p5.js and p5.sound.
      @property {String} originalStack unedited, original stack trace
      @property {String} failedPath path to the file that failed to load
      @return {Error}     returns a custom Error object
     */
  var CustomError = function (name, errorTrace, failedPath) {
    var err = new Error();
    var tempStack, splitStack;
    err.name = name;
    err.originalStack = err.stack + errorTrace;
    tempStack = err.stack + errorTrace;
    err.failedPath = failedPath;
    // only print the part of the stack trace that refers to the user code:
    var splitStack = tempStack.split('\n');
    splitStack = splitStack.filter(function (ln) {
      return !ln.match(/(p5.|native code|globalInit)/g);
    });
    err.stack = splitStack.join('\n');
    return err;
  };
  return CustomError;
}();
var panner;
'use strict';
panner = function () {
  var p5sound = master;
  var ac = p5sound.audiocontext;
  // Stereo panner
  // if there is a stereo panner node use it
  if (typeof ac.createStereoPanner !== 'undefined') {
    p5.Panner = function (input, output) {
      this.stereoPanner = this.input = ac.createStereoPanner();
      input.connect(this.stereoPanner);
      this.stereoPanner.connect(output);
    };
    p5.Panner.prototype.pan = function (val, tFromNow) {
      var time = tFromNow || 0;
      var t = ac.currentTime + time;
      this.stereoPanner.pan.linearRampToValueAtTime(val, t);
    };
    //not implemented because stereopanner
    //node does not require this and will automatically
    //convert single channel or multichannel to stereo.
    //tested with single and stereo, not with (>2) multichannel
    p5.Panner.prototype.inputChannels = function () {
    };
    p5.Panner.prototype.connect = function (obj) {
      this.stereoPanner.connect(obj);
    };
    p5.Panner.prototype.disconnect = function () {
      if (this.stereoPanner) {
        this.stereoPanner.disconnect();
      }
    };
  } else {
    // if there is no createStereoPanner object
    // such as in safari 7.1.7 at the time of writing this
    // use this method to create the effect
    p5.Panner = function (input, output, numInputChannels) {
      this.input = ac.createGain();
      input.connect(this.input);
      this.left = ac.createGain();
      this.right = ac.createGain();
      this.left.channelInterpretation = 'discrete';
      this.right.channelInterpretation = 'discrete';
      // if input is stereo
      if (numInputChannels > 1) {
        this.splitter = ac.createChannelSplitter(2);
        this.input.connect(this.splitter);
        this.splitter.connect(this.left, 1);
        this.splitter.connect(this.right, 0);
      } else {
        this.input.connect(this.left);
        this.input.connect(this.right);
      }
      this.output = ac.createChannelMerger(2);
      this.left.connect(this.output, 0, 1);
      this.right.connect(this.output, 0, 0);
      this.output.connect(output);
    };
    // -1 is left, +1 is right
    p5.Panner.prototype.pan = function (val, tFromNow) {
      var time = tFromNow || 0;
      var t = ac.currentTime + time;
      var v = (val + 1) / 2;
      var rightVal = Math.cos(v * Math.PI / 2);
      var leftVal = Math.sin(v * Math.PI / 2);
      this.left.gain.linearRampToValueAtTime(leftVal, t);
      this.right.gain.linearRampToValueAtTime(rightVal, t);
    };
    p5.Panner.prototype.inputChannels = function (numChannels) {
      if (numChannels === 1) {
        this.input.disconnect();
        this.input.connect(this.left);
        this.input.connect(this.right);
      } else if (numChannels === 2) {
        if (typeof (this.splitter === 'undefined')) {
          this.splitter = ac.createChannelSplitter(2);
        }
        this.input.disconnect();
        this.input.connect(this.splitter);
        this.splitter.connect(this.left, 1);
        this.splitter.connect(this.right, 0);
      }
    };
    p5.Panner.prototype.connect = function (obj) {
      this.output.connect(obj);
    };
    p5.Panner.prototype.disconnect = function () {
      if (this.output) {
        this.output.disconnect();
      }
    };
  }
}(master);
var soundfile;
'use strict';
soundfile = function () {
  var CustomError = errorHandler;
  var p5sound = master;
  var ac = p5sound.audiocontext;
  var midiToFreq = helpers.midiToFreq;
  var convertToWav = helpers.convertToWav;
  /**
   *  <p>SoundFile object with a path to a file.</p>
   *
   *  <p>The p5.SoundFile may not be available immediately because
   *  it loads the file information asynchronously.</p>
   *
   *  <p>To do something with the sound as soon as it loads
   *  pass the name of a function as the second parameter.</p>
   *
   *  <p>Only one file path is required. However, audio file formats
   *  (i.e. mp3, ogg, wav and m4a/aac) are not supported by all
   *  web browsers. If you want to ensure compatability, instead of a single
   *  file path, you may include an Array of filepaths, and the browser will
   *  choose a format that works.</p>
   *
   *  @class p5.SoundFile
   *  @constructor
   *  @param {String|Array} path   path to a sound file (String). Optionally,
   *                               you may include multiple file formats in
   *                               an array. Alternately, accepts an object
   *                               from the HTML5 File API, or a p5.File.
   *  @param {Function} [successCallback]   Name of a function to call once file loads
   *  @param {Function} [errorCallback]   Name of a function to call if file fails to
   *                                      load. This function will receive an error or
   *                                     XMLHttpRequest object with information
   *                                     about what went wrong.
   *  @param {Function} [whileLoadingCallback]   Name of a function to call while file
   *                                             is loading. That function will
   *                                             receive progress of the request to
   *                                             load the sound file
   *                                             (between 0 and 1) as its first
   *                                             parameter. This progress
   *                                             does not account for the additional
   *                                             time needed to decode the audio data.
   *
   *  @example
   *  <div><code>
   *
   *  function preload() {
   *    soundFormats('mp3', 'ogg');
   *    mySound = loadSound('assets/doorbell.mp3');
   *  }
   *
   *  function setup() {
   *    mySound.setVolume(0.1);
   *    mySound.play();
   *  }
   *
   * </code></div>
   */
  p5.SoundFile = function (paths, onload, onerror, whileLoading) {
    if (typeof paths !== 'undefined') {
      if (typeof paths === 'string' || typeof paths[0] === 'string') {
        var path = p5.prototype._checkFileFormats(paths);
        this.url = path;
      } else if (typeof paths === 'object') {
        if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
          // The File API isn't supported in this browser
          throw 'Unable to load file because the File API is not supported';
        }
      }
      // if type is a p5.File...get the actual file
      if (paths.file) {
        paths = paths.file;
      }
      this.file = paths;
    }
    // private _onended callback, set by the method: onended(callback)
    this._onended = function () {
    };
    this._looping = false;
    this._playing = false;
    this._paused = false;
    this._pauseTime = 0;
    // cues for scheduling events with addCue() removeCue()
    this._cues = [];
    this._cueIDCounter = 0;
    //  position of the most recently played sample
    this._lastPos = 0;
    this._counterNode = null;
    this._scopeNode = null;
    // array of sources so that they can all be stopped!
    this.bufferSourceNodes = [];
    // current source
    this.bufferSourceNode = null;
    this.buffer = null;
    this.playbackRate = 1;
    this.input = p5sound.audiocontext.createGain();
    this.output = p5sound.audiocontext.createGain();
    this.reversed = false;
    // start and end of playback / loop
    this.startTime = 0;
    this.endTime = null;
    this.pauseTime = 0;
    // "restart" would stop playback before retriggering
    this.mode = 'sustain';
    // time that playback was started, in millis
    this.startMillis = null;
    // stereo panning
    this.panPosition = 0;
    this.panner = new p5.Panner(this.output, p5sound.input, 2);
    // it is possible to instantiate a soundfile with no path
    if (this.url || this.file) {
      this.load(onload, onerror);
    }
    // add this p5.SoundFile to the soundArray
    p5sound.soundArray.push(this);
    if (typeof whileLoading === 'function') {
      this._whileLoading = whileLoading;
    } else {
      this._whileLoading = function () {
      };
    }
    this._onAudioProcess = _onAudioProcess.bind(this);
    this._clearOnEnd = _clearOnEnd.bind(this);
  };
  // register preload handling of loadSound
  p5.prototype.registerPreloadMethod('loadSound', p5.prototype);
  /**
   *  loadSound() returns a new p5.SoundFile from a specified
   *  path. If called during preload(), the p5.SoundFile will be ready
   *  to play in time for setup() and draw(). If called outside of
   *  preload, the p5.SoundFile will not be ready immediately, so
   *  loadSound accepts a callback as the second parameter. Using a
   *  <a href="https://github.com/processing/p5.js/wiki/Local-server">
   *  local server</a> is recommended when loading external files.
   *
   *  @method loadSound
   *  @param  {String|Array}   path     Path to the sound file, or an array with
   *                                    paths to soundfiles in multiple formats
   *                                    i.e. ['sound.ogg', 'sound.mp3'].
   *                                    Alternately, accepts an object: either
   *                                    from the HTML5 File API, or a p5.File.
   *  @param {Function} [successCallback]   Name of a function to call once file loads
   *  @param {Function} [errorCallback]   Name of a function to call if there is
   *                                      an error loading the file.
   *  @param {Function} [whileLoading] Name of a function to call while file is loading.
   *                                 This function will receive the percentage loaded
   *                                 so far, from 0.0 to 1.0.
   *  @return {SoundFile}            Returns a p5.SoundFile
   *  @example
   *  <div><code>
   *  function preload() {
   *   mySound = loadSound('assets/doorbell.mp3');
   *  }
   *
   *  function setup() {
   *    mySound.setVolume(0.1);
   *    mySound.play();
   *  }
   *  </code></div>
   */
  p5.prototype.loadSound = function (path, callback, onerror, whileLoading) {
    // if loading locally without a server
    if (window.location.origin.indexOf('file://') > -1 && window.cordova === 'undefined') {
      window.alert('This sketch may require a server to load external files. Please see http://bit.ly/1qcInwS');
    }
    var self = this;
    var s = new p5.SoundFile(path, function () {
      if (typeof callback === 'function') {
        callback.apply(self, arguments);
      }
      if (typeof self._decrementPreload === 'function') {
        self._decrementPreload();
      }
    }, onerror, whileLoading);
    return s;
  };
  /**
   * This is a helper function that the p5.SoundFile calls to load
   * itself. Accepts a callback (the name of another function)
   * as an optional parameter.
   *
   * @private
   * @param {Function} [successCallback]   Name of a function to call once file loads
   * @param {Function} [errorCallback]   Name of a function to call if there is an error
   */
  p5.SoundFile.prototype.load = function (callback, errorCallback) {
    var self = this;
    var errorTrace = new Error().stack;
    if (this.url !== undefined && this.url !== '') {
      var request = new XMLHttpRequest();
      request.addEventListener('progress', function (evt) {
        self._updateProgress(evt);
      }, false);
      request.open('GET', this.url, true);
      request.responseType = 'arraybuffer';
      request.onload = function () {
        if (request.status === 200) {
          // on sucess loading file:
          if (!self.panner)
            return;
          ac.decodeAudioData(request.response, // success decoding buffer:
          function (buff) {
            if (!self.panner)
              return;
            self.buffer = buff;
            self.panner.inputChannels(buff.numberOfChannels);
            if (callback) {
              callback(self);
            }
          }, // error decoding buffer. "e" is undefined in Chrome 11/22/2015
          function () {
            if (!self.panner)
              return;
            var err = new CustomError('decodeAudioData', errorTrace, self.url);
            var msg = 'AudioContext error at decodeAudioData for ' + self.url;
            if (errorCallback) {
              err.msg = msg;
              errorCallback(err);
            } else {
              console.error(msg + '\n The error stack trace includes: \n' + err.stack);
            }
          });
        } else {
          if (!self.panner)
            return;
          var err = new CustomError('loadSound', errorTrace, self.url);
          var msg = 'Unable to load ' + self.url + '. The request status was: ' + request.status + ' (' + request.statusText + ')';
          if (errorCallback) {
            err.message = msg;
            errorCallback(err);
          } else {
            console.error(msg + '\n The error stack trace includes: \n' + err.stack);
          }
        }
      };
      // if there is another error, aside from 404...
      request.onerror = function () {
        var err = new CustomError('loadSound', errorTrace, self.url);
        var msg = 'There was no response from the server at ' + self.url + '. Check the url and internet connectivity.';
        if (errorCallback) {
          err.message = msg;
          errorCallback(err);
        } else {
          console.error(msg + '\n The error stack trace includes: \n' + err.stack);
        }
      };
      request.send();
    } else if (this.file !== undefined) {
      var reader = new FileReader();
      reader.onload = function () {
        if (!self.panner)
          return;
        ac.decodeAudioData(reader.result, function (buff) {
          if (!self.panner)
            return;
          self.buffer = buff;
          self.panner.inputChannels(buff.numberOfChannels);
          if (callback) {
            callback(self);
          }
        });
      };
      reader.onerror = function (e) {
        if (!self.panner)
          return;
        if (onerror) {
          onerror(e);
        }
      };
      reader.readAsArrayBuffer(this.file);
    }
  };
  // TO DO: use this method to create a loading bar that shows progress during file upload/decode.
  p5.SoundFile.prototype._updateProgress = function (evt) {
    if (evt.lengthComputable) {
      var percentComplete = evt.loaded / evt.total * 0.99;
      this._whileLoading(percentComplete, evt);
    } else {
      // Unable to compute progress information since the total size is unknown
      this._whileLoading('size unknown');
    }
  };
  /**
   *  Returns true if the sound file finished loading successfully.
   *
   *  @method  isLoaded
   *  @return {Boolean}
   */
  p5.SoundFile.prototype.isLoaded = function () {
    if (this.buffer) {
      return true;
    } else {
      return false;
    }
  };
  /**
   * Play the p5.SoundFile
   *
   * @method play
   * @param {Number} [startTime]            (optional) schedule playback to start (in seconds from now).
   * @param {Number} [rate]             (optional) playback rate
   * @param {Number} [amp]              (optional) amplitude (volume)
   *                                     of playback
   * @param {Number} [cueStart]        (optional) cue start time in seconds
   * @param {Number} [duration]          (optional) duration of playback in seconds
   */
  p5.SoundFile.prototype.play = function (startTime, rate, amp, _cueStart, duration) {
    if (!this.output) {
      console.warn('SoundFile.play() called after dispose');
      return;
    }
    var self = this;
    var now = p5sound.audiocontext.currentTime;
    var cueStart, cueEnd;
    var time = startTime || 0;
    if (time < 0) {
      time = 0;
    }
    time = time + now;
    if (typeof rate !== 'undefined') {
      this.rate(rate);
    }
    if (typeof amp !== 'undefined') {
      this.setVolume(amp);
    }
    // TO DO: if already playing, create array of buffers for easy stop()
    if (this.buffer) {
      // reset the pause time (if it was paused)
      this._pauseTime = 0;
      // handle restart playmode
      if (this.mode === 'restart' && this.buffer && this.bufferSourceNode) {
        this.bufferSourceNode.stop(time);
        this._counterNode.stop(time);
      }
      //dont create another instance if already playing
      if (this.mode === 'untildone' && this.isPlaying()) {
        return;
      }
      // make a new source and counter. They are automatically assigned playbackRate and buffer
      this.bufferSourceNode = this._initSourceNode();
      // garbage collect counterNode and create a new one
      delete this._counterNode;
      this._counterNode = this._initCounterNode();
      if (_cueStart) {
        if (_cueStart >= 0 && _cueStart < this.buffer.duration) {
          // this.startTime = cueStart;
          cueStart = _cueStart;
        } else {
          throw 'start time out of range';
        }
      } else {
        cueStart = 0;
      }
      if (duration) {
        // if duration is greater than buffer.duration, just play entire file anyway rather than throw an error
        duration = duration <= this.buffer.duration - cueStart ? duration : this.buffer.duration;
      }
      // if it was paused, play at the pause position
      if (this._paused) {
        this.bufferSourceNode.start(time, this.pauseTime, duration);
        this._counterNode.start(time, this.pauseTime, duration);
      } else {
        this.bufferSourceNode.start(time, cueStart, duration);
        this._counterNode.start(time, cueStart, duration);
      }
      this._playing = true;
      this._paused = false;
      // add source to sources array, which is used in stopAll()
      this.bufferSourceNodes.push(this.bufferSourceNode);
      this.bufferSourceNode._arrayIndex = this.bufferSourceNodes.length - 1;
      this.bufferSourceNode.addEventListener('ended', this._clearOnEnd);
    } else {
      throw 'not ready to play file, buffer has yet to load. Try preload()';
    }
    // if looping, will restart at original time
    this.bufferSourceNode.loop = this._looping;
    this._counterNode.loop = this._looping;
    if (this._looping === true) {
      cueEnd = duration ? duration : cueStart - 1e-15;
      this.bufferSourceNode.loopStart = cueStart;
      this.bufferSourceNode.loopEnd = cueEnd;
      this._counterNode.loopStart = cueStart;
      this._counterNode.loopEnd = cueEnd;
    }
  };
  /**
   *  p5.SoundFile has two play modes: <code>restart</code> and
   *  <code>sustain</code>. Play Mode determines what happens to a
   *  p5.SoundFile if it is triggered while in the middle of playback.
   *  In sustain mode, playback will continue simultaneous to the
   *  new playback. In restart mode, play() will stop playback
   *  and start over. With untilDone, a sound will play only if it's
   *  not already playing. Sustain is the default mode.
   *
   *  @method  playMode
   *  @param  {String} str 'restart' or 'sustain' or 'untilDone'
   *  @example
   *  <div><code>
   *  let mySound;
   *  function preload(){
   *    mySound = loadSound('assets/Damscray_DancingTiger.mp3');
   *  }
   *  function mouseClicked() {
   *    mySound.playMode('sustain');
   *    mySound.play();
   *  }
   *  function keyPressed() {
   *    mySound.playMode('restart');
   *    mySound.play();
   *  }
   *
   * </code></div>
   */
  p5.SoundFile.prototype.playMode = function (str) {
    var s = str.toLowerCase();
    // if restart, stop all other sounds from playing
    if (s === 'restart' && this.buffer && this.bufferSourceNode) {
      for (var i = 0; i < this.bufferSourceNodes.length - 1; i++) {
        var now = p5sound.audiocontext.currentTime;
        this.bufferSourceNodes[i].stop(now);
      }
    }
    // set play mode to effect future playback
    if (s === 'restart' || s === 'sustain' || s === 'untildone') {
      this.mode = s;
    } else {
      throw 'Invalid play mode. Must be either "restart" or "sustain"';
    }
  };
  /**
   *  Pauses a file that is currently playing. If the file is not
   *  playing, then nothing will happen.
   *
   *  After pausing, .play() will resume from the paused
   *  position.
   *  If p5.SoundFile had been set to loop before it was paused,
   *  it will continue to loop after it is unpaused with .play().
   *
   *  @method pause
   *  @param {Number} [startTime] (optional) schedule event to occur
   *                               seconds from now
   *  @example
   *  <div><code>
   *  let soundFile;
   *
   *  function preload() {
   *    soundFormats('ogg', 'mp3');
   *    soundFile = loadSound('assets/Damscray_-_Dancing_Tiger_02.mp3');
   *  }
   *  function setup() {
   *    background(0, 255, 0);
   *    soundFile.setVolume(0.1);
   *    soundFile.loop();
   *  }
   *  function keyTyped() {
   *    if (key == 'p') {
   *      soundFile.pause();
   *      background(255, 0, 0);
   *    }
   *  }
   *
   *  function keyReleased() {
   *    if (key == 'p') {
   *      soundFile.play();
   *      background(0, 255, 0);
   *    }
   *  }
   *  </code>
   *  </div>
   */
  p5.SoundFile.prototype.pause = function (startTime) {
    var now = p5sound.audiocontext.currentTime;
    var time = startTime || 0;
    var pTime = time + now;
    if (this.isPlaying() && this.buffer && this.bufferSourceNode) {
      this.pauseTime = this.currentTime();
      this.bufferSourceNode.stop(pTime);
      this._counterNode.stop(pTime);
      this._paused = true;
      this._playing = false;
      this._pauseTime = this.currentTime();
    } else {
      this._pauseTime = 0;
    }
  };
  /**
   * Loop the p5.SoundFile. Accepts optional parameters to set the
   * playback rate, playback volume, loopStart, loopEnd.
   *
   * @method loop
   * @param {Number} [startTime] (optional) schedule event to occur
   *                             seconds from now
   * @param {Number} [rate]        (optional) playback rate
   * @param {Number} [amp]         (optional) playback volume
   * @param {Number} [cueLoopStart] (optional) startTime in seconds
   * @param {Number} [duration]  (optional) loop duration in seconds
   */
  p5.SoundFile.prototype.loop = function (startTime, rate, amp, loopStart, duration) {
    this._looping = true;
    this.play(startTime, rate, amp, loopStart, duration);
  };
  /**
   * Set a p5.SoundFile's looping flag to true or false. If the sound
   * is currently playing, this change will take effect when it
   * reaches the end of the current playback.
   *
   * @method setLoop
   * @param {Boolean} Boolean   set looping to true or false
   */
  p5.SoundFile.prototype.setLoop = function (bool) {
    if (bool === true) {
      this._looping = true;
    } else if (bool === false) {
      this._looping = false;
    } else {
      throw 'Error: setLoop accepts either true or false';
    }
    if (this.bufferSourceNode) {
      this.bufferSourceNode.loop = this._looping;
      this._counterNode.loop = this._looping;
    }
  };
  /**
   * Returns 'true' if a p5.SoundFile is currently looping and playing, 'false' if not.
   *
   * @method isLooping
   * @return {Boolean}
   */
  p5.SoundFile.prototype.isLooping = function () {
    if (!this.bufferSourceNode) {
      return false;
    }
    if (this._looping === true && this.isPlaying() === true) {
      return true;
    }
    return false;
  };
  /**
   *  Returns true if a p5.SoundFile is playing, false if not (i.e.
   *  paused or stopped).
   *
   *  @method isPlaying
   *  @return {Boolean}
   */
  p5.SoundFile.prototype.isPlaying = function () {
    return this._playing;
  };
  /**
   *  Returns true if a p5.SoundFile is paused, false if not (i.e.
   *  playing or stopped).
   *
   *  @method  isPaused
   *  @return {Boolean}
   */
  p5.SoundFile.prototype.isPaused = function () {
    return this._paused;
  };
  /**
   * Stop soundfile playback.
   *
   * @method stop
   * @param {Number} [startTime] (optional) schedule event to occur
   *                             in seconds from now
   */
  p5.SoundFile.prototype.stop = function (timeFromNow) {
    var time = timeFromNow || 0;
    if (this.mode === 'sustain' || this.mode === 'untildone') {
      this.stopAll(time);
      this._playing = false;
      this.pauseTime = 0;
      this._paused = false;
    } else if (this.buffer && this.bufferSourceNode) {
      var now = p5sound.audiocontext.currentTime;
      var t = time || 0;
      this.pauseTime = 0;
      this.bufferSourceNode.stop(now + t);
      this._counterNode.stop(now + t);
      this._playing = false;
      this._paused = false;
    }
  };
  /**
   *  Stop playback on all of this soundfile's sources.
   *  @private
   */
  p5.SoundFile.prototype.stopAll = function (_time) {
    var now = p5sound.audiocontext.currentTime;
    var time = _time || 0;
    if (this.buffer && this.bufferSourceNode) {
      for (var i in this.bufferSourceNodes) {
        const bufferSourceNode = this.bufferSourceNodes[i];
        if (!!bufferSourceNode) {
          try {
            bufferSourceNode.stop(now + time);
          } catch (e) {
          }
        }
      }
      this._counterNode.stop(now + time);
      this._onended(this);
    }
  };
  /**
   *  Multiply the output volume (amplitude) of a sound file
   *  between 0.0 (silence) and 1.0 (full volume).
   *  1.0 is the maximum amplitude of a digital sound, so multiplying
   *  by greater than 1.0 may cause digital distortion. To
   *  fade, provide a <code>rampTime</code> parameter. For more
   *  complex fades, see the Envelope class.
   *
   *  Alternately, you can pass in a signal source such as an
   *  oscillator to modulate the amplitude with an audio signal.
   *
   *  @method  setVolume
   *  @param {Number|Object} volume  Volume (amplitude) between 0.0
   *                                     and 1.0 or modulating signal/oscillator
   *  @param {Number} [rampTime]  Fade for t seconds
   *  @param {Number} [timeFromNow]  Schedule this event to happen at
   *                                 t seconds in the future
   */
  p5.SoundFile.prototype.setVolume = function (vol, _rampTime, _tFromNow) {
    if (typeof vol === 'number') {
      var rampTime = _rampTime || 0;
      var tFromNow = _tFromNow || 0;
      var now = p5sound.audiocontext.currentTime;
      var currentVol = this.output.gain.value;
      this.output.gain.cancelScheduledValues(now + tFromNow);
      this.output.gain.linearRampToValueAtTime(currentVol, now + tFromNow);
      this.output.gain.linearRampToValueAtTime(vol, now + tFromNow + rampTime);
    } else if (vol) {
      vol.connect(this.output.gain);
    } else {
      // return the Gain Node
      return this.output.gain;
    }
  };
  // same as setVolume, to match Processing Sound
  p5.SoundFile.prototype.amp = p5.SoundFile.prototype.setVolume;
  // these are the same thing
  p5.SoundFile.prototype.fade = p5.SoundFile.prototype.setVolume;
  p5.SoundFile.prototype.getVolume = function () {
    return this.output.gain.value;
  };
  /**
   * Set the stereo panning of a p5.sound object to
   * a floating point number between -1.0 (left) and 1.0 (right).
   * Default is 0.0 (center).
   *
   * @method pan
   * @param {Number} [panValue]     Set the stereo panner
   * @param {Number} [timeFromNow]  schedule this event to happen
   *                                 seconds from now
   * @example
   * <div><code>
   *
   *  let ball = {};
   *  let soundFile;
   *
   *  function preload() {
   *    soundFormats('ogg', 'mp3');
   *    soundFile = loadSound('assets/beatbox.mp3');
   *  }
   *
   *  function draw() {
   *    background(0);
   *    ball.x = constrain(mouseX, 0, width);
   *    ellipse(ball.x, height/2, 20, 20)
   *  }
   *
   *  function mousePressed(){
   *    // map the ball's x location to a panning degree
   *    // between -1.0 (left) and 1.0 (right)
   *    let panning = map(ball.x, 0., width,-1.0, 1.0);
   *    soundFile.pan(panning);
   *    soundFile.play();
   *  }
   *  </div></code>
   */
  p5.SoundFile.prototype.pan = function (pval, tFromNow) {
    this.panPosition = pval;
    this.panner.pan(pval, tFromNow);
  };
  /**
   * Returns the current stereo pan position (-1.0 to 1.0)
   *
   * @method getPan
   * @return {Number} Returns the stereo pan setting of the Oscillator
   *                          as a number between -1.0 (left) and 1.0 (right).
   *                          0.0 is center and default.
   */
  p5.SoundFile.prototype.getPan = function () {
    return this.panPosition;
  };
  /**
   *  Set the playback rate of a sound file. Will change the speed and the pitch.
   *  Values less than zero will reverse the audio buffer.
   *
   *  @method rate
   *  @param {Number} [playbackRate]     Set the playback rate. 1.0 is normal,
   *                                     .5 is half-speed, 2.0 is twice as fast.
   *                                     Values less than zero play backwards.
   *  @example
   *  <div><code>
   *  let song;
   *
   *  function preload() {
   *    song = loadSound('assets/Damscray_DancingTiger.mp3');
   *  }
   *
   *  function setup() {
   *    song.loop();
   *  }
   *
   *  function draw() {
   *    background(200);
   *
   *    // Set the rate to a range between 0.1 and 4
   *    // Changing the rate also alters the pitch
   *    let speed = map(mouseY, 0.1, height, 0, 2);
   *    speed = constrain(speed, 0.01, 4);
   *    song.rate(speed);
   *
   *    // Draw a circle to show what is going on
   *    stroke(0);
   *    fill(51, 100);
   *    ellipse(mouseX, 100, 48, 48);
   *  }
   *
   * </code>
   * </div>
   *
   */
  p5.SoundFile.prototype.rate = function (playbackRate) {
    var reverse = false;
    if (typeof playbackRate === 'undefined') {
      return this.playbackRate;
    }
    this.playbackRate = playbackRate;
    if (playbackRate === 0) {
      playbackRate = 1e-13;
    } else if (playbackRate < 0 && !this.reversed) {
      playbackRate = Math.abs(playbackRate);
      reverse = true;
    } else if (playbackRate > 0 && this.reversed) {
      reverse = true;
    }
    if (this.bufferSourceNode) {
      var now = p5sound.audiocontext.currentTime;
      this.bufferSourceNode.playbackRate.cancelScheduledValues(now);
      this.bufferSourceNode.playbackRate.linearRampToValueAtTime(Math.abs(playbackRate), now);
      this._counterNode.playbackRate.cancelScheduledValues(now);
      this._counterNode.playbackRate.linearRampToValueAtTime(Math.abs(playbackRate), now);
    }
    if (reverse) {
      this.reverseBuffer();
    }
    return this.playbackRate;
  };
  // TO DO: document this
  p5.SoundFile.prototype.setPitch = function (num) {
    var newPlaybackRate = midiToFreq(num) / midiToFreq(60);
    this.rate(newPlaybackRate);
  };
  p5.SoundFile.prototype.getPlaybackRate = function () {
    return this.playbackRate;
  };
  /**
   * Returns the duration of a sound file in seconds.
   *
   * @method duration
   * @return {Number} The duration of the soundFile in seconds.
   */
  p5.SoundFile.prototype.duration = function () {
    // Return Duration
    if (this.buffer) {
      return this.buffer.duration;
    } else {
      return 0;
    }
  };
  /**
   * Return the current position of the p5.SoundFile playhead, in seconds.
   * Time is relative to the normal buffer direction, so if `reverseBuffer`
   * has been called, currentTime will count backwards.
   *
   * @method currentTime
   * @return {Number}   currentTime of the soundFile in seconds.
   */
  p5.SoundFile.prototype.currentTime = function () {
    return this.reversed ? Math.abs(this._lastPos - this.buffer.length) / ac.sampleRate : this._lastPos / ac.sampleRate;
  };
  /**
   * Move the playhead of the song to a position, in seconds. Start timing
   * and playback duration. If none are given, will reset the file to play
   * entire duration from start to finish.
   *
   * @method jump
   * @param {Number} cueTime    cueTime of the soundFile in seconds.
   * @param {Number} duration    duration in seconds.
   */
  p5.SoundFile.prototype.jump = function (cueTime, duration) {
    if (cueTime < 0 || cueTime > this.buffer.duration) {
      throw 'jump time out of range';
    }
    if (duration > this.buffer.duration - cueTime) {
      throw 'end time out of range';
    }
    var cTime = cueTime || 0;
    var dur = duration || undefined;
    if (this.isPlaying()) {
      this.stop(0);
    }
    this.play(0, this.playbackRate, this.output.gain.value, cTime, dur);
  };
  /**
  * Return the number of channels in a sound file.
  * For example, Mono = 1, Stereo = 2.
  *
  * @method channels
  * @return {Number} [channels]
  */
  p5.SoundFile.prototype.channels = function () {
    return this.buffer.numberOfChannels;
  };
  /**
  * Return the sample rate of the sound file.
  *
  * @method sampleRate
  * @return {Number} [sampleRate]
  */
  p5.SoundFile.prototype.sampleRate = function () {
    return this.buffer.sampleRate;
  };
  /**
  * Return the number of samples in a sound file.
  * Equal to sampleRate * duration.
  *
  * @method frames
  * @return {Number} [sampleCount]
  */
  p5.SoundFile.prototype.frames = function () {
    return this.buffer.length;
  };
  /**
   * Returns an array of amplitude peaks in a p5.SoundFile that can be
   * used to draw a static waveform. Scans through the p5.SoundFile's
   * audio buffer to find the greatest amplitudes. Accepts one
   * parameter, 'length', which determines size of the array.
   * Larger arrays result in more precise waveform visualizations.
   *
   * Inspired by Wavesurfer.js.
   *
   * @method  getPeaks
   * @params {Number} [length] length is the size of the returned array.
   *                          Larger length results in more precision.
   *                          Defaults to 5*width of the browser window.
   * @returns {Float32Array} Array of peaks.
   */
  p5.SoundFile.prototype.getPeaks = function (length) {
    if (this.buffer) {
      // set length to window's width if no length is provided
      if (!length) {
        length = window.width * 5;
      }
      if (this.buffer) {
        var buffer = this.buffer;
        var sampleSize = buffer.length / length;
        var sampleStep = ~~(sampleSize / 10) || 1;
        var channels = buffer.numberOfChannels;
        var peaks = new Float32Array(Math.round(length));
        for (var c = 0; c < channels; c++) {
          var chan = buffer.getChannelData(c);
          for (var i = 0; i < length; i++) {
            var start = ~~(i * sampleSize);
            var end = ~~(start + sampleSize);
            var max = 0;
            for (var j = start; j < end; j += sampleStep) {
              var value = chan[j];
              if (value > max) {
                max = value;
              } else if (-value > max) {
                max = value;
              }
            }
            if (c === 0 || Math.abs(max) > peaks[i]) {
              peaks[i] = max;
            }
          }
        }
        return peaks;
      }
    } else {
      throw 'Cannot load peaks yet, buffer is not loaded';
    }
  };
  /**
   *  Reverses the p5.SoundFile's buffer source.
   *  Playback must be handled separately (see example).
   *
   *  @method  reverseBuffer
   *  @example
   *  <div><code>
   *  let drum;
   *
   *  function preload() {
   *    drum = loadSound('assets/drum.mp3');
   *  }
   *
   *  function setup() {
   *    drum.reverseBuffer();
   *    drum.play();
   *  }
   *
   * </code>
   * </div>
   */
  p5.SoundFile.prototype.reverseBuffer = function () {
    if (this.buffer) {
      var currentPos = this._lastPos / ac.sampleRate;
      var curVol = this.getVolume();
      this.setVolume(0, 0.001);
      const numChannels = this.buffer.numberOfChannels;
      for (var i = 0; i < numChannels; i++) {
        this.buffer.getChannelData(i).reverse();
      }
      // set reversed flag
      this.reversed = !this.reversed;
      if (currentPos) {
        this.jump(this.duration() - currentPos);
      }
      this.setVolume(curVol, 0.001);
    } else {
      throw 'SoundFile is not done loading';
    }
  };
  /**
   *  Schedule an event to be called when the soundfile
   *  reaches the end of a buffer. If the soundfile is
   *  playing through once, this will be called when it
   *  ends. If it is looping, it will be called when
   *  stop is called.
   *
   *  @method  onended
   *  @param  {Function} callback function to call when the
   *                              soundfile has ended.
   */
  p5.SoundFile.prototype.onended = function (callback) {
    this._onended = callback;
    return this;
  };
  p5.SoundFile.prototype.add = function () {
  };
  p5.SoundFile.prototype.dispose = function () {
    var now = p5sound.audiocontext.currentTime;
    // remove reference to soundfile
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);
    this.stop(now);
    if (this.buffer && this.bufferSourceNode) {
      for (var i = 0; i < this.bufferSourceNodes.length - 1; i++) {
        if (this.bufferSourceNodes[i] !== null) {
          this.bufferSourceNodes[i].disconnect();
          try {
            this.bufferSourceNodes[i].stop(now);
          } catch (e) {
            console.warning('no buffer source node to dispose');
          }
          this.bufferSourceNodes[i] = null;
        }
      }
      if (this.isPlaying()) {
        try {
          this._counterNode.stop(now);
        } catch (e) {
          console.log(e);
        }
        this._counterNode = null;
      }
    }
    if (this.output) {
      this.output.disconnect();
      this.output = null;
    }
    if (this.panner) {
      this.panner.disconnect();
      this.panner = null;
    }
  };
  /**
   * Connects the output of a p5sound object to input of another
   * p5.sound object. For example, you may connect a p5.SoundFile to an
   * FFT or an Effect. If no parameter is given, it will connect to
   * the master output. Most p5sound objects connect to the master
   * output when they are created.
   *
   * @method connect
   * @param {Object} [object] Audio object that accepts an input
   */
  p5.SoundFile.prototype.connect = function (unit) {
    if (!unit) {
      this.panner.connect(p5sound.input);
    } else {
      if (unit.hasOwnProperty('input')) {
        this.panner.connect(unit.input);
      } else {
        this.panner.connect(unit);
      }
    }
  };
  /**
   * Disconnects the output of this p5sound object.
   *
   * @method disconnect
   */
  p5.SoundFile.prototype.disconnect = function () {
    if (this.panner) {
      this.panner.disconnect();
    }
  };
  /**
   */
  p5.SoundFile.prototype.getLevel = function () {
    console.warn('p5.SoundFile.getLevel has been removed from the library. Use p5.Amplitude instead');
  };
  /**
   *  Reset the source for this SoundFile to a
   *  new path (URL).
   *
   *  @method  setPath
   *  @param {String}   path     path to audio file
   *  @param {Function} callback Callback
   */
  p5.SoundFile.prototype.setPath = function (p, callback) {
    var path = p5.prototype._checkFileFormats(p);
    this.url = path;
    this.load(callback);
  };
  /**
   *  Replace the current Audio Buffer with a new Buffer.
   *
   *  @method setBuffer
   *  @param {Array} buf Array of Float32 Array(s). 2 Float32 Arrays
   *                     will create a stereo source. 1 will create
   *                     a mono source.
   */
  p5.SoundFile.prototype.setBuffer = function (buf) {
    var numChannels = buf.length;
    var size = buf[0].length;
    var newBuffer = ac.createBuffer(numChannels, size, ac.sampleRate);
    if (!(buf[0] instanceof Float32Array)) {
      buf[0] = new Float32Array(buf[0]);
    }
    for (var channelNum = 0; channelNum < numChannels; channelNum++) {
      var channel = newBuffer.getChannelData(channelNum);
      channel.set(buf[channelNum]);
    }
    this.buffer = newBuffer;
    // set numbers of channels on input to the panner
    this.panner.inputChannels(numChannels);
  };
  //////////////////////////////////////////////////
  // script processor node with an empty buffer to help
  // keep a sample-accurate position in playback buffer.
  // Inspired by Chinmay Pendharkar's technique for Sonoport --> http://bit.ly/1HwdCsV
  // Copyright [2015] [Sonoport (Asia) Pte. Ltd.],
  // Licensed under the Apache License http://apache.org/licenses/LICENSE-2.0
  ////////////////////////////////////////////////////////////////////////////////////
  var _createCounterBuffer = function (buffer) {
    const len = buffer.length;
    const audioBuf = ac.createBuffer(1, buffer.length, ac.sampleRate);
    const arrayBuffer = audioBuf.getChannelData(0);
    for (var index = 0; index < len; index++) {
      arrayBuffer[index] = index;
    }
    return audioBuf;
  };
  // initialize counterNode, set its initial buffer and playbackRate
  p5.SoundFile.prototype._initCounterNode = function () {
    var self = this;
    var now = ac.currentTime;
    var cNode = ac.createBufferSource();
    // dispose of scope node if it already exists
    if (self._scopeNode) {
      self._scopeNode.disconnect();
      self._scopeNode.removeEventListener('audioprocess', self._onAudioProcess);
      delete self._scopeNode;
    }
    self._scopeNode = ac.createScriptProcessor(256, 1, 1);
    // create counter buffer of the same length as self.buffer
    cNode.buffer = _createCounterBuffer(self.buffer);
    cNode.playbackRate.setValueAtTime(self.playbackRate, now);
    cNode.connect(self._scopeNode);
    self._scopeNode.connect(p5.soundOut._silentNode);
    self._scopeNode.addEventListener('audioprocess', self._onAudioProcess);
    return cNode;
  };
  // initialize sourceNode, set its initial buffer and playbackRate
  p5.SoundFile.prototype._initSourceNode = function () {
    var bufferSourceNode = ac.createBufferSource();
    bufferSourceNode.buffer = this.buffer;
    bufferSourceNode.playbackRate.value = this.playbackRate;
    bufferSourceNode.connect(this.output);
    return bufferSourceNode;
  };
  /**
   *  processPeaks returns an array of timestamps where it thinks there is a beat.
   *
   *  This is an asynchronous function that processes the soundfile in an offline audio context,
   *  and sends the results to your callback function.
   *
   *  The process involves running the soundfile through a lowpass filter, and finding all of the
   *  peaks above the initial threshold. If the total number of peaks are below the minimum number of peaks,
   *  it decreases the threshold and re-runs the analysis until either minPeaks or minThreshold are reached.
   *
   *  @method  processPeaks
   *  @param  {Function} callback       a function to call once this data is returned
   *  @param  {Number}   [initThreshold] initial threshold defaults to 0.9
   *  @param  {Number}   [minThreshold]   minimum threshold defaults to 0.22
   *  @param  {Number}   [minPeaks]       minimum number of peaks defaults to 200
   *  @return {Array}                  Array of timestamped peaks
   */
  p5.SoundFile.prototype.processPeaks = function (callback, _initThreshold, _minThreshold, _minPeaks) {
    var bufLen = this.buffer.length;
    var sampleRate = this.buffer.sampleRate;
    var buffer = this.buffer;
    var allPeaks = [];
    var initialThreshold = _initThreshold || 0.9, threshold = initialThreshold, minThreshold = _minThreshold || 0.22, minPeaks = _minPeaks || 200;
    // Create offline context
    var offlineContext = new window.OfflineAudioContext(1, bufLen, sampleRate);
    // create buffer source
    var source = offlineContext.createBufferSource();
    source.buffer = buffer;
    // Create filter. TO DO: allow custom setting of filter
    var filter = offlineContext.createBiquadFilter();
    filter.type = 'lowpass';
    source.connect(filter);
    filter.connect(offlineContext.destination);
    // start playing at time:0
    source.start(0);
    offlineContext.startRendering();
    // Render the song
    // act on the result
    offlineContext.oncomplete = function (e) {
      if (!self.panner)
        return;
      var filteredBuffer = e.renderedBuffer;
      var bufferData = filteredBuffer.getChannelData(0);
      // step 1:
      // create Peak instances, add them to array, with strength and sampleIndex
      do {
        allPeaks = getPeaksAtThreshold(bufferData, threshold);
        threshold -= 0.005;
      } while (Object.keys(allPeaks).length < minPeaks && threshold >= minThreshold);
      // step 2:
      // find intervals for each peak in the sampleIndex, add tempos array
      var intervalCounts = countIntervalsBetweenNearbyPeaks(allPeaks);
      // step 3: find top tempos
      var groups = groupNeighborsByTempo(intervalCounts, filteredBuffer.sampleRate);
      // sort top intervals
      var topTempos = groups.sort(function (intA, intB) {
        return intB.count - intA.count;
      }).splice(0, 5);
      // set this SoundFile's tempo to the top tempo ??
      this.tempo = topTempos[0].tempo;
      // step 4:
      // new array of peaks at top tempo within a bpmVariance
      var bpmVariance = 5;
      var tempoPeaks = getPeaksAtTopTempo(allPeaks, topTempos[0].tempo, filteredBuffer.sampleRate, bpmVariance);
      callback(tempoPeaks);
    };
  };
  // process peaks
  var Peak = function (amp, i) {
    this.sampleIndex = i;
    this.amplitude = amp;
    this.tempos = [];
    this.intervals = [];
  };
  // 1. for processPeaks() Function to identify peaks above a threshold
  // returns an array of peak indexes as frames (samples) of the original soundfile
  function getPeaksAtThreshold(data, threshold) {
    var peaksObj = {};
    var length = data.length;
    for (var i = 0; i < length; i++) {
      if (data[i] > threshold) {
        var amp = data[i];
        var peak = new Peak(amp, i);
        peaksObj[i] = peak;
        // Skip forward ~ 1/8s to get past this peak.
        i += 6000;
      }
      i++;
    }
    return peaksObj;
  }
  // 2. for processPeaks()
  function countIntervalsBetweenNearbyPeaks(peaksObj) {
    var intervalCounts = [];
    var peaksArray = Object.keys(peaksObj).sort();
    for (var index = 0; index < peaksArray.length; index++) {
      // find intervals in comparison to nearby peaks
      for (var i = 0; i < 10; i++) {
        var startPeak = peaksObj[peaksArray[index]];
        var endPeak = peaksObj[peaksArray[index + i]];
        if (startPeak && endPeak) {
          var startPos = startPeak.sampleIndex;
          var endPos = endPeak.sampleIndex;
          var interval = endPos - startPos;
          // add a sample interval to the startPeak in the allPeaks array
          if (interval > 0) {
            startPeak.intervals.push(interval);
          }
          // tally the intervals and return interval counts
          var foundInterval = intervalCounts.some(function (intervalCount) {
            if (intervalCount.interval === interval) {
              intervalCount.count++;
              return intervalCount;
            }
          });
          // store with JSON like formatting
          if (!foundInterval) {
            intervalCounts.push({
              interval: interval,
              count: 1
            });
          }
        }
      }
    }
    return intervalCounts;
  }
  // 3. for processPeaks --> find tempo
  function groupNeighborsByTempo(intervalCounts, sampleRate) {
    var tempoCounts = [];
    intervalCounts.forEach(function (intervalCount) {
      try {
        // Convert an interval to tempo
        var theoreticalTempo = Math.abs(60 / (intervalCount.interval / sampleRate));
        theoreticalTempo = mapTempo(theoreticalTempo);
        var foundTempo = tempoCounts.some(function (tempoCount) {
          if (tempoCount.tempo === theoreticalTempo)
            return tempoCount.count += intervalCount.count;
        });
        if (!foundTempo) {
          if (isNaN(theoreticalTempo)) {
            return;
          }
          tempoCounts.push({
            tempo: Math.round(theoreticalTempo),
            count: intervalCount.count
          });
        }
      } catch (e) {
        throw e;
      }
    });
    return tempoCounts;
  }
  // 4. for processPeaks - get peaks at top tempo
  function getPeaksAtTopTempo(peaksObj, tempo, sampleRate, bpmVariance) {
    var peaksAtTopTempo = [];
    var peaksArray = Object.keys(peaksObj).sort();
    // TO DO: filter out peaks that have the tempo and return
    for (var i = 0; i < peaksArray.length; i++) {
      var key = peaksArray[i];
      var peak = peaksObj[key];
      for (var j = 0; j < peak.intervals.length; j++) {
        var intervalBPM = Math.round(Math.abs(60 / (peak.intervals[j] / sampleRate)));
        intervalBPM = mapTempo(intervalBPM);
        if (Math.abs(intervalBPM - tempo) < bpmVariance) {
          // convert sampleIndex to seconds
          peaksAtTopTempo.push(peak.sampleIndex / sampleRate);
        }
      }
    }
    // filter out peaks that are very close to each other
    peaksAtTopTempo = peaksAtTopTempo.filter(function (peakTime, index, arr) {
      var dif = arr[index + 1] - peakTime;
      if (dif > 0.01) {
        return true;
      }
    });
    return peaksAtTopTempo;
  }
  // helper function for processPeaks
  function mapTempo(theoreticalTempo) {
    // these scenarios create infinite while loop
    if (!isFinite(theoreticalTempo) || theoreticalTempo === 0) {
      return;
    }
    // Adjust the tempo to fit within the 90-180 BPM range
    while (theoreticalTempo < 90)
      theoreticalTempo *= 2;
    while (theoreticalTempo > 180 && theoreticalTempo > 90)
      theoreticalTempo /= 2;
    return theoreticalTempo;
  }
  /*** SCHEDULE EVENTS ***/
  // Cue inspired by JavaScript setTimeout, and the
  // Tone.js Transport Timeline Event, MIT License Yotam Mann 2015 tonejs.org
  var Cue = function (callback, time, id, val) {
    this.callback = callback;
    this.time = time;
    this.id = id;
    this.val = val;
  };
  /**
   *  Schedule events to trigger every time a MediaElement
   *  (audio/video) reaches a playback cue point.
   *
   *  Accepts a callback function, a time (in seconds) at which to trigger
   *  the callback, and an optional parameter for the callback.
   *
   *  Time will be passed as the first parameter to the callback function,
   *  and param will be the second parameter.
   *
   *
   *  @method  addCue
   *  @param {Number}   time     Time in seconds, relative to this media
   *                             element's playback. For example, to trigger
   *                             an event every time playback reaches two
   *                             seconds, pass in the number 2. This will be
   *                             passed as the first parameter to
   *                             the callback function.
   *  @param {Function} callback Name of a function that will be
   *                             called at the given time. The callback will
   *                             receive time and (optionally) param as its
   *                             two parameters.
   *  @param {Object} [value]    An object to be passed as the
   *                             second parameter to the
   *                             callback function.
   *  @return {Number} id ID of this cue,
   *                      useful for removeCue(id)
   *  @example
   *  <div><code>
   *  let mySound;
   *  function preload() {
   *    mySound = loadSound('assets/beat.mp3');
   *  }
   *
   *  function setup() {
   *    background(0);
   *    noStroke();
   *    fill(255);
   *    textAlign(CENTER);
   *    text('click to play', width/2, height/2);
   *
   *    // schedule calls to changeText
   *    mySound.addCue(0.50, changeText, "hello" );
   *    mySound.addCue(1.00, changeText, "p5" );
   *    mySound.addCue(1.50, changeText, "what" );
   *    mySound.addCue(2.00, changeText, "do" );
   *    mySound.addCue(2.50, changeText, "you" );
   *    mySound.addCue(3.00, changeText, "want" );
   *    mySound.addCue(4.00, changeText, "to" );
   *    mySound.addCue(5.00, changeText, "make" );
   *    mySound.addCue(6.00, changeText, "?" );
   *  }
   *
   *  function changeText(val) {
   *    background(0);
   *    text(val, width/2, height/2);
   *  }
   *
   *  function mouseClicked() {
   *    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
   *      if (mySound.isPlaying() ) {
   *        mySound.stop();
   *      } else {
   *        mySound.play();
   *      }
   *    }
   *  }
   *  </code></div>
   */
  p5.SoundFile.prototype.addCue = function (time, callback, val) {
    var id = this._cueIDCounter++;
    var cue = new Cue(callback, time, id, val);
    this._cues.push(cue);
    // if (!this.elt.ontimeupdate) {
    //   this.elt.ontimeupdate = this._onTimeUpdate.bind(this);
    // }
    return id;
  };
  /**
   *  Remove a callback based on its ID. The ID is returned by the
   *  addCue method.
   *
   *  @method removeCue
   *  @param  {Number} id ID of the cue, as returned by addCue
   */
  p5.SoundFile.prototype.removeCue = function (id) {
    var cueLength = this._cues.length;
    for (var i = 0; i < cueLength; i++) {
      var cue = this._cues[i];
      if (cue.id === id) {
        this._cues.splice(i, 1);
        break;
      }
    }
    if (this._cues.length === 0) {
    }
  };
  /**
   *  Remove all of the callbacks that had originally been scheduled
   *  via the addCue method.
   *
   *  @method  clearCues
   */
  p5.SoundFile.prototype.clearCues = function () {
    this._cues = [];
  };
  // private method that checks for cues to be fired if events
  // have been scheduled using addCue(callback, time).
  p5.SoundFile.prototype._onTimeUpdate = function (position) {
    var playbackTime = position / this.buffer.sampleRate;
    var cueLength = this._cues.length;
    for (var i = 0; i < cueLength; i++) {
      var cue = this._cues[i];
      var callbackTime = cue.time;
      var val = cue.val;
      if (this._prevTime < callbackTime && callbackTime <= playbackTime) {
        // pass the scheduled callbackTime as parameter to the callback
        cue.callback(val);
      }
    }
    this._prevTime = playbackTime;
  };
  /**
   * Save a p5.SoundFile as a .wav file. The browser will prompt the user
   * to download the file to their device. To upload a file to a server, see
   * <a href="/docs/reference/#/p5.SoundFile/getBlob">getBlob</a>
   *
   * @method save
   * @param  {String} [fileName]      name of the resulting .wav file.
   * @example
   *  <div><code>
   *  let inp, button, mySound;
   *  let fileName = 'cool';
   *  function preload() {
   *    mySound = loadSound('assets/doorbell.mp3');
   *  }
   *  function setup() {
   *    btn = createButton('click to save file');
   *    btn.position(0, 0);
   *    btn.mouseClicked(handleMouseClick);
   *  }
   *
   *  function handleMouseClick() {
   *    mySound.save(fileName);
   *  }
   * </code></div>
   */
  p5.SoundFile.prototype.save = function (fileName) {
    const dataView = convertToWav(this.buffer);
    p5.prototype.saveSound([dataView], fileName, 'wav');
  };
  /**
   * This method is useful for sending a SoundFile to a server. It returns the
   * .wav-encoded audio data as a "<a target="_blank" title="Blob reference at
   * MDN" href="https://developer.mozilla.org/en-US/docs/Web/API/Blob">Blob</a>".
   * A Blob is a file-like data object that can be uploaded to a server
   * with an <a href="/docs/reference/#/p5/httpDo">http</a> request. We'll
   * use the `httpDo` options object to send a POST request with some
   * specific options: we encode the request as `multipart/form-data`,
   * and attach the blob as one of the form values using `FormData`.
   * 
   *
   * @method getBlob
   * @returns {Blob} A file-like data object
   * @example
   *  <div><code>
   *
   *  function preload() {
   *    mySound = loadSound('assets/doorbell.mp3');
   *  }
   *
   *  function setup() {
   *    noCanvas();
   *    let soundBlob = mySound.getBlob();
   *
   *    // Now we can send the blob to a server...
   *    let serverUrl = 'https://jsonplaceholder.typicode.com/posts';
   *    let httpRequestOptions = {
   *      method: 'POST',
   *      body: new FormData().append('soundBlob', soundBlob),
   *      headers: new Headers({
   *        'Content-Type': 'multipart/form-data'
   *      })
   *    };
   *    httpDo(serverUrl, httpRequestOptions);
   *
   *    // We can also create an `ObjectURL` pointing to the Blob
   *    let blobUrl = URL.createObjectURL(soundBlob);
   *
   *    // The `<Audio>` Element accepts Object URL's
   *    let htmlAudioElt = createAudio(blobUrl).showControls();
   *
   *    createDiv();
   *
   *    // The ObjectURL exists as long as this tab is open
   *    let input = createInput(blobUrl);
   *    input.attribute('readonly', true);
   *    input.mouseClicked(function() { input.elt.select() });
   *  }
   *
   * </code></div>
   */
  p5.SoundFile.prototype.getBlob = function () {
    const dataView = convertToWav(this.buffer);
    return new Blob([dataView], { type: 'audio/wav' });
  };
  // event handler to keep track of current position
  function _onAudioProcess(processEvent) {
    var inputBuffer = processEvent.inputBuffer.getChannelData(0);
    this._lastPos = inputBuffer[inputBuffer.length - 1] || 0;
    // do any callbacks that have been scheduled
    this._onTimeUpdate(self._lastPos);
  }
  // event handler to remove references to the bufferSourceNode when it is done playing
  function _clearOnEnd(e) {
    const thisBufferSourceNode = e.target;
    const soundFile = this;
    // delete this.bufferSourceNode from the sources array when it is done playing:
    thisBufferSourceNode._playing = false;
    thisBufferSourceNode.removeEventListener('ended', soundFile._clearOnEnd);
    // call the onended callback
    soundFile._onended(soundFile);
    soundFile.bufferSourceNodes.forEach(function (n, i) {
      if (n._playing === false) {
        soundFile.bufferSourceNodes.splice(i);
      }
    });
    if (soundFile.bufferSourceNodes.length === 0) {
      soundFile._playing = false;
    }
  }
}(errorHandler, master, helpers, helpers);
var amplitude;
'use strict';
amplitude = function () {
  var p5sound = master;
  /**
   *  Amplitude measures volume between 0.0 and 1.0.
   *  Listens to all p5sound by default, or use setInput()
   *  to listen to a specific sound source. Accepts an optional
   *  smoothing value, which defaults to 0.
   *
   *  @class p5.Amplitude
   *  @constructor
   *  @param {Number} [smoothing] between 0.0 and .999 to smooth
   *                             amplitude readings (defaults to 0)
   *  @example
   *  <div><code>
   *  let sound, amplitude, cnv;
   *
   *  function preload(){
   *    sound = loadSound('assets/beat.mp3');
   *  }
   *  function setup() {
   *    cnv = createCanvas(100,100);
   *    amplitude = new p5.Amplitude();
   *
   *    // start / stop the sound when canvas is clicked
   *    cnv.mouseClicked(function() {
   *      if (sound.isPlaying() ){
   *        sound.stop();
   *      } else {
   *        sound.play();
   *      }
   *    });
   *  }
   *  function draw() {
   *    background(0);
   *    fill(255);
   *    let level = amplitude.getLevel();
   *    let size = map(level, 0, 1, 0, 200);
   *    ellipse(width/2, height/2, size, size);
   *  }
   *
   *  </code></div>
   */
  p5.Amplitude = function (smoothing) {
    // Set to 2048 for now. In future iterations, this should be inherited or parsed from p5sound's default
    this.bufferSize = 2048;
    // set audio context
    this.audiocontext = p5sound.audiocontext;
    this.processor = this.audiocontext.createScriptProcessor(this.bufferSize, 2, 1);
    // for connections
    this.input = this.processor;
    this.output = this.audiocontext.createGain();
    // smoothing defaults to 0
    this.smoothing = smoothing || 0;
    // the variables to return
    this.volume = 0;
    this.average = 0;
    this.stereoVol = [
      0,
      0
    ];
    this.stereoAvg = [
      0,
      0
    ];
    this.stereoVolNorm = [
      0,
      0
    ];
    this.volMax = 0.001;
    this.normalize = false;
    this.processor.onaudioprocess = this._audioProcess.bind(this);
    this.processor.connect(this.output);
    this.output.gain.value = 0;
    // this may only be necessary because of a Chrome bug
    this.output.connect(this.audiocontext.destination);
    // connect to p5sound master output by default, unless set by input()
    p5sound.meter.connect(this.processor);
    // add this p5.SoundFile to the soundArray
    p5sound.soundArray.push(this);
  };
  /**
   *  Connects to the p5sound instance (master output) by default.
   *  Optionally, you can pass in a specific source (i.e. a soundfile).
   *
   *  @method setInput
   *  @param {soundObject|undefined} [snd] set the sound source
   *                                       (optional, defaults to
   *                                       master output)
   *  @param {Number|undefined} [smoothing] a range between 0.0 and 1.0
   *                                        to smooth amplitude readings
   *  @example
   *  <div><code>
   *  function preload(){
   *    sound1 = loadSound('assets/beat.mp3');
   *    sound2 = loadSound('assets/drum.mp3');
   *  }
   *  function setup(){
   *    amplitude = new p5.Amplitude();
   *    sound1.play();
   *    sound2.play();
   *    amplitude.setInput(sound2);
   *  }
   *  function draw() {
   *    background(0);
   *    fill(255);
   *    let level = amplitude.getLevel();
   *    let size = map(level, 0, 1, 0, 200);
   *    ellipse(width/2, height/2, size, size);
   *  }
   *  function mouseClicked(){
   *    sound1.stop();
   *    sound2.stop();
   *  }
   *  </code></div>
   */
  p5.Amplitude.prototype.setInput = function (source, smoothing) {
    p5sound.meter.disconnect();
    if (smoothing) {
      this.smoothing = smoothing;
    }
    // connect to the master out of p5s instance if no snd is provided
    if (source == null) {
      console.log('Amplitude input source is not ready! Connecting to master output instead');
      p5sound.meter.connect(this.processor);
    } else if (source instanceof p5.Signal) {
      source.output.connect(this.processor);
    } else if (source) {
      source.connect(this.processor);
      this.processor.disconnect();
      this.processor.connect(this.output);
    } else {
      p5sound.meter.connect(this.processor);
    }
  };
  p5.Amplitude.prototype.connect = function (unit) {
    if (unit) {
      if (unit.hasOwnProperty('input')) {
        this.output.connect(unit.input);
      } else {
        this.output.connect(unit);
      }
    } else {
      this.output.connect(this.panner.connect(p5sound.input));
    }
  };
  p5.Amplitude.prototype.disconnect = function () {
    if (this.output) {
      this.output.disconnect();
    }
  };
  // TO DO make this stereo / dependent on # of audio channels
  p5.Amplitude.prototype._audioProcess = function (event) {
    for (var channel = 0; channel < event.inputBuffer.numberOfChannels; channel++) {
      var inputBuffer = event.inputBuffer.getChannelData(channel);
      var bufLength = inputBuffer.length;
      var total = 0;
      var sum = 0;
      var x;
      for (var i = 0; i < bufLength; i++) {
        x = inputBuffer[i];
        if (this.normalize) {
          total += Math.max(Math.min(x / this.volMax, 1), -1);
          sum += Math.max(Math.min(x / this.volMax, 1), -1) * Math.max(Math.min(x / this.volMax, 1), -1);
        } else {
          total += x;
          sum += x * x;
        }
      }
      var average = total / bufLength;
      // ... then take the square root of the sum.
      var rms = Math.sqrt(sum / bufLength);
      this.stereoVol[channel] = Math.max(rms, this.stereoVol[channel] * this.smoothing);
      this.stereoAvg[channel] = Math.max(average, this.stereoVol[channel] * this.smoothing);
      this.volMax = Math.max(this.stereoVol[channel], this.volMax);
    }
    // add volume from all channels together
    var self = this;
    var volSum = this.stereoVol.reduce(function (previousValue, currentValue, index) {
      self.stereoVolNorm[index - 1] = Math.max(Math.min(self.stereoVol[index - 1] / self.volMax, 1), 0);
      self.stereoVolNorm[index] = Math.max(Math.min(self.stereoVol[index] / self.volMax, 1), 0);
      return previousValue + currentValue;
    });
    // volume is average of channels
    this.volume = volSum / this.stereoVol.length;
    // normalized value
    this.volNorm = Math.max(Math.min(this.volume / this.volMax, 1), 0);
  };
  /**
   *  Returns a single Amplitude reading at the moment it is called.
   *  For continuous readings, run in the draw loop.
   *
   *  @method getLevel
   *  @param {Number} [channel] Optionally return only channel 0 (left) or 1 (right)
   *  @return {Number}       Amplitude as a number between 0.0 and 1.0
   *  @example
   *  <div><code>
   *  function preload(){
   *    sound = loadSound('assets/beat.mp3');
   *  }
   *  function setup() {
   *    amplitude = new p5.Amplitude();
   *    sound.play();
   *  }
   *  function draw() {
   *    background(0);
   *    fill(255);
   *    let level = amplitude.getLevel();
   *    let size = map(level, 0, 1, 0, 200);
   *    ellipse(width/2, height/2, size, size);
   *  }
   *  function mouseClicked(){
   *    sound.stop();
   *  }
   *  </code></div>
   */
  p5.Amplitude.prototype.getLevel = function (channel) {
    if (typeof channel !== 'undefined') {
      if (this.normalize) {
        return this.stereoVolNorm[channel];
      } else {
        return this.stereoVol[channel];
      }
    } else if (this.normalize) {
      return this.volNorm;
    } else {
      return this.volume;
    }
  };
  /**
   * Determines whether the results of Amplitude.process() will be
   * Normalized. To normalize, Amplitude finds the difference the
   * loudest reading it has processed and the maximum amplitude of
   * 1.0. Amplitude adds this difference to all values to produce
   * results that will reliably map between 0.0 and 1.0. However,
   * if a louder moment occurs, the amount that Normalize adds to
   * all the values will change. Accepts an optional boolean parameter
   * (true or false). Normalizing is off by default.
   *
   * @method toggleNormalize
   * @param {boolean} [boolean] set normalize to true (1) or false (0)
   */
  p5.Amplitude.prototype.toggleNormalize = function (bool) {
    if (typeof bool === 'boolean') {
      this.normalize = bool;
    } else {
      this.normalize = !this.normalize;
    }
  };
  /**
   *  Smooth Amplitude analysis by averaging with the last analysis
   *  frame. Off by default.
   *
   *  @method smooth
   *  @param {Number} set smoothing from 0.0 <= 1
   */
  p5.Amplitude.prototype.smooth = function (s) {
    if (s >= 0 && s < 1) {
      this.smoothing = s;
    } else {
      console.log('Error: smoothing must be between 0 and 1');
    }
  };
  p5.Amplitude.prototype.dispose = function () {
    // remove reference from soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);
    if (this.input) {
      this.input.disconnect();
      delete this.input;
    }
    if (this.output) {
      this.output.disconnect();
      delete this.output;
    }
    delete this.processor;
  };
}(master);
var fft;
'use strict';
fft = function () {
  var p5sound = master;
  /**
   *  <p>FFT (Fast Fourier Transform) is an analysis algorithm that
   *  isolates individual
   *  <a href="https://en.wikipedia.org/wiki/Audio_frequency">
   *  audio frequencies</a> within a waveform.</p>
   *
   *  <p>Once instantiated, a p5.FFT object can return an array based on
   *  two types of analyses: <br> • <code>FFT.waveform()</code> computes
   *  amplitude values along the time domain. The array indices correspond
   *  to samples across a brief moment in time. Each value represents
   *  amplitude of the waveform at that sample of time.<br>
   *  • <code>FFT.analyze() </code> computes amplitude values along the
   *  frequency domain. The array indices correspond to frequencies (i.e.
   *  pitches), from the lowest to the highest that humans can hear. Each
   *  value represents amplitude at that slice of the frequency spectrum.
   *  Use with <code>getEnergy()</code> to measure amplitude at specific
   *  frequencies, or within a range of frequencies. </p>
   *
   *  <p>FFT analyzes a very short snapshot of sound called a sample
   *  buffer. It returns an array of amplitude measurements, referred
   *  to as <code>bins</code>. The array is 1024 bins long by default.
   *  You can change the bin array length, but it must be a power of 2
   *  between 16 and 1024 in order for the FFT algorithm to function
   *  correctly. The actual size of the FFT buffer is twice the
   *  number of bins, so given a standard sample rate, the buffer is
   *  2048/44100 seconds long.</p>
   *
   *
   *  @class p5.FFT
   *  @constructor
   *  @param {Number} [smoothing]   Smooth results of Freq Spectrum.
   *                                0.0 < smoothing < 1.0.
   *                                Defaults to 0.8.
   *  @param {Number} [bins]    Length of resulting array.
   *                            Must be a power of two between
   *                            16 and 1024. Defaults to 1024.
   *  @example
   *  <div><code>
   *  function preload(){
   *    sound = loadSound('assets/Damscray_DancingTiger.mp3');
   *  }
   *
   *  function setup(){
   *    let cnv = createCanvas(100,100);
   *    cnv.mouseClicked(togglePlay);
   *    fft = new p5.FFT();
   *    sound.amp(0.2);
   *  }
   *
   *  function draw(){
   *    background(0);
   *
   *    let spectrum = fft.analyze();
   *    noStroke();
   *    fill(0,255,0); // spectrum is green
   *    for (var i = 0; i< spectrum.length; i++){
   *      let x = map(i, 0, spectrum.length, 0, width);
   *      let h = -height + map(spectrum[i], 0, 255, height, 0);
   *      rect(x, height, width / spectrum.length, h )
   *    }
   *
   *    let waveform = fft.waveform();
   *    noFill();
   *    beginShape();
   *    stroke(255,0,0); // waveform is red
   *    strokeWeight(1);
   *    for (var i = 0; i< waveform.length; i++){
   *      let x = map(i, 0, waveform.length, 0, width);
   *      let y = map( waveform[i], -1, 1, 0, height);
   *      vertex(x,y);
   *    }
   *    endShape();
   *
   *    text('click to play/pause', 4, 10);
   *  }
   *
   *  // fade sound if mouse is over canvas
   *  function togglePlay() {
   *    if (sound.isPlaying()) {
   *      sound.pause();
   *    } else {
   *      sound.loop();
   *    }
   *  }
   *  </code></div>
   */
  p5.FFT = function (smoothing, bins) {
    this.input = this.analyser = p5sound.audiocontext.createAnalyser();
    Object.defineProperties(this, {
      bins: {
        get: function () {
          return this.analyser.fftSize / 2;
        },
        set: function (b) {
          this.analyser.fftSize = b * 2;
        },
        configurable: true,
        enumerable: true
      },
      smoothing: {
        get: function () {
          return this.analyser.smoothingTimeConstant;
        },
        set: function (s) {
          this.analyser.smoothingTimeConstant = s;
        },
        configurable: true,
        enumerable: true
      }
    });
    // set default smoothing and bins
    this.smooth(smoothing);
    this.bins = bins || 1024;
    // default connections to p5sound fftMeter
    p5sound.fftMeter.connect(this.analyser);
    this.freqDomain = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeDomain = new Uint8Array(this.analyser.frequencyBinCount);
    // predefined frequency ranges, these will be tweakable
    this.bass = [
      20,
      140
    ];
    this.lowMid = [
      140,
      400
    ];
    this.mid = [
      400,
      2600
    ];
    this.highMid = [
      2600,
      5200
    ];
    this.treble = [
      5200,
      14000
    ];
    // add this p5.SoundFile to the soundArray
    p5sound.soundArray.push(this);
  };
  /**
   *  Set the input source for the FFT analysis. If no source is
   *  provided, FFT will analyze all sound in the sketch.
   *
   *  @method  setInput
   *  @param {Object} [source] p5.sound object (or web audio API source node)
   */
  p5.FFT.prototype.setInput = function (source) {
    if (!source) {
      p5sound.fftMeter.connect(this.analyser);
    } else {
      if (source.output) {
        source.output.connect(this.analyser);
      } else if (source.connect) {
        source.connect(this.analyser);
      }
      p5sound.fftMeter.disconnect();
    }
  };
  /**
   *  Returns an array of amplitude values (between -1.0 and +1.0) that represent
   *  a snapshot of amplitude readings in a single buffer. Length will be
   *  equal to bins (defaults to 1024). Can be used to draw the waveform
   *  of a sound.
   *
   *  @method waveform
   *  @param {Number} [bins]    Must be a power of two between
   *                            16 and 1024. Defaults to 1024.
   *  @param {String} [precision] If any value is provided, will return results
   *                              in a Float32 Array which is more precise
   *                              than a regular array.
   *  @return {Array}  Array    Array of amplitude values (-1 to 1)
   *                            over time. Array length = bins.
   *
   */
  p5.FFT.prototype.waveform = function () {
    var bins, mode, normalArray;
    for (var i = 0; i < arguments.length; i++) {
      if (typeof arguments[i] === 'number') {
        bins = arguments[i];
        this.analyser.fftSize = bins * 2;
      }
      if (typeof arguments[i] === 'string') {
        mode = arguments[i];
      }
    }
    // getFloatFrequencyData doesnt work in Safari as of 5/2015
    if (mode && !p5.prototype._isSafari()) {
      timeToFloat(this, this.timeDomain);
      this.analyser.getFloatTimeDomainData(this.timeDomain);
      return this.timeDomain;
    } else {
      timeToInt(this, this.timeDomain);
      this.analyser.getByteTimeDomainData(this.timeDomain);
      var normalArray = new Array();
      for (var j = 0; j < this.timeDomain.length; j++) {
        var scaled = p5.prototype.map(this.timeDomain[j], 0, 255, -1, 1);
        normalArray.push(scaled);
      }
      return normalArray;
    }
  };
  /**
   *  Returns an array of amplitude values (between 0 and 255)
   *  across the frequency spectrum. Length is equal to FFT bins
   *  (1024 by default). The array indices correspond to frequencies
   *  (i.e. pitches), from the lowest to the highest that humans can
   *  hear. Each value represents amplitude at that slice of the
   *  frequency spectrum. Must be called prior to using
   *  <code>getEnergy()</code>.
   *
   *  @method analyze
   *  @param {Number} [bins]    Must be a power of two between
   *                             16 and 1024. Defaults to 1024.
   *  @param {Number} [scale]    If "dB," returns decibel
   *                             float measurements between
   *                             -140 and 0 (max).
   *                             Otherwise returns integers from 0-255.
   *  @return {Array} spectrum    Array of energy (amplitude/volume)
   *                              values across the frequency spectrum.
   *                              Lowest energy (silence) = 0, highest
   *                              possible is 255.
   *  @example
   *  <div><code>
   *  let osc;
   *  let fft;
   *
   *  function setup(){
   *    createCanvas(100,100);
   *    osc = new p5.Oscillator();
   *    osc.amp(0);
   *    osc.start();
   *    fft = new p5.FFT();
   *  }
   *
   *  function draw(){
   *    background(0);
   *
   *    let freq = map(mouseX, 0, 800, 20, 15000);
   *    freq = constrain(freq, 1, 20000);
   *    osc.freq(freq);
   *
   *    let spectrum = fft.analyze();
   *    noStroke();
   *    fill(0,255,0); // spectrum is green
   *    for (var i = 0; i< spectrum.length; i++){
   *      let x = map(i, 0, spectrum.length, 0, width);
   *      let h = -height + map(spectrum[i], 0, 255, height, 0);
   *      rect(x, height, width / spectrum.length, h );
   *    }
   *
   *    stroke(255);
   *    text('Freq: ' + round(freq)+'Hz', 10, 10);
   *
   *    isMouseOverCanvas();
   *  }
   *
   *  // only play sound when mouse is over canvas
   *  function isMouseOverCanvas() {
   *    let mX = mouseX, mY = mouseY;
   *    if (mX > 0 && mX < width && mY < height && mY > 0) {
   *      osc.amp(0.5, 0.2);
   *    } else {
   *      osc.amp(0, 0.2);
   *    }
   *  }
   *  </code></div>
   *
   *
   */
  p5.FFT.prototype.analyze = function () {
    var mode;
    for (var i = 0; i < arguments.length; i++) {
      if (typeof arguments[i] === 'number') {
        this.bins = arguments[i];
        this.analyser.fftSize = this.bins * 2;
      }
      if (typeof arguments[i] === 'string') {
        mode = arguments[i];
      }
    }
    if (mode && mode.toLowerCase() === 'db') {
      freqToFloat(this);
      this.analyser.getFloatFrequencyData(this.freqDomain);
      return this.freqDomain;
    } else {
      freqToInt(this, this.freqDomain);
      this.analyser.getByteFrequencyData(this.freqDomain);
      var normalArray = Array.apply([], this.freqDomain);
      normalArray.length === this.analyser.fftSize;
      normalArray.constructor === Array;
      return normalArray;
    }
  };
  /**
   *  Returns the amount of energy (volume) at a specific
   *  <a href="https://en.wikipedia.org/wiki/Audio_frequency" target="_blank">
   *  frequency</a>, or the average amount of energy between two
   *  frequencies. Accepts Number(s) corresponding
   *  to frequency (in Hz), or a String corresponding to predefined
   *  frequency ranges ("bass", "lowMid", "mid", "highMid", "treble").
   *  Returns a range between 0 (no energy/volume at that frequency) and
   *  255 (maximum energy).
   *  <em>NOTE: analyze() must be called prior to getEnergy(). Analyze()
   *  tells the FFT to analyze frequency data, and getEnergy() uses
   *  the results determine the value at a specific frequency or
   *  range of frequencies.</em></p>
   *
   *  @method  getEnergy
   *  @param  {Number|String} frequency1   Will return a value representing
   *                                energy at this frequency. Alternately,
   *                                the strings "bass", "lowMid" "mid",
   *                                "highMid", and "treble" will return
   *                                predefined frequency ranges.
   *  @param  {Number} [frequency2] If a second frequency is given,
   *                                will return average amount of
   *                                energy that exists between the
   *                                two frequencies.
   *  @return {Number}   Energy   Energy (volume/amplitude) from
   *                              0 and 255.
   *
   */
  p5.FFT.prototype.getEnergy = function (frequency1, frequency2) {
    var nyquist = p5sound.audiocontext.sampleRate / 2;
    if (frequency1 === 'bass') {
      frequency1 = this.bass[0];
      frequency2 = this.bass[1];
    } else if (frequency1 === 'lowMid') {
      frequency1 = this.lowMid[0];
      frequency2 = this.lowMid[1];
    } else if (frequency1 === 'mid') {
      frequency1 = this.mid[0];
      frequency2 = this.mid[1];
    } else if (frequency1 === 'highMid') {
      frequency1 = this.highMid[0];
      frequency2 = this.highMid[1];
    } else if (frequency1 === 'treble') {
      frequency1 = this.treble[0];
      frequency2 = this.treble[1];
    }
    if (typeof frequency1 !== 'number') {
      throw 'invalid input for getEnergy()';
    } else if (!frequency2) {
      // if only one parameter:
      var index = Math.round(frequency1 / nyquist * this.freqDomain.length);
      return this.freqDomain[index];
    } else if (frequency1 && frequency2) {
      // if two parameters:
      // if second is higher than first
      if (frequency1 > frequency2) {
        var swap = frequency2;
        frequency2 = frequency1;
        frequency1 = swap;
      }
      var lowIndex = Math.round(frequency1 / nyquist * this.freqDomain.length);
      var highIndex = Math.round(frequency2 / nyquist * this.freqDomain.length);
      var total = 0;
      var numFrequencies = 0;
      // add up all of the values for the frequencies
      for (var i = lowIndex; i <= highIndex; i++) {
        total += this.freqDomain[i];
        numFrequencies += 1;
      }
      // divide by total number of frequencies
      var toReturn = total / numFrequencies;
      return toReturn;
    } else {
      throw 'invalid input for getEnergy()';
    }
  };
  // compatability with v.012, changed to getEnergy in v.0121. Will be deprecated...
  p5.FFT.prototype.getFreq = function (freq1, freq2) {
    console.log('getFreq() is deprecated. Please use getEnergy() instead.');
    var x = this.getEnergy(freq1, freq2);
    return x;
  };
  /**
     *  Returns the
     *  <a href="http://en.wikipedia.org/wiki/Spectral_centroid" target="_blank">
     *  spectral centroid</a> of the input signal.
     *  <em>NOTE: analyze() must be called prior to getCentroid(). Analyze()
     *  tells the FFT to analyze frequency data, and getCentroid() uses
     *  the results determine the spectral centroid.</em></p>
     *
     *  @method  getCentroid
     *  @return {Number}   Spectral Centroid Frequency   Frequency of the spectral centroid in Hz.
     *
     *
     * @example
     *  <div><code>
     *
     *
     *function setup(){
     *  cnv = createCanvas(100,100);
     *  sound = new p5.AudioIn();
     *  sound.start();
     *  fft = new p5.FFT();
     *  sound.connect(fft);
     *}
     *
     *
     *function draw(){
     *
     *  var centroidplot = 0.0;
     *  var spectralCentroid = 0;
     *
     *
     *  background(0);
     *  stroke(0,255,0);
     *  var spectrum = fft.analyze();
     *  fill(0,255,0); // spectrum is green
     *
     *  //draw the spectrum
     *  for (var i = 0; i< spectrum.length; i++){
     *    var x = map(log(i), 0, log(spectrum.length), 0, width);
     *    var h = map(spectrum[i], 0, 255, 0, height);
     *    var rectangle_width = (log(i+1)-log(i))*(width/log(spectrum.length));
     *    rect(x, height, rectangle_width, -h )
     *  }
  
     *  var nyquist = 22050;
     *
     *  // get the centroid
     *  spectralCentroid = fft.getCentroid();
     *
     *  // the mean_freq_index calculation is for the display.
     *  var mean_freq_index = spectralCentroid/(nyquist/spectrum.length);
     *
     *  centroidplot = map(log(mean_freq_index), 0, log(spectrum.length), 0, width);
     *
     *
     *  stroke(255,0,0); // the line showing where the centroid is will be red
     *
     *  rect(centroidplot, 0, width / spectrum.length, height)
     *  noStroke();
     *  fill(255,255,255);  // text is white
     *  text("centroid: ", 10, 20);
     *  text(round(spectralCentroid)+" Hz", 10, 40);
     *}
     * </code></div>
     */
  p5.FFT.prototype.getCentroid = function () {
    var nyquist = p5sound.audiocontext.sampleRate / 2;
    var cumulative_sum = 0;
    var centroid_normalization = 0;
    for (var i = 0; i < this.freqDomain.length; i++) {
      cumulative_sum += i * this.freqDomain[i];
      centroid_normalization += this.freqDomain[i];
    }
    var mean_freq_index = 0;
    if (centroid_normalization !== 0) {
      mean_freq_index = cumulative_sum / centroid_normalization;
    }
    var spec_centroid_freq = mean_freq_index * (nyquist / this.freqDomain.length);
    return spec_centroid_freq;
  };
  /**
   *  Smooth FFT analysis by averaging with the last analysis frame.
   *
   *  @method smooth
   *  @param {Number} smoothing    0.0 < smoothing < 1.0.
   *                               Defaults to 0.8.
   */
  p5.FFT.prototype.smooth = function (s) {
    if (typeof s !== 'undefined') {
      this.smoothing = s;
    }
    return this.smoothing;
  };
  p5.FFT.prototype.dispose = function () {
    // remove reference from soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);
    if (this.analyser) {
      this.analyser.disconnect();
      delete this.analyser;
    }
  };
  /**
   *  Returns an array of average amplitude values for a given number
   *  of frequency bands split equally. N defaults to 16.
   *  <em>NOTE: analyze() must be called prior to linAverages(). Analyze()
   *  tells the FFT to analyze frequency data, and linAverages() uses
   *  the results to group them into a smaller set of averages.</em></p>
   *
   *  @method  linAverages
   *  @param  {Number}  N                Number of returned frequency groups
   *  @return {Array}   linearAverages   Array of average amplitude values for each group
   */
  p5.FFT.prototype.linAverages = function (N) {
    var N = N || 16;
    // This prevents undefined, null or 0 values of N
    var spectrum = this.freqDomain;
    var spectrumLength = spectrum.length;
    var spectrumStep = Math.floor(spectrumLength / N);
    var linearAverages = new Array(N);
    // Keep a second index for the current average group and place the values accordingly
    // with only one loop in the spectrum data
    var groupIndex = 0;
    for (var specIndex = 0; specIndex < spectrumLength; specIndex++) {
      linearAverages[groupIndex] = linearAverages[groupIndex] !== undefined ? (linearAverages[groupIndex] + spectrum[specIndex]) / 2 : spectrum[specIndex];
      // Increase the group index when the last element of the group is processed
      if (specIndex % spectrumStep === spectrumStep - 1) {
        groupIndex++;
      }
    }
    return linearAverages;
  };
  /**
   *  Returns an array of average amplitude values of the spectrum, for a given
   *  set of <a href="https://en.wikipedia.org/wiki/Octave_band" target="_blank">
   *  Octave Bands</a>
   *  <em>NOTE: analyze() must be called prior to logAverages(). Analyze()
   *  tells the FFT to analyze frequency data, and logAverages() uses
   *  the results to group them into a smaller set of averages.</em></p>
   *
   *  @method  logAverages
   *  @param  {Array}   octaveBands    Array of Octave Bands objects for grouping
   *  @return {Array}   logAverages    Array of average amplitude values for each group
   */
  p5.FFT.prototype.logAverages = function (octaveBands) {
    var nyquist = p5sound.audiocontext.sampleRate / 2;
    var spectrum = this.freqDomain;
    var spectrumLength = spectrum.length;
    var logAverages = new Array(octaveBands.length);
    // Keep a second index for the current average group and place the values accordingly
    // With only one loop in the spectrum data
    var octaveIndex = 0;
    for (var specIndex = 0; specIndex < spectrumLength; specIndex++) {
      var specIndexFrequency = Math.round(specIndex * nyquist / this.freqDomain.length);
      // Increase the group index if the current frequency exceeds the limits of the band
      if (specIndexFrequency > octaveBands[octaveIndex].hi) {
        octaveIndex++;
      }
      logAverages[octaveIndex] = logAverages[octaveIndex] !== undefined ? (logAverages[octaveIndex] + spectrum[specIndex]) / 2 : spectrum[specIndex];
    }
    return logAverages;
  };
  /**
   *  Calculates and Returns the 1/N
   *  <a href="https://en.wikipedia.org/wiki/Octave_band" target="_blank">Octave Bands</a>
   *  N defaults to 3 and minimum central frequency to 15.625Hz.
   *  (1/3 Octave Bands ~= 31 Frequency Bands)
   *  Setting fCtr0 to a central value of a higher octave will ignore the lower bands
   *  and produce less frequency groups.
   *
   *  @method   getOctaveBands
   *  @param  {Number}  N             Specifies the 1/N type of generated octave bands
   *  @param  {Number}  fCtr0         Minimum central frequency for the lowest band
   *  @return {Array}   octaveBands   Array of octave band objects with their bounds
   */
  p5.FFT.prototype.getOctaveBands = function (N, fCtr0) {
    var N = N || 3;
    // Default to 1/3 Octave Bands
    var fCtr0 = fCtr0 || 15.625;
    // Minimum central frequency, defaults to 15.625Hz
    var octaveBands = [];
    var lastFrequencyBand = {
      lo: fCtr0 / Math.pow(2, 1 / (2 * N)),
      ctr: fCtr0,
      hi: fCtr0 * Math.pow(2, 1 / (2 * N))
    };
    octaveBands.push(lastFrequencyBand);
    var nyquist = p5sound.audiocontext.sampleRate / 2;
    while (lastFrequencyBand.hi < nyquist) {
      var newFrequencyBand = {};
      newFrequencyBand.lo = lastFrequencyBand.hi;
      newFrequencyBand.ctr = lastFrequencyBand.ctr * Math.pow(2, 1 / N);
      newFrequencyBand.hi = newFrequencyBand.ctr * Math.pow(2, 1 / (2 * N));
      octaveBands.push(newFrequencyBand);
      lastFrequencyBand = newFrequencyBand;
    }
    return octaveBands;
  };
  // helper methods to convert type from float (dB) to int (0-255)
  var freqToFloat = function (fft) {
    if (fft.freqDomain instanceof Float32Array === false) {
      fft.freqDomain = new Float32Array(fft.analyser.frequencyBinCount);
    }
  };
  var freqToInt = function (fft) {
    if (fft.freqDomain instanceof Uint8Array === false) {
      fft.freqDomain = new Uint8Array(fft.analyser.frequencyBinCount);
    }
  };
  var timeToFloat = function (fft) {
    if (fft.timeDomain instanceof Float32Array === false) {
      fft.timeDomain = new Float32Array(fft.analyser.frequencyBinCount);
    }
  };
  var timeToInt = function (fft) {
    if (fft.timeDomain instanceof Uint8Array === false) {
      fft.timeDomain = new Uint8Array(fft.analyser.frequencyBinCount);
    }
  };
}(master);
/** Tone.js module by Yotam Mann, MIT License 2016  http://opensource.org/licenses/MIT **/
var Tone_signal_SignalBase;
Tone_signal_SignalBase = function (Tone) {
  'use strict';
  Tone.SignalBase = function () {
  };
  Tone.extend(Tone.SignalBase);
  Tone.SignalBase.prototype.connect = function (node, outputNumber, inputNumber) {
    if (Tone.Signal && Tone.Signal === node.constructor || Tone.Param && Tone.Param === node.constructor || Tone.TimelineSignal && Tone.TimelineSignal === node.constructor) {
      node._param.cancelScheduledValues(0);
      node._param.value = 0;
      node.overridden = true;
    } else if (node instanceof AudioParam) {
      node.cancelScheduledValues(0);
      node.value = 0;
    }
    Tone.prototype.connect.call(this, node, outputNumber, inputNumber);
    return this;
  };
  return Tone.SignalBase;
}(Tone_core_Tone);
/** Tone.js module by Yotam Mann, MIT License 2016  http://opensource.org/licenses/MIT **/
var Tone_signal_WaveShaper;
Tone_signal_WaveShaper = function (Tone) {
  'use strict';
  Tone.WaveShaper = function (mapping, bufferLen) {
    this._shaper = this.input = this.output = this.context.createWaveShaper();
    this._curve = null;
    if (Array.isArray(mapping)) {
      this.curve = mapping;
    } else if (isFinite(mapping) || this.isUndef(mapping)) {
      this._curve = new Float32Array(this.defaultArg(mapping, 1024));
    } else if (this.isFunction(mapping)) {
      this._curve = new Float32Array(this.defaultArg(bufferLen, 1024));
      this.setMap(mapping);
    }
  };
  Tone.extend(Tone.WaveShaper, Tone.SignalBase);
  Tone.WaveShaper.prototype.setMap = function (mapping) {
    for (var i = 0, len = this._curve.length; i < len; i++) {
      var normalized = i / (len - 1) * 2 - 1;
      this._curve[i] = mapping(normalized, i);
    }
    this._shaper.curve = this._curve;
    return this;
  };
  Object.defineProperty(Tone.WaveShaper.prototype, 'curve', {
    get: function () {
      return this._shaper.curve;
    },
    set: function (mapping) {
      this._curve = new Float32Array(mapping);
      this._shaper.curve = this._curve;
    }
  });
  Object.defineProperty(Tone.WaveShaper.prototype, 'oversample', {
    get: function () {
      return this._shaper.oversample;
    },
    set: function (oversampling) {
      if ([
          'none',
          '2x',
          '4x'
        ].indexOf(oversampling) !== -1) {
        this._shaper.oversample = oversampling;
      } else {
        throw new RangeError('Tone.WaveShaper: oversampling must be either \'none\', \'2x\', or \'4x\'');
      }
    }
  });
  Tone.WaveShaper.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._shaper.disconnect();
    this._shaper = null;
    this._curve = null;
    return this;
  };
  return Tone.WaveShaper;
}(Tone_core_Tone);
/** Tone.js module by Yotam Mann, MIT License 2016  http://opensource.org/licenses/MIT **/
var Tone_type_TimeBase;
Tone_type_TimeBase = function (Tone) {
  Tone.TimeBase = function (val, units) {
    if (this instanceof Tone.TimeBase) {
      this._expr = this._noOp;
      if (val instanceof Tone.TimeBase) {
        this.copy(val);
      } else if (!this.isUndef(units) || this.isNumber(val)) {
        units = this.defaultArg(units, this._defaultUnits);
        var method = this._primaryExpressions[units].method;
        this._expr = method.bind(this, val);
      } else if (this.isString(val)) {
        this.set(val);
      } else if (this.isUndef(val)) {
        this._expr = this._defaultExpr();
      }
    } else {
      return new Tone.TimeBase(val, units);
    }
  };
  Tone.extend(Tone.TimeBase);
  Tone.TimeBase.prototype.set = function (exprString) {
    this._expr = this._parseExprString(exprString);
    return this;
  };
  Tone.TimeBase.prototype.clone = function () {
    var instance = new this.constructor();
    instance.copy(this);
    return instance;
  };
  Tone.TimeBase.prototype.copy = function (time) {
    var val = time._expr();
    return this.set(val);
  };
  Tone.TimeBase.prototype._primaryExpressions = {
    'n': {
      regexp: /^(\d+)n/i,
      method: function (value) {
        value = parseInt(value);
        if (value === 1) {
          return this._beatsToUnits(this._timeSignature());
        } else {
          return this._beatsToUnits(4 / value);
        }
      }
    },
    't': {
      regexp: /^(\d+)t/i,
      method: function (value) {
        value = parseInt(value);
        return this._beatsToUnits(8 / (parseInt(value) * 3));
      }
    },
    'm': {
      regexp: /^(\d+)m/i,
      method: function (value) {
        return this._beatsToUnits(parseInt(value) * this._timeSignature());
      }
    },
    'i': {
      regexp: /^(\d+)i/i,
      method: function (value) {
        return this._ticksToUnits(parseInt(value));
      }
    },
    'hz': {
      regexp: /^(\d+(?:\.\d+)?)hz/i,
      method: function (value) {
        return this._frequencyToUnits(parseFloat(value));
      }
    },
    'tr': {
      regexp: /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?):?(\d+(?:\.\d+)?)?/,
      method: function (m, q, s) {
        var total = 0;
        if (m && m !== '0') {
          total += this._beatsToUnits(this._timeSignature() * parseFloat(m));
        }
        if (q && q !== '0') {
          total += this._beatsToUnits(parseFloat(q));
        }
        if (s && s !== '0') {
          total += this._beatsToUnits(parseFloat(s) / 4);
        }
        return total;
      }
    },
    's': {
      regexp: /^(\d+(?:\.\d+)?s)/,
      method: function (value) {
        return this._secondsToUnits(parseFloat(value));
      }
    },
    'samples': {
      regexp: /^(\d+)samples/,
      method: function (value) {
        return parseInt(value) / this.context.sampleRate;
      }
    },
    'default': {
      regexp: /^(\d+(?:\.\d+)?)/,
      method: function (value) {
        return this._primaryExpressions[this._defaultUnits].method.call(this, value);
      }
    }
  };
  Tone.TimeBase.prototype._binaryExpressions = {
    '+': {
      regexp: /^\+/,
      precedence: 2,
      method: function (lh, rh) {
        return lh() + rh();
      }
    },
    '-': {
      regexp: /^\-/,
      precedence: 2,
      method: function (lh, rh) {
        return lh() - rh();
      }
    },
    '*': {
      regexp: /^\*/,
      precedence: 1,
      method: function (lh, rh) {
        return lh() * rh();
      }
    },
    '/': {
      regexp: /^\//,
      precedence: 1,
      method: function (lh, rh) {
        return lh() / rh();
      }
    }
  };
  Tone.TimeBase.prototype._unaryExpressions = {
    'neg': {
      regexp: /^\-/,
      method: function (lh) {
        return -lh();
      }
    }
  };
  Tone.TimeBase.prototype._syntaxGlue = {
    '(': { regexp: /^\(/ },
    ')': { regexp: /^\)/ }
  };
  Tone.TimeBase.prototype._tokenize = function (expr) {
    var position = -1;
    var tokens = [];
    while (expr.length > 0) {
      expr = expr.trim();
      var token = getNextToken(expr, this);
      tokens.push(token);
      expr = expr.substr(token.value.length);
    }
    function getNextToken(expr, context) {
      var expressions = [
        '_binaryExpressions',
        '_unaryExpressions',
        '_primaryExpressions',
        '_syntaxGlue'
      ];
      for (var i = 0; i < expressions.length; i++) {
        var group = context[expressions[i]];
        for (var opName in group) {
          var op = group[opName];
          var reg = op.regexp;
          var match = expr.match(reg);
          if (match !== null) {
            return {
              method: op.method,
              precedence: op.precedence,
              regexp: op.regexp,
              value: match[0]
            };
          }
        }
      }
      throw new SyntaxError('Tone.TimeBase: Unexpected token ' + expr);
    }
    return {
      next: function () {
        return tokens[++position];
      },
      peek: function () {
        return tokens[position + 1];
      }
    };
  };
  Tone.TimeBase.prototype._matchGroup = function (token, group, prec) {
    var ret = false;
    if (!this.isUndef(token)) {
      for (var opName in group) {
        var op = group[opName];
        if (op.regexp.test(token.value)) {
          if (!this.isUndef(prec)) {
            if (op.precedence === prec) {
              return op;
            }
          } else {
            return op;
          }
        }
      }
    }
    return ret;
  };
  Tone.TimeBase.prototype._parseBinary = function (lexer, precedence) {
    if (this.isUndef(precedence)) {
      precedence = 2;
    }
    var expr;
    if (precedence < 0) {
      expr = this._parseUnary(lexer);
    } else {
      expr = this._parseBinary(lexer, precedence - 1);
    }
    var token = lexer.peek();
    while (token && this._matchGroup(token, this._binaryExpressions, precedence)) {
      token = lexer.next();
      expr = token.method.bind(this, expr, this._parseBinary(lexer, precedence - 1));
      token = lexer.peek();
    }
    return expr;
  };
  Tone.TimeBase.prototype._parseUnary = function (lexer) {
    var token, expr;
    token = lexer.peek();
    var op = this._matchGroup(token, this._unaryExpressions);
    if (op) {
      token = lexer.next();
      expr = this._parseUnary(lexer);
      return op.method.bind(this, expr);
    }
    return this._parsePrimary(lexer);
  };
  Tone.TimeBase.prototype._parsePrimary = function (lexer) {
    var token, expr;
    token = lexer.peek();
    if (this.isUndef(token)) {
      throw new SyntaxError('Tone.TimeBase: Unexpected end of expression');
    }
    if (this._matchGroup(token, this._primaryExpressions)) {
      token = lexer.next();
      var matching = token.value.match(token.regexp);
      return token.method.bind(this, matching[1], matching[2], matching[3]);
    }
    if (token && token.value === '(') {
      lexer.next();
      expr = this._parseBinary(lexer);
      token = lexer.next();
      if (!(token && token.value === ')')) {
        throw new SyntaxError('Expected )');
      }
      return expr;
    }
    throw new SyntaxError('Tone.TimeBase: Cannot process token ' + token.value);
  };
  Tone.TimeBase.prototype._parseExprString = function (exprString) {
    if (!this.isString(exprString)) {
      exprString = exprString.toString();
    }
    var lexer = this._tokenize(exprString);
    var tree = this._parseBinary(lexer);
    return tree;
  };
  Tone.TimeBase.prototype._noOp = function () {
    return 0;
  };
  Tone.TimeBase.prototype._defaultExpr = function () {
    return this._noOp;
  };
  Tone.TimeBase.prototype._defaultUnits = 's';
  Tone.TimeBase.prototype._frequencyToUnits = function (freq) {
    return 1 / freq;
  };
  Tone.TimeBase.prototype._beatsToUnits = function (beats) {
    return 60 / Tone.Transport.bpm.value * beats;
  };
  Tone.TimeBase.prototype._secondsToUnits = function (seconds) {
    return seconds;
  };
  Tone.TimeBase.prototype._ticksToUnits = function (ticks) {
    return ticks * (this._beatsToUnits(1) / Tone.Transport.PPQ);
  };
  Tone.TimeBase.prototype._timeSignature = function () {
    return Tone.Transport.timeSignature;
  };
  Tone.TimeBase.prototype._pushExpr = function (val, name, units) {
    if (!(val instanceof Tone.TimeBase)) {
      val = new this.constructor(val, units);
    }
    this._expr = this._binaryExpressions[name].method.bind(this, this._expr, val._expr);
    return this;
  };
  Tone.TimeBase.prototype.add = function (val, units) {
    return this._pushExpr(val, '+', units);
  };
  Tone.TimeBase.prototype.sub = function (val, units) {
    return this._pushExpr(val, '-', units);
  };
  Tone.TimeBase.prototype.mult = function (val, units) {
    return this._pushExpr(val, '*', units);
  };
  Tone.TimeBase.prototype.div = function (val, units) {
    return this._pushExpr(val, '/', units);
  };
  Tone.TimeBase.prototype.valueOf = function () {
    return this._expr();
  };
  Tone.TimeBase.prototype.dispose = function () {
    this._expr = null;
  };
  return Tone.TimeBase;
}(Tone_core_Tone);
/** Tone.js module by Yotam Mann, MIT License 2016  http://opensource.org/licenses/MIT **/
var Tone_type_Time;
Tone_type_Time = function (Tone) {
  Tone.Time = function (val, units) {
    if (this instanceof Tone.Time) {
      this._plusNow = false;
      Tone.TimeBase.call(this, val, units);
    } else {
      return new Tone.Time(val, units);
    }
  };
  Tone.extend(Tone.Time, Tone.TimeBase);
  Tone.Time.prototype._unaryExpressions = Object.create(Tone.TimeBase.prototype._unaryExpressions);
  Tone.Time.prototype._unaryExpressions.quantize = {
    regexp: /^@/,
    method: function (rh) {
      return Tone.Transport.nextSubdivision(rh());
    }
  };
  Tone.Time.prototype._unaryExpressions.now = {
    regexp: /^\+/,
    method: function (lh) {
      this._plusNow = true;
      return lh();
    }
  };
  Tone.Time.prototype.quantize = function (subdiv, percent) {
    percent = this.defaultArg(percent, 1);
    this._expr = function (expr, subdivision, percent) {
      expr = expr();
      subdivision = subdivision.toSeconds();
      var multiple = Math.round(expr / subdivision);
      var ideal = multiple * subdivision;
      var diff = ideal - expr;
      return expr + diff * percent;
    }.bind(this, this._expr, new this.constructor(subdiv), percent);
    return this;
  };
  Tone.Time.prototype.addNow = function () {
    this._plusNow = true;
    return this;
  };
  Tone.Time.prototype._defaultExpr = function () {
    this._plusNow = true;
    return this._noOp;
  };
  Tone.Time.prototype.copy = function (time) {
    Tone.TimeBase.prototype.copy.call(this, time);
    this._plusNow = time._plusNow;
    return this;
  };
  Tone.Time.prototype.toNotation = function () {
    var time = this.toSeconds();
    var testNotations = [
      '1m',
      '2n',
      '4n',
      '8n',
      '16n',
      '32n',
      '64n',
      '128n'
    ];
    var retNotation = this._toNotationHelper(time, testNotations);
    var testTripletNotations = [
      '1m',
      '2n',
      '2t',
      '4n',
      '4t',
      '8n',
      '8t',
      '16n',
      '16t',
      '32n',
      '32t',
      '64n',
      '64t',
      '128n'
    ];
    var retTripletNotation = this._toNotationHelper(time, testTripletNotations);
    if (retTripletNotation.split('+').length < retNotation.split('+').length) {
      return retTripletNotation;
    } else {
      return retNotation;
    }
  };
  Tone.Time.prototype._toNotationHelper = function (units, testNotations) {
    var threshold = this._notationToUnits(testNotations[testNotations.length - 1]);
    var retNotation = '';
    for (var i = 0; i < testNotations.length; i++) {
      var notationTime = this._notationToUnits(testNotations[i]);
      var multiple = units / notationTime;
      var floatingPointError = 0.000001;
      if (1 - multiple % 1 < floatingPointError) {
        multiple += floatingPointError;
      }
      multiple = Math.floor(multiple);
      if (multiple > 0) {
        if (multiple === 1) {
          retNotation += testNotations[i];
        } else {
          retNotation += multiple.toString() + '*' + testNotations[i];
        }
        units -= multiple * notationTime;
        if (units < threshold) {
          break;
        } else {
          retNotation += ' + ';
        }
      }
    }
    if (retNotation === '') {
      retNotation = '0';
    }
    return retNotation;
  };
  Tone.Time.prototype._notationToUnits = function (notation) {
    var primaryExprs = this._primaryExpressions;
    var notationExprs = [
      primaryExprs.n,
      primaryExprs.t,
      primaryExprs.m
    ];
    for (var i = 0; i < notationExprs.length; i++) {
      var expr = notationExprs[i];
      var match = notation.match(expr.regexp);
      if (match) {
        return expr.method.call(this, match[1]);
      }
    }
  };
  Tone.Time.prototype.toBarsBeatsSixteenths = function () {
    var quarterTime = this._beatsToUnits(1);
    var quarters = this.toSeconds() / quarterTime;
    var measures = Math.floor(quarters / this._timeSignature());
    var sixteenths = quarters % 1 * 4;
    quarters = Math.floor(quarters) % this._timeSignature();
    sixteenths = sixteenths.toString();
    if (sixteenths.length > 3) {
      sixteenths = parseFloat(sixteenths).toFixed(3);
    }
    var progress = [
      measures,
      quarters,
      sixteenths
    ];
    return progress.join(':');
  };
  Tone.Time.prototype.toTicks = function () {
    var quarterTime = this._beatsToUnits(1);
    var quarters = this.valueOf() / quarterTime;
    return Math.floor(quarters * Tone.Transport.PPQ);
  };
  Tone.Time.prototype.toSamples = function () {
    return this.toSeconds() * this.context.sampleRate;
  };
  Tone.Time.prototype.toFrequency = function () {
    return 1 / this.toSeconds();
  };
  Tone.Time.prototype.toSeconds = function () {
    return this.valueOf();
  };
  Tone.Time.prototype.toMilliseconds = function () {
    return this.toSeconds() * 1000;
  };
  Tone.Time.prototype.valueOf = function () {
    var val = this._expr();
    return val + (this._plusNow ? this.now() : 0);
  };
  return Tone.Time;
}(Tone_core_Tone);
/** Tone.js module by Yotam Mann, MIT License 2016  http://opensource.org/licenses/MIT **/
var Tone_type_Frequency;
Tone_type_Frequency = function (Tone) {
  Tone.Frequency = function (val, units) {
    if (this instanceof Tone.Frequency) {
      Tone.TimeBase.call(this, val, units);
    } else {
      return new Tone.Frequency(val, units);
    }
  };
  Tone.extend(Tone.Frequency, Tone.TimeBase);
  Tone.Frequency.prototype._primaryExpressions = Object.create(Tone.TimeBase.prototype._primaryExpressions);
  Tone.Frequency.prototype._primaryExpressions.midi = {
    regexp: /^(\d+(?:\.\d+)?midi)/,
    method: function (value) {
      return this.midiToFrequency(value);
    }
  };
  Tone.Frequency.prototype._primaryExpressions.note = {
    regexp: /^([a-g]{1}(?:b|#|x|bb)?)(-?[0-9]+)/i,
    method: function (pitch, octave) {
      var index = noteToScaleIndex[pitch.toLowerCase()];
      var noteNumber = index + (parseInt(octave) + 1) * 12;
      return this.midiToFrequency(noteNumber);
    }
  };
  Tone.Frequency.prototype._primaryExpressions.tr = {
    regexp: /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?):?(\d+(?:\.\d+)?)?/,
    method: function (m, q, s) {
      var total = 1;
      if (m && m !== '0') {
        total *= this._beatsToUnits(this._timeSignature() * parseFloat(m));
      }
      if (q && q !== '0') {
        total *= this._beatsToUnits(parseFloat(q));
      }
      if (s && s !== '0') {
        total *= this._beatsToUnits(parseFloat(s) / 4);
      }
      return total;
    }
  };
  Tone.Frequency.prototype.transpose = function (interval) {
    this._expr = function (expr, interval) {
      var val = expr();
      return val * this.intervalToFrequencyRatio(interval);
    }.bind(this, this._expr, interval);
    return this;
  };
  Tone.Frequency.prototype.harmonize = function (intervals) {
    this._expr = function (expr, intervals) {
      var val = expr();
      var ret = [];
      for (var i = 0; i < intervals.length; i++) {
        ret[i] = val * this.intervalToFrequencyRatio(intervals[i]);
      }
      return ret;
    }.bind(this, this._expr, intervals);
    return this;
  };
  Tone.Frequency.prototype.toMidi = function () {
    return this.frequencyToMidi(this.valueOf());
  };
  Tone.Frequency.prototype.toNote = function () {
    var freq = this.valueOf();
    var log = Math.log(freq / Tone.Frequency.A4) / Math.LN2;
    var noteNumber = Math.round(12 * log) + 57;
    var octave = Math.floor(noteNumber / 12);
    if (octave < 0) {
      noteNumber += -12 * octave;
    }
    var noteName = scaleIndexToNote[noteNumber % 12];
    return noteName + octave.toString();
  };
  Tone.Frequency.prototype.toSeconds = function () {
    return 1 / this.valueOf();
  };
  Tone.Frequency.prototype.toFrequency = function () {
    return this.valueOf();
  };
  Tone.Frequency.prototype.toTicks = function () {
    var quarterTime = this._beatsToUnits(1);
    var quarters = this.valueOf() / quarterTime;
    return Math.floor(quarters * Tone.Transport.PPQ);
  };
  Tone.Frequency.prototype._frequencyToUnits = function (freq) {
    return freq;
  };
  Tone.Frequency.prototype._ticksToUnits = function (ticks) {
    return 1 / (ticks * 60 / (Tone.Transport.bpm.value * Tone.Transport.PPQ));
  };
  Tone.Frequency.prototype._beatsToUnits = function (beats) {
    return 1 / Tone.TimeBase.prototype._beatsToUnits.call(this, beats);
  };
  Tone.Frequency.prototype._secondsToUnits = function (seconds) {
    return 1 / seconds;
  };
  Tone.Frequency.prototype._defaultUnits = 'hz';
  var noteToScaleIndex = {
    'cbb': -2,
    'cb': -1,
    'c': 0,
    'c#': 1,
    'cx': 2,
    'dbb': 0,
    'db': 1,
    'd': 2,
    'd#': 3,
    'dx': 4,
    'ebb': 2,
    'eb': 3,
    'e': 4,
    'e#': 5,
    'ex': 6,
    'fbb': 3,
    'fb': 4,
    'f': 5,
    'f#': 6,
    'fx': 7,
    'gbb': 5,
    'gb': 6,
    'g': 7,
    'g#': 8,
    'gx': 9,
    'abb': 7,
    'ab': 8,
    'a': 9,
    'a#': 10,
    'ax': 11,
    'bbb': 9,
    'bb': 10,
    'b': 11,
    'b#': 12,
    'bx': 13
  };
  var scaleIndexToNote = [
    'C',
    'C#',
    'D',
    'D#',
    'E',
    'F',
    'F#',
    'G',
    'G#',
    'A',
    'A#',
    'B'
  ];
  Tone.Frequency.A4 = 440;
  Tone.Frequency.prototype.midiToFrequency = function (midi) {
    return Tone.Frequency.A4 * Math.pow(2, (midi - 69) / 12);
  };
  Tone.Frequency.prototype.frequencyToMidi = function (frequency) {
    return 69 + 12 * Math.log(frequency / Tone.Frequency.A4) / Math.LN2;
  };
  return Tone.Frequency;
}(Tone_core_Tone);
/** Tone.js module by Yotam Mann, MIT License 2016  http://opensource.org/licenses/MIT **/
var Tone_type_TransportTime;
Tone_type_TransportTime = function (Tone) {
  Tone.TransportTime = function (val, units) {
    if (this instanceof Tone.TransportTime) {
      Tone.Time.call(this, val, units);
    } else {
      return new Tone.TransportTime(val, units);
    }
  };
  Tone.extend(Tone.TransportTime, Tone.Time);
  Tone.TransportTime.prototype._unaryExpressions = Object.create(Tone.Time.prototype._unaryExpressions);
  Tone.TransportTime.prototype._unaryExpressions.quantize = {
    regexp: /^@/,
    method: function (rh) {
      var subdivision = this._secondsToTicks(rh());
      var multiple = Math.ceil(Tone.Transport.ticks / subdivision);
      return this._ticksToUnits(multiple * subdivision);
    }
  };
  Tone.TransportTime.prototype._secondsToTicks = function (seconds) {
    var quarterTime = this._beatsToUnits(1);
    var quarters = seconds / quarterTime;
    return Math.round(quarters * Tone.Transport.PPQ);
  };
  Tone.TransportTime.prototype.valueOf = function () {
    var val = this._secondsToTicks(this._expr());
    return val + (this._plusNow ? Tone.Transport.ticks : 0);
  };
  Tone.TransportTime.prototype.toTicks = function () {
    return this.valueOf();
  };
  Tone.TransportTime.prototype.toSeconds = function () {
    var val = this._expr();
    return val + (this._plusNow ? Tone.Transport.seconds : 0);
  };
  Tone.TransportTime.prototype.toFrequency = function () {
    return 1 / this.toSeconds();
  };
  return Tone.TransportTime;
}(Tone_core_Tone);
/** Tone.js module by Yotam Mann, MIT License 2016  http://opensource.org/licenses/MIT **/
var Tone_type_Type;
Tone_type_Type = function (Tone) {
  Tone.Type = {
    Default: 'number',
    Time: 'time',
    Frequency: 'frequency',
    TransportTime: 'transportTime',
    Ticks: 'ticks',
    NormalRange: 'normalRange',
    AudioRange: 'audioRange',
    Decibels: 'db',
    Interval: 'interval',
    BPM: 'bpm',
    Positive: 'positive',
    Cents: 'cents',
    Degrees: 'degrees',
    MIDI: 'midi',
    BarsBeatsSixteenths: 'barsBeatsSixteenths',
    Samples: 'samples',
    Hertz: 'hertz',
    Note: 'note',
    Milliseconds: 'milliseconds',
    Seconds: 'seconds',
    Notation: 'notation'
  };
  Tone.prototype.toSeconds = function (time) {
    if (this.isNumber(time)) {
      return time;
    } else if (this.isUndef(time)) {
      return this.now();
    } else if (this.isString(time)) {
      return new Tone.Time(time).toSeconds();
    } else if (time instanceof Tone.TimeBase) {
      return time.toSeconds();
    }
  };
  Tone.prototype.toFrequency = function (freq) {
    if (this.isNumber(freq)) {
      return freq;
    } else if (this.isString(freq) || this.isUndef(freq)) {
      return new Tone.Frequency(freq).valueOf();
    } else if (freq instanceof Tone.TimeBase) {
      return freq.toFrequency();
    }
  };
  Tone.prototype.toTicks = function (time) {
    if (this.isNumber(time) || this.isString(time)) {
      return new Tone.TransportTime(time).toTicks();
    } else if (this.isUndef(time)) {
      return Tone.Transport.ticks;
    } else if (time instanceof Tone.TimeBase) {
      return time.toTicks();
    }
  };
  return Tone;
}(Tone_core_Tone, Tone_type_Time, Tone_type_Frequency, Tone_type_TransportTime);
/** Tone.js module by Yotam Mann, MIT License 2016  http://opensource.org/licenses/MIT **/
var Tone_core_Param;
Tone_core_Param = function (Tone) {
  'use strict';
  Tone.Param = function () {
    var options = this.optionsObject(arguments, [
      'param',
      'units',
      'convert'
    ], Tone.Param.defaults);
    this._param = this.input = options.param;
    this.units = options.units;
    this.convert = options.convert;
    this.overridden = false;
    this._lfo = null;
    if (this.isObject(options.lfo)) {
      this.value = options.lfo;
    } else if (!this.isUndef(options.value)) {
      this.value = options.value;
    }
  };
  Tone.extend(Tone.Param);
  Tone.Param.defaults = {
    'units': Tone.Type.Default,
    'convert': true,
    'param': undefined
  };
  Object.defineProperty(Tone.Param.prototype, 'value', {
    get: function () {
      return this._toUnits(this._param.value);
    },
    set: function (value) {
      if (this.isObject(value)) {
        if (this.isUndef(Tone.LFO)) {
          throw new Error('Include \'Tone.LFO\' to use an LFO as a Param value.');
        }
        if (this._lfo) {
          this._lfo.dispose();
        }
        this._lfo = new Tone.LFO(value).start();
        this._lfo.connect(this.input);
      } else {
        var convertedVal = this._fromUnits(value);
        this._param.cancelScheduledValues(0);
        this._param.value = convertedVal;
      }
    }
  });
  Tone.Param.prototype._fromUnits = function (val) {
    if (this.convert || this.isUndef(this.convert)) {
      switch (this.units) {
      case Tone.Type.Time:
        return this.toSeconds(val);
      case Tone.Type.Frequency:
        return this.toFrequency(val);
      case Tone.Type.Decibels:
        return this.dbToGain(val);
      case Tone.Type.NormalRange:
        return Math.min(Math.max(val, 0), 1);
      case Tone.Type.AudioRange:
        return Math.min(Math.max(val, -1), 1);
      case Tone.Type.Positive:
        return Math.max(val, 0);
      default:
        return val;
      }
    } else {
      return val;
    }
  };
  Tone.Param.prototype._toUnits = function (val) {
    if (this.convert || this.isUndef(this.convert)) {
      switch (this.units) {
      case Tone.Type.Decibels:
        return this.gainToDb(val);
      default:
        return val;
      }
    } else {
      return val;
    }
  };
  Tone.Param.prototype._minOutput = 0.00001;
  Tone.Param.prototype.setValueAtTime = function (value, time) {
    value = this._fromUnits(value);
    time = this.toSeconds(time);
    if (time <= this.now() + this.blockTime) {
      this._param.value = value;
    } else {
      this._param.setValueAtTime(value, time);
    }
    return this;
  };
  Tone.Param.prototype.setRampPoint = function (now) {
    now = this.defaultArg(now, this.now());
    var currentVal = this._param.value;
    if (currentVal === 0) {
      currentVal = this._minOutput;
    }
    this._param.setValueAtTime(currentVal, now);
    return this;
  };
  Tone.Param.prototype.linearRampToValueAtTime = function (value, endTime) {
    value = this._fromUnits(value);
    this._param.linearRampToValueAtTime(value, this.toSeconds(endTime));
    return this;
  };
  Tone.Param.prototype.exponentialRampToValueAtTime = function (value, endTime) {
    value = this._fromUnits(value);
    value = Math.max(this._minOutput, value);
    this._param.exponentialRampToValueAtTime(value, this.toSeconds(endTime));
    return this;
  };
  Tone.Param.prototype.exponentialRampToValue = function (value, rampTime, startTime) {
    startTime = this.toSeconds(startTime);
    this.setRampPoint(startTime);
    this.exponentialRampToValueAtTime(value, startTime + this.toSeconds(rampTime));
    return this;
  };
  Tone.Param.prototype.linearRampToValue = function (value, rampTime, startTime) {
    startTime = this.toSeconds(startTime);
    this.setRampPoint(startTime);
    this.linearRampToValueAtTime(value, startTime + this.toSeconds(rampTime));
    return this;
  };
  Tone.Param.prototype.setTargetAtTime = function (value, startTime, timeConstant) {
    value = this._fromUnits(value);
    value = Math.max(this._minOutput, value);
    timeConstant = Math.max(this._minOutput, timeConstant);
    this._param.setTargetAtTime(value, this.toSeconds(startTime), timeConstant);
    return this;
  };
  Tone.Param.prototype.setValueCurveAtTime = function (values, startTime, duration) {
    for (var i = 0; i < values.length; i++) {
      values[i] = this._fromUnits(values[i]);
    }
    this._param.setValueCurveAtTime(values, this.toSeconds(startTime), this.toSeconds(duration));
    return this;
  };
  Tone.Param.prototype.cancelScheduledValues = function (startTime) {
    this._param.cancelScheduledValues(this.toSeconds(startTime));
    return this;
  };
  Tone.Param.prototype.rampTo = function (value, rampTime, startTime) {
    rampTime = this.defaultArg(rampTime, 0);
    if (this.units === Tone.Type.Frequency || this.units === Tone.Type.BPM || this.units === Tone.Type.Decibels) {
      this.exponentialRampToValue(value, rampTime, startTime);
    } else {
      this.linearRampToValue(value, rampTime, startTime);
    }
    return this;
  };
  Object.defineProperty(Tone.Param.prototype, 'lfo', {
    get: function () {
      return this._lfo;
    }
  });
  Tone.Param.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._param = null;
    if (this._lfo) {
      this._lfo.dispose();
      this._lfo = null;
    }
    return this;
  };
  return Tone.Param;
}(Tone_core_Tone);
/** Tone.js module by Yotam Mann, MIT License 2016  http://opensource.org/licenses/MIT **/
var Tone_core_Gain;
Tone_core_Gain = function (Tone) {
  'use strict';
  if (window.GainNode && !AudioContext.prototype.createGain) {
    AudioContext.prototype.createGain = AudioContext.prototype.createGainNode;
  }
  Tone.Gain = function () {
    var options = this.optionsObject(arguments, [
      'gain',
      'units'
    ], Tone.Gain.defaults);
    this.input = this.output = this._gainNode = this.context.createGain();
    this.gain = new Tone.Param({
      'param': this._gainNode.gain,
      'units': options.units,
      'value': options.gain,
      'convert': options.convert
    });
    this._readOnly('gain');
  };
  Tone.extend(Tone.Gain);
  Tone.Gain.defaults = {
    'gain': 1,
    'convert': true
  };
  Tone.Gain.prototype.dispose = function () {
    Tone.Param.prototype.dispose.call(this);
    this._gainNode.disconnect();
    this._gainNode = null;
    this._writable('gain');
    this.gain.dispose();
    this.gain = null;
  };
  Tone.prototype.createInsOuts = function (inputs, outputs) {
    if (inputs === 1) {
      this.input = new Tone.Gain();
    } else if (inputs > 1) {
      this.input = new Array(inputs);
    }
    if (outputs === 1) {
      this.output = new Tone.Gain();
    } else if (outputs > 1) {
      this.output = new Array(inputs);
    }
  };
  return Tone.Gain;
}(Tone_core_Tone, Tone_core_Param);
/** Tone.js module by Yotam Mann, MIT License 2016  http://opensource.org/licenses/MIT **/
var Tone_signal_Signal;
Tone_signal_Signal = function (Tone) {
  'use strict';
  Tone.Signal = function () {
    var options = this.optionsObject(arguments, [
      'value',
      'units'
    ], Tone.Signal.defaults);
    this.output = this._gain = this.context.createGain();
    options.param = this._gain.gain;
    Tone.Param.call(this, options);
    this.input = this._param = this._gain.gain;
    this.context.getConstant(1).chain(this._gain);
  };
  Tone.extend(Tone.Signal, Tone.Param);
  Tone.Signal.defaults = {
    'value': 0,
    'units': Tone.Type.Default,
    'convert': true
  };
  Tone.Signal.prototype.connect = Tone.SignalBase.prototype.connect;
  Tone.Signal.prototype.dispose = function () {
    Tone.Param.prototype.dispose.call(this);
    this._param = null;
    this._gain.disconnect();
    this._gain = null;
    return this;
  };
  return Tone.Signal;
}(Tone_core_Tone, Tone_signal_WaveShaper, Tone_type_Type, Tone_core_Param);
/** Tone.js module by Yotam Mann, MIT License 2016  http://opensource.org/licenses/MIT **/
var Tone_signal_Add;
Tone_signal_Add = function (Tone) {
  'use strict';
  Tone.Add = function (value) {
    this.createInsOuts(2, 0);
    this._sum = this.input[0] = this.input[1] = this.output = new Tone.Gain();
    this._param = this.input[1] = new Tone.Signal(value);
    this._param.connect(this._sum);
  };
  Tone.extend(Tone.Add, Tone.Signal);
  Tone.Add.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._sum.dispose();
    this._sum = null;
    this._param.dispose();
    this._param = null;
    return this;
  };
  return Tone.Add;
}(Tone_core_Tone, Tone_signal_Signal);
/** Tone.js module by Yotam Mann, MIT License 2016  http://opensource.org/licenses/MIT **/
var Tone_signal_Multiply;
Tone_signal_Multiply = function (Tone) {
  'use strict';
  Tone.Multiply = function (value) {
    this.createInsOuts(2, 0);
    this._mult = this.input[0] = this.output = new Tone.Gain();
    this._param = this.input[1] = this.output.gain;
    this._param.value = this.defaultArg(value, 0);
  };
  Tone.extend(Tone.Multiply, Tone.Signal);
  Tone.Multiply.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._mult.dispose();
    this._mult = null;
    this._param = null;
    return this;
  };
  return Tone.Multiply;
}(Tone_core_Tone, Tone_signal_Signal);
/** Tone.js module by Yotam Mann, MIT License 2016  http://opensource.org/licenses/MIT **/
var Tone_signal_Scale;
Tone_signal_Scale = function (Tone) {
  'use strict';
  Tone.Scale = function (outputMin, outputMax) {
    this._outputMin = this.defaultArg(outputMin, 0);
    this._outputMax = this.defaultArg(outputMax, 1);
    this._scale = this.input = new Tone.Multiply(1);
    this._add = this.output = new Tone.Add(0);
    this._scale.connect(this._add);
    this._setRange();
  };
  Tone.extend(Tone.Scale, Tone.SignalBase);
  Object.defineProperty(Tone.Scale.prototype, 'min', {
    get: function () {
      return this._outputMin;
    },
    set: function (min) {
      this._outputMin = min;
      this._setRange();
    }
  });
  Object.defineProperty(Tone.Scale.prototype, 'max', {
    get: function () {
      return this._outputMax;
    },
    set: function (max) {
      this._outputMax = max;
      this._setRange();
    }
  });
  Tone.Scale.prototype._setRange = function () {
    this._add.value = this._outputMin;
    this._scale.value = this._outputMax - this._outputMin;
  };
  Tone.Scale.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._add.dispose();
    this._add = null;
    this._scale.dispose();
    this._scale = null;
    return this;
  };
  return Tone.Scale;
}(Tone_core_Tone, Tone_signal_Add, Tone_signal_Multiply);
var signal;
'use strict';
signal = function () {
  // Signal is built with the Tone.js signal by Yotam Mann
  // https://github.com/TONEnoTONE/Tone.js/
  var Signal = Tone_signal_Signal;
  var Add = Tone_signal_Add;
  var Mult = Tone_signal_Multiply;
  var Scale = Tone_signal_Scale;
  /**
   *  <p>p5.Signal is a constant audio-rate signal used by p5.Oscillator
   *  and p5.Envelope for modulation math.</p>
   *
   *  <p>This is necessary because Web Audio is processed on a seprate clock.
   *  For example, the p5 draw loop runs about 60 times per second. But
   *  the audio clock must process samples 44100 times per second. If we
   *  want to add a value to each of those samples, we can't do it in the
   *  draw loop, but we can do it by adding a constant-rate audio signal.</p.
   *
   *  <p>This class mostly functions behind the scenes in p5.sound, and returns
   *  a Tone.Signal from the Tone.js library by Yotam Mann.
   *  If you want to work directly with audio signals for modular
   *  synthesis, check out
   *  <a href='http://bit.ly/1oIoEng' target=_'blank'>tone.js.</a></p>
   *
   *  @class  p5.Signal
   *  @constructor
   *  @return {Tone.Signal} A Signal object from the Tone.js library
   *  @example
   *  <div><code>
   *  function setup() {
   *    carrier = new p5.Oscillator('sine');
   *    carrier.amp(1); // set amplitude
   *    carrier.freq(220); // set frequency
   *    carrier.start(); // start oscillating
   *
   *    modulator = new p5.Oscillator('sawtooth');
   *    modulator.disconnect();
   *    modulator.amp(1);
   *    modulator.freq(4);
   *    modulator.start();
   *
   *    // Modulator's default amplitude range is -1 to 1.
   *    // Multiply it by -200, so the range is -200 to 200
   *    // then add 220 so the range is 20 to 420
   *    carrier.freq( modulator.mult(-200).add(220) );
   *  }
   *  </code></div>
   */
  p5.Signal = function (value) {
    var s = new Signal(value);
    // p5sound.soundArray.push(s);
    return s;
  };
  /**
   *  Fade to value, for smooth transitions
   *
   *  @method  fade
   *  @param  {Number} value          Value to set this signal
   *  @param  {Number} [secondsFromNow] Length of fade, in seconds from now
   */
  Signal.prototype.fade = Signal.prototype.linearRampToValueAtTime;
  Mult.prototype.fade = Signal.prototype.fade;
  Add.prototype.fade = Signal.prototype.fade;
  Scale.prototype.fade = Signal.prototype.fade;
  /**
   *  Connect a p5.sound object or Web Audio node to this
   *  p5.Signal so that its amplitude values can be scaled.
   *
   *  @method setInput
   *  @param {Object} input
   */
  Signal.prototype.setInput = function (_input) {
    _input.connect(this);
  };
  Mult.prototype.setInput = Signal.prototype.setInput;
  Add.prototype.setInput = Signal.prototype.setInput;
  Scale.prototype.setInput = Signal.prototype.setInput;
  // signals can add / mult / scale themselves
  /**
   *  Add a constant value to this audio signal,
   *  and return the resulting audio signal. Does
   *  not change the value of the original signal,
   *  instead it returns a new p5.SignalAdd.
   *
   *  @method  add
   *  @param {Number} number
   *  @return {p5.Signal} object
   */
  Signal.prototype.add = function (num) {
    var add = new Add(num);
    // add.setInput(this);
    this.connect(add);
    return add;
  };
  Mult.prototype.add = Signal.prototype.add;
  Add.prototype.add = Signal.prototype.add;
  Scale.prototype.add = Signal.prototype.add;
  /**
   *  Multiply this signal by a constant value,
   *  and return the resulting audio signal. Does
   *  not change the value of the original signal,
   *  instead it returns a new p5.SignalMult.
   *
   *  @method  mult
   *  @param {Number} number to multiply
   *  @return {p5.Signal} object
   */
  Signal.prototype.mult = function (num) {
    var mult = new Mult(num);
    // mult.setInput(this);
    this.connect(mult);
    return mult;
  };
  Mult.prototype.mult = Signal.prototype.mult;
  Add.prototype.mult = Signal.prototype.mult;
  Scale.prototype.mult = Signal.prototype.mult;
  /**
   *  Scale this signal value to a given range,
   *  and return the result as an audio signal. Does
   *  not change the value of the original signal,
   *  instead it returns a new p5.SignalScale.
   *
   *  @method  scale
   *  @param {Number} number to multiply
   *  @param  {Number} inMin  input range minumum
   *  @param  {Number} inMax  input range maximum
   *  @param  {Number} outMin input range minumum
   *  @param  {Number} outMax input range maximum
   *  @return {p5.Signal} object
   */
  Signal.prototype.scale = function (inMin, inMax, outMin, outMax) {
    var mapOutMin, mapOutMax;
    if (arguments.length === 4) {
      mapOutMin = p5.prototype.map(outMin, inMin, inMax, 0, 1) - 0.5;
      mapOutMax = p5.prototype.map(outMax, inMin, inMax, 0, 1) - 0.5;
    } else {
      mapOutMin = arguments[0];
      mapOutMax = arguments[1];
    }
    var scale = new Scale(mapOutMin, mapOutMax);
    this.connect(scale);
    return scale;
  };
  Mult.prototype.scale = Signal.prototype.scale;
  Add.prototype.scale = Signal.prototype.scale;
  Scale.prototype.scale = Signal.prototype.scale;
}(Tone_signal_Signal, Tone_signal_Add, Tone_signal_Multiply, Tone_signal_Scale);
var oscillator;
'use strict';
oscillator = function () {
  var p5sound = master;
  var Add = Tone_signal_Add;
  var Mult = Tone_signal_Multiply;
  var Scale = Tone_signal_Scale;
  /**
   *  <p>Creates a signal that oscillates between -1.0 and 1.0.
   *  By default, the oscillation takes the form of a sinusoidal
   *  shape ('sine'). Additional types include 'triangle',
   *  'sawtooth' and 'square'. The frequency defaults to
   *  440 oscillations per second (440Hz, equal to the pitch of an
   *  'A' note).</p>
   *
   *  <p>Set the type of oscillation with setType(), or by instantiating a
   *  specific oscillator: <a href="/reference/#/p5.SinOsc">p5.SinOsc</a>, <a
   *  href="/reference/#/p5.TriOsc">p5.TriOsc</a>, <a
   *  href="/reference/#/p5.SqrOsc">p5.SqrOsc</a>, or <a
   *  href="/reference/#/p5.SawOsc">p5.SawOsc</a>.
   *  </p>
   *
   *  @class p5.Oscillator
   *  @constructor
   *  @param {Number} [freq] frequency defaults to 440Hz
   *  @param {String} [type] type of oscillator. Options:
   *                         'sine' (default), 'triangle',
   *                         'sawtooth', 'square'
   *  @example
   *  <div><code>
   *  let osc;
   *  let playing = false;
   *
   *  function setup() {
   *    backgroundColor = color(255,0,255);
   *    textAlign(CENTER);
   *
   *    osc = new p5.Oscillator();
   *    osc.setType('sine');
   *    osc.freq(240);
   *    osc.amp(0);
   *    osc.start();
   *  }
   *
   *  function draw() {
   *    background(backgroundColor)
   *    text('click to play', width/2, height/2);
   *  }
   *
   *  function mouseClicked() {
   *    if (mouseX > 0 && mouseX < width && mouseY < height && mouseY > 0) {
   *      if (!playing) {
   *        // ramp amplitude to 0.5 over 0.05 seconds
   *        osc.amp(0.5, 0.05);
   *        playing = true;
   *        backgroundColor = color(0,255,255);
   *      } else {
   *        // ramp amplitude to 0 over 0.5 seconds
   *        osc.amp(0, 0.5);
   *        playing = false;
   *        backgroundColor = color(255,0,255);
   *      }
   *    }
   *  }
   *  </code> </div>
   */
  p5.Oscillator = function (freq, type) {
    if (typeof freq === 'string') {
      var f = type;
      type = freq;
      freq = f;
    }
    if (typeof type === 'number') {
      var f = type;
      type = freq;
      freq = f;
    }
    this.started = false;
    // components
    this.phaseAmount = undefined;
    this.oscillator = p5sound.audiocontext.createOscillator();
    this.f = freq || 440;
    // frequency
    this.oscillator.type = type || 'sine';
    this.oscillator.frequency.setValueAtTime(this.f, p5sound.audiocontext.currentTime);
    // connections
    this.output = p5sound.audiocontext.createGain();
    this._freqMods = [];
    // modulators connected to this oscillator's frequency
    // set default output gain to 0.5
    this.output.gain.value = 0.5;
    this.output.gain.setValueAtTime(0.5, p5sound.audiocontext.currentTime);
    this.oscillator.connect(this.output);
    // stereo panning
    this.panPosition = 0;
    this.connection = p5sound.input;
    // connect to p5sound by default
    this.panner = new p5.Panner(this.output, this.connection, 1);
    //array of math operation signal chaining
    this.mathOps = [this.output];
    // add to the soundArray so we can dispose of the osc later
    p5sound.soundArray.push(this);
  };
  /**
   *  Start an oscillator. Accepts an optional parameter to
   *  determine how long (in seconds from now) until the
   *  oscillator starts.
   *
   *  @method  start
   *  @param  {Number} [time] startTime in seconds from now.
   *  @param  {Number} [frequency] frequency in Hz.
   */
  p5.Oscillator.prototype.start = function (time, f) {
    if (this.started) {
      var now = p5sound.audiocontext.currentTime;
      this.stop(now);
    }
    if (!this.started) {
      var freq = f || this.f;
      var type = this.oscillator.type;
      // set old osc free to be garbage collected (memory)
      if (this.oscillator) {
        this.oscillator.disconnect();
        delete this.oscillator;
      }
      // var detune = this.oscillator.frequency.value;
      this.oscillator = p5sound.audiocontext.createOscillator();
      this.oscillator.frequency.value = Math.abs(freq);
      this.oscillator.type = type;
      // this.oscillator.detune.value = detune;
      this.oscillator.connect(this.output);
      time = time || 0;
      this.oscillator.start(time + p5sound.audiocontext.currentTime);
      this.freqNode = this.oscillator.frequency;
      // if other oscillators are already connected to this osc's freq
      for (var i in this._freqMods) {
        if (typeof this._freqMods[i].connect !== 'undefined') {
          this._freqMods[i].connect(this.oscillator.frequency);
        }
      }
      this.started = true;
    }
  };
  /**
   *  Stop an oscillator. Accepts an optional parameter
   *  to determine how long (in seconds from now) until the
   *  oscillator stops.
   *
   *  @method  stop
   *  @param  {Number} secondsFromNow Time, in seconds from now.
   */
  p5.Oscillator.prototype.stop = function (time) {
    if (this.started) {
      var t = time || 0;
      var now = p5sound.audiocontext.currentTime;
      this.oscillator.stop(t + now);
      this.started = false;
    }
  };
  /**
   *  Set the amplitude between 0 and 1.0. Or, pass in an object
   *  such as an oscillator to modulate amplitude with an audio signal.
   *
   *  @method  amp
   *  @param  {Number|Object} vol between 0 and 1.0
   *                              or a modulating signal/oscillator
   *  @param {Number} [rampTime] create a fade that lasts rampTime
   *  @param {Number} [timeFromNow] schedule this event to happen
   *                                seconds from now
   *  @return  {AudioParam} gain  If no value is provided,
   *                              returns the Web Audio API
   *                              AudioParam that controls
   *                              this oscillator's
   *                              gain/amplitude/volume)
   */
  p5.Oscillator.prototype.amp = function (vol, rampTime, tFromNow) {
    var self = this;
    if (typeof vol === 'number') {
      var rampTime = rampTime || 0;
      var tFromNow = tFromNow || 0;
      var now = p5sound.audiocontext.currentTime;
      this.output.gain.linearRampToValueAtTime(vol, now + tFromNow + rampTime);
    } else if (vol) {
      vol.connect(self.output.gain);
    } else {
      // return the Gain Node
      return this.output.gain;
    }
  };
  // these are now the same thing
  p5.Oscillator.prototype.fade = p5.Oscillator.prototype.amp;
  p5.Oscillator.prototype.getAmp = function () {
    return this.output.gain.value;
  };
  /**
   *  Set frequency of an oscillator to a value. Or, pass in an object
   *  such as an oscillator to modulate the frequency with an audio signal.
   *
   *  @method  freq
   *  @param  {Number|Object} Frequency Frequency in Hz
   *                                        or modulating signal/oscillator
   *  @param  {Number} [rampTime] Ramp time (in seconds)
   *  @param  {Number} [timeFromNow] Schedule this event to happen
   *                                   at x seconds from now
   *  @return  {AudioParam} Frequency If no value is provided,
   *                                  returns the Web Audio API
   *                                  AudioParam that controls
   *                                  this oscillator's frequency
   *  @example
   *  <div><code>
   *  let osc = new p5.Oscillator(300);
   *  osc.start();
   *  osc.freq(40, 10);
   *  </code></div>
   */
  p5.Oscillator.prototype.freq = function (val, rampTime, tFromNow) {
    if (typeof val === 'number' && !isNaN(val)) {
      this.f = val;
      var now = p5sound.audiocontext.currentTime;
      var rampTime = rampTime || 0;
      var tFromNow = tFromNow || 0;
      var t = now + tFromNow + rampTime;
      // var currentFreq = this.oscillator.frequency.value;
      // this.oscillator.frequency.cancelScheduledValues(now);
      if (rampTime === 0) {
        this.oscillator.frequency.setValueAtTime(val, tFromNow + now);
      } else {
        if (val > 0) {
          this.oscillator.frequency.exponentialRampToValueAtTime(val, tFromNow + rampTime + now);
        } else {
          this.oscillator.frequency.linearRampToValueAtTime(val, tFromNow + rampTime + now);
        }
      }
      // reset phase if oscillator has a phase
      if (this.phaseAmount) {
        this.phase(this.phaseAmount);
      }
    } else if (val) {
      if (val.output) {
        val = val.output;
      }
      val.connect(this.oscillator.frequency);
      // keep track of what is modulating this param
      // so it can be re-connected if
      this._freqMods.push(val);
    } else {
      // return the Frequency Node
      return this.oscillator.frequency;
    }
  };
  p5.Oscillator.prototype.getFreq = function () {
    return this.oscillator.frequency.value;
  };
  /**
   *  Set type to 'sine', 'triangle', 'sawtooth' or 'square'.
   *
   *  @method  setType
   *  @param {String} type 'sine', 'triangle', 'sawtooth' or 'square'.
   */
  p5.Oscillator.prototype.setType = function (type) {
    this.oscillator.type = type;
  };
  p5.Oscillator.prototype.getType = function () {
    return this.oscillator.type;
  };
  /**
   *  Connect to a p5.sound / Web Audio object.
   *
   *  @method  connect
   *  @param  {Object} unit A p5.sound or Web Audio object
   */
  p5.Oscillator.prototype.connect = function (unit) {
    if (!unit) {
      this.panner.connect(p5sound.input);
    } else if (unit.hasOwnProperty('input')) {
      this.panner.connect(unit.input);
      this.connection = unit.input;
    } else {
      this.panner.connect(unit);
      this.connection = unit;
    }
  };
  /**
   *  Disconnect all outputs
   *
   *  @method  disconnect
   */
  p5.Oscillator.prototype.disconnect = function () {
    if (this.output) {
      this.output.disconnect();
    }
    if (this.panner) {
      this.panner.disconnect();
      if (this.output) {
        this.output.connect(this.panner);
      }
    }
    this.oscMods = [];
  };
  /**
   *  Pan between Left (-1) and Right (1)
   *
   *  @method  pan
   *  @param  {Number} panning Number between -1 and 1
   *  @param  {Number} timeFromNow schedule this event to happen
   *                                seconds from now
   */
  p5.Oscillator.prototype.pan = function (pval, tFromNow) {
    this.panPosition = pval;
    this.panner.pan(pval, tFromNow);
  };
  p5.Oscillator.prototype.getPan = function () {
    return this.panPosition;
  };
  // get rid of the oscillator
  p5.Oscillator.prototype.dispose = function () {
    // remove reference from soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);
    if (this.oscillator) {
      var now = p5sound.audiocontext.currentTime;
      this.stop(now);
      this.disconnect();
      this.panner = null;
      this.oscillator = null;
    }
    // if it is a Pulse
    if (this.osc2) {
      this.osc2.dispose();
    }
  };
  /**
   *  Set the phase of an oscillator between 0.0 and 1.0.
   *  In this implementation, phase is a delay time
   *  based on the oscillator's current frequency.
   *
   *  @method  phase
   *  @param  {Number} phase float between 0.0 and 1.0
   */
  p5.Oscillator.prototype.phase = function (p) {
    var delayAmt = p5.prototype.map(p, 0, 1, 0, 1 / this.f);
    var now = p5sound.audiocontext.currentTime;
    this.phaseAmount = p;
    if (!this.dNode) {
      // create a delay node
      this.dNode = p5sound.audiocontext.createDelay();
      // put the delay node in between output and panner
      this.oscillator.disconnect();
      this.oscillator.connect(this.dNode);
      this.dNode.connect(this.output);
    }
    // set delay time to match phase:
    this.dNode.delayTime.setValueAtTime(delayAmt, now);
  };
  // ========================== //
  // SIGNAL MATH FOR MODULATION //
  // ========================== //
  // return sigChain(this, scale, thisChain, nextChain, Scale);
  var sigChain = function (o, mathObj, thisChain, nextChain, type) {
    var chainSource = o.oscillator;
    // if this type of math already exists in the chain, replace it
    for (var i in o.mathOps) {
      if (o.mathOps[i] instanceof type) {
        chainSource.disconnect();
        o.mathOps[i].dispose();
        thisChain = i;
        // assume nextChain is output gain node unless...
        if (thisChain < o.mathOps.length - 2) {
          nextChain = o.mathOps[i + 1];
        }
      }
    }
    if (thisChain === o.mathOps.length - 1) {
      o.mathOps.push(nextChain);
    }
    // assume source is the oscillator unless i > 0
    if (i > 0) {
      chainSource = o.mathOps[i - 1];
    }
    chainSource.disconnect();
    chainSource.connect(mathObj);
    mathObj.connect(nextChain);
    o.mathOps[thisChain] = mathObj;
    return o;
  };
  /**
   *  Add a value to the p5.Oscillator's output amplitude,
   *  and return the oscillator. Calling this method again
   *  will override the initial add() with a new value.
   *
   *  @method  add
   *  @param {Number} number Constant number to add
   *  @return {p5.Oscillator} Oscillator Returns this oscillator
   *                                     with scaled output
   *
   */
  p5.Oscillator.prototype.add = function (num) {
    var add = new Add(num);
    var thisChain = this.mathOps.length - 1;
    var nextChain = this.output;
    return sigChain(this, add, thisChain, nextChain, Add);
  };
  /**
   *  Multiply the p5.Oscillator's output amplitude
   *  by a fixed value (i.e. turn it up!). Calling this method
   *  again will override the initial mult() with a new value.
   *
   *  @method  mult
   *  @param {Number} number Constant number to multiply
   *  @return {p5.Oscillator} Oscillator Returns this oscillator
   *                                     with multiplied output
   */
  p5.Oscillator.prototype.mult = function (num) {
    var mult = new Mult(num);
    var thisChain = this.mathOps.length - 1;
    var nextChain = this.output;
    return sigChain(this, mult, thisChain, nextChain, Mult);
  };
  /**
   *  Scale this oscillator's amplitude values to a given
   *  range, and return the oscillator. Calling this method
   *  again will override the initial scale() with new values.
   *
   *  @method  scale
   *  @param  {Number} inMin  input range minumum
   *  @param  {Number} inMax  input range maximum
   *  @param  {Number} outMin input range minumum
   *  @param  {Number} outMax input range maximum
   *  @return {p5.Oscillator} Oscillator Returns this oscillator
   *                                     with scaled output
   */
  p5.Oscillator.prototype.scale = function (inMin, inMax, outMin, outMax) {
    var mapOutMin, mapOutMax;
    if (arguments.length === 4) {
      mapOutMin = p5.prototype.map(outMin, inMin, inMax, 0, 1) - 0.5;
      mapOutMax = p5.prototype.map(outMax, inMin, inMax, 0, 1) - 0.5;
    } else {
      mapOutMin = arguments[0];
      mapOutMax = arguments[1];
    }
    var scale = new Scale(mapOutMin, mapOutMax);
    var thisChain = this.mathOps.length - 1;
    var nextChain = this.output;
    return sigChain(this, scale, thisChain, nextChain, Scale);
  };
  // ============================== //
  // SinOsc, TriOsc, SqrOsc, SawOsc //
  // ============================== //
  /**
   *  Constructor: <code>new p5.SinOsc()</code>.
   *  This creates a Sine Wave Oscillator and is
   *  equivalent to <code> new p5.Oscillator('sine')
   *  </code> or creating a p5.Oscillator and then calling
   *  its method <code>setType('sine')</code>.
   *  See p5.Oscillator for methods.
   *
   *  @class  p5.SinOsc
   *  @constructor
   *  @extends p5.Oscillator
   *  @param {Number} [freq] Set the frequency
   */
  p5.SinOsc = function (freq) {
    p5.Oscillator.call(this, freq, 'sine');
  };
  p5.SinOsc.prototype = Object.create(p5.Oscillator.prototype);
  /**
   *  Constructor: <code>new p5.TriOsc()</code>.
   *  This creates a Triangle Wave Oscillator and is
   *  equivalent to <code>new p5.Oscillator('triangle')
   *  </code> or creating a p5.Oscillator and then calling
   *  its method <code>setType('triangle')</code>.
   *  See p5.Oscillator for methods.
   *
   *  @class  p5.TriOsc
   *  @constructor
   *  @extends p5.Oscillator
   *  @param {Number} [freq] Set the frequency
   */
  p5.TriOsc = function (freq) {
    p5.Oscillator.call(this, freq, 'triangle');
  };
  p5.TriOsc.prototype = Object.create(p5.Oscillator.prototype);
  /**
   *  Constructor: <code>new p5.SawOsc()</code>.
   *  This creates a SawTooth Wave Oscillator and is
   *  equivalent to <code> new p5.Oscillator('sawtooth')
   *  </code> or creating a p5.Oscillator and then calling
   *  its method <code>setType('sawtooth')</code>.
   *  See p5.Oscillator for methods.
   *
   *  @class  p5.SawOsc
   *  @constructor
   *  @extends p5.Oscillator
   *  @param {Number} [freq] Set the frequency
   */
  p5.SawOsc = function (freq) {
    p5.Oscillator.call(this, freq, 'sawtooth');
  };
  p5.SawOsc.prototype = Object.create(p5.Oscillator.prototype);
  /**
   *  Constructor: <code>new p5.SqrOsc()</code>.
   *  This creates a Square Wave Oscillator and is
   *  equivalent to <code> new p5.Oscillator('square')
   *  </code> or creating a p5.Oscillator and then calling
   *  its method <code>setType('square')</code>.
   *  See p5.Oscillator for methods.
   *
   *  @class  p5.SqrOsc
   *  @constructor
   *  @extends p5.Oscillator
   *  @param {Number} [freq] Set the frequency
   */
  p5.SqrOsc = function (freq) {
    p5.Oscillator.call(this, freq, 'square');
  };
  p5.SqrOsc.prototype = Object.create(p5.Oscillator.prototype);
}(master, Tone_signal_Add, Tone_signal_Multiply, Tone_signal_Scale);
/** Tone.js module by Yotam Mann, MIT License 2016  http://opensource.org/licenses/MIT **/
var Tone_core_Timeline;
Tone_core_Timeline = function (Tone) {
  'use strict';
  Tone.Timeline = function () {
    var options = this.optionsObject(arguments, ['memory'], Tone.Timeline.defaults);
    this._timeline = [];
    this._toRemove = [];
    this._iterating = false;
    this.memory = options.memory;
  };
  Tone.extend(Tone.Timeline);
  Tone.Timeline.defaults = { 'memory': Infinity };
  Object.defineProperty(Tone.Timeline.prototype, 'length', {
    get: function () {
      return this._timeline.length;
    }
  });
  Tone.Timeline.prototype.add = function (event) {
    if (this.isUndef(event.time)) {
      throw new Error('Tone.Timeline: events must have a time attribute');
    }
    if (this._timeline.length) {
      var index = this._search(event.time);
      this._timeline.splice(index + 1, 0, event);
    } else {
      this._timeline.push(event);
    }
    if (this.length > this.memory) {
      var diff = this.length - this.memory;
      this._timeline.splice(0, diff);
    }
    return this;
  };
  Tone.Timeline.prototype.remove = function (event) {
    if (this._iterating) {
      this._toRemove.push(event);
    } else {
      var index = this._timeline.indexOf(event);
      if (index !== -1) {
        this._timeline.splice(index, 1);
      }
    }
    return this;
  };
  Tone.Timeline.prototype.get = function (time) {
    var index = this._search(time);
    if (index !== -1) {
      return this._timeline[index];
    } else {
      return null;
    }
  };
  Tone.Timeline.prototype.peek = function () {
    return this._timeline[0];
  };
  Tone.Timeline.prototype.shift = function () {
    return this._timeline.shift();
  };
  Tone.Timeline.prototype.getAfter = function (time) {
    var index = this._search(time);
    if (index + 1 < this._timeline.length) {
      return this._timeline[index + 1];
    } else {
      return null;
    }
  };
  Tone.Timeline.prototype.getBefore = function (time) {
    var len = this._timeline.length;
    if (len > 0 && this._timeline[len - 1].time < time) {
      return this._timeline[len - 1];
    }
    var index = this._search(time);
    if (index - 1 >= 0) {
      return this._timeline[index - 1];
    } else {
      return null;
    }
  };
  Tone.Timeline.prototype.cancel = function (after) {
    if (this._timeline.length > 1) {
      var index = this._search(after);
      if (index >= 0) {
        if (this._timeline[index].time === after) {
          for (var i = index; i >= 0; i--) {
            if (this._timeline[i].time === after) {
              index = i;
            } else {
              break;
            }
          }
          this._timeline = this._timeline.slice(0, index);
        } else {
          this._timeline = this._timeline.slice(0, index + 1);
        }
      } else {
        this._timeline = [];
      }
    } else if (this._timeline.length === 1) {
      if (this._timeline[0].time >= after) {
        this._timeline = [];
      }
    }
    return this;
  };
  Tone.Timeline.prototype.cancelBefore = function (time) {
    if (this._timeline.length) {
      var index = this._search(time);
      if (index >= 0) {
        this._timeline = this._timeline.slice(index + 1);
      }
    }
    return this;
  };
  Tone.Timeline.prototype._search = function (time) {
    var beginning = 0;
    var len = this._timeline.length;
    var end = len;
    if (len > 0 && this._timeline[len - 1].time <= time) {
      return len - 1;
    }
    while (beginning < end) {
      var midPoint = Math.floor(beginning + (end - beginning) / 2);
      var event = this._timeline[midPoint];
      var nextEvent = this._timeline[midPoint + 1];
      if (event.time === time) {
        for (var i = midPoint; i < this._timeline.length; i++) {
          var testEvent = this._timeline[i];
          if (testEvent.time === time) {
            midPoint = i;
          }
        }
        return midPoint;
      } else if (event.time < time && nextEvent.time > time) {
        return midPoint;
      } else if (event.time > time) {
        end = midPoint;
      } else if (event.time < time) {
        beginning = midPoint + 1;
      }
    }
    return -1;
  };
  Tone.Timeline.prototype._iterate = function (callback, lowerBound, upperBound) {
    this._iterating = true;
    lowerBound = this.defaultArg(lowerBound, 0);
    upperBound = this.defaultArg(upperBound, this._timeline.length - 1);
    for (var i = lowerBound; i <= upperBound; i++) {
      callback(this._timeline[i]);
    }
    this._iterating = false;
    if (this._toRemove.length > 0) {
      for (var j = 0; j < this._toRemove.length; j++) {
        var index = this._timeline.indexOf(this._toRemove[j]);
        if (index !== -1) {
          this._timeline.splice(index, 1);
        }
      }
      this._toRemove = [];
    }
  };
  Tone.Timeline.prototype.forEach = function (callback) {
    this._iterate(callback);
    return this;
  };
  Tone.Timeline.prototype.forEachBefore = function (time, callback) {
    var upperBound = this._search(time);
    if (upperBound !== -1) {
      this._iterate(callback, 0, upperBound);
    }
    return this;
  };
  Tone.Timeline.prototype.forEachAfter = function (time, callback) {
    var lowerBound = this._search(time);
    this._iterate(callback, lowerBound + 1);
    return this;
  };
  Tone.Timeline.prototype.forEachFrom = function (time, callback) {
    var lowerBound = this._search(time);
    while (lowerBound >= 0 && this._timeline[lowerBound].time >= time) {
      lowerBound--;
    }
    this._iterate(callback, lowerBound + 1);
    return this;
  };
  Tone.Timeline.prototype.forEachAtTime = function (time, callback) {
    var upperBound = this._search(time);
    if (upperBound !== -1) {
      this._iterate(function (event) {
        if (event.time === time) {
          callback(event);
        }
      }, 0, upperBound);
    }
    return this;
  };
  Tone.Timeline.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._timeline = null;
    this._toRemove = null;
  };
  return Tone.Timeline;
}(Tone_core_Tone);
/** Tone.js module by Yotam Mann, MIT License 2016  http://opensource.org/licenses/MIT **/
var Tone_signal_TimelineSignal;
Tone_signal_TimelineSignal = function (Tone) {
  'use strict';
  Tone.TimelineSignal = function () {
    var options = this.optionsObject(arguments, [
      'value',
      'units'
    ], Tone.Signal.defaults);
    this._events = new Tone.Timeline(10);
    Tone.Signal.apply(this, options);
    options.param = this._param;
    Tone.Param.call(this, options);
    this._initial = this._fromUnits(this._param.value);
  };
  Tone.extend(Tone.TimelineSignal, Tone.Param);
  Tone.TimelineSignal.Type = {
    Linear: 'linear',
    Exponential: 'exponential',
    Target: 'target',
    Curve: 'curve',
    Set: 'set'
  };
  Object.defineProperty(Tone.TimelineSignal.prototype, 'value', {
    get: function () {
      var now = this.now();
      var val = this.getValueAtTime(now);
      return this._toUnits(val);
    },
    set: function (value) {
      var convertedVal = this._fromUnits(value);
      this._initial = convertedVal;
      this.cancelScheduledValues();
      this._param.value = convertedVal;
    }
  });
  Tone.TimelineSignal.prototype.setValueAtTime = function (value, startTime) {
    value = this._fromUnits(value);
    startTime = this.toSeconds(startTime);
    this._events.add({
      'type': Tone.TimelineSignal.Type.Set,
      'value': value,
      'time': startTime
    });
    this._param.setValueAtTime(value, startTime);
    return this;
  };
  Tone.TimelineSignal.prototype.linearRampToValueAtTime = function (value, endTime) {
    value = this._fromUnits(value);
    endTime = this.toSeconds(endTime);
    this._events.add({
      'type': Tone.TimelineSignal.Type.Linear,
      'value': value,
      'time': endTime
    });
    this._param.linearRampToValueAtTime(value, endTime);
    return this;
  };
  Tone.TimelineSignal.prototype.exponentialRampToValueAtTime = function (value, endTime) {
    endTime = this.toSeconds(endTime);
    var beforeEvent = this._searchBefore(endTime);
    if (beforeEvent && beforeEvent.value === 0) {
      this.setValueAtTime(this._minOutput, beforeEvent.time);
    }
    value = this._fromUnits(value);
    var setValue = Math.max(value, this._minOutput);
    this._events.add({
      'type': Tone.TimelineSignal.Type.Exponential,
      'value': setValue,
      'time': endTime
    });
    if (value < this._minOutput) {
      this._param.exponentialRampToValueAtTime(this._minOutput, endTime - this.sampleTime);
      this.setValueAtTime(0, endTime);
    } else {
      this._param.exponentialRampToValueAtTime(value, endTime);
    }
    return this;
  };
  Tone.TimelineSignal.prototype.setTargetAtTime = function (value, startTime, timeConstant) {
    value = this._fromUnits(value);
    value = Math.max(this._minOutput, value);
    timeConstant = Math.max(this._minOutput, timeConstant);
    startTime = this.toSeconds(startTime);
    this._events.add({
      'type': Tone.TimelineSignal.Type.Target,
      'value': value,
      'time': startTime,
      'constant': timeConstant
    });
    this._param.setTargetAtTime(value, startTime, timeConstant);
    return this;
  };
  Tone.TimelineSignal.prototype.setValueCurveAtTime = function (values, startTime, duration, scaling) {
    scaling = this.defaultArg(scaling, 1);
    var floats = new Array(values.length);
    for (var i = 0; i < floats.length; i++) {
      floats[i] = this._fromUnits(values[i]) * scaling;
    }
    startTime = this.toSeconds(startTime);
    duration = this.toSeconds(duration);
    this._events.add({
      'type': Tone.TimelineSignal.Type.Curve,
      'value': floats,
      'time': startTime,
      'duration': duration
    });
    this._param.setValueAtTime(floats[0], startTime);
    for (var j = 1; j < floats.length; j++) {
      var segmentTime = startTime + j / (floats.length - 1) * duration;
      this._param.linearRampToValueAtTime(floats[j], segmentTime);
    }
    return this;
  };
  Tone.TimelineSignal.prototype.cancelScheduledValues = function (after) {
    after = this.toSeconds(after);
    this._events.cancel(after);
    this._param.cancelScheduledValues(after);
    return this;
  };
  Tone.TimelineSignal.prototype.setRampPoint = function (time) {
    time = this.toSeconds(time);
    var val = this._toUnits(this.getValueAtTime(time));
    var before = this._searchBefore(time);
    if (before && before.time === time) {
      this.cancelScheduledValues(time + this.sampleTime);
    } else if (before && before.type === Tone.TimelineSignal.Type.Curve && before.time + before.duration > time) {
      this.cancelScheduledValues(time);
      this.linearRampToValueAtTime(val, time);
    } else {
      var after = this._searchAfter(time);
      if (after) {
        this.cancelScheduledValues(time);
        if (after.type === Tone.TimelineSignal.Type.Linear) {
          this.linearRampToValueAtTime(val, time);
        } else if (after.type === Tone.TimelineSignal.Type.Exponential) {
          this.exponentialRampToValueAtTime(val, time);
        }
      }
      this.setValueAtTime(val, time);
    }
    return this;
  };
  Tone.TimelineSignal.prototype.linearRampToValueBetween = function (value, start, finish) {
    this.setRampPoint(start);
    this.linearRampToValueAtTime(value, finish);
    return this;
  };
  Tone.TimelineSignal.prototype.exponentialRampToValueBetween = function (value, start, finish) {
    this.setRampPoint(start);
    this.exponentialRampToValueAtTime(value, finish);
    return this;
  };
  Tone.TimelineSignal.prototype._searchBefore = function (time) {
    return this._events.get(time);
  };
  Tone.TimelineSignal.prototype._searchAfter = function (time) {
    return this._events.getAfter(time);
  };
  Tone.TimelineSignal.prototype.getValueAtTime = function (time) {
    time = this.toSeconds(time);
    var after = this._searchAfter(time);
    var before = this._searchBefore(time);
    var value = this._initial;
    if (before === null) {
      value = this._initial;
    } else if (before.type === Tone.TimelineSignal.Type.Target) {
      var previous = this._events.getBefore(before.time);
      var previouVal;
      if (previous === null) {
        previouVal = this._initial;
      } else {
        previouVal = previous.value;
      }
      value = this._exponentialApproach(before.time, previouVal, before.value, before.constant, time);
    } else if (before.type === Tone.TimelineSignal.Type.Curve) {
      value = this._curveInterpolate(before.time, before.value, before.duration, time);
    } else if (after === null) {
      value = before.value;
    } else if (after.type === Tone.TimelineSignal.Type.Linear) {
      value = this._linearInterpolate(before.time, before.value, after.time, after.value, time);
    } else if (after.type === Tone.TimelineSignal.Type.Exponential) {
      value = this._exponentialInterpolate(before.time, before.value, after.time, after.value, time);
    } else {
      value = before.value;
    }
    return value;
  };
  Tone.TimelineSignal.prototype.connect = Tone.SignalBase.prototype.connect;
  Tone.TimelineSignal.prototype._exponentialApproach = function (t0, v0, v1, timeConstant, t) {
    return v1 + (v0 - v1) * Math.exp(-(t - t0) / timeConstant);
  };
  Tone.TimelineSignal.prototype._linearInterpolate = function (t0, v0, t1, v1, t) {
    return v0 + (v1 - v0) * ((t - t0) / (t1 - t0));
  };
  Tone.TimelineSignal.prototype._exponentialInterpolate = function (t0, v0, t1, v1, t) {
    v0 = Math.max(this._minOutput, v0);
    return v0 * Math.pow(v1 / v0, (t - t0) / (t1 - t0));
  };
  Tone.TimelineSignal.prototype._curveInterpolate = function (start, curve, duration, time) {
    var len = curve.length;
    if (time >= start + duration) {
      return curve[len - 1];
    } else if (time <= start) {
      return curve[0];
    } else {
      var progress = (time - start) / duration;
      var lowerIndex = Math.floor((len - 1) * progress);
      var upperIndex = Math.ceil((len - 1) * progress);
      var lowerVal = curve[lowerIndex];
      var upperVal = curve[upperIndex];
      if (upperIndex === lowerIndex) {
        return lowerVal;
      } else {
        return this._linearInterpolate(lowerIndex, lowerVal, upperIndex, upperVal, progress * (len - 1));
      }
    }
  };
  Tone.TimelineSignal.prototype.dispose = function () {
    Tone.Signal.prototype.dispose.call(this);
    Tone.Param.prototype.dispose.call(this);
    this._events.dispose();
    this._events = null;
  };
  return Tone.TimelineSignal;
}(Tone_core_Tone, Tone_signal_Signal);
var envelope;
'use strict';
envelope = function () {
  var p5sound = master;
  var Add = Tone_signal_Add;
  var Mult = Tone_signal_Multiply;
  var Scale = Tone_signal_Scale;
  var TimelineSignal = Tone_signal_TimelineSignal;
  /**
   *  <p>Envelopes are pre-defined amplitude distribution over time.
   *  Typically, envelopes are used to control the output volume
   *  of an object, a series of fades referred to as Attack, Decay,
   *  Sustain and Release (
   *  <a href="https://upload.wikimedia.org/wikipedia/commons/e/ea/ADSR_parameter.svg">ADSR</a>
   *  ). Envelopes can also control other Web Audio Parameters—for example, a p5.Envelope can
   *  control an Oscillator's frequency like this: <code>osc.freq(env)</code>.</p>
   *  <p>Use <code><a href="#/p5.Envelope/setRange">setRange</a></code> to change the attack/release level.
   *  Use <code><a href="#/p5.Envelope/setADSR">setADSR</a></code> to change attackTime, decayTime, sustainPercent and releaseTime.</p>
   *  <p>Use the <code><a href="#/p5.Envelope/play">play</a></code> method to play the entire envelope,
   *  the <code><a href="#/p5.Envelope/ramp">ramp</a></code> method for a pingable trigger,
   *  or <code><a href="#/p5.Envelope/triggerAttack">triggerAttack</a></code>/
   *  <code><a href="#/p5.Envelope/triggerRelease">triggerRelease</a></code> to trigger noteOn/noteOff.</p>
   *
   *  @class p5.Envelope
   *  @constructor
   *  @example
   *  <div><code>
   *  let attackLevel = 1.0;
   *  let releaseLevel = 0;
   *
   *  let attackTime = 0.001;
   *  let decayTime = 0.2;
   *  let susPercent = 0.2;
   *  let releaseTime = 0.5;
   *
   *  let env, triOsc;
   *
   *  function setup() {
   *    let cnv = createCanvas(100, 100);
   *
   *    textAlign(CENTER);
   *    text('click to play', width/2, height/2);
   *
   *    env = new p5.Envelope();
   *    env.setADSR(attackTime, decayTime, susPercent, releaseTime);
   *    env.setRange(attackLevel, releaseLevel);
   *
   *    triOsc = new p5.Oscillator('triangle');
   *    triOsc.amp(env);
   *    triOsc.start();
   *    triOsc.freq(220);
   *
   *    cnv.mousePressed(playEnv);
   *  }
   *
   *  function playEnv()  {
   *    env.play();
   *  }
   *  </code></div>
   */
  p5.Envelope = function (t1, l1, t2, l2, t3, l3) {
    /**
     * Time until envelope reaches attackLevel
     * @property attackTime
     */
    this.aTime = t1 || 0.1;
    /**
     * Level once attack is complete.
     * @property attackLevel
     */
    this.aLevel = l1 || 1;
    /**
     * Time until envelope reaches decayLevel.
     * @property decayTime
     */
    this.dTime = t2 || 0.5;
    /**
     * Level after decay. The envelope will sustain here until it is released.
     * @property decayLevel
     */
    this.dLevel = l2 || 0;
    /**
     * Duration of the release portion of the envelope.
     * @property releaseTime
     */
    this.rTime = t3 || 0;
    /**
     * Level at the end of the release.
     * @property releaseLevel
     */
    this.rLevel = l3 || 0;
    this._rampHighPercentage = 0.98;
    this._rampLowPercentage = 0.02;
    this.output = p5sound.audiocontext.createGain();
    this.control = new TimelineSignal();
    this._init();
    // this makes sure the envelope starts at zero
    this.control.connect(this.output);
    // connect to the output
    this.connection = null;
    // store connection
    //array of math operation signal chaining
    this.mathOps = [this.control];
    //whether envelope should be linear or exponential curve
    this.isExponential = false;
    // oscillator or buffer source to clear on env complete
    // to save resources if/when it is retriggered
    this.sourceToClear = null;
    // set to true if attack is set, then false on release
    this.wasTriggered = false;
    // add to the soundArray so we can dispose of the env later
    p5sound.soundArray.push(this);
  };
  // this init function just smooths the starting value to zero and gives a start point for the timeline
  // - it was necessary to remove glitches at the beginning.
  p5.Envelope.prototype._init = function () {
    var now = p5sound.audiocontext.currentTime;
    var t = now;
    this.control.setTargetAtTime(0.00001, t, 0.001);
    //also, compute the correct time constants
    this._setRampAD(this.aTime, this.dTime);
  };
  /**
   *  Reset the envelope with a series of time/value pairs.
   *
   *  @method  set
   *  @param {Number} attackTime     Time (in seconds) before level
   *                                 reaches attackLevel
   *  @param {Number} attackLevel    Typically an amplitude between
   *                                 0.0 and 1.0
   *  @param {Number} decayTime      Time
   *  @param {Number} decayLevel   Amplitude (In a standard ADSR envelope,
   *                                 decayLevel = sustainLevel)
   *  @param {Number} releaseTime   Release Time (in seconds)
   *  @param {Number} releaseLevel  Amplitude
   *  @example
   *  <div><code>
   *  let t1 = 0.1; // attack time in seconds
   *  let l1 = 0.7; // attack level 0.0 to 1.0
   *  let t2 = 0.3; // decay time in seconds
   *  let l2 = 0.1; // decay level  0.0 to 1.0
   *  let t3 = 0.2; // sustain time in seconds
   *  let l3 = 0.5; // sustain level  0.0 to 1.0
   *  // release level defaults to zero
   *
   *  let env;
   *  let triOsc;
   *
   *  function setup() {
   *    background(0);
   *    noStroke();
   *    fill(255);
   *    textAlign(CENTER);
   *    text('click to play', width/2, height/2);
   *
   *    env = new p5.Envelope(t1, l1, t2, l2, t3, l3);
   *    triOsc = new p5.Oscillator('triangle');
   *    triOsc.amp(env); // give the env control of the triOsc's amp
   *    triOsc.start();
   *  }
   *
   *  // mouseClick triggers envelope if over canvas
   *  function mouseClicked() {
   *    // is mouse over canvas?
   *    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
   *      env.play(triOsc);
   *    }
   *  }
   *  </code></div>
   *
   */
  p5.Envelope.prototype.set = function (t1, l1, t2, l2, t3, l3) {
    this.aTime = t1;
    this.aLevel = l1;
    this.dTime = t2 || 0;
    this.dLevel = l2 || 0;
    this.rTime = t3 || 0;
    this.rLevel = l3 || 0;
    // set time constants for ramp
    this._setRampAD(t1, t2);
  };
  /**
   *  Set values like a traditional
   *  <a href="https://en.wikipedia.org/wiki/Synthesizer#/media/File:ADSR_parameter.svg">
   *  ADSR envelope
   *  </a>.
   *
   *  @method  setADSR
   *  @param {Number} attackTime    Time (in seconds before envelope
   *                                reaches Attack Level
   *  @param {Number} [decayTime]    Time (in seconds) before envelope
   *                                reaches Decay/Sustain Level
   *  @param {Number} [susRatio]    Ratio between attackLevel and releaseLevel, on a scale from 0 to 1,
   *                                where 1.0 = attackLevel, 0.0 = releaseLevel.
   *                                The susRatio determines the decayLevel and the level at which the
   *                                sustain portion of the envelope will sustain.
   *                                For example, if attackLevel is 0.4, releaseLevel is 0,
   *                                and susAmt is 0.5, the decayLevel would be 0.2. If attackLevel is
   *                                increased to 1.0 (using <code>setRange</code>),
   *                                then decayLevel would increase proportionally, to become 0.5.
   *  @param {Number} [releaseTime]   Time in seconds from now (defaults to 0)
   *  @example
   *  <div><code>
   *  let attackLevel = 1.0;
   *  let releaseLevel = 0;
   *
   *  let attackTime = 0.001;
   *  let decayTime = 0.2;
   *  let susPercent = 0.2;
   *  let releaseTime = 0.5;
   *
   *  let env, triOsc;
   *
   *  function setup() {
   *    let cnv = createCanvas(100, 100);
   *
   *    textAlign(CENTER);
   *    text('click to play', width/2, height/2);
   *
   *    env = new p5.Envelope();
   *    env.setADSR(attackTime, decayTime, susPercent, releaseTime);
   *    env.setRange(attackLevel, releaseLevel);
   *
   *    triOsc = new p5.Oscillator('triangle');
   *    triOsc.amp(env);
   *    triOsc.start();
   *    triOsc.freq(220);
   *
   *    cnv.mousePressed(playEnv);
   *  }
   *
   *  function playEnv()  {
   *    env.play();
   *  }
   *  </code></div>
   */
  p5.Envelope.prototype.setADSR = function (aTime, dTime, sPercent, rTime) {
    this.aTime = aTime;
    this.dTime = dTime || 0;
    // lerp
    this.sPercent = sPercent || 0;
    this.dLevel = typeof sPercent !== 'undefined' ? sPercent * (this.aLevel - this.rLevel) + this.rLevel : 0;
    this.rTime = rTime || 0;
    // also set time constants for ramp
    this._setRampAD(aTime, dTime);
  };
  /**
   *  Set max (attackLevel) and min (releaseLevel) of envelope.
   *
   *  @method  setRange
   *  @param {Number} aLevel attack level (defaults to 1)
   *  @param {Number} rLevel release level (defaults to 0)
   *  @example
   *  <div><code>
   *  let attackLevel = 1.0;
   *  let releaseLevel = 0;
   *
   *  let attackTime = 0.001;
   *  let decayTime = 0.2;
   *  let susPercent = 0.2;
   *  let releaseTime = 0.5;
   *
   *  let env, triOsc;
   *
   *  function setup() {
   *    let cnv = createCanvas(100, 100);
   *
   *    textAlign(CENTER);
   *    text('click to play', width/2, height/2);
   *
   *    env = new p5.Envelope();
   *    env.setADSR(attackTime, decayTime, susPercent, releaseTime);
   *    env.setRange(attackLevel, releaseLevel);
   *
   *    triOsc = new p5.Oscillator('triangle');
   *    triOsc.amp(env);
   *    triOsc.start();
   *    triOsc.freq(220);
   *
   *    cnv.mousePressed(playEnv);
   *  }
   *
   *  function playEnv()  {
   *    env.play();
   *  }
   *  </code></div>
   */
  p5.Envelope.prototype.setRange = function (aLevel, rLevel) {
    this.aLevel = aLevel || 1;
    this.rLevel = rLevel || 0;
  };
  //  private (undocumented) method called when ADSR is set to set time constants for ramp
  //
  //  Set the <a href="https://en.wikipedia.org/wiki/RC_time_constant">
  //  time constants</a> for simple exponential ramps.
  //  The larger the time constant value, the slower the
  //  transition will be.
  //
  //  method  _setRampAD
  //  param {Number} attackTimeConstant  attack time constant
  //  param {Number} decayTimeConstant   decay time constant
  //
  p5.Envelope.prototype._setRampAD = function (t1, t2) {
    this._rampAttackTime = this.checkExpInput(t1);
    this._rampDecayTime = this.checkExpInput(t2);
    var TCDenominator = 1;
    /// Aatish Bhatia's calculation for time constant for rise(to adjust 1/1-e calculation to any percentage)
    TCDenominator = Math.log(1 / this.checkExpInput(1 - this._rampHighPercentage));
    this._rampAttackTC = t1 / this.checkExpInput(TCDenominator);
    TCDenominator = Math.log(1 / this._rampLowPercentage);
    this._rampDecayTC = t2 / this.checkExpInput(TCDenominator);
  };
  // private method
  p5.Envelope.prototype.setRampPercentages = function (p1, p2) {
    //set the percentages that the simple exponential ramps go to
    this._rampHighPercentage = this.checkExpInput(p1);
    this._rampLowPercentage = this.checkExpInput(p2);
    var TCDenominator = 1;
    //now re-compute the time constants based on those percentages
    /// Aatish Bhatia's calculation for time constant for rise(to adjust 1/1-e calculation to any percentage)
    TCDenominator = Math.log(1 / this.checkExpInput(1 - this._rampHighPercentage));
    this._rampAttackTC = this._rampAttackTime / this.checkExpInput(TCDenominator);
    TCDenominator = Math.log(1 / this._rampLowPercentage);
    this._rampDecayTC = this._rampDecayTime / this.checkExpInput(TCDenominator);
  };
  /**
   *  Assign a parameter to be controlled by this envelope.
   *  If a p5.Sound object is given, then the p5.Envelope will control its
   *  output gain. If multiple inputs are provided, the env will
   *  control all of them.
   *
   *  @method  setInput
   *  @param  {Object} [...inputs]         A p5.sound object or
   *                                Web Audio Param.
   */
  p5.Envelope.prototype.setInput = function () {
    for (var i = 0; i < arguments.length; i++) {
      this.connect(arguments[i]);
    }
  };
  /**
   *  Set whether the envelope ramp is linear (default) or exponential.
   *  Exponential ramps can be useful because we perceive amplitude
   *  and frequency logarithmically.
   *
   *  @method  setExp
   *  @param {Boolean} isExp true is exponential, false is linear
   */
  p5.Envelope.prototype.setExp = function (isExp) {
    this.isExponential = isExp;
  };
  //helper method to protect against zero values being sent to exponential functions
  p5.Envelope.prototype.checkExpInput = function (value) {
    if (value <= 0) {
      value = 1e-8;
    }
    return value;
  };
  /**
   *  Play tells the envelope to start acting on a given input.
   *  If the input is a p5.sound object (i.e. AudioIn, Oscillator,
   *  SoundFile), then Envelope will control its output volume.
   *  Envelopes can also be used to control any <a href="
   *  http://docs.webplatform.org/wiki/apis/webaudio/AudioParam">
   *  Web Audio Audio Param.</a>
   *
   *  @method  play
   *  @param  {Object} unit         A p5.sound object or
   *                                Web Audio Param.
   *  @param  {Number} [startTime]  time from now (in seconds) at which to play
   *  @param  {Number} [sustainTime] time to sustain before releasing the envelope
   *  @example
   *  <div><code>
   *  let attackLevel = 1.0;
   *  let releaseLevel = 0;
   *
   *  let attackTime = 0.001;
   *  let decayTime = 0.2;
   *  let susPercent = 0.2;
   *  let releaseTime = 0.5;
   *
   *  let env, triOsc;
   *
   *  function setup() {
   *    let cnv = createCanvas(100, 100);
   *
   *    textAlign(CENTER);
   *    text('click to play', width/2, height/2);
   *
   *    env = new p5.Envelope();
   *    env.setADSR(attackTime, decayTime, susPercent, releaseTime);
   *    env.setRange(attackLevel, releaseLevel);
   *
   *    triOsc = new p5.Oscillator('triangle');
   *    triOsc.amp(env);
   *    triOsc.start();
   *    triOsc.freq(220);
   *
   *    cnv.mousePressed(playEnv);
   *  }
   *
   *  function playEnv()  {
   *    // trigger env on triOsc, 0 seconds from now
   *    // After decay, sustain for 0.2 seconds before release
   *    env.play(triOsc, 0, 0.2);
   *  }
   *  </code></div>
   */
  p5.Envelope.prototype.play = function (unit, secondsFromNow, susTime) {
    var tFromNow = secondsFromNow || 0;
    var susTime = susTime || 0;
    if (unit) {
      if (this.connection !== unit) {
        this.connect(unit);
      }
    }
    this.triggerAttack(unit, tFromNow);
    this.triggerRelease(unit, tFromNow + this.aTime + this.dTime + susTime);
  };
  /**
   *  Trigger the Attack, and Decay portion of the Envelope.
   *  Similar to holding down a key on a piano, but it will
   *  hold the sustain level until you let go. Input can be
   *  any p5.sound object, or a <a href="
   *  http://docs.webplatform.org/wiki/apis/webaudio/AudioParam">
   *  Web Audio Param</a>.
   *
   *  @method  triggerAttack
   *  @param  {Object} unit p5.sound Object or Web Audio Param
   *  @param  {Number} secondsFromNow time from now (in seconds)
   *  @example
   *  <div><code>
   *
   *  let attackLevel = 1.0;
   *  let releaseLevel = 0;
   *
   *  let attackTime = 0.001;
   *  let decayTime = 0.3;
   *  let susPercent = 0.4;
   *  let releaseTime = 0.5;
   *
   *  let env, triOsc;
   *
   *  function setup() {
   *    let cnv = createCanvas(100, 100);
   *    background(200);
   *    textAlign(CENTER);
   *    text('click to play', width/2, height/2);
   *
   *    env = new p5.Envelope();
   *    env.setADSR(attackTime, decayTime, susPercent, releaseTime);
   *    env.setRange(attackLevel, releaseLevel);
   *
   *    triOsc = new p5.Oscillator('triangle');
   *    triOsc.amp(env);
   *    triOsc.start();
   *    triOsc.freq(220);
   *
   *    cnv.mousePressed(envAttack);
   *  }
   *
   *  function envAttack()  {
   *    console.log('trigger attack');
   *    env.triggerAttack();
   *
   *    background(0,255,0);
   *    text('attack!', width/2, height/2);
   *  }
   *
   *  function mouseReleased() {
   *    env.triggerRelease();
   *
   *    background(200);
   *    text('click to play', width/2, height/2);
   *  }
   *  </code></div>
   */
  p5.Envelope.prototype.triggerAttack = function (unit, secondsFromNow) {
    var now = p5sound.audiocontext.currentTime;
    var tFromNow = secondsFromNow || 0;
    var t = now + tFromNow;
    this.lastAttack = t;
    this.wasTriggered = true;
    if (unit) {
      if (this.connection !== unit) {
        this.connect(unit);
      }
    }
    // get and set value (with linear ramp) to anchor automation
    var valToSet = this.control.getValueAtTime(t);
    if (this.isExponential === true) {
      this.control.exponentialRampToValueAtTime(this.checkExpInput(valToSet), t);
    } else {
      this.control.linearRampToValueAtTime(valToSet, t);
    }
    // after each ramp completes, cancel scheduled values
    // (so they can be overridden in case env has been re-triggered)
    // then, set current value (with linearRamp to avoid click)
    // then, schedule the next automation...
    // attack
    t += this.aTime;
    if (this.isExponential === true) {
      this.control.exponentialRampToValueAtTime(this.checkExpInput(this.aLevel), t);
      valToSet = this.checkExpInput(this.control.getValueAtTime(t));
      this.control.cancelScheduledValues(t);
      this.control.exponentialRampToValueAtTime(valToSet, t);
    } else {
      this.control.linearRampToValueAtTime(this.aLevel, t);
      valToSet = this.control.getValueAtTime(t);
      this.control.cancelScheduledValues(t);
      this.control.linearRampToValueAtTime(valToSet, t);
    }
    // decay to decay level (if using ADSR, then decay level == sustain level)
    t += this.dTime;
    if (this.isExponential === true) {
      this.control.exponentialRampToValueAtTime(this.checkExpInput(this.dLevel), t);
      valToSet = this.checkExpInput(this.control.getValueAtTime(t));
      this.control.cancelScheduledValues(t);
      this.control.exponentialRampToValueAtTime(valToSet, t);
    } else {
      this.control.linearRampToValueAtTime(this.dLevel, t);
      valToSet = this.control.getValueAtTime(t);
      this.control.cancelScheduledValues(t);
      this.control.linearRampToValueAtTime(valToSet, t);
    }
  };
  /**
   *  Trigger the Release of the Envelope. This is similar to releasing
   *  the key on a piano and letting the sound fade according to the
   *  release level and release time.
   *
   *  @method  triggerRelease
   *  @param  {Object} unit p5.sound Object or Web Audio Param
   *  @param  {Number} secondsFromNow time to trigger the release
   *  @example
   *  <div><code>
   *
   *  let attackLevel = 1.0;
   *  let releaseLevel = 0;
   *
   *  let attackTime = 0.001;
   *  let decayTime = 0.3;
   *  let susPercent = 0.4;
   *  let releaseTime = 0.5;
   *
   *  let env, triOsc;
   *
   *  function setup() {
   *    let cnv = createCanvas(100, 100);
   *    background(200);
   *    textAlign(CENTER);
   *    text('click to play', width/2, height/2);
   *
   *    env = new p5.Envelope();
   *    env.setADSR(attackTime, decayTime, susPercent, releaseTime);
   *    env.setRange(attackLevel, releaseLevel);
   *
   *    triOsc = new p5.Oscillator('triangle');
   *    triOsc.amp(env);
   *    triOsc.start();
   *    triOsc.freq(220);
   *
   *    cnv.mousePressed(envAttack);
   *  }
   *
   *  function envAttack()  {
   *    console.log('trigger attack');
   *    env.triggerAttack();
   *
   *    background(0,255,0);
   *    text('attack!', width/2, height/2);
   *  }
   *
   *  function mouseReleased() {
   *    env.triggerRelease();
   *
   *    background(200);
   *    text('click to play', width/2, height/2);
   *  }
   *  </code></div>
   */
  p5.Envelope.prototype.triggerRelease = function (unit, secondsFromNow) {
    // only trigger a release if an attack was triggered
    if (!this.wasTriggered) {
      // this currently causes a bit of trouble:
      // if a later release has been scheduled (via the play function)
      // a new earlier release won't interrupt it, because
      // this.wasTriggered has already been set to false.
      // If we want new earlier releases to override, then we need to
      // keep track of the last release time, and if the new release time is
      // earlier, then use it.
      return;
    }
    let now = p5sound.audiocontext.currentTime;
    var tFromNow = secondsFromNow || 0;
    var t = now + tFromNow;
    if (unit) {
      if (this.connection !== unit) {
        this.connect(unit);
      }
    }
    // get and set value (with linear or exponential ramp) to anchor automation
    var valToSet = this.control.getValueAtTime(t);
    if (this.isExponential === true) {
      this.control.exponentialRampToValueAtTime(this.checkExpInput(valToSet), t);
    } else {
      this.control.linearRampToValueAtTime(valToSet, t);
    }
    // release
    t += this.rTime;
    if (this.isExponential === true) {
      this.control.exponentialRampToValueAtTime(this.checkExpInput(this.rLevel), t);
      valToSet = this.checkExpInput(this.control.getValueAtTime(t));
      this.control.cancelScheduledValues(t);
      this.control.exponentialRampToValueAtTime(valToSet, t);
    } else {
      this.control.linearRampToValueAtTime(this.rLevel, t);
      valToSet = this.control.getValueAtTime(t);
      this.control.cancelScheduledValues(t);
      this.control.linearRampToValueAtTime(valToSet, t);
    }
    this.wasTriggered = false;
  };
  /**
   *  Exponentially ramp to a value using the first two
   *  values from <code><a href="#/p5.Envelope/setADSR">setADSR(attackTime, decayTime)</a></code>
   *  as <a href="https://en.wikipedia.org/wiki/RC_time_constant">
   *  time constants</a> for simple exponential ramps.
   *  If the value is higher than current value, it uses attackTime,
   *  while a decrease uses decayTime.
   *
   *  @method  ramp
   *  @param  {Object} unit           p5.sound Object or Web Audio Param
   *  @param  {Number} secondsFromNow When to trigger the ramp
   *  @param  {Number} v              Target value
   *  @param  {Number} [v2]           Second target value (optional)
   *  @example
   *  <div><code>
   *  let env, osc, amp, cnv;
   *
   *  let attackTime = 0.001;
   *  let decayTime = 0.2;
   *  let attackLevel = 1;
   *  let decayLevel = 0;
   *
   *  function setup() {
   *    cnv = createCanvas(100, 100);
   *    fill(0,255,0);
   *    noStroke();
   *
   *    env = new p5.Envelope();
   *    env.setADSR(attackTime, decayTime);
   *
   *    osc = new p5.Oscillator();
   *    osc.amp(env);
   *    osc.start();
   *
   *    amp = new p5.Amplitude();
   *
   *    cnv.mousePressed(triggerRamp);
   *  }
   *
   *  function triggerRamp() {
   *    env.ramp(osc, 0, attackLevel, decayLevel);
   *  }
   *
   *  function draw() {
   *    background(20,20,20);
   *    text('click me', 10, 20);
   *    let h = map(amp.getLevel(), 0, 0.4, 0, height);;
   *
   *    rect(0, height, width, -h);
   *  }
   *  </code></div>
   */
  p5.Envelope.prototype.ramp = function (unit, secondsFromNow, v1, v2) {
    var now = p5sound.audiocontext.currentTime;
    var tFromNow = secondsFromNow || 0;
    var t = now + tFromNow;
    var destination1 = this.checkExpInput(v1);
    var destination2 = typeof v2 !== 'undefined' ? this.checkExpInput(v2) : undefined;
    // connect env to unit if not already connected
    if (unit) {
      if (this.connection !== unit) {
        this.connect(unit);
      }
    }
    //get current value
    var currentVal = this.checkExpInput(this.control.getValueAtTime(t));
    // this.control.cancelScheduledValues(t);
    //if it's going up
    if (destination1 > currentVal) {
      this.control.setTargetAtTime(destination1, t, this._rampAttackTC);
      t += this._rampAttackTime;
    } else if (destination1 < currentVal) {
      this.control.setTargetAtTime(destination1, t, this._rampDecayTC);
      t += this._rampDecayTime;
    }
    // Now the second part of envelope begins
    if (destination2 === undefined)
      return;
    //if it's going up
    if (destination2 > destination1) {
      this.control.setTargetAtTime(destination2, t, this._rampAttackTC);
    } else if (destination2 < destination1) {
      this.control.setTargetAtTime(destination2, t, this._rampDecayTC);
    }
  };
  p5.Envelope.prototype.connect = function (unit) {
    this.connection = unit;
    // assume we're talking about output gain
    // unless given a different audio param
    if (unit instanceof p5.Oscillator || unit instanceof p5.SoundFile || unit instanceof p5.AudioIn || unit instanceof p5.Reverb || unit instanceof p5.Noise || unit instanceof p5.Filter || unit instanceof p5.Delay) {
      unit = unit.output.gain;
    }
    if (unit instanceof AudioParam) {
      //set the initial value
      unit.setValueAtTime(0, p5sound.audiocontext.currentTime);
    }
    if (unit instanceof p5.Signal) {
      unit.setValue(0);
    }
    this.output.connect(unit);
  };
  p5.Envelope.prototype.disconnect = function () {
    if (this.output) {
      this.output.disconnect();
    }
  };
  // Signal Math
  /**
   *  Add a value to the p5.Oscillator's output amplitude,
   *  and return the oscillator. Calling this method
   *  again will override the initial add() with new values.
   *
   *  @method  add
   *  @param {Number} number Constant number to add
   *  @return {p5.Envelope} Envelope Returns this envelope
   *                                     with scaled output
   */
  p5.Envelope.prototype.add = function (num) {
    var add = new Add(num);
    var thisChain = this.mathOps.length;
    var nextChain = this.output;
    return p5.prototype._mathChain(this, add, thisChain, nextChain, Add);
  };
  /**
   *  Multiply the p5.Envelope's output amplitude
   *  by a fixed value. Calling this method
   *  again will override the initial mult() with new values.
   *
   *  @method  mult
   *  @param {Number} number Constant number to multiply
   *  @return {p5.Envelope} Envelope Returns this envelope
   *                                     with scaled output
   */
  p5.Envelope.prototype.mult = function (num) {
    var mult = new Mult(num);
    var thisChain = this.mathOps.length;
    var nextChain = this.output;
    return p5.prototype._mathChain(this, mult, thisChain, nextChain, Mult);
  };
  /**
   *  Scale this envelope's amplitude values to a given
   *  range, and return the envelope. Calling this method
   *  again will override the initial scale() with new values.
   *
   *  @method  scale
   *  @param  {Number} inMin  input range minumum
   *  @param  {Number} inMax  input range maximum
   *  @param  {Number} outMin input range minumum
   *  @param  {Number} outMax input range maximum
   *  @return {p5.Envelope} Envelope Returns this envelope
   *                                     with scaled output
   */
  p5.Envelope.prototype.scale = function (inMin, inMax, outMin, outMax) {
    var scale = new Scale(inMin, inMax, outMin, outMax);
    var thisChain = this.mathOps.length;
    var nextChain = this.output;
    return p5.prototype._mathChain(this, scale, thisChain, nextChain, Scale);
  };
  // get rid of the oscillator
  p5.Envelope.prototype.dispose = function () {
    // remove reference from soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);
    this.disconnect();
    if (this.control) {
      this.control.dispose();
      this.control = null;
    }
    for (var i = 1; i < this.mathOps.length; i++) {
      this.mathOps[i].dispose();
    }
  };
  // Different name for backwards compatibility, replicates p5.Envelope class
  p5.Env = function (t1, l1, t2, l2, t3, l3) {
    console.warn('WARNING: p5.Env is now deprecated and may be removed in future versions. ' + 'Please use the new p5.Envelope instead.');
    p5.Envelope.call(this, t1, l1, t2, l2, t3, l3);
  };
  p5.Env.prototype = Object.create(p5.Envelope.prototype);
}(master, Tone_signal_Add, Tone_signal_Multiply, Tone_signal_Scale, Tone_signal_TimelineSignal);
var pulse;
'use strict';
pulse = function () {
  var p5sound = master;
  /**
   *  Creates a Pulse object, an oscillator that implements
   *  Pulse Width Modulation.
   *  The pulse is created with two oscillators.
   *  Accepts a parameter for frequency, and to set the
   *  width between the pulses. See <a href="
   *  http://p5js.org/reference/#/p5.Oscillator">
   *  <code>p5.Oscillator</code> for a full list of methods.
   *
   *  @class p5.Pulse
   *  @extends p5.Oscillator
   *  @constructor
   *  @param {Number} [freq] Frequency in oscillations per second (Hz)
   *  @param {Number} [w]    Width between the pulses (0 to 1.0,
   *                         defaults to 0)
   *  @example
   *  <div><code>
   *  let pulse;
   *  function setup() {
   *    background(0);
   *
   *    // Create and start the pulse wave oscillator
   *    pulse = new p5.Pulse();
   *    pulse.amp(0.5);
   *    pulse.freq(220);
   *    pulse.start();
   *  }
   *
   *  function draw() {
   *    let w = map(mouseX, 0, width, 0, 1);
   *    w = constrain(w, 0, 1);
   *    pulse.width(w)
   *  }
   *  </code></div>
   */
  p5.Pulse = function (freq, w) {
    p5.Oscillator.call(this, freq, 'sawtooth');
    // width of PWM, should be betw 0 to 1.0
    this.w = w || 0;
    // create a second oscillator with inverse frequency
    this.osc2 = new p5.SawOsc(freq);
    // create a delay node
    this.dNode = p5sound.audiocontext.createDelay();
    // dc offset
    this.dcOffset = createDCOffset();
    this.dcGain = p5sound.audiocontext.createGain();
    this.dcOffset.connect(this.dcGain);
    this.dcGain.connect(this.output);
    // set delay time based on PWM width
    this.f = freq || 440;
    var mW = this.w / this.oscillator.frequency.value;
    this.dNode.delayTime.value = mW;
    this.dcGain.gain.value = 1.7 * (0.5 - this.w);
    // disconnect osc2 and connect it to delay, which is connected to output
    this.osc2.disconnect();
    this.osc2.panner.disconnect();
    this.osc2.amp(-1);
    // inverted amplitude
    this.osc2.output.connect(this.dNode);
    this.dNode.connect(this.output);
    this.output.gain.value = 1;
    this.output.connect(this.panner);
  };
  p5.Pulse.prototype = Object.create(p5.Oscillator.prototype);
  /**
   *  Set the width of a Pulse object (an oscillator that implements
   *  Pulse Width Modulation).
   *
   *  @method  width
   *  @param {Number} [width]    Width between the pulses (0 to 1.0,
   *                         defaults to 0)
   */
  p5.Pulse.prototype.width = function (w) {
    if (typeof w === 'number') {
      if (w <= 1 && w >= 0) {
        this.w = w;
        // set delay time based on PWM width
        // var mW = map(this.w, 0, 1.0, 0, 1/this.f);
        var mW = this.w / this.oscillator.frequency.value;
        this.dNode.delayTime.value = mW;
      }
      this.dcGain.gain.value = 1.7 * (0.5 - this.w);
    } else {
      w.connect(this.dNode.delayTime);
      var sig = new p5.SignalAdd(-0.5);
      sig.setInput(w);
      sig = sig.mult(-1);
      sig = sig.mult(1.7);
      sig.connect(this.dcGain.gain);
    }
  };
  p5.Pulse.prototype.start = function (f, time) {
    var now = p5sound.audiocontext.currentTime;
    var t = time || 0;
    if (!this.started) {
      var freq = f || this.f;
      var type = this.oscillator.type;
      this.oscillator = p5sound.audiocontext.createOscillator();
      this.oscillator.frequency.setValueAtTime(freq, now);
      this.oscillator.type = type;
      this.oscillator.connect(this.output);
      this.oscillator.start(t + now);
      // set up osc2
      this.osc2.oscillator = p5sound.audiocontext.createOscillator();
      this.osc2.oscillator.frequency.setValueAtTime(freq, t + now);
      this.osc2.oscillator.type = type;
      this.osc2.oscillator.connect(this.osc2.output);
      this.osc2.start(t + now);
      this.freqNode = [
        this.oscillator.frequency,
        this.osc2.oscillator.frequency
      ];
      // start dcOffset, too
      this.dcOffset = createDCOffset();
      this.dcOffset.connect(this.dcGain);
      this.dcOffset.start(t + now);
      // if LFO connections depend on these oscillators
      if (this.mods !== undefined && this.mods.frequency !== undefined) {
        this.mods.frequency.connect(this.freqNode[0]);
        this.mods.frequency.connect(this.freqNode[1]);
      }
      this.started = true;
      this.osc2.started = true;
    }
  };
  p5.Pulse.prototype.stop = function (time) {
    if (this.started) {
      var t = time || 0;
      var now = p5sound.audiocontext.currentTime;
      this.oscillator.stop(t + now);
      if (this.osc2.oscillator) {
        this.osc2.oscillator.stop(t + now);
      }
      this.dcOffset.stop(t + now);
      this.started = false;
      this.osc2.started = false;
    }
  };
  p5.Pulse.prototype.freq = function (val, rampTime, tFromNow) {
    if (typeof val === 'number') {
      this.f = val;
      var now = p5sound.audiocontext.currentTime;
      var rampTime = rampTime || 0;
      var tFromNow = tFromNow || 0;
      var currentFreq = this.oscillator.frequency.value;
      this.oscillator.frequency.cancelScheduledValues(now);
      this.oscillator.frequency.setValueAtTime(currentFreq, now + tFromNow);
      this.oscillator.frequency.exponentialRampToValueAtTime(val, tFromNow + rampTime + now);
      this.osc2.oscillator.frequency.cancelScheduledValues(now);
      this.osc2.oscillator.frequency.setValueAtTime(currentFreq, now + tFromNow);
      this.osc2.oscillator.frequency.exponentialRampToValueAtTime(val, tFromNow + rampTime + now);
      if (this.freqMod) {
        this.freqMod.output.disconnect();
        this.freqMod = null;
      }
    } else if (val.output) {
      val.output.disconnect();
      val.output.connect(this.oscillator.frequency);
      val.output.connect(this.osc2.oscillator.frequency);
      this.freqMod = val;
    }
  };
  // inspiration: http://webaudiodemos.appspot.com/oscilloscope/
  function createDCOffset() {
    var ac = p5sound.audiocontext;
    var buffer = ac.createBuffer(1, 2048, ac.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < 2048; i++)
      data[i] = 1;
    var bufferSource = ac.createBufferSource();
    bufferSource.buffer = buffer;
    bufferSource.loop = true;
    return bufferSource;
  }
}(master, oscillator);
var noise;
'use strict';
noise = function () {
  var p5sound = master;
  /**
   *  Noise is a type of oscillator that generates a buffer with random values.
   *
   *  @class p5.Noise
   *  @extends p5.Oscillator
   *  @constructor
   *  @param {String} type Type of noise can be 'white' (default),
   *                       'brown' or 'pink'.
   */
  p5.Noise = function (type) {
    var assignType;
    p5.Oscillator.call(this);
    delete this.f;
    delete this.freq;
    delete this.oscillator;
    if (type === 'brown') {
      assignType = _brownNoise;
    } else if (type === 'pink') {
      assignType = _pinkNoise;
    } else {
      assignType = _whiteNoise;
    }
    this.buffer = assignType;
  };
  p5.Noise.prototype = Object.create(p5.Oscillator.prototype);
  // generate noise buffers
  var _whiteNoise = function () {
    var bufferSize = 2 * p5sound.audiocontext.sampleRate;
    var whiteBuffer = p5sound.audiocontext.createBuffer(1, bufferSize, p5sound.audiocontext.sampleRate);
    var noiseData = whiteBuffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    whiteBuffer.type = 'white';
    return whiteBuffer;
  }();
  var _pinkNoise = function () {
    var bufferSize = 2 * p5sound.audiocontext.sampleRate;
    var pinkBuffer = p5sound.audiocontext.createBuffer(1, bufferSize, p5sound.audiocontext.sampleRate);
    var noiseData = pinkBuffer.getChannelData(0);
    var b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0;
    for (var i = 0; i < bufferSize; i++) {
      var white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      noiseData[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      noiseData[i] *= 0.11;
      // (roughly) compensate for gain
      b6 = white * 0.115926;
    }
    pinkBuffer.type = 'pink';
    return pinkBuffer;
  }();
  var _brownNoise = function () {
    var bufferSize = 2 * p5sound.audiocontext.sampleRate;
    var brownBuffer = p5sound.audiocontext.createBuffer(1, bufferSize, p5sound.audiocontext.sampleRate);
    var noiseData = brownBuffer.getChannelData(0);
    var lastOut = 0;
    for (var i = 0; i < bufferSize; i++) {
      var white = Math.random() * 2 - 1;
      noiseData[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = noiseData[i];
      noiseData[i] *= 3.5;
    }
    brownBuffer.type = 'brown';
    return brownBuffer;
  }();
  /**
   *  Set type of noise to 'white', 'pink' or 'brown'.
   *  White is the default.
   *
   *  @method setType
   *  @param {String} [type] 'white', 'pink' or 'brown'
   */
  p5.Noise.prototype.setType = function (type) {
    switch (type) {
    case 'white':
      this.buffer = _whiteNoise;
      break;
    case 'pink':
      this.buffer = _pinkNoise;
      break;
    case 'brown':
      this.buffer = _brownNoise;
      break;
    default:
      this.buffer = _whiteNoise;
    }
    if (this.started) {
      var now = p5sound.audiocontext.currentTime;
      this.stop(now);
      this.start(now + 0.01);
    }
  };
  p5.Noise.prototype.getType = function () {
    return this.buffer.type;
  };
  p5.Noise.prototype.start = function () {
    if (this.started) {
      this.stop();
    }
    this.noise = p5sound.audiocontext.createBufferSource();
    this.noise.buffer = this.buffer;
    this.noise.loop = true;
    this.noise.connect(this.output);
    var now = p5sound.audiocontext.currentTime;
    this.noise.start(now);
    this.started = true;
  };
  p5.Noise.prototype.stop = function () {
    var now = p5sound.audiocontext.currentTime;
    if (this.noise) {
      this.noise.stop(now);
      this.started = false;
    }
  };
  p5.Noise.prototype.dispose = function () {
    var now = p5sound.audiocontext.currentTime;
    // remove reference from soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);
    if (this.noise) {
      this.noise.disconnect();
      this.stop(now);
    }
    if (this.output) {
      this.output.disconnect();
    }
    if (this.panner) {
      this.panner.disconnect();
    }
    this.output = null;
    this.panner = null;
    this.buffer = null;
    this.noise = null;
  };
}(master);
var audioin;
'use strict';
audioin = function () {
  var p5sound = master;
  // an array of input sources
  p5sound.inputSources = [];
  /**
   *  <p>Get audio from an input, i.e. your computer's microphone.</p>
   *
   *  <p>Turn the mic on/off with the start() and stop() methods. When the mic
   *  is on, its volume can be measured with getLevel or by connecting an
   *  FFT object.</p>
   *
   *  <p>If you want to hear the AudioIn, use the .connect() method.
   *  AudioIn does not connect to p5.sound output by default to prevent
   *  feedback.</p>
   *
   *  <p><em>Note: This uses the <a href="http://caniuse.com/stream">getUserMedia/
   *  Stream</a> API, which is not supported by certain browsers. Access in Chrome browser
   *  is limited to localhost and https, but access over http may be limited.</em></p>
   *
   *  @class p5.AudioIn
   *  @constructor
   *  @param {Function} [errorCallback] A function to call if there is an error
   *                                    accessing the AudioIn. For example,
   *                                    Safari and iOS devices do not
   *                                    currently allow microphone access.
   *  @example
   *  <div><code>
   *  let mic;
   *  function setup(){
   *    mic = new p5.AudioIn()
   *    mic.start();
   *  }
   *  function draw(){
   *    background(0);
   *    micLevel = mic.getLevel();
   *    ellipse(width/2, constrain(height-micLevel*height*5, 0, height), 10, 10);
   *  }
   *  </code></div>
   */
  p5.AudioIn = function (errorCallback) {
    // set up audio input
    /**
     * @property {GainNode} input
     */
    this.input = p5sound.audiocontext.createGain();
    /**
     * @property {GainNode} output
     */
    this.output = p5sound.audiocontext.createGain();
    /**
     * @property {MediaStream|null} stream
     */
    this.stream = null;
    /**
     * @property {MediaStreamAudioSourceNode|null} mediaStream
     */
    this.mediaStream = null;
    /**
     * @property {Number|null} currentSource
     */
    this.currentSource = null;
    /**
     *  Client must allow browser to access their microphone / audioin source.
     *  Default: false. Will become true when the client enables access.
     *
     *  @property {Boolean} enabled
     */
    this.enabled = false;
    /**
     * Input amplitude, connect to it by default but not to master out
     *
     *  @property {p5.Amplitude} amplitude
     */
    this.amplitude = new p5.Amplitude();
    this.output.connect(this.amplitude.input);
    if (!window.MediaStreamTrack || !window.navigator.mediaDevices || !window.navigator.mediaDevices.getUserMedia) {
      errorCallback ? errorCallback() : window.alert('This browser does not support MediaStreamTrack and mediaDevices');
    }
    // add to soundArray so we can dispose on close
    p5sound.soundArray.push(this);
  };
  /**
   *  Start processing audio input. This enables the use of other
   *  AudioIn methods like getLevel(). Note that by default, AudioIn
   *  is not connected to p5.sound's output. So you won't hear
   *  anything unless you use the connect() method.<br/>
   *
   *  Certain browsers limit access to the user's microphone. For example,
   *  Chrome only allows access from localhost and over https. For this reason,
   *  you may want to include an errorCallback—a function that is called in case
   *  the browser won't provide mic access.
   *
   *  @method start
   *  @param {Function} [successCallback] Name of a function to call on
   *                                    success.
   *  @param {Function} [errorCallback] Name of a function to call if
   *                                    there was an error. For example,
   *                                    some browsers do not support
   *                                    getUserMedia.
   */
  p5.AudioIn.prototype.start = function (successCallback, errorCallback) {
    var self = this;
    if (this.stream) {
      this.stop();
    }
    // set the audio source
    var audioSource = p5sound.inputSources[self.currentSource];
    var constraints = {
      audio: {
        sampleRate: p5sound.audiocontext.sampleRate,
        echoCancellation: false
      }
    };
    // if developers determine which source to use
    if (p5sound.inputSources[this.currentSource]) {
      constraints.audio.deviceId = audioSource.deviceId;
    }
    window.navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
      self.stream = stream;
      self.enabled = true;
      // Wrap a MediaStreamSourceNode around the live input
      self.mediaStream = p5sound.audiocontext.createMediaStreamSource(stream);
      self.mediaStream.connect(self.output);
      // only send to the Amplitude reader, so we can see it but not hear it.
      self.amplitude.setInput(self.output);
      if (successCallback)
        successCallback();
    }).catch(function (err) {
      if (errorCallback)
        errorCallback(err);
      else
        console.error(err);
    });
  };
  /**
   *  Turn the AudioIn off. If the AudioIn is stopped, it cannot getLevel().
   *  If re-starting, the user may be prompted for permission access.
   *
   *  @method stop
   */
  p5.AudioIn.prototype.stop = function () {
    if (this.stream) {
      this.stream.getTracks().forEach(function (track) {
        track.stop();
      });
      this.mediaStream.disconnect();
      delete this.mediaStream;
      delete this.stream;
    }
  };
  /**
   *  Connect to an audio unit. If no parameter is provided, will
   *  connect to the master output (i.e. your speakers).<br/>
   *
   *  @method  connect
   *  @param  {Object} [unit] An object that accepts audio input,
   *                          such as an FFT
   */
  p5.AudioIn.prototype.connect = function (unit) {
    if (unit) {
      if (unit.hasOwnProperty('input')) {
        this.output.connect(unit.input);
      } else if (unit.hasOwnProperty('analyser')) {
        this.output.connect(unit.analyser);
      } else {
        this.output.connect(unit);
      }
    } else {
      this.output.connect(p5sound.input);
    }
  };
  /**
   *  Disconnect the AudioIn from all audio units. For example, if
   *  connect() had been called, disconnect() will stop sending
   *  signal to your speakers.<br/>
   *
   *  @method  disconnect
   */
  p5.AudioIn.prototype.disconnect = function () {
    if (this.output) {
      this.output.disconnect();
      // stay connected to amplitude even if not outputting to p5
      this.output.connect(this.amplitude.input);
    }
  };
  /**
   *  Read the Amplitude (volume level) of an AudioIn. The AudioIn
   *  class contains its own instance of the Amplitude class to help
   *  make it easy to get a microphone's volume level. Accepts an
   *  optional smoothing value (0.0 < 1.0). <em>NOTE: AudioIn must
   *  .start() before using .getLevel().</em><br/>
   *
   *  @method  getLevel
   *  @param  {Number} [smoothing] Smoothing is 0.0 by default.
   *                               Smooths values based on previous values.
   *  @return {Number}           Volume level (between 0.0 and 1.0)
   */
  p5.AudioIn.prototype.getLevel = function (smoothing) {
    if (smoothing) {
      this.amplitude.smoothing = smoothing;
    }
    return this.amplitude.getLevel();
  };
  /**
   *  Set amplitude (volume) of a mic input between 0 and 1.0. <br/>
   *
   *  @method  amp
   *  @param  {Number} vol between 0 and 1.0
   *  @param {Number} [time] ramp time (optional)
   */
  p5.AudioIn.prototype.amp = function (vol, t) {
    if (t) {
      var rampTime = t || 0;
      var currentVol = this.output.gain.value;
      this.output.gain.cancelScheduledValues(p5sound.audiocontext.currentTime);
      this.output.gain.setValueAtTime(currentVol, p5sound.audiocontext.currentTime);
      this.output.gain.linearRampToValueAtTime(vol, rampTime + p5sound.audiocontext.currentTime);
    } else {
      this.output.gain.cancelScheduledValues(p5sound.audiocontext.currentTime);
      this.output.gain.setValueAtTime(vol, p5sound.audiocontext.currentTime);
    }
  };
  /**
   * Returns a list of available input sources. This is a wrapper
   * for <a title="MediaDevices.enumerateDevices() - Web APIs | MDN" target="_blank" href=
   *  "https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices"
   *  > and it returns a Promise.
   *
   * @method  getSources
   * @param  {Function} [successCallback] This callback function handles the sources when they
   *                                      have been enumerated. The callback function
   *                                      receives the deviceList array as its only argument
   * @param  {Function} [errorCallback] This optional callback receives the error
   *                                    message as its argument.
   * @returns {Promise} Returns a Promise that can be used in place of the callbacks, similar
   *                            to the enumerateDevices() method
   * @example
   *  <div><code>
   *  let audiograb;
   *
   *  function setup(){
   *    //new audioIn
   *    audioGrab = new p5.AudioIn();
   *
   *    audioGrab.getSources(function(deviceList) {
   *      //print out the array of available sources
   *      console.log(deviceList);
   *      //set the source to the first item in the deviceList array
   *      audioGrab.setSource(0);
   *    });
   *  }
   *  </code></div>
   */
  p5.AudioIn.prototype.getSources = function (onSuccess, onError) {
    return new Promise(function (resolve, reject) {
      window.navigator.mediaDevices.enumerateDevices().then(function (devices) {
        p5sound.inputSources = devices.filter(function (device) {
          return device.kind === 'audioinput';
        });
        resolve(p5sound.inputSources);
        if (onSuccess) {
          onSuccess(p5sound.inputSources);
        }
      }).catch(function (error) {
        reject(error);
        if (onError) {
          onError(error);
        } else {
          console.error('This browser does not support MediaStreamTrack.getSources()');
        }
      });
    });
  };
  /**
   *  Set the input source. Accepts a number representing a
   *  position in the array returned by getSources().
   *  This is only available in browsers that support
   *  <a title="MediaDevices.enumerateDevices() - Web APIs | MDN" target="_blank" href=
   *  "https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices"
   *  >navigator.mediaDevices.enumerateDevices()</a>.<br/>
   *
   *  @method setSource
   *  @param {number} num position of input source in the array
   */
  p5.AudioIn.prototype.setSource = function (num) {
    if (p5sound.inputSources.length > 0 && num < p5sound.inputSources.length) {
      // set the current source
      this.currentSource = num;
      console.log('set source to ', p5sound.inputSources[this.currentSource]);
    } else {
      console.log('unable to set input source');
    }
    // restart stream if currently active
    if (this.stream && this.stream.active) {
      this.start();
    }
  };
  // private method
  p5.AudioIn.prototype.dispose = function () {
    // remove reference from soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);
    this.stop();
    if (this.output) {
      this.output.disconnect();
    }
    if (this.amplitude) {
      this.amplitude.disconnect();
    }
    delete this.amplitude;
    delete this.output;
  };
}(master);
/** Tone.js module by Yotam Mann, MIT License 2016  http://opensource.org/licenses/MIT **/
var Tone_signal_Negate;
Tone_signal_Negate = function (Tone) {
  'use strict';
  Tone.Negate = function () {
    this._multiply = this.input = this.output = new Tone.Multiply(-1);
  };
  Tone.extend(Tone.Negate, Tone.SignalBase);
  Tone.Negate.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._multiply.dispose();
    this._multiply = null;
    return this;
  };
  return Tone.Negate;
}(Tone_core_Tone, Tone_signal_Multiply);
/** Tone.js module by Yotam Mann, MIT License 2016  http://opensource.org/licenses/MIT **/
var Tone_signal_Subtract;
Tone_signal_Subtract = function (Tone) {
  'use strict';
  Tone.Subtract = function (value) {
    this.createInsOuts(2, 0);
    this._sum = this.input[0] = this.output = new Tone.Gain();
    this._neg = new Tone.Negate();
    this._param = this.input[1] = new Tone.Signal(value);
    this._param.chain(this._neg, this._sum);
  };
  Tone.extend(Tone.Subtract, Tone.Signal);
  Tone.Subtract.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._neg.dispose();
    this._neg = null;
    this._sum.disconnect();
    this._sum = null;
    this._param.dispose();
    this._param = null;
    return this;
  };
  return Tone.Subtract;
}(Tone_core_Tone, Tone_signal_Add, Tone_signal_Negate, Tone_signal_Signal);
/** Tone.js module by Yotam Mann, MIT License 2016  http://opensource.org/licenses/MIT **/
var Tone_signal_GreaterThanZero;
Tone_signal_GreaterThanZero = function (Tone) {
  'use strict';
  Tone.GreaterThanZero = function () {
    this._thresh = this.output = new Tone.WaveShaper(function (val) {
      if (val <= 0) {
        return 0;
      } else {
        return 1;
      }
    }, 127);
    this._scale = this.input = new Tone.Multiply(10000);
    this._scale.connect(this._thresh);
  };
  Tone.extend(Tone.GreaterThanZero, Tone.SignalBase);
  Tone.GreaterThanZero.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._scale.dispose();
    this._scale = null;
    this._thresh.dispose();
    this._thresh = null;
    return this;
  };
  return Tone.GreaterThanZero;
}(Tone_core_Tone, Tone_signal_Signal, Tone_signal_Multiply);
/** Tone.js module by Yotam Mann, MIT License 2016  http://opensource.org/licenses/MIT **/
var Tone_signal_GreaterThan;
Tone_signal_GreaterThan = function (Tone) {
  'use strict';
  Tone.GreaterThan = function (value) {
    this.createInsOuts(2, 0);
    this._param = this.input[0] = new Tone.Subtract(value);
    this.input[1] = this._param.input[1];
    this._gtz = this.output = new Tone.GreaterThanZero();
    this._param.connect(this._gtz);
  };
  Tone.extend(Tone.GreaterThan, Tone.Signal);
  Tone.GreaterThan.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._param.dispose();
    this._param = null;
    this._gtz.dispose();
    this._gtz = null;
    return this;
  };
  return Tone.GreaterThan;
}(Tone_core_Tone, Tone_signal_GreaterThanZero, Tone_signal_Subtract);
/** Tone.js module by Yotam Mann, MIT License 2016  http://opensource.org/licenses/MIT **/
var Tone_signal_Abs;
Tone_signal_Abs = function (Tone) {
  'use strict';
  Tone.Abs = function () {
    this._abs = this.input = this.output = new Tone.WaveShaper(function (val) {
      if (val === 0) {
        return 0;
      } else {
        return Math.abs(val);
      }
    }, 127);
  };
  Tone.extend(Tone.Abs, Tone.SignalBase);
  Tone.Abs.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._abs.dispose();
    this._abs = null;
    return this;
  };
  return Tone.Abs;
}(Tone_core_Tone, Tone_signal_WaveShaper);
/** Tone.js module by Yotam Mann, MIT License 2016  http://opensource.org/licenses/MIT **/
var Tone_signal_Modulo;
Tone_signal_Modulo = function (Tone) {
  'use strict';
  Tone.Modulo = function (modulus) {
    this.createInsOuts(1, 0);
    this._shaper = new Tone.WaveShaper(Math.pow(2, 16));
    this._multiply = new Tone.Multiply();
    this._subtract = this.output = new Tone.Subtract();
    this._modSignal = new Tone.Signal(modulus);
    this.input.fan(this._shaper, this._subtract);
    this._modSignal.connect(this._multiply, 0, 0);
    this._shaper.connect(this._multiply, 0, 1);
    this._multiply.connect(this._subtract, 0, 1);
    this._setWaveShaper(modulus);
  };
  Tone.extend(Tone.Modulo, Tone.SignalBase);
  Tone.Modulo.prototype._setWaveShaper = function (mod) {
    this._shaper.setMap(function (val) {
      var multiple = Math.floor((val + 0.0001) / mod);
      return multiple;
    });
  };
  Object.defineProperty(Tone.Modulo.prototype, 'value', {
    get: function () {
      return this._modSignal.value;
    },
    set: function (mod) {
      this._modSignal.value = mod;
      this._setWaveShaper(mod);
    }
  });
  Tone.Modulo.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._shaper.dispose();
    this._shaper = null;
    this._multiply.dispose();
    this._multiply = null;
    this._subtract.dispose();
    this._subtract = null;
    this._modSignal.dispose();
    this._modSignal = null;
    return this;
  };
  return Tone.Modulo;
}(Tone_core_Tone, Tone_signal_WaveShaper, Tone_signal_Multiply);
/** Tone.js module by Yotam Mann, MIT License 2016  http://opensource.org/licenses/MIT **/
var Tone_signal_Pow;
Tone_signal_Pow = function (Tone) {
  'use strict';
  Tone.Pow = function (exp) {
    this._exp = this.defaultArg(exp, 1);
    this._expScaler = this.input = this.output = new Tone.WaveShaper(this._expFunc(this._exp), 8192);
  };
  Tone.extend(Tone.Pow, Tone.SignalBase);
  Object.defineProperty(Tone.Pow.prototype, 'value', {
    get: function () {
      return this._exp;
    },
    set: function (exp) {
      this._exp = exp;
      this._expScaler.setMap(this._expFunc(this._exp));
    }
  });
  Tone.Pow.prototype._expFunc = function (exp) {
    return function (val) {
      return Math.pow(Math.abs(val), exp);
    };
  };
  Tone.Pow.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._expScaler.dispose();
    this._expScaler = null;
    return this;
  };
  return Tone.Pow;
}(Tone_core_Tone);
/** Tone.js module by Yotam Mann, MIT License 2016  http://opensource.org/licenses/MIT **/
var Tone_signal_AudioToGain;
Tone_signal_AudioToGain = function (Tone) {
  'use strict';
  Tone.AudioToGain = function () {
    this._norm = this.input = this.output = new Tone.WaveShaper(function (x) {
      return (x + 1) / 2;
    });
  };
  Tone.extend(Tone.AudioToGain, Tone.SignalBase);
  Tone.AudioToGain.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._norm.dispose();
    this._norm = null;
    return this;
  };
  return Tone.AudioToGain;
}(Tone_core_Tone, Tone_signal_WaveShaper);
/** Tone.js module by Yotam Mann, MIT License 2016  http://opensource.org/licenses/MIT **/
var Tone_signal_Expr;
Tone_signal_Expr = function (Tone) {
  'use strict';
  Tone.Expr = function () {
    var expr = this._replacements(Array.prototype.slice.call(arguments));
    var inputCount = this._parseInputs(expr);
    this._nodes = [];
    this.input = new Array(inputCount);
    for (var i = 0; i < inputCount; i++) {
      this.input[i] = this.context.createGain();
    }
    var tree = this._parseTree(expr);
    var result;
    try {
      result = this._eval(tree);
    } catch (e) {
      this._disposeNodes();
      throw new Error('Tone.Expr: Could evaluate expression: ' + expr);
    }
    this.output = result;
  };
  Tone.extend(Tone.Expr, Tone.SignalBase);
  function applyBinary(Constructor, args, self) {
    var op = new Constructor();
    self._eval(args[0]).connect(op, 0, 0);
    self._eval(args[1]).connect(op, 0, 1);
    return op;
  }
  function applyUnary(Constructor, args, self) {
    var op = new Constructor();
    self._eval(args[0]).connect(op, 0, 0);
    return op;
  }
  function getNumber(arg) {
    return arg ? parseFloat(arg) : undefined;
  }
  function literalNumber(arg) {
    return arg && arg.args ? parseFloat(arg.args) : undefined;
  }
  Tone.Expr._Expressions = {
    'value': {
      'signal': {
        regexp: /^\d+\.\d+|^\d+/,
        method: function (arg) {
          var sig = new Tone.Signal(getNumber(arg));
          return sig;
        }
      },
      'input': {
        regexp: /^\$\d/,
        method: function (arg, self) {
          return self.input[getNumber(arg.substr(1))];
        }
      }
    },
    'glue': {
      '(': { regexp: /^\(/ },
      ')': { regexp: /^\)/ },
      ',': { regexp: /^,/ }
    },
    'func': {
      'abs': {
        regexp: /^abs/,
        method: applyUnary.bind(this, Tone.Abs)
      },
      'mod': {
        regexp: /^mod/,
        method: function (args, self) {
          var modulus = literalNumber(args[1]);
          var op = new Tone.Modulo(modulus);
          self._eval(args[0]).connect(op);
          return op;
        }
      },
      'pow': {
        regexp: /^pow/,
        method: function (args, self) {
          var exp = literalNumber(args[1]);
          var op = new Tone.Pow(exp);
          self._eval(args[0]).connect(op);
          return op;
        }
      },
      'a2g': {
        regexp: /^a2g/,
        method: function (args, self) {
          var op = new Tone.AudioToGain();
          self._eval(args[0]).connect(op);
          return op;
        }
      }
    },
    'binary': {
      '+': {
        regexp: /^\+/,
        precedence: 1,
        method: applyBinary.bind(this, Tone.Add)
      },
      '-': {
        regexp: /^\-/,
        precedence: 1,
        method: function (args, self) {
          if (args.length === 1) {
            return applyUnary(Tone.Negate, args, self);
          } else {
            return applyBinary(Tone.Subtract, args, self);
          }
        }
      },
      '*': {
        regexp: /^\*/,
        precedence: 0,
        method: applyBinary.bind(this, Tone.Multiply)
      }
    },
    'unary': {
      '-': {
        regexp: /^\-/,
        method: applyUnary.bind(this, Tone.Negate)
      },
      '!': {
        regexp: /^\!/,
        method: applyUnary.bind(this, Tone.NOT)
      }
    }
  };
  Tone.Expr.prototype._parseInputs = function (expr) {
    var inputArray = expr.match(/\$\d/g);
    var inputMax = 0;
    if (inputArray !== null) {
      for (var i = 0; i < inputArray.length; i++) {
        var inputNum = parseInt(inputArray[i].substr(1)) + 1;
        inputMax = Math.max(inputMax, inputNum);
      }
    }
    return inputMax;
  };
  Tone.Expr.prototype._replacements = function (args) {
    var expr = args.shift();
    for (var i = 0; i < args.length; i++) {
      expr = expr.replace(/\%/i, args[i]);
    }
    return expr;
  };
  Tone.Expr.prototype._tokenize = function (expr) {
    var position = -1;
    var tokens = [];
    while (expr.length > 0) {
      expr = expr.trim();
      var token = getNextToken(expr);
      tokens.push(token);
      expr = expr.substr(token.value.length);
    }
    function getNextToken(expr) {
      for (var type in Tone.Expr._Expressions) {
        var group = Tone.Expr._Expressions[type];
        for (var opName in group) {
          var op = group[opName];
          var reg = op.regexp;
          var match = expr.match(reg);
          if (match !== null) {
            return {
              type: type,
              value: match[0],
              method: op.method
            };
          }
        }
      }
      throw new SyntaxError('Tone.Expr: Unexpected token ' + expr);
    }
    return {
      next: function () {
        return tokens[++position];
      },
      peek: function () {
        return tokens[position + 1];
      }
    };
  };
  Tone.Expr.prototype._parseTree = function (expr) {
    var lexer = this._tokenize(expr);
    var isUndef = this.isUndef.bind(this);
    function matchSyntax(token, syn) {
      return !isUndef(token) && token.type === 'glue' && token.value === syn;
    }
    function matchGroup(token, groupName, prec) {
      var ret = false;
      var group = Tone.Expr._Expressions[groupName];
      if (!isUndef(token)) {
        for (var opName in group) {
          var op = group[opName];
          if (op.regexp.test(token.value)) {
            if (!isUndef(prec)) {
              if (op.precedence === prec) {
                return true;
              }
            } else {
              return true;
            }
          }
        }
      }
      return ret;
    }
    function parseExpression(precedence) {
      if (isUndef(precedence)) {
        precedence = 5;
      }
      var expr;
      if (precedence < 0) {
        expr = parseUnary();
      } else {
        expr = parseExpression(precedence - 1);
      }
      var token = lexer.peek();
      while (matchGroup(token, 'binary', precedence)) {
        token = lexer.next();
        expr = {
          operator: token.value,
          method: token.method,
          args: [
            expr,
            parseExpression(precedence - 1)
          ]
        };
        token = lexer.peek();
      }
      return expr;
    }
    function parseUnary() {
      var token, expr;
      token = lexer.peek();
      if (matchGroup(token, 'unary')) {
        token = lexer.next();
        expr = parseUnary();
        return {
          operator: token.value,
          method: token.method,
          args: [expr]
        };
      }
      return parsePrimary();
    }
    function parsePrimary() {
      var token, expr;
      token = lexer.peek();
      if (isUndef(token)) {
        throw new SyntaxError('Tone.Expr: Unexpected termination of expression');
      }
      if (token.type === 'func') {
        token = lexer.next();
        return parseFunctionCall(token);
      }
      if (token.type === 'value') {
        token = lexer.next();
        return {
          method: token.method,
          args: token.value
        };
      }
      if (matchSyntax(token, '(')) {
        lexer.next();
        expr = parseExpression();
        token = lexer.next();
        if (!matchSyntax(token, ')')) {
          throw new SyntaxError('Expected )');
        }
        return expr;
      }
      throw new SyntaxError('Tone.Expr: Parse error, cannot process token ' + token.value);
    }
    function parseFunctionCall(func) {
      var token, args = [];
      token = lexer.next();
      if (!matchSyntax(token, '(')) {
        throw new SyntaxError('Tone.Expr: Expected ( in a function call "' + func.value + '"');
      }
      token = lexer.peek();
      if (!matchSyntax(token, ')')) {
        args = parseArgumentList();
      }
      token = lexer.next();
      if (!matchSyntax(token, ')')) {
        throw new SyntaxError('Tone.Expr: Expected ) in a function call "' + func.value + '"');
      }
      return {
        method: func.method,
        args: args,
        name: name
      };
    }
    function parseArgumentList() {
      var token, expr, args = [];
      while (true) {
        expr = parseExpression();
        if (isUndef(expr)) {
          break;
        }
        args.push(expr);
        token = lexer.peek();
        if (!matchSyntax(token, ',')) {
          break;
        }
        lexer.next();
      }
      return args;
    }
    return parseExpression();
  };
  Tone.Expr.prototype._eval = function (tree) {
    if (!this.isUndef(tree)) {
      var node = tree.method(tree.args, this);
      this._nodes.push(node);
      return node;
    }
  };
  Tone.Expr.prototype._disposeNodes = function () {
    for (var i = 0; i < this._nodes.length; i++) {
      var node = this._nodes[i];
      if (this.isFunction(node.dispose)) {
        node.dispose();
      } else if (this.isFunction(node.disconnect)) {
        node.disconnect();
      }
      node = null;
      this._nodes[i] = null;
    }
    this._nodes = null;
  };
  Tone.Expr.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._disposeNodes();
  };
  return Tone.Expr;
}(Tone_core_Tone, Tone_signal_Add, Tone_signal_Subtract, Tone_signal_Multiply, Tone_signal_GreaterThan, Tone_signal_GreaterThanZero, Tone_signal_Abs, Tone_signal_Negate, Tone_signal_Modulo, Tone_signal_Pow);
/** Tone.js module by Yotam Mann, MIT License 2016  http://opensource.org/licenses/MIT **/
var Tone_signal_EqualPowerGain;
Tone_signal_EqualPowerGain = function (Tone) {
  'use strict';
  Tone.EqualPowerGain = function () {
    this._eqPower = this.input = this.output = new Tone.WaveShaper(function (val) {
      if (Math.abs(val) < 0.001) {
        return 0;
      } else {
        return this.equalPowerScale(val);
      }
    }.bind(this), 4096);
  };
  Tone.extend(Tone.EqualPowerGain, Tone.SignalBase);
  Tone.EqualPowerGain.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._eqPower.dispose();
    this._eqPower = null;
    return this;
  };
  return Tone.EqualPowerGain;
}(Tone_core_Tone);
/** Tone.js module by Yotam Mann, MIT License 2016  http://opensource.org/licenses/MIT **/
var Tone_component_CrossFade;
Tone_component_CrossFade = function (Tone) {
  'use strict';
  Tone.CrossFade = function (initialFade) {
    this.createInsOuts(2, 1);
    this.a = this.input[0] = new Tone.Gain();
    this.b = this.input[1] = new Tone.Gain();
    this.fade = new Tone.Signal(this.defaultArg(initialFade, 0.5), Tone.Type.NormalRange);
    this._equalPowerA = new Tone.EqualPowerGain();
    this._equalPowerB = new Tone.EqualPowerGain();
    this._invert = new Tone.Expr('1 - $0');
    this.a.connect(this.output);
    this.b.connect(this.output);
    this.fade.chain(this._equalPowerB, this.b.gain);
    this.fade.chain(this._invert, this._equalPowerA, this.a.gain);
    this._readOnly('fade');
  };
  Tone.extend(Tone.CrossFade);
  Tone.CrossFade.prototype.dispose = function () {
    Tone.prototype.dispose.call(this);
    this._writable('fade');
    this._equalPowerA.dispose();
    this._equalPowerA = null;
    this._equalPowerB.dispose();
    this._equalPowerB = null;
    this.fade.dispose();
    this.fade = null;
    this._invert.dispose();
    this._invert = null;
    this.a.dispose();
    this.a = null;
    this.b.dispose();
    this.b = null;
    return this;
  };
  return Tone.CrossFade;
}(Tone_core_Tone, Tone_signal_Signal, Tone_signal_Expr, Tone_signal_EqualPowerGain);
var effect;
'use strict';
effect = function () {
  var p5sound = master;
  var CrossFade = Tone_component_CrossFade;
  /**
   * Effect is a base class for audio effects in p5. <br>
   * This module handles the nodes and methods that are 
   * common and useful for current and future effects.
   *
   *
   * This class is extended by <a href="/reference/#/p5.Distortion">p5.Distortion</a>, 
   * <a href="/reference/#/p5.Compressor">p5.Compressor</a>,
   * <a href="/reference/#/p5.Delay">p5.Delay</a>, 
   * <a href="/reference/#/p5.Filter">p5.Filter</a>, 
   * <a href="/reference/#/p5.Reverb">p5.Reverb</a>.
   *
   * @class  p5.Effect
   * @constructor
   * 
   * @param {Object} [ac]   Reference to the audio context of the p5 object
   * @param {AudioNode} [input]  Gain Node effect wrapper
   * @param {AudioNode} [output] Gain Node effect wrapper
   * @param {Object} [_drywet]   Tone.JS CrossFade node (defaults to value: 1)
   * @param {AudioNode} [wet]  Effects that extend this class should connect
   *                              to the wet signal to this gain node, so that dry and wet 
   *                              signals are mixed properly.
   */
  p5.Effect = function () {
    this.ac = p5sound.audiocontext;
    this.input = this.ac.createGain();
    this.output = this.ac.createGain();
    /**
    *	The p5.Effect class is built
    * 	using Tone.js CrossFade
    * 	@private
    */
    this._drywet = new CrossFade(1);
    /**
     *	In classes that extend
     *	p5.Effect, connect effect nodes
     *	to the wet parameter
     */
    this.wet = this.ac.createGain();
    this.input.connect(this._drywet.a);
    this.wet.connect(this._drywet.b);
    this._drywet.connect(this.output);
    this.connect();
    //Add to the soundArray
    p5sound.soundArray.push(this);
  };
  /**
   *  Set the output volume of the filter.
   *  
   *  @method  amp
   *  @param {Number} [vol] amplitude between 0 and 1.0
   *  @param {Number} [rampTime] create a fade that lasts until rampTime 
   *  @param {Number} [tFromNow] schedule this event to happen in tFromNow seconds
   */
  p5.Effect.prototype.amp = function (vol, rampTime, tFromNow) {
    var rampTime = rampTime || 0;
    var tFromNow = tFromNow || 0;
    var now = p5sound.audiocontext.currentTime;
    var currentVol = this.output.gain.value;
    this.output.gain.cancelScheduledValues(now);
    this.output.gain.linearRampToValueAtTime(currentVol, now + tFromNow + 0.001);
    this.output.gain.linearRampToValueAtTime(vol, now + tFromNow + rampTime + 0.001);
  };
  /**
   *	Link effects together in a chain	
   *	Example usage: filter.chain(reverb, delay, panner);
   *	May be used with an open-ended number of arguments
   *
   *	@method chain 
     *  @param {Object} [arguments]  Chain together multiple sound objects	
   */
  p5.Effect.prototype.chain = function () {
    if (arguments.length > 0) {
      this.connect(arguments[0]);
      for (var i = 1; i < arguments.length; i += 1) {
        arguments[i - 1].connect(arguments[i]);
      }
    }
    return this;
  };
  /**
   *	Adjust the dry/wet value.	
   *	
   *	@method drywet
   *	@param {Number} [fade] The desired drywet value (0 - 1.0)
   */
  p5.Effect.prototype.drywet = function (fade) {
    if (typeof fade !== 'undefined') {
      this._drywet.fade.value = fade;
    }
    return this._drywet.fade.value;
  };
  /**
   *	Send output to a p5.js-sound, Web Audio Node, or use signal to
   *	control an AudioParam	
   *	
   *	@method connect 
   *	@param {Object} unit 
   */
  p5.Effect.prototype.connect = function (unit) {
    var u = unit || p5.soundOut.input;
    this.output.connect(u.input ? u.input : u);
  };
  /**
   *	Disconnect all output.	
   *	
   *	@method disconnect 
   */
  p5.Effect.prototype.disconnect = function () {
    if (this.output) {
      this.output.disconnect();
    }
  };
  p5.Effect.prototype.dispose = function () {
    // remove refernce form soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);
    if (this.input) {
      this.input.disconnect();
      delete this.input;
    }
    if (this.output) {
      this.output.disconnect();
      delete this.output;
    }
    if (this._drywet) {
      this._drywet.disconnect();
      delete this._drywet;
    }
    if (this.wet) {
      this.wet.disconnect();
      delete this.wet;
    }
    this.ac = undefined;
  };
  return p5.Effect;
}(master, Tone_component_CrossFade);
var filter;
'use strict';
filter = function () {
  var p5sound = master;
  var Effect = effect;
  /**
   *  <p>A p5.Filter uses a Web Audio Biquad Filter to filter
   *  the frequency response of an input source. Subclasses
   *  include:</p>
   *  * <a href="/reference/#/p5.LowPass"><code>p5.LowPass</code></a>:
   *  Allows frequencies below the cutoff frequency to pass through,
   *  and attenuates frequencies above the cutoff.<br/>
   *  * <a href="/reference/#/p5.HighPass"><code>p5.HighPass</code></a>:
   *  The opposite of a lowpass filter. <br/>
   *  * <a href="/reference/#/p5.BandPass"><code>p5.BandPass</code></a>:
   *  Allows a range of frequencies to pass through and attenuates
   *  the frequencies below and above this frequency range.<br/>
   *
   *  The <code>.res()</code> method controls either width of the
   *  bandpass, or resonance of the low/highpass cutoff frequency.
   *
   *  This class extends <a href = "/reference/#/p5.Effect">p5.Effect</a>.  
   *  Methods <a href = "/reference/#/p5.Effect/amp">amp()</a>, <a href = "/reference/#/p5.Effect/chain">chain()</a>, 
   *  <a href = "/reference/#/p5.Effect/drywet">drywet()</a>, <a href = "/reference/#/p5.Effect/connect">connect()</a>, and 
   *  <a href = "/reference/#/p5.Effect/disconnect">disconnect()</a> are available.
   *
   *  @class p5.Filter
   *  @extends p5.Effect
   *  @constructor
   *  @param {String} [type] 'lowpass' (default), 'highpass', 'bandpass'
   *  @example
   *  <div><code>
   *  let fft, noise, filter;
   *
   *  function setup() {
   *    fill(255, 40, 255);
   *
   *    filter = new p5.BandPass();
   *
   *    noise = new p5.Noise();
   *    // disconnect unfiltered noise,
   *    // and connect to filter
   *    noise.disconnect();
   *    noise.connect(filter);
   *    noise.start();
   *
   *    fft = new p5.FFT();
   *  }
   *
   *  function draw() {
   *    background(30);
   *
   *    // set the BandPass frequency based on mouseX
   *    let freq = map(mouseX, 0, width, 20, 10000);
   *    filter.freq(freq);
   *    // give the filter a narrow band (lower res = wider bandpass)
   *    filter.res(50);
   *
   *    // draw filtered spectrum
   *    let spectrum = fft.analyze();
   *    noStroke();
   *    for (let i = 0; i < spectrum.length; i++) {
   *      let x = map(i, 0, spectrum.length, 0, width);
   *      let h = -height + map(spectrum[i], 0, 255, height, 0);
   *      rect(x, height, width/spectrum.length, h);
   *    }
   *
   *    isMouseOverCanvas();
   *  }
   *
   *  function isMouseOverCanvas() {
   *    let mX = mouseX, mY = mouseY;
   *    if (mX > 0 && mX < width && mY < height && mY > 0) {
   *      noise.amp(0.5, 0.2);
   *    } else {
   *      noise.amp(0, 0.2);
   *    }
   *  }
   *  </code></div>
   */
  //constructor with inheritance
  p5.Filter = function (type) {
    Effect.call(this);
    //add extend Effect by adding a Biquad Filter
    /**
        *  The p5.Filter is built with a
        *  <a href="http://www.w3.org/TR/webaudio/#BiquadFilterNode">
        *  Web Audio BiquadFilter Node</a>.
        *
        *  @property {DelayNode} biquadFilter
     */
    this.biquad = this.ac.createBiquadFilter();
    this.input.connect(this.biquad);
    this.biquad.connect(this.wet);
    if (type) {
      this.setType(type);
    }
    //Properties useful for the toggle method.
    this._on = true;
    this._untoggledType = this.biquad.type;
  };
  p5.Filter.prototype = Object.create(Effect.prototype);
  /**
   *  Filter an audio signal according to a set
   *  of filter parameters.
   *
   *  @method  process
   *  @param  {Object} Signal  An object that outputs audio
   *  @param {Number} [freq] Frequency in Hz, from 10 to 22050
   *  @param {Number} [res] Resonance/Width of the filter frequency
   *                        from 0.001 to 1000
   */
  p5.Filter.prototype.process = function (src, freq, res, time) {
    src.connect(this.input);
    this.set(freq, res, time);
  };
  /**
   *  Set the frequency and the resonance of the filter.
   *
   *  @method  set
   *  @param {Number} [freq] Frequency in Hz, from 10 to 22050
   *  @param {Number} [res]  Resonance (Q) from 0.001 to 1000
   *  @param {Number} [timeFromNow] schedule this event to happen
   *                                seconds from now
   */
  p5.Filter.prototype.set = function (freq, res, time) {
    if (freq) {
      this.freq(freq, time);
    }
    if (res) {
      this.res(res, time);
    }
  };
  /**
   *  Set the filter frequency, in Hz, from 10 to 22050 (the range of
   *  human hearing, although in reality most people hear in a narrower
   *  range).
   *
   *  @method  freq
   *  @param  {Number} freq Filter Frequency
   *  @param {Number} [timeFromNow] schedule this event to happen
   *                                seconds from now
   *  @return {Number} value  Returns the current frequency value
   */
  p5.Filter.prototype.freq = function (freq, time) {
    var t = time || 0;
    if (freq <= 0) {
      freq = 1;
    }
    if (typeof freq === 'number') {
      this.biquad.frequency.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.biquad.frequency.exponentialRampToValueAtTime(freq, this.ac.currentTime + 0.02 + t);
    } else if (freq) {
      freq.connect(this.biquad.frequency);
    }
    return this.biquad.frequency.value;
  };
  /**
   *  Controls either width of a bandpass frequency,
   *  or the resonance of a low/highpass cutoff frequency.
   *
   *  @method  res
   *  @param {Number} res  Resonance/Width of filter freq
   *                       from 0.001 to 1000
   *  @param {Number} [timeFromNow] schedule this event to happen
   *                                seconds from now
   *  @return {Number} value Returns the current res value
   */
  p5.Filter.prototype.res = function (res, time) {
    var t = time || 0;
    if (typeof res === 'number') {
      this.biquad.Q.value = res;
      this.biquad.Q.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.biquad.Q.linearRampToValueAtTime(res, this.ac.currentTime + 0.02 + t);
    } else if (res) {
      res.connect(this.biquad.Q);
    }
    return this.biquad.Q.value;
  };
  /**
   * Controls the gain attribute of a Biquad Filter.
   * This is distinctly different from .amp() which is inherited from p5.Effect
   * .amp() controls the volume via the output gain node
   * p5.Filter.gain() controls the gain parameter of a Biquad Filter node.
   *
   * @method gain
   * @param  {Number} gain 
   * @return {Number} Returns the current or updated gain value
   */
  p5.Filter.prototype.gain = function (gain, time) {
    var t = time || 0;
    if (typeof gain === 'number') {
      this.biquad.gain.value = gain;
      this.biquad.gain.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.biquad.gain.linearRampToValueAtTime(gain, this.ac.currentTime + 0.02 + t);
    } else if (gain) {
      gain.connect(this.biquad.gain);
    }
    return this.biquad.gain.value;
  };
  /**
   * Toggle function. Switches between the specified type and allpass
   *
   * @method toggle
   * @return {boolean} [Toggle value]
   */
  p5.Filter.prototype.toggle = function () {
    this._on = !this._on;
    if (this._on === true) {
      this.biquad.type = this._untoggledType;
    } else if (this._on === false) {
      this.biquad.type = 'allpass';
    }
    return this._on;
  };
  /**
   *  Set the type of a p5.Filter. Possible types include:
   *  "lowpass" (default), "highpass", "bandpass",
   *  "lowshelf", "highshelf", "peaking", "notch",
   *  "allpass".
   *
   *  @method  setType
   *  @param {String} t
   */
  p5.Filter.prototype.setType = function (t) {
    this.biquad.type = t;
    this._untoggledType = this.biquad.type;
  };
  p5.Filter.prototype.dispose = function () {
    // remove reference from soundArray
    Effect.prototype.dispose.apply(this);
    if (this.biquad) {
      this.biquad.disconnect();
      delete this.biquad;
    }
  };
  /**
   *  Constructor: <code>new p5.LowPass()</code> Filter.
   *  This is the same as creating a p5.Filter and then calling
   *  its method <code>setType('lowpass')</code>.
   *  See p5.Filter for methods.
   *
   *  @class p5.LowPass
   *  @constructor
   *  @extends p5.Filter
   */
  p5.LowPass = function () {
    p5.Filter.call(this, 'lowpass');
  };
  p5.LowPass.prototype = Object.create(p5.Filter.prototype);
  /**
   *  Constructor: <code>new p5.HighPass()</code> Filter.
   *  This is the same as creating a p5.Filter and then calling
   *  its method <code>setType('highpass')</code>.
   *  See p5.Filter for methods.
   *
   *  @class p5.HighPass
   *  @constructor
   *  @extends p5.Filter
   */
  p5.HighPass = function () {
    p5.Filter.call(this, 'highpass');
  };
  p5.HighPass.prototype = Object.create(p5.Filter.prototype);
  /**
   *  Constructor: <code>new p5.BandPass()</code> Filter.
   *  This is the same as creating a p5.Filter and then calling
   *  its method <code>setType('bandpass')</code>.
   *  See p5.Filter for methods.
   *
   *  @class p5.BandPass
   *  @constructor
   *  @extends p5.Filter
   */
  p5.BandPass = function () {
    p5.Filter.call(this, 'bandpass');
  };
  p5.BandPass.prototype = Object.create(p5.Filter.prototype);
  return p5.Filter;
}(master, effect);
var src_eqFilter;
'use strict';
src_eqFilter = function () {
  var Filter = filter;
  var p5sound = master;
  /**
   *  EQFilter extends p5.Filter with constraints
   *  necessary for the p5.EQ
   *
   *  @private
   */
  var EQFilter = function (freq, res) {
    Filter.call(this, 'peaking');
    this.disconnect();
    this.set(freq, res);
    this.biquad.gain.value = 0;
    delete this.input;
    delete this.output;
    delete this._drywet;
    delete this.wet;
  };
  EQFilter.prototype = Object.create(Filter.prototype);
  EQFilter.prototype.amp = function () {
    console.warn('`amp()` is not available for p5.EQ bands. Use `.gain()`');
  };
  EQFilter.prototype.drywet = function () {
    console.warn('`drywet()` is not available for p5.EQ bands.');
  };
  EQFilter.prototype.connect = function (unit) {
    var u = unit || p5.soundOut.input;
    if (this.biquad) {
      this.biquad.connect(u.input ? u.input : u);
    } else {
      this.output.connect(u.input ? u.input : u);
    }
  };
  EQFilter.prototype.disconnect = function () {
    if (this.biquad) {
      this.biquad.disconnect();
    }
  };
  EQFilter.prototype.dispose = function () {
    // remove reference form soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);
    this.disconnect();
    delete this.biquad;
  };
  return EQFilter;
}(filter, master);
var eq;
'use strict';
eq = function () {
  var Effect = effect;
  var EQFilter = src_eqFilter;
  /**
   * p5.EQ is an audio effect that performs the function of a multiband
   * audio equalizer. Equalization is used to adjust the balance of
   * frequency compoenents of an audio signal. This process is commonly used
   * in sound production and recording to change the waveform before it reaches
   * a sound output device. EQ can also be used as an audio effect to create
   * interesting distortions by filtering out parts of the spectrum. p5.EQ is
   * built using a chain of Web Audio Biquad Filter Nodes and can be
   * instantiated with 3 or 8 bands. Bands can be added or removed from
   * the EQ by directly modifying p5.EQ.bands (the array that stores filters).
   *
   * This class extends <a href = "/reference/#/p5.Effect">p5.Effect</a>.
   * Methods <a href = "/reference/#/p5.Effect/amp">amp()</a>, <a href = "/reference/#/p5.Effect/chain">chain()</a>,
   * <a href = "/reference/#/p5.Effect/drywet">drywet()</a>, <a href = "/reference/#/p5.Effect/connect">connect()</a>, and
   * <a href = "/reference/#/p5.Effect/disconnect">disconnect()</a> are available.
   *
   * @class p5.EQ
   * @constructor
   * @extends p5.Effect
   * @param {Number} [_eqsize] Constructor will accept 3 or 8, defaults to 3
   * @return {Object} p5.EQ object
   *
   * @example
   * <div><code>
   * let eq;
   * let band_names;
   * let band_index;
   *
   * let soundFile, play;
   *
   * function preload() {
   *   soundFormats('mp3', 'ogg');
   *   soundFile = loadSound('assets/beat');
   * }
   *
   * function setup() {
   *   eq = new p5.EQ(3);
   *   soundFile.disconnect();
   *   eq.process(soundFile);
   *
   *   band_names = ['lows','mids','highs'];
   *   band_index = 0;
   *   play = false;
   *   textAlign(CENTER);
   * }
   *
   * function draw() {
   *   background(30);
   *   noStroke();
   *   fill(255);
   *   text('click to kill',50,25);
   *
   *   fill(255, 40, 255);
   *   textSize(26);
   *   text(band_names[band_index],50,55);
   *
   *   fill(255);
   *   textSize(9);
   *   text('space = play/pause',50,80);
   * }
   *
   * //If mouse is over canvas, cycle to the next band and kill the frequency
   * function mouseClicked() {
   *   for (let i = 0; i < eq.bands.length; i++) {
   *     eq.bands[i].gain(0);
   *   }
   *   eq.bands[band_index].gain(-40);
   *   if (mouseX > 0 && mouseX < width && mouseY < height && mouseY > 0) {
   *     band_index === 2 ? band_index = 0 : band_index++;
   *   }
   * }
   * 
   * //use space bar to trigger play / pause
   * function keyPressed() {
   *   if (key===' ') {
   *     play = !play
   *     play ? soundFile.loop() : soundFile.pause();
   *   }
   * }
   * </code></div>
   */
  p5.EQ = function (_eqsize) {
    Effect.call(this);
    //p5.EQ can be of size (3) or (8), defaults to 3
    _eqsize = _eqsize === 3 || _eqsize === 8 ? _eqsize : 3;
    var factor;
    _eqsize === 3 ? factor = Math.pow(2, 3) : factor = 2;
    /**
      *  The p5.EQ is built with abstracted p5.Filter objects.
      *  To modify any bands, use methods of the <a 
      *  href="/reference/#/p5.Filter" title="p5.Filter reference">
      *  p5.Filter</a> API, especially `gain` and `freq`.
      *  Bands are stored in an array, with indices 0 - 3, or 0 - 7
      *  @property {Array}  bands
      *
    */
    this.bands = [];
    var freq, res;
    for (var i = 0; i < _eqsize; i++) {
      if (i === _eqsize - 1) {
        freq = 21000;
        res = 0.01;
      } else if (i === 0) {
        freq = 100;
        res = 0.1;
      } else if (i === 1) {
        freq = _eqsize === 3 ? 360 * factor : 360;
        res = 1;
      } else {
        freq = this.bands[i - 1].freq() * factor;
        res = 1;
      }
      this.bands[i] = this._newBand(freq, res);
      if (i > 0) {
        this.bands[i - 1].connect(this.bands[i].biquad);
      } else {
        this.input.connect(this.bands[i].biquad);
      }
    }
    this.bands[_eqsize - 1].connect(this.output);
  };
  p5.EQ.prototype = Object.create(Effect.prototype);
  /**
   * Process an input by connecting it to the EQ
   * @method  process
   * @param  {Object} src Audio source
   */
  p5.EQ.prototype.process = function (src) {
    src.connect(this.input);
  };
  //  /**
  //   * Set the frequency and gain of each band in the EQ. This method should be
  //   * called with 3 or 8 frequency and gain pairs, depending on the size of the EQ.
  //   * ex. eq.set(freq0, gain0, freq1, gain1, freq2, gain2);
  //   *
  //   * @method  set
  //   * @param {Number} [freq0] Frequency value for band with index 0
  //   * @param {Number} [gain0] Gain value for band with index 0
  //   * @param {Number} [freq1] Frequency value for band with index 1
  //   * @param {Number} [gain1] Gain value for band with index 1
  //   * @param {Number} [freq2] Frequency value for band with index 2
  //   * @param {Number} [gain2] Gain value for band with index 2
  //   * @param {Number} [freq3] Frequency value for band with index 3
  //   * @param {Number} [gain3] Gain value for band with index 3
  //   * @param {Number} [freq4] Frequency value for band with index 4
  //   * @param {Number} [gain4] Gain value for band with index 4
  //   * @param {Number} [freq5] Frequency value for band with index 5
  //   * @param {Number} [gain5] Gain value for band with index 5
  //   * @param {Number} [freq6] Frequency value for band with index 6
  //   * @param {Number} [gain6] Gain value for band with index 6
  //   * @param {Number} [freq7] Frequency value for band with index 7
  //   * @param {Number} [gain7] Gain value for band with index 7
  //   */
  p5.EQ.prototype.set = function () {
    if (arguments.length === this.bands.length * 2) {
      for (var i = 0; i < arguments.length; i += 2) {
        this.bands[i / 2].freq(arguments[i]);
        this.bands[i / 2].gain(arguments[i + 1]);
      }
    } else {
      console.error('Argument mismatch. .set() should be called with ' + this.bands.length * 2 + ' arguments. (one frequency and gain value pair for each band of the eq)');
    }
  };
  /**
   * Add a new band. Creates a p5.Filter and strips away everything but
   * the raw biquad filter. This method returns an abstracted p5.Filter,
   * which can be added to p5.EQ.bands, in order to create new EQ bands.
   * @private
   * @method  _newBand
   * @param  {Number} freq
   * @param  {Number} res
   * @return {Object}      Abstracted Filter
   */
  p5.EQ.prototype._newBand = function (freq, res) {
    return new EQFilter(freq, res);
  };
  p5.EQ.prototype.dispose = function () {
    Effect.prototype.dispose.apply(this);
    if (this.bands) {
      while (this.bands.length > 0) {
        delete this.bands.pop().dispose();
      }
      delete this.bands;
    }
  };
  return p5.EQ;
}(effect, src_eqFilter);
var panner3d;
'use strict';
panner3d = function () {
  var p5sound = master;
  var Effect = effect;
  /**
   * Panner3D is based on the <a title="Web Audio Panner docs"  href=
   * "https://developer.mozilla.org/en-US/docs/Web/API/PannerNode">
   * Web Audio Spatial Panner Node</a>.
   * This panner is a spatial processing node that allows audio to be positioned
   * and oriented in 3D space.
   *
   * The position is relative to an <a title="Web Audio Listener docs" href=
   * "https://developer.mozilla.org/en-US/docs/Web/API/AudioListener">
   * Audio Context Listener</a>, which can be accessed
   * by <code>p5.soundOut.audiocontext.listener</code>
   *
   *
   * @class p5.Panner3D
   * @constructor
   */
  p5.Panner3D = function () {
    Effect.call(this);
    /**
     *  <a title="Web Audio Panner docs"  href=
     *  "https://developer.mozilla.org/en-US/docs/Web/API/PannerNode">
     *  Web Audio Spatial Panner Node</a>
     *
     *  Properties include
     *    -  <a title="w3 spec for Panning Model"
     *    href="https://www.w3.org/TR/webaudio/#idl-def-PanningModelType"
     *    >panningModel</a>: "equal power" or "HRTF"
     *    -  <a title="w3 spec for Distance Model"
     *    href="https://www.w3.org/TR/webaudio/#idl-def-DistanceModelType"
     *    >distanceModel</a>: "linear", "inverse", or "exponential"
     *
     *  @property {AudioNode} panner
     *
     */
    this.panner = this.ac.createPanner();
    this.panner.panningModel = 'HRTF';
    this.panner.distanceModel = 'linear';
    this.panner.connect(this.output);
    this.input.connect(this.panner);
  };
  p5.Panner3D.prototype = Object.create(Effect.prototype);
  /**
   * Connect an audio sorce
   *
   * @method  process
   * @param  {Object} src Input source
   */
  p5.Panner3D.prototype.process = function (src) {
    src.connect(this.input);
  };
  /**
   * Set the X,Y,Z position of the Panner
   * @method set
   * @param  {Number} xVal
   * @param  {Number} yVal
   * @param  {Number} zVal
   * @param  {Number} time
   * @return {Array}      Updated x, y, z values as an array
   */
  p5.Panner3D.prototype.set = function (xVal, yVal, zVal, time) {
    this.positionX(xVal, time);
    this.positionY(yVal, time);
    this.positionZ(zVal, time);
    return [
      this.panner.positionX.value,
      this.panner.positionY.value,
      this.panner.positionZ.value
    ];
  };
  /**
   * Getter and setter methods for position coordinates
   * @method positionX
   * @return {Number}      updated coordinate value
   */
  /**
   * Getter and setter methods for position coordinates
   * @method positionY
   * @return {Number}      updated coordinate value
   */
  /**
   * Getter and setter methods for position coordinates
   * @method positionZ
   * @return {Number}      updated coordinate value
   */
  p5.Panner3D.prototype.positionX = function (xVal, time) {
    var t = time || 0;
    if (typeof xVal === 'number') {
      this.panner.positionX.value = xVal;
      this.panner.positionX.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.panner.positionX.linearRampToValueAtTime(xVal, this.ac.currentTime + 0.02 + t);
    } else if (xVal) {
      xVal.connect(this.panner.positionX);
    }
    return this.panner.positionX.value;
  };
  p5.Panner3D.prototype.positionY = function (yVal, time) {
    var t = time || 0;
    if (typeof yVal === 'number') {
      this.panner.positionY.value = yVal;
      this.panner.positionY.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.panner.positionY.linearRampToValueAtTime(yVal, this.ac.currentTime + 0.02 + t);
    } else if (yVal) {
      yVal.connect(this.panner.positionY);
    }
    return this.panner.positionY.value;
  };
  p5.Panner3D.prototype.positionZ = function (zVal, time) {
    var t = time || 0;
    if (typeof zVal === 'number') {
      this.panner.positionZ.value = zVal;
      this.panner.positionZ.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.panner.positionZ.linearRampToValueAtTime(zVal, this.ac.currentTime + 0.02 + t);
    } else if (zVal) {
      zVal.connect(this.panner.positionZ);
    }
    return this.panner.positionZ.value;
  };
  /**
   * Set the X,Y,Z position of the Panner
   * @method  orient
   * @param  {Number} xVal
   * @param  {Number} yVal
   * @param  {Number} zVal
   * @param  {Number} time
   * @return {Array}      Updated x, y, z values as an array
   */
  p5.Panner3D.prototype.orient = function (xVal, yVal, zVal, time) {
    this.orientX(xVal, time);
    this.orientY(yVal, time);
    this.orientZ(zVal, time);
    return [
      this.panner.orientationX.value,
      this.panner.orientationY.value,
      this.panner.orientationZ.value
    ];
  };
  /**
   * Getter and setter methods for orient coordinates
   * @method orientX
   * @return {Number}      updated coordinate value
   */
  /**
   * Getter and setter methods for orient coordinates
   * @method orientY
   * @return {Number}      updated coordinate value
   */
  /**
   * Getter and setter methods for orient coordinates
   * @method orientZ
   * @return {Number}      updated coordinate value
   */
  p5.Panner3D.prototype.orientX = function (xVal, time) {
    var t = time || 0;
    if (typeof xVal === 'number') {
      this.panner.orientationX.value = xVal;
      this.panner.orientationX.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.panner.orientationX.linearRampToValueAtTime(xVal, this.ac.currentTime + 0.02 + t);
    } else if (xVal) {
      xVal.connect(this.panner.orientationX);
    }
    return this.panner.orientationX.value;
  };
  p5.Panner3D.prototype.orientY = function (yVal, time) {
    var t = time || 0;
    if (typeof yVal === 'number') {
      this.panner.orientationY.value = yVal;
      this.panner.orientationY.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.panner.orientationY.linearRampToValueAtTime(yVal, this.ac.currentTime + 0.02 + t);
    } else if (yVal) {
      yVal.connect(this.panner.orientationY);
    }
    return this.panner.orientationY.value;
  };
  p5.Panner3D.prototype.orientZ = function (zVal, time) {
    var t = time || 0;
    if (typeof zVal === 'number') {
      this.panner.orientationZ.value = zVal;
      this.panner.orientationZ.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.panner.orientationZ.linearRampToValueAtTime(zVal, this.ac.currentTime + 0.02 + t);
    } else if (zVal) {
      zVal.connect(this.panner.orientationZ);
    }
    return this.panner.orientationZ.value;
  };
  /**
   * Set the rolloff factor and max distance
   * @method  setFalloff
   * @param {Number} [maxDistance]
   * @param {Number} [rolloffFactor]
   */
  p5.Panner3D.prototype.setFalloff = function (maxDistance, rolloffFactor) {
    this.maxDist(maxDistance);
    this.rolloff(rolloffFactor);
  };
  /**
   * Maxium distance between the source and the listener
   * @method  maxDist
   * @param  {Number} maxDistance
   * @return {Number} updated value
   */
  p5.Panner3D.prototype.maxDist = function (maxDistance) {
    if (typeof maxDistance === 'number') {
      this.panner.maxDistance = maxDistance;
    }
    return this.panner.maxDistance;
  };
  /**
   * How quickly the volume is reduced as the source moves away from the listener
   * @method  rollof
   * @param  {Number} rolloffFactor
   * @return {Number} updated value
   */
  p5.Panner3D.prototype.rolloff = function (rolloffFactor) {
    if (typeof rolloffFactor === 'number') {
      this.panner.rolloffFactor = rolloffFactor;
    }
    return this.panner.rolloffFactor;
  };
  p5.Panner3D.dispose = function () {
    Effect.prototype.dispose.apply(this);
    if (this.panner) {
      this.panner.disconnect();
      delete this.panner;
    }
  };
  return p5.Panner3D;
}(master, effect);
var listener3d;
'use strict';
listener3d = function () {
  var p5sound = master;
  var Effect = effect;
  //  /**
  //   * listener is a class that can construct both a Spatial Panner
  //   * and a Spatial Listener. The panner is based on the 
  //   * Web Audio Spatial Panner Node
  //   * https://www.w3.org/TR/webaudio/#the-listenernode-interface
  //   * This panner is a spatial processing node that allows audio to be positioned
  //   * and oriented in 3D space. 
  //   *
  //   * The Listener modifies the properties of the Audio Context Listener. 
  //   * Both objects types use the same methods. The default is a spatial panner.
  //   *
  //   * <code>p5.Panner3D</code> - Constructs a Spatial Panner<br/>
  //   * <code>p5.Listener3D</code> - Constructs a Spatial Listener<br/>
  //   *
  //   * @class listener
  //   * @constructor
  //   * @return {Object} p5.Listener3D Object
  //   *
  //   * @param {Web Audio Node} listener Web Audio Spatial Panning Node
  //   * @param {AudioParam} listener.panningModel "equal power" or "HRTF"
  //   * @param {AudioParam} listener.distanceModel "linear", "inverse", or "exponential"
  //   * @param {String} [type] [Specify construction of a spatial panner or listener]
  //   */
  p5.Listener3D = function (type) {
    this.ac = p5sound.audiocontext;
    this.listener = this.ac.listener;
  };
  //  /**
  //   * Connect an audio sorce
  //   * @param  {Object} src Input source
  //   */
  p5.Listener3D.prototype.process = function (src) {
    src.connect(this.input);
  };
  //  /**
  //   * Set the X,Y,Z position of the Panner
  //   * @param  {[Number]} xVal
  //   * @param  {[Number]} yVal
  //   * @param  {[Number]} zVal
  //   * @param  {[Number]} time
  //   * @return {[Array]}      [Updated x, y, z values as an array]
  //   */
  p5.Listener3D.prototype.position = function (xVal, yVal, zVal, time) {
    this.positionX(xVal, time);
    this.positionY(yVal, time);
    this.positionZ(zVal, time);
    return [
      this.listener.positionX.value,
      this.listener.positionY.value,
      this.listener.positionZ.value
    ];
  };
  //  /**
  //   * Getter and setter methods for position coordinates
  //   * @return {Number}      [updated coordinate value]
  //   */
  p5.Listener3D.prototype.positionX = function (xVal, time) {
    var t = time || 0;
    if (typeof xVal === 'number') {
      this.listener.positionX.value = xVal;
      this.listener.positionX.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.listener.positionX.linearRampToValueAtTime(xVal, this.ac.currentTime + 0.02 + t);
    } else if (xVal) {
      xVal.connect(this.listener.positionX);
    }
    return this.listener.positionX.value;
  };
  p5.Listener3D.prototype.positionY = function (yVal, time) {
    var t = time || 0;
    if (typeof yVal === 'number') {
      this.listener.positionY.value = yVal;
      this.listener.positionY.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.listener.positionY.linearRampToValueAtTime(yVal, this.ac.currentTime + 0.02 + t);
    } else if (yVal) {
      yVal.connect(this.listener.positionY);
    }
    return this.listener.positionY.value;
  };
  p5.Listener3D.prototype.positionZ = function (zVal, time) {
    var t = time || 0;
    if (typeof zVal === 'number') {
      this.listener.positionZ.value = zVal;
      this.listener.positionZ.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.listener.positionZ.linearRampToValueAtTime(zVal, this.ac.currentTime + 0.02 + t);
    } else if (zVal) {
      zVal.connect(this.listener.positionZ);
    }
    return this.listener.positionZ.value;
  };
  // cannot define method when class definition is commented
  //  /**
  //   * Overrides the listener orient() method because Listener has slightly
  //   * different params. In human terms, Forward vectors are the direction the 
  //   * nose is pointing. Up vectors are the direction of the top of the head.
  //   *
  //   * @method orient
  //   * @param  {Number} xValF  Forward vector X direction
  //   * @param  {Number} yValF  Forward vector Y direction
  //   * @param  {Number} zValF  Forward vector Z direction
  //   * @param  {Number} xValU  Up vector X direction
  //   * @param  {Number} yValU  Up vector Y direction
  //   * @param  {Number} zValU  Up vector Z direction
  //   * @param  {Number} time  
  //   * @return {Array}       All orienation params
  //   */
  p5.Listener3D.prototype.orient = function (xValF, yValF, zValF, xValU, yValU, zValU, time) {
    if (arguments.length === 3 || arguments.length === 4) {
      time = arguments[3];
      this.orientForward(xValF, yValF, zValF, time);
    } else if (arguments.length === 6 || arguments === 7) {
      this.orientForward(xValF, yValF, zValF);
      this.orientUp(xValU, yValU, zValU, time);
    }
    return [
      this.listener.forwardX.value,
      this.listener.forwardY.value,
      this.listener.forwardZ.value,
      this.listener.upX.value,
      this.listener.upY.value,
      this.listener.upZ.value
    ];
  };
  p5.Listener3D.prototype.orientForward = function (xValF, yValF, zValF, time) {
    this.forwardX(xValF, time);
    this.forwardY(yValF, time);
    this.forwardZ(zValF, time);
    return [
      this.listener.forwardX,
      this.listener.forwardY,
      this.listener.forwardZ
    ];
  };
  p5.Listener3D.prototype.orientUp = function (xValU, yValU, zValU, time) {
    this.upX(xValU, time);
    this.upY(yValU, time);
    this.upZ(zValU, time);
    return [
      this.listener.upX,
      this.listener.upY,
      this.listener.upZ
    ];
  };
  //  /**
  //   * Getter and setter methods for orient coordinates
  //   * @return {Number}      [updated coordinate value]
  //   */
  p5.Listener3D.prototype.forwardX = function (xVal, time) {
    var t = time || 0;
    if (typeof xVal === 'number') {
      this.listener.forwardX.value = xVal;
      this.listener.forwardX.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.listener.forwardX.linearRampToValueAtTime(xVal, this.ac.currentTime + 0.02 + t);
    } else if (xVal) {
      xVal.connect(this.listener.forwardX);
    }
    return this.listener.forwardX.value;
  };
  p5.Listener3D.prototype.forwardY = function (yVal, time) {
    var t = time || 0;
    if (typeof yVal === 'number') {
      this.listener.forwardY.value = yVal;
      this.listener.forwardY.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.listener.forwardY.linearRampToValueAtTime(yVal, this.ac.currentTime + 0.02 + t);
    } else if (yVal) {
      yVal.connect(this.listener.forwardY);
    }
    return this.listener.forwardY.value;
  };
  p5.Listener3D.prototype.forwardZ = function (zVal, time) {
    var t = time || 0;
    if (typeof zVal === 'number') {
      this.listener.forwardZ.value = zVal;
      this.listener.forwardZ.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.listener.forwardZ.linearRampToValueAtTime(zVal, this.ac.currentTime + 0.02 + t);
    } else if (zVal) {
      zVal.connect(this.listener.forwardZ);
    }
    return this.listener.forwardZ.value;
  };
  p5.Listener3D.prototype.upX = function (xVal, time) {
    var t = time || 0;
    if (typeof xVal === 'number') {
      this.listener.upX.value = xVal;
      this.listener.upX.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.listener.upX.linearRampToValueAtTime(xVal, this.ac.currentTime + 0.02 + t);
    } else if (xVal) {
      xVal.connect(this.listener.upX);
    }
    return this.listener.upX.value;
  };
  p5.Listener3D.prototype.upY = function (yVal, time) {
    var t = time || 0;
    if (typeof yVal === 'number') {
      this.listener.upY.value = yVal;
      this.listener.upY.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.listener.upY.linearRampToValueAtTime(yVal, this.ac.currentTime + 0.02 + t);
    } else if (yVal) {
      yVal.connect(this.listener.upY);
    }
    return this.listener.upY.value;
  };
  p5.Listener3D.prototype.upZ = function (zVal, time) {
    var t = time || 0;
    if (typeof zVal === 'number') {
      this.listener.upZ.value = zVal;
      this.listener.upZ.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.listener.upZ.linearRampToValueAtTime(zVal, this.ac.currentTime + 0.02 + t);
    } else if (zVal) {
      zVal.connect(this.listener.upZ);
    }
    return this.listener.upZ.value;
  };
  return p5.Listener3D;
}(master, effect);
var delay;
'use strict';
delay = function () {
  var Filter = filter;
  var Effect = effect;
  /**
   *  Delay is an echo effect. It processes an existing sound source,
   *  and outputs a delayed version of that sound. The p5.Delay can
   *  produce different effects depending on the delayTime, feedback,
   *  filter, and type. In the example below, a feedback of 0.5 (the
   *  defaul value) will produce a looping delay that decreases in
   *  volume by 50% each repeat. A filter will cut out the high
   *  frequencies so that the delay does not sound as piercing as the
   *  original source.
   *
   *
   *  This class extends <a href = "/reference/#/p5.Effect">p5.Effect</a>.
   *  Methods <a href = "/reference/#/p5.Effect/amp">amp()</a>, <a href = "/reference/#/p5.Effect/chain">chain()</a>,
   *  <a href = "/reference/#/p5.Effect/drywet">drywet()</a>, <a href = "/reference/#/p5.Effect/connect">connect()</a>, and
   *  <a href = "/reference/#/p5.Effect/disconnect">disconnect()</a> are available.
   *  @class p5.Delay
   *  @extends p5.Effect
   *  @constructor
   *  @example
   *  <div><code>
   *  let noise, env, delay;
   *
   *  function setup() {
   *    background(0);
   *    noStroke();
   *    fill(255);
   *    textAlign(CENTER);
   *    text('click to play', width/2, height/2);
   *
   *    noise = new p5.Noise('brown');
   *    noise.amp(0);
   *    noise.start();
   *
   *    delay = new p5.Delay();
   *
   *    // delay.process() accepts 4 parameters:
   *    // source, delayTime, feedback, filter frequency
   *    // play with these numbers!!
   *    delay.process(noise, .12, .7, 2300);
   *
   *    // play the noise with an envelope,
   *    // a series of fades ( time / value pairs )
   *    env = new p5.Envelope(.01, 0.2, .2, .1);
   *  }
   *
   *  // mouseClick triggers envelope
   *  function mouseClicked() {
   *    // is mouse over canvas?
   *    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
   *      env.play(noise);
   *    }
   *  }
   *  </code></div>
   */
  p5.Delay = function () {
    Effect.call(this);
    this._split = this.ac.createChannelSplitter(2);
    this._merge = this.ac.createChannelMerger(2);
    this._leftGain = this.ac.createGain();
    this._rightGain = this.ac.createGain();
    /**
     *  The p5.Delay is built with two
     *  <a href="http://www.w3.org/TR/webaudio/#DelayNode">
     *  Web Audio Delay Nodes</a>, one for each stereo channel.
     *
     *  @property {DelayNode} leftDelay
     */
    this.leftDelay = this.ac.createDelay();
    /**
     *  The p5.Delay is built with two
     *  <a href="http://www.w3.org/TR/webaudio/#DelayNode">
     *  Web Audio Delay Nodes</a>, one for each stereo channel.
     *
     *  @property {DelayNode} rightDelay
     */
    this.rightDelay = this.ac.createDelay();
    this._leftFilter = new Filter();
    this._rightFilter = new Filter();
    this._leftFilter.disconnect();
    this._rightFilter.disconnect();
    this._leftFilter.biquad.frequency.setValueAtTime(1200, this.ac.currentTime);
    this._rightFilter.biquad.frequency.setValueAtTime(1200, this.ac.currentTime);
    this._leftFilter.biquad.Q.setValueAtTime(0.3, this.ac.currentTime);
    this._rightFilter.biquad.Q.setValueAtTime(0.3, this.ac.currentTime);
    // graph routing
    this.input.connect(this._split);
    this.leftDelay.connect(this._leftGain);
    this.rightDelay.connect(this._rightGain);
    this._leftGain.connect(this._leftFilter.input);
    this._rightGain.connect(this._rightFilter.input);
    this._merge.connect(this.wet);
    this._leftFilter.biquad.gain.setValueAtTime(1, this.ac.currentTime);
    this._rightFilter.biquad.gain.setValueAtTime(1, this.ac.currentTime);
    // default routing
    this.setType(0);
    this._maxDelay = this.leftDelay.delayTime.maxValue;
    // set initial feedback to 0.5
    this.feedback(0.5);
  };
  p5.Delay.prototype = Object.create(Effect.prototype);
  /**
   *  Add delay to an audio signal according to a set
   *  of delay parameters.
   *
   *  @method  process
   *  @param  {Object} Signal  An object that outputs audio
   *  @param  {Number} [delayTime] Time (in seconds) of the delay/echo.
   *                               Some browsers limit delayTime to
   *                               1 second.
   *  @param  {Number} [feedback]  sends the delay back through itself
   *                               in a loop that decreases in volume
   *                               each time.
   *  @param  {Number} [lowPass]   Cutoff frequency. Only frequencies
   *                               below the lowPass will be part of the
   *                               delay.
   */
  p5.Delay.prototype.process = function (src, _delayTime, _feedback, _filter) {
    var feedback = _feedback || 0;
    var delayTime = _delayTime || 0;
    if (feedback >= 1) {
      throw new Error('Feedback value will force a positive feedback loop.');
    }
    if (delayTime >= this._maxDelay) {
      throw new Error('Delay Time exceeds maximum delay time of ' + this._maxDelay + ' second.');
    }
    src.connect(this.input);
    this.leftDelay.delayTime.setValueAtTime(delayTime, this.ac.currentTime);
    this.rightDelay.delayTime.setValueAtTime(delayTime, this.ac.currentTime);
    this._leftGain.gain.value = feedback;
    this._rightGain.gain.value = feedback;
    if (_filter) {
      this._leftFilter.freq(_filter);
      this._rightFilter.freq(_filter);
    }
  };
  /**
   *  Set the delay (echo) time, in seconds. Usually this value will be
   *  a floating point number between 0.0 and 1.0.
   *
   *  @method  delayTime
   *  @param {Number} delayTime Time (in seconds) of the delay
   */
  p5.Delay.prototype.delayTime = function (t) {
    // if t is an audio node...
    if (typeof t !== 'number') {
      t.connect(this.leftDelay.delayTime);
      t.connect(this.rightDelay.delayTime);
    } else {
      this.leftDelay.delayTime.cancelScheduledValues(this.ac.currentTime);
      this.rightDelay.delayTime.cancelScheduledValues(this.ac.currentTime);
      this.leftDelay.delayTime.linearRampToValueAtTime(t, this.ac.currentTime);
      this.rightDelay.delayTime.linearRampToValueAtTime(t, this.ac.currentTime);
    }
  };
  /**
   *  Feedback occurs when Delay sends its signal back through its input
   *  in a loop. The feedback amount determines how much signal to send each
   *  time through the loop. A feedback greater than 1.0 is not desirable because
   *  it will increase the overall output each time through the loop,
   *  creating an infinite feedback loop. The default value is 0.5
   *
   *  @method  feedback
   *  @param {Number|Object} feedback 0.0 to 1.0, or an object such as an
   *                                  Oscillator that can be used to
   *                                  modulate this param
   *  @returns {Number} Feedback value
   *
   */
  p5.Delay.prototype.feedback = function (f) {
    // if f is an audio node...
    if (f && typeof f !== 'number') {
      f.connect(this._leftGain.gain);
      f.connect(this._rightGain.gain);
    } else if (f >= 1) {
      throw new Error('Feedback value will force a positive feedback loop.');
    } else if (typeof f === 'number') {
      this._leftGain.gain.value = f;
      this._rightGain.gain.value = f;
    }
    // return value of feedback
    return this._leftGain.gain.value;
  };
  /**
   *  Set a lowpass filter frequency for the delay. A lowpass filter
   *  will cut off any frequencies higher than the filter frequency.
   *
   *  @method  filter
   *  @param {Number|Object} cutoffFreq  A lowpass filter will cut off any
   *                              frequencies higher than the filter frequency.
   *  @param {Number|Object} res  Resonance of the filter frequency
   *                              cutoff, or an object (i.e. a p5.Oscillator)
   *                              that can be used to modulate this parameter.
   *                              High numbers (i.e. 15) will produce a resonance,
   *                              low numbers (i.e. .2) will produce a slope.
   */
  p5.Delay.prototype.filter = function (freq, q) {
    this._leftFilter.set(freq, q);
    this._rightFilter.set(freq, q);
  };
  /**
   *  Choose a preset type of delay. 'pingPong' bounces the signal
   *  from the left to the right channel to produce a stereo effect.
   *  Any other parameter will revert to the default delay setting.
   *
   *  @method  setType
   *  @param {String|Number} type 'pingPong' (1) or 'default' (0)
   */
  p5.Delay.prototype.setType = function (t) {
    if (t === 1) {
      t = 'pingPong';
    }
    this._split.disconnect();
    this._leftFilter.disconnect();
    this._rightFilter.disconnect();
    this._split.connect(this.leftDelay, 0);
    this._split.connect(this.rightDelay, 1);
    switch (t) {
    case 'pingPong':
      this._rightFilter.setType(this._leftFilter.biquad.type);
      this._leftFilter.output.connect(this._merge, 0, 0);
      this._rightFilter.output.connect(this._merge, 0, 1);
      this._leftFilter.output.connect(this.rightDelay);
      this._rightFilter.output.connect(this.leftDelay);
      break;
    default:
      this._leftFilter.output.connect(this._merge, 0, 0);
      this._rightFilter.output.connect(this._merge, 0, 1);
      this._leftFilter.output.connect(this.leftDelay);
      this._rightFilter.output.connect(this.rightDelay);
    }
  };
  // DocBlocks for methods inherited from p5.Effect
  /**
   *  Set the output level of the delay effect.
   *
   *  @method  amp
   *  @param  {Number} volume amplitude between 0 and 1.0
   *  @param {Number} [rampTime] create a fade that lasts rampTime
   *  @param {Number} [timeFromNow] schedule this event to happen
   *                                seconds from now
   */
  /**
   *  Send output to a p5.sound or web audio object
   *
   *  @method  connect
   *  @param  {Object} unit
   */
  /**
   *  Disconnect all output.
   *
   *  @method disconnect
   */
  p5.Delay.prototype.dispose = function () {
    Effect.prototype.dispose.apply(this);
    this._split.disconnect();
    this._leftFilter.dispose();
    this._rightFilter.dispose();
    this._merge.disconnect();
    this._leftGain.disconnect();
    this._rightGain.disconnect();
    this.leftDelay.disconnect();
    this.rightDelay.disconnect();
    this._split = undefined;
    this._leftFilter = undefined;
    this._rightFilter = undefined;
    this._merge = undefined;
    this._leftGain = undefined;
    this._rightGain = undefined;
    this.leftDelay = undefined;
    this.rightDelay = undefined;
  };
}(filter, effect);
var reverb;
'use strict';
reverb = function () {
  var CustomError = errorHandler;
  var Effect = effect;
  /**
   *  Reverb adds depth to a sound through a large number of decaying
   *  echoes. It creates the perception that sound is occurring in a
   *  physical space. The p5.Reverb has paramters for Time (how long does the
   *  reverb last) and decayRate (how much the sound decays with each echo)
   *  that can be set with the .set() or .process() methods. The p5.Convolver
   *  extends p5.Reverb allowing you to recreate the sound of actual physical
   *  spaces through convolution.
   *
   *  This class extends <a href = "/reference/#/p5.Effect">p5.Effect</a>.
   *  Methods <a href = "/reference/#/p5.Effect/amp">amp()</a>, <a href = "/reference/#/p5.Effect/chain">chain()</a>,
   *  <a href = "/reference/#/p5.Effect/drywet">drywet()</a>, <a href = "/reference/#/p5.Effect/connect">connect()</a>, and
   *  <a href = "/reference/#/p5.Effect/disconnect">disconnect()</a> are available.
   *
   *  @class p5.Reverb
   *  @extends p5.Effect
   *  @constructor
   *  @example
   *  <div><code>
   *  let soundFile, reverb;
   *  function preload() {
   *    soundFile = loadSound('assets/Damscray_DancingTiger.mp3');
   *  }
   *
   *  function setup() {
   *    reverb = new p5.Reverb();
   *    soundFile.disconnect(); // so we'll only hear reverb...
   *
   *    // connect soundFile to reverb, process w/
   *    // 3 second reverbTime, decayRate of 2%
   *    reverb.process(soundFile, 3, 2);
   *    soundFile.play();
   *  }
   *  </code></div>
   */
  p5.Reverb = function () {
    Effect.call(this);
    this._initConvolverNode();
    // otherwise, Safari distorts
    this.input.gain.value = 0.5;
    // default params
    this._seconds = 3;
    this._decay = 2;
    this._reverse = false;
    this._buildImpulse();
  };
  p5.Reverb.prototype = Object.create(Effect.prototype);
  p5.Reverb.prototype._initConvolverNode = function () {
    this.convolverNode = this.ac.createConvolver();
    this.input.connect(this.convolverNode);
    this.convolverNode.connect(this.wet);
  };
  p5.Reverb.prototype._teardownConvolverNode = function () {
    if (this.convolverNode) {
      this.convolverNode.disconnect();
      delete this.convolverNode;
    }
  };
  p5.Reverb.prototype._setBuffer = function (audioBuffer) {
    this._teardownConvolverNode();
    this._initConvolverNode();
    this.convolverNode.buffer = audioBuffer;
  };
  /**
   *  Connect a source to the reverb, and assign reverb parameters.
   *
   *  @method  process
   *  @param  {Object} src     p5.sound / Web Audio object with a sound
   *                           output.
   *  @param  {Number} [seconds] Duration of the reverb, in seconds.
   *                           Min: 0, Max: 10. Defaults to 3.
   *  @param  {Number} [decayRate] Percentage of decay with each echo.
   *                            Min: 0, Max: 100. Defaults to 2.
   *  @param  {Boolean} [reverse] Play the reverb backwards or forwards.
   */
  p5.Reverb.prototype.process = function (src, seconds, decayRate, reverse) {
    src.connect(this.input);
    var rebuild = false;
    if (seconds) {
      this._seconds = seconds;
      rebuild = true;
    }
    if (decayRate) {
      this._decay = decayRate;
    }
    if (reverse) {
      this._reverse = reverse;
    }
    if (rebuild) {
      this._buildImpulse();
    }
  };
  /**
   *  Set the reverb settings. Similar to .process(), but without
   *  assigning a new input.
   *
   *  @method  set
   *  @param  {Number} [seconds] Duration of the reverb, in seconds.
   *                           Min: 0, Max: 10. Defaults to 3.
   *  @param  {Number} [decayRate] Percentage of decay with each echo.
   *                            Min: 0, Max: 100. Defaults to 2.
   *  @param  {Boolean} [reverse] Play the reverb backwards or forwards.
   */
  p5.Reverb.prototype.set = function (seconds, decayRate, reverse) {
    var rebuild = false;
    if (seconds) {
      this._seconds = seconds;
      rebuild = true;
    }
    if (decayRate) {
      this._decay = decayRate;
    }
    if (reverse) {
      this._reverse = reverse;
    }
    if (rebuild) {
      this._buildImpulse();
    }
  };
  // DocBlocks for methods inherited from p5.Effect
  /**
   *  Set the output level of the reverb effect.
   *
   *  @method  amp
   *  @param  {Number} volume amplitude between 0 and 1.0
   *  @param  {Number} [rampTime] create a fade that lasts rampTime
   *  @param  {Number} [timeFromNow] schedule this event to happen
   *                                seconds from now
   */
  /**
   *  Send output to a p5.sound or web audio object
   *
   *  @method  connect
   *  @param  {Object} unit
   */
  /**
   *  Disconnect all output.
   *
   *  @method disconnect
   */
  /**
   *  Inspired by Simple Reverb by Jordan Santell
   *  https://github.com/web-audio-components/simple-reverb/blob/master/index.js
   *
   *  Utility function for building an impulse response
   *  based on the module parameters.
   *
   *  @private
   */
  p5.Reverb.prototype._buildImpulse = function () {
    var rate = this.ac.sampleRate;
    var length = rate * this._seconds;
    var decay = this._decay;
    var impulse = this.ac.createBuffer(2, length, rate);
    var impulseL = impulse.getChannelData(0);
    var impulseR = impulse.getChannelData(1);
    var n, i;
    for (i = 0; i < length; i++) {
      n = this._reverse ? length - i : i;
      impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
      impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    }
    this._setBuffer(impulse);
  };
  p5.Reverb.prototype.dispose = function () {
    Effect.prototype.dispose.apply(this);
    this._teardownConvolverNode();
  };
  // =======================================================================
  //                          *** p5.Convolver ***
  // =======================================================================
  /**
   *  <p>p5.Convolver extends p5.Reverb. It can emulate the sound of real
   *  physical spaces through a process called <a href="
   *  https://en.wikipedia.org/wiki/Convolution_reverb#Real_space_simulation">
   *  convolution</a>.</p>
   *
   *  <p>Convolution multiplies any audio input by an "impulse response"
   *  to simulate the dispersion of sound over time. The impulse response is
   *  generated from an audio file that you provide. One way to
   *  generate an impulse response is to pop a balloon in a reverberant space
   *  and record the echo. Convolution can also be used to experiment with
   *  sound.</p>
   *
   *  <p>Use the method <code>createConvolution(path)</code> to instantiate a
   *  p5.Convolver with a path to your impulse response audio file.</p>
   *
   *  @class p5.Convolver
   *  @extends p5.Effect
   *  @constructor
   *  @param  {String}   path     path to a sound file
   *  @param  {Function} [callback] function to call when loading succeeds
   *  @param  {Function} [errorCallback] function to call if loading fails.
   *                                     This function will receive an error or
   *                                     XMLHttpRequest object with information
   *                                     about what went wrong.
   *  @example
   *  <div><code>
   *  let cVerb, sound;
   *  function preload() {
   *    // We have both MP3 and OGG versions of all sound assets
   *    soundFormats('ogg', 'mp3');
   *
   *    // Try replacing 'bx-spring' with other soundfiles like
   *    // 'concrete-tunnel' 'small-plate' 'drum' 'beatbox'
   *    cVerb = createConvolver('assets/bx-spring.mp3');
   *
   *    // Try replacing 'Damscray_DancingTiger' with
   *    // 'beat', 'doorbell', lucky_dragons_-_power_melody'
   *    sound = loadSound('assets/Damscray_DancingTiger.mp3');
   *  }
   *
   *  function setup() {
   *    // disconnect from master output...
   *    sound.disconnect();
   *
   *    // ...and process with cVerb
   *    // so that we only hear the convolution
   *    cVerb.process(sound);
   *
   *    sound.play();
   *  }
   *  </code></div>
   */
  p5.Convolver = function (path, callback, errorCallback) {
    p5.Reverb.call(this);
    /**
     *  Internally, the p5.Convolver uses the a
     *  <a href="http://www.w3.org/TR/webaudio/#ConvolverNode">
     *  Web Audio Convolver Node</a>.
     *
     *  @property {ConvolverNode} convolverNode
     */
    this._initConvolverNode();
    // otherwise, Safari distorts
    this.input.gain.value = 0.5;
    if (path) {
      this.impulses = [];
      this._loadBuffer(path, callback, errorCallback);
    } else {
      // parameters
      this._seconds = 3;
      this._decay = 2;
      this._reverse = false;
      this._buildImpulse();
    }
  };
  p5.Convolver.prototype = Object.create(p5.Reverb.prototype);
  p5.prototype.registerPreloadMethod('createConvolver', p5.prototype);
  /**
   *  Create a p5.Convolver. Accepts a path to a soundfile
   *  that will be used to generate an impulse response.
   *
   *  @method  createConvolver
   *  @param  {String}   path     path to a sound file
   *  @param  {Function} [callback] function to call if loading is successful.
   *                                The object will be passed in as the argument
   *                                to the callback function.
   *  @param  {Function} [errorCallback] function to call if loading is not successful.
   *                                A custom error will be passed in as the argument
   *                                to the callback function.
   *  @return {p5.Convolver}
   *  @example
   *  <div><code>
   *  let cVerb, sound;
   *  function preload() {
   *    // We have both MP3 and OGG versions of all sound assets
   *    soundFormats('ogg', 'mp3');
   *
   *    // Try replacing 'bx-spring' with other soundfiles like
   *    // 'concrete-tunnel' 'small-plate' 'drum' 'beatbox'
   *    cVerb = createConvolver('assets/bx-spring.mp3');
   *
   *    // Try replacing 'Damscray_DancingTiger' with
   *    // 'beat', 'doorbell', lucky_dragons_-_power_melody'
   *    sound = loadSound('assets/Damscray_DancingTiger.mp3');
   *  }
   *
   *  function setup() {
   *    // disconnect from master output...
   *    sound.disconnect();
   *
   *    // ...and process with cVerb
   *    // so that we only hear the convolution
   *    cVerb.process(sound);
   *
   *    sound.play();
   *  }
   *  </code></div>
   */
  p5.prototype.createConvolver = function (path, callback, errorCallback) {
    // if loading locally without a server
    if (window.location.origin.indexOf('file://') > -1 && window.cordova === 'undefined') {
      alert('This sketch may require a server to load external files. Please see http://bit.ly/1qcInwS');
    }
    var self = this;
    var cReverb = new p5.Convolver(path, function (buffer) {
      if (typeof callback === 'function') {
        callback(buffer);
      }
      if (typeof self._decrementPreload === 'function') {
        self._decrementPreload();
      }
    }, errorCallback);
    cReverb.impulses = [];
    return cReverb;
  };
  /**
   *  Private method to load a buffer as an Impulse Response,
   *  assign it to the convolverNode, and add to the Array of .impulses.
   *
   *  @param   {String}   path
   *  @param   {Function} callback
   *  @param   {Function} errorCallback
   *  @private
   */
  p5.Convolver.prototype._loadBuffer = function (path, callback, errorCallback) {
    var path = p5.prototype._checkFileFormats(path);
    var self = this;
    var errorTrace = new Error().stack;
    var ac = p5.prototype.getAudioContext();
    var request = new XMLHttpRequest();
    request.open('GET', path, true);
    request.responseType = 'arraybuffer';
    request.onload = function () {
      if (request.status === 200) {
        // on success loading file:
        ac.decodeAudioData(request.response, function (buff) {
          var buffer = {};
          var chunks = path.split('/');
          buffer.name = chunks[chunks.length - 1];
          buffer.audioBuffer = buff;
          self.impulses.push(buffer);
          self._setBuffer(buffer.audioBuffer);
          if (callback) {
            callback(buffer);
          }
        }, // error decoding buffer. "e" is undefined in Chrome 11/22/2015
        function () {
          var err = new CustomError('decodeAudioData', errorTrace, self.url);
          var msg = 'AudioContext error at decodeAudioData for ' + self.url;
          if (errorCallback) {
            err.msg = msg;
            errorCallback(err);
          } else {
            console.error(msg + '\n The error stack trace includes: \n' + err.stack);
          }
        });
      } else {
        var err = new CustomError('loadConvolver', errorTrace, self.url);
        var msg = 'Unable to load ' + self.url + '. The request status was: ' + request.status + ' (' + request.statusText + ')';
        if (errorCallback) {
          err.message = msg;
          errorCallback(err);
        } else {
          console.error(msg + '\n The error stack trace includes: \n' + err.stack);
        }
      }
    };
    // if there is another error, aside from 404...
    request.onerror = function () {
      var err = new CustomError('loadConvolver', errorTrace, self.url);
      var msg = 'There was no response from the server at ' + self.url + '. Check the url and internet connectivity.';
      if (errorCallback) {
        err.message = msg;
        errorCallback(err);
      } else {
        console.error(msg + '\n The error stack trace includes: \n' + err.stack);
      }
    };
    request.send();
  };
  p5.Convolver.prototype.set = null;
  /**
   *  Connect a source to the reverb, and assign reverb parameters.
   *
   *  @method  process
   *  @param  {Object} src     p5.sound / Web Audio object with a sound
   *                           output.
   *  @example
   *  <div><code>
   *  let cVerb, sound;
   *  function preload() {
   *    soundFormats('ogg', 'mp3');
   *
   *    cVerb = createConvolver('assets/concrete-tunnel.mp3');
   *
   *    sound = loadSound('assets/beat.mp3');
   *  }
   *
   *  function setup() {
   *    // disconnect from master output...
   *    sound.disconnect();
   *
   *    // ...and process with (i.e. connect to) cVerb
   *    // so that we only hear the convolution
   *    cVerb.process(sound);
   *
   *    sound.play();
   *  }
   *  </code></div>
   */
  p5.Convolver.prototype.process = function (src) {
    src.connect(this.input);
  };
  /**
   *  If you load multiple impulse files using the .addImpulse method,
   *  they will be stored as Objects in this Array. Toggle between them
   *  with the <code>toggleImpulse(id)</code> method.
   *
   *  @property {Array} impulses
   */
  p5.Convolver.prototype.impulses = [];
  /**
   *  Load and assign a new Impulse Response to the p5.Convolver.
   *  The impulse is added to the <code>.impulses</code> array. Previous
   *  impulses can be accessed with the <code>.toggleImpulse(id)</code>
   *  method.
   *
   *  @method  addImpulse
   *  @param  {String}   path     path to a sound file
   *  @param  {Function} callback function (optional)
   *  @param  {Function} errorCallback function (optional)
   */
  p5.Convolver.prototype.addImpulse = function (path, callback, errorCallback) {
    // if loading locally without a server
    if (window.location.origin.indexOf('file://') > -1 && window.cordova === 'undefined') {
      alert('This sketch may require a server to load external files. Please see http://bit.ly/1qcInwS');
    }
    this._loadBuffer(path, callback, errorCallback);
  };
  /**
   *  Similar to .addImpulse, except that the <code>.impulses</code>
   *  Array is reset to save memory. A new <code>.impulses</code>
   *  array is created with this impulse as the only item.
   *
   *  @method  resetImpulse
   *  @param  {String}   path     path to a sound file
   *  @param  {Function} callback function (optional)
   *  @param  {Function} errorCallback function (optional)
   */
  p5.Convolver.prototype.resetImpulse = function (path, callback, errorCallback) {
    // if loading locally without a server
    if (window.location.origin.indexOf('file://') > -1 && window.cordova === 'undefined') {
      alert('This sketch may require a server to load external files. Please see http://bit.ly/1qcInwS');
    }
    this.impulses = [];
    this._loadBuffer(path, callback, errorCallback);
  };
  /**
   *  If you have used <code>.addImpulse()</code> to add multiple impulses
   *  to a p5.Convolver, then you can use this method to toggle between
   *  the items in the <code>.impulses</code> Array. Accepts a parameter
   *  to identify which impulse you wish to use, identified either by its
   *  original filename (String) or by its position in the <code>.impulses
   *  </code> Array (Number).<br/>
   *  You can access the objects in the .impulses Array directly. Each
   *  Object has two attributes: an <code>.audioBuffer</code> (type:
   *  Web Audio <a href="
   *  http://webaudio.github.io/web-audio-api/#the-audiobuffer-interface">
   *  AudioBuffer)</a> and a <code>.name</code>, a String that corresponds
   *  with the original filename.
   *
   *  @method toggleImpulse
   *  @param {String|Number} id Identify the impulse by its original filename
   *                            (String), or by its position in the
   *                            <code>.impulses</code> Array (Number).
   */
  p5.Convolver.prototype.toggleImpulse = function (id) {
    if (typeof id === 'number' && id < this.impulses.length) {
      this._setBuffer(this.impulses[id].audioBuffer);
    }
    if (typeof id === 'string') {
      for (var i = 0; i < this.impulses.length; i++) {
        if (this.impulses[i].name === id) {
          this._setBuffer(this.impulses[i].audioBuffer);
          break;
        }
      }
    }
  };
  p5.Convolver.prototype.dispose = function () {
    p5.Reverb.prototype.dispose.apply(this);
    // remove all the Impulse Response buffers
    for (var i in this.impulses) {
      if (this.impulses[i]) {
        this.impulses[i] = null;
      }
    }
  };
}(errorHandler, effect);
/** Tone.js module by Yotam Mann, MIT License 2016  http://opensource.org/licenses/MIT **/
var Tone_core_TimelineState;
Tone_core_TimelineState = function (Tone) {
  'use strict';
  Tone.TimelineState = function (initial) {
    Tone.Timeline.call(this);
    this._initial = initial;
  };
  Tone.extend(Tone.TimelineState, Tone.Timeline);
  Tone.TimelineState.prototype.getValueAtTime = function (time) {
    var event = this.get(time);
    if (event !== null) {
      return event.state;
    } else {
      return this._initial;
    }
  };
  Tone.TimelineState.prototype.setStateAtTime = function (state, time) {
    this.add({
      'state': state,
      'time': time
    });
  };
  return Tone.TimelineState;
}(Tone_core_Tone, Tone_core_Timeline);
/** Tone.js module by Yotam Mann, MIT License 2016  http://opensource.org/licenses/MIT **/
var Tone_core_Clock;
Tone_core_Clock = function (Tone) {
  'use strict';
  Tone.Clock = function () {
    Tone.Emitter.call(this);
    var options = this.optionsObject(arguments, [
      'callback',
      'frequency'
    ], Tone.Clock.defaults);
    this.callback = options.callback;
    this._nextTick = 0;
    this._lastState = Tone.State.Stopped;
    this.frequency = new Tone.TimelineSignal(options.frequency, Tone.Type.Frequency);
    this._readOnly('frequency');
    this.ticks = 0;
    this._state = new Tone.TimelineState(Tone.State.Stopped);
    this._boundLoop = this._loop.bind(this);
    this.context.on('tick', this._boundLoop);
  };
  Tone.extend(Tone.Clock, Tone.Emitter);
  Tone.Clock.defaults = {
    'callback': Tone.noOp,
    'frequency': 1,
    'lookAhead': 'auto'
  };
  Object.defineProperty(Tone.Clock.prototype, 'state', {
    get: function () {
      return this._state.getValueAtTime(this.now());
    }
  });
  Tone.Clock.prototype.start = function (time, offset) {
    time = this.toSeconds(time);
    if (this._state.getValueAtTime(time) !== Tone.State.Started) {
      this._state.add({
        'state': Tone.State.Started,
        'time': time,
        'offset': offset
      });
    }
    return this;
  };
  Tone.Clock.prototype.stop = function (time) {
    time = this.toSeconds(time);
    this._state.cancel(time);
    this._state.setStateAtTime(Tone.State.Stopped, time);
    return this;
  };
  Tone.Clock.prototype.pause = function (time) {
    time = this.toSeconds(time);
    if (this._state.getValueAtTime(time) === Tone.State.Started) {
      this._state.setStateAtTime(Tone.State.Paused, time);
    }
    return this;
  };
  Tone.Clock.prototype._loop = function () {
    var now = this.now();
    var lookAhead = this.context.lookAhead;
    var updateInterval = this.context.updateInterval;
    var lagCompensation = this.context.lag * 2;
    var loopInterval = now + lookAhead + updateInterval + lagCompensation;
    while (loopInterval > this._nextTick && this._state) {
      var currentState = this._state.getValueAtTime(this._nextTick);
      if (currentState !== this._lastState) {
        this._lastState = currentState;
        var event = this._state.get(this._nextTick);
        if (currentState === Tone.State.Started) {
          this._nextTick = event.time;
          if (!this.isUndef(event.offset)) {
            this.ticks = event.offset;
          }
          this.emit('start', event.time, this.ticks);
        } else if (currentState === Tone.State.Stopped) {
          this.ticks = 0;
          this.emit('stop', event.time);
        } else if (currentState === Tone.State.Paused) {
          this.emit('pause', event.time);
        }
      }
      var tickTime = this._nextTick;
      if (this.frequency) {
        this._nextTick += 1 / this.frequency.getValueAtTime(this._nextTick);
        if (currentState === Tone.State.Started) {
          this.callback(tickTime);
          this.ticks++;
        }
      }
    }
  };
  Tone.Clock.prototype.getStateAtTime = function (time) {
    time = this.toSeconds(time);
    return this._state.getValueAtTime(time);
  };
  Tone.Clock.prototype.dispose = function () {
    Tone.Emitter.prototype.dispose.call(this);
    this.context.off('tick', this._boundLoop);
    this._writable('frequency');
    this.frequency.dispose();
    this.frequency = null;
    this._boundLoop = null;
    this._nextTick = Infinity;
    this.callback = null;
    this._state.dispose();
    this._state = null;
  };
  return Tone.Clock;
}(Tone_core_Tone, Tone_signal_TimelineSignal, Tone_core_TimelineState, Tone_core_Emitter);
var metro;
'use strict';
metro = function () {
  var p5sound = master;
  // requires the Tone.js library's Clock (MIT license, Yotam Mann)
  // https://github.com/TONEnoTONE/Tone.js/
  var Clock = Tone_core_Clock;
  p5.Metro = function () {
    this.clock = new Clock({ 'callback': this.ontick.bind(this) });
    this.syncedParts = [];
    this.bpm = 120;
    // gets overridden by p5.Part
    this._init();
    this.prevTick = 0;
    this.tatumTime = 0;
    this.tickCallback = function () {
    };
  };
  p5.Metro.prototype.ontick = function (tickTime) {
    var elapsedTime = tickTime - this.prevTick;
    var secondsFromNow = tickTime - p5sound.audiocontext.currentTime;
    if (elapsedTime - this.tatumTime <= -0.02) {
      return;
    } else {
      // console.log('ok', this.syncedParts[0].phrases[0].name);
      this.prevTick = tickTime;
      // for all of the active things on the metro:
      var self = this;
      this.syncedParts.forEach(function (thisPart) {
        if (!thisPart.isPlaying)
          return;
        thisPart.incrementStep(secondsFromNow);
        // each synced source keeps track of its own beat number
        thisPart.phrases.forEach(function (thisPhrase) {
          var phraseArray = thisPhrase.sequence;
          var bNum = self.metroTicks % phraseArray.length;
          if (phraseArray[bNum] !== 0 && (self.metroTicks < phraseArray.length || !thisPhrase.looping)) {
            thisPhrase.callback(secondsFromNow, phraseArray[bNum]);
          }
        });
      });
      this.metroTicks += 1;
      this.tickCallback(secondsFromNow);
    }
  };
  p5.Metro.prototype.setBPM = function (bpm, rampTime) {
    var beatTime = 60 / (bpm * this.tatums);
    var now = p5sound.audiocontext.currentTime;
    this.tatumTime = beatTime;
    var rampTime = rampTime || 0;
    this.clock.frequency.setValueAtTime(this.clock.frequency.value, now);
    this.clock.frequency.linearRampToValueAtTime(bpm, now + rampTime);
    this.bpm = bpm;
  };
  p5.Metro.prototype.getBPM = function () {
    return this.clock.getRate() / this.tatums * 60;
  };
  p5.Metro.prototype._init = function () {
    this.metroTicks = 0;
  };
  // clear existing synced parts, add only this one
  p5.Metro.prototype.resetSync = function (part) {
    this.syncedParts = [part];
  };
  // push a new synced part to the array
  p5.Metro.prototype.pushSync = function (part) {
    this.syncedParts.push(part);
  };
  p5.Metro.prototype.start = function (timeFromNow) {
    var t = timeFromNow || 0;
    var now = p5sound.audiocontext.currentTime;
    this.clock.start(now + t);
    this.setBPM(this.bpm);
  };
  p5.Metro.prototype.stop = function (timeFromNow) {
    var t = timeFromNow || 0;
    var now = p5sound.audiocontext.currentTime;
    this.clock.stop(now + t);
  };
  p5.Metro.prototype.beatLength = function (tatums) {
    this.tatums = 1 / tatums / 4;
  };
}(master, Tone_core_Clock);
var looper;
'use strict';
looper = function () {
  var p5sound = master;
  var BPM = 120;
  /**
   *  Set the global tempo, in beats per minute, for all
   *  p5.Parts. This method will impact all active p5.Parts.
   *
   *  @method setBPM
   *  @param {Number} BPM      Beats Per Minute
   *  @param {Number} rampTime Seconds from now
   */
  p5.prototype.setBPM = function (bpm, rampTime) {
    BPM = bpm;
    for (var i in p5sound.parts) {
      if (p5sound.parts[i]) {
        p5sound.parts[i].setBPM(bpm, rampTime);
      }
    }
  };
  /**
   *  <p>A phrase is a pattern of musical events over time, i.e.
   *  a series of notes and rests.</p>
   *
   *  <p>Phrases must be added to a p5.Part for playback, and
   *  each part can play multiple phrases at the same time.
   *  For example, one Phrase might be a kick drum, another
   *  could be a snare, and another could be the bassline.</p>
   *
   *  <p>The first parameter is a name so that the phrase can be
   *  modified or deleted later. The callback is a a function that
   *  this phrase will call at every step—for example it might be
   *  called <code>playNote(value){}</code>. The array determines
   *  which value is passed into the callback at each step of the
   *  phrase. It can be numbers, an object with multiple numbers,
   *  or a zero (0) indicates a rest so the callback won't be called).</p>
   *
   *  @class p5.Phrase
   *  @constructor
   *  @param {String}   name     Name so that you can access the Phrase.
   *  @param {Function} callback The name of a function that this phrase
   *                             will call. Typically it will play a sound,
   *                             and accept two parameters: a time at which
   *                             to play the sound (in seconds from now),
   *                             and a value from the sequence array. The
   *                             time should be passed into the play() or
   *                             start() method to ensure precision.
   *  @param {Array}   sequence    Array of values to pass into the callback
   *                            at each step of the phrase.
   *  @example
   *  <div><code>
   *  let mySound, myPhrase, myPart;
   *  let pattern = [1,0,0,2,0,2,0,0];
   *  let msg = 'click to play';
   *
   *  function preload() {
   *    mySound = loadSound('assets/beatbox.mp3');
   *  }
   *
   *  function setup() {
   *    noStroke();
   *    fill(255);
   *    textAlign(CENTER);
   *    masterVolume(0.1);
   *
   *    myPhrase = new p5.Phrase('bbox', makeSound, pattern);
   *    myPart = new p5.Part();
   *    myPart.addPhrase(myPhrase);
   *    myPart.setBPM(60);
   *  }
   *
   *  function draw() {
   *    background(0);
   *    text(msg, width/2, height/2);
   *  }
   *
   *  function makeSound(time, playbackRate) {
   *    mySound.rate(playbackRate);
   *    mySound.play(time);
   *  }
   *
   *  function mouseClicked() {
   *    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
   *      myPart.start();
   *      msg = 'playing pattern';
   *    }
   *  }
   *
   *  </code></div>
   */
  p5.Phrase = function (name, callback, sequence) {
    this.phraseStep = 0;
    this.name = name;
    this.callback = callback;
    /**
     * Array of values to pass into the callback
     * at each step of the phrase. Depending on the callback
     * function's requirements, these values may be numbers,
     * strings, or an object with multiple parameters.
     * Zero (0) indicates a rest.
     *
     * @property {Array} sequence
     */
    this.sequence = sequence;
  };
  /**
   *  <p>A p5.Part plays back one or more p5.Phrases. Instantiate a part
   *  with steps and tatums. By default, each step represents a 1/16th note.</p>
   *
   *  <p>See p5.Phrase for more about musical timing.</p>
   *
   *  @class p5.Part
   *  @constructor
   *  @param {Number} [steps]   Steps in the part
   *  @param {Number} [tatums] Divisions of a beat, e.g. use 1/4, or 0.25 for a quater note (default is 1/16, a sixteenth note)
   *  @example
   *  <div><code>
   *  let box, drum, myPart;
   *  let boxPat = [1,0,0,2,0,2,0,0];
   *  let drumPat = [0,1,1,0,2,0,1,0];
   *  let msg = 'click to play';
   *
   *  function preload() {
   *    box = loadSound('assets/beatbox.mp3');
   *    drum = loadSound('assets/drum.mp3');
   *  }
   *
   *  function setup() {
   *    noStroke();
   *    fill(255);
   *    textAlign(CENTER);
   *    masterVolume(0.1);
   *
   *    let boxPhrase = new p5.Phrase('box', playBox, boxPat);
   *    let drumPhrase = new p5.Phrase('drum', playDrum, drumPat);
   *    myPart = new p5.Part();
   *    myPart.addPhrase(boxPhrase);
   *    myPart.addPhrase(drumPhrase);
   *    myPart.setBPM(60);
   *    masterVolume(0.1);
   *  }
   *
   *  function draw() {
   *    background(0);
   *    text(msg, width/2, height/2);
   *  }
   *
   *  function playBox(time, playbackRate) {
   *    box.rate(playbackRate);
   *    box.play(time);
   *  }
   *
   *  function playDrum(time, playbackRate) {
   *    drum.rate(playbackRate);
   *    drum.play(time);
   *  }
   *
   *  function mouseClicked() {
   *    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
   *      myPart.start();
   *      msg = 'playing part';
   *    }
   *  }
   *  </code></div>
   */
  p5.Part = function (steps, bLength) {
    this.length = steps || 0;
    // how many beats
    this.partStep = 0;
    this.phrases = [];
    this.isPlaying = false;
    this.noLoop();
    this.tatums = bLength || 0.0625;
    // defaults to quarter note
    this.metro = new p5.Metro();
    this.metro._init();
    this.metro.beatLength(this.tatums);
    this.metro.setBPM(BPM);
    p5sound.parts.push(this);
    this.callback = function () {
    };
  };
  /**
   *  Set the tempo of this part, in Beats Per Minute.
   *
   *  @method  setBPM
   *  @param {Number} BPM      Beats Per Minute
   *  @param {Number} [rampTime] Seconds from now
   */
  p5.Part.prototype.setBPM = function (tempo, rampTime) {
    this.metro.setBPM(tempo, rampTime);
  };
  /**
   *  Returns the tempo, in Beats Per Minute, of this part.
   *
   *  @method getBPM
   *  @return {Number}
   */
  p5.Part.prototype.getBPM = function () {
    return this.metro.getBPM();
  };
  /**
   *  Start playback of this part. It will play
   *  through all of its phrases at a speed
   *  determined by setBPM.
   *
   *  @method  start
   *  @param  {Number} [time] seconds from now
   */
  p5.Part.prototype.start = function (time) {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.metro.resetSync(this);
      var t = time || 0;
      this.metro.start(t);
    }
  };
  /**
   *  Loop playback of this part. It will begin
   *  looping through all of its phrases at a speed
   *  determined by setBPM.
   *
   *  @method  loop
   *  @param  {Number} [time] seconds from now
   */
  p5.Part.prototype.loop = function (time) {
    this.looping = true;
    // rest onended function
    this.onended = function () {
      this.partStep = 0;
    };
    var t = time || 0;
    this.start(t);
  };
  /**
   *  Tell the part to stop looping.
   *
   *  @method  noLoop
   */
  p5.Part.prototype.noLoop = function () {
    this.looping = false;
    // rest onended function
    this.onended = function () {
      this.stop();
    };
  };
  /**
   *  Stop the part and cue it to step 0. Playback will resume from the begining of the Part when it is played again.
   *
   *  @method  stop
   *  @param  {Number} [time] seconds from now
   */
  p5.Part.prototype.stop = function (time) {
    this.partStep = 0;
    this.pause(time);
  };
  /**
   *  Pause the part. Playback will resume
   *  from the current step.
   *
   *  @method  pause
   *  @param  {Number} time seconds from now
   */
  p5.Part.prototype.pause = function (time) {
    this.isPlaying = false;
    var t = time || 0;
    this.metro.stop(t);
  };
  /**
   *  Add a p5.Phrase to this Part.
   *
   *  @method  addPhrase
   *  @param {p5.Phrase}   phrase   reference to a p5.Phrase
   */
  p5.Part.prototype.addPhrase = function (name, callback, array) {
    var p;
    if (arguments.length === 3) {
      p = new p5.Phrase(name, callback, array);
    } else if (arguments[0] instanceof p5.Phrase) {
      p = arguments[0];
    } else {
      throw 'invalid input. addPhrase accepts name, callback, array or a p5.Phrase';
    }
    this.phrases.push(p);
    // reset the length if phrase is longer than part's existing length
    if (p.sequence.length > this.length) {
      this.length = p.sequence.length;
    }
  };
  /**
   *  Remove a phrase from this part, based on the name it was
   *  given when it was created.
   *
   *  @method  removePhrase
   *  @param  {String} phraseName
   */
  p5.Part.prototype.removePhrase = function (name) {
    for (var i in this.phrases) {
      if (this.phrases[i].name === name) {
        this.phrases.splice(i, 1);
      }
    }
  };
  /**
   *  Get a phrase from this part, based on the name it was
   *  given when it was created. Now you can modify its array.
   *
   *  @method  getPhrase
   *  @param  {String} phraseName
   */
  p5.Part.prototype.getPhrase = function (name) {
    for (var i in this.phrases) {
      if (this.phrases[i].name === name) {
        return this.phrases[i];
      }
    }
  };
  /**
   *  Find all sequences with the specified name, and replace their patterns with the specified array.
   *
   *  @method  replaceSequence
   *  @param  {String} phraseName
   *  @param  {Array} sequence  Array of values to pass into the callback
   *                            at each step of the phrase.
   */
  p5.Part.prototype.replaceSequence = function (name, array) {
    for (var i in this.phrases) {
      if (this.phrases[i].name === name) {
        this.phrases[i].sequence = array;
      }
    }
  };
  p5.Part.prototype.incrementStep = function (time) {
    if (this.partStep < this.length - 1) {
      this.callback(time);
      this.partStep += 1;
    } else {
      if (!this.looping && this.partStep === this.length - 1) {
        console.log('done');
        // this.callback(time);
        this.onended();
      }
    }
  };
  /**
   *  Set the function that will be called at every step. This will clear the previous function.
   *
   *  @method onStep
   *  @param  {Function} callback The name of the callback
   *                              you want to fire
   *                              on every beat/tatum.
   */
  p5.Part.prototype.onStep = function (callback) {
    this.callback = callback;
  };
  // ===============
  // p5.Score
  // ===============
  /**
   *  A Score consists of a series of Parts. The parts will
   *  be played back in order. For example, you could have an
   *  A part, a B part, and a C part, and play them back in this order
   *  <code>new p5.Score(a, a, b, a, c)</code>
   *
   *  @class p5.Score
   *  @constructor
   *  @param {p5.Part} [...parts] One or multiple parts, to be played in sequence.
   */
  p5.Score = function () {
    // for all of the arguments
    this.parts = [];
    this.currentPart = 0;
    var thisScore = this;
    for (var i in arguments) {
      if (arguments[i] && this.parts[i]) {
        this.parts[i] = arguments[i];
        this.parts[i].nextPart = this.parts[i + 1];
        this.parts[i].onended = function () {
          thisScore.resetPart(i);
          playNextPart(thisScore);
        };
      }
    }
    this.looping = false;
  };
  p5.Score.prototype.onended = function () {
    if (this.looping) {
      // this.resetParts();
      this.parts[0].start();
    } else {
      this.parts[this.parts.length - 1].onended = function () {
        this.stop();
        this.resetParts();
      };
    }
    this.currentPart = 0;
  };
  /**
   *  Start playback of the score.
   *
   *  @method  start
   */
  p5.Score.prototype.start = function () {
    this.parts[this.currentPart].start();
    this.scoreStep = 0;
  };
  /**
   *  Stop playback of the score.
   *
   *  @method  stop
   */
  p5.Score.prototype.stop = function () {
    this.parts[this.currentPart].stop();
    this.currentPart = 0;
    this.scoreStep = 0;
  };
  /**
   *  Pause playback of the score.
   *
   *  @method  pause
   */
  p5.Score.prototype.pause = function () {
    this.parts[this.currentPart].stop();
  };
  /**
   *  Loop playback of the score.
   *
   *  @method  loop
   */
  p5.Score.prototype.loop = function () {
    this.looping = true;
    this.start();
  };
  /**
   *  Stop looping playback of the score. If it
   *  is currently playing, this will go into effect
   *  after the current round of playback completes.
   *
   *  @method  noLoop
   */
  p5.Score.prototype.noLoop = function () {
    this.looping = false;
  };
  p5.Score.prototype.resetParts = function () {
    var self = this;
    this.parts.forEach(function (part) {
      self.resetParts[part];
    });
  };
  p5.Score.prototype.resetPart = function (i) {
    this.parts[i].stop();
    this.parts[i].partStep = 0;
    for (var p in this.parts[i].phrases) {
      if (this.parts[i]) {
        this.parts[i].phrases[p].phraseStep = 0;
      }
    }
  };
  /**
   *  Set the tempo for all parts in the score
   *
   *  @method setBPM
   *  @param {Number} BPM      Beats Per Minute
   *  @param {Number} rampTime Seconds from now
   */
  p5.Score.prototype.setBPM = function (bpm, rampTime) {
    for (var i in this.parts) {
      if (this.parts[i]) {
        this.parts[i].setBPM(bpm, rampTime);
      }
    }
  };
  function playNextPart(aScore) {
    aScore.currentPart++;
    if (aScore.currentPart >= aScore.parts.length) {
      aScore.scoreStep = 0;
      aScore.onended();
    } else {
      aScore.scoreStep = 0;
      aScore.parts[aScore.currentPart - 1].stop();
      aScore.parts[aScore.currentPart].start();
    }
  }
}(master);
var soundloop;
'use strict';
soundloop = function () {
  var p5sound = master;
  var Clock = Tone_core_Clock;
  /**
   * SoundLoop
   *
   * @class p5.SoundLoop
   * @constructor
   *
   * @param {Function} callback this function will be called on each iteration of theloop
   * @param {Number|String} [interval] amount of time or beats for each iteration of the loop
   *                                       defaults to 1
   *
   * @example
   * <div><code>
   * let click;
   * let looper1;
   *
   * function preload() {
   *   click = loadSound('assets/drum.mp3');
   * }
   *
   * function setup() {
   *   //the looper's callback is passed the timeFromNow
   *   //this value should be used as a reference point from
   *   //which to schedule sounds
   *   looper1 = new p5.SoundLoop(function(timeFromNow){
   *     click.play(timeFromNow);
   *     background(255 * (looper1.iterations % 2));
   *     }, 2);
   *
   *   //stop after 10 iteratios;
   *   looper1.maxIterations = 10;
   *   //start the loop
   *   looper1.start();
   * }
   * </code></div>
   */
  p5.SoundLoop = function (callback, interval) {
    this.callback = callback;
    /**
       * musicalTimeMode uses <a href = "https://github.com/Tonejs/Tone.js/wiki/Time">Tone.Time</a> convention
    * true if string, false if number
       * @property {Boolean} musicalTimeMode
       */
    this.musicalTimeMode = typeof this._interval === 'number' ? false : true;
    this._interval = interval || 1;
    /**
     * musicalTimeMode variables
     * modify these only when the interval is specified in musicalTime format as a string
     */
    this._timeSignature = 4;
    this._bpm = 60;
    this.isPlaying = false;
    /**
     * Set a limit to the number of loops to play. defaults to Infinity
     * @property {Number} maxIterations
     */
    this.maxIterations = Infinity;
    var self = this;
    this.clock = new Clock({
      'callback': function (time) {
        var timeFromNow = time - p5sound.audiocontext.currentTime;
        /**
         * Do not initiate the callback if timeFromNow is < 0
         * This ususually occurs for a few milliseconds when the page
         * is not fully loaded
         *
         * The callback should only be called until maxIterations is reached
         */
        if (timeFromNow > 0 && self.iterations <= self.maxIterations) {
          self.callback(timeFromNow);
        }
      },
      'frequency': this._calcFreq()
    });
  };
  /**
   * Start the loop
   * @method  start
   * @param  {Number} [timeFromNow] schedule a starting time
   */
  p5.SoundLoop.prototype.start = function (timeFromNow) {
    var t = timeFromNow || 0;
    var now = p5sound.audiocontext.currentTime;
    if (!this.isPlaying) {
      this.clock.start(now + t);
      this.isPlaying = true;
    }
  };
  /**
   * Stop the loop
   * @method  stop
   * @param  {Number} [timeFromNow] schedule a stopping time
   */
  p5.SoundLoop.prototype.stop = function (timeFromNow) {
    var t = timeFromNow || 0;
    var now = p5sound.audiocontext.currentTime;
    if (this.isPlaying) {
      this.clock.stop(now + t);
      this.isPlaying = false;
    }
  };
  /**
   * Pause the loop
   * @method pause
   * @param  {Number} [timeFromNow] schedule a pausing time
   */
  p5.SoundLoop.prototype.pause = function (timeFromNow) {
    var t = timeFromNow || 0;
    var now = p5sound.audiocontext.currentTime;
    if (this.isPlaying) {
      this.clock.pause(now + t);
      this.isPlaying = false;
    }
  };
  /**
   * Synchronize loops. Use this method to start two more more loops in synchronization
   * or to start a loop in synchronization with a loop that is already playing
   * This method will schedule the implicit loop in sync with the explicit master loop
   * i.e. loopToStart.syncedStart(loopToSyncWith)
   * 
   * @method  syncedStart
   * @param  {Object} otherLoop   a p5.SoundLoop to sync with 
   * @param  {Number} [timeFromNow] Start the loops in sync after timeFromNow seconds
   */
  p5.SoundLoop.prototype.syncedStart = function (otherLoop, timeFromNow) {
    var t = timeFromNow || 0;
    var now = p5sound.audiocontext.currentTime;
    if (!otherLoop.isPlaying) {
      otherLoop.clock.start(now + t);
      otherLoop.isPlaying = true;
      this.clock.start(now + t);
      this.isPlaying = true;
    } else if (otherLoop.isPlaying) {
      var time = otherLoop.clock._nextTick - p5sound.audiocontext.currentTime;
      this.clock.start(now + time);
      this.isPlaying = true;
    }
  };
  /**
   * Updates frequency value, reflected in next callback
   * @private
   * @method  _update
   */
  p5.SoundLoop.prototype._update = function () {
    this.clock.frequency.value = this._calcFreq();
  };
  /**
   * Calculate the frequency of the clock's callback based on bpm, interval, and timesignature
   * @private
   * @method  _calcFreq
   * @return {Number} new clock frequency value
   */
  p5.SoundLoop.prototype._calcFreq = function () {
    //Seconds mode, bpm / timesignature has no effect
    if (typeof this._interval === 'number') {
      this.musicalTimeMode = false;
      return 1 / this._interval;
    } else if (typeof this._interval === 'string') {
      this.musicalTimeMode = true;
      return this._bpm / 60 / this._convertNotation(this._interval) * (this._timeSignature / 4);
    }
  };
  /**
   * Convert notation from musical time format to seconds
   * Uses <a href = "https://github.com/Tonejs/Tone.js/wiki/Time">Tone.Time</a> convention
   * @private
   * @method _convertNotation
   * @param  {String} value value to be converted
   * @return {Number}       converted value in seconds
   */
  p5.SoundLoop.prototype._convertNotation = function (value) {
    var type = value.slice(-1);
    value = Number(value.slice(0, -1));
    switch (type) {
    case 'm':
      return this._measure(value);
    case 'n':
      return this._note(value);
    default:
      console.warn('Specified interval is not formatted correctly. See Tone.js ' + 'timing reference for more info: https://github.com/Tonejs/Tone.js/wiki/Time');
    }
  };
  /**
   * Helper conversion methods of measure and note
   * @private
   * @method  _measure
   * @private
   * @method  _note
   */
  p5.SoundLoop.prototype._measure = function (value) {
    return value * this._timeSignature;
  };
  p5.SoundLoop.prototype._note = function (value) {
    return this._timeSignature / value;
  };
  /**
   * Getters and Setters, setting any paramter will result in a change in the clock's
   * frequency, that will be reflected after the next callback
   * beats per minute (defaults to 60)
   * @property {Number} bpm
   */
  Object.defineProperty(p5.SoundLoop.prototype, 'bpm', {
    get: function () {
      return this._bpm;
    },
    set: function (bpm) {
      if (!this.musicalTimeMode) {
        console.warn('Changing the BPM in "seconds" mode has no effect. ' + 'BPM is only relevant in musicalTimeMode ' + 'when the interval is specified as a string ' + '("2n", "4n", "1m"...etc)');
      }
      this._bpm = bpm;
      this._update();
    }
  });
  /**
   * number of quarter notes in a measure (defaults to 4)
   * @property {Number} timeSignature
   */
  Object.defineProperty(p5.SoundLoop.prototype, 'timeSignature', {
    get: function () {
      return this._timeSignature;
    },
    set: function (timeSig) {
      if (!this.musicalTimeMode) {
        console.warn('Changing the timeSignature in "seconds" mode has no effect. ' + 'BPM is only relevant in musicalTimeMode ' + 'when the interval is specified as a string ' + '("2n", "4n", "1m"...etc)');
      }
      this._timeSignature = timeSig;
      this._update();
    }
  });
  /**
   * length of the loops interval
   * @property {Number|String} interval
   */
  Object.defineProperty(p5.SoundLoop.prototype, 'interval', {
    get: function () {
      return this._interval;
    },
    set: function (interval) {
      this.musicalTimeMode = typeof interval === 'Number' ? false : true;
      this._interval = interval;
      this._update();
    }
  });
  /**
   * how many times the callback has been called so far
   * @property {Number} iterations
   * @readonly
   */
  Object.defineProperty(p5.SoundLoop.prototype, 'iterations', {
    get: function () {
      return this.clock.ticks;
    }
  });
  return p5.SoundLoop;
}(master, Tone_core_Clock);
var compressor;
compressor = function () {
  'use strict';
  var p5sound = master;
  var Effect = effect;
  var CustomError = errorHandler;
  /**
   * Compressor is an audio effect class that performs dynamics compression
   * on an audio input source. This is a very commonly used technique in music
   * and sound production. Compression creates an overall louder, richer, 
   * and fuller sound by lowering the volume of louds and raising that of softs.
   * Compression can be used to avoid clipping (sound distortion due to 
   * peaks in volume) and is especially useful when many sounds are played 
   * at once. Compression can be used on indivudal sound sources in addition
   * to the master output.  
   *
   * This class extends <a href = "/reference/#/p5.Effect">p5.Effect</a>.  
   * Methods <a href = "/reference/#/p5.Effect/amp">amp()</a>, <a href = "/reference/#/p5.Effect/chain">chain()</a>, 
   * <a href = "/reference/#/p5.Effect/drywet">drywet()</a>, <a href = "/reference/#/p5.Effect/connect">connect()</a>, and 
   * <a href = "/reference/#/p5.Effect/disconnect">disconnect()</a> are available.
   *
   * @class p5.Compressor
   * @constructor
   * @extends p5.Effect
   *
   * 
   */
  p5.Compressor = function () {
    Effect.call(this);
    /**
       * The p5.Compressor is built with a <a href="https://www.w3.org/TR/webaudio/#the-dynamicscompressornode-interface" 
     *   target="_blank" title="W3 spec for Dynamics Compressor Node">Web Audio Dynamics Compressor Node
     *   </a>
       * @property {AudioNode} compressor 
       */
    this.compressor = this.ac.createDynamicsCompressor();
    this.input.connect(this.compressor);
    this.compressor.connect(this.wet);
  };
  p5.Compressor.prototype = Object.create(Effect.prototype);
  /**
  * Performs the same function as .connect, but also accepts
  * optional parameters to set compressor's audioParams
  * @method process 
  *
  * @param {Object} src         Sound source to be connected
  * 
  * @param {Number} [attack]     The amount of time (in seconds) to reduce the gain by 10dB,
  *                            default = .003, range 0 - 1
  * @param {Number} [knee]       A decibel value representing the range above the 
  *                            threshold where the curve smoothly transitions to the "ratio" portion.
  *                            default = 30, range 0 - 40
  * @param {Number} [ratio]      The amount of dB change in input for a 1 dB change in output
  *                            default = 12, range 1 - 20
  * @param {Number} [threshold]  The decibel value above which the compression will start taking effect
  *                            default = -24, range -100 - 0
  * @param {Number} [release]    The amount of time (in seconds) to increase the gain by 10dB
  *                            default = .25, range 0 - 1
  */
  p5.Compressor.prototype.process = function (src, attack, knee, ratio, threshold, release) {
    src.connect(this.input);
    this.set(attack, knee, ratio, threshold, release);
  };
  /**
   * Set the paramters of a compressor. 
   * @method  set
   * @param {Number} attack     The amount of time (in seconds) to reduce the gain by 10dB,
   *                            default = .003, range 0 - 1
   * @param {Number} knee       A decibel value representing the range above the 
   *                            threshold where the curve smoothly transitions to the "ratio" portion.
   *                            default = 30, range 0 - 40
   * @param {Number} ratio      The amount of dB change in input for a 1 dB change in output
   *                            default = 12, range 1 - 20
   * @param {Number} threshold  The decibel value above which the compression will start taking effect
   *                            default = -24, range -100 - 0
   * @param {Number} release    The amount of time (in seconds) to increase the gain by 10dB
   *                            default = .25, range 0 - 1
   */
  p5.Compressor.prototype.set = function (attack, knee, ratio, threshold, release) {
    if (typeof attack !== 'undefined') {
      this.attack(attack);
    }
    if (typeof knee !== 'undefined') {
      this.knee(knee);
    }
    if (typeof ratio !== 'undefined') {
      this.ratio(ratio);
    }
    if (typeof threshold !== 'undefined') {
      this.threshold(threshold);
    }
    if (typeof release !== 'undefined') {
      this.release(release);
    }
  };
  /**
   * Get current attack or set value w/ time ramp
   * 
   * 
   * @method attack
   * @param {Number} [attack] Attack is the amount of time (in seconds) to reduce the gain by 10dB,
   *                          default = .003, range 0 - 1
   * @param {Number} [time]  Assign time value to schedule the change in value
   */
  p5.Compressor.prototype.attack = function (attack, time) {
    var t = time || 0;
    if (typeof attack == 'number') {
      this.compressor.attack.value = attack;
      this.compressor.attack.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.compressor.attack.linearRampToValueAtTime(attack, this.ac.currentTime + 0.02 + t);
    } else if (typeof attack !== 'undefined') {
      attack.connect(this.compressor.attack);
    }
    return this.compressor.attack.value;
  };
  /**
   * Get current knee or set value w/ time ramp
   * 
   * @method knee
   * @param {Number} [knee] A decibel value representing the range above the 
   *                        threshold where the curve smoothly transitions to the "ratio" portion.
   *                        default = 30, range 0 - 40
   * @param {Number} [time]  Assign time value to schedule the change in value
   */
  p5.Compressor.prototype.knee = function (knee, time) {
    var t = time || 0;
    if (typeof knee == 'number') {
      this.compressor.knee.value = knee;
      this.compressor.knee.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.compressor.knee.linearRampToValueAtTime(knee, this.ac.currentTime + 0.02 + t);
    } else if (typeof knee !== 'undefined') {
      knee.connect(this.compressor.knee);
    }
    return this.compressor.knee.value;
  };
  /**
   * Get current ratio or set value w/ time ramp
   * @method ratio
   *
   * @param {Number} [ratio]      The amount of dB change in input for a 1 dB change in output
   *                            default = 12, range 1 - 20 
   * @param {Number} [time]  Assign time value to schedule the change in value
   */
  p5.Compressor.prototype.ratio = function (ratio, time) {
    var t = time || 0;
    if (typeof ratio == 'number') {
      this.compressor.ratio.value = ratio;
      this.compressor.ratio.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.compressor.ratio.linearRampToValueAtTime(ratio, this.ac.currentTime + 0.02 + t);
    } else if (typeof ratio !== 'undefined') {
      ratio.connect(this.compressor.ratio);
    }
    return this.compressor.ratio.value;
  };
  /**
   * Get current threshold or set value w/ time ramp
   * @method threshold
   *
   * @param {Number} threshold  The decibel value above which the compression will start taking effect
   *                            default = -24, range -100 - 0
   * @param {Number} [time]  Assign time value to schedule the change in value
   */
  p5.Compressor.prototype.threshold = function (threshold, time) {
    var t = time || 0;
    if (typeof threshold == 'number') {
      this.compressor.threshold.value = threshold;
      this.compressor.threshold.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.compressor.threshold.linearRampToValueAtTime(threshold, this.ac.currentTime + 0.02 + t);
    } else if (typeof threshold !== 'undefined') {
      threshold.connect(this.compressor.threshold);
    }
    return this.compressor.threshold.value;
  };
  /**
   * Get current release or set value w/ time ramp
   * @method release
   *
   * @param {Number} release    The amount of time (in seconds) to increase the gain by 10dB
   *                            default = .25, range 0 - 1
   *
   * @param {Number} [time]  Assign time value to schedule the change in value
   */
  p5.Compressor.prototype.release = function (release, time) {
    var t = time || 0;
    if (typeof release == 'number') {
      this.compressor.release.value = release;
      this.compressor.release.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.compressor.release.linearRampToValueAtTime(release, this.ac.currentTime + 0.02 + t);
    } else if (typeof number !== 'undefined') {
      release.connect(this.compressor.release);
    }
    return this.compressor.release.value;
  };
  /**
   * Return the current reduction value
   *
   * @method reduction
   * @return {Number} Value of the amount of gain reduction that is applied to the signal
   */
  p5.Compressor.prototype.reduction = function () {
    return this.compressor.reduction.value;
  };
  p5.Compressor.prototype.dispose = function () {
    Effect.prototype.dispose.apply(this);
    if (this.compressor) {
      this.compressor.disconnect();
      delete this.compressor;
    }
  };
  return p5.Compressor;
}(master, effect, errorHandler);
var soundRecorder;
'use strict';
soundRecorder = function () {
  // inspiration: recorder.js, Tone.js & typedarray.org
  var p5sound = master;
  var convertToWav = helpers.convertToWav;
  var ac = p5sound.audiocontext;
  /**
   *  <p>Record sounds for playback and/or to save as a .wav file.
   *  The p5.SoundRecorder records all sound output from your sketch,
   *  or can be assigned a specific source with setInput().</p>
   *  <p>The record() method accepts a p5.SoundFile as a parameter.
   *  When playback is stopped (either after the given amount of time,
   *  or with the stop() method), the p5.SoundRecorder will send its
   *  recording to that p5.SoundFile for playback.</p>
   *
   *  @class p5.SoundRecorder
   *  @constructor
   *  @example
   *  <div><code>
   *  let mic, recorder, soundFile;
   *  let state = 0;
   *
   *  function setup() {
   *    background(200);
   *    // create an audio in
   *    mic = new p5.AudioIn();
   *
   *    // prompts user to enable their browser mic
   *    mic.start();
   *
   *    // create a sound recorder
   *    recorder = new p5.SoundRecorder();
   *
   *    // connect the mic to the recorder
   *    recorder.setInput(mic);
   *
   *    // this sound file will be used to
   *    // playback & save the recording
   *    soundFile = new p5.SoundFile();
   *
   *    text('keyPress to record', 20, 20);
   *  }
   *
   *  function keyPressed() {
   *    // make sure user enabled the mic
   *    if (state === 0 && mic.enabled) {
   *
   *      // record to our p5.SoundFile
   *      recorder.record(soundFile);
   *
   *      background(255,0,0);
   *      text('Recording!', 20, 20);
   *      state++;
   *    }
   *    else if (state === 1) {
   *      background(0,255,0);
   *
   *      // stop recorder and
   *      // send result to soundFile
   *      recorder.stop();
   *
   *      text('Stopped', 20, 20);
   *      state++;
   *    }
   *
   *    else if (state === 2) {
   *      soundFile.play(); // play the result!
   *      save(soundFile, 'mySound.wav');
   *      state++;
   *    }
   *  }
   *  </div></code>
   */
  p5.SoundRecorder = function () {
    this.input = ac.createGain();
    this.output = ac.createGain();
    this.recording = false;
    this.bufferSize = 1024;
    this._channels = 2;
    // stereo (default)
    this._clear();
    // initialize variables
    this._jsNode = ac.createScriptProcessor(this.bufferSize, this._channels, 2);
    this._jsNode.onaudioprocess = this._audioprocess.bind(this);
    /**
     *  callback invoked when the recording is over
     *  @private
     *  @type Function(Float32Array)
     */
    this._callback = function () {
    };
    // connections
    this._jsNode.connect(p5.soundOut._silentNode);
    this.setInput();
    // add this p5.SoundFile to the soundArray
    p5sound.soundArray.push(this);
  };
  /**
   *  Connect a specific device to the p5.SoundRecorder.
   *  If no parameter is given, p5.SoundRecorer will record
   *  all audible p5.sound from your sketch.
   *
   *  @method  setInput
   *  @param {Object} [unit] p5.sound object or a web audio unit
   *                         that outputs sound
   */
  p5.SoundRecorder.prototype.setInput = function (unit) {
    this.input.disconnect();
    this.input = null;
    this.input = ac.createGain();
    this.input.connect(this._jsNode);
    this.input.connect(this.output);
    if (unit) {
      unit.connect(this.input);
    } else {
      p5.soundOut.output.connect(this.input);
    }
  };
  /**
   *  Start recording. To access the recording, provide
   *  a p5.SoundFile as the first parameter. The p5.SoundRecorder
   *  will send its recording to that p5.SoundFile for playback once
   *  recording is complete. Optional parameters include duration
   *  (in seconds) of the recording, and a callback function that
   *  will be called once the complete recording has been
   *  transfered to the p5.SoundFile.
   *
   *  @method  record
   *  @param  {p5.SoundFile}   soundFile    p5.SoundFile
   *  @param  {Number}   [duration] Time (in seconds)
   *  @param  {Function} [callback] The name of a function that will be
   *                                called once the recording completes
   */
  p5.SoundRecorder.prototype.record = function (sFile, duration, callback) {
    this.recording = true;
    if (duration) {
      this.sampleLimit = Math.round(duration * ac.sampleRate);
    }
    if (sFile && callback) {
      this._callback = function () {
        this.buffer = this._getBuffer();
        sFile.setBuffer(this.buffer);
        callback();
      };
    } else if (sFile) {
      this._callback = function () {
        this.buffer = this._getBuffer();
        sFile.setBuffer(this.buffer);
      };
    }
  };
  /**
   *  Stop the recording. Once the recording is stopped,
   *  the results will be sent to the p5.SoundFile that
   *  was given on .record(), and if a callback function
   *  was provided on record, that function will be called.
   *
   *  @method  stop
   */
  p5.SoundRecorder.prototype.stop = function () {
    this.recording = false;
    this._callback();
    this._clear();
  };
  p5.SoundRecorder.prototype._clear = function () {
    this._leftBuffers = [];
    this._rightBuffers = [];
    this.recordedSamples = 0;
    this.sampleLimit = null;
  };
  /**
   *  internal method called on audio process
   *
   *  @private
   *  @param   {AudioProcessorEvent} event
   */
  p5.SoundRecorder.prototype._audioprocess = function (event) {
    if (this.recording === false) {
      return;
    } else if (this.recording === true) {
      // if we are past the duration, then stop... else:
      if (this.sampleLimit && this.recordedSamples >= this.sampleLimit) {
        this.stop();
      } else {
        // get channel data
        var left = event.inputBuffer.getChannelData(0);
        var right = event.inputBuffer.getChannelData(1);
        // clone the samples
        this._leftBuffers.push(new Float32Array(left));
        this._rightBuffers.push(new Float32Array(right));
        this.recordedSamples += this.bufferSize;
      }
    }
  };
  p5.SoundRecorder.prototype._getBuffer = function () {
    var buffers = [];
    buffers.push(this._mergeBuffers(this._leftBuffers));
    buffers.push(this._mergeBuffers(this._rightBuffers));
    return buffers;
  };
  p5.SoundRecorder.prototype._mergeBuffers = function (channelBuffer) {
    var result = new Float32Array(this.recordedSamples);
    var offset = 0;
    var lng = channelBuffer.length;
    for (var i = 0; i < lng; i++) {
      var buffer = channelBuffer[i];
      result.set(buffer, offset);
      offset += buffer.length;
    }
    return result;
  };
  p5.SoundRecorder.prototype.dispose = function () {
    this._clear();
    // remove reference from soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);
    this._callback = function () {
    };
    if (this.input) {
      this.input.disconnect();
    }
    this.input = null;
    this._jsNode = null;
  };
  /**
   * Save a p5.SoundFile as a .wav file. The browser will prompt the user
   * to download the file to their device.
   * For uploading audio to a server, use
   * <a href="/docs/reference/#/p5.SoundFile/saveBlob">`p5.SoundFile.saveBlob`</a>.
   *
   *  @for p5
   *  @method saveSound
   *  @param  {p5.SoundFile} soundFile p5.SoundFile that you wish to save
   *  @param  {String} fileName      name of the resulting .wav file.
   */
  // add to p5.prototype as this is used by the p5 `save()` method.
  p5.prototype.saveSound = function (soundFile, fileName) {
    const dataView = convertToWav(soundFile.buffer);
    p5.prototype.writeFile([dataView], fileName, 'wav');
  };
}(master, helpers);
var peakdetect;
'use strict';
peakdetect = function () {
  /**
   *  <p>PeakDetect works in conjunction with p5.FFT to
   *  look for onsets in some or all of the frequency spectrum.
   *  </p>
   *  <p>
   *  To use p5.PeakDetect, call <code>update</code> in the draw loop
   *  and pass in a p5.FFT object.
   *  </p>
   *  <p>
   *  You can listen for a specific part of the frequency spectrum by
   *  setting the range between <code>freq1</code> and <code>freq2</code>.
   *  </p>
   *
   *  <p><code>threshold</code> is the threshold for detecting a peak,
   *  scaled between 0 and 1. It is logarithmic, so 0.1 is half as loud
   *  as 1.0.</p>
   *
   *  <p>
   *  The update method is meant to be run in the draw loop, and
   *  <b>frames</b> determines how many loops must pass before
   *  another peak can be detected.
   *  For example, if the frameRate() = 60, you could detect the beat of a
   *  120 beat-per-minute song with this equation:
   *  <code> framesPerPeak = 60 / (estimatedBPM / 60 );</code>
   *  </p>
   *
   *  <p>
   *  Based on example contribtued by @b2renger, and a simple beat detection
   *  explanation by <a
   *  href="http://www.airtightinteractive.com/2013/10/making-audio-reactive-visuals/"
   *  target="_blank">Felix Turner</a>.
   *  </p>
   *
   *  @class  p5.PeakDetect
   *  @constructor
   *  @param {Number} [freq1]     lowFrequency - defaults to 20Hz
   *  @param {Number} [freq2]     highFrequency - defaults to 20000 Hz
   *  @param {Number} [threshold] Threshold for detecting a beat between 0 and 1
   *                            scaled logarithmically where 0.1 is 1/2 the loudness
   *                            of 1.0. Defaults to 0.35.
   *  @param {Number} [framesPerPeak]     Defaults to 20.
   *  @example
   *  <div><code>
   *
   *  let cnv, soundFile, fft, peakDetect;
   *  let ellipseWidth = 10;
   *
   *  function preload() {
   *    soundFile = loadSound('assets/beat.mp3');
   *  }
   *
   *  function setup() {
   *    background(0);
   *    noStroke();
   *    fill(255);
   *    textAlign(CENTER);
   *
   *    // p5.PeakDetect requires a p5.FFT
   *    fft = new p5.FFT();
   *    peakDetect = new p5.PeakDetect();
   *  }
   *
   *  function draw() {
   *    background(0);
   *    text('click to play/pause', width/2, height/2);
   *
   *    // peakDetect accepts an fft post-analysis
   *    fft.analyze();
   *    peakDetect.update(fft);
   *
   *    if ( peakDetect.isDetected ) {
   *      ellipseWidth = 50;
   *    } else {
   *      ellipseWidth *= 0.95;
   *    }
   *
   *    ellipse(width/2, height/2, ellipseWidth, ellipseWidth);
   *  }
   *
   *  // toggle play/stop when canvas is clicked
   *  function mouseClicked() {
   *    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
   *      if (soundFile.isPlaying() ) {
   *        soundFile.stop();
   *      } else {
   *        soundFile.play();
   *      }
   *    }
   *  }
   *  </code></div>
   */
  p5.PeakDetect = function (freq1, freq2, threshold, _framesPerPeak) {
    // framesPerPeak determines how often to look for a beat.
    // If a beat is provided, try to look for a beat based on bpm
    this.framesPerPeak = _framesPerPeak || 20;
    this.framesSinceLastPeak = 0;
    this.decayRate = 0.95;
    this.threshold = threshold || 0.35;
    this.cutoff = 0;
    // how much to increase the cutoff
    // TO DO: document this / figure out how to make it accessible
    this.cutoffMult = 1.5;
    this.energy = 0;
    this.penergy = 0;
    // TO DO: document this property / figure out how to make it accessible
    this.currentValue = 0;
    /**
     *  isDetected is set to true when a peak is detected.
     *
     *  @attribute isDetected {Boolean}
     *  @default  false
     */
    this.isDetected = false;
    this.f1 = freq1 || 40;
    this.f2 = freq2 || 20000;
    // function to call when a peak is detected
    this._onPeak = function () {
    };
  };
  /**
   *  The update method is run in the draw loop.
   *
   *  Accepts an FFT object. You must call .analyze()
   *  on the FFT object prior to updating the peakDetect
   *  because it relies on a completed FFT analysis.
   *
   *  @method  update
   *  @param  {p5.FFT} fftObject A p5.FFT object
   */
  p5.PeakDetect.prototype.update = function (fftObject) {
    var nrg = this.energy = fftObject.getEnergy(this.f1, this.f2) / 255;
    if (nrg > this.cutoff && nrg > this.threshold && nrg - this.penergy > 0) {
      // trigger callback
      this._onPeak();
      this.isDetected = true;
      // debounce
      this.cutoff = nrg * this.cutoffMult;
      this.framesSinceLastPeak = 0;
    } else {
      this.isDetected = false;
      if (this.framesSinceLastPeak <= this.framesPerPeak) {
        this.framesSinceLastPeak++;
      } else {
        this.cutoff *= this.decayRate;
        this.cutoff = Math.max(this.cutoff, this.threshold);
      }
    }
    this.currentValue = nrg;
    this.penergy = nrg;
  };
  /**
   *  onPeak accepts two arguments: a function to call when
   *  a peak is detected. The value of the peak,
   *  between 0.0 and 1.0, is passed to the callback.
   *
   *  @method  onPeak
   *  @param  {Function} callback Name of a function that will
   *                              be called when a peak is
   *                              detected.
   *  @param  {Object}   [val]    Optional value to pass
   *                              into the function when
   *                              a peak is detected.
   *  @example
   *  <div><code>
   *  let cnv, soundFile, fft, peakDetect;
   *  let ellipseWidth = 0;
   *
   *  function preload() {
   *    soundFile = loadSound('assets/beat.mp3');
   *  }
   *
   *  function setup() {
   *    cnv = createCanvas(100,100);
   *    textAlign(CENTER);
   *
   *    fft = new p5.FFT();
   *    peakDetect = new p5.PeakDetect();
   *
   *    setupSound();
   *
   *    // when a beat is detected, call triggerBeat()
   *    peakDetect.onPeak(triggerBeat);
   *  }
   *
   *  function draw() {
   *    background(0);
   *    fill(255);
   *    text('click to play', width/2, height/2);
   *
   *    fft.analyze();
   *    peakDetect.update(fft);
   *
   *    ellipseWidth *= 0.95;
   *    ellipse(width/2, height/2, ellipseWidth, ellipseWidth);
   *  }
   *
   *  // this function is called by peakDetect.onPeak
   *  function triggerBeat() {
   *    ellipseWidth = 50;
   *  }
   *
   *  // mouseclick starts/stops sound
   *  function setupSound() {
   *    cnv.mouseClicked( function() {
   *      if (soundFile.isPlaying() ) {
   *        soundFile.stop();
   *      } else {
   *        soundFile.play();
   *      }
   *    });
   *  }
   *  </code></div>
   */
  p5.PeakDetect.prototype.onPeak = function (callback, val) {
    var self = this;
    self._onPeak = function () {
      callback(self.energy, val);
    };
  };
}();
var gain;
'use strict';
gain = function () {
  var p5sound = master;
  /**
   *  A gain node is usefull to set the relative volume of sound.
   *  It's typically used to build mixers.
   *
   *  @class p5.Gain
   *  @constructor
   *  @example
   *  <div><code>
   *
   * // load two soundfile and crossfade beetween them
   * let sound1,sound2;
   * let gain1, gain2, gain3;
   *
   * function preload(){
   *   soundFormats('ogg', 'mp3');
   *   sound1 = loadSound('assets/Damscray_-_Dancing_Tiger_01');
   *   sound2 = loadSound('assets/beat.mp3');
   * }
   *
   * function setup() {
   *   createCanvas(400,200);
   *
   *   // create a 'master' gain to which we will connect both soundfiles
   *   gain3 = new p5.Gain();
   *   gain3.connect();
   *
   *   // setup first sound for playing
   *   sound1.rate(1);
   *   sound1.loop();
   *   sound1.disconnect(); // diconnect from p5 output
   *
   *   gain1 = new p5.Gain(); // setup a gain node
   *   gain1.setInput(sound1); // connect the first sound to its input
   *   gain1.connect(gain3); // connect its output to the 'master'
   *
   *   sound2.rate(1);
   *   sound2.disconnect();
   *   sound2.loop();
   *
   *   gain2 = new p5.Gain();
   *   gain2.setInput(sound2);
   *   gain2.connect(gain3);
   *
   * }
   *
   * function draw(){
   *   background(180);
   *
   *   // calculate the horizontal distance beetween the mouse and the right of the screen
   *   let d = dist(mouseX,0,width,0);
   *
   *   // map the horizontal position of the mouse to values useable for volume control of sound1
   *   let vol1 = map(mouseX,0,width,0,1);
   *   let vol2 = 1-vol1; // when sound1 is loud, sound2 is quiet and vice versa
   *
   *   gain1.amp(vol1,0.5,0);
   *   gain2.amp(vol2,0.5,0);
   *
   *   // map the vertical position of the mouse to values useable for 'master volume control'
   *   let vol3 = map(mouseY,0,height,0,1);
   *   gain3.amp(vol3,0.5,0);
   * }
   *</code></div>
   *
   */
  p5.Gain = function () {
    this.ac = p5sound.audiocontext;
    this.input = this.ac.createGain();
    this.output = this.ac.createGain();
    // otherwise, Safari distorts
    this.input.gain.value = 0.5;
    this.input.connect(this.output);
    // add  to the soundArray
    p5sound.soundArray.push(this);
  };
  /**
   *  Connect a source to the gain node.
   *
   *  @method  setInput
   *  @param  {Object} src     p5.sound / Web Audio object with a sound
   *                           output.
   */
  p5.Gain.prototype.setInput = function (src) {
    src.connect(this.input);
  };
  /**
   *  Send output to a p5.sound or web audio object
   *
   *  @method  connect
   *  @param  {Object} unit
   */
  p5.Gain.prototype.connect = function (unit) {
    var u = unit || p5.soundOut.input;
    this.output.connect(u.input ? u.input : u);
  };
  /**
   *  Disconnect all output.
   *
   *  @method disconnect
   */
  p5.Gain.prototype.disconnect = function () {
    if (this.output) {
      this.output.disconnect();
    }
  };
  /**
   *  Set the output level of the gain node.
   *
   *  @method  amp
   *  @param  {Number} volume amplitude between 0 and 1.0
   *  @param  {Number} [rampTime] create a fade that lasts rampTime
   *  @param  {Number} [timeFromNow] schedule this event to happen
   *                                seconds from now
   */
  p5.Gain.prototype.amp = function (vol, rampTime, tFromNow) {
    var rampTime = rampTime || 0;
    var tFromNow = tFromNow || 0;
    var now = p5sound.audiocontext.currentTime;
    var currentVol = this.output.gain.value;
    this.output.gain.cancelScheduledValues(now);
    this.output.gain.linearRampToValueAtTime(currentVol, now + tFromNow);
    this.output.gain.linearRampToValueAtTime(vol, now + tFromNow + rampTime);
  };
  p5.Gain.prototype.dispose = function () {
    // remove reference from soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);
    if (this.output) {
      this.output.disconnect();
      delete this.output;
    }
    if (this.input) {
      this.input.disconnect();
      delete this.input;
    }
  };
}(master);
var audioVoice;
'use strict';
audioVoice = function () {
  var p5sound = master;
  /**
   * Base class for monophonic synthesizers. Any extensions of this class
   * should follow the API and implement the methods below in order to 
   * remain compatible with p5.PolySynth();
   *
   * @class p5.AudioVoice
   * @constructor
   */
  p5.AudioVoice = function () {
    this.ac = p5sound.audiocontext;
    this.output = this.ac.createGain();
    this.connect();
    p5sound.soundArray.push(this);
  };
  p5.AudioVoice.prototype.play = function (note, velocity, secondsFromNow, sustime) {
  };
  p5.AudioVoice.prototype.triggerAttack = function (note, velocity, secondsFromNow) {
  };
  p5.AudioVoice.prototype.triggerRelease = function (secondsFromNow) {
  };
  p5.AudioVoice.prototype.amp = function (vol, rampTime) {
  };
  /**
   * Connect to p5 objects or Web Audio Nodes
   * @method  connect
   * @param {Object} unit 
   */
  p5.AudioVoice.prototype.connect = function (unit) {
    var u = unit || p5sound.input;
    this.output.connect(u.input ? u.input : u);
  };
  /**
   * Disconnect from soundOut
   * @method  disconnect
   */
  p5.AudioVoice.prototype.disconnect = function () {
    this.output.disconnect();
  };
  p5.AudioVoice.prototype.dispose = function () {
    if (this.output) {
      this.output.disconnect();
      delete this.output;
    }
  };
  return p5.AudioVoice;
}(master);
var monosynth;
'use strict';
monosynth = function () {
  var p5sound = master;
  var AudioVoice = audioVoice;
  var noteToFreq = helpers.noteToFreq;
  var DEFAULT_SUSTAIN = 0.15;
  /**
  *  A MonoSynth is used as a single voice for sound synthesis.
  *  This is a class to be used in conjunction with the PolySynth
  *  class. Custom synthetisers should be built inheriting from
  *  this class.
  *
  *  @class p5.MonoSynth
  *  @constructor
  *  @example
  *  <div><code>
  *  let monoSynth;
  *
  *  function setup() {
  *    let cnv = createCanvas(100, 100);
  *    cnv.mousePressed(playSynth);
  *
  *    monoSynth = new p5.MonoSynth();
  *
  *    textAlign(CENTER);
  *    text('click to play', width/2, height/2);
  *  }
  *
  *  function playSynth() {
  *    // time from now (in seconds)
  *    let time = 0;
  *    // note duration (in seconds)
  *    let dur = 0.25;
  *    // velocity (volume, from 0 to 1)
  *    let v = 0.2;
  *
  *    monoSynth.play("G3", v, time, dur);
  *    monoSynth.play("C4", v, time += dur, dur);
  *
  *    background(random(255), random(255), 255);
  *    text('click to play', width/2, height/2);
  *  }
  *  </code></div>
  **/
  p5.MonoSynth = function () {
    AudioVoice.call(this);
    this.oscillator = new p5.Oscillator();
    this.env = new p5.Envelope();
    this.env.setRange(1, 0);
    this.env.setExp(true);
    //set params
    this.setADSR(0.02, 0.25, 0.05, 0.35);
    // oscillator --> env --> this.output (gain) --> p5.soundOut
    this.oscillator.disconnect();
    this.oscillator.connect(this.output);
    this.env.disconnect();
    this.env.setInput(this.output.gain);
    // reset oscillator gain to 1.0
    this.oscillator.output.gain.value = 1;
    this.oscillator.start();
    this.connect();
    p5sound.soundArray.push(this);
  };
  p5.MonoSynth.prototype = Object.create(p5.AudioVoice.prototype);
  /**
  *  Play tells the MonoSynth to start playing a note. This method schedules
  *  the calling of .triggerAttack and .triggerRelease.
  *
  *  @method play
  *  @param {String | Number} note the note you want to play, specified as a
  *                                 frequency in Hertz (Number) or as a midi
  *                                 value in Note/Octave format ("C4", "Eb3"...etc")
  *                                 See <a href = "https://github.com/Tonejs/Tone.js/wiki/Instruments">
  *                                 Tone</a>. Defaults to 440 hz.
  *  @param  {Number} [velocity] velocity of the note to play (ranging from 0 to 1)
  *  @param  {Number} [secondsFromNow]  time from now (in seconds) at which to play
  *  @param  {Number} [sustainTime] time to sustain before releasing the envelope
  *  @example
  *  <div><code>
  *  let monoSynth;
  *
  *  function setup() {
  *    let cnv = createCanvas(100, 100);
  *    cnv.mousePressed(playSynth);
  *
  *    monoSynth = new p5.MonoSynth();
  *
  *    textAlign(CENTER);
  *    text('click to play', width/2, height/2);
  *  }
  *
  *  function playSynth() {
  *    // time from now (in seconds)
  *    let time = 0;
  *    // note duration (in seconds)
  *    let dur = 1/6;
  *    // note velocity (volume, from 0 to 1)
  *    let v = random();
  *
  *    monoSynth.play("Fb3", v, 0, dur);
  *    monoSynth.play("Gb3", v, time += dur, dur);
  *
  *    background(random(255), random(255), 255);
  *    text('click to play', width/2, height/2);
  *  }
  *  </code></div>
  *
  */
  p5.MonoSynth.prototype.play = function (note, velocity, secondsFromNow, susTime) {
    this.triggerAttack(note, velocity, ~~secondsFromNow);
    this.triggerRelease(~~secondsFromNow + (susTime || DEFAULT_SUSTAIN));
  };
  /**
   *  Trigger the Attack, and Decay portion of the Envelope.
   *  Similar to holding down a key on a piano, but it will
   *  hold the sustain level until you let go.
   *
   *  @param {String | Number} note the note you want to play, specified as a
   *                                 frequency in Hertz (Number) or as a midi
   *                                 value in Note/Octave format ("C4", "Eb3"...etc")
   *                                 See <a href = "https://github.com/Tonejs/Tone.js/wiki/Instruments">
   *                                 Tone</a>. Defaults to 440 hz
   *  @param  {Number} [velocity] velocity of the note to play (ranging from 0 to 1)
   *  @param  {Number} [secondsFromNow]  time from now (in seconds) at which to play
   *  @method  triggerAttack
   *  @example
   *  <div><code>
   *  let monoSynth = new p5.MonoSynth();
   *
   *  function mousePressed() {
   *    monoSynth.triggerAttack("E3");
   *  }
   *
   *  function mouseReleased() {
   *    monoSynth.triggerRelease();
   *  }
   *  </code></div>
   */
  p5.MonoSynth.prototype.triggerAttack = function (note, velocity, secondsFromNow) {
    var secondsFromNow = ~~secondsFromNow;
    var freq = noteToFreq(note);
    var vel = velocity || 0.1;
    this.oscillator.freq(freq, 0, secondsFromNow);
    this.env.ramp(this.output.gain, secondsFromNow, vel);
  };
  /**
   *  Trigger the release of the Envelope. This is similar to releasing
   *  the key on a piano and letting the sound fade according to the
   *  release level and release time.
   *
   *  @param  {Number} secondsFromNow time to trigger the release
   *  @method  triggerRelease
   *  @example
   *  <div><code>
   *  let monoSynth = new p5.MonoSynth();
   *
   *  function mousePressed() {
   *    monoSynth.triggerAttack("E3");
   *  }
   *
   *  function mouseReleased() {
   *    monoSynth.triggerRelease();
   *  }
   *  </code></div>
   */
  p5.MonoSynth.prototype.triggerRelease = function (secondsFromNow) {
    var secondsFromNow = secondsFromNow || 0;
    this.env.ramp(this.output.gain, secondsFromNow, 0);
  };
  /**
   *  Set values like a traditional
   *  <a href="https://en.wikipedia.org/wiki/Synthesizer#/media/File:ADSR_parameter.svg">
   *  ADSR envelope
   *  </a>.
   *
   *  @method  setADSR
   *  @param {Number} attackTime    Time (in seconds before envelope
   *                                reaches Attack Level
   *  @param {Number} [decayTime]    Time (in seconds) before envelope
   *                                reaches Decay/Sustain Level
   *  @param {Number} [susRatio]    Ratio between attackLevel and releaseLevel, on a scale from 0 to 1,
   *                                where 1.0 = attackLevel, 0.0 = releaseLevel.
   *                                The susRatio determines the decayLevel and the level at which the
   *                                sustain portion of the envelope will sustain.
   *                                For example, if attackLevel is 0.4, releaseLevel is 0,
   *                                and susAmt is 0.5, the decayLevel would be 0.2. If attackLevel is
   *                                increased to 1.0 (using <code>setRange</code>),
   *                                then decayLevel would increase proportionally, to become 0.5.
   *  @param {Number} [releaseTime]   Time in seconds from now (defaults to 0)
   */
  p5.MonoSynth.prototype.setADSR = function (attack, decay, sustain, release) {
    this.env.setADSR(attack, decay, sustain, release);
  };
  /**
   * Getters and Setters
   * @property {Number} attack
   */
  /**
   * @property {Number} decay
   */
  /**
   * @property {Number} sustain
   */
  /**
   * @property {Number} release
   */
  Object.defineProperties(p5.MonoSynth.prototype, {
    'attack': {
      get: function () {
        return this.env.aTime;
      },
      set: function (attack) {
        this.env.setADSR(attack, this.env.dTime, this.env.sPercent, this.env.rTime);
      }
    },
    'decay': {
      get: function () {
        return this.env.dTime;
      },
      set: function (decay) {
        this.env.setADSR(this.env.aTime, decay, this.env.sPercent, this.env.rTime);
      }
    },
    'sustain': {
      get: function () {
        return this.env.sPercent;
      },
      set: function (sustain) {
        this.env.setADSR(this.env.aTime, this.env.dTime, sustain, this.env.rTime);
      }
    },
    'release': {
      get: function () {
        return this.env.rTime;
      },
      set: function (release) {
        this.env.setADSR(this.env.aTime, this.env.dTime, this.env.sPercent, release);
      }
    }
  });
  /**
   * MonoSynth amp
   * @method  amp
   * @param  {Number} vol      desired volume
   * @param  {Number} [rampTime] Time to reach new volume
   * @return {Number}          new volume value
   */
  p5.MonoSynth.prototype.amp = function (vol, rampTime) {
    var t = rampTime || 0;
    if (typeof vol !== 'undefined') {
      this.oscillator.amp(vol, t);
    }
    return this.oscillator.amp().value;
  };
  /**
   *  Connect to a p5.sound / Web Audio object.
   *
   *  @method  connect
   *  @param  {Object} unit A p5.sound or Web Audio object
   */
  p5.MonoSynth.prototype.connect = function (unit) {
    var u = unit || p5sound.input;
    this.output.connect(u.input ? u.input : u);
  };
  /**
   *  Disconnect all outputs
   *
   *  @method  disconnect
   */
  p5.MonoSynth.prototype.disconnect = function () {
    if (this.output) {
      this.output.disconnect();
    }
  };
  /**
   *  Get rid of the MonoSynth and free up its resources / memory.
   *
   *  @method  dispose
   */
  p5.MonoSynth.prototype.dispose = function () {
    AudioVoice.prototype.dispose.apply(this);
    if (this.env) {
      this.env.dispose();
    }
    if (this.oscillator) {
      this.oscillator.dispose();
    }
  };
}(master, audioVoice, helpers);
var polysynth;
'use strict';
polysynth = function () {
  var p5sound = master;
  var TimelineSignal = Tone_signal_TimelineSignal;
  var noteToFreq = helpers.noteToFreq;
  /**
  *  An AudioVoice is used as a single voice for sound synthesis.
  *  The PolySynth class holds an array of AudioVoice, and deals
  *  with voices allocations, with setting notes to be played, and
  *  parameters to be set.
  *
  *  @class p5.PolySynth
  *  @constructor
  *
  *  @param {Number} [synthVoice]   A monophonic synth voice inheriting
  *                                 the AudioVoice class. Defaults to p5.MonoSynth
  *  @param {Number} [maxVoices] Number of voices, defaults to 8;
  *  @example
  *  <div><code>
  *  let polySynth;
  *
  *  function setup() {
  *    let cnv = createCanvas(100, 100);
  *    cnv.mousePressed(playSynth);
  *
  *    polySynth = new p5.PolySynth();
  *
  *    textAlign(CENTER);
  *    text('click to play', width/2, height/2);
  *  }
  *
  *  function playSynth() {
  *    // note duration (in seconds)
  *    let dur = 1.5;
  *
  *    // time from now (in seconds)
  *    let time = 0;
  *
  *    // velocity (volume, from 0 to 1)
  *    let vel = 0.1;
  *
  *    // notes can overlap with each other
  *    polySynth.play("G2", vel, 0, dur);
  *    polySynth.play("C3", vel, time += 1/3, dur);
  *    polySynth.play("G3", vel, time += 1/3, dur);
  *
  *    background(random(255), random(255), 255);
  *    text('click to play', width/2, height/2);
  *  }
  *  </code></div>
  **/
  p5.PolySynth = function (audioVoice, maxVoices) {
    //audiovoices will contain maxVoices many monophonic synths
    this.audiovoices = [];
    /**
     * An object that holds information about which notes have been played and
     * which notes are currently being played. New notes are added as keys
     * on the fly. While a note has been attacked, but not released, the value of the
     * key is the audiovoice which is generating that note. When notes are released,
     * the value of the key becomes undefined.
     * @property notes
     */
    this.notes = {};
    //indices of the most recently used, and least recently used audiovoice
    this._newest = 0;
    this._oldest = 0;
    /**
     * A PolySynth must have at least 1 voice, defaults to 8
     * @property polyvalue
     */
    this.maxVoices = maxVoices || 8;
    /**
     * Monosynth that generates the sound for each note that is triggered. The
     * p5.PolySynth defaults to using the p5.MonoSynth as its voice.
     * @property AudioVoice
     */
    this.AudioVoice = audioVoice === undefined ? p5.MonoSynth : audioVoice;
    /**
       * This value must only change as a note is attacked or released. Due to delay
       * and sustain times, Tone.TimelineSignal is required to schedule the change in value.
    * @private
       * @property {Tone.TimelineSignal} _voicesInUse
       */
    this._voicesInUse = new TimelineSignal(0);
    this.output = p5sound.audiocontext.createGain();
    this.connect();
    //Construct the appropriate number of audiovoices
    this._allocateVoices();
    p5sound.soundArray.push(this);
  };
  /**
   * Construct the appropriate number of audiovoices
   * @private
   * @method  _allocateVoices
   */
  p5.PolySynth.prototype._allocateVoices = function () {
    for (var i = 0; i < this.maxVoices; i++) {
      this.audiovoices.push(new this.AudioVoice());
      this.audiovoices[i].disconnect();
      this.audiovoices[i].connect(this.output);
    }
  };
  /**
   *  Play a note by triggering noteAttack and noteRelease with sustain time
   *
   *  @method  play
   *  @param  {Number} [note] midi note to play (ranging from 0 to 127 - 60 being a middle C)
   *  @param  {Number} [velocity] velocity of the note to play (ranging from 0 to 1)
   *  @param  {Number} [secondsFromNow]  time from now (in seconds) at which to play
   *  @param  {Number} [sustainTime] time to sustain before releasing the envelope
   *  @example
   *  <div><code>
   *  let polySynth;
   *
   *  function setup() {
   *    let cnv = createCanvas(100, 100);
   *    cnv.mousePressed(playSynth);
   *
   *    polySynth = new p5.PolySynth();
   *
   *    textAlign(CENTER);
   *    text('click to play', width/2, height/2);
   *  }
   *
   *  function playSynth() {
   *    // note duration (in seconds)
   *    let dur = 0.1;
   *
   *    // time from now (in seconds)
   *    let time = 0;
   *
   *    // velocity (volume, from 0 to 1)
   *    let vel = 0.1;
   *
   *    polySynth.play("G2", vel, 0, dur);
   *    polySynth.play("C3", vel, 0, dur);
   *    polySynth.play("G3", vel, 0, dur);
   *
   *    background(random(255), random(255), 255);
   *    text('click to play', width/2, height/2);
   *  }
   *  </code></div>
   */
  p5.PolySynth.prototype.play = function (note, velocity, secondsFromNow, susTime) {
    var susTime = susTime || 1;
    this.noteAttack(note, velocity, secondsFromNow);
    this.noteRelease(note, secondsFromNow + susTime);
  };
  /**
   *  noteADSR sets the envelope for a specific note that has just been triggered.
   *  Using this method modifies the envelope of whichever audiovoice is being used
   *  to play the desired note. The envelope should be reset before noteRelease is called
   *  in order to prevent the modified envelope from being used on other notes.
   *
   *  @method  noteADSR
   *  @param {Number} [note]        Midi note on which ADSR should be set.
   *  @param {Number} [attackTime]  Time (in seconds before envelope
   *                                reaches Attack Level
   *  @param {Number} [decayTime]   Time (in seconds) before envelope
   *                                reaches Decay/Sustain Level
   *  @param {Number} [susRatio]    Ratio between attackLevel and releaseLevel, on a scale from 0 to 1,
   *                                where 1.0 = attackLevel, 0.0 = releaseLevel.
   *                                The susRatio determines the decayLevel and the level at which the
   *                                sustain portion of the envelope will sustain.
   *                                For example, if attackLevel is 0.4, releaseLevel is 0,
   *                                and susAmt is 0.5, the decayLevel would be 0.2. If attackLevel is
   *                                increased to 1.0 (using <code>setRange</code>),
   *                                then decayLevel would increase proportionally, to become 0.5.
   *  @param {Number} [releaseTime]   Time in seconds from now (defaults to 0)
   **/
  p5.PolySynth.prototype.noteADSR = function (note, a, d, s, r, timeFromNow) {
    var now = p5sound.audiocontext.currentTime;
    var timeFromNow = timeFromNow || 0;
    var t = now + timeFromNow;
    this.audiovoices[this.notes[note].getValueAtTime(t)].setADSR(a, d, s, r);
  };
  /**
   * Set the PolySynths global envelope. This method modifies the envelopes of each
   * monosynth so that all notes are played with this envelope.
   *
   *  @method  setADSR
   *  @param {Number} [attackTime]  Time (in seconds before envelope
   *                                reaches Attack Level
   *  @param {Number} [decayTime]   Time (in seconds) before envelope
   *                                reaches Decay/Sustain Level
   *  @param {Number} [susRatio]    Ratio between attackLevel and releaseLevel, on a scale from 0 to 1,
   *                                where 1.0 = attackLevel, 0.0 = releaseLevel.
   *                                The susRatio determines the decayLevel and the level at which the
   *                                sustain portion of the envelope will sustain.
   *                                For example, if attackLevel is 0.4, releaseLevel is 0,
   *                                and susAmt is 0.5, the decayLevel would be 0.2. If attackLevel is
   *                                increased to 1.0 (using <code>setRange</code>),
   *                                then decayLevel would increase proportionally, to become 0.5.
   *  @param {Number} [releaseTime]   Time in seconds from now (defaults to 0)
   **/
  p5.PolySynth.prototype.setADSR = function (a, d, s, r) {
    this.audiovoices.forEach(function (voice) {
      voice.setADSR(a, d, s, r);
    });
  };
  /**
   *  Trigger the Attack, and Decay portion of a MonoSynth.
   *  Similar to holding down a key on a piano, but it will
   *  hold the sustain level until you let go.
   *
   *  @method  noteAttack
   *  @param  {Number} [note]           midi note on which attack should be triggered.
   *  @param  {Number} [velocity]       velocity of the note to play (ranging from 0 to 1)/
   *  @param  {Number} [secondsFromNow] time from now (in seconds)
   *  @example
   *  <div><code>
   *  let polySynth = new p5.PolySynth();
   *  let pitches = ["G", "D", "G", "C"];
   *  let octaves = [2, 3, 4];
   *
   *  function mousePressed() {
   *    // play a chord: multiple notes at the same time
   *    for (let i = 0; i < 4; i++) {
   *      let note = random(pitches) + random(octaves);
   *      polySynth.noteAttack(note, 0.1);
   *    }
   *  }
   *
   *  function mouseReleased() {
   *    // release all voices
   *    polySynth.noteRelease();
   *  }
   *  </code></div>
   */
  p5.PolySynth.prototype.noteAttack = function (_note, _velocity, secondsFromNow) {
    //this value goes to the audiovoices which handle their own scheduling
    var secondsFromNow = ~~secondsFromNow;
    //this value is used by this._voicesInUse
    var acTime = p5sound.audiocontext.currentTime + secondsFromNow;
    //Convert note to frequency if necessary. This is because entries into this.notes
    //should be based on frequency for the sake of consistency.
    var note = noteToFreq(_note);
    var velocity = _velocity || 0.1;
    var currentVoice;
    //Release the note if it is already playing
    if (this.notes[note] && this.notes[note].getValueAtTime(acTime) !== null) {
      this.noteRelease(note, 0);
    }
    //Check to see how many voices are in use at the time the note will start
    if (this._voicesInUse.getValueAtTime(acTime) < this.maxVoices) {
      currentVoice = Math.max(~~this._voicesInUse.getValueAtTime(acTime), 0);
    } else {
      currentVoice = this._oldest;
      var oldestNote = p5.prototype.freqToMidi(this.audiovoices[this._oldest].oscillator.freq().value);
      this.noteRelease(oldestNote);
      this._oldest = (this._oldest + 1) % (this.maxVoices - 1);
    }
    //Overrite the entry in the notes object. A note (frequency value)
    //corresponds to the index of the audiovoice that is playing it
    this.notes[note] = new TimelineSignal();
    this.notes[note].setValueAtTime(currentVoice, acTime);
    //Find the scheduled change in this._voicesInUse that will be previous to this new note
    //Add 1 and schedule this value at time 't', when this note will start playing
    var previousVal = this._voicesInUse._searchBefore(acTime) === null ? 0 : this._voicesInUse._searchBefore(acTime).value;
    this._voicesInUse.setValueAtTime(previousVal + 1, acTime);
    //Then update all scheduled values that follow to increase by 1
    this._updateAfter(acTime, 1);
    this._newest = currentVoice;
    //The audiovoice handles the actual scheduling of the note
    if (typeof velocity === 'number') {
      var maxRange = 1 / this._voicesInUse.getValueAtTime(acTime) * 2;
      velocity = velocity > maxRange ? maxRange : velocity;
    }
    this.audiovoices[currentVoice].triggerAttack(note, velocity, secondsFromNow);
  };
  /**
   * Private method to ensure accurate values of this._voicesInUse
   * Any time a new value is scheduled, it is necessary to increment all subsequent
   * scheduledValues after attack, and decrement all subsequent
   * scheduledValues after release
   *
   * @private
   * @param  {[type]} time  [description]
   * @param  {[type]} value [description]
   * @return {[type]}       [description]
   */
  p5.PolySynth.prototype._updateAfter = function (time, value) {
    if (this._voicesInUse._searchAfter(time) === null) {
      return;
    } else {
      this._voicesInUse._searchAfter(time).value += value;
      var nextTime = this._voicesInUse._searchAfter(time).time;
      this._updateAfter(nextTime, value);
    }
  };
  /**
   *  Trigger the Release of an AudioVoice note. This is similar to releasing
   *  the key on a piano and letting the sound fade according to the
   *  release level and release time.
   *
   *  @method  noteRelease
   *  @param  {Number} [note]           midi note on which attack should be triggered.
   *                                    If no value is provided, all notes will be released.
   *  @param  {Number} [secondsFromNow] time to trigger the release
   *  @example
   *  <div><code>
   *  let pitches = ["G", "D", "G", "C"];
   *  let octaves = [2, 3, 4];
   *  let polySynth = new p5.PolySynth();
   *
   *  function mousePressed() {
   *    // play a chord: multiple notes at the same time
   *    for (let i = 0; i < 4; i++) {
   *      let note = random(pitches) + random(octaves);
   *      polySynth.noteAttack(note, 0.1);
   *    }
   *  }
   *
   *  function mouseReleased() {
   *    // release all voices
   *    polySynth.noteRelease();
   *  }
   *  </code></div>
   *
   */
  p5.PolySynth.prototype.noteRelease = function (_note, secondsFromNow) {
    var now = p5sound.audiocontext.currentTime;
    var tFromNow = secondsFromNow || 0;
    var t = now + tFromNow;
    // if a note value is not provided, release all voices
    if (!_note) {
      this.audiovoices.forEach(function (voice) {
        voice.triggerRelease(tFromNow);
      });
      this._voicesInUse.setValueAtTime(0, t);
      for (var n in this.notes) {
        this.notes[n].dispose();
        delete this.notes[n];
      }
      return;
    }
    //Make sure note is in frequency inorder to query the this.notes object
    var note = noteToFreq(_note);
    if (!this.notes[note] || this.notes[note].getValueAtTime(t) === null) {
      console.warn('Cannot release a note that is not already playing');
    } else {
      //Find the scheduled change in this._voicesInUse that will be previous to this new note
      //subtract 1 and schedule this value at time 't', when this note will stop playing
      var previousVal = Math.max(~~this._voicesInUse.getValueAtTime(t).value, 1);
      this._voicesInUse.setValueAtTime(previousVal - 1, t);
      //Then update all scheduled values that follow to decrease by 1 but never go below 0
      if (previousVal > 0) {
        this._updateAfter(t, -1);
      }
      this.audiovoices[this.notes[note].getValueAtTime(t)].triggerRelease(tFromNow);
      this.notes[note].dispose();
      delete this.notes[note];
      this._newest = this._newest === 0 ? 0 : (this._newest - 1) % (this.maxVoices - 1);
    }
  };
  /**
  *  Connect to a p5.sound / Web Audio object.
  *
  *  @method  connect
  *  @param  {Object} unit A p5.sound or Web Audio object
  */
  p5.PolySynth.prototype.connect = function (unit) {
    var u = unit || p5sound.input;
    this.output.connect(u.input ? u.input : u);
  };
  /**
  *  Disconnect all outputs
  *
  *  @method  disconnect
  */
  p5.PolySynth.prototype.disconnect = function () {
    if (this.output) {
      this.output.disconnect();
    }
  };
  /**
  *  Get rid of the MonoSynth and free up its resources / memory.
  *
  *  @method  dispose
  */
  p5.PolySynth.prototype.dispose = function () {
    this.audiovoices.forEach(function (voice) {
      voice.dispose();
    });
    if (this.output) {
      this.output.disconnect();
      delete this.output;
    }
  };
}(master, Tone_signal_TimelineSignal, helpers);
var distortion;
'use strict';
distortion = function () {
  var Effect = effect;
  /*
   * Adapted from [Kevin Ennis on StackOverflow](http://stackoverflow.com/questions/22312841/waveshaper-node-in-webaudio-how-to-emulate-distortion)
   */
  function makeDistortionCurve(amount) {
    var k = typeof amount === 'number' ? amount : 50;
    var numSamples = 44100;
    var curve = new Float32Array(numSamples);
    var deg = Math.PI / 180;
    var i = 0;
    var x;
    for (; i < numSamples; ++i) {
      x = i * 2 / numSamples - 1;
      curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }
  /**
   * A Distortion effect created with a Waveshaper Node,
   * with an approach adapted from
   * [Kevin Ennis](http://stackoverflow.com/questions/22312841/waveshaper-node-in-webaudio-how-to-emulate-distortion)
   * 
   * This class extends <a href = "/reference/#/p5.Effect">p5.Effect</a>.  
   * Methods <a href = "/reference/#/p5.Effect/amp">amp()</a>, <a href = "/reference/#/p5.Effect/chain">chain()</a>, 
   * <a href = "/reference/#/p5.Effect/drywet">drywet()</a>, <a href = "/reference/#/p5.Effect/connect">connect()</a>, and 
   * <a href = "/reference/#/p5.Effect/disconnect">disconnect()</a> are available.
   * 
   * @class p5.Distortion
   * @extends p5.Effect
   * @constructor
   * @param {Number} [amount=0.25] Unbounded distortion amount.
   *                                Normal values range from 0-1.
   * @param {String} [oversample='none'] 'none', '2x', or '4x'.
   *
   */
  p5.Distortion = function (amount, oversample) {
    Effect.call(this);
    if (typeof amount === 'undefined') {
      amount = 0.25;
    }
    if (typeof amount !== 'number') {
      throw new Error('amount must be a number');
    }
    if (typeof oversample === 'undefined') {
      oversample = '2x';
    }
    if (typeof oversample !== 'string') {
      throw new Error('oversample must be a String');
    }
    var curveAmount = p5.prototype.map(amount, 0, 1, 0, 2000);
    /**
     *  The p5.Distortion is built with a
     *  <a href="http://www.w3.org/TR/webaudio/#WaveShaperNode">
     *  Web Audio WaveShaper Node</a>.
     *
     *  @property {AudioNode} WaveShaperNode
     */
    this.waveShaperNode = this.ac.createWaveShaper();
    this.amount = curveAmount;
    this.waveShaperNode.curve = makeDistortionCurve(curveAmount);
    this.waveShaperNode.oversample = oversample;
    this.input.connect(this.waveShaperNode);
    this.waveShaperNode.connect(this.wet);
  };
  p5.Distortion.prototype = Object.create(Effect.prototype);
  /**
   * Process a sound source, optionally specify amount and oversample values.
   *
   * @method process
   * @param {Number} [amount=0.25] Unbounded distortion amount.
   *                                Normal values range from 0-1.
   * @param {String} [oversample='none'] 'none', '2x', or '4x'.
   */
  p5.Distortion.prototype.process = function (src, amount, oversample) {
    src.connect(this.input);
    this.set(amount, oversample);
  };
  /**
   * Set the amount and oversample of the waveshaper distortion.
   *
   * @method set
   * @param {Number} [amount=0.25] Unbounded distortion amount.
   *                                Normal values range from 0-1.
   * @param {String} [oversample='none'] 'none', '2x', or '4x'.
   */
  p5.Distortion.prototype.set = function (amount, oversample) {
    if (amount) {
      var curveAmount = p5.prototype.map(amount, 0, 1, 0, 2000);
      this.amount = curveAmount;
      this.waveShaperNode.curve = makeDistortionCurve(curveAmount);
    }
    if (oversample) {
      this.waveShaperNode.oversample = oversample;
    }
  };
  /**
   *  Return the distortion amount, typically between 0-1.
   *
   *  @method  getAmount
   *  @return {Number} Unbounded distortion amount.
   *                   Normal values range from 0-1.
   */
  p5.Distortion.prototype.getAmount = function () {
    return this.amount;
  };
  /**
   *  Return the oversampling.
   *
   *  @method getOversample
   *
   *  @return {String} Oversample can either be 'none', '2x', or '4x'.
   */
  p5.Distortion.prototype.getOversample = function () {
    return this.waveShaperNode.oversample;
  };
  p5.Distortion.prototype.dispose = function () {
    Effect.prototype.dispose.apply(this);
    if (this.waveShaperNode) {
      this.waveShaperNode.disconnect();
      this.waveShaperNode = null;
    }
  };
}(effect);
var src_app;
'use strict';
src_app = function () {
  var p5SOUND = master;
  return p5SOUND;
}(shims, audiocontext, master, helpers, errorHandler, panner, soundfile, amplitude, fft, signal, oscillator, envelope, pulse, noise, audioin, filter, eq, panner3d, listener3d, delay, reverb, metro, looper, soundloop, compressor, soundRecorder, peakdetect, gain, monosynth, polysynth, distortion, audioVoice, monosynth, polysynth);
}));

;/*! p5.js v0.9.0 July 01, 2019 */

!function(t,e){"function"==typeof define&&define.amd?define("p5.dom",["p5"],function(t){e(t)}):"object"==typeof exports?e(require("../p5")):e(t.p5)}(this,function(d){function l(t){var e=document;return"string"==typeof t&&"#"===t[0]?(t=t.slice(1),e=document.getElementById(t)||document):t instanceof d.Element?e=t.elt:t instanceof HTMLElement&&(e=t),e}function c(t,e,i){(e._userNode?e._userNode:document.body).appendChild(t);var n=i?new d.MediaElement(t,e):new d.Element(t,e);return e._elements.push(n),n}d.prototype.select=function(t,e){d._validateParameters("select",arguments);var i=null,n=l(e);return(i="."===t[0]?(t=t.slice(1),(i=n.getElementsByClassName(t)).length?i[0]:null):"#"===t[0]?(t=t.slice(1),n.getElementById(t)):(i=n.getElementsByTagName(t)).length?i[0]:null)?this._wrapElement(i):null},d.prototype.selectAll=function(t,e){d._validateParameters("selectAll",arguments);var i,n=[],r=l(e);if(i="."===t[0]?(t=t.slice(1),r.getElementsByClassName(t)):r.getElementsByTagName(t))for(var o=0;o<i.length;o++){var s=this._wrapElement(i[o]);n.push(s)}return n},d.prototype._wrapElement=function(t){var e=Array.prototype.slice.call(t.children);if("INPUT"!==t.tagName||"checkbox"!==t.type)return"VIDEO"===t.tagName||"AUDIO"===t.tagName?new d.MediaElement(t,this):"SELECT"===t.tagName?this.createSelect(new d.Element(t,this)):0<e.length&&e.every(function(t){return"INPUT"===t.tagName||"LABEL"===t.tagName})?this.createRadio(new d.Element(t,this)):new d.Element(t,this);var i=new d.Element(t,this);return i.checked=function(){return 0===arguments.length?this.elt.checked:(arguments[0]?this.elt.checked=!0:this.elt.checked=!1,this)},i},d.prototype.removeElements=function(t){d._validateParameters("removeElements",arguments);for(var e=0;e<this._elements.length;e++)this._elements[e].elt instanceof HTMLCanvasElement||this._elements[e].remove()},d.Element.prototype.changed=function(t){return d.Element._adjustListener("change",t,this),this},d.Element.prototype.input=function(t){return d.Element._adjustListener("input",t,this),this};function i(t,e,i,n){var r=document.createElement(e);"string"==typeof(i=i||"")&&(i=[i]);for(var o=0;o<i.length;o++){var s=document.createElement("source");s.src=i[o],r.appendChild(s)}if(void 0!==n){var l=function(){n(),r.removeEventListener("canplaythrough",l)};r.addEventListener("canplaythrough",l)}var a=c(r,t,!0);return a.loadedmetadata=!1,r.addEventListener("loadedmetadata",function(){a.width=r.videoWidth,a.height=r.videoHeight,0===a.elt.width&&(a.elt.width=r.videoWidth),0===a.elt.height&&(a.elt.height=r.videoHeight),a.presetPlaybackRate&&(a.elt.playbackRate=a.presetPlaybackRate,delete a.presetPlaybackRate),a.loadedmetadata=!0}),a}["div","p","span"].forEach(function(i){var t="create"+i.charAt(0).toUpperCase()+i.slice(1);d.prototype[t]=function(t){var e=document.createElement(i);return e.innerHTML=void 0===t?"":t,c(e,this)}}),d.prototype.createImg=function(){d._validateParameters("createImg",arguments);var t=document.createElement("img");t.crossOrigin="Anonymous";var e,i=arguments;return t.src=i[0],1<i.length&&"string"==typeof i[1]&&(t.alt=i[1]),t.onload=function(){e.width=t.offsetWidth||t.width,e.height=t.offsetHeight||t.height,1<i.length&&"function"==typeof i[1]?(e.fn=i[1],e.fn()):1<i.length&&"function"==typeof i[2]&&(e.fn=i[2],e.fn())},e=c(t,this)},d.prototype.createA=function(t,e,i){d._validateParameters("createA",arguments);var n=document.createElement("a");return n.href=t,n.innerHTML=e,i&&(n.target=i),c(n,this)},d.prototype.createSlider=function(t,e,i,n){d._validateParameters("createSlider",arguments);var r=document.createElement("input");return r.type="range",r.min=t,r.max=e,0===n?r.step=1e-18:n&&(r.step=n),"number"==typeof i&&(r.value=i),c(r,this)},d.prototype.createButton=function(t,e){d._validateParameters("createButton",arguments);var i=document.createElement("button");return i.innerHTML=t,e&&(i.value=e),c(i,this)},d.prototype.createCheckbox=function(){d._validateParameters("createCheckbox",arguments);var t=document.createElement("div"),e=document.createElement("input");e.type="checkbox",t.appendChild(e);var i=c(t,this);if(i.checked=function(){var t=i.elt.getElementsByTagName("input")[0];if(t){if(0===arguments.length)return t.checked;arguments[0]?t.checked=!0:t.checked=!1}return i},this.value=function(t){return i.value=t,this},arguments[0]){var n=Math.random().toString(36).slice(2),r=document.createElement("label");e.setAttribute("id",n),r.htmlFor=n,i.value(arguments[0]),r.appendChild(document.createTextNode(arguments[0])),t.appendChild(r)}return arguments[1]&&(e.checked=!0),i},d.prototype.createSelect=function(){var o,t;d._validateParameters("createSelect",arguments);var e=arguments[0];return"object"==typeof e&&"SELECT"===e.elt.nodeName?(t=e,o=this.elt=e.elt):(o=document.createElement("select"),e&&"boolean"==typeof e&&o.setAttribute("multiple","true"),t=c(o,this)),t.option=function(t,e){for(var i,n=0;n<this.elt.length;n++)if(this.elt[n].innerHTML===t){i=n;break}if(void 0!==i)!1===e?this.elt.remove(i):this.elt[i].innerHTML===this.elt[i].value?this.elt[i].innerHTML=this.elt[i].value=e:this.elt[i].value=e;else{var r=document.createElement("option");r.innerHTML=t,1<arguments.length?r.value=e:r.value=t,o.appendChild(r)}},t.selected=function(t){var e,i=[];if(0<arguments.length){for(e=0;e<this.elt.length;e++)t.toString()===this.elt[e].value&&(this.elt.selectedIndex=e);return this}if(this.elt.getAttribute("multiple")){for(e=0;e<this.elt.selectedOptions.length;e++)i.push(this.elt.selectedOptions[e].value);return i}return this.elt.value},t},d.prototype.createRadio=function(t){d._validateParameters("createRadio",arguments);var r,n,e=document.querySelectorAll("input[type=radio]"),o=0;if(1<e.length)for(var i=e.length,s=e[0].name,l=e[1].name,a=o=1;a<i;a++)s!==(l=e[a].name)&&o++,s=l;else 1===e.length&&(o=1);"object"==typeof t?(n=t,r=this.elt=t.elt):(r=document.createElement("div"),n=c(r,this)),n._getInputChildrenArray=function(){return Array.prototype.slice.call(this.elt.children).filter(function(t){return"INPUT"===t.tagName})};var h=-1;return n.option=function(t,e){var i=document.createElement("input");if(i.type="radio",i.innerHTML=t,i.value=e||t,i.setAttribute("name","defaultradio"+o),r.appendChild(i),t){h++;var n=document.createElement("label");i.setAttribute("id","defaultradio"+o+"-"+h),n.htmlFor="defaultradio"+o+"-"+h,n.appendChild(document.createTextNode(t)),r.appendChild(n)}return i},n.selected=function(t){var e,i=n._getInputChildrenArray();if(t){for(e=0;e<i.length;e++)i[e].value===t&&(i[e].checked=!0);return this}for(e=0;e<i.length;e++)if(!0===i[e].checked)return i[e].value},n.value=function(t){var e,i=n._getInputChildrenArray();if(t){for(e=0;e<i.length;e++)i[e].value===t&&(i[e].checked=!0);return this}for(e=0;e<i.length;e++)if(!0===i[e].checked)return i[e].value;return""},n},d.prototype.createColorPicker=function(t){d._validateParameters("createColorPicker",arguments);var e,i=document.createElement("input");return i.type="color",t?t instanceof d.Color?i.value=t.toString("#rrggbb"):(d.prototype._colorMode="rgb",d.prototype._colorMaxes={rgb:[255,255,255,255],hsb:[360,100,100,1],hsl:[360,100,100,1]},i.value=d.prototype.color(t).toString("#rrggbb")):i.value="#000000",(e=c(i,this)).color=function(){return t.mode&&(d.prototype._colorMode=t.mode),t.maxes&&(d.prototype._colorMaxes=t.maxes),d.prototype.color(this.elt.value)},e},d.prototype.createInput=function(t,e){d._validateParameters("createInput",arguments);var i=document.createElement("input");return i.type=e||"text",t&&(i.value=t),c(i,this)},d.prototype.createFileInput=function(r,t){if(d._validateParameters("createFileInput",arguments),window.File&&window.FileReader&&window.FileList&&window.Blob){var e=document.createElement("input");return e.type="file",t&&(e.multiple="multiple"),e.addEventListener("change",function(t){for(var e=t.target.files,i=0;i<e.length;i++){var n=e[i];d.File._load(n,r)}},!1),c(e,this)}console.log("The File APIs are not fully supported in this browser. Cannot create element.")},d.prototype.createVideo=function(t,e){return d._validateParameters("createVideo",arguments),i(this,"video",t,e)},d.prototype.createAudio=function(t,e){return d._validateParameters("createAudio",arguments),i(this,"audio",t,e)},d.prototype.VIDEO="video",d.prototype.AUDIO="audio",void 0===navigator.mediaDevices&&(navigator.mediaDevices={}),void 0===navigator.mediaDevices.getUserMedia&&(navigator.mediaDevices.getUserMedia=function(i){var n=navigator.webkitGetUserMedia||navigator.mozGetUserMedia;return n?new Promise(function(t,e){n.call(navigator,i,t,e)}):Promise.reject(new Error("getUserMedia is not implemented in this browser"))}),d.prototype.createCapture=function(){d._validateParameters("createCapture",arguments);for(var t,e,i=!0,n=!0,r=0;r<arguments.length;r++)arguments[r]===d.prototype.VIDEO?n=!1:arguments[r]===d.prototype.AUDIO?i=!1:"object"==typeof arguments[r]?t=arguments[r]:"function"==typeof arguments[r]&&(e=arguments[r]);if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)throw"getUserMedia not supported in this browser";var o=document.createElement("video");o.setAttribute("playsinline",""),t||(t={video:i,audio:n}),navigator.mediaDevices.getUserMedia(t).then(function(e){try{"srcObject"in o?o.srcObject=e:o.src=window.URL.createObjectURL(e)}catch(t){o.src=e}},function(t){console.log(t)});var s=c(o,this,!0);return s.loadedmetadata=!1,o.addEventListener("loadedmetadata",function(){o.play(),o.width?(s.width=o.videoWidth=o.width,s.height=o.videoHeight=o.height):(s.width=s.elt.width=o.videoWidth,s.height=s.elt.height=o.videoHeight),s.loadedmetadata=!0,e&&e(o.srcObject)}),s},d.prototype.createElement=function(t,e){d._validateParameters("createElement",arguments);var i=document.createElement(t);return void 0!==e&&(i.innerHTML=e),c(i,this)},d.Element.prototype.addClass=function(t){return this.elt.className?this.hasClass(t)||(this.elt.className=this.elt.className+" "+t):this.elt.className=t,this},d.Element.prototype.removeClass=function(t){return this.elt.classList.remove(t),this},d.Element.prototype.hasClass=function(t){return this.elt.classList.contains(t)},d.Element.prototype.toggleClass=function(t){return this.elt.classList.contains(t)?this.elt.classList.remove(t):this.elt.classList.add(t),this},d.Element.prototype.child=function(t){return void 0===t?this.elt.childNodes:("string"==typeof t?("#"===t[0]&&(t=t.substring(1)),t=document.getElementById(t)):t instanceof d.Element&&(t=t.elt),this.elt.appendChild(t),this)},d.Element.prototype.center=function(t){var e=this.elt.style.display,i="none"===this.elt.style.display,n="none"===this.parent().style.display,r={x:this.elt.offsetLeft,y:this.elt.offsetTop};i&&this.show(),this.elt.style.display="block",this.position(0,0),n&&(this.parent().style.display="block");var o=Math.abs(this.parent().offsetWidth-this.elt.offsetWidth),s=Math.abs(this.parent().offsetHeight-this.elt.offsetHeight),l=r.y,a=r.x;return"both"===t||void 0===t?this.position(o/2,s/2):"horizontal"===t?this.position(o/2,l):"vertical"===t&&this.position(a,s/2),this.style("display",e),i&&this.hide(),n&&(this.parent().style.display="none"),this},d.Element.prototype.html=function(){return 0===arguments.length?this.elt.innerHTML:(arguments[1]?this.elt.innerHTML+=arguments[0]:this.elt.innerHTML=arguments[0],this)},d.Element.prototype.position=function(){return 0===arguments.length?{x:this.elt.offsetLeft,y:this.elt.offsetTop}:(this.elt.style.position="absolute",this.elt.style.left=arguments[0]+"px",this.elt.style.top=arguments[1]+"px",this.x=arguments[0],this.y=arguments[1],this)},d.Element.prototype._translate=function(){this.elt.style.position="absolute";var t="";return this.elt.style.transform&&(t=(t=this.elt.style.transform.replace(/translate3d\(.*\)/g,"")).replace(/translate[X-Z]?\(.*\)/g,"")),2===arguments.length?this.elt.style.transform="translate("+arguments[0]+"px, "+arguments[1]+"px)":2<arguments.length&&(this.elt.style.transform="translate3d("+arguments[0]+"px,"+arguments[1]+"px,"+arguments[2]+"px)",3===arguments.length?this.elt.parentElement.style.perspective="1000px":this.elt.parentElement.style.perspective=arguments[3]+"px"),this.elt.style.transform+=t,this},d.Element.prototype._rotate=function(){var t="";return this.elt.style.transform&&(t=(t=this.elt.style.transform.replace(/rotate3d\(.*\)/g,"")).replace(/rotate[X-Z]?\(.*\)/g,"")),1===arguments.length?this.elt.style.transform="rotate("+arguments[0]+"deg)":2===arguments.length?this.elt.style.transform="rotate("+arguments[0]+"deg, "+arguments[1]+"deg)":3===arguments.length&&(this.elt.style.transform="rotateX("+arguments[0]+"deg)",this.elt.style.transform+="rotateY("+arguments[1]+"deg)",this.elt.style.transform+="rotateZ("+arguments[2]+"deg)"),this.elt.style.transform+=t,this},d.Element.prototype.style=function(t,e){if(e instanceof d.Color&&(e="rgba("+e.levels[0]+","+e.levels[1]+","+e.levels[2]+","+e.levels[3]/255+")"),void 0===e){if(-1===t.indexOf(":"))return window.getComputedStyle(this.elt).getPropertyValue(t);for(var i=t.split(";"),n=0;n<i.length;n++){var r=i[n].split(":");r[0]&&r[1]&&(this.elt.style[r[0].trim()]=r[1].trim())}}else if(this.elt.style[t]=e,"width"===t||"height"===t||"left"===t||"top"===t){var o=e.replace(/\D+/g,"");this[t]=parseInt(o,10)}return this},d.Element.prototype.attribute=function(t,e){if(null==this.elt.firstChild||"checkbox"!==this.elt.firstChild.type&&"radio"!==this.elt.firstChild.type)return void 0===e?this.elt.getAttribute(t):(this.elt.setAttribute(t,e),this);if(void 0===e)return this.elt.firstChild.getAttribute(t);for(var i=0;i<this.elt.childNodes.length;i++)this.elt.childNodes[i].setAttribute(t,e)},d.Element.prototype.removeAttribute=function(t){if(null!=this.elt.firstChild&&("checkbox"===this.elt.firstChild.type||"radio"===this.elt.firstChild.type))for(var e=0;e<this.elt.childNodes.length;e++)this.elt.childNodes[e].removeAttribute(t);return this.elt.removeAttribute(t),this},d.Element.prototype.value=function(){return 0<arguments.length?(this.elt.value=arguments[0],this):"range"===this.elt.type?parseFloat(this.elt.value):this.elt.value},d.Element.prototype.show=function(){return this.elt.style.display="block",this},d.Element.prototype.hide=function(){return this.elt.style.display="none",this},d.Element.prototype.size=function(t,e){if(0===arguments.length)return{width:this.elt.offsetWidth,height:this.elt.offsetHeight};var i=t,n=e,r=d.prototype.AUTO;if(i!==r||n!==r){if(i===r?i=e*this.width/this.height:n===r&&(n=t*this.height/this.width),this.elt instanceof HTMLCanvasElement){var o,s={},l=this.elt.getContext("2d");for(o in l)s[o]=l[o];for(o in this.elt.setAttribute("width",i*this._pInst._pixelDensity),this.elt.setAttribute("height",n*this._pInst._pixelDensity),this.elt.style.width=i+"px",this.elt.style.height=n+"px",this._pInst.scale(this._pInst._pixelDensity,this._pInst._pixelDensity),s)this.elt.getContext("2d")[o]=s[o]}else this.elt.style.width=i+"px",this.elt.style.height=n+"px",this.elt.width=i,this.elt.height=n;this.width=this.elt.offsetWidth,this.height=this.elt.offsetHeight,this._pInst&&this._pInst._curElement&&this._pInst._curElement.elt===this.elt&&(this._pInst._setProperty("width",this.elt.offsetWidth),this._pInst._setProperty("height",this.elt.offsetHeight))}return this},d.Element.prototype.remove=function(){for(var t in this._events)this.elt.removeEventListener(t,this._events[t]);this.elt.parentNode&&this.elt.parentNode.removeChild(this.elt)},d.Element.prototype.drop=function(r,o){if(window.File&&window.FileReader&&window.FileList&&window.Blob){if(!this._dragDisabled){this._dragDisabled=!0;var t=function(t){t.preventDefault()};this.elt.addEventListener("dragover",t),this.elt.addEventListener("dragleave",t)}d.Element._attachListener("drop",function(t){t.preventDefault(),"function"==typeof o&&o.call(this,t);for(var e=t.dataTransfer.files,i=0;i<e.length;i++){var n=e[i];d.File._load(n,r)}},this)}else console.log("The File APIs are not fully supported in this browser.");return this},d.MediaElement=function(n,t){d.Element.call(this,n,t);var r=this;this.elt.crossOrigin="anonymous",this._prevTime=0,this._cueIDCounter=0,this._cues=[],(this._pixelsState=this)._pixelDensity=1,this._modified=!1,this._pixelsDirty=!0,this._pixelsTime=-1,Object.defineProperty(r,"src",{get:function(){var t=r.elt.children[0].src,e=r.elt.src===window.location.href?"":r.elt.src;return t===window.location.href?e:t},set:function(t){for(var e=0;e<r.elt.children.length;e++)r.elt.removeChild(r.elt.children[e]);var i=document.createElement("source");i.src=t,n.appendChild(i),r.elt.src=t,r.modified=!0}}),r._onended=function(){},r.elt.onended=function(){r._onended(r)}},d.MediaElement.prototype=Object.create(d.Element.prototype),d.MediaElement.prototype.play=function(){var t;return this.elt.currentTime===this.elt.duration&&(this.elt.currentTime=0),(t=(1<this.elt.readyState||this.elt.load(),this.elt.play()))&&t.catch&&t.catch(function(t){console.log("WARN: Element play method raised an error asynchronously",t)}),this},d.MediaElement.prototype.stop=function(){return this.elt.pause(),this.elt.currentTime=0,this},d.MediaElement.prototype.pause=function(){return this.elt.pause(),this},d.MediaElement.prototype.loop=function(){return this.elt.setAttribute("loop",!0),this.play(),this},d.MediaElement.prototype.noLoop=function(){return this.elt.setAttribute("loop",!1),this},d.MediaElement.prototype.autoplay=function(t){return this.elt.setAttribute("autoplay",t),this},d.MediaElement.prototype.volume=function(t){if(void 0===t)return this.elt.volume;this.elt.volume=t},d.MediaElement.prototype.speed=function(t){if(void 0===t)return this.presetPlaybackRate||this.elt.playbackRate;this.loadedmetadata?this.elt.playbackRate=t:this.presetPlaybackRate=t},d.MediaElement.prototype.time=function(t){return void 0===t?this.elt.currentTime:(this.elt.currentTime=t,this)},d.MediaElement.prototype.duration=function(){return this.elt.duration},d.MediaElement.prototype.pixels=[],d.MediaElement.prototype._ensureCanvas=function(){if(this.canvas||(this.canvas=document.createElement("canvas"),this.drawingContext=this.canvas.getContext("2d"),this.setModified(!0)),this.loadedmetadata){this.canvas.width!==this.elt.width&&(this.canvas.width=this.elt.width,this.canvas.height=this.elt.height,this.width=this.canvas.width,this.height=this.canvas.height,this._pixelsDirty=!0);var t=this.elt.currentTime;(this._pixelsDirty||this._pixelsTime!==t)&&(this._pixelsTime=t,this._pixelsDirty=!0,this.drawingContext.drawImage(this.elt,0,0,this.canvas.width,this.canvas.height),this.setModified(!0))}},d.MediaElement.prototype.loadPixels=function(){return this._ensureCanvas(),d.Renderer2D.prototype.loadPixels.apply(this,arguments)},d.MediaElement.prototype.updatePixels=function(t,e,i,n){return this.loadedmetadata&&(this._ensureCanvas(),d.Renderer2D.prototype.updatePixels.call(this,t,e,i,n)),this.setModified(!0),this},d.MediaElement.prototype.get=function(){return this._ensureCanvas(),d.Renderer2D.prototype.get.apply(this,arguments)},d.MediaElement.prototype._getPixel=function(){return this.loadPixels(),d.Renderer2D.prototype._getPixel.apply(this,arguments)},d.MediaElement.prototype.set=function(t,e,i){this.loadedmetadata&&(this._ensureCanvas(),d.Renderer2D.prototype.set.call(this,t,e,i),this.setModified(!0))},d.MediaElement.prototype.copy=function(){this._ensureCanvas(),d.Renderer2D.prototype.copy.apply(this,arguments)},d.MediaElement.prototype.mask=function(){this.loadPixels(),this.setModified(!0),d.Image.prototype.mask.apply(this,arguments)},d.MediaElement.prototype.isModified=function(){return this._modified},d.MediaElement.prototype.setModified=function(t){this._modified=t},d.MediaElement.prototype.onended=function(t){return this._onended=t,this},d.MediaElement.prototype.connect=function(t){var e,i;if("function"==typeof d.prototype.getAudioContext)e=d.prototype.getAudioContext(),i=d.soundOut.input;else try{i=(e=t.context).destination}catch(t){throw"connect() is meant to be used with Web Audio API or p5.sound.js"}this.audioSourceNode||(this.audioSourceNode=e.createMediaElementSource(this.elt),this.audioSourceNode.connect(i)),t?t.input?this.audioSourceNode.connect(t.input):this.audioSourceNode.connect(t):this.audioSourceNode.connect(i)},d.MediaElement.prototype.disconnect=function(){if(!this.audioSourceNode)throw"nothing to disconnect";this.audioSourceNode.disconnect()},d.MediaElement.prototype.showControls=function(){this.elt.style["text-align"]="inherit",this.elt.controls=!0},d.MediaElement.prototype.hideControls=function(){this.elt.controls=!1};var o=function(t,e,i,n){this.callback=t,this.time=e,this.id=i,this.val=n};d.MediaElement.prototype.addCue=function(t,e,i){var n=this._cueIDCounter++,r=new o(e,t,n,i);return this._cues.push(r),this.elt.ontimeupdate||(this.elt.ontimeupdate=this._onTimeUpdate.bind(this)),n},d.MediaElement.prototype.removeCue=function(t){for(var e=0;e<this._cues.length;e++)this._cues[e].id===t&&(console.log(t),this._cues.splice(e,1));0===this._cues.length&&(this.elt.ontimeupdate=null)},d.MediaElement.prototype.clearCues=function(){this._cues=[],this.elt.ontimeupdate=null},d.MediaElement.prototype._onTimeUpdate=function(){for(var t=this.time(),e=0;e<this._cues.length;e++){var i=this._cues[e].time,n=this._cues[e].val;this._prevTime<i&&i<=t&&this._cues[e].callback(n)}this._prevTime=t},d.File=function(t,e){this.file=t,this._pInst=e;var i=t.type.split("/");this.type=i[0],this.subtype=i[1],this.name=t.name,this.size=t.size,this.data=void 0},d.File._createLoader=function(i,n){var t=new FileReader;return t.onload=function(t){var e=new d.File(i);e.data=t.target.result,n(e)},t},d.File._load=function(t,e){if(/^text\//.test(t.type))d.File._createLoader(t,e).readAsText(t);else if(/^(video|audio)\//.test(t.type)){var i=new d.File(t);i.data=URL.createObjectURL(t),e(i)}else d.File._createLoader(t,e).readAsDataURL(t)}});
;
//# sourceMappingURL=scripts.js.map
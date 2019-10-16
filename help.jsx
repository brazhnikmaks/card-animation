/**
 * dat-gui JavaScript Controller Library
 * http://code.google.com/p/dat-gui
 *
 * Copyright 2011 Data Arts Team, Google Creative Lab
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

function ___$insertStyle(css) {
  if (!css) {
    return;
  }
  if (typeof window === 'undefined') {
    return;
  }

  var style = document.createElement('style');

  style.setAttribute('type', 'text/css');
  style.innerHTML = css;
  document.head.appendChild(style);

  return css;
}

function colorToString (color, forceCSSHex) {
  var colorFormat = color.__state.conversionName.toString();
  var r = Math.round(color.r);
  var g = Math.round(color.g);
  var b = Math.round(color.b);
  var a = color.a;
  var h = Math.round(color.h);
  var s = color.s.toFixed(1);
  var v = color.v.toFixed(1);
  if (forceCSSHex || colorFormat === 'THREE_CHAR_HEX' || colorFormat === 'SIX_CHAR_HEX') {
    var str = color.hex.toString(16);
    while (str.length < 6) {
      str = '0' + str;
    }
    return '#' + str;
  } else if (colorFormat === 'CSS_RGB') {
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  } else if (colorFormat === 'CSS_RGBA') {
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  } else if (colorFormat === 'HEX') {
    return '0x' + color.hex.toString(16);
  } else if (colorFormat === 'RGB_ARRAY') {
    return '[' + r + ',' + g + ',' + b + ']';
  } else if (colorFormat === 'RGBA_ARRAY') {
    return '[' + r + ',' + g + ',' + b + ',' + a + ']';
  } else if (colorFormat === 'RGB_OBJ') {
    return '{r:' + r + ',g:' + g + ',b:' + b + '}';
  } else if (colorFormat === 'RGBA_OBJ') {
    return '{r:' + r + ',g:' + g + ',b:' + b + ',a:' + a + '}';
  } else if (colorFormat === 'HSV_OBJ') {
    return '{h:' + h + ',s:' + s + ',v:' + v + '}';
  } else if (colorFormat === 'HSVA_OBJ') {
    return '{h:' + h + ',s:' + s + ',v:' + v + ',a:' + a + '}';
  }
  return 'unknown format';
}

var ARR_EACH = Array.prototype.forEach;
var ARR_SLICE = Array.prototype.slice;
var Common = {
  BREAK: {},
  extend: function extend(target) {
    this.each(ARR_SLICE.call(arguments, 1), function (obj) {
      var keys = this.isObject(obj) ? Object.keys(obj) : [];
      keys.forEach(function (key) {
        if (!this.isUndefined(obj[key])) {
          target[key] = obj[key];
        }
      }.bind(this));
    }, this);
    return target;
  },
  defaults: function defaults(target) {
    this.each(ARR_SLICE.call(arguments, 1), function (obj) {
      var keys = this.isObject(obj) ? Object.keys(obj) : [];
      keys.forEach(function (key) {
        if (this.isUndefined(target[key])) {
          target[key] = obj[key];
        }
      }.bind(this));
    }, this);
    return target;
  },
  compose: function compose() {
    var toCall = ARR_SLICE.call(arguments);
    return function () {
      var args = ARR_SLICE.call(arguments);
      for (var i = toCall.length - 1; i >= 0; i--) {
        args = [toCall[i].apply(this, args)];
      }
      return args[0];
    };
  },
  each: function each(obj, itr, scope) {
    if (!obj) {
      return;
    }
    if (ARR_EACH && obj.forEach && obj.forEach === ARR_EACH) {
      obj.forEach(itr, scope);
    } else if (obj.length === obj.length + 0) {
      var key = void 0;
      var l = void 0;
      for (key = 0, l = obj.length; key < l; key++) {
        if (key in obj && itr.call(scope, obj[key], key) === this.BREAK) {
          return;
        }
      }
    } else {
      for (var _key in obj) {
        if (itr.call(scope, obj[_key], _key) === this.BREAK) {
          return;
        }
      }
    }
  },
  defer: function defer(fnc) {
    setTimeout(fnc, 0);
  },
  debounce: function debounce(func, threshold, callImmediately) {
    var timeout = void 0;
    return function () {
      var obj = this;
      var args = arguments;
      function delayed() {
        timeout = null;
        if (!callImmediately) func.apply(obj, args);
      }
      var callNow = callImmediately || !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(delayed, threshold);
      if (callNow) {
        func.apply(obj, args);
      }
    };
  },
  toArray: function toArray(obj) {
    if (obj.toArray) return obj.toArray();
    return ARR_SLICE.call(obj);
  },
  isUndefined: function isUndefined(obj) {
    return obj === undefined;
  },
  isNull: function isNull(obj) {
    return obj === null;
  },
  isNaN: function (_isNaN) {
    function isNaN(_x) {
      return _isNaN.apply(this, arguments);
    }
    isNaN.toString = function () {
      return _isNaN.toString();
    };
    return isNaN;
  }(function (obj) {
    return isNaN(obj);
  }),
  isArray: Array.isArray || function (obj) {
    return obj.constructor === Array;
  },
  isObject: function isObject(obj) {
    return obj === Object(obj);
  },
  isNumber: function isNumber(obj) {
    return obj === obj + 0;
  },
  isString: function isString(obj) {
    return obj === obj + '';
  },
  isBoolean: function isBoolean(obj) {
    return obj === false || obj === true;
  },
  isFunction: function isFunction(obj) {
    return Object.prototype.toString.call(obj) === '[object Function]';
  }
};

var INTERPRETATIONS = [
{
  litmus: Common.isString,
  conversions: {
    THREE_CHAR_HEX: {
      read: function read(original) {
        var test = original.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);
        if (test === null) {
          return false;
        }
        return {
          space: 'HEX',
          hex: parseInt('0x' + test[1].toString() + test[1].toString() + test[2].toString() + test[2].toString() + test[3].toString() + test[3].toString(), 0)
        };
      },
      write: colorToString
    },
    SIX_CHAR_HEX: {
      read: function read(original) {
        var test = original.match(/^#([A-F0-9]{6})$/i);
        if (test === null) {
          return false;
        }
        return {
          space: 'HEX',
          hex: parseInt('0x' + test[1].toString(), 0)
        };
      },
      write: colorToString
    },
    CSS_RGB: {
      read: function read(original) {
        var test = original.match(/^rgb\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
        if (test === null) {
          return false;
        }
        return {
          space: 'RGB',
          r: parseFloat(test[1]),
          g: parseFloat(test[2]),
          b: parseFloat(test[3])
        };
      },
      write: colorToString
    },
    CSS_RGBA: {
      read: function read(original) {
        var test = original.match(/^rgba\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
        if (test === null) {
          return false;
        }
        return {
          space: 'RGB',
          r: parseFloat(test[1]),
          g: parseFloat(test[2]),
          b: parseFloat(test[3]),
          a: parseFloat(test[4])
        };
      },
      write: colorToString
    }
  }
},
{
  litmus: Common.isNumber,
  conversions: {
    HEX: {
      read: function read(original) {
        return {
          space: 'HEX',
          hex: original,
          conversionName: 'HEX'
        };
      },
      write: function write(color) {
        return color.hex;
      }
    }
  }
},
{
  litmus: Common.isArray,
  conversions: {
    RGB_ARRAY: {
      read: function read(original) {
        if (original.length !== 3) {
          return false;
        }
        return {
          space: 'RGB',
          r: original[0],
          g: original[1],
          b: original[2]
        };
      },
      write: function write(color) {
        return [color.r, color.g, color.b];
      }
    },
    RGBA_ARRAY: {
      read: function read(original) {
        if (original.length !== 4) return false;
        return {
          space: 'RGB',
          r: original[0],
          g: original[1],
          b: original[2],
          a: original[3]
        };
      },
      write: function write(color) {
        return [color.r, color.g, color.b, color.a];
      }
    }
  }
},
{
  litmus: Common.isObject,
  conversions: {
    RGBA_OBJ: {
      read: function read(original) {
        if (Common.isNumber(original.r) && Common.isNumber(original.g) && Common.isNumber(original.b) && Common.isNumber(original.a)) {
          return {
            space: 'RGB',
            r: original.r,
            g: original.g,
            b: original.b,
            a: original.a
          };
        }
        return false;
      },
      write: function write(color) {
        return {
          r: color.r,
          g: color.g,
          b: color.b,
          a: color.a
        };
      }
    },
    RGB_OBJ: {
      read: function read(original) {
        if (Common.isNumber(original.r) && Common.isNumber(original.g) && Common.isNumber(original.b)) {
          return {
            space: 'RGB',
            r: original.r,
            g: original.g,
            b: original.b
          };
        }
        return false;
      },
      write: function write(color) {
        return {
          r: color.r,
          g: color.g,
          b: color.b
        };
      }
    },
    HSVA_OBJ: {
      read: function read(original) {
        if (Common.isNumber(original.h) && Common.isNumber(original.s) && Common.isNumber(original.v) && Common.isNumber(original.a)) {
          return {
            space: 'HSV',
            h: original.h,
            s: original.s,
            v: original.v,
            a: original.a
          };
        }
        return false;
      },
      write: function write(color) {
        return {
          h: color.h,
          s: color.s,
          v: color.v,
          a: color.a
        };
      }
    },
    HSV_OBJ: {
      read: function read(original) {
        if (Common.isNumber(original.h) && Common.isNumber(original.s) && Common.isNumber(original.v)) {
          return {
            space: 'HSV',
            h: original.h,
            s: original.s,
            v: original.v
          };
        }
        return false;
      },
      write: function write(color) {
        return {
          h: color.h,
          s: color.s,
          v: color.v
        };
      }
    }
  }
}];
var result = void 0;
var toReturn = void 0;
var interpret = function interpret() {
  toReturn = false;
  var original = arguments.length > 1 ? Common.toArray(arguments) : arguments[0];
  Common.each(INTERPRETATIONS, function (family) {
    if (family.litmus(original)) {
      Common.each(family.conversions, function (conversion, conversionName) {
        result = conversion.read(original);
        if (toReturn === false && result !== false) {
          toReturn = result;
          result.conversionName = conversionName;
          result.conversion = conversion;
          return Common.BREAK;
        }
      });
      return Common.BREAK;
    }
  });
  return toReturn;
};

var tmpComponent = void 0;
var ColorMath = {
  hsv_to_rgb: function hsv_to_rgb(h, s, v) {
    var hi = Math.floor(h / 60) % 6;
    var f = h / 60 - Math.floor(h / 60);
    var p = v * (1.0 - s);
    var q = v * (1.0 - f * s);
    var t = v * (1.0 - (1.0 - f) * s);
    var c = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][hi];
    return {
      r: c[0] * 255,
      g: c[1] * 255,
      b: c[2] * 255
    };
  },
  rgb_to_hsv: function rgb_to_hsv(r, g, b) {
    var min = Math.min(r, g, b);
    var max = Math.max(r, g, b);
    var delta = max - min;
    var h = void 0;
    var s = void 0;
    if (max !== 0) {
      s = delta / max;
    } else {
      return {
        h: NaN,
        s: 0,
        v: 0
      };
    }
    if (r === max) {
      h = (g - b) / delta;
    } else if (g === max) {
      h = 2 + (b - r) / delta;
    } else {
      h = 4 + (r - g) / delta;
    }
    h /= 6;
    if (h < 0) {
      h += 1;
    }
    return {
      h: h * 360,
      s: s,
      v: max / 255
    };
  },
  rgb_to_hex: function rgb_to_hex(r, g, b) {
    var hex = this.hex_with_component(0, 2, r);
    hex = this.hex_with_component(hex, 1, g);
    hex = this.hex_with_component(hex, 0, b);
    return hex;
  },
  component_from_hex: function component_from_hex(hex, componentIndex) {
    return hex >> componentIndex * 8 & 0xFF;
  },
  hex_with_component: function hex_with_component(hex, componentIndex, value) {
    return value << (tmpComponent = componentIndex * 8) | hex & ~(0xFF << tmpComponent);
  }
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











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







var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var Color = function () {
  function Color() {
    classCallCheck(this, Color);
    this.__state = interpret.apply(this, arguments);
    if (this.__state === false) {
      throw new Error('Failed to interpret color arguments');
    }
    this.__state.a = this.__state.a || 1;
  }
  createClass(Color, [{
    key: 'toString',
    value: function toString() {
      return colorToString(this);
    }
  }, {
    key: 'toHexString',
    value: function toHexString() {
      return colorToString(this, true);
    }
  }, {
    key: 'toOriginal',
    value: function toOriginal() {
      return this.__state.conversion.write(this);
    }
  }]);
  return Color;
}();
function defineRGBComponent(target, component, componentHexIndex) {
  Object.defineProperty(target, component, {
    get: function get$$1() {
      if (this.__state.space === 'RGB') {
        return this.__state[component];
      }
      Color.recalculateRGB(this, component, componentHexIndex);
      return this.__state[component];
    },
    set: function set$$1(v) {
      if (this.__state.space !== 'RGB') {
        Color.recalculateRGB(this, component, componentHexIndex);
        this.__state.space = 'RGB';
      }
      this.__state[component] = v;
    }
  });
}
function defineHSVComponent(target, component) {
  Object.defineProperty(target, component, {
    get: function get$$1() {
      if (this.__state.space === 'HSV') {
        return this.__state[component];
      }
      Color.recalculateHSV(this);
      return this.__state[component];
    },
    set: function set$$1(v) {
      if (this.__state.space !== 'HSV') {
        Color.recalculateHSV(this);
        this.__state.space = 'HSV';
      }
      this.__state[component] = v;
    }
  });
}
Color.recalculateRGB = function (color, component, componentHexIndex) {
  if (color.__state.space === 'HEX') {
    color.__state[component] = ColorMath.component_from_hex(color.__state.hex, componentHexIndex);
  } else if (color.__state.space === 'HSV') {
    Common.extend(color.__state, ColorMath.hsv_to_rgb(color.__state.h, color.__state.s, color.__state.v));
  } else {
    throw new Error('Corrupted color state');
  }
};
Color.recalculateHSV = function (color) {
  var result = ColorMath.rgb_to_hsv(color.r, color.g, color.b);
  Common.extend(color.__state, {
    s: result.s,
    v: result.v
  });
  if (!Common.isNaN(result.h)) {
    color.__state.h = result.h;
  } else if (Common.isUndefined(color.__state.h)) {
    color.__state.h = 0;
  }
};
Color.COMPONENTS = ['r', 'g', 'b', 'h', 's', 'v', 'hex', 'a'];
defineRGBComponent(Color.prototype, 'r', 2);
defineRGBComponent(Color.prototype, 'g', 1);
defineRGBComponent(Color.prototype, 'b', 0);
defineHSVComponent(Color.prototype, 'h');
defineHSVComponent(Color.prototype, 's');
defineHSVComponent(Color.prototype, 'v');
Object.defineProperty(Color.prototype, 'a', {
  get: function get$$1() {
    return this.__state.a;
  },
  set: function set$$1(v) {
    this.__state.a = v;
  }
});
Object.defineProperty(Color.prototype, 'hex', {
  get: function get$$1() {
    if (!this.__state.space !== 'HEX') {
      this.__state.hex = ColorMath.rgb_to_hex(this.r, this.g, this.b);
    }
    return this.__state.hex;
  },
  set: function set$$1(v) {
    this.__state.space = 'HEX';
    this.__state.hex = v;
  }
});

var Controller = function () {
  function Controller(object, property) {
    classCallCheck(this, Controller);
    this.initialValue = object[property];
    this.domElement = document.createElement('div');
    this.object = object;
    this.property = property;
    this.__onChange = undefined;
    this.__onFinishChange = undefined;
  }
  createClass(Controller, [{
    key: 'onChange',
    value: function onChange(fnc) {
      this.__onChange = fnc;
      return this;
    }
  }, {
    key: 'onFinishChange',
    value: function onFinishChange(fnc) {
      this.__onFinishChange = fnc;
      return this;
    }
  }, {
    key: 'setValue',
    value: function setValue(newValue) {
      this.object[this.property] = newValue;
      if (this.__onChange) {
        this.__onChange.call(this, newValue);
      }
      this.updateDisplay();
      return this;
    }
  }, {
    key: 'getValue',
    value: function getValue() {
      return this.object[this.property];
    }
  }, {
    key: 'updateDisplay',
    value: function updateDisplay() {
      return this;
    }
  }, {
    key: 'isModified',
    value: function isModified() {
      return this.initialValue !== this.getValue();
    }
  }]);
  return Controller;
}();

var EVENT_MAP = {
  HTMLEvents: ['change'],
  MouseEvents: ['click', 'mousemove', 'mousedown', 'mouseup', 'mouseover'],
  KeyboardEvents: ['keydown']
};
var EVENT_MAP_INV = {};
Common.each(EVENT_MAP, function (v, k) {
  Common.each(v, function (e) {
    EVENT_MAP_INV[e] = k;
  });
});
var CSS_VALUE_PIXELS = /(\d+(\.\d+)?)px/;
function cssValueToPixels(val) {
  if (val === '0' || Common.isUndefined(val)) {
    return 0;
  }
  var match = val.match(CSS_VALUE_PIXELS);
  if (!Common.isNull(match)) {
    return parseFloat(match[1]);
  }
  return 0;
}
var dom = {
  makeSelectable: function makeSelectable(elem, selectable) {
    if (elem === undefined || elem.style === undefined) return;
    elem.onselectstart = selectable ? function () {
      return false;
    } : function () {};
    elem.style.MozUserSelect = selectable ? 'auto' : 'none';
    elem.style.KhtmlUserSelect = selectable ? 'auto' : 'none';
    elem.unselectable = selectable ? 'on' : 'off';
  },
  makeFullscreen: function makeFullscreen(elem, hor, vert) {
    var vertical = vert;
    var horizontal = hor;
    if (Common.isUndefined(horizontal)) {
      horizontal = true;
    }
    if (Common.isUndefined(vertical)) {
      vertical = true;
    }
    elem.style.position = 'absolute';
    if (horizontal) {
      elem.style.left = 0;
      elem.style.right = 0;
    }
    if (vertical) {
      elem.style.top = 0;
      elem.style.bottom = 0;
    }
  },
  fakeEvent: function fakeEvent(elem, eventType, pars, aux) {
    var params = pars || {};
    var className = EVENT_MAP_INV[eventType];
    if (!className) {
      throw new Error('Event type ' + eventType + ' not supported.');
    }
    var evt = document.createEvent(className);
    switch (className) {
      case 'MouseEvents':
        {
          var clientX = params.x || params.clientX || 0;
          var clientY = params.y || params.clientY || 0;
          evt.initMouseEvent(eventType, params.bubbles || false, params.cancelable || true, window, params.clickCount || 1, 0,
          0,
          clientX,
          clientY,
          false, false, false, false, 0, null);
          break;
        }
      case 'KeyboardEvents':
        {
          var init = evt.initKeyboardEvent || evt.initKeyEvent;
          Common.defaults(params, {
            cancelable: true,
            ctrlKey: false,
            altKey: false,
            shiftKey: false,
            metaKey: false,
            keyCode: undefined,
            charCode: undefined
          });
          init(eventType, params.bubbles || false, params.cancelable, window, params.ctrlKey, params.altKey, params.shiftKey, params.metaKey, params.keyCode, params.charCode);
          break;
        }
      default:
        {
          evt.initEvent(eventType, params.bubbles || false, params.cancelable || true);
          break;
        }
    }
    Common.defaults(evt, aux);
    elem.dispatchEvent(evt);
  },
  bind: function bind(elem, event, func, newBool) {
    var bool = newBool || false;
    if (elem.addEventListener) {
      elem.addEventListener(event, func, bool);
    } else if (elem.attachEvent) {
      elem.attachEvent('on' + event, func);
    }
    return dom;
  },
  unbind: function unbind(elem, event, func, newBool) {
    var bool = newBool || false;
    if (elem.removeEventListener) {
      elem.removeEventListener(event, func, bool);
    } else if (elem.detachEvent) {
      elem.detachEvent('on' + event, func);
    }
    return dom;
  },
  addClass: function addClass(elem, className) {
    if (elem.className === undefined) {
      elem.className = className;
    } else if (elem.className !== className) {
      var classes = elem.className.split(/ +/);
      if (classes.indexOf(className) === -1) {
        classes.push(className);
        elem.className = classes.join(' ').replace(/^\s+/, '').replace(/\s+$/, '');
      }
    }
    return dom;
  },
  removeClass: function removeClass(elem, className) {
    if (className) {
      if (elem.className === className) {
        elem.removeAttribute('class');
      } else {
        var classes = elem.className.split(/ +/);
        var index = classes.indexOf(className);
        if (index !== -1) {
          classes.splice(index, 1);
          elem.className = classes.join(' ');
        }
      }
    } else {
      elem.className = undefined;
    }
    return dom;
  },
  hasClass: function hasClass(elem, className) {
    return new RegExp('(?:^|\\s+)' + className + '(?:\\s+|$)').test(elem.className) || false;
  },
  getWidth: function getWidth(elem) {
    var style = getComputedStyle(elem);
    return cssValueToPixels(style['border-left-width']) + cssValueToPixels(style['border-right-width']) + cssValueToPixels(style['padding-left']) + cssValueToPixels(style['padding-right']) + cssValueToPixels(style.width);
  },
  getHeight: function getHeight(elem) {
    var style = getComputedStyle(elem);
    return cssValueToPixels(style['border-top-width']) + cssValueToPixels(style['border-bottom-width']) + cssValueToPixels(style['padding-top']) + cssValueToPixels(style['padding-bottom']) + cssValueToPixels(style.height);
  },
  getOffset: function getOffset(el) {
    var elem = el;
    var offset = { left: 0, top: 0 };
    if (elem.offsetParent) {
      do {
        offset.left += elem.offsetLeft;
        offset.top += elem.offsetTop;
        elem = elem.offsetParent;
      } while (elem);
    }
    return offset;
  },
  isActive: function isActive(elem) {
    return elem === document.activeElement && (elem.type || elem.href);
  }
};

var BooleanController = function (_Controller) {
  inherits(BooleanController, _Controller);
  function BooleanController(object, property) {
    classCallCheck(this, BooleanController);
    var _this2 = possibleConstructorReturn(this, (BooleanController.__proto__ || Object.getPrototypeOf(BooleanController)).call(this, object, property));
    var _this = _this2;
    _this2.__prev = _this2.getValue();
    _this2.__checkbox = document.createElement('input');
    _this2.__checkbox.setAttribute('type', 'checkbox');
    function onChange() {
      _this.setValue(!_this.__prev);
    }
    dom.bind(_this2.__checkbox, 'change', onChange, false);
    _this2.domElement.appendChild(_this2.__checkbox);
    _this2.updateDisplay();
    return _this2;
  }
  createClass(BooleanController, [{
    key: 'setValue',
    value: function setValue(v) {
      var toReturn = get(BooleanController.prototype.__proto__ || Object.getPrototypeOf(BooleanController.prototype), 'setValue', this).call(this, v);
      if (this.__onFinishChange) {
        this.__onFinishChange.call(this, this.getValue());
      }
      this.__prev = this.getValue();
      return toReturn;
    }
  }, {
    key: 'updateDisplay',
    value: function updateDisplay() {
      if (this.getValue() === true) {
        this.__checkbox.setAttribute('checked', 'checked');
        this.__checkbox.checked = true;
        this.__prev = true;
      } else {
        this.__checkbox.checked = false;
        this.__prev = false;
      }
      return get(BooleanController.prototype.__proto__ || Object.getPrototypeOf(BooleanController.prototype), 'updateDisplay', this).call(this);
    }
  }]);
  return BooleanController;
}(Controller);

var OptionController = function (_Controller) {
  inherits(OptionController, _Controller);
  function OptionController(object, property, opts) {
    classCallCheck(this, OptionController);
    var _this2 = possibleConstructorReturn(this, (OptionController.__proto__ || Object.getPrototypeOf(OptionController)).call(this, object, property));
    var options = opts;
    var _this = _this2;
    _this2.__select = document.createElement('select');
    if (Common.isArray(options)) {
      var map = {};
      Common.each(options, function (element) {
        map[element] = element;
      });
      options = map;
    }
    Common.each(options, function (value, key) {
      var opt = document.createElement('option');
      opt.innerHTML = key;
      opt.setAttribute('value', value);
      _this.__select.appendChild(opt);
    });
    _this2.updateDisplay();
    dom.bind(_this2.__select, 'change', function () {
      var desiredValue = this.options[this.selectedIndex].value;
      _this.setValue(desiredValue);
    });
    _this2.domElement.appendChild(_this2.__select);
    return _this2;
  }
  createClass(OptionController, [{
    key: 'setValue',
    value: function setValue(v) {
      var toReturn = get(OptionController.prototype.__proto__ || Object.getPrototypeOf(OptionController.prototype), 'setValue', this).call(this, v);
      if (this.__onFinishChange) {
        this.__onFinishChange.call(this, this.getValue());
      }
      return toReturn;
    }
  }, {
    key: 'updateDisplay',
    value: function updateDisplay() {
      if (dom.isActive(this.__select)) return this;
      this.__select.value = this.getValue();
      return get(OptionController.prototype.__proto__ || Object.getPrototypeOf(OptionController.prototype), 'updateDisplay', this).call(this);
    }
  }]);
  return OptionController;
}(Controller);

var StringController = function (_Controller) {
  inherits(StringController, _Controller);
  function StringController(object, property) {
    classCallCheck(this, StringController);
    var _this2 = possibleConstructorReturn(this, (StringController.__proto__ || Object.getPrototypeOf(StringController)).call(this, object, property));
    var _this = _this2;
    function onChange() {
      _this.setValue(_this.__input.value);
    }
    function onBlur() {
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }
    _this2.__input = document.createElement('input');
    _this2.__input.setAttribute('type', 'text');
    dom.bind(_this2.__input, 'keyup', onChange);
    dom.bind(_this2.__input, 'change', onChange);
    dom.bind(_this2.__input, 'blur', onBlur);
    dom.bind(_this2.__input, 'keydown', function (e) {
      if (e.keyCode === 13) {
        this.blur();
      }
    });
    _this2.updateDisplay();
    _this2.domElement.appendChild(_this2.__input);
    return _this2;
  }
  createClass(StringController, [{
    key: 'updateDisplay',
    value: function updateDisplay() {
      if (!dom.isActive(this.__input)) {
        this.__input.value = this.getValue();
      }
      return get(StringController.prototype.__proto__ || Object.getPrototypeOf(StringController.prototype), 'updateDisplay', this).call(this);
    }
  }]);
  return StringController;
}(Controller);

function numDecimals(x) {
  var _x = x.toString();
  if (_x.indexOf('.') > -1) {
    return _x.length - _x.indexOf('.') - 1;
  }
  return 0;
}
var NumberController = function (_Controller) {
  inherits(NumberController, _Controller);
  function NumberController(object, property, params) {
    classCallCheck(this, NumberController);
    var _this = possibleConstructorReturn(this, (NumberController.__proto__ || Object.getPrototypeOf(NumberController)).call(this, object, property));
    var _params = params || {};
    _this.__min = _params.min;
    _this.__max = _params.max;
    _this.__step = _params.step;
    if (Common.isUndefined(_this.__step)) {
      if (_this.initialValue === 0) {
        _this.__impliedStep = 1;
      } else {
        _this.__impliedStep = Math.pow(10, Math.floor(Math.log(Math.abs(_this.initialValue)) / Math.LN10)) / 10;
      }
    } else {
      _this.__impliedStep = _this.__step;
    }
    _this.__precision = numDecimals(_this.__impliedStep);
    return _this;
  }
  createClass(NumberController, [{
    key: 'setValue',
    value: function setValue(v) {
      var _v = v;
      if (this.__min !== undefined && _v < this.__min) {
        _v = this.__min;
      } else if (this.__max !== undefined && _v > this.__max) {
        _v = this.__max;
      }
      if (this.__step !== undefined && _v % this.__step !== 0) {
        _v = Math.round(_v / this.__step) * this.__step;
      }
      return get(NumberController.prototype.__proto__ || Object.getPrototypeOf(NumberController.prototype), 'setValue', this).call(this, _v);
    }
  }, {
    key: 'min',
    value: function min(minValue) {
      this.__min = minValue;
      return this;
    }
  }, {
    key: 'max',
    value: function max(maxValue) {
      this.__max = maxValue;
      return this;
    }
  }, {
    key: 'step',
    value: function step(stepValue) {
      this.__step = stepValue;
      this.__impliedStep = stepValue;
      this.__precision = numDecimals(stepValue);
      return this;
    }
  }]);
  return NumberController;
}(Controller);

function roundToDecimal(value, decimals) {
  var tenTo = Math.pow(10, decimals);
  return Math.round(value * tenTo) / tenTo;
}
var NumberControllerBox = function (_NumberController) {
  inherits(NumberControllerBox, _NumberController);
  function NumberControllerBox(object, property, params) {
    classCallCheck(this, NumberControllerBox);
    var _this2 = possibleConstructorReturn(this, (NumberControllerBox.__proto__ || Object.getPrototypeOf(NumberControllerBox)).call(this, object, property, params));
    _this2.__truncationSuspended = false;
    var _this = _this2;
    var prevY = void 0;
    function onChange() {
      var attempted = parseFloat(_this.__input.value);
      if (!Common.isNaN(attempted)) {
        _this.setValue(attempted);
      }
    }
    function onFinish() {
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }
    function onBlur() {
      onFinish();
    }
    function onMouseDrag(e) {
      var diff = prevY - e.clientY;
      _this.setValue(_this.getValue() + diff * _this.__impliedStep);
      prevY = e.clientY;
    }
    function onMouseUp() {
      dom.unbind(window, 'mousemove', onMouseDrag);
      dom.unbind(window, 'mouseup', onMouseUp);
      onFinish();
    }
    function onMouseDown(e) {
      dom.bind(window, 'mousemove', onMouseDrag);
      dom.bind(window, 'mouseup', onMouseUp);
      prevY = e.clientY;
    }
    _this2.__input = document.createElement('input');
    _this2.__input.setAttribute('type', 'text');
    dom.bind(_this2.__input, 'change', onChange);
    dom.bind(_this2.__input, 'blur', onBlur);
    dom.bind(_this2.__input, 'mousedown', onMouseDown);
    dom.bind(_this2.__input, 'keydown', function (e) {
      if (e.keyCode === 13) {
        _this.__truncationSuspended = true;
        this.blur();
        _this.__truncationSuspended = false;
        onFinish();
      }
    });
    _this2.updateDisplay();
    _this2.domElement.appendChild(_this2.__input);
    return _this2;
  }
  createClass(NumberControllerBox, [{
    key: 'updateDisplay',
    value: function updateDisplay() {
      this.__input.value = this.__truncationSuspended ? this.getValue() : roundToDecimal(this.getValue(), this.__precision);
      return get(NumberControllerBox.prototype.__proto__ || Object.getPrototypeOf(NumberControllerBox.prototype), 'updateDisplay', this).call(this);
    }
  }]);
  return NumberControllerBox;
}(NumberController);

function map(v, i1, i2, o1, o2) {
  return o1 + (o2 - o1) * ((v - i1) / (i2 - i1));
}
var NumberControllerSlider = function (_NumberController) {
  inherits(NumberControllerSlider, _NumberController);
  function NumberControllerSlider(object, property, min, max, step) {
    classCallCheck(this, NumberControllerSlider);
    var _this2 = possibleConstructorReturn(this, (NumberControllerSlider.__proto__ || Object.getPrototypeOf(NumberControllerSlider)).call(this, object, property, { min: min, max: max, step: step }));
    var _this = _this2;
    _this2.__background = document.createElement('div');
    _this2.__foreground = document.createElement('div');
    dom.bind(_this2.__background, 'mousedown', onMouseDown);
    dom.bind(_this2.__background, 'touchstart', onTouchStart);
    dom.addClass(_this2.__background, 'slider');
    dom.addClass(_this2.__foreground, 'slider-fg');
    function onMouseDown(e) {
      document.activeElement.blur();
      dom.bind(window, 'mousemove', onMouseDrag);
      dom.bind(window, 'mouseup', onMouseUp);
      onMouseDrag(e);
    }
    function onMouseDrag(e) {
      e.preventDefault();
      var bgRect = _this.__background.getBoundingClientRect();
      _this.setValue(map(e.clientX, bgRect.left, bgRect.right, _this.__min, _this.__max));
      return false;
    }
    function onMouseUp() {
      dom.unbind(window, 'mousemove', onMouseDrag);
      dom.unbind(window, 'mouseup', onMouseUp);
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }
    function onTouchStart(e) {
      if (e.touches.length !== 1) {
        return;
      }
      dom.bind(window, 'touchmove', onTouchMove);
      dom.bind(window, 'touchend', onTouchEnd);
      onTouchMove(e);
    }
    function onTouchMove(e) {
      var clientX = e.touches[0].clientX;
      var bgRect = _this.__background.getBoundingClientRect();
      _this.setValue(map(clientX, bgRect.left, bgRect.right, _this.__min, _this.__max));
    }
    function onTouchEnd() {
      dom.unbind(window, 'touchmove', onTouchMove);
      dom.unbind(window, 'touchend', onTouchEnd);
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.getValue());
      }
    }
    _this2.updateDisplay();
    _this2.__background.appendChild(_this2.__foreground);
    _this2.domElement.appendChild(_this2.__background);
    return _this2;
  }
  createClass(NumberControllerSlider, [{
    key: 'updateDisplay',
    value: function updateDisplay() {
      var pct = (this.getValue() - this.__min) / (this.__max - this.__min);
      this.__foreground.style.width = pct * 100 + '%';
      return get(NumberControllerSlider.prototype.__proto__ || Object.getPrototypeOf(NumberControllerSlider.prototype), 'updateDisplay', this).call(this);
    }
  }]);
  return NumberControllerSlider;
}(NumberController);

var FunctionController = function (_Controller) {
  inherits(FunctionController, _Controller);
  function FunctionController(object, property, text) {
    classCallCheck(this, FunctionController);
    var _this2 = possibleConstructorReturn(this, (FunctionController.__proto__ || Object.getPrototypeOf(FunctionController)).call(this, object, property));
    var _this = _this2;
    _this2.__button = document.createElement('div');
    _this2.__button.innerHTML = text === undefined ? 'Fire' : text;
    dom.bind(_this2.__button, 'click', function (e) {
      e.preventDefault();
      _this.fire();
      return false;
    });
    dom.addClass(_this2.__button, 'button');
    _this2.domElement.appendChild(_this2.__button);
    return _this2;
  }
  createClass(FunctionController, [{
    key: 'fire',
    value: function fire() {
      if (this.__onChange) {
        this.__onChange.call(this);
      }
      this.getValue().call(this.object);
      if (this.__onFinishChange) {
        this.__onFinishChange.call(this, this.getValue());
      }
    }
  }]);
  return FunctionController;
}(Controller);

var ColorController = function (_Controller) {
  inherits(ColorController, _Controller);
  function ColorController(object, property) {
    classCallCheck(this, ColorController);
    var _this2 = possibleConstructorReturn(this, (ColorController.__proto__ || Object.getPrototypeOf(ColorController)).call(this, object, property));
    _this2.__color = new Color(_this2.getValue());
    _this2.__temp = new Color(0);
    var _this = _this2;
    _this2.domElement = document.createElement('div');
    dom.makeSelectable(_this2.domElement, false);
    _this2.__selector = document.createElement('div');
    _this2.__selector.className = 'selector';
    _this2.__saturation_field = document.createElement('div');
    _this2.__saturation_field.className = 'saturation-field';
    _this2.__field_knob = document.createElement('div');
    _this2.__field_knob.className = 'field-knob';
    _this2.__field_knob_border = '2px solid ';
    _this2.__hue_knob = document.createElement('div');
    _this2.__hue_knob.className = 'hue-knob';
    _this2.__hue_field = document.createElement('div');
    _this2.__hue_field.className = 'hue-field';
    _this2.__input = document.createElement('input');
    _this2.__input.type = 'text';
    _this2.__input_textShadow = '0 1px 1px ';
    dom.bind(_this2.__input, 'keydown', function (e) {
      if (e.keyCode === 13) {
        onBlur.call(this);
      }
    });
    dom.bind(_this2.__input, 'blur', onBlur);
    dom.bind(_this2.__selector, 'mousedown', function ()        {
      dom.addClass(this, 'drag').bind(window, 'mouseup', function ()        {
        dom.removeClass(_this.__selector, 'drag');
      });
    });
    dom.bind(_this2.__selector, 'touchstart', function ()        {
      dom.addClass(this, 'drag').bind(window, 'touchend', function ()        {
        dom.removeClass(_this.__selector, 'drag');
      });
    });
    var valueField = document.createElement('div');
    Common.extend(_this2.__selector.style, {
      width: '122px',
      height: '102px',
      padding: '3px',
      backgroundColor: '#222',
      boxShadow: '0px 1px 3px rgba(0,0,0,0.3)'
    });
    Common.extend(_this2.__field_knob.style, {
      position: 'absolute',
      width: '12px',
      height: '12px',
      border: _this2.__field_knob_border + (_this2.__color.v < 0.5 ? '#fff' : '#000'),
      boxShadow: '0px 1px 3px rgba(0,0,0,0.5)',
      borderRadius: '12px',
      zIndex: 1
    });
    Common.extend(_this2.__hue_knob.style, {
      position: 'absolute',
      width: '15px',
      height: '2px',
      borderRight: '4px solid #fff',
      zIndex: 1
    });
    Common.extend(_this2.__saturation_field.style, {
      width: '100px',
      height: '100px',
      border: '1px solid #555',
      marginRight: '3px',
      display: 'inline-block',
      cursor: 'pointer'
    });
    Common.extend(valueField.style, {
      width: '100%',
      height: '100%',
      background: 'none'
    });
    linearGradient(valueField, 'top', 'rgba(0,0,0,0)', '#000');
    Common.extend(_this2.__hue_field.style, {
      width: '15px',
      height: '100px',
      border: '1px solid #555',
      cursor: 'ns-resize',
      position: 'absolute',
      top: '3px',
      right: '3px'
    });
    hueGradient(_this2.__hue_field);
    Common.extend(_this2.__input.style, {
      outline: 'none',
      textAlign: 'center',
      color: '#fff',
      border: 0,
      fontWeight: 'bold',
      textShadow: _this2.__input_textShadow + 'rgba(0,0,0,0.7)'
    });
    dom.bind(_this2.__saturation_field, 'mousedown', fieldDown);
    dom.bind(_this2.__saturation_field, 'touchstart', fieldDown);
    dom.bind(_this2.__field_knob, 'mousedown', fieldDown);
    dom.bind(_this2.__field_knob, 'touchstart', fieldDown);
    dom.bind(_this2.__hue_field, 'mousedown', fieldDownH);
    dom.bind(_this2.__hue_field, 'touchstart', fieldDownH);
    function fieldDown(e) {
      setSV(e);
      dom.bind(window, 'mousemove', setSV);
      dom.bind(window, 'touchmove', setSV);
      dom.bind(window, 'mouseup', fieldUpSV);
      dom.bind(window, 'touchend', fieldUpSV);
    }
    function fieldDownH(e) {
      setH(e);
      dom.bind(window, 'mousemove', setH);
      dom.bind(window, 'touchmove', setH);
      dom.bind(window, 'mouseup', fieldUpH);
      dom.bind(window, 'touchend', fieldUpH);
    }
    function fieldUpSV() {
      dom.unbind(window, 'mousemove', setSV);
      dom.unbind(window, 'touchmove', setSV);
      dom.unbind(window, 'mouseup', fieldUpSV);
      dom.unbind(window, 'touchend', fieldUpSV);
      onFinish();
    }
    function fieldUpH() {
      dom.unbind(window, 'mousemove', setH);
      dom.unbind(window, 'touchmove', setH);
      dom.unbind(window, 'mouseup', fieldUpH);
      dom.unbind(window, 'touchend', fieldUpH);
      onFinish();
    }
    function onBlur() {
      var i = interpret(this.value);
      if (i !== false) {
        _this.__color.__state = i;
        _this.setValue(_this.__color.toOriginal());
      } else {
        this.value = _this.__color.toString();
      }
    }
    function onFinish() {
      if (_this.__onFinishChange) {
        _this.__onFinishChange.call(_this, _this.__color.toOriginal());
      }
    }
    _this2.__saturation_field.appendChild(valueField);
    _this2.__selector.appendChild(_this2.__field_knob);
    _this2.__selector.appendChild(_this2.__saturation_field);
    _this2.__selector.appendChild(_this2.__hue_field);
    _this2.__hue_field.appendChild(_this2.__hue_knob);
    _this2.domElement.appendChild(_this2.__input);
    _this2.domElement.appendChild(_this2.__selector);
    _this2.updateDisplay();
    function setSV(e) {
      if (e.type.indexOf('touch') === -1) {
        e.preventDefault();
      }
      var fieldRect = _this.__saturation_field.getBoundingClientRect();
      var _ref = e.touches && e.touches[0] || e,
          clientX = _ref.clientX,
          clientY = _ref.clientY;
      var s = (clientX - fieldRect.left) / (fieldRect.right - fieldRect.left);
      var v = 1 - (clientY - fieldRect.top) / (fieldRect.bottom - fieldRect.top);
      if (v > 1) {
        v = 1;
      } else if (v < 0) {
        v = 0;
      }
      if (s > 1) {
        s = 1;
      } else if (s < 0) {
        s = 0;
      }
      _this.__color.v = v;
      _this.__color.s = s;
      _this.setValue(_this.__color.toOriginal());
      return false;
    }
    function setH(e) {
      if (e.type.indexOf('touch') === -1) {
        e.preventDefault();
      }
      var fieldRect = _this.__hue_field.getBoundingClientRect();
      var _ref2 = e.touches && e.touches[0] || e,
          clientY = _ref2.clientY;
      var h = 1 - (clientY - fieldRect.top) / (fieldRect.bottom - fieldRect.top);
      if (h > 1) {
        h = 1;
      } else if (h < 0) {
        h = 0;
      }
      _this.__color.h = h * 360;
      _this.setValue(_this.__color.toOriginal());
      return false;
    }
    return _this2;
  }
  createClass(ColorController, [{
    key: 'updateDisplay',
    value: function updateDisplay() {
      var i = interpret(this.getValue());
      if (i !== false) {
        var mismatch = false;
        Common.each(Color.COMPONENTS, function (component) {
          if (!Common.isUndefined(i[component]) && !Common.isUndefined(this.__color.__state[component]) && i[component] !== this.__color.__state[component]) {
            mismatch = true;
            return {};
          }
        }, this);
        if (mismatch) {
          Common.extend(this.__color.__state, i);
        }
      }
      Common.extend(this.__temp.__state, this.__color.__state);
      this.__temp.a = 1;
      var flip = this.__color.v < 0.5 || this.__color.s > 0.5 ? 255 : 0;
      var _flip = 255 - flip;
      Common.extend(this.__field_knob.style, {
        marginLeft: 100 * this.__color.s - 7 + 'px',
        marginTop: 100 * (1 - this.__color.v) - 7 + 'px',
        backgroundColor: this.__temp.toHexString(),
        border: this.__field_knob_border + 'rgb(' + flip + ',' + flip + ',' + flip + ')'
      });
      this.__hue_knob.style.marginTop = (1 - this.__color.h / 360) * 100 + 'px';
      this.__temp.s = 1;
      this.__temp.v = 1;
      linearGradient(this.__saturation_field, 'left', '#fff', this.__temp.toHexString());
      this.__input.value = this.__color.toString();
      Common.extend(this.__input.style, {
        backgroundColor: this.__color.toHexString(),
        color: 'rgb(' + flip + ',' + flip + ',' + flip + ')',
        textShadow: this.__input_textShadow + 'rgba(' + _flip + ',' + _flip + ',' + _flip + ',.7)'
      });
    }
  }]);
  return ColorController;
}(Controller);
var vendors = ['-moz-', '-o-', '-webkit-', '-ms-', ''];
function linearGradient(elem, x, a, b) {
  elem.style.background = '';
  Common.each(vendors, function (vendor) {
    elem.style.cssText += 'background: ' + vendor + 'linear-gradient(' + x + ', ' + a + ' 0%, ' + b + ' 100%); ';
  });
}
function hueGradient(elem) {
  elem.style.background = '';
  elem.style.cssText += 'background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);';
  elem.style.cssText += 'background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
  elem.style.cssText += 'background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
  elem.style.cssText += 'background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
  elem.style.cssText += 'background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
}

var css = {
  load: function load(url, indoc) {
    var doc = indoc || document;
    var link = doc.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = url;
    doc.getElementsByTagName('head')[0].appendChild(link);
  },
  inject: function inject(cssContent, indoc) {
    var doc = indoc || document;
    var injected = document.createElement('style');
    injected.type = 'text/css';
    injected.innerHTML = cssContent;
    var head = doc.getElementsByTagName('head')[0];
    try {
      head.appendChild(injected);
    } catch (e) {
    }
  }
};

var saveDialogContents = "<div id=\"dg-save\" class=\"dg dialogue\">\n\n  Here's the new load parameter for your <code>GUI</code>'s constructor:\n\n  <textarea id=\"dg-new-constructor\"></textarea>\n\n  <div id=\"dg-save-locally\">\n\n    <input id=\"dg-local-storage\" type=\"checkbox\"/> Automatically save\n    values to <code>localStorage</code> on exit.\n\n    <div id=\"dg-local-explain\">The values saved to <code>localStorage</code> will\n      override those passed to <code>dat.GUI</code>'s constructor. This makes it\n      easier to work incrementally, but <code>localStorage</code> is fragile,\n      and your friends may not see the same values you do.\n\n    </div>\n\n  </div>\n\n</div>";

var ControllerFactory = function ControllerFactory(object, property) {
  var initialValue = object[property];
  if (Common.isArray(arguments[2]) || Common.isObject(arguments[2])) {
    return new OptionController(object, property, arguments[2]);
  }
  if (Common.isNumber(initialValue)) {
    if (Common.isNumber(arguments[2]) && Common.isNumber(arguments[3])) {
      if (Common.isNumber(arguments[4])) {
        return new NumberControllerSlider(object, property, arguments[2], arguments[3], arguments[4]);
      }
      return new NumberControllerSlider(object, property, arguments[2], arguments[3]);
    }
    if (Common.isNumber(arguments[4])) {
      return new NumberControllerBox(object, property, { min: arguments[2], max: arguments[3], step: arguments[4] });
    }
    return new NumberControllerBox(object, property, { min: arguments[2], max: arguments[3] });
  }
  if (Common.isString(initialValue)) {
    return new StringController(object, property);
  }
  if (Common.isFunction(initialValue)) {
    return new FunctionController(object, property, '');
  }
  if (Common.isBoolean(initialValue)) {
    return new BooleanController(object, property);
  }
  return null;
};

function requestAnimationFrame$1(callback) {
  setTimeout(callback, 1000 / 60);
}
var requestAnimationFrame$1$1 = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || requestAnimationFrame$1;

var CenteredDiv = function () {
  function CenteredDiv() {
    classCallCheck(this, CenteredDiv);
    this.backgroundElement = document.createElement('div');
    Common.extend(this.backgroundElement.style, {
      backgroundColor: 'rgba(0,0,0,0.8)',
      top: 0,
      left: 0,
      display: 'none',
      zIndex: '1000',
      opacity: 0,
      WebkitTransition: 'opacity 0.2s linear',
      transition: 'opacity 0.2s linear'
    });
    dom.makeFullscreen(this.backgroundElement);
    this.backgroundElement.style.position = 'fixed';
    this.domElement = document.createElement('div');
    Common.extend(this.domElement.style, {
      position: 'fixed',
      display: 'none',
      zIndex: '1001',
      opacity: 0,
      WebkitTransition: '-webkit-transform 0.2s ease-out, opacity 0.2s linear',
      transition: 'transform 0.2s ease-out, opacity 0.2s linear'
    });
    document.body.appendChild(this.backgroundElement);
    document.body.appendChild(this.domElement);
    var _this = this;
    dom.bind(this.backgroundElement, 'click', function () {
      _this.hide();
    });
  }
  createClass(CenteredDiv, [{
    key: 'show',
    value: function show() {
      var _this = this;
      this.backgroundElement.style.display = 'block';
      this.domElement.style.display = 'block';
      this.domElement.style.opacity = 0;
      this.domElement.style.webkitTransform = 'scale(1.1)';
      this.layout();
      Common.defer(function () {
        _this.backgroundElement.style.opacity = 1;
        _this.domElement.style.opacity = 1;
        _this.domElement.style.webkitTransform = 'scale(1)';
      });
    }
  }, {
    key: 'hide',
    value: function hide() {
      var _this = this;
      var hide = function hide() {
        _this.domElement.style.display = 'none';
        _this.backgroundElement.style.display = 'none';
        dom.unbind(_this.domElement, 'webkitTransitionEnd', hide);
        dom.unbind(_this.domElement, 'transitionend', hide);
        dom.unbind(_this.domElement, 'oTransitionEnd', hide);
      };
      dom.bind(this.domElement, 'webkitTransitionEnd', hide);
      dom.bind(this.domElement, 'transitionend', hide);
      dom.bind(this.domElement, 'oTransitionEnd', hide);
      this.backgroundElement.style.opacity = 0;
      this.domElement.style.opacity = 0;
      this.domElement.style.webkitTransform = 'scale(1.1)';
    }
  }, {
    key: 'layout',
    value: function layout() {
      this.domElement.style.left = window.innerWidth / 2 - dom.getWidth(this.domElement) / 2 + 'px';
      this.domElement.style.top = window.innerHeight / 2 - dom.getHeight(this.domElement) / 2 + 'px';
    }
  }]);
  return CenteredDiv;
}();

var styleSheet = ___$insertStyle(".dg ul{list-style:none;margin:0;padding:0;width:100%;clear:both}.dg.ac{position:fixed;top:0;left:0;right:0;height:0;z-index:0}.dg:not(.ac) .main{overflow:hidden}.dg.main{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear}.dg.main.taller-than-window{overflow-y:auto}.dg.main.taller-than-window .close-button{opacity:1;margin-top:-1px;border-top:1px solid #2c2c2c}.dg.main ul.closed .close-button{opacity:1 !important}.dg.main:hover .close-button,.dg.main .close-button.drag{opacity:1}.dg.main .close-button{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear;border:0;line-height:19px;height:20px;cursor:pointer;text-align:center;background-color:#000}.dg.main .close-button.close-top{position:relative}.dg.main .close-button.close-bottom{position:absolute}.dg.main .close-button:hover{background-color:#111}.dg.a{float:right;margin-right:15px;overflow-y:visible}.dg.a.has-save>ul.close-top{margin-top:0}.dg.a.has-save>ul.close-bottom{margin-top:27px}.dg.a.has-save>ul.closed{margin-top:0}.dg.a .save-row{top:0;z-index:1002}.dg.a .save-row.close-top{position:relative}.dg.a .save-row.close-bottom{position:fixed}.dg li{-webkit-transition:height .1s ease-out;-o-transition:height .1s ease-out;-moz-transition:height .1s ease-out;transition:height .1s ease-out;-webkit-transition:overflow .1s linear;-o-transition:overflow .1s linear;-moz-transition:overflow .1s linear;transition:overflow .1s linear}.dg li:not(.folder){cursor:auto;height:27px;line-height:27px;padding:0 4px 0 5px}.dg li.folder{padding:0;border-left:4px solid rgba(0,0,0,0)}.dg li.title{cursor:pointer;margin-left:-4px}.dg .closed li:not(.title),.dg .closed ul li,.dg .closed ul li>*{height:0;overflow:hidden;border:0}.dg .cr{clear:both;padding-left:3px;height:27px;overflow:hidden}.dg .property-name{cursor:default;float:left;clear:left;width:40%;overflow:hidden;text-overflow:ellipsis}.dg .c{float:left;width:60%;position:relative}.dg .c input[type=text]{border:0;margin-top:4px;padding:3px;width:100%;float:right}.dg .has-slider input[type=text]{width:30%;margin-left:0}.dg .slider{float:left;width:66%;margin-left:-5px;margin-right:0;height:19px;margin-top:4px}.dg .slider-fg{height:100%}.dg .c input[type=checkbox]{margin-top:7px}.dg .c select{margin-top:5px}.dg .cr.function,.dg .cr.function .property-name,.dg .cr.function *,.dg .cr.boolean,.dg .cr.boolean *{cursor:pointer}.dg .cr.color{overflow:visible}.dg .selector{display:none;position:absolute;margin-left:-9px;margin-top:23px;z-index:10}.dg .c:hover .selector,.dg .selector.drag{display:block}.dg li.save-row{padding:0}.dg li.save-row .button{display:inline-block;padding:0px 6px}.dg.dialogue{background-color:#222;width:460px;padding:15px;font-size:13px;line-height:15px}#dg-new-constructor{padding:10px;color:#222;font-family:Monaco, monospace;font-size:10px;border:0;resize:none;box-shadow:inset 1px 1px 1px #888;word-wrap:break-word;margin:12px 0;display:block;width:440px;overflow-y:scroll;height:100px;position:relative}#dg-local-explain{display:none;font-size:11px;line-height:17px;border-radius:3px;background-color:#333;padding:8px;margin-top:10px}#dg-local-explain code{font-size:10px}#dat-gui-save-locally{display:none}.dg{color:#eee;font:11px 'Lucida Grande', sans-serif;text-shadow:0 -1px 0 #111}.dg.main::-webkit-scrollbar{width:5px;background:#1a1a1a}.dg.main::-webkit-scrollbar-corner{height:0;display:none}.dg.main::-webkit-scrollbar-thumb{border-radius:5px;background:#676767}.dg li:not(.folder){background:#1a1a1a;border-bottom:1px solid #2c2c2c}.dg li.save-row{line-height:25px;background:#dad5cb;border:0}.dg li.save-row select{margin-left:5px;width:108px}.dg li.save-row .button{margin-left:5px;margin-top:1px;border-radius:2px;font-size:9px;line-height:7px;padding:4px 4px 5px 4px;background:#c5bdad;color:#fff;text-shadow:0 1px 0 #b0a58f;box-shadow:0 -1px 0 #b0a58f;cursor:pointer}.dg li.save-row .button.gears{background:#c5bdad url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpiYKAU/P//PwGIC/ApCABiBSAW+I8AClAcgKxQ4T9hoMAEUrxx2QSGN6+egDX+/vWT4e7N82AMYoPAx/evwWoYoSYbACX2s7KxCxzcsezDh3evFoDEBYTEEqycggWAzA9AuUSQQgeYPa9fPv6/YWm/Acx5IPb7ty/fw+QZblw67vDs8R0YHyQhgObx+yAJkBqmG5dPPDh1aPOGR/eugW0G4vlIoTIfyFcA+QekhhHJhPdQxbiAIguMBTQZrPD7108M6roWYDFQiIAAv6Aow/1bFwXgis+f2LUAynwoIaNcz8XNx3Dl7MEJUDGQpx9gtQ8YCueB+D26OECAAQDadt7e46D42QAAAABJRU5ErkJggg==) 2px 1px no-repeat;height:7px;width:8px}.dg li.save-row .button:hover{background-color:#bab19e;box-shadow:0 -1px 0 #b0a58f}.dg li.folder{border-bottom:0}.dg li.title{padding-left:16px;background:#000 url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) 6px 10px no-repeat;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.2)}.dg .closed li.title{background-image:url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlGIWqMCbWAEAOw==)}.dg .cr.boolean{border-left:3px solid #806787}.dg .cr.color{border-left:3px solid}.dg .cr.function{border-left:3px solid #e61d5f}.dg .cr.number{border-left:3px solid #2FA1D6}.dg .cr.number input[type=text]{color:#2FA1D6}.dg .cr.string{border-left:3px solid #1ed36f}.dg .cr.string input[type=text]{color:#1ed36f}.dg .cr.function:hover,.dg .cr.boolean:hover{background:#111}.dg .c input[type=text]{background:#303030;outline:none}.dg .c input[type=text]:hover{background:#3c3c3c}.dg .c input[type=text]:focus{background:#494949;color:#fff}.dg .c .slider{background:#303030;cursor:ew-resize}.dg .c .slider-fg{background:#2FA1D6;max-width:100%}.dg .c .slider:hover{background:#3c3c3c}.dg .c .slider:hover .slider-fg{background:#44abda}\n");

css.inject(styleSheet);
var CSS_NAMESPACE = 'dg';
var HIDE_KEY_CODE = 72;
var CLOSE_BUTTON_HEIGHT = 20;
var DEFAULT_DEFAULT_PRESET_NAME = 'Default';
var SUPPORTS_LOCAL_STORAGE = function () {
  try {
    return !!window.localStorage;
  } catch (e) {
    return false;
  }
}();
var SAVE_DIALOGUE = void 0;
var autoPlaceVirgin = true;
var autoPlaceContainer = void 0;
var hide = false;
var hideableGuis = [];
var GUI = function GUI(pars) {
  var _this = this;
  var params = pars || {};
  this.domElement = document.createElement('div');
  this.__ul = document.createElement('ul');
  this.domElement.appendChild(this.__ul);
  dom.addClass(this.domElement, CSS_NAMESPACE);
  this.__folders = {};
  this.__controllers = [];
  this.__rememberedObjects = [];
  this.__rememberedObjectIndecesToControllers = [];
  this.__listening = [];
  params = Common.defaults(params, {
    closeOnTop: false,
    autoPlace: true,
    width: GUI.DEFAULT_WIDTH
  });
  params = Common.defaults(params, {
    resizable: params.autoPlace,
    hideable: params.autoPlace
  });
  if (!Common.isUndefined(params.load)) {
    if (params.preset) {
      params.load.preset = params.preset;
    }
  } else {
    params.load = { preset: DEFAULT_DEFAULT_PRESET_NAME };
  }
  if (Common.isUndefined(params.parent) && params.hideable) {
    hideableGuis.push(this);
  }
  params.resizable = Common.isUndefined(params.parent) && params.resizable;
  if (params.autoPlace && Common.isUndefined(params.scrollable)) {
    params.scrollable = true;
  }
  var useLocalStorage = SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(this, 'isLocal')) === 'true';
  var saveToLocalStorage = void 0;
  var titleRow = void 0;
  Object.defineProperties(this,
  {
    parent: {
      get: function get$$1() {
        return params.parent;
      }
    },
    scrollable: {
      get: function get$$1() {
        return params.scrollable;
      }
    },
    autoPlace: {
      get: function get$$1() {
        return params.autoPlace;
      }
    },
    closeOnTop: {
      get: function get$$1() {
        return params.closeOnTop;
      }
    },
    preset: {
      get: function get$$1() {
        if (_this.parent) {
          return _this.getRoot().preset;
        }
        return params.load.preset;
      },
      set: function set$$1(v) {
        if (_this.parent) {
          _this.getRoot().preset = v;
        } else {
          params.load.preset = v;
        }
        setPresetSelectIndex(this);
        _this.revert();
      }
    },
    width: {
      get: function get$$1() {
        return params.width;
      },
      set: function set$$1(v) {
        params.width = v;
        setWidth(_this, v);
      }
    },
    name: {
      get: function get$$1() {
        return params.name;
      },
      set: function set$$1(v) {
        params.name = v;
        if (titleRow) {
          titleRow.innerHTML = params.name;
        }
      }
    },
    closed: {
      get: function get$$1() {
        return params.closed;
      },
      set: function set$$1(v) {
        params.closed = v;
        if (params.closed) {
          dom.addClass(_this.__ul, GUI.CLASS_CLOSED);
        } else {
          dom.removeClass(_this.__ul, GUI.CLASS_CLOSED);
        }
        this.onResize();
        if (_this.__closeButton) {
          _this.__closeButton.innerHTML = v ? GUI.TEXT_OPEN : GUI.TEXT_CLOSED;
        }
      }
    },
    load: {
      get: function get$$1() {
        return params.load;
      }
    },
    useLocalStorage: {
      get: function get$$1() {
        return useLocalStorage;
      },
      set: function set$$1(bool) {
        if (SUPPORTS_LOCAL_STORAGE) {
          useLocalStorage = bool;
          if (bool) {
            dom.bind(window, 'unload', saveToLocalStorage);
          } else {
            dom.unbind(window, 'unload', saveToLocalStorage);
          }
          localStorage.setItem(getLocalStorageHash(_this, 'isLocal'), bool);
        }
      }
    }
  });
  if (Common.isUndefined(params.parent)) {
    this.closed = params.closed || false;
    dom.addClass(this.domElement, GUI.CLASS_MAIN);
    dom.makeSelectable(this.domElement, false);
    if (SUPPORTS_LOCAL_STORAGE) {
      if (useLocalStorage) {
        _this.useLocalStorage = true;
        var savedGui = localStorage.getItem(getLocalStorageHash(this, 'gui'));
        if (savedGui) {
          params.load = JSON.parse(savedGui);
        }
      }
    }
    this.__closeButton = document.createElement('div');
    this.__closeButton.innerHTML = GUI.TEXT_CLOSED;
    dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_BUTTON);
    if (params.closeOnTop) {
      dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_TOP);
      this.domElement.insertBefore(this.__closeButton, this.domElement.childNodes[0]);
    } else {
      dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_BOTTOM);
      this.domElement.appendChild(this.__closeButton);
    }
    dom.bind(this.__closeButton, 'click', function () {
      _this.closed = !_this.closed;
    });
  } else {
    if (params.closed === undefined) {
      params.closed = true;
    }
    var titleRowName = document.createTextNode(params.name);
    dom.addClass(titleRowName, 'controller-name');
    titleRow = addRow(_this, titleRowName);
    var onClickTitle = function onClickTitle(e) {
      e.preventDefault();
      _this.closed = !_this.closed;
      return false;
    };
    dom.addClass(this.__ul, GUI.CLASS_CLOSED);
    dom.addClass(titleRow, 'title');
    dom.bind(titleRow, 'click', onClickTitle);
    if (!params.closed) {
      this.closed = false;
    }
  }
  if (params.autoPlace) {
    if (Common.isUndefined(params.parent)) {
      if (autoPlaceVirgin) {
        autoPlaceContainer = document.createElement('div');
        dom.addClass(autoPlaceContainer, CSS_NAMESPACE);
        dom.addClass(autoPlaceContainer, GUI.CLASS_AUTO_PLACE_CONTAINER);
        document.body.appendChild(autoPlaceContainer);
        autoPlaceVirgin = false;
      }
      autoPlaceContainer.appendChild(this.domElement);
      dom.addClass(this.domElement, GUI.CLASS_AUTO_PLACE);
    }
    if (!this.parent) {
      setWidth(_this, params.width);
    }
  }
  this.__resizeHandler = function () {
    _this.onResizeDebounced();
  };
  dom.bind(window, 'resize', this.__resizeHandler);
  dom.bind(this.__ul, 'webkitTransitionEnd', this.__resizeHandler);
  dom.bind(this.__ul, 'transitionend', this.__resizeHandler);
  dom.bind(this.__ul, 'oTransitionEnd', this.__resizeHandler);
  this.onResize();
  if (params.resizable) {
    addResizeHandle(this);
  }
  saveToLocalStorage = function saveToLocalStorage() {
    if (SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(_this, 'isLocal')) === 'true') {
      localStorage.setItem(getLocalStorageHash(_this, 'gui'), JSON.stringify(_this.getSaveObject()));
    }
  };
  this.saveToLocalStorageIfPossible = saveToLocalStorage;
  function resetWidth() {
    var root = _this.getRoot();
    root.width += 1;
    Common.defer(function () {
      root.width -= 1;
    });
  }
  if (!params.parent) {
    resetWidth();
  }
};
GUI.toggleHide = function () {
  hide = !hide;
  Common.each(hideableGuis, function (gui) {
    gui.domElement.style.display = hide ? 'none' : '';
  });
};
GUI.CLASS_AUTO_PLACE = 'a';
GUI.CLASS_AUTO_PLACE_CONTAINER = 'ac';
GUI.CLASS_MAIN = 'main';
GUI.CLASS_CONTROLLER_ROW = 'cr';
GUI.CLASS_TOO_TALL = 'taller-than-window';
GUI.CLASS_CLOSED = 'closed';
GUI.CLASS_CLOSE_BUTTON = 'close-button';
GUI.CLASS_CLOSE_TOP = 'close-top';
GUI.CLASS_CLOSE_BOTTOM = 'close-bottom';
GUI.CLASS_DRAG = 'drag';
GUI.DEFAULT_WIDTH = 245;
GUI.TEXT_CLOSED = 'Close Controls';
GUI.TEXT_OPEN = 'Open Controls';
GUI._keydownHandler = function (e) {
  if (document.activeElement.type !== 'text' && (e.which === HIDE_KEY_CODE || e.keyCode === HIDE_KEY_CODE)) {
    GUI.toggleHide();
  }
};
dom.bind(window, 'keydown', GUI._keydownHandler, false);
Common.extend(GUI.prototype,
{
  add: function add(object, property) {
    return _add(this, object, property, {
      factoryArgs: Array.prototype.slice.call(arguments, 2)
    });
  },
  addColor: function addColor(object, property) {
    return _add(this, object, property, {
      color: true
    });
  },
  remove: function remove(controller) {
    this.__ul.removeChild(controller.__li);
    this.__controllers.splice(this.__controllers.indexOf(controller), 1);
    var _this = this;
    Common.defer(function () {
      _this.onResize();
    });
  },
  destroy: function destroy() {
    if (this.parent) {
      throw new Error('Only the root GUI should be removed with .destroy(). ' + 'For subfolders, use gui.removeFolder(folder) instead.');
    }
    if (this.autoPlace) {
      autoPlaceContainer.removeChild(this.domElement);
    }
    var _this = this;
    Common.each(this.__folders, function (subfolder) {
      _this.removeFolder(subfolder);
    });
    dom.unbind(window, 'keydown', GUI._keydownHandler, false);
    removeListeners(this);
  },
  addFolder: function addFolder(name) {
    if (this.__folders[name] !== undefined) {
      throw new Error('You already have a folder in this GUI by the' + ' name "' + name + '"');
    }
    var newGuiParams = { name: name, parent: this };
    newGuiParams.autoPlace = this.autoPlace;
    if (this.load &&
    this.load.folders &&
    this.load.folders[name]) {
      newGuiParams.closed = this.load.folders[name].closed;
      newGuiParams.load = this.load.folders[name];
    }
    var gui = new GUI(newGuiParams);
    this.__folders[name] = gui;
    var li = addRow(this, gui.domElement);
    dom.addClass(li, 'folder');
    return gui;
  },
  removeFolder: function removeFolder(folder) {
    this.__ul.removeChild(folder.domElement.parentElement);
    delete this.__folders[folder.name];
    if (this.load &&
    this.load.folders &&
    this.load.folders[folder.name]) {
      delete this.load.folders[folder.name];
    }
    removeListeners(folder);
    var _this = this;
    Common.each(folder.__folders, function (subfolder) {
      folder.removeFolder(subfolder);
    });
    Common.defer(function () {
      _this.onResize();
    });
  },
  open: function open() {
    this.closed = false;
  },
  close: function close() {
    this.closed = true;
  },
  hide: function hide() {
    this.domElement.style.display = 'none';
  },
  show: function show() {
    this.domElement.style.display = '';
  },
  onResize: function onResize() {
    var root = this.getRoot();
    if (root.scrollable) {
      var top = dom.getOffset(root.__ul).top;
      var h = 0;
      Common.each(root.__ul.childNodes, function (node) {
        if (!(root.autoPlace && node === root.__save_row)) {
          h += dom.getHeight(node);
        }
      });
      if (window.innerHeight - top - CLOSE_BUTTON_HEIGHT < h) {
        dom.addClass(root.domElement, GUI.CLASS_TOO_TALL);
        root.__ul.style.height = window.innerHeight - top - CLOSE_BUTTON_HEIGHT + 'px';
      } else {
        dom.removeClass(root.domElement, GUI.CLASS_TOO_TALL);
        root.__ul.style.height = 'auto';
      }
    }
    if (root.__resize_handle) {
      Common.defer(function () {
        root.__resize_handle.style.height = root.__ul.offsetHeight + 'px';
      });
    }
    if (root.__closeButton) {
      root.__closeButton.style.width = root.width + 'px';
    }
  },
  onResizeDebounced: Common.debounce(function () {
    this.onResize();
  }, 50),
  remember: function remember() {
    if (Common.isUndefined(SAVE_DIALOGUE)) {
      SAVE_DIALOGUE = new CenteredDiv();
      SAVE_DIALOGUE.domElement.innerHTML = saveDialogContents;
    }
    if (this.parent) {
      throw new Error('You can only call remember on a top level GUI.');
    }
    var _this = this;
    Common.each(Array.prototype.slice.call(arguments), function (object) {
      if (_this.__rememberedObjects.length === 0) {
        addSaveMenu(_this);
      }
      if (_this.__rememberedObjects.indexOf(object) === -1) {
        _this.__rememberedObjects.push(object);
      }
    });
    if (this.autoPlace) {
      setWidth(this, this.width);
    }
  },
  getRoot: function getRoot() {
    var gui = this;
    while (gui.parent) {
      gui = gui.parent;
    }
    return gui;
  },
  getSaveObject: function getSaveObject() {
    var toReturn = this.load;
    toReturn.closed = this.closed;
    if (this.__rememberedObjects.length > 0) {
      toReturn.preset = this.preset;
      if (!toReturn.remembered) {
        toReturn.remembered = {};
      }
      toReturn.remembered[this.preset] = getCurrentPreset(this);
    }
    toReturn.folders = {};
    Common.each(this.__folders, function (element, key) {
      toReturn.folders[key] = element.getSaveObject();
    });
    return toReturn;
  },
  save: function save() {
    if (!this.load.remembered) {
      this.load.remembered = {};
    }
    this.load.remembered[this.preset] = getCurrentPreset(this);
    markPresetModified(this, false);
    this.saveToLocalStorageIfPossible();
  },
  saveAs: function saveAs(presetName) {
    if (!this.load.remembered) {
      this.load.remembered = {};
      this.load.remembered[DEFAULT_DEFAULT_PRESET_NAME] = getCurrentPreset(this, true);
    }
    this.load.remembered[presetName] = getCurrentPreset(this);
    this.preset = presetName;
    addPresetOption(this, presetName, true);
    this.saveToLocalStorageIfPossible();
  },
  revert: function revert(gui) {
    Common.each(this.__controllers, function (controller) {
      if (!this.getRoot().load.remembered) {
        controller.setValue(controller.initialValue);
      } else {
        recallSavedValue(gui || this.getRoot(), controller);
      }
      if (controller.__onFinishChange) {
        controller.__onFinishChange.call(controller, controller.getValue());
      }
    }, this);
    Common.each(this.__folders, function (folder) {
      folder.revert(folder);
    });
    if (!gui) {
      markPresetModified(this.getRoot(), false);
    }
  },
  listen: function listen(controller) {
    var init = this.__listening.length === 0;
    this.__listening.push(controller);
    if (init) {
      updateDisplays(this.__listening);
    }
  },
  updateDisplay: function updateDisplay() {
    Common.each(this.__controllers, function (controller) {
      controller.updateDisplay();
    });
    Common.each(this.__folders, function (folder) {
      folder.updateDisplay();
    });
  }
});
function addRow(gui, newDom, liBefore) {
  var li = document.createElement('li');
  if (newDom) {
    li.appendChild(newDom);
  }
  if (liBefore) {
    gui.__ul.insertBefore(li, liBefore);
  } else {
    gui.__ul.appendChild(li);
  }
  gui.onResize();
  return li;
}
function removeListeners(gui) {
  dom.unbind(window, 'resize', gui.__resizeHandler);
  if (gui.saveToLocalStorageIfPossible) {
    dom.unbind(window, 'unload', gui.saveToLocalStorageIfPossible);
  }
}
function markPresetModified(gui, modified) {
  var opt = gui.__preset_select[gui.__preset_select.selectedIndex];
  if (modified) {
    opt.innerHTML = opt.value + '*';
  } else {
    opt.innerHTML = opt.value;
  }
}
function augmentController(gui, li, controller) {
  controller.__li = li;
  controller.__gui = gui;
  Common.extend(controller,                                   {
    options: function options(_options) {
      if (arguments.length > 1) {
        var nextSibling = controller.__li.nextElementSibling;
        controller.remove();
        return _add(gui, controller.object, controller.property, {
          before: nextSibling,
          factoryArgs: [Common.toArray(arguments)]
        });
      }
      if (Common.isArray(_options) || Common.isObject(_options)) {
        var _nextSibling = controller.__li.nextElementSibling;
        controller.remove();
        return _add(gui, controller.object, controller.property, {
          before: _nextSibling,
          factoryArgs: [_options]
        });
      }
    },
    name: function name(_name) {
      controller.__li.firstElementChild.firstElementChild.innerHTML = _name;
      return controller;
    },
    listen: function listen() {
      controller.__gui.listen(controller);
      return controller;
    },
    remove: function remove() {
      controller.__gui.remove(controller);
      return controller;
    }
  });
  if (controller instanceof NumberControllerSlider) {
    var box = new NumberControllerBox(controller.object, controller.property, { min: controller.__min, max: controller.__max, step: controller.__step });
    Common.each(['updateDisplay', 'onChange', 'onFinishChange', 'step', 'min', 'max'], function (method) {
      var pc = controller[method];
      var pb = box[method];
      controller[method] = box[method] = function () {
        var args = Array.prototype.slice.call(arguments);
        pb.apply(box, args);
        return pc.apply(controller, args);
      };
    });
    dom.addClass(li, 'has-slider');
    controller.domElement.insertBefore(box.domElement, controller.domElement.firstElementChild);
  } else if (controller instanceof NumberControllerBox) {
    var r = function r(returned) {
      if (Common.isNumber(controller.__min) && Common.isNumber(controller.__max)) {
        var oldName = controller.__li.firstElementChild.firstElementChild.innerHTML;
        var wasListening = controller.__gui.__listening.indexOf(controller) > -1;
        controller.remove();
        var newController = _add(gui, controller.object, controller.property, {
          before: controller.__li.nextElementSibling,
          factoryArgs: [controller.__min, controller.__max, controller.__step]
        });
        newController.name(oldName);
        if (wasListening) newController.listen();
        return newController;
      }
      return returned;
    };
    controller.min = Common.compose(r, controller.min);
    controller.max = Common.compose(r, controller.max);
  } else if (controller instanceof BooleanController) {
    dom.bind(li, 'click', function () {
      dom.fakeEvent(controller.__checkbox, 'click');
    });
    dom.bind(controller.__checkbox, 'click', function (e) {
      e.stopPropagation();
    });
  } else if (controller instanceof FunctionController) {
    dom.bind(li, 'click', function () {
      dom.fakeEvent(controller.__button, 'click');
    });
    dom.bind(li, 'mouseover', function () {
      dom.addClass(controller.__button, 'hover');
    });
    dom.bind(li, 'mouseout', function () {
      dom.removeClass(controller.__button, 'hover');
    });
  } else if (controller instanceof ColorController) {
    dom.addClass(li, 'color');
    controller.updateDisplay = Common.compose(function (val) {
      li.style.borderLeftColor = controller.__color.toString();
      return val;
    }, controller.updateDisplay);
    controller.updateDisplay();
  }
  controller.setValue = Common.compose(function (val) {
    if (gui.getRoot().__preset_select && controller.isModified()) {
      markPresetModified(gui.getRoot(), true);
    }
    return val;
  }, controller.setValue);
}
function recallSavedValue(gui, controller) {
  var root = gui.getRoot();
  var matchedIndex = root.__rememberedObjects.indexOf(controller.object);
  if (matchedIndex !== -1) {
    var controllerMap = root.__rememberedObjectIndecesToControllers[matchedIndex];
    if (controllerMap === undefined) {
      controllerMap = {};
      root.__rememberedObjectIndecesToControllers[matchedIndex] = controllerMap;
    }
    controllerMap[controller.property] = controller;
    if (root.load && root.load.remembered) {
      var presetMap = root.load.remembered;
      var preset = void 0;
      if (presetMap[gui.preset]) {
        preset = presetMap[gui.preset];
      } else if (presetMap[DEFAULT_DEFAULT_PRESET_NAME]) {
        preset = presetMap[DEFAULT_DEFAULT_PRESET_NAME];
      } else {
        return;
      }
      if (preset[matchedIndex] && preset[matchedIndex][controller.property] !== undefined) {
        var value = preset[matchedIndex][controller.property];
        controller.initialValue = value;
        controller.setValue(value);
      }
    }
  }
}
function _add(gui, object, property, params) {
  if (object[property] === undefined) {
    throw new Error('Object "' + object + '" has no property "' + property + '"');
  }
  var controller = void 0;
  if (params.color) {
    controller = new ColorController(object, property);
  } else {
    var factoryArgs = [object, property].concat(params.factoryArgs);
    controller = ControllerFactory.apply(gui, factoryArgs);
  }
  if (params.before instanceof Controller) {
    params.before = params.before.__li;
  }
  recallSavedValue(gui, controller);
  dom.addClass(controller.domElement, 'c');
  var name = document.createElement('span');
  dom.addClass(name, 'property-name');
  name.innerHTML = controller.property;
  var container = document.createElement('div');
  container.appendChild(name);
  container.appendChild(controller.domElement);
  var li = addRow(gui, container, params.before);
  dom.addClass(li, GUI.CLASS_CONTROLLER_ROW);
  if (controller instanceof ColorController) {
    dom.addClass(li, 'color');
  } else {
    dom.addClass(li, _typeof(controller.getValue()));
  }
  augmentController(gui, li, controller);
  gui.__controllers.push(controller);
  return controller;
}
function getLocalStorageHash(gui, key) {
  return document.location.href + '.' + key;
}
function addPresetOption(gui, name, setSelected) {
  var opt = document.createElement('option');
  opt.innerHTML = name;
  opt.value = name;
  gui.__preset_select.appendChild(opt);
  if (setSelected) {
    gui.__preset_select.selectedIndex = gui.__preset_select.length - 1;
  }
}
function showHideExplain(gui, explain) {
  explain.style.display = gui.useLocalStorage ? 'block' : 'none';
}
function addSaveMenu(gui) {
  var div = gui.__save_row = document.createElement('li');
  dom.addClass(gui.domElement, 'has-save');
  gui.__ul.insertBefore(div, gui.__ul.firstChild);
  dom.addClass(div, 'save-row');
  var gears = document.createElement('span');
  gears.innerHTML = '&nbsp;';
  dom.addClass(gears, 'button gears');
  var button = document.createElement('span');
  button.innerHTML = 'Save';
  dom.addClass(button, 'button');
  dom.addClass(button, 'save');
  var button2 = document.createElement('span');
  button2.innerHTML = 'New';
  dom.addClass(button2, 'button');
  dom.addClass(button2, 'save-as');
  var button3 = document.createElement('span');
  button3.innerHTML = 'Revert';
  dom.addClass(button3, 'button');
  dom.addClass(button3, 'revert');
  var select = gui.__preset_select = document.createElement('select');
  if (gui.load && gui.load.remembered) {
    Common.each(gui.load.remembered, function (value, key) {
      addPresetOption(gui, key, key === gui.preset);
    });
  } else {
    addPresetOption(gui, DEFAULT_DEFAULT_PRESET_NAME, false);
  }
  dom.bind(select, 'change', function () {
    for (var index = 0; index < gui.__preset_select.length; index++) {
      gui.__preset_select[index].innerHTML = gui.__preset_select[index].value;
    }
    gui.preset = this.value;
  });
  div.appendChild(select);
  div.appendChild(gears);
  div.appendChild(button);
  div.appendChild(button2);
  div.appendChild(button3);
  if (SUPPORTS_LOCAL_STORAGE) {
    var explain = document.getElementById('dg-local-explain');
    var localStorageCheckBox = document.getElementById('dg-local-storage');
    var saveLocally = document.getElementById('dg-save-locally');
    saveLocally.style.display = 'block';
    if (localStorage.getItem(getLocalStorageHash(gui, 'isLocal')) === 'true') {
      localStorageCheckBox.setAttribute('checked', 'checked');
    }
    showHideExplain(gui, explain);
    dom.bind(localStorageCheckBox, 'change', function () {
      gui.useLocalStorage = !gui.useLocalStorage;
      showHideExplain(gui, explain);
    });
  }
  var newConstructorTextArea = document.getElementById('dg-new-constructor');
  dom.bind(newConstructorTextArea, 'keydown', function (e) {
    if (e.metaKey && (e.which === 67 || e.keyCode === 67)) {
      SAVE_DIALOGUE.hide();
    }
  });
  dom.bind(gears, 'click', function () {
    newConstructorTextArea.innerHTML = JSON.stringify(gui.getSaveObject(), undefined, 2);
    SAVE_DIALOGUE.show();
    newConstructorTextArea.focus();
    newConstructorTextArea.select();
  });
  dom.bind(button, 'click', function () {
    gui.save();
  });
  dom.bind(button2, 'click', function () {
    var presetName = prompt('Enter a new preset name.');
    if (presetName) {
      gui.saveAs(presetName);
    }
  });
  dom.bind(button3, 'click', function () {
    gui.revert();
  });
}
function addResizeHandle(gui) {
  var pmouseX = void 0;
  gui.__resize_handle = document.createElement('div');
  Common.extend(gui.__resize_handle.style, {
    width: '6px',
    marginLeft: '-3px',
    height: '200px',
    cursor: 'ew-resize',
    position: 'absolute'
  });
  function drag(e) {
    e.preventDefault();
    gui.width += pmouseX - e.clientX;
    gui.onResize();
    pmouseX = e.clientX;
    return false;
  }
  function dragStop() {
    dom.removeClass(gui.__closeButton, GUI.CLASS_DRAG);
    dom.unbind(window, 'mousemove', drag);
    dom.unbind(window, 'mouseup', dragStop);
  }
  function dragStart(e) {
    e.preventDefault();
    pmouseX = e.clientX;
    dom.addClass(gui.__closeButton, GUI.CLASS_DRAG);
    dom.bind(window, 'mousemove', drag);
    dom.bind(window, 'mouseup', dragStop);
    return false;
  }
  dom.bind(gui.__resize_handle, 'mousedown', dragStart);
  dom.bind(gui.__closeButton, 'mousedown', dragStart);
  gui.domElement.insertBefore(gui.__resize_handle, gui.domElement.firstElementChild);
}
function setWidth(gui, w) {
  gui.domElement.style.width = w + 'px';
  if (gui.__save_row && gui.autoPlace) {
    gui.__save_row.style.width = w + 'px';
  }
  if (gui.__closeButton) {
    gui.__closeButton.style.width = w + 'px';
  }
}
function getCurrentPreset(gui, useInitialValues) {
  var toReturn = {};
  Common.each(gui.__rememberedObjects, function (val, index) {
    var savedValues = {};
    var controllerMap = gui.__rememberedObjectIndecesToControllers[index];
    Common.each(controllerMap, function (controller, property) {
      savedValues[property] = useInitialValues ? controller.initialValue : controller.getValue();
    });
    toReturn[index] = savedValues;
  });
  return toReturn;
}
function setPresetSelectIndex(gui) {
  for (var index = 0; index < gui.__preset_select.length; index++) {
    if (gui.__preset_select[index].value === gui.preset) {
      gui.__preset_select.selectedIndex = index;
    }
  }
}
function updateDisplays(controllerArray) {
  if (controllerArray.length !== 0) {
    requestAnimationFrame$1$1.call(window, function () {
      updateDisplays(controllerArray);
    });
  }
  Common.each(controllerArray, function (c) {
    c.updateDisplay();
  });
}

var color = {
  Color: Color,
  math: ColorMath,
  interpret: interpret
};
var controllers = {
  Controller: Controller,
  BooleanController: BooleanController,
  OptionController: OptionController,
  StringController: StringController,
  NumberController: NumberController,
  NumberControllerBox: NumberControllerBox,
  NumberControllerSlider: NumberControllerSlider,
  FunctionController: FunctionController,
  ColorController: ColorController
};
var dom$1 = { dom: dom };
var gui = { GUI: GUI };
var GUI$1 = GUI;
var index = {
  color: color,
  controllers: controllers,
  dom: dom$1,
  gui: gui,
  GUI: GUI$1
};

//      
// An event handler can take an optional event argument
// and should not return a value
                                          
                                                               

// An array of all currently registered event handlers for a type
                                            
                                                            
// A map of event types and their corresponding event handlers.
                        
                                 
                                   
  

/** Mitt: Tiny (~200b) functional event emitter / pubsub.
 *  @name mitt
 *  @returns {Mitt}
 */
function mitt(all                 ) {
	all = all || Object.create(null);

	return {
		/**
		 * Register an event handler for the given type.
		 *
		 * @param  {String} type	Type of event to listen for, or `"*"` for all events
		 * @param  {Function} handler Function to call in response to given event
		 * @memberOf mitt
		 */
		on: function on(type        , handler              ) {
			(all[type] || (all[type] = [])).push(handler);
		},

		/**
		 * Remove an event handler for the given type.
		 *
		 * @param  {String} type	Type of event to unregister `handler` from, or `"*"`
		 * @param  {Function} handler Handler function to remove
		 * @memberOf mitt
		 */
		off: function off(type        , handler              ) {
			if (all[type]) {
				all[type].splice(all[type].indexOf(handler) >>> 0, 1);
			}
		},

		/**
		 * Invoke all handlers for the given type.
		 * If present, `"*"` handlers are invoked after type-matched handlers.
		 *
		 * @param {String} type  The event type to invoke
		 * @param {Any} [evt]  Any value (object is recommended and powerful), passed to each handler
		 * @memberOf mitt
		 */
		emit: function emit(type        , evt     ) {
			(all[type] || []).slice().map(function (handler) { handler(evt); });
			(all['*'] || []).slice().map(function (handler) { handler(type, evt); });
		}
	};
}

const Emitter = () => {
    const emitter = mitt();

    emitter.emitAsync = (event, data = {}) => {
        return new Promise((resolve, reject) => {
            emitter.emit(event, { ...data, resolve, reject });
        });
    };

    return emitter;
};

const emitter = Emitter();

class Component {

    constructor(name) {
        this.name = name;
        this.container = new THREE.Object3D();

        this.update = this.update.bind(this);
        this.resize = this.resize.bind(this);

        emitter.on('frame', this.update);
        emitter.on('resize', this.resize);

        if (typeof this.onGUI === 'function') {
            const parentGUI = this.parent && this.parent.gui ? this.parent.gui : window.gui;

            this.gui = parentGUI.addFolder(this.name);
        }
    }

    init() {

    }

    add(object) {
        if (object.isObject3D) {
            this.container.add(object);
        } else if (object.container.isObject3D) {
            this.container.add(object.container);
        }
    }

    update() {

    }

    resize() {

    }

}

const Assets = new Map();

var vertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
    vUv = uv;

    vec3 transformed = position;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.);
}
`;

var fragmentShader = /* glsl */ `
uniform sampler2D map;
uniform float opacity;
uniform float globalOpacity;
uniform float globalAlphaSpeed;

varying vec2 vUv;

void main() {
    vec4 mapTexel = texture2D(map, vUv);

    mapTexel.a *= opacity;

    mapTexel.a *= globalOpacity * globalAlphaSpeed;

    if(mapTexel.a < 0.001){
    	discard;
    }

    gl_FragColor = mapTexel;
}
`;

var vertexShaderShadow = /* glsl */`
varying vec2 vUv;

void main() {
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}
`;

var fragmentShaderShadow = /* glsl */`
uniform vec3 diffuse;
uniform float opacity;
uniform float globalOpacity;
uniform float globalAlphaSpeed;
varying vec2 vUv;

#include <common>

void main() {
    vec3 diffuseColor = diffuse;
    float o = opacity;

    o *= sin(vUv.x * PI);
    o *= sin(vUv.y * PI);

    o *= globalOpacity * globalAlphaSpeed;

    if(o < 0.001){
    	discard;
    }

    gl_FragColor = vec4(diffuseColor, o);
}
`;

const items = new Map();

const Globals = {
    set: (id, value) => {
        items.set(id, value);
    },
    get: (id, value) => {
        if (items.has(id)) {
            return items.get(id);
        }

        return false;
    }
};

class Bills extends Component {

    constructor() {
        super('bills');

        this.init();
        // this.onGUI();
    }

    init() {
        this.container.visible = false;

        const geometry = new THREE.PlaneBufferGeometry(1, 1);
        geometry.rotateZ(-Math.PI * 0.5);
        
        const texture0 = Assets.get('bill-0');
        const texture0Blur = Assets.get('bill-0-blur');
        const texture1 = Assets.get('bill-1');
        const texture1Blur = Assets.get('bill-1-blur');

        const material0 = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                map: { value: texture0 },
                opacity: { value: 1 },
                globalAlphaSpeed: {value: 1},
                globalOpacity: { value: Globals.get('globalOpacity')},
               
            },
            transparent: true
        });

        const material0Blur = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                map: { value: texture0Blur },
                opacity: { value: 0.5 },
                globalAlphaSpeed: {value: 1},
                globalOpacity: { value: Globals.get('globalOpacity')},
            },
            transparent: true
        });

        const material1 = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                map: { value: texture1 },
                opacity: { value: 1 },
                globalAlphaSpeed: {value: 1},
                globalOpacity: { value: Globals.get('globalOpacity')},
                
            },
            transparent: true
        });

        const material1Blur = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                map: { value: texture1Blur },
                opacity: { value: 0.3 },
                globalAlphaSpeed: {value: 1},
                globalOpacity: { value: Globals.get('globalOpacity')},
            },
            transparent: true
        });

        const shadowMaterial = new THREE.ShaderMaterial({
            vertexShader: vertexShaderShadow,
            fragmentShader: fragmentShaderShadow,
            uniforms: {
                diffuse: { value: new THREE.Color(0x000000) },
                opacity: { value: 0.75 },
                globalAlphaSpeed: {value: 1},
                globalOpacity: { value: Globals.get('globalOpacity')},
            },
            transparent: true
        });

        // const material0 = new THREE.MeshBasicMaterial({
        //     map: texture0,
        // });

        // const material1 = new THREE.MeshBasicMaterial({
        //     map: texture1,
        // });

        const count = 4;

        this.bills = [];
        this.shadows = [];
        this.globalScale = this.computeGlobalScale();

        for (let i = 0; i < count; i++) {
            const material = (i + 1) % 2 === 0 ? material0 : material1;
            const texture = (i + 1) % 2 === 0 ? texture0 : texture1;

            const mesh = new THREE.Mesh(geometry, material);
            const scale = new THREE.Vector2(texture.image.naturalHeight, texture.image.naturalWidth).normalize();
            mesh.scaling = scale;
            mesh.scale.set(scale.x, scale.y, 1);
            this.add(mesh);

            this.bills[i] = mesh;

            const shadow = new THREE.Mesh(geometry, shadowMaterial);
            this.add(shadow);

            this.shadows[i] = shadow;
        }


        const blur0 = new THREE.Mesh(geometry, material0Blur);
        blur0.scaling = new THREE.Vector2(texture0Blur.image.naturalHeight, texture0Blur.image.naturalWidth).normalize();
        this.add(blur0);
        this.bills.push(blur0);
        
        const blur1 = new THREE.Mesh(geometry, material1Blur);
        blur1.scaling = new THREE.Vector2(texture1Blur.image.naturalHeight, texture1Blur.image.naturalWidth).normalize();
        this.add(blur1);
        this.bills.push(blur1);
    }

    // onGUI() {
    //     for (let i = 0; i < this.data.length; i++) {
    //         const data = this.data[i];
    //         const name = i === 0 ? 'display' : 'hide';
    //         const gui = this.gui.addFolder(name);

    //         for (let j = 0; j < this.container.children.length; j++) {
    //             const guiBill = gui.addFolder(`bill${j}`);

    //             Object.keys(data[j]).map(k => {
    //                 const param = data[j][k];

    //                 if (param.isVector3) {
    //                     guiBill.add(param, 'x', -10, 10).name(`${k} x`);
    //                     guiBill.add(param, 'y', -10, 10).name(`${k} y`);
    //                     guiBill.add(param, 'z', -10, 10).name(`${k} z`);
    //                 } else {
    //                     const range = k.includes('Angle') ? [-Math.PI, Math.PI] : [0, 1];

    //                     guiBill.add(data[j], k, range[0], range[1]);
    //                 }

    //             });

    //         }
    //     }
    // }

    update() {

        this.globalScale = Globals.get('card').baseScale / 4.5;

        // console.log(this.globalScale)

        const opacity = Globals.get('globalOpacity');

        for (let i = 0; i < this.container.children.length; i++) {
            this.container.children[i].material.uniforms.globalOpacity.value = opacity;
        }
    }

    setGlobalAlphaSpeed(val){

        let i = 0;
        while(i < this.bills.length){
            this.bills[i].material.uniforms.globalAlphaSpeed.value = val;
            i++;
        }

        i = 0;

        while(i < this.shadows.length){
            this.shadows[i].material.uniforms.globalAlphaSpeed.value = val;
            i++;
        }

    


    }

    computeGlobalScale() {

        const isMobile = Globals.get('mobile-webgl');

        const isLandscape = window.innerWidth > window.innerHeight;

        if(isMobile){

            if (isLandscape) {
                const baseScale1280 = 0.9;
                let ratio = window.innerWidth / 1440;
                ratio = Math.max(1, ratio);

                const s = baseScale1280 / ratio;

                return s;
            } else {
                return 0.75 * baseScale1280;
            }

        }
        else{

            var baseScale1280 = 1;

            if (isLandscape) {
              
                let ratio = window.innerWidth / 1440;
                ratio = Math.max(1, ratio);

                const s = baseScale1280 / ratio;

                return s;

            } else {

                let ratio = window.innerHeight / window.innerWidth;

                var baseScale1280 = 0.7;

                console.log(baseScale1280 / ratio);
                console.log(baseScale1280 / ratio);
                console.log(baseScale1280 / ratio);

                return baseScale1280 / ratio;
            }
        }

        // const radius1280 = radius;

        // let ratio = 1

        // if(isLandscape){

        //     ratio = window.innerWidth / 1280;

        //     ratio = Math.max(1, ratio)

        // }

        // else{

        //     ratio = window.innerHeight / window.innerWidth;

        // }

      
    }

    resize() {
        this.globalScale = this.computeGlobalScale();
    }

}

var vertexShader$1 = /* glsl */ `
varying vec2 vUv;

uniform float displacement;
uniform vec3 uPerspectiveTopLeft;
uniform vec3 uPerspectiveTopRight;
uniform vec3 uPerspectiveBottomLeft;
uniform vec3 uPerspectiveBottomRight;

#include <common>

float mapRange(float value, float low1, float high1, float low2, float high2) {
    return low2 + (value - low1) * (high2 - low2) / (high1 - low1);
}

float when_lt(float x, float y) {
  return max(sign(y - x), 0.0);
}

void main() {
    vUv = uv;

    vec3 transformed = position;

    transformed.z += sin(uv.x * PI) * displacement;

    // top right
    transformed.xyz += uv.x * uv.y * uPerspectiveTopRight;
    // top left
    transformed.xyz += (1. - uv.x) * uv.y * uPerspectiveTopLeft;
    // bottom right
    transformed.xyz += uv.x * (1. - uv.y) * uPerspectiveBottomRight;
    // bottom left
    transformed.xyz += (1. - uv.x) * (1. - uv.y) * uPerspectiveBottomLeft;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.);
}
`;

var fragmentShader$1 = /* glsl */ `
uniform sampler2D map;
uniform float opacity;
uniform float globalOpacity;
uniform float globalAlphaSpeed;

varying vec2 vUv;

void main() {
    vec4 mapTexel = texture2D(map, vUv);
    mapTexel.a *= opacity;
    mapTexel.a *= globalOpacity * globalAlphaSpeed;

    if(mapTexel.a < 0.001){

    	discard;
    }

    gl_FragColor = mapTexel;
}
`;

var vertexShaderShadow$1 = /* glsl */`
varying vec2 vUv;

void main() {
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}
`;

var fragmentShaderShadow$1 = /* glsl */`
uniform float opacity;
uniform float globalOpacity;
uniform float globalAlphaSpeed;
uniform vec2 uRotation;
uniform vec3 diffuse;
uniform sampler2D map;


varying vec2 vUv;

#include <common>

void main() {
    vec4 mapTexel = texture2D(map, vUv);

    vec3 diffuseColor = diffuse;
    float o = opacity;

    // o = (o * sin(vUv.x * PI));
    // o = (o * sin(vUv.y * PI));

    // o *= mix(1. - vUv.x, vUv.x, uRotation.y);
    // o *= mix(vUv.y, 1. - vUv.y, uRotation.x);

    o *= mapTexel.a * globalOpacity * globalAlphaSpeed;

    if(o < 0.001){
    	discard;
    }

    gl_FragColor = vec4(mapTexel.rgb, o);
}
`;

var DetectUA = /** @class */ (function () {
    /**
     * Detect a users browser, browser version and wheter it is a mobile-, tablet- or desktop device.
     *
     * @param forceUserAgent Force a user agent string (useful for testing)
     */
    function DetectUA(forceUserAgent) {
        // Internal cache, prevents from doing the same computations twice
        this.cache = new Map();
        this.userAgent = forceUserAgent
            ? forceUserAgent
            : window && window.navigator
                ? window.navigator.userAgent
                : '';
        this.android = !/like android/i.test(this.userAgent) && /android/i.test(this.userAgent);
        this.iOS = this.match(1, /(iphone|ipod|ipad)/i).toLowerCase();
    }
    /**
     * Match entry based on position found in the user-agent string
     *
     * @param pattern regular expression pattern
     */
    DetectUA.prototype.match = function (position, pattern) {
        var match = this.userAgent.match(pattern);
        return (match && match.length > 1 && match[position]) || '';
    };
    Object.defineProperty(DetectUA.prototype, "isMobile", {
        /**
         * Returns if the device is a mobile device
         */
        get: function () {
            var cached = this.cache.get('isMobile');
            if (cached) {
                return cached;
            }
            else {
                if (
                // Default mobile
                !this.isTablet &&
                    (/[^-]mobi/i.test(this.userAgent) ||
                        // iPhone / iPod
                        (this.iOS === 'iphone' || this.iOS === 'ipod') ||
                        // Android
                        this.android ||
                        // Nexus mobile
                        /nexus\s*[0-6]\s*/i.test(this.userAgent))) {
                    this.cache.set('isMobile', true);
                    return true;
                }
                this.cache.set('isMobile', false);
                return false;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DetectUA.prototype, "isTablet", {
        /**
         * Returns if the device is a tablet device
         */
        get: function () {
            var cached = this.cache.get('isTablet');
            if (cached) {
                return cached;
            }
            else {
                if (
                // Default tablet
                (/tablet/i.test(this.userAgent) && !/tablet pc/i.test(this.userAgent)) ||
                    // iPad
                    this.iOS === 'ipad' ||
                    // Android
                    (this.android && !/[^-]mobi/i.test(this.userAgent)) ||
                    // Nexus tablet
                    (!/nexus\s*[0-6]\s*/i.test(this.userAgent) && /nexus\s*[0-9]+/i.test(this.userAgent))) {
                    this.cache.set('isTablet', true);
                    return true;
                }
                this.cache.set('isTablet', false);
                return false;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DetectUA.prototype, "isDesktop", {
        /**
         * Returns if the device is a desktop device
         */
        get: function () {
            var cached = this.cache.get('isDesktop');
            if (cached) {
                return cached;
            }
            else {
                var result = !this.isMobile && !this.isTablet;
                this.cache.set('isDesktop', result);
                return result;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DetectUA.prototype, "isiOS", {
        /**
         * Returns if the device is an iOS device
         */
        get: function () {
            var cached = this.cache.get('isiOS');
            if (cached) {
                return cached;
            }
            else {
                if (this.iOS) {
                    return {
                        name: 'iOS',
                        version: this.match(1, /os (\d+([_\s]\d+)*) like mac os x/i).replace(/[_\s]/g, '.'),
                    };
                }
                else {
                    return false;
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DetectUA.prototype, "isAndroid", {
        /**
         * Returns if the device is an Android device
         */
        get: function () {
            var cached = this.cache.get('isAndroid');
            if (cached) {
                return cached;
            }
            else {
                if (this.android) {
                    return {
                        name: 'Android',
                        version: this.match(1, /android[ \/-](\d+(\.\d+)*)/i),
                    };
                }
                else {
                    return false;
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DetectUA.prototype, "browser", {
        /**
         * Returns the browser name and version
         */
        get: function () {
            var cached = this.cache.get('browser');
            if (cached) {
                return cached;
            }
            else {
                var versionIdentifier = this.match(1, /version\/(\d+(\.\d+)?)/i);
                var result = void 0;
                if (/opera/i.test(this.userAgent)) {
                    // Opera
                    result = {
                        name: 'Opera',
                        version: versionIdentifier || this.match(1, /(?:opera|opr|opios)[\s\/](\d+(\.\d+)?)/i),
                    };
                }
                else if (/opr\/|opios/i.test(this.userAgent)) {
                    // Opera
                    result = {
                        name: 'Opera',
                        version: this.match(1, /(?:opr|opios)[\s\/](\d+(\.\d+)?)/i) || versionIdentifier,
                    };
                }
                else if (/SamsungBrowser/i.test(this.userAgent)) {
                    // Samsung Browser
                    result = {
                        name: 'Samsung Internet for Android',
                        version: versionIdentifier || this.match(1, /(?:SamsungBrowser)[\s\/](\d+(\.\d+)?)/i),
                    };
                }
                else if (/yabrowser/i.test(this.userAgent)) {
                    // Yandex Browser
                    result = {
                        name: 'Yandex Browser',
                        version: versionIdentifier || this.match(1, /(?:yabrowser)[\s\/](\d+(\.\d+)?)/i),
                    };
                }
                else if (/ucbrowser/i.test(this.userAgent)) {
                    // UC Browser
                    result = {
                        name: 'UC Browser',
                        version: this.match(1, /(?:ucbrowser)[\s\/](\d+(\.\d+)?)/i),
                    };
                }
                else if (/msie|trident/i.test(this.userAgent)) {
                    // Internet Explorer
                    result = {
                        name: 'Internet Explorer',
                        version: this.match(1, /(?:msie |rv:)(\d+(\.\d+)?)/i),
                    };
                }
                else if (/edg([ea]|ios)/i.test(this.userAgent)) {
                    // Edge
                    result = {
                        name: 'Microsoft Edge',
                        version: this.match(2, /edg([ea]|ios)\/(\d+(\.\d+)?)/i),
                    };
                }
                else if (/firefox|iceweasel|fxios/i.test(this.userAgent)) {
                    // Firefox
                    result = {
                        name: 'Firefox',
                        version: this.match(1, /(?:firefox|iceweasel|fxios)[ \/](\d+(\.\d+)?)/i),
                    };
                }
                else if (/chromium/i.test(this.userAgent)) {
                    // Chromium
                    result = {
                        name: 'Chromium',
                        version: this.match(1, /(?:chromium)[\s\/](\d+(?:\.\d+)?)/i) || versionIdentifier,
                    };
                }
                else if (/chrome|crios|crmo/i.test(this.userAgent)) {
                    // Chrome
                    result = {
                        name: 'Chrome',
                        version: this.match(1, /(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i),
                    };
                }
                else if (/safari|applewebkit/i.test(this.userAgent)) {
                    // Safari
                    result = {
                        name: 'Safari',
                        version: versionIdentifier,
                    };
                }
                else {
                    // Everything else
                    result = {
                        name: this.match(1, /^(.*)\/(.*) /),
                        version: this.match(2, /^(.*)\/(.*) /),
                    };
                }
                this.cache.set('browser', result);
                return result;
            }
        },
        enumerable: true,
        configurable: true
    });
    return DetectUA;
}());

let ua;
let cache = new Map();

const userAgent = navigator.userAgent.toLowerCase();

const mobile = () => {
    if (!ua) { ua = new DetectUA(); }    return ua.isMobile;
};

const tablet = () => {
    if (!ua) { ua = new DetectUA(); }    return ua.isTablet;
};

const desktop = () => {
    if (!ua) { ua = new DetectUA(); }    return ua.isDesktop;
};

const android = () => {
    if (!ua) { ua = new DetectUA(); }    return ua.isAndroid;
};

const iOS = () => {
    if (!ua) { ua = new DetectUA(); }    return ua.isiOS;
};

const system = () => {
    if (userAgent.includes('mac')) return 'macos';
    if (userAgent.includes('windows')) return 'windows';
    if (userAgent.includes('linux')) return 'linux';
    if (userAgent.includes('android')) return 'android';
    if (userAgent.includes('blackberry')) return 'blackberry';
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios';

    return undefined;
};

const webGL = () => {
    if (cache.has('webgl')) return cache.get('webgl');

    try {
        const names = ['webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl'];
        const canvas = document.createElement('canvas');

        let gl;
        
        for (let i = 0; i < names.length; i++) {
            gl = canvas.getContext(names[i]);
            if (gl) break;
        }

        cache.set('webgl', true);

        return true;
    } catch (e) {
        cache.set('webgl', false);

        return false;
    }
};

const lang = ( availables = [], defaultLang ) => {
    if (cache.has('lang')) return cache.get('lang');

    let lang = navigator.language;

    if (availables.length > 0) {
        for (let i = 0; i < availables.length; i++) {
            if (lang.includes(availables[i])) {
                lang = availables[i];
                break;
            }
        }
    }

    cache.set('lang', lang);

    return lang;
};

const breakpoints = new Map();

const setSize = (name, value) => {
    breakpoints.set(name, value);
};

const setSizes = (breaks = {}) => {
    const keys = Object.keys(breaks);

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        setSize(key, breaks[key]);
    }
};

const size = {
    lowerThan: (name) => {
        if (!breakpoints.has(name)) throw new Error(`Device :: can't compare device size to undefined ${name} breakpoint.`);

        return window.innerWidth < breakpoints.get(name);
    },
    biggerThan: (name) => {
        if (!breakpoints.has(name)) throw new Error(`Device :: can't compare device size to undefined ${name} breakpoint.`);

        return window.innerWidth > breakpoints.get(name);
    }
};

const Device = {
    userAgent: () => userAgent,
    mobile,
    tablet,
    desktop,
    iOS,
    android,
    system,
    webGL,
    lang,
    setSize,
    setSizes,
    size,
    // features: {
    //     detect: async () => {
    //         const keys = Object.keys(features);
    //         const asyncFeatures = keys.map((key, index) => ({ fn: features[key], index }))
    //             .filter(({ fn, index }) => {
    //                 const isAsync = fn.toString().includes('async');

    //                 if (!isAsync) {
    //                     Device.features[keys[index]] = fn;
    //                 }
                    
    //                 return isAsync;
    //             });

    //         return Promise.all(asyncFeatures.map( async ({ fn, index }) => {
    //             const results = await fn();
    //             Device.features[keys[index]] = results;
    //         }));
    //     }
    // }
};

window.Device = Device;

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

const degToRad = (value) => value * DEG2RAD;

const generateUUID = ( () => {
    var lut = [];

    for ( var i = 0; i < 256; i ++ ) {

        lut[ i ] = ( i < 16 ? '0' : '' ) + ( i ).toString( 16 );

    }

    return  () => {
        var d0 = Math.random() * 0xffffffff | 0;
        var d1 = Math.random() * 0xffffffff | 0;
        var d2 = Math.random() * 0xffffffff | 0;
        var d3 = Math.random() * 0xffffffff | 0;
        var uuid = lut[ d0 & 0xff ] + lut[ d0 >> 8 & 0xff ] + lut[ d0 >> 16 & 0xff ] + lut[ d0 >> 24 & 0xff ] + '-' +
            lut[ d1 & 0xff ] + lut[ d1 >> 8 & 0xff ] + '-' + lut[ d1 >> 16 & 0x0f | 0x40 ] + lut[ d1 >> 24 & 0xff ] + '-' +
            lut[ d2 & 0x3f | 0x80 ] + lut[ d2 >> 8 & 0xff ] + '-' + lut[ d2 >> 16 & 0xff ] + lut[ d2 >> 24 & 0xff ] +
            lut[ d3 & 0xff ] + lut[ d3 >> 8 & 0xff ] + lut[ d3 >> 16 & 0xff ] + lut[ d3 >> 24 & 0xff ];

        // .toUpperCase() here flattens concatenated strings to save heap memory space.
        return uuid.toUpperCase();
    };
})();

const clamp = (value, min, max) => {
    return Math.max(min, Math.min(value, max));
};

const map$1 = (value, min, max, nmin, nmax) => {
    return ((value - min) / (max - min)) * (nmax - nmin) + nmin;
};

const mix = (x, y, t) => {
    if (x.isVector3 && y.isVector3) {
        const final = x.clone();
        final.x = mix(x.x, y.x, t);
        final.y = mix(x.y, y.y, t);
        final.z = mix(x.z, y.z, t);

        return final;
    }

    return x * (1 - t) + y * t;
};

const lerp = (start, end, ease) => (1 - ease) * start + ease * end;

const between = (value, min, max) => value >= min && value < max;

/*
Retrieve geo coordinates from latitude and longitude. Latitude must be in the range [-90, 90] & latitude [-180, 180]
 */
const polarToGeo = (latitude, longitude, radius) => {
    const phi = (90 - latitude) * (Math.PI / 180);
    const theta = (longitude + 180) * (Math.PI / 180);

    const x = -((radius) * Math.sin(phi) * Math.cos(theta));
    const z = ((radius) * Math.sin(phi) * Math.sin(theta));
    const y = ((radius) * Math.cos(phi));

    return { x, y, z };
};

const Mouse = new class Mouse {

    constructor() {
        this.onMouseMove = this.onMouseMove.bind(this);
        this.update = this.update.bind(this);

        this.position = { x: 0, y: 0, xLast: 0, yLast: 0, sx: 0, sy: 0, ease: 0.1 };
        this.direction = { x: 0, y: 0 };
        this.uv = { x: 0, y: 0, sx: 0, sy: 0, ease: 0.1 };
        this.screen = { x: 0, y: 0 };
        this.ortho = { x: 0, y: 0, sx: 0, sy: 0, ease: 0.1 };
        this.velocity = { x: 0, y: 0, sx: 0, sy: 0, ease: 0.1 };
        this.moved = false;
    }

    listen() {
        window.addEventListener('mousemove', this.onMouseMove);

        emitter.on('frame', this.update);
    }

    onMouseMove(event) {
        this.moved = true;

        this.direction.x = event.clientX > this.position.x ? 1 : -1;
        this.direction.y = event.clientY > this.position.y ? 1 : -1;

        this.position.x = event.clientX;
        this.position.y = event.clientY;

        this.screen.x = this.position.x / window.innerWidth;
        this.screen.y = this.position.y / window.innerHeight;

        this.ortho.x = this.screen.x * 2 - 1;
        this.ortho.y = -(this.screen.y * 2 - 1);

        this.uv.x = this.screen.x;
        this.uv.y = 1 - this.screen.y;
    }

    update() {
        this.position.sx = lerp(this.position.sx, this.position.x, this.position.ease);
        this.position.sy = lerp(this.position.sy, this.position.y, this.position.ease);

        this.uv.sx = lerp(this.uv.sx, this.uv.x, this.uv.ease);
        this.uv.sy = lerp(this.uv.sy, this.uv.y, this.uv.ease);

        this.ortho.sx = lerp(this.ortho.sx, this.ortho.x, this.ortho.ease);
        this.ortho.sy = lerp(this.ortho.sy, this.ortho.y, this.ortho.ease);

        this.velocity.x = this.position.x - this.position.xLast;
        this.velocity.y = this.position.y - this.position.yLast;

        this.velocity.sx = lerp(this.velocity.sx, this.velocity.x, this.velocity.ease);
        this.velocity.sy = lerp(this.velocity.sy, this.velocity.y, this.velocity.ease);

        this.position.xLast = this.position.x;
        this.position.yLast = this.position.y;
    }
};

class Card extends Component {

    constructor() {
        super('Card');
        this.mouseAngle = -Math.PI * 0.15;

        this.isMouseToggled = false;
        this.mousePow = 0;
        this.currentMousePow = 0;
        this.init();
        this.onGUI();
    }

    init() {
        this.CARD_WIDTH = 1614;
        this.CARD_HEIGHT = 1024;
        this.baseScale = this.computeBaseScale();
        this.worldScale = this.computeWorldScale();
        this.shadowScale = 2.25;

        const geometry = new THREE.PlaneBufferGeometry(1, 1, 20, 2);


        const frontMaterial = new THREE.ShaderMaterial({
            vertexShader: vertexShader$1,
            fragmentShader: fragmentShader$1,
            uniforms: {
                map: { value: Assets.get('card-front') },
                globalAlphaSpeed: {value: 1},
                opacity: { value: 0 },
                displacement: { value: 0 },
                uPerspectiveTopLeft: { value: new THREE.Vector3() },
                uPerspectiveTopRight: { value: new THREE.Vector3() },
                uPerspectiveBottomLeft: { value: new THREE.Vector3() },
                uPerspectiveBottomRight: { value: new THREE.Vector3() },
                globalOpacity: { value: Globals.get('globalOpacity') },
            },
            transparent: true,
            // wireframe: true,
        });

        const backMaterial = new THREE.ShaderMaterial({
            vertexShader: vertexShader$1,
            fragmentShader: fragmentShader$1,
            uniforms: {
                map: { value: Assets.get('card-back') },
                opacity: { value: 0 },
                displacement: { value: 0 },
                uPerspectiveTopLeft: { value: new THREE.Vector3() },
                uPerspectiveTopRight: { value: new THREE.Vector3() },
                uPerspectiveBottomLeft: { value: new THREE.Vector3() },
                uPerspectiveBottomRight: { value: new THREE.Vector3() },
                globalOpacity: { value: Globals.get('globalOpacity') },
                globalAlphaSpeed: {value: 1},
            },
            transparent: true,
            side: THREE.BackSide,
            // wireframe: true,
        });

        const shadowMaterial = new THREE.ShaderMaterial({
            vertexShader: vertexShaderShadow$1,
            fragmentShader: fragmentShaderShadow$1,
            uniforms: {
                map: { value: Assets.get('card-shadow') },
                diffuse: { value: new THREE.Color(0xbf3422) },
                opacity: { value: 0 },
                uRotation: { value: new THREE.Vector2(0, 0) },
                globalAlphaSpeed: {value: 1},
                globalOpacity: { value: Globals.get('globalOpacity') },
            },
            transparent: true
        });

        this.cardContainer = new THREE.Object3D();
        this.cardAxis = new THREE.Object3D();

        this.cardAxis.add(this.cardContainer);

        this.add(this.cardAxis);

        this.scaling = this.CARD_HEIGHT / this.CARD_WIDTH;
        this.front = new THREE.Mesh(geometry, frontMaterial);
        this.cardContainer.add(this.front);

        this.back = new THREE.Mesh(geometry, backMaterial);
        this.cardContainer.add(this.back);


        this.shadow = new THREE.Mesh(geometry, shadowMaterial);
        this.shadow.position.z = -0.01;
        this.cardContainer.add(this.shadow);

        this.setScale(this.baseScale);

    }

    computeBaseScale() {


        const isLandscape = window.innerWidth >= window.innerHeight;

        const isMobile = Globals.get('mobile-webgl');

        if(isMobile){

            const baseScale1280 = isLandscape ? 4.2 : 2.8;
            let ratio = window.innerWidth / 1440;
            ratio = Math.max(1, ratio);

            return baseScale1280 / ratio;
        }
        // if (Device.tablet()) {
        //     return 0.5 * Globals.get('fullscreen.x');
        // } 
        else{

            let ratio,baseScale1280; 

            if (isLandscape) {

                baseScale1280 = 3.8;

                ratio = window.innerWidth / 1280;
                ratio = Math.max(1.3, ratio);
            } 

            else {

                baseScale1280 = 2.5;
                
                ratio = window.innerHeight / window.innerWidth;
            }
            // return this.mix( calcA, calcB, trueRatio )
            return baseScale1280 / ratio;

        }
     
    }

    mix(min, max, value) {
        return min * (1 - value) + max * value
    }

    computeWorldScale() {
        const worldScale1280 = 1.9;
        let ratio = window.innerWidth / 1440;
        ratio = Math.max(1, ratio);

        return worldScale1280 / ratio;
    }

    toggleMouse(val){

        if(val == true && this.isMouseToggled == false){

            this.mousePow = 1;

            this.isMouseToggled = true;
        }

        if(val == false && this.isMouseToggled == true){

            this.mousePow = 0;

            this.isMouseToggled = false;
        }
    }

    updateRota(){

        this.currentMousePow = this.mousePow * 0.05 + this.currentMousePow * 0.95;

        this.rotaX = Mouse.ortho.sy * this.mouseAngle * this.currentMousePow;
        this.rotaY = Mouse.ortho.sx * this.mouseAngle * this.currentMousePow;

        this.front.rotation.x += this.rotaX;
        this.front.rotation.y += this.rotaY; 

        this.back.rotation.x += this.rotaX;
        this.back.rotation.y += this.rotaY;


        this.shadow.rotation.x += this.rotaX;
        this.shadow.rotation.y += this.rotaY;  

    }

    // setState(state){

    //     switch(Globals.get(currentState)){

    //         case :



    //         break;


    //     }
    // }

    backRota(){

        this.front.rotation.x -= this.rotaX;
        this.front.rotation.y -= this.rotaY; 

        this.back.rotation.x  -= this.rotaX;
        this.back.rotation.y  -= this.rotaY;

        this.shadow.rotation.x -= this.rotaX;
        this.shadow.rotation.y -= this.rotaY;  
    }

    setScale(value) {

        this.currentScale = value;

        this.front.scale.set(value, value * this.scaling, 1);
        this.back.scale.copy(this.front.scale);
    }

    drawCurve(curve, points, color) {
        const p = curve.getPoints(points);
        const curveGeometry = new THREE.BufferGeometry().setFromPoints(p);
        const curveMaterial = new THREE.LineBasicMaterial({ color });
        const curveObject = new THREE.Line(curveGeometry, curveMaterial);
        this.add(curveObject);
    }

    display() {
        this.displayDelay = 2000;
        this.displayDuration = 1000;
        this.displayProgress = 0;
        this.displayTime = Date.now();
        this.displaying = true;
    }

    reset() {
       this.cardContainer.position.set(0, 0, 0);
       this.cardContainer.rotation.x = 0;
       this.cardContainer.rotation.y = 0;
       this.cardContainer.rotation.z = 0;
       this.cardAxis.position.set(0, 0, 0);
       this.cardAxis.rotation.x = 0;
       this.cardAxis.rotation.y = 0;
       this.cardAxis.rotation.z = 0;

       this.setDisplacement(0);
    }

    resetOverMax(){

        this.container.visible = false;
        this.setShadowOpacity(0);
        this.front.renderOrder = 0;
        this.back.renderOrder  = 0;
        this.shadow.renderOrder  = 0;
        this.front.material.depthTest = true;
        this.back.material.depthTest = true;
        this.shadow.material.depthTest = true;
    }
    
    resize() {
        this.baseScale = this.computeBaseScale();
        this.worldScale = this.computeWorldScale();
        this.setScale(this.baseScale);


    }

    onGUI() {
        const params = { displacement: this.front.material.uniforms.displacement.value };
        
        // this.gui.add(this, 'baseScale', 0, 4).step(0.01).onChange(() => {
        //     this.setScale(this.baseScale);
        // });
        
        // this.gui.add(this, 'worldScale', 0, 4).step(0.01).onChange(() => {
        //     this.setScale(this.worldScale);
        // });

        this.gui.add(this, 'shadowScale', 0, 4).step(0.01);
        
        this.gui.add(params, 'displacement', 0, 2).step(0.01).onChange(() => {
            this.setDisplacement(params.displacement);
        });


        this.gui.add(this.front.material.uniforms.uPerspectiveTopLeft.value, 'x', -5, 5).name('xTopLeft').step(0.001).onChange( () => {
            this.back.material.uniforms.uPerspectiveTopLeft.value = this.front.material.uniforms.uPerspectiveTopLeft.value;
        });
        this.gui.add(this.front.material.uniforms.uPerspectiveTopLeft.value, 'y', -5, 5).name('yTopLeft').step(0.001).onChange(() => {
            this.back.material.uniforms.uPerspectiveTopLeft.value = this.front.material.uniforms.uPerspectiveTopLeft.value;
        });
        this.gui.add(this.front.material.uniforms.uPerspectiveTopLeft.value, 'z', -5, 5).name('zTopLeft').step(0.001).onChange(() => {
            this.back.material.uniforms.uPerspectiveTopLeft.value = this.front.material.uniforms.uPerspectiveTopLeft.value;
        });

        this.gui.add(this.front.material.uniforms.uPerspectiveTopRight.value, 'x', -5, 5).name('xTopRight').step(0.001).onChange(() => {
            this.back.material.uniforms.uPerspectiveTopRight.value = this.front.material.uniforms.uPerspectiveTopRight.value;
        });
        this.gui.add(this.front.material.uniforms.uPerspectiveTopRight.value, 'y', -5, 5).name('yTopRight').step(0.001).onChange(() => {
            this.back.material.uniforms.uPerspectiveTopRight.value = this.front.material.uniforms.uPerspectiveTopRight.value;
        });
        this.gui.add(this.front.material.uniforms.uPerspectiveTopRight.value, 'z', -5, 5).name('zTopRight').step(0.001).onChange(() => {
            this.back.material.uniforms.uPerspectiveTopRight.value = this.front.material.uniforms.uPerspectiveTopRight.value;
        });

        this.gui.add(this.front.material.uniforms.uPerspectiveBottomLeft.value, 'x', -5, 5).name('xBottomLeft').step(0.001).onChange(() => {
            this.back.material.uniforms.uPerspectiveBottomLeft.value = this.front.material.uniforms.uPerspectiveBottomLeft.value;
        });
        this.gui.add(this.front.material.uniforms.uPerspectiveBottomLeft.value, 'y', -5, 5).name('yBottomLeft').step(0.001).onChange(() => {
            this.back.material.uniforms.uPerspectiveBottomLeft.value = this.front.material.uniforms.uPerspectiveBottomLeft.value;
        });
        this.gui.add(this.front.material.uniforms.uPerspectiveBottomLeft.value, 'z', -5, 5).name('zBottomLeft').step(0.001).onChange(() => {
            this.back.material.uniforms.uPerspectiveBottomLeft.value = this.front.material.uniforms.uPerspectiveBottomLeft.value;
        });

        this.gui.add(this.front.material.uniforms.uPerspectiveBottomRight.value, 'x', -5, 5).name('xBottomRight').step(0.001).onChange(() => {
            this.back.material.uniforms.uPerspectiveBottomRight.value = this.front.material.uniforms.uPerspectiveBottomRight.value;
        });
        this.gui.add(this.front.material.uniforms.uPerspectiveBottomRight.value, 'y', -5, 5).name('yBottomRight').step(0.001).onChange(() => {
            this.back.material.uniforms.uPerspectiveBottomRight.value = this.front.material.uniforms.uPerspectiveBottomRight.value;
        });
        this.gui.add(this.front.material.uniforms.uPerspectiveBottomRight.value, 'z', -5, 5).name('zBottomRight').step(0.001).onChange(() => {
            this.back.material.uniforms.uPerspectiveBottomRight.value = this.front.material.uniforms.uPerspectiveBottomRight.value;
        });

    }

    setDisplacement(displacement) {
        this.front.material.uniforms.displacement.value = displacement;
        this.back.material.uniforms.displacement.value = displacement;
    }

    setPerspective(x, y, z) {
        this.front.material.uniforms.uPerspectiveBottomLeft.value.x = x;
        this.front.material.uniforms.uPerspectiveBottomLeft.value.y = y;
        this.front.material.uniforms.uPerspectiveBottomLeft.value.z = z;
    }

    update() {
        const globalOpacity = Globals.get('globalOpacity');
        
        this.front.material.uniforms.globalOpacity.value = globalOpacity;
        this.back.material.uniforms.globalOpacity.value = globalOpacity;
        this.shadow.material.uniforms.globalOpacity.value = globalOpacity;
    }

    updateShadow(opacity) {
        this.shadow.position.set(this.front.position.x, this.front.position.y, this.front.position.z - 0.1);
        this.shadow.scale.copy(this.front.scale).multiplyScalar(this.shadowScale);
        this.shadow.rotation.set(this.front.rotation.x, this.front.rotation.y, this.front.rotation.z, 'XYZ');

        // match mouseAngle in states/Hero
        const x = ((this.front.rotation.x) / (Math.PI * 0.15) + 1.) * 0.5;
        const y = ((this.front.rotation.y) / (Math.PI * 0.15) + 1.) * 0.5;

        this.shadow.material.uniforms.uRotation.value.x = x;
        this.shadow.material.uniforms.uRotation.value.y = y;
    }



    setShadowOpacity(opacity) {


        // console.log(opacity)

        // if(opacity == 0){

        //     // console.trace()
        // }

        if (opacity != null) {
            this.shadow.material.uniforms.opacity.value = opacity;

            if(opacity == 0){
                this.shadow.visible = false;
            }
            else{
                this.shadow.visible = true;
            }
        }
    }

    setGlobalAlphaSpeed(val){
        this.shadow.material.uniforms.globalAlphaSpeed.value = val;
        this.front.material.uniforms.globalAlphaSpeed.value = val;
        this.back.material.uniforms.globalAlphaSpeed.value = val; 
    }

}

/*
 * anime.js v3.1.0
 * (c) 2019 Julian Garnier
 * Released under the MIT license
 * animejs.com
 */

// Defaults

var defaultInstanceSettings = {
  update: null,
  begin: null,
  loopBegin: null,
  changeBegin: null,
  change: null,
  changeComplete: null,
  loopComplete: null,
  complete: null,
  loop: 1,
  direction: 'normal',
  autoplay: true,
  timelineOffset: 0
};

var defaultTweenSettings = {
  duration: 1000,
  delay: 0,
  endDelay: 0,
  easing: 'easeOutElastic(1, .5)',
  round: 0
};

var validTransforms = ['translateX', 'translateY', 'translateZ', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'skew', 'skewX', 'skewY', 'perspective'];

// Caching

var cache$1 = {
  CSS: {},
  springs: {}
};

// Utils

function minMax(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function stringContains(str, text) {
  return str.indexOf(text) > -1;
}

function applyArguments(func, args) {
  return func.apply(null, args);
}

var is = {
  arr: function (a) { return Array.isArray(a); },
  obj: function (a) { return stringContains(Object.prototype.toString.call(a), 'Object'); },
  pth: function (a) { return is.obj(a) && a.hasOwnProperty('totalLength'); },
  svg: function (a) { return a instanceof SVGElement; },
  inp: function (a) { return a instanceof HTMLInputElement; },
  dom: function (a) { return a.nodeType || is.svg(a); },
  str: function (a) { return typeof a === 'string'; },
  fnc: function (a) { return typeof a === 'function'; },
  und: function (a) { return typeof a === 'undefined'; },
  hex: function (a) { return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a); },
  rgb: function (a) { return /^rgb/.test(a); },
  hsl: function (a) { return /^hsl/.test(a); },
  col: function (a) { return (is.hex(a) || is.rgb(a) || is.hsl(a)); },
  key: function (a) { return !defaultInstanceSettings.hasOwnProperty(a) && !defaultTweenSettings.hasOwnProperty(a) && a !== 'targets' && a !== 'keyframes'; }
};

// Easings

function parseEasingParameters(string) {
  var match = /\(([^)]+)\)/.exec(string);
  return match ? match[1].split(',').map(function (p) { return parseFloat(p); }) : [];
}

// Spring solver inspired by Webkit Copyright © 2016 Apple Inc. All rights reserved. https://webkit.org/demos/spring/spring.js

function spring(string, duration) {

  var params = parseEasingParameters(string);
  var mass = minMax(is.und(params[0]) ? 1 : params[0], .1, 100);
  var stiffness = minMax(is.und(params[1]) ? 100 : params[1], .1, 100);
  var damping = minMax(is.und(params[2]) ? 10 : params[2], .1, 100);
  var velocity =  minMax(is.und(params[3]) ? 0 : params[3], .1, 100);
  var w0 = Math.sqrt(stiffness / mass);
  var zeta = damping / (2 * Math.sqrt(stiffness * mass));
  var wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
  var a = 1;
  var b = zeta < 1 ? (zeta * w0 + -velocity) / wd : -velocity + w0;

  function solver(t) {
    var progress = duration ? (duration * t) / 1000 : t;
    if (zeta < 1) {
      progress = Math.exp(-progress * zeta * w0) * (a * Math.cos(wd * progress) + b * Math.sin(wd * progress));
    } else {
      progress = (a + b * progress) * Math.exp(-progress * w0);
    }
    if (t === 0 || t === 1) { return t; }
    return 1 - progress;
  }

  function getDuration() {
    var cached = cache$1.springs[string];
    if (cached) { return cached; }
    var frame = 1/6;
    var elapsed = 0;
    var rest = 0;
    while(true) {
      elapsed += frame;
      if (solver(elapsed) === 1) {
        rest++;
        if (rest >= 16) { break; }
      } else {
        rest = 0;
      }
    }
    var duration = elapsed * frame * 1000;
    cache$1.springs[string] = duration;
    return duration;
  }

  return duration ? solver : getDuration;

}

// Basic steps easing implementation https://developer.mozilla.org/fr/docs/Web/CSS/transition-timing-function

function steps(steps) {
  if ( steps === void 0 ) steps = 10;

  return function (t) { return Math.round(t * steps) * (1 / steps); };
}

// BezierEasing https://github.com/gre/bezier-easing

var bezier = (function () {

  var kSplineTableSize = 11;
  var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

  function A(aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1 }
  function B(aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1 }
  function C(aA1)      { return 3.0 * aA1 }

  function calcBezier(aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT }
  function getSlope(aT, aA1, aA2) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1) }

  function binarySubdivide(aX, aA, aB, mX1, mX2) {
    var currentX, currentT, i = 0;
    do {
      currentT = aA + (aB - aA) / 2.0;
      currentX = calcBezier(currentT, mX1, mX2) - aX;
      if (currentX > 0.0) { aB = currentT; } else { aA = currentT; }
    } while (Math.abs(currentX) > 0.0000001 && ++i < 10);
    return currentT;
  }

  function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
    for (var i = 0; i < 4; ++i) {
      var currentSlope = getSlope(aGuessT, mX1, mX2);
      if (currentSlope === 0.0) { return aGuessT; }
      var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
      aGuessT -= currentX / currentSlope;
    }
    return aGuessT;
  }

  function bezier(mX1, mY1, mX2, mY2) {

    if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) { return; }
    var sampleValues = new Float32Array(kSplineTableSize);

    if (mX1 !== mY1 || mX2 !== mY2) {
      for (var i = 0; i < kSplineTableSize; ++i) {
        sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
      }
    }

    function getTForX(aX) {

      var intervalStart = 0;
      var currentSample = 1;
      var lastSample = kSplineTableSize - 1;

      for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
        intervalStart += kSampleStepSize;
      }

      --currentSample;

      var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
      var guessForT = intervalStart + dist * kSampleStepSize;
      var initialSlope = getSlope(guessForT, mX1, mX2);

      if (initialSlope >= 0.001) {
        return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
      } else if (initialSlope === 0.0) {
        return guessForT;
      } else {
        return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
      }

    }

    return function (x) {
      if (mX1 === mY1 && mX2 === mY2) { return x; }
      if (x === 0 || x === 1) { return x; }
      return calcBezier(getTForX(x), mY1, mY2);
    }

  }

  return bezier;

})();

var penner = (function () {

  // Based on jQuery UI's implemenation of easing equations from Robert Penner (http://www.robertpenner.com/easing)

  var eases = { linear: function () { return function (t) { return t; }; } };

  var functionEasings = {
    Sine: function () { return function (t) { return 1 - Math.cos(t * Math.PI / 2); }; },
    Circ: function () { return function (t) { return 1 - Math.sqrt(1 - t * t); }; },
    Back: function () { return function (t) { return t * t * (3 * t - 2); }; },
    Bounce: function () { return function (t) {
      var pow2, b = 4;
      while (t < (( pow2 = Math.pow(2, --b)) - 1) / 11) {}
      return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow(( pow2 * 3 - 2 ) / 22 - t, 2)
    }; },
    Elastic: function (amplitude, period) {
      if ( amplitude === void 0 ) amplitude = 1;
      if ( period === void 0 ) period = .5;

      var a = minMax(amplitude, 1, 10);
      var p = minMax(period, .1, 2);
      return function (t) {
        return (t === 0 || t === 1) ? t : 
          -a * Math.pow(2, 10 * (t - 1)) * Math.sin((((t - 1) - (p / (Math.PI * 2) * Math.asin(1 / a))) * (Math.PI * 2)) / p);
      }
    }
  };

  var baseEasings = ['Quad', 'Cubic', 'Quart', 'Quint', 'Expo'];

  baseEasings.forEach(function (name, i) {
    functionEasings[name] = function () { return function (t) { return Math.pow(t, i + 2); }; };
  });

  Object.keys(functionEasings).forEach(function (name) {
    var easeIn = functionEasings[name];
    eases['easeIn' + name] = easeIn;
    eases['easeOut' + name] = function (a, b) { return function (t) { return 1 - easeIn(a, b)(1 - t); }; };
    eases['easeInOut' + name] = function (a, b) { return function (t) { return t < 0.5 ? easeIn(a, b)(t * 2) / 2 : 
      1 - easeIn(a, b)(t * -2 + 2) / 2; }; };
  });

  return eases;

})();

function parseEasings(easing, duration) {
  if (is.fnc(easing)) { return easing; }
  var name = easing.split('(')[0];
  var ease = penner[name];
  var args = parseEasingParameters(easing);
  switch (name) {
    case 'spring' : return spring(easing, duration);
    case 'cubicBezier' : return applyArguments(bezier, args);
    case 'steps' : return applyArguments(steps, args);
    default : return applyArguments(ease, args);
  }
}

// Strings

function selectString(str) {
  try {
    var nodes = document.querySelectorAll(str);
    return nodes;
  } catch(e) {
    return;
  }
}

// Arrays

function filterArray(arr, callback) {
  var len = arr.length;
  var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
  var result = [];
  for (var i = 0; i < len; i++) {
    if (i in arr) {
      var val = arr[i];
      if (callback.call(thisArg, val, i, arr)) {
        result.push(val);
      }
    }
  }
  return result;
}

function flattenArray(arr) {
  return arr.reduce(function (a, b) { return a.concat(is.arr(b) ? flattenArray(b) : b); }, []);
}

function toArray(o) {
  if (is.arr(o)) { return o; }
  if (is.str(o)) { o = selectString(o) || o; }
  if (o instanceof NodeList || o instanceof HTMLCollection) { return [].slice.call(o); }
  return [o];
}

function arrayContains(arr, val) {
  return arr.some(function (a) { return a === val; });
}

// Objects

function cloneObject(o) {
  var clone = {};
  for (var p in o) { clone[p] = o[p]; }
  return clone;
}

function replaceObjectProps(o1, o2) {
  var o = cloneObject(o1);
  for (var p in o1) { o[p] = o2.hasOwnProperty(p) ? o2[p] : o1[p]; }
  return o;
}

function mergeObjects(o1, o2) {
  var o = cloneObject(o1);
  for (var p in o2) { o[p] = is.und(o1[p]) ? o2[p] : o1[p]; }
  return o;
}

// Colors

function rgbToRgba(rgbValue) {
  var rgb = /rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/g.exec(rgbValue);
  return rgb ? ("rgba(" + (rgb[1]) + ",1)") : rgbValue;
}

function hexToRgba(hexValue) {
  var rgx = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  var hex = hexValue.replace(rgx, function (m, r, g, b) { return r + r + g + g + b + b; } );
  var rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  var r = parseInt(rgb[1], 16);
  var g = parseInt(rgb[2], 16);
  var b = parseInt(rgb[3], 16);
  return ("rgba(" + r + "," + g + "," + b + ",1)");
}

function hslToRgba(hslValue) {
  var hsl = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(hslValue) || /hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(hslValue);
  var h = parseInt(hsl[1], 10) / 360;
  var s = parseInt(hsl[2], 10) / 100;
  var l = parseInt(hsl[3], 10) / 100;
  var a = hsl[4] || 1;
  function hue2rgb(p, q, t) {
    if (t < 0) { t += 1; }
    if (t > 1) { t -= 1; }
    if (t < 1/6) { return p + (q - p) * 6 * t; }
    if (t < 1/2) { return q; }
    if (t < 2/3) { return p + (q - p) * (2/3 - t) * 6; }
    return p;
  }
  var r, g, b;
  if (s == 0) {
    r = g = b = l;
  } else {
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return ("rgba(" + (r * 255) + "," + (g * 255) + "," + (b * 255) + "," + a + ")");
}

function colorToRgb(val) {
  if (is.rgb(val)) { return rgbToRgba(val); }
  if (is.hex(val)) { return hexToRgba(val); }
  if (is.hsl(val)) { return hslToRgba(val); }
}

// Units

function getUnit(val) {
  var split = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(val);
  if (split) { return split[1]; }
}

function getTransformUnit(propName) {
  if (stringContains(propName, 'translate') || propName === 'perspective') { return 'px'; }
  if (stringContains(propName, 'rotate') || stringContains(propName, 'skew')) { return 'deg'; }
}

// Values

function getFunctionValue(val, animatable) {
  if (!is.fnc(val)) { return val; }
  return val(animatable.target, animatable.id, animatable.total);
}

function getAttribute(el, prop) {
  return el.getAttribute(prop);
}

function convertPxToUnit(el, value, unit) {
  var valueUnit = getUnit(value);
  if (arrayContains([unit, 'deg', 'rad', 'turn'], valueUnit)) { return value; }
  var cached = cache$1.CSS[value + unit];
  if (!is.und(cached)) { return cached; }
  var baseline = 100;
  var tempEl = document.createElement(el.tagName);
  var parentEl = (el.parentNode && (el.parentNode !== document)) ? el.parentNode : document.body;
  parentEl.appendChild(tempEl);
  tempEl.style.position = 'absolute';
  tempEl.style.width = baseline + unit;
  var factor = baseline / tempEl.offsetWidth;
  parentEl.removeChild(tempEl);
  var convertedUnit = factor * parseFloat(value);
  cache$1.CSS[value + unit] = convertedUnit;
  return convertedUnit;
}

function getCSSValue(el, prop, unit) {
  if (prop in el.style) {
    var uppercasePropName = prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    var value = el.style[prop] || getComputedStyle(el).getPropertyValue(uppercasePropName) || '0';
    return unit ? convertPxToUnit(el, value, unit) : value;
  }
}

function getAnimationType(el, prop) {
  if (is.dom(el) && !is.inp(el) && (getAttribute(el, prop) || (is.svg(el) && el[prop]))) { return 'attribute'; }
  if (is.dom(el) && arrayContains(validTransforms, prop)) { return 'transform'; }
  if (is.dom(el) && (prop !== 'transform' && getCSSValue(el, prop))) { return 'css'; }
  if (el[prop] != null) { return 'object'; }
}

function getElementTransforms(el) {
  if (!is.dom(el)) { return; }
  var str = el.style.transform || '';
  var reg  = /(\w+)\(([^)]*)\)/g;
  var transforms = new Map();
  var m; while (m = reg.exec(str)) { transforms.set(m[1], m[2]); }
  return transforms;
}

function getTransformValue(el, propName, animatable, unit) {
  var defaultVal = stringContains(propName, 'scale') ? 1 : 0 + getTransformUnit(propName);
  var value = getElementTransforms(el).get(propName) || defaultVal;
  if (animatable) {
    animatable.transforms.list.set(propName, value);
    animatable.transforms['last'] = propName;
  }
  return unit ? convertPxToUnit(el, value, unit) : value;
}

function getOriginalTargetValue(target, propName, unit, animatable) {
  switch (getAnimationType(target, propName)) {
    case 'transform': return getTransformValue(target, propName, animatable, unit);
    case 'css': return getCSSValue(target, propName, unit);
    case 'attribute': return getAttribute(target, propName);
    default: return target[propName] || 0;
  }
}

function getRelativeValue(to, from) {
  var operator = /^(\*=|\+=|-=)/.exec(to);
  if (!operator) { return to; }
  var u = getUnit(to) || 0;
  var x = parseFloat(from);
  var y = parseFloat(to.replace(operator[0], ''));
  switch (operator[0][0]) {
    case '+': return x + y + u;
    case '-': return x - y + u;
    case '*': return x * y + u;
  }
}

function validateValue(val, unit) {
  if (is.col(val)) { return colorToRgb(val); }
  if (/\s/g.test(val)) { return val; }
  var originalUnit = getUnit(val);
  var unitLess = originalUnit ? val.substr(0, val.length - originalUnit.length) : val;
  if (unit) { return unitLess + unit; }
  return unitLess;
}

// getTotalLength() equivalent for circle, rect, polyline, polygon and line shapes
// adapted from https://gist.github.com/SebLambla/3e0550c496c236709744

function getDistance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function getCircleLength(el) {
  return Math.PI * 2 * getAttribute(el, 'r');
}

function getRectLength(el) {
  return (getAttribute(el, 'width') * 2) + (getAttribute(el, 'height') * 2);
}

function getLineLength(el) {
  return getDistance(
    {x: getAttribute(el, 'x1'), y: getAttribute(el, 'y1')}, 
    {x: getAttribute(el, 'x2'), y: getAttribute(el, 'y2')}
  );
}

function getPolylineLength(el) {
  var points = el.points;
  var totalLength = 0;
  var previousPos;
  for (var i = 0 ; i < points.numberOfItems; i++) {
    var currentPos = points.getItem(i);
    if (i > 0) { totalLength += getDistance(previousPos, currentPos); }
    previousPos = currentPos;
  }
  return totalLength;
}

function getPolygonLength(el) {
  var points = el.points;
  return getPolylineLength(el) + getDistance(points.getItem(points.numberOfItems - 1), points.getItem(0));
}

// Path animation

function getTotalLength(el) {
  if (el.getTotalLength) { return el.getTotalLength(); }
  switch(el.tagName.toLowerCase()) {
    case 'circle': return getCircleLength(el);
    case 'rect': return getRectLength(el);
    case 'line': return getLineLength(el);
    case 'polyline': return getPolylineLength(el);
    case 'polygon': return getPolygonLength(el);
  }
}

function setDashoffset(el) {
  var pathLength = getTotalLength(el);
  el.setAttribute('stroke-dasharray', pathLength);
  return pathLength;
}

// Motion path

function getParentSvgEl(el) {
  var parentEl = el.parentNode;
  while (is.svg(parentEl)) {
    if (!is.svg(parentEl.parentNode)) { break; }
    parentEl = parentEl.parentNode;
  }
  return parentEl;
}

function getParentSvg(pathEl, svgData) {
  var svg = svgData || {};
  var parentSvgEl = svg.el || getParentSvgEl(pathEl);
  var rect = parentSvgEl.getBoundingClientRect();
  var viewBoxAttr = getAttribute(parentSvgEl, 'viewBox');
  var width = rect.width;
  var height = rect.height;
  var viewBox = svg.viewBox || (viewBoxAttr ? viewBoxAttr.split(' ') : [0, 0, width, height]);
  return {
    el: parentSvgEl,
    viewBox: viewBox,
    x: viewBox[0] / 1,
    y: viewBox[1] / 1,
    w: width / viewBox[2],
    h: height / viewBox[3]
  }
}

function getPath(path, percent) {
  var pathEl = is.str(path) ? selectString(path)[0] : path;
  var p = percent || 100;
  return function(property) {
    return {
      property: property,
      el: pathEl,
      svg: getParentSvg(pathEl),
      totalLength: getTotalLength(pathEl) * (p / 100)
    }
  }
}

function getPathProgress(path, progress) {
  function point(offset) {
    if ( offset === void 0 ) offset = 0;

    var l = progress + offset >= 1 ? progress + offset : 0;
    return path.el.getPointAtLength(l);
  }
  var svg = getParentSvg(path.el, path.svg);
  var p = point();
  var p0 = point(-1);
  var p1 = point(+1);
  switch (path.property) {
    case 'x': return (p.x - svg.x) * svg.w;
    case 'y': return (p.y - svg.y) * svg.h;
    case 'angle': return Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI;
  }
}

// Decompose value

function decomposeValue(val, unit) {
  // const rgx = /-?\d*\.?\d+/g; // handles basic numbers
  // const rgx = /[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g; // handles exponents notation
  var rgx = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g; // handles exponents notation
  var value = validateValue((is.pth(val) ? val.totalLength : val), unit) + '';
  return {
    original: value,
    numbers: value.match(rgx) ? value.match(rgx).map(Number) : [0],
    strings: (is.str(val) || unit) ? value.split(rgx) : []
  }
}

// Animatables

function parseTargets(targets) {
  var targetsArray = targets ? (flattenArray(is.arr(targets) ? targets.map(toArray) : toArray(targets))) : [];
  return filterArray(targetsArray, function (item, pos, self) { return self.indexOf(item) === pos; });
}

function getAnimatables(targets) {
  var parsed = parseTargets(targets);
  return parsed.map(function (t, i) {
    return {target: t, id: i, total: parsed.length, transforms: { list: getElementTransforms(t) } };
  });
}

// Properties

function normalizePropertyTweens(prop, tweenSettings) {
  var settings = cloneObject(tweenSettings);
  // Override duration if easing is a spring
  if (/^spring/.test(settings.easing)) { settings.duration = spring(settings.easing); }
  if (is.arr(prop)) {
    var l = prop.length;
    var isFromTo = (l === 2 && !is.obj(prop[0]));
    if (!isFromTo) {
      // Duration divided by the number of tweens
      if (!is.fnc(tweenSettings.duration)) { settings.duration = tweenSettings.duration / l; }
    } else {
      // Transform [from, to] values shorthand to a valid tween value
      prop = {value: prop};
    }
  }
  var propArray = is.arr(prop) ? prop : [prop];
  return propArray.map(function (v, i) {
    var obj = (is.obj(v) && !is.pth(v)) ? v : {value: v};
    // Default delay value should only be applied to the first tween
    if (is.und(obj.delay)) { obj.delay = !i ? tweenSettings.delay : 0; }
    // Default endDelay value should only be applied to the last tween
    if (is.und(obj.endDelay)) { obj.endDelay = i === propArray.length - 1 ? tweenSettings.endDelay : 0; }
    return obj;
  }).map(function (k) { return mergeObjects(k, settings); });
}


function flattenKeyframes(keyframes) {
  var propertyNames = filterArray(flattenArray(keyframes.map(function (key) { return Object.keys(key); })), function (p) { return is.key(p); })
  .reduce(function (a,b) { if (a.indexOf(b) < 0) { a.push(b); } return a; }, []);
  var properties = {};
  var loop = function ( i ) {
    var propName = propertyNames[i];
    properties[propName] = keyframes.map(function (key) {
      var newKey = {};
      for (var p in key) {
        if (is.key(p)) {
          if (p == propName) { newKey.value = key[p]; }
        } else {
          newKey[p] = key[p];
        }
      }
      return newKey;
    });
  };

  for (var i = 0; i < propertyNames.length; i++) loop( i );
  return properties;
}

function getProperties(tweenSettings, params) {
  var properties = [];
  var keyframes = params.keyframes;
  if (keyframes) { params = mergeObjects(flattenKeyframes(keyframes), params); }
  for (var p in params) {
    if (is.key(p)) {
      properties.push({
        name: p,
        tweens: normalizePropertyTweens(params[p], tweenSettings)
      });
    }
  }
  return properties;
}

// Tweens

function normalizeTweenValues(tween, animatable) {
  var t = {};
  for (var p in tween) {
    var value = getFunctionValue(tween[p], animatable);
    if (is.arr(value)) {
      value = value.map(function (v) { return getFunctionValue(v, animatable); });
      if (value.length === 1) { value = value[0]; }
    }
    t[p] = value;
  }
  t.duration = parseFloat(t.duration);
  t.delay = parseFloat(t.delay);
  return t;
}

function normalizeTweens(prop, animatable) {
  var previousTween;
  return prop.tweens.map(function (t) {
    var tween = normalizeTweenValues(t, animatable);
    var tweenValue = tween.value;
    var to = is.arr(tweenValue) ? tweenValue[1] : tweenValue;
    var toUnit = getUnit(to);
    var originalValue = getOriginalTargetValue(animatable.target, prop.name, toUnit, animatable);
    var previousValue = previousTween ? previousTween.to.original : originalValue;
    var from = is.arr(tweenValue) ? tweenValue[0] : previousValue;
    var fromUnit = getUnit(from) || getUnit(originalValue);
    var unit = toUnit || fromUnit;
    if (is.und(to)) { to = previousValue; }
    tween.from = decomposeValue(from, unit);
    tween.to = decomposeValue(getRelativeValue(to, from), unit);
    tween.start = previousTween ? previousTween.end : 0;
    tween.end = tween.start + tween.delay + tween.duration + tween.endDelay;
    tween.easing = parseEasings(tween.easing, tween.duration);
    tween.isPath = is.pth(tweenValue);
    tween.isColor = is.col(tween.from.original);
    if (tween.isColor) { tween.round = 1; }
    previousTween = tween;
    return tween;
  });
}

// Tween progress

var setProgressValue = {
  css: function (t, p, v) { return t.style[p] = v; },
  attribute: function (t, p, v) { return t.setAttribute(p, v); },
  object: function (t, p, v) { return t[p] = v; },
  transform: function (t, p, v, transforms, manual) {
    transforms.list.set(p, v);
    if (p === transforms.last || manual) {
      var str = '';
      transforms.list.forEach(function (value, prop) { str += prop + "(" + value + ") "; });
      t.style.transform = str;
    }
  }
};

// Set Value helper

function setTargetsValue(targets, properties) {
  var animatables = getAnimatables(targets);
  animatables.forEach(function (animatable) {
    for (var property in properties) {
      var value = getFunctionValue(properties[property], animatable);
      var target = animatable.target;
      var valueUnit = getUnit(value);
      var originalValue = getOriginalTargetValue(target, property, valueUnit, animatable);
      var unit = valueUnit || getUnit(originalValue);
      var to = getRelativeValue(validateValue(value, unit), originalValue);
      var animType = getAnimationType(target, property);
      setProgressValue[animType](target, property, to, animatable.transforms, true);
    }
  });
}

// Animations

function createAnimation(animatable, prop) {
  var animType = getAnimationType(animatable.target, prop.name);
  if (animType) {
    var tweens = normalizeTweens(prop, animatable);
    var lastTween = tweens[tweens.length - 1];
    return {
      type: animType,
      property: prop.name,
      animatable: animatable,
      tweens: tweens,
      duration: lastTween.end,
      delay: tweens[0].delay,
      endDelay: lastTween.endDelay
    }
  }
}

function getAnimations(animatables, properties) {
  return filterArray(flattenArray(animatables.map(function (animatable) {
    return properties.map(function (prop) {
      return createAnimation(animatable, prop);
    });
  })), function (a) { return !is.und(a); });
}

// Create Instance

function getInstanceTimings(animations, tweenSettings) {
  var animLength = animations.length;
  var getTlOffset = function (anim) { return anim.timelineOffset ? anim.timelineOffset : 0; };
  var timings = {};
  timings.duration = animLength ? Math.max.apply(Math, animations.map(function (anim) { return getTlOffset(anim) + anim.duration; })) : tweenSettings.duration;
  timings.delay = animLength ? Math.min.apply(Math, animations.map(function (anim) { return getTlOffset(anim) + anim.delay; })) : tweenSettings.delay;
  timings.endDelay = animLength ? timings.duration - Math.max.apply(Math, animations.map(function (anim) { return getTlOffset(anim) + anim.duration - anim.endDelay; })) : tweenSettings.endDelay;
  return timings;
}

var instanceID = 0;

function createNewInstance(params) {
  var instanceSettings = replaceObjectProps(defaultInstanceSettings, params);
  var tweenSettings = replaceObjectProps(defaultTweenSettings, params);
  var properties = getProperties(tweenSettings, params);
  var animatables = getAnimatables(params.targets);
  var animations = getAnimations(animatables, properties);
  var timings = getInstanceTimings(animations, tweenSettings);
  var id = instanceID;
  instanceID++;
  return mergeObjects(instanceSettings, {
    id: id,
    children: [],
    animatables: animatables,
    animations: animations,
    duration: timings.duration,
    delay: timings.delay,
    endDelay: timings.endDelay
  });
}

// Core

var activeInstances = [];
var pausedInstances = [];
var raf;

var engine = (function () {
  function play() { 
    raf = requestAnimationFrame(step);
  }
  function step(t) {
    var activeInstancesLength = activeInstances.length;
    if (activeInstancesLength) {
      var i = 0;
      while (i < activeInstancesLength) {
        var activeInstance = activeInstances[i];
        if (!activeInstance.paused) {
          activeInstance.tick(t);
        } else {
          var instanceIndex = activeInstances.indexOf(activeInstance);
          if (instanceIndex > -1) {
            activeInstances.splice(instanceIndex, 1);
            activeInstancesLength = activeInstances.length;
          }
        }
        i++;
      }
      play();
    } else {
      raf = cancelAnimationFrame(raf);
    }
  }
  return play;
})();

function handleVisibilityChange() {
  if (document.hidden) {
    activeInstances.forEach(function (ins) { return ins.pause(); });
    pausedInstances = activeInstances.slice(0);
    anime.running = activeInstances = [];
  } else {
    pausedInstances.forEach(function (ins) { return ins.play(); });
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', handleVisibilityChange);
}

// Public Instance

function anime(params) {
  if ( params === void 0 ) params = {};


  var startTime = 0, lastTime = 0, now = 0;
  var children, childrenLength = 0;
  var resolve = null;

  function makePromise(instance) {
    var promise = window.Promise && new Promise(function (_resolve) { return resolve = _resolve; });
    instance.finished = promise;
    return promise;
  }

  var instance = createNewInstance(params);
  var promise = makePromise(instance);

  function toggleInstanceDirection() {
    var direction = instance.direction;
    if (direction !== 'alternate') {
      instance.direction = direction !== 'normal' ? 'normal' : 'reverse';
    }
    instance.reversed = !instance.reversed;
    children.forEach(function (child) { return child.reversed = instance.reversed; });
  }

  function adjustTime(time) {
    return instance.reversed ? instance.duration - time : time;
  }

  function resetTime() {
    startTime = 0;
    lastTime = adjustTime(instance.currentTime) * (1 / anime.speed);
  }

  function seekChild(time, child) {
    if (child) { child.seek(time - child.timelineOffset); }
  }

  function syncInstanceChildren(time) {
    if (!instance.reversePlayback) {
      for (var i = 0; i < childrenLength; i++) { seekChild(time, children[i]); }
    } else {
      for (var i$1 = childrenLength; i$1--;) { seekChild(time, children[i$1]); }
    }
  }

  function setAnimationsProgress(insTime) {
    var i = 0;
    var animations = instance.animations;
    var animationsLength = animations.length;
    while (i < animationsLength) {
      var anim = animations[i];
      var animatable = anim.animatable;
      var tweens = anim.tweens;
      var tweenLength = tweens.length - 1;
      var tween = tweens[tweenLength];
      // Only check for keyframes if there is more than one tween
      if (tweenLength) { tween = filterArray(tweens, function (t) { return (insTime < t.end); })[0] || tween; }
      var elapsed = minMax(insTime - tween.start - tween.delay, 0, tween.duration) / tween.duration;
      var eased = isNaN(elapsed) ? 1 : tween.easing(elapsed);
      var strings = tween.to.strings;
      var round = tween.round;
      var numbers = [];
      var toNumbersLength = tween.to.numbers.length;
      var progress = (void 0);
      for (var n = 0; n < toNumbersLength; n++) {
        var value = (void 0);
        var toNumber = tween.to.numbers[n];
        var fromNumber = tween.from.numbers[n] || 0;
        if (!tween.isPath) {
          value = fromNumber + (eased * (toNumber - fromNumber));
        } else {
          value = getPathProgress(tween.value, eased * toNumber);
        }
        if (round) {
          if (!(tween.isColor && n > 2)) {
            value = Math.round(value * round) / round;
          }
        }
        numbers.push(value);
      }
      // Manual Array.reduce for better performances
      var stringsLength = strings.length;
      if (!stringsLength) {
        progress = numbers[0];
      } else {
        progress = strings[0];
        for (var s = 0; s < stringsLength; s++) {
          var a = strings[s];
          var b = strings[s + 1];
          var n$1 = numbers[s];
          if (!isNaN(n$1)) {
            if (!b) {
              progress += n$1 + ' ';
            } else {
              progress += n$1 + b;
            }
          }
        }
      }
      setProgressValue[anim.type](animatable.target, anim.property, progress, animatable.transforms);
      anim.currentValue = progress;
      i++;
    }
  }

  function setCallback(cb) {
    if (instance[cb] && !instance.passThrough) { instance[cb](instance); }
  }

  function countIteration() {
    if (instance.remaining && instance.remaining !== true) {
      instance.remaining--;
    }
  }

  function setInstanceProgress(engineTime) {
    var insDuration = instance.duration;
    var insDelay = instance.delay;
    var insEndDelay = insDuration - instance.endDelay;
    var insTime = adjustTime(engineTime);
    instance.progress = minMax((insTime / insDuration) * 100, 0, 100);
    instance.reversePlayback = insTime < instance.currentTime;
    if (children) { syncInstanceChildren(insTime); }
    if (!instance.began && instance.currentTime > 0) {
      instance.began = true;
      setCallback('begin');
    }
    if (!instance.loopBegan && instance.currentTime > 0) {
      instance.loopBegan = true;
      setCallback('loopBegin');
    }
    if (insTime <= insDelay && instance.currentTime !== 0) {
      setAnimationsProgress(0);
    }
    if ((insTime >= insEndDelay && instance.currentTime !== insDuration) || !insDuration) {
      setAnimationsProgress(insDuration);
    }
    if (insTime > insDelay && insTime < insEndDelay) {
      if (!instance.changeBegan) {
        instance.changeBegan = true;
        instance.changeCompleted = false;
        setCallback('changeBegin');
      }
      setCallback('change');
      setAnimationsProgress(insTime);
    } else {
      if (instance.changeBegan) {
        instance.changeCompleted = true;
        instance.changeBegan = false;
        setCallback('changeComplete');
      }
    }
    instance.currentTime = minMax(insTime, 0, insDuration);
    if (instance.began) { setCallback('update'); }
    if (engineTime >= insDuration) {
      lastTime = 0;
      countIteration();
      if (!instance.remaining) {
        instance.paused = true;
        if (!instance.completed) {
          instance.completed = true;
          setCallback('loopComplete');
          setCallback('complete');
          if (!instance.passThrough && 'Promise' in window) {
            resolve();
            promise = makePromise(instance);
          }
        }
      } else {
        startTime = now;
        setCallback('loopComplete');
        instance.loopBegan = false;
        if (instance.direction === 'alternate') {
          toggleInstanceDirection();
        }
      }
    }
  }

  instance.reset = function() {
    var direction = instance.direction;
    instance.passThrough = false;
    instance.currentTime = 0;
    instance.progress = 0;
    instance.paused = true;
    instance.began = false;
    instance.loopBegan = false;
    instance.changeBegan = false;
    instance.completed = false;
    instance.changeCompleted = false;
    instance.reversePlayback = false;
    instance.reversed = direction === 'reverse';
    instance.remaining = instance.loop;
    children = instance.children;
    childrenLength = children.length;
    for (var i = childrenLength; i--;) { instance.children[i].reset(); }
    if (instance.reversed && instance.loop !== true || (direction === 'alternate' && instance.loop === 1)) { instance.remaining++; }
    setAnimationsProgress(instance.reversed ? instance.duration : 0);
  };

  // Set Value helper

  instance.set = function(targets, properties) {
    setTargetsValue(targets, properties);
    return instance;
  };

  instance.tick = function(t) {
    now = t;
    if (!startTime) { startTime = now; }
    setInstanceProgress((now + (lastTime - startTime)) * anime.speed);
  };

  instance.seek = function(time) {
    setInstanceProgress(adjustTime(time));
  };

  instance.pause = function() {
    instance.paused = true;
    resetTime();
  };

  instance.play = function() {
    if (!instance.paused) { return; }
    if (instance.completed) { instance.reset(); }
    instance.paused = false;
    activeInstances.push(instance);
    resetTime();
    if (!raf) { engine(); }
  };

  instance.reverse = function() {
    toggleInstanceDirection();
    resetTime();
  };

  instance.restart = function() {
    instance.reset();
    instance.play();
  };

  instance.reset();

  if (instance.autoplay) { instance.play(); }

  return instance;

}

// Remove targets from animation

function removeTargetsFromAnimations(targetsArray, animations) {
  for (var a = animations.length; a--;) {
    if (arrayContains(targetsArray, animations[a].animatable.target)) {
      animations.splice(a, 1);
    }
  }
}

function removeTargets(targets) {
  var targetsArray = parseTargets(targets);
  for (var i = activeInstances.length; i--;) {
    var instance = activeInstances[i];
    var animations = instance.animations;
    var children = instance.children;
    removeTargetsFromAnimations(targetsArray, animations);
    for (var c = children.length; c--;) {
      var child = children[c];
      var childAnimations = child.animations;
      removeTargetsFromAnimations(targetsArray, childAnimations);
      if (!childAnimations.length && !child.children.length) { children.splice(c, 1); }
    }
    if (!animations.length && !children.length) { instance.pause(); }
  }
}

// Stagger helpers

function stagger(val, params) {
  if ( params === void 0 ) params = {};

  var direction = params.direction || 'normal';
  var easing = params.easing ? parseEasings(params.easing) : null;
  var grid = params.grid;
  var axis = params.axis;
  var fromIndex = params.from || 0;
  var fromFirst = fromIndex === 'first';
  var fromCenter = fromIndex === 'center';
  var fromLast = fromIndex === 'last';
  var isRange = is.arr(val);
  var val1 = isRange ? parseFloat(val[0]) : parseFloat(val);
  var val2 = isRange ? parseFloat(val[1]) : 0;
  var unit = getUnit(isRange ? val[1] : val) || 0;
  var start = params.start || 0 + (isRange ? val1 : 0);
  var values = [];
  var maxValue = 0;
  return function (el, i, t) {
    if (fromFirst) { fromIndex = 0; }
    if (fromCenter) { fromIndex = (t - 1) / 2; }
    if (fromLast) { fromIndex = t - 1; }
    if (!values.length) {
      for (var index = 0; index < t; index++) {
        if (!grid) {
          values.push(Math.abs(fromIndex - index));
        } else {
          var fromX = !fromCenter ? fromIndex%grid[0] : (grid[0]-1)/2;
          var fromY = !fromCenter ? Math.floor(fromIndex/grid[0]) : (grid[1]-1)/2;
          var toX = index%grid[0];
          var toY = Math.floor(index/grid[0]);
          var distanceX = fromX - toX;
          var distanceY = fromY - toY;
          var value = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
          if (axis === 'x') { value = -distanceX; }
          if (axis === 'y') { value = -distanceY; }
          values.push(value);
        }
        maxValue = Math.max.apply(Math, values);
      }
      if (easing) { values = values.map(function (val) { return easing(val / maxValue) * maxValue; }); }
      if (direction === 'reverse') { values = values.map(function (val) { return axis ? (val < 0) ? val * -1 : -val : Math.abs(maxValue - val); }); }
    }
    var spacing = isRange ? (val2 - val1) / maxValue : val1;
    return start + (spacing * (Math.round(values[i] * 100) / 100)) + unit;
  }
}

// Timeline

function timeline(params) {
  if ( params === void 0 ) params = {};

  var tl = anime(params);
  tl.duration = 0;
  tl.add = function(instanceParams, timelineOffset) {
    var tlIndex = activeInstances.indexOf(tl);
    var children = tl.children;
    if (tlIndex > -1) { activeInstances.splice(tlIndex, 1); }
    function passThrough(ins) { ins.passThrough = true; }
    for (var i = 0; i < children.length; i++) { passThrough(children[i]); }
    var insParams = mergeObjects(instanceParams, replaceObjectProps(defaultTweenSettings, params));
    insParams.targets = insParams.targets || params.targets;
    var tlDuration = tl.duration;
    insParams.autoplay = false;
    insParams.direction = tl.direction;
    insParams.timelineOffset = is.und(timelineOffset) ? tlDuration : getRelativeValue(timelineOffset, tlDuration);
    passThrough(tl);
    tl.seek(insParams.timelineOffset);
    var ins = anime(insParams);
    passThrough(ins);
    children.push(ins);
    var timings = getInstanceTimings(children, params);
    tl.delay = timings.delay;
    tl.endDelay = timings.endDelay;
    tl.duration = timings.duration;
    tl.seek(0);
    tl.reset();
    if (tl.autoplay) { tl.play(); }
    return tl;
  };
  return tl;
}

anime.version = '3.1.0';
anime.speed = 1;
anime.running = activeInstances;
anime.remove = removeTargets;
anime.get = getOriginalTargetValue;
anime.set = setTargetsValue;
anime.convertPx = convertPxToUnit;
anime.path = getPath;
anime.setDashoffset = setDashoffset;
anime.stagger = stagger;
anime.timeline = timeline;
anime.easing = parseEasings;
anime.penner = penner;
anime.random = function (min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; };

const Smoothstep = function smoothstep(min, max, value) {

   return Math.max(0, Math.min(1, (value-min)/(max-min)))
   
};

/**
 * Mix glsl in js
 *
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} value - value
 * @return {number}
 * @memberof Math
 * @example
 *
 *     Mix(0,1, 10)
 */

const Mix = function mix(min, max, value) {
    return min * (1 - value) + max * value
};

const Scroll = new class Scroll {
    
    constructor() {
        this.onScroll = this.onScroll.bind(this);
        this.onUpdate = this.onUpdate.bind(this);
        this.preventDefault = this.preventDefault.bind(this);

        this.position = {
            x: window.pageXOffset || document.documentElement.scrollLeft || window.scrollX,
            y: window.pageYOffset || document.documentElement.scrollTop || window.scrollY,
            sx: window.pageXOffset || document.documentElement.scrollLeft || window.scrollX,
            sy: window.pageYOffset || document.documentElement.scrollTop || window.scrollY,
            xLast: 0,
            yLast: 0,
            ease: 0.05,
        };

        this.dimensions = {
            width: 0,
            height: 0,
        };

        this.velocity = {
            x: 0,
            y: 0,
            sx: 0,
            sy: 0,
            ease: 0.05,
            xUp: false,
            yUp: false,
        };

        this.direction = {
            x: 0,
            y: 0,
        };

        this.progress = {
            x: 0,
            y: 0,
            sx: 0,
            sy: 0,
            ease: 0.05
        };

        this.isSmooth = false;
        this.isLocked = false;
        this.scrolling = false;
        this.scrollingAuto = false;
        this.lastScroll = 0;
        this.element = null;
        this.$elements = [];
    }

    isScrolling() {
        return this.scrolling;
    }

    preventDefault(e) {
        e.preventDefault();
    }

    smooth($container) {
        this.isSmooth = true;

        const $fixed = document.createElement('div');
        $fixed.classList.add('scroll-fixed');
        $fixed.style.width = '100%';
        $fixed.style.height = '100%';
        $fixed.style.position = 'absolute';
        $fixed.style.top = 0;
        $fixed.style.left = 0;

        const $height = document.createElement('div');
        $height.classList.add('scroll-height');

        this.dimensions.height = $container.firstElementChild.scrollHeight;
        $height.style.height = `${this.dimensions.height}px`;

        const $wrapper = document.createElement('div');
        $wrapper.style.position = 'fixed';
        $wrapper.style.top = '0';
        $wrapper.style.left = '0';
        $wrapper.style.width = '100%';
        $wrapper.style.height = '100vh';
        $wrapper.style.overflow = 'hidden';
        $wrapper.classList.add('scroll-wrapper');

        $container.parentNode.appendChild($wrapper);
        $container.parentNode.appendChild($height);

        $wrapper.appendChild($container);

        // // Create an observer instance linked to the callback function
        const observer = new MutationObserver(() => {
            this.dimensions.height = $container.offsetHeight;
            $height.style.height = `${this.dimensions.height}px`;
        });
        observer.observe($container, {
            childList: true,
            attributes: true,
            characterData: true,
            subtree: true,
            attributeFilter: ['class']
        });

        emitter.on('resize', () => {
            this.dimensions.height = $container.offsetHeight;
            $height.style.height = `${this.dimensions.height}px`;
        });

        this.smoothElement = $container;
    }

    listen(element = document.documentElement) {
        this.element = element;

        window.addEventListener('scroll', this.onScroll);

        this.set(window.pageXOffset, window.pageYOffset);

        emitter.on('frame', this.onUpdate);

        const hasWheelEvent = 'onwheel' in document;
        const hasMouseWheelEvent = 'onmousewheel' in document;
        const hasKeyDown = 'onkeydown' in document;
        const hasTouch = 'ontouchstart' in document;

        if (hasWheelEvent) {
            this.element.addEventListener('wheel', () => {
                this.scrolling = true;
                this.lastScroll = Date.now();
            });
        }
        if (hasMouseWheelEvent) {
            this.element.addEventListener('mousewheel', () => {
                this.scrolling = true;
                this.lastScroll = Date.now();
            });
        }

        if (hasKeyDown) {
            this.element.addEventListener('keydown', () => {
                this.scrolling = true;
                this.lastScroll = Date.now();
            });
        }

        if (hasTouch) {
            this.element.addEventListener('touchmove', () => {
                this.scrolling = true;
                this.lastScroll = Date.now();
            });
        }
    }

    onScroll() {
        this.position.x = document.scrollingElement.scrollLeft;
        this.position.y = document.scrollingElement.scrollTop;

        this.direction.x = this.position.xLast <= this.position.x ? 1 : -1;
        this.direction.y = this.position.yLast <= this.position.y ? 1 : -1;

        this.progress.x = this.position.x / (this.element.scrollWidth - this.element.clientWidth);
        this.progress.y = this.position.y / (this.element.scrollHeight - this.element.clientHeight);
    }

    set(x, y) {
        this.element.scrollLeft = x;
        this.element.scrollTop = y;

        this.direction.x = x <= this.position.x ? 1 : -1;
        this.direction.y = y <= this.position.y ? 1 : -1;

        this.position.x = this.position.sx = this.position.xLast = x;
        this.position.y = this.position.sy = this.position.yLast = y;

        this.progress.x = this.progress.sx = this.position.x / (this.element.scrollWidth - this.element.clientWidth);
        this.progress.y = this.progress.sy = this.position.y / (this.element.scrollHeight - this.element.clientHeight);

        this.onUpdate();
    }

    animate ({ x = this.position.x, y = this.position.y, duration = 500, easing = 'linear', onComplete, onUpdate }) {
        const current = { x: this.position.x, y: this.position.y };

        return anime({
            targets: current,
            x: x,
            y: y,
            duration,
            easing,
            update: () => {
                this.set(current.x, current.y);
            },
            complete: () => {
                if (typeof onComplete === 'function'){
                    onComplete();
                } 
            }
        });
    }

    lock() {
        if (!this.isLocked) {
            this.isLocked = true;

            const scrollBarGap = window.innerWidth - document.documentElement.clientWidth;
            document.documentElement.style.setProperty('--scrollBarGap', `${scrollBarGap}px`);

            this.element.style.overflow = 'hidden';
            this.element.addEventListener('touchmove', this.preventDefault, { passive: false });
        }
    }

    unlock() {
        if (this.isLocked) {
            this.isLocked = false;

            document.documentElement.style.setProperty('--scrollBarGap', `0px`);

            this.element.style.overflow = '';
            this.element.removeEventListener('touchmove', this.preventDefault, { passive: false });
        }
    }

    onUpdate() {
        // const d = window.DELTA_TIME / 0.016;
        const d = 1;

        let multiplicatorInertia = 1;

        let dist = Math.abs( this.progress.y );

        multiplicatorInertia = Smoothstep(0.06, 0.07 , dist); 

        const isMobile = document.querySelector('html').classList.contains('mobile-webgl-enabled');
        const isTablet =  Device.tablet();
        if(isMobile || isTablet ){ 

            multiplicatorInertia = 0;
        }
        // multiplicatorInertia = 1 

        // console.log(mix( 0, this.position.ease, multiplicatorInertia ))
     

        // let newEase = 

        this.position.sx += (this.position.x - this.position.sx) * this.position.ease * d;
        this.position.sx += (this.position.x - this.position.sx) * Mix( 1, this.position.ease, multiplicatorInertia ) * d;
        this.position.sy += (this.position.y - this.position.sy) * Mix( 1, this.position.ease, multiplicatorInertia ) * d;
        this.position.sy += (this.position.y - this.position.sy) * this.position.ease * d;

        const vx = (this.position.x - this.position.xLast);
        const vy = (this.position.y - this.position.yLast);

        this.velocity.xUp = (vx - this.velocity.sx) > 0;
        this.velocity.yUp = (vy - this.velocity.sy) > 0;

        this.velocity.x = vx;
        this.velocity.y = vy;

        this.velocity.sx += (this.velocity.x - this.velocity.sx) * this.velocity.ease * d;
        this.velocity.sy += (this.velocity.y - this.velocity.sy) * this.velocity.ease * d;

        this.position.xLast = this.position.x;
        this.position.yLast = this.position.y;

        this.progress.sx += (this.progress.x - this.progress.sx) * this.progress.ease * d;
        this.progress.sy += (this.progress.y - this.progress.sy) * this.progress.ease * d;

        // removeinerty at 

        // console.log(this.progress.y)


        // check if scrolling
        if ((Date.now() - this.lastScroll) > 200) {
            this.scrolling = false;
        }

        if (this.isSmooth && this.smoothElement) {
            for (let i = 0; i < this.$elements.length; i++) {
                const { options, position } = this.$elements[i];
                const { speed, delay } = options;

                let x = this.position.sx;
                let y = -(this.position.sy * speed);

                position.x = x;
                position.y = y;

                x = x.toFixed();
                y = y.toFixed();

                const transform = `translate3d(${x}px,${y}px, 0)`;
                this.$elements[i].element.style.transform = transform;
            }
        }
    }

    bind($element, { speed = 1, delay = 0 } = {}) {
        this.$elements.push({
            element: $element,
            position: { x: 0, y: 0 },
            options: {
                speed,
                delay,
            }
        });
    }

    unbind($element) {
        for (let i = 0; i < this.elements.length; i++) {
            const { element } = this.elements[i];

            if ($element === element) {
                this.$elements.splice(i, 1);
            }
        }
    }
};

class Path extends Component {

    constructor({ index, start, end, marker, radius }) {
        super(`Globe Path ${index}`);
        
        this.index = index;
        this.start = start;
        this.end = end;
        this.marker = marker;
        this.radius = radius;

        this.init();
        this.onGUI();
    }

    init() {
        this.latStart = this.start[0];
        this.lngStart = this.start[1];

        this.latEnd = this.end[0];
        this.lngEnd = this.end[1];


        const lineGeometry = new THREE.BufferGeometry();
        const positions = [
            0, 0, 0,
            0, 0, -1,
        ];
        lineGeometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        this.lineColor = 0xcccbcb;

        const lineMaterial = new THREE.LineBasicMaterial({
            color: this.lineColor,
        });



        const line = this.line = new THREE.Line(lineGeometry, lineMaterial);
        line.position.z = 2.5;
        this.add(line);

        this.lineTarget = new THREE.Vector3();
        // line.scale.y = 0.5;
        
        line.lookAt(this.lineTarget);
        


        // const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const geometry = new THREE.SphereBufferGeometry(0.08, 8, 8);
        const materialStart = new THREE.MeshBasicMaterial({
            // color: 0xFF0000,
            color: 0xf85b51,
        });
        const materialEnd = new THREE.MeshBasicMaterial({
            // color: 0x0000FF,
            color: 0xf85b51,
        });

        const materialMiddle = new THREE.MeshBasicMaterial({
            // color: 0x00FF00,
            color: 0xf85b51,
        });

        this.start = new THREE.Mesh(geometry, materialStart);
        this.start.visible = false;
        this.add(this.start);
        this.end = new THREE.Mesh(geometry, materialEnd);
        this.end.visible = false;
        this.add(this.end);


        this.extremityScale = 0.50;
        this.start.scale.set(0.0001, 0.0001, 0.0001);
        this.end.scale.set(0.0001, 0.0001, 0.0001);

        this.intermediates = [];

        this.progress = 0;
        this.lineProgress = 0 + 0.0001;

        this.line.visible = false;
        this.line.scale.set(this.lineProgress, this.lineProgress, this.lineProgress);

    
        // this.$ui = document.createElement('div');
        // this.$ui.style.position = 'fixed';
        // this.$ui.style.width = '40px';
        // this.$ui.style.height = '40px';
        // this.$ui.style.marginLeft = '-20px';
        // this.$ui.style.marginTop = '-20px';
        // this.$ui.style.border = '2px solid red';
        // this.$ui.style.zIndex = 9999;
        // this.$ui.style.top = 0;
        // this.$ui.style.bottom = 0;
        // document.body.appendChild(this.$ui);

        const count = 50;

        for (let i = 0; i <= count; i++) {
            const mesh = new THREE.Mesh(geometry, materialMiddle);
            mesh.visible = false;
            mesh.scale.set(0.2, 0.2, 0.2);

            if (!(i === 0 || i === count)) {
                this.add(mesh);
            }
            // mesh.visible = (i === 0 || i === count); //@TODO not a
            this.intermediates.push(mesh);
        }

        this.setPositions();
        this.setPositions();
    }

    onGUI() {
        this.gui.add(this, 'latStart', -90, 90).step(0.1).onChange( () => {
            this.setPositions();
        });
        
        this.gui.add(this, 'lngStart', -180, 180).step(0.1).onChange( () => {
            this.setPositions();
        });
        this.gui.add(this, 'latEnd', -90, 90).step(0.1).onChange(() => {
            this.setPositions();
        });
        this.gui.add(this, 'lngEnd', -180, 180).step(0.1).onChange(() => {
            this.setPositions();
        });

        this.gui.add(this, 'progress', 0, 1).step(0.01).onChange(() => {
            this.setPositions();
        });
        this.gui.add(this, 'lineProgress', 0, 1).step(0.01).onChange(() => {
            this.line.scale.set(this.lineProgress, this.lineProgress, this.lineProgress);
        });

        this.gui.addColor(this, 'lineColor').onChange( () => {
            this.line.material.color = new THREE.Color(this.lineColor);
        });

        const params = { 
            intermediateScale: this.intermediates[0].scale.x,
            extremityScale: 1,
        };
        this.gui.add(params, 'intermediateScale', 0, 1).step(0.01).onChange( () => {
            for (let i = 0; i < this.intermediates.length; i++) {
                this.intermediates[i].scale.set(params.intermediateScale, params.intermediateScale, params.intermediateScale);
            }  
        });

        this.gui.add(params, 'extremityScale', 0, 1).step(0.01).onChange(() => {
            // this.start.scale.set(params.extremityScale, params.extremityScale, params.extremityScale);
            // this.end.scale.set(params.extremityScale, params.extremityScale, params.extremityScale);
        });


    }

    setProgress(progress) {
        this.progress = progress;

        if (this.marker === 'start') {
            this.setMarkerProgress(progress);
        }

        this.setPositions();
    }

    setStartProgress(progress) {
        if (progress <= 0) {
            this.start.visible = false;
        } else {
            this.start.visible = true;
        }

        const visibility = progress >= 1;

        for (let i = 0; i < this.intermediates.length; i++) {
            this.intermediates[i].visible = visibility;
        }  

        let s = this.extremityScale * progress;
        this.start.scale.set(s, s, s);
    }

    setEndProgress(progress) {
        if (progress <= 0) {
            this.end.visible = false;
        } else {
            this.end.visible = true;
        }

        const s = this.extremityScale * progress;
        this.end.scale.set(s, s, s);

        if (this.marker === 'end') {
            this.setMarkerProgress(progress);
        }
    }

    setMarkerProgress(progress) {
        if (progress <= 0) {
            this.line.visible = false;
        } else {
            this.line.visible = true;
        }

        this.lineProgress = progress;
        this.line.scale.set(this.lineProgress, this.lineProgress, this.lineProgress);
    }

    setPositions() {
        this.setPosition(this.start, this.latStart, this.lngStart);
        this.setPosition(this.end, this.latEnd, this.lngEnd);

        for (let i = 0; i < this.intermediates.length; i++) {
            const m = clamp(i / (this.intermediates.length - 1) + this.progress - 1, 0., 1.);
            // const m = map(i / (this.intermediates.length - 1), 0, 1, 0.1, 0.9);
            const lat = mix(this.latStart, this.latEnd, m);
            const lng = mix(this.lngStart, this.lngEnd, m);

            // const offset = Math.sin((i / this.intermediates.length) * Math.PI) * 0.1;
            const offset = 0;

            this.setPosition(this.intermediates[i], lat, lng, offset);
        }

        const target = new THREE.Vector3(0, 0, 0);

        if (this.container.parent) {
            target.setFromMatrixPosition(this.container.parent.matrixWorld);
        }

        const linePos = this.marker === 'end' ? this.end.position : this.start.position;

        this.line.position.copy(linePos);
        this.line.lookAt(target);
    }

    setRadius(radius) {
        this.radius = radius;
        this.setPositions();
    }

    setPosition(object, latitude, longitude, offset = 0) {
        const { x, y, z } = polarToGeo(latitude, longitude, this.radius + offset);

        object.position.set(x, y, z);
    }

    worldToScreen(object) {
        const width = window.innerWidth * 1, height = window.innerHeight * 1;
        const widthHalf = width / 2, heightHalf = height / 2;


        const s = object.scale.clone();
        object.scale.set(1, 1, 1);
        object.updateMatrixWorld(true);
        object.scale.copy(s);

        const dir = object.position.clone().normalize().multiplyScalar(1);
        const position = object.localToWorld(dir);
        
        position.project(Globals.get('camera'));
        position.x = ( position.x * widthHalf ) + widthHalf;
        position.y = - ( position.y * heightHalf ) + heightHalf;

        return position;
    }

    update() {
        const basePos = this.marker === 'end' ? this.end : this.start;
        const screenPos = this.worldToScreen(basePos);

        screenPos.x += this.marker === 'end' ? 0 : 40;
        screenPos.y += this.marker === 'end' ? 0 : -40;

        const key = `GLOBE_DATA_${this.index}`;

        window.GL[key] = {
            position: screenPos,
            progress: this.lineProgress,
        };

        // this.$ui.style.transform = `translate3d(${window.GL[key].position.x}px, ${window.GL[key].position.y}px, 0)`;
        // this.$ui.style.opacity = window.GL[key].progress;

        // if (this.index  === 0) {
        //     const screenPos = this.worldToScreen(this.start);
        //     this.$ui.style.transform = `translate3d(${screenPos.x}px, ${screenPos.y}px, 0)`;
        // }
    }



}

var vertexShader$2 = /* glsl */ `
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D map;
uniform vec3 uGradientDirection;

varying vec2 vUv;
varying float vGradient;

void main() {
    vUv = uv;

    vec3 transformed = position;

    float gradient = length(transformed - uGradientDirection) / 2.;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.);
    

    vGradient = gradient;
}
`;

var fragmentShader$2 = /* glsl */ `
uniform vec3 diffuse;
uniform vec3 diffuse2;
uniform float opacity;
uniform sampler2D map;
uniform float globalAlphaSpeed;


varying vec2 vUv;
varying float vGradient;

void main() {
    vec4 diffuseColor = vec4(vec3(1., 1., 1.), opacity);
    vec4 mapTexel = texture2D(map, vUv);

    diffuseColor.rgb *= mapTexel.rgb;
    diffuseColor.rgb *= mix(diffuse, diffuse2, vGradient);
    
    gl_FragColor = diffuseColor;
    gl_FragColor.a *= globalAlphaSpeed;
    if(gl_FragColor.a < 0.001){
    	discard;
    }
}
`;

var vertexShaderShadow$2 = /* glsl */`
varying vec2 vUv;

void main() {
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}
`;

var fragmentShaderShadow$2 = /* glsl */`
uniform vec3 diffuse;
uniform sampler2D map;
uniform float opacity;
uniform float globalAlphaSpeed;


varying vec2 vUv;

void main() {
    vec4 mapTexel = texture2D(map, vUv);
    gl_FragColor = vec4(mapTexel.rgb * diffuse, mapTexel.a * opacity);
    gl_FragColor.a *= globalAlphaSpeed;
   	if(gl_FragColor.a < 0.001){
   	discard;
   	}
    // gl_FragColor = vec4(1., 0., 0., 1.);
}
`;

class Globe extends Component {

    constructor() {
        super('Globe');

        this.init();
        this.onGUI();
    }

    init() {
        this.container.visible = false;

        const geometry = new THREE.SphereBufferGeometry(1, 32, 32);

        this.textureLoader = new THREE.TextureLoader();

        // const material = new THREE.MeshBasicMaterial({
        //     map: Assets.get('worldmap'),
        // });

        this.gradientLat = 39;
        this.gradientLng = -61;
        this.color = 0xfcfcfb;
        this.color2 = 0xededed;
        this.radius = this.computeRadius();
        this.distancePath = 0.2;

        const uniforms = this.uniforms = {
            diffuse: { value: new THREE.Color(this.color) },
            diffuse2: { value: new THREE.Color(this.color2) },
            opacity: { value: 1 },
            uGradientDirection: { value: new THREE.Vector3() },
            map: { value: Assets.get('worldmap') },
            globalAlphaSpeed:{value: 1}
        };

        this.computeGradientDirection();

        const material = new THREE.ShaderMaterial({
            vertexShader: vertexShader$2,
            fragmentShader: fragmentShader$2,
            uniforms,
            transparent: true
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.add(this.mesh);

        this.mesh.scale.set(this.radius, this.radius, this.radius);
        Globals.set('globe.scale', this.mesh.scale);

        this.scrollAnchors = [
            0.20, // display
            0.24, // middle state
            0.38, // middle state end,
            0.42, // hide
        ];

        this.startPosition = new THREE.Vector3(5, -10, -5);
        this.middlePosition = new THREE.Vector3(5, 0, -5);
        this.endPosition = new THREE.Vector3(5, 10, -5);

        Globals.set('globe.position', this.startPosition);

        this.startAngle = -Math.PI * 1.5;
        this.middleAngle = -Math.PI * 0.35;
        this.endAngle = Math.PI;

        this.pathsContainer = new THREE.Object3D();
        this.add(this.pathsContainer);

        const path0 = new Path({
            index: 0,
            start: [-15, 4.10],
            end: [33.8, -79.1],
            marker: 'end',
            radius: this.radius + this.distancePath,
        });
        this.pathsContainer.add(path0.container);

        const path1 = new Path({
            index: 1,
            start: [25.9, 4],
            end: [-10.5, -78.1],
            marker: 'end',
            radius: this.radius + this.distancePath,
        });
        this.pathsContainer.add(path1.container);

        const path2 = new Path({
            index: 2,
            start: [36, -16],
            end: [-29, -69],
            marker: 'start',
            radius: this.radius + this.distancePath,
        });
        this.pathsContainer.add(path2.container);  

        this.paths = [ path0, path1, path2 ];

        const shadowGeometry = new THREE.PlaneBufferGeometry(1, 1);
        const shadowMaterial = new THREE.ShaderMaterial({
            vertexShader: vertexShaderShadow$2,
            fragmentShader: fragmentShaderShadow$2,
            uniforms: {
                diffuse: { value: new THREE.Color(0xFFFFFF) },
                map: { value: Assets.get('earth-shadow') },
                opacity: { value: 1 },
                globalAlphaSpeed:{
                    value: 1
                }
            },
            transparent: true,
            depthWrite: false,
        });

        this.shadowOffset = -this.radius * 0.375;

        this.shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
        this.shadow.scale.set(this.radius * 5, this.radius * 5, 1);
        this.shadow.position.set(this.radius * 0.725, this.shadowOffset, -this.radius);
        this.add(this.shadow);
    }

    computeRadius() {

        const isLandscape = window.innerWidth > window.innerHeight;

        let radius =  4;

        if(Globals.get('mobile-webgl')){

            radius = 1.8;

            if(isLandscape){

                radius = 3;
            }

            
            // const radius1280 = radius;
            let ratio = window.innerWidth / 1280;
            ratio = Math.max(1, ratio);


            return radius / ratio;

        }

        const radius1280 = radius;

        let ratio = 1;

        if(isLandscape){

            ratio = window.innerWidth / 1280;

            ratio = Math.max(1, ratio);

        }

        else{

            ratio = window.innerHeight / window.innerWidth;

        }

        return radius1280 / ratio;

    }

    computeGradientDirection() {
        const { x, y, z } = polarToGeo(this.gradientLat, this.gradientLng, 1);

        this.uniforms.uGradientDirection.value.set(x, y, z);
    }

    onGUI() {
        // const fileInput = new FileInputGUI('texture', this.gui, (dataURL) => {
        //     this.mesh.material.map = this.textureLoader.load(dataURL);
        // });

        this.gui.add(this, 'radius', 0, 5).step(0.1).onChange(() => {
            this.mesh.scale.set(this.radius, this.radius, this.radius);

            for (let i = 0; i < this.paths.length; i++) {
                this.paths[i].setRadius(this.radius + this.distancePath);
            }
        });

        this.gui.add(this, 'distancePath', 0, 5).step(0.1).onChange(() => {
            for (let i = 0; i < this.paths.length; i++) {
                this.paths[i].setRadius(this.radius + this.distancePath);
            }
        });

        this.gui.add(this, 'startAngle', -2 * Math.PI, 2 * Math.PI).step(0.01);
        this.gui.add(this, 'middleAngle', -2 * Math.PI, 2 * Math.PI).step(0.01);
        this.gui.add(this, 'endAngle', -2 * Math.PI, 2 * Math.PI).step(0.01);
        this.gui.add(this, 'gradientLat', -90, 90).onChange( () => {
            this.computeGradientDirection();
        });
        this.gui.add(this, 'gradientLng', -180, 180).onChange( () => {
            this.computeGradientDirection();
        });
        this.gui.addColor(this, 'color').onChange(() => {
            this.uniforms.diffuse.value = new THREE.Color(this.color);
        });
        this.gui.addColor(this, 'color2').onChange(() => {
            this.uniforms.diffuse2.value = new THREE.Color(this.color2);
        });

        this.gui.add(this.shadow.position, 'x', -10, 10).name('shadow x').step(0.1);
        this.gui.add(this.shadow.position, 'y', -10, 10).name('shadow y').step(0.1);
        this.gui.add(this.shadow.position, 'z', -10, 10).name('shadow z').step(0.1);
    }

    update() {
       
    }

    updatePath(index, progress) {
        let startProgress = map$1(progress, 0, 0.5, 0, 1);
        startProgress = clamp(startProgress, 0, 1);

        let intermediateProgress = map$1(progress, 0.5, 0.9, 0, 1);
        intermediateProgress = clamp(intermediateProgress, 0, 1);

        let endProgress = map$1(progress, 0.9, 1, 0, 1);
        endProgress = clamp(endProgress, 0, 1);

        this.paths[index].setStartProgress(startProgress);
        this.paths[index].setProgress(intermediateProgress);
        this.paths[index].setEndProgress(endProgress);


    }

    setGlobalAlphaSpeed(val){
        this.mesh.material.uniforms.globalAlphaSpeed.value = val;
        this.shadow.material.uniforms.globalAlphaSpeed.value = val;
        // this.mesh.material.uniforms.globalAlphaSpeed.value = val 
    }
    
    resize() {

        this.radius = this.computeRadius();

        this.mesh.scale.set(this.radius, this.radius, this.radius);
        this.shadow.scale.set(this.radius * 5, this.radius * 5, 1);

        this.shadowOffset = -this.radius * 0.375;

        this.shadow.position.set(this.radius * 0.725, this.shadowOffset, -this.radius);

        Globals.set('globe.scale', this.mesh.scale);

        for (let i = 0; i < this.paths.length; i++) {
            this.paths[i].setRadius(this.radius + this.distancePath);
        }

    }

}

function quarticOut(t) {
  return Math.pow(t - 1.0, 3.0) * (1.0 - t) + 1.0
}

var quartOut = quarticOut;

const computeFullscreenSize = (z = 0) => {
    const cameraZ = Globals.get('camera').position.z;
    const distance = Math.abs(z - cameraZ);
    const aspect = window.innerWidth / window.innerHeight;
    const vFov = Globals.get('camera').fov * Math.PI / 180;
    const planeHeightAtDistance = 2 * Math.tan(vFov / 2) * distance;
    const planeWidthAtDistance = planeHeightAtDistance * aspect;

    return [planeWidthAtDistance, planeHeightAtDistance];
};

var vertexShader$3 = /* glsl */`
varying vec2 vUv;

void main() {
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}
`;

var fragmentShader$3 = /* glsl */`
uniform vec3 diffuse;
uniform vec3 diffuse2;
uniform float opacity;
uniform vec2 uGradientCenter;
uniform float uWeakness;
uniform vec2 uScale;
uniform vec2 uResolution;

varying vec2 vUv;

void main() {
    vec2 uv = vec2(vUv * 2.) - 1.;
    float d = length(vec2(uGradientCenter - uv));

    vec3 diffuseColor = mix(diffuse, diffuse2, d * uWeakness);

    gl_FragColor = vec4(diffuseColor, opacity);
}
`;

class Background extends Component {

    constructor() {
        super('Particles Background');

        this.init();
        this.onGUI();
    }

    init() {
        const geometry = new THREE.PlaneBufferGeometry(1, 1);
        const height = this.height = 1;

        this.color1 = 0x3A3A3A;
        this.color2 = 0x000000;
        // this.color2 = 0xFF0000; // temp

        const uniforms = this.uniforms = {
            diffuse: { value: new THREE.Color(this.color1) },
            diffuse2: { value: new THREE.Color(this.color2) },
            opacity: { value: 1 },
            uGradientCenter: { value: new THREE.Vector2(-0.95, 0.2)},
            uWeakness: { value: 1 },
            uScale: { value: new THREE.Vector2(1, 1) },
            uResolution: window.U_RESOLUTION,
        };

        const material = new THREE.ShaderMaterial({
            vertexShader: vertexShader$3,
            fragmentShader: fragmentShader$3,
            uniforms,
            // transparent: true, // TEMP
        });

        // const material = new THREE.MeshBasicMaterial({
        //     color: 0xFF0000
        // });

        this.mesh = new THREE.Mesh(geometry, material);
        // this.mesh.position.z = -4;
        // this.mesh.scale.set(0.5, 0.5, 0.5);
        this.container.add(this.mesh);

        Mouse.uv.ease = 0.1;


        this.resize();
    }

    onGUI() {
        this.gui.addColor(this, 'color1').onChange(() => {
            this.uniforms.diffuse.value = new THREE.Color(this.color1);
        });
        this.gui.addColor(this, 'color2').onChange(() => {
            this.uniforms.diffuse2.value = new THREE.Color(this.color2);
        });
        this.gui.add(this.uniforms.uGradientCenter.value, 'x', -1, 1).name('center x').step(0.01);
        this.gui.add(this.uniforms.uGradientCenter.value, 'y', -1, 1).name('center y').step(0.01);
        this.gui.add(this.uniforms.uWeakness, 'value', 0, 4).name('weakness');
    }

    setHeight(height) {
        this.height = height;
        this.resize();
    }

    update() {
        // this.uniforms.uGradientCenter.value.x = Mouse.uv.sx;
        // this.uniforms.uGradientCenter.value.y = Mouse.uv.sy;
    }

    resize() {
        const [ w, h ] = computeFullscreenSize(this.mesh.position.z);
        const scaleY = this.height / window.innerHeight; 

        const s = 1;

        this.mesh.scale.set(w * s, h * scaleY * s, 1);
        this.uniforms.uScale.value.x = this.mesh.scale.x;
        this.uniforms.uScale.value.y = this.mesh.scale.y;
    }

}

var snoise2d = /*glsl*/`
vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
    return mod289(((x * 34.0) + 1.0) * x);
}

float snoise2d(vec2 v)
{
    const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
        -0.577350269189626,  // -1.0 + 2.0 * C.x
        0.024390243902439); // 1.0 / 41.0
    // First corner
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);

    // Other corners
    vec2 i1;
    //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
    //i1.y = 1.0 - i1.x;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    // x0 = x0 - 0.0 + 0.0 * C.xx ;
    // x1 = x0 - i1 + 1.0 * C.xx ;
    // x2 = x0 - 1.0 + 2.0 * C.xx ;
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;

    // Permutations
    i = mod289(i); // Avoid truncation effects in permutation
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
        + i.x + vec3(0.0, i1.x, 1.0));

    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;

    // Gradients: 41 points uniformly over a line, mapped onto a diamond.
    // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;

    // Normalise gradients implicitly by scaling m
    // Approximation of: m *= inversesqrt( a0*a0 + h*h );
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

    // Compute final noise value at P
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}`;

var vertexShader$4 = /* glsl */`
attribute float aScale;
attribute float aSpeed;
attribute float aOffset;
attribute float aAspect;
attribute float aRandom;
attribute float aLife;

uniform float size;
uniform float scale;
uniform vec3 uCenter;
uniform float uHeight;
uniform vec2 uResolution;
uniform float uTime;
uniform float uProgress;
uniform vec2 uScale;
uniform float uPixelRatio;

varying float vAspect;
varying vec3 vPosition;
varying float vSize;
varying float vLife;


${snoise2d}

#include <common>

void main() {
    vAspect = aAspect;

    vec3 center = uCenter;

    vec3 transformed = center;
    vec3 direction = normalize(position - center) * uProgress;
    transformed += direction * mod(uTime * aSpeed + aOffset, 2.);
    
    vec3 random = position;
    random.x += snoise2d(vec2(position.x, aOffset + uTime * 0.01));
    random.y += snoise2d(vec2(position.y, aOffset - uTime * 0.007));
    
    transformed = mix(transformed, random, aRandom);
    
    
    transformed.x *= uScale.x * 1.;
    transformed.y *= uScale.y * 1.;

    // transformed.xy *= sin(aLife * PI);
    
    vPosition = transformed;
    

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.);

    float s = snoise2d(vec2(position.x + position.y, uTime * 0.2 + aOffset));
    s = (s + 1.) * 0.5;

    vSize = size * uPixelRatio * aScale * s;
    // vSize = size;

    gl_PointSize = vSize;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
    #endif
}
`;

var fragmentShader$4 = /* glsl */`
uniform vec3 diffuse;
uniform vec3 diffuse2;
uniform float opacity;
uniform sampler2D map;
uniform vec2 uResolution;
uniform float uHeight;
uniform float uBrightness;
uniform float uContrast;
uniform float uProgress;
uniform float uGradient;
uniform vec2 uScale;
uniform vec3 uCenter;
uniform float uRadialOpacity;

varying float vAspect;
varying vec3 vPosition;
varying float vSize;
varying float vLife;

void main() {
    vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
    vec4 mapTexel = texture2D(map, uv);

    float d = mapTexel.a * uGradient;
    d = 1. - length(uv - vec2(0.5, 0.5)) * uGradient;

    vec3 color = mix(diffuse, diffuse2, d - vAspect);
    
    float o = opacity * mapTexel.a;

    float pos = (vPosition.y + uv.y * vSize / uResolution.y);
    float mask = uScale.y;


    float distanceFromCenter = 1. - length(vPosition.xy / uScale - uCenter.xy) * uRadialOpacity;
    o *= distanceFromCenter;
    o *= step(pos, mask + vSize / uResolution.y * 0.25);
    o *= step(-mask, pos - vSize / uResolution.y * 0.75);
    o *= uProgress;

    gl_FragColor = vec4(color, o);
}`;

class System extends Component {

    constructor() {
        super('Particles System');

        this.init();
        this.onGUI();
    }

    init() {
        const count = this.count = 2000;
        const color = this.color = 0xFF0000;
        const color2 = this.color2 = 0xFFF000;
        const countRandom = this.countRandom = 0.25;
        

        const geometry = this.createGeometry();

        const uniforms = this.uniforms = {
            ...THREE.UniformsUtils.clone(THREE.ShaderLib.points.uniforms),
            size: { value: 10 },
            map: { value: Assets.get('particle') },
            opacity: { value: 0.9 },
            diffuse: { value: new THREE.Color(color) },
            diffuse2: { value: new THREE.Color(color2) },
            uCenter: { value: new THREE.Vector3(0.05, 0.35, 0) },
            uTime: window.U_TIME,
            uResolution: window.U_RESOLUTION,
            uPixelRatio: window.U_PIXEL_RATIO,
            uHeight: { value: 200 },
            uBrightness: { value: 0 },
            uContrast: { value: 1 },
            uProgress: { value: 1 },
            uScale: { value: new THREE.Vector2(1, 1)},
            uGradient: { value: 2 },
            uRadialOpacity: { value: 0.7 },
            // uMask: { value: (window.innerHeight - 200) / window.innerHeight}
        };

        const shaderMaterial = new THREE.ShaderMaterial({
            vertexShader: vertexShader$4,
            fragmentShader: fragmentShader$4,
            uniforms,
            blending: THREE.AdditiveBlending,
            transparent: true,
        });

        // const material = new THREE.PointsMaterial({
        //     color: this.color,
        //     opacity: 0.2,
        //     transparent: true,
        //     blending: THREE.AdditiveBlending,
        // })

        this.mesh = new THREE.Points(geometry, shaderMaterial);
        this.mesh.frustumCulled = false;
        this.container.add(this.mesh);
    }

    createGeometry() {
        const points = [];
        const speeds = [];
        const scales = [];
        const offsets = [];
        const aspects = [];
        const randoms = [];
        const lifes = [];

        for (let i = 0; i < this.count; i++) {
            const x = (Math.random() * 2 - 1) * 1;
            const y = (Math.random() * 2 - 1) * 1;
            const z = (Math.random() * 2 - 1) * 0;
            // const x = (Math.random() * 2 - 1) * 4;
            // const y = (Math.random() * 2 - 1) * 4;
            // const z = (Math.random() * 2 - 1) * 0;

            points.push(x, y, z);

            const speed = Math.random() * 0.1;
            speeds.push(speed);

            const scale = Math.random() * 1.5 + 0.1;
            scales.push(scale);

            const offset = Math.random() * 1000;
            offsets.push(offset);

            // brightness
            const aspect = Math.random() * 0.3;
            aspects.push(aspect);

            const random = Math.random() > this.countRandom ? 0 : 1;
            randoms.push(random);

            const life = Math.random();

            lifes.push(life);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.Float32BufferAttribute(points, 3));
        geometry.addAttribute('aScale', new THREE.Float32BufferAttribute(scales, 1));
        geometry.addAttribute('aSpeed', new THREE.Float32BufferAttribute(speeds, 1));
        geometry.addAttribute('aOffset', new THREE.Float32BufferAttribute(offsets, 1));
        geometry.addAttribute('aAspect', new THREE.Float32BufferAttribute(aspects, 1));
        geometry.addAttribute('aRandom', new THREE.Float32BufferAttribute(randoms, 1));

        this.aLifes = new THREE.Float32BufferAttribute(lifes, 1);

        geometry.addAttribute('aLife', this.aLifes);

        return geometry;
    }

    onGUI() {
        this.gui.add(this, 'count', 0, this.count * 2).step(1).onChange( () => {
            const geometry = this.createGeometry();

            this.mesh.geometry = geometry;
        });

        this.gui.add(this, 'countRandom', 0, 1).step(0.01).onChange(() => {
            const geometry = this.createGeometry();

            this.mesh.geometry = geometry;
        });

        this.gui.add(this.uniforms.uCenter.value, 'x', -1, 1).name('center x').step(0.01);
        this.gui.add(this.uniforms.uCenter.value, 'y', -1, 1).name('center y').step(0.01);
        this.gui.addColor(this, 'color').onChange( () => {
            this.uniforms.diffuse.value = new THREE.Color(this.color);
        });

        this.gui.addColor(this, 'color2').onChange(() => {
            this.uniforms.diffuse2.value = new THREE.Color(this.color2);
        });
        
        // this.gui.add(this.uniforms.uBrightness, 'value', 0, 1).step(0.05).name('brightness');
        // this.gui.add(this.uniforms.uContrast, 'value', 0, 3).step(0.01).name('contrast');
        this.gui.add(this.uniforms.uGradient, 'value', 0, 4).step(0.01).name('gradient');
        this.gui.add(this.uniforms.opacity, 'value', 0, 1).name('opacity').step(0.1);
        this.gui.add(this.uniforms.uRadialOpacity, 'value', 0, 3).name('radialOpacity').step(0.1);
    }

    setHeight(height) {
        this.uniforms.uHeight.value = height;
    }

    setProgress(progress) {
        this.uniforms.uProgress.value = progress;
    }

    setScale(scaleX, scaleY) {
        this.uniforms.uScale.value.x = scaleX * 0.5;
        this.uniforms.uScale.value.y = scaleY * 0.5;
    }

    update() {
        for (let i = 0; i < this.aLifes.array.count; i++) {
            let life = this.aLifes.array[i];
            life -= window.DELTA_TIME;

            if (life <= 0) {
                life = 1;
            }

            this.aLifes.array[i] = life;
        }

        this.aLifes.needsUpdate = true;
    }

    

}

var vertexShader$5 = /* glsl */ `
attribute float aRadius;

uniform float size;
uniform float scale;
uniform float uHeight;
uniform float uProgress;
uniform vec2 uResolution;
uniform vec3 uCenter;
uniform vec2 uScale;

varying vec3 vPosition;
varying float vSize;

void main() {
    vec3 center = vec3(0.);

    vec3 finalPosition = position;

    vec3 transformed = mix(center, finalPosition, uProgress);
    transformed.xy *= uScale.x;


    transformed.x += uCenter.x * uScale.x;
    transformed.y += uCenter.y * uScale.y;

    vPosition = transformed;
    vSize = size;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.);

    gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
    #endif
}
`;

var fragmentShader$5 = /* glsl */`
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D map;
uniform float uProgress;
uniform float uHeight;
uniform vec2 uResolution;
uniform vec2 uScale;


varying vec3 vPosition;
varying float vSize;

void main() {
    vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
    vec4 mapTexel = texture2D(map, uv);

    vec3 color = diffuse;
    float o = opacity * mapTexel.a * uProgress;

    float pos = (vPosition.y + uv.y * vSize / uResolution.y) - vSize / uResolution.y * 0.5;
    float mask = uScale.y;

    o *= step(pos, mask);
    o *= step(-mask, pos);

    gl_FragColor = vec4(color, o);
}
`;

class Circles extends Component {

    constructor() {
        super('Particles Circles');

        this.init();
        this.onGUI();
    }

    init() {
        const params = this.params = [
            { radius: 1 / 3, count: 120 },
            { radius: 2 / 3, count: 200 },
            { radius: 1, count: 300 },
        ];

        if (window.innerWidth < window.innerHeight) {
            this.params[0].radius = 1;
            this.params[1].radius = 1.5;
            this.params[2].radius = 2;
        }

        const color = this.color = 0xFFFFFF;
        
        const geometry = this.createGeometry();

        const uniforms = this.uniforms = {
            size: { value: 3 * window.PIXEL_RATIO },
            scale: { value: 1 },
            diffuse: { value: new THREE.Color(color) },
            opacity: { value: 1 },
            map: { value: Assets.get('particle') },
            uHeight: { value: 200 },
            uResolution: window.U_RESOLUTION,
            uCenter: { value: new THREE.Vector3(0.05, 0.35, 0) },
            uProgress: { value: 1 },
            uScale: { value: new THREE.Vector2(1, 1) },
        };

        const material = new THREE.ShaderMaterial({
            vertexShader: vertexShader$5,
            fragmentShader: fragmentShader$5,
            uniforms,
            transparent: true,
            depthWrite: false,
            depthTest: false,
        });

        this.mesh = new THREE.Points(geometry, material);
        this.mesh.frustumCulled = false;
        this.container.add(this.mesh);
    }

    setHeight(height) {
        this.uniforms.uHeight.value = height;
    }

    createGeometry() {
        const position = new THREE.Vector3();
        const positions = [];
        const radiuses = [];

        for (let i = 0; i < this.params.length; i++) {
            const { radius, count } = this.params[i];

            for (let j = 0; j < count; j++) {
                const angle = (j / count) * 2 * Math.PI;

                position.x = Math.cos(angle) * radius;
                position.y = Math.sin(angle) * radius;

                positions.push(position.x, position.y, position.z);
                radiuses.push(radius);
            }
        }
        

        const geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.addAttribute('aRadius', new THREE.Float32BufferAttribute(radiuses, 1));

        return geometry;
    }

    onGUI() {
        this.gui.addColor(this, 'color').onChange(() => {
            this.uniforms.diffuse.value = new THREE.Color(this.color);
        });
        this.gui.add(this.uniforms.opacity, 'value', 0, 1).name('opacity').step(0.01);
        this.gui.add(this.uniforms.size, 'value', 0, 5 * window.PIXEL_RATIO).name('size');
        this.gui.add(this.uniforms.uProgress, 'value', 0, 1).name('progress').step(0.1);

        this.gui.add(this.uniforms.uCenter.value, 'x', -1, 1).name('center x').step(0.01);
        this.gui.add(this.uniforms.uCenter.value, 'y', -1, 1).name('center y').step(0.01);
        
        for (let i = 0; i < this.params.length; i++) {
            this.gui.add(this.params[i], 'radius', 0, 1).name(`radius ${i + 1}`).step(0.01).onChange( () => {
                const geometry = this.createGeometry();
                this.mesh.geometry = geometry;
            });
            this.gui.add(this.params[i], 'count', 0, 200).name(`count ${i + 1}`).step(1).onChange( () => {
                const geometry = this.createGeometry();
                this.mesh.geometry = geometry;
            });
        }
    }

    update() {

    }

    setProgress(progress) {
        this.uniforms.uProgress.value = progress;
        this.uniforms.opacity.value = map$1(progress, 0, 1, 0, 0.5);
    }

    setScale(scaleX, scaleY) {
        this.uniforms.uScale.value.x = scaleX * 0.5;
        this.uniforms.uScale.value.y = scaleY * 0.5;
    }

}

var vertexShader$6 = /* glsl */ `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
    vUv = uv;

    vec3 transformed = position;

    vPosition = transformed;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.);
}
`;

var fragmentShader$6 = /* glsl */ `
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D map;
uniform vec2 uResolution;
uniform float uLimit;
uniform float uPixelRatio;

varying vec2 vUv;
varying vec3 vPosition;


void main() {
    vec4 diffuseColor = vec4(diffuse, opacity);
    vec4 mapTexel = texture2D(map, vUv);

    diffuseColor *= mapTexel;

    diffuseColor.a *= step(gl_FragCoord.y * (1. / uPixelRatio), uLimit * uResolution.y);


    // if (gl_FragCoord.y * (1. / uPixelRatio) >= uLimit * uResolution.y) {
    //     diffuseColor.a = 0.;
    // }

    gl_FragColor = diffuseColor;
}

`;

class BlackCard extends Component {

    constructor() {
        super('Particles Card');

        this.init();
        this.onGUI();
    }

    init() {
        this.height = 0;

        this.startPosition = new THREE.Vector3(0, 1.75, 0);
        this.endPosition = new THREE.Vector3(0, 0.55, 0);

        this.startScale = window.innerWidth > window.innerHeight ? 3 : 2;
        this.endScale = this.startScale * 1.15;
        this.CARD_HEIGHT = 993;
        this.CARD_WIDTH = 733;

        const geometry = new THREE.PlaneBufferGeometry(1, 1, 2, 2);

        const uniforms = this.uniforms = {
            diffuse: { value: new THREE.Color(0xFFFFFF) },
            opacity: { value: 1 },
            map: { value: Assets.get('card-front-black') },

            uScale: { value: new THREE.Vector2(1, 1) },
            uResolution: window.U_RESOLUTION,
            uPixelRatio: window.U_PIXEL_RATIO,
            uLimit: { value: 0 },
        };

        const material = new THREE.ShaderMaterial({
            vertexShader: vertexShader$6,
            fragmentShader: fragmentShader$6,
            uniforms,
            transparent: true,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.x = 0.05 * Globals.get('fullscreen.x') * 0.5;
        this.setScale(2);

        this.container.add(this.mesh);
    }

    onGUI() {
        const params = { 
            x: this.mesh.position.x / (Globals.get('fullscreen.x') * 0.5),
        };

        this.gui.add(params, 'x', -1, 1).step(0.01).onChange(() => {
            this.mesh.position.x = params.x * Globals.get('fullscreen.x') * 0.5;
        });

        this.gui.add(this.startPosition, 'y', 0, 2).name('startY');
        this.gui.add(this.endPosition, 'y', 0, 2).name('endY');

        this.gui.add(this, 'startScale', 1, 5);
        this.gui.add(this, 'endScale', 1, 5);

    }

    update() {

    }

    resize() {
        this.setScale(this.currentScale);
    }

    setLimit(limit) {
        this.uniforms.uLimit.value = limit;
    }

    setHeight(height) {
        this.height = height;
    }

    setScale(value) {
        this.currentScale = value;

        let ratio = window.innerWidth / 1440;
        ratio = Math.max(1, ratio);


        const s = value / ratio;

        const sx = s;
        const sy = s * this.CARD_HEIGHT / this.CARD_WIDTH;
        console.log(sx, sy, 1)
        this.mesh.scale.set(sx, sy, 1);
    }

    setProgress(progress) {
        this.container.position.y = mix(this.startPosition.y, this.endPosition.y, progress) * Globals.get('fullscreen.y') * this.height / window.innerHeight * 0.5;

        const scale = mix(this.startScale, this.endScale, progress);
        this.setScale(scale);
    }
}

class Particles extends Component {

    constructor() {
        super('Particles Section');



        this.init();
        // this.onGUI();
    }

    init() {
        const height = this.height = 650;

        this.background = new Background();
        this.add(this.background);

        this.circles = new Circles();
        this.add(this.circles);

        this.system = new System();
        this.add(this.system);

        this.blackCard = new BlackCard();
        this.blackCard.container.position.z = 1;
        this.add(this.blackCard);

        this.system.setHeight(this.height);
        this.background.setHeight(this.height);
        this.circles.setHeight(this.height);
        this.blackCard.setHeight(this.height);

        this.startPosition = new THREE.Vector3(0, 0, 0);
        this.endPosition = new THREE.Vector3(0, 0, 0);

        this.resize();
    }

    update() {
        const primeBounds = Globals.get('prime.bounds');
        const top = primeBounds.top;
        const height = primeBounds.height;

        let k = map$1(Scroll.position.y, top - window.innerHeight, top + height, 0, 1);
        let sk = map$1(Scroll.position.sy, top - window.innerHeight, top + height, 0, 1);

        if (k < 0 || k > 1) {
            this.container.visible = false;
        } else {
            this.container.visible = true;
        }

        this.system.setHeight(height);
        this.background.setHeight(height);
        this.circles.setHeight(height);
        this.blackCard.setHeight(height);

        k = clamp(k, 0, 1);
        sk = clamp(sk, 0, 1);

        // this.container.visible = false;

        const y = mix(this.startPosition.y, this.endPosition.y, k);
        this.container.position.y = y;

        let sp = map$1(sk, 0, 0.35, 0, 1);
        sp = clamp(sp, 0, 1);

        const spe = quartOut(sp);

        this.blackCard.setProgress(spe);
        this.circles.setProgress(spe);
        this.system.setProgress(spe);

        const fullScreenY = Globals.get('fullscreen.y');
        const scaleY = this.height / window.innerHeight;
        const blocHeight = fullScreenY * scaleY;
        const distance = (fullScreenY - blocHeight) * 0.5 - this.container.position.y;
        const limit = 1 - distance / fullScreenY;

        this.blackCard.setLimit(limit);
    }

    resize() {
        const primeBounds = Globals.get('prime.bounds');

        this.height = primeBounds.height;

        this.system.setHeight(this.height);
        this.background.setHeight(this.height);
        this.circles.setHeight(this.height);
        this.blackCard.setHeight(this.height);

        const fullScreenX = Globals.get('fullscreen.x');
        const fullScreenY = Globals.get('fullscreen.y');

        const scaleX = fullScreenX;
        const scaleY = primeBounds.height / window.innerHeight * fullScreenY;

        this.startPosition.y = -fullScreenY * 0.5 - scaleY * 0.5;
        this.endPosition.y = fullScreenY * 0.5 + scaleY * 0.5;

        this.system.setScale(scaleX, scaleY);
        this.circles.setScale(scaleX, scaleY);
    }
}

class FPSMeter {

    constructor() {
        this.frames = 0;
        this.duration = 500;
        this.now = performance.now();
        this.lastTime = this.now;
        this.isEnabled = true;

        this.update = this.update.bind(this);

        this.$view = document.createElement('div');
        this.$view.style.position = 'fixed';
        this.$view.style.zIndex = 9999;
        this.$view.style.top = 0;
        this.$view.style.left = 0;
        this.$view.style.backgroundColor = '#FFFFFF';
        this.$view.style.textTransform = 'uppercase';
        this.$view.style.display = 'flex';
        this.$view.style.padding = '5px 5px';
        this.$view.style.width = '50px';
        this.$view.style.justifyContent = 'center';
        this.$view.style.alignItems = 'center';
        this.$view.style.color = 'black';
        this.$view.style.fontSize = '10px';
        this.$view.innerHTML = '60 FPS';

        document.body.appendChild(this.$view);
        // this.$view.style.textTransform = 'uppercase';

        emitter.on('frame', this.update);
    }

    enable(isEnabled) {
        if (isEnabled) {
            this.$view.style.display = 'flex';
        } else {
            this.$view.style.display = 'none';
        }

        this.isEnabled = isEnabled;
    }

    update() {
        if (!this.isEnabled) return;

        this.frames++;

        const now = performance.now();
        const delta = (now - this.lastTime);

        // console.log(delta);

        if ( delta > this.duration) {
            const fps = Math.round(this.frames * 1000 / delta);

            const fpsString = fps < 10 ? `0${fps}` : fps;

            this.$view.innerHTML = `${fpsString} FPS`;

            this.lastTime = now;
            this.frames = 0;
        }
    }

    dispose() {
        emitter.off('frame', this.update);

        this.update = null;

        this.frames = null;
        this.duration = null;
        this.now = null;
        this.lastTime = null;
    }

}

const createScript = (src) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.onload = () => {
            resolve();
        };
        script.onerror = (error) => {
            reject(error);
        };
        script.src = src;
        document.body.appendChild(script);
    });
};

function quarticInOut(t) {
  return t < 0.5
    ? +8.0 * Math.pow(t, 4.0)
    : -8.0 * Math.pow(t - 1.0, 4.0) + 1.0
}

var quartInOut = quarticInOut;

class State {

    constructor(id) {
        this.id = id;
        this.entered = false;

        if (typeof this.onGUI === 'function') {
            this.gui = window.gui.addFolder(`STATE ${this.id}`);
        }
    }

    isInBounds() {
        return false;
    }

    onEnter(card) {

        emitter.on('frame', this.updateEvent =  this.update.bind(this));
        
        this.entered = true;
        // console.log(`State ${this.id} :: onEnter`);
    }

    onLeave(card) {
        this.entered = false;

        emitter.off('frame', this.updateEvent);

        // console.log(`State ${this.id} :: onLeave`);
    }

    update() {
        // console.log(`State ${this.id} :: update`);
    }

    resize() {
        
    }

}

// modification of code sample at https://en.wikipedia.org/wiki/Monotone_cubic_interpolation

function createInterpolant (xs, ys) {
  let i;
  const length = xs.length;

  if (length === 1) {
    // Impl: Precomputing the result prevents problems if ys is mutated later and allows garbage collection of ys
    // Impl: Unary plus properly converts values to numbers
    const result = +ys[0];
    return function(x) { return result; };
  }

  // Rearrange xs and ys so that xs is sorted
  const indexes = [];
  for (i = 0; i < length; i++) { indexes.push(i); }
  indexes.sort(function(a, b) { return xs[a] < xs[b] ? -1 : 1; });
  const oldXs = xs;
  const oldYs = ys;
  // Impl: Creating new arrays also prevents problems if the input arrays are mutated later
  xs = []; ys = [];
  // Impl: Unary plus properly converts values to numbers
  for (i = 0; i < length; i++) { xs.push(+oldXs[indexes[i]]); ys.push(+oldYs[indexes[i]]); }
  const dxs = [];
  const ms = [];

  for (let i = 0; i < length - 1; i++) {
    const dx = xs[i + 1] - xs[i];
    const dy = ys[i + 1] - ys[i];
    dxs.push(dx); ms.push(dy/dx);
  }

  // Get degree-1 coefficients
  const c1s = [ms[0]];
  for (i = 0; i < dxs.length - 1; i++) {
    const m = ms[i];
    const mNext = ms[i + 1];

    if (m * mNext <= 0) {
      c1s.push(0);
    } else {
      const dx_ = dxs[i];
      const dxNext = dxs[i + 1];
      const common = dx_ + dxNext;
      c1s.push(3 * common / ((common + dxNext) / m + (common + dx_) / mNext));
    }
  }
  c1s.push(ms[ms.length - 1]);

  // Get degree-2 and degree-3 coefficients
  const c2s = [];
  const c3s = [];
  for (i = 0; i < c1s.length - 1; i++) {
    const c1 = c1s[i];
    const m_ = ms[i];
    const invDx = 1/dxs[i];
    const common_ = c1 + c1s[i + 1] - m_ - m_;
    c2s.push((m_ - c1 - common_)*invDx);
    c3s.push(common_*invDx*invDx);
  }

  // Return interpolant function
  return function evaluateCubicSpline (x) {
    // The rightmost point in the dataset should give an exact result
    let i = xs.length - 1;

    if (x == xs[i]) { return ys[i]; }

    // Search for the interval x is in, returning the corresponding y if x is one of the original xs
    let low = 0;
    let mid;
    let high = c3s.length - 1;

    while (low <= high) {
      mid = Math.floor(0.5*(low + high));
      const xHere = xs[mid];

      if (xHere < x) { low = mid + 1; }
      else if (xHere > x) { high = mid - 1; }
      else { return ys[mid]; }
    }

    i = Math.max(0, high);

    // Interpolate
    const diff = x - xs[i];
    const diffSq = diff * diff;
    return ys[i] + c1s[i] * diff + c2s[i] * diffSq + c3s[i] * diff * diffSq;
  };
}

var monotoneCubicSpline = createInterpolant;

// modification of https://github.com/morganherlocker/cubic-spline
// preprocess the naturalKs once for performances and return an evaluate function

function getNaturalKs (xs, ys, ks) {
  const n = xs.length - 1;
  const A = zerosMat(n+1, n+2);

  for(let i=1; i<n; i++)  // rows
  {
    A[i][i-1] = 1/(xs[i] - xs[i-1]);
    A[i][i] = 2 * (1/(xs[i] - xs[i-1]) + 1/(xs[i+1] - xs[i])) ;
    A[i][i+1] = 1/(xs[i+1] - xs[i]);
    A[i][n+1] = 3*( (ys[i]-ys[i-1])/((xs[i] - xs[i-1])*(xs[i] - xs[i-1]))  +  (ys[i+1]-ys[i])/ ((xs[i+1] - xs[i])*(xs[i+1] - xs[i])) );
  }

  A[0][0] = 2/(xs[1] - xs[0]);
  A[0][1] = 1/(xs[1] - xs[0]);
  A[0][n+1] = 3 * (ys[1] - ys[0]) / ((xs[1]-xs[0])*(xs[1]-xs[0]));

  A[n][n-1] = 1/(xs[n] - xs[n-1]);
  A[n][n] = 2/(xs[n] - xs[n-1]);
  A[n][n+1] = 3 * (ys[n] - ys[n-1]) / ((xs[n]-xs[n-1])*(xs[n]-xs[n-1]));

  return solve(A, ks);
}


function solve (A, ks) {
  const m = A.length;

  for(let k=0; k<m; k++)  // column
  {
    // pivot for column
    let i_max = 0;
    let vali = Number.NEGATIVE_INFINITY;

    for(let i=k; i<m; i++) if(A[i][k]>vali) { i_max = i; vali = A[i][k];}
    swapRows(A, k, i_max);

    // for all rows below pivot
    for(let i=k+1; i<m; i++)
    {
      for(let j=k+1; j<m+1; j++) {
        A[i][j] = A[i][j] - A[k][j] * (A[i][k] / A[k][k]);
      }

      A[i][k] = 0;
    }
  }

  for(let i=m-1; i>=0; i--) // rows = columns
  {
    const v = A[i][m] / A[i][i];
    ks[i] = v;
    for(let j=i-1; j>=0; j--) // rows
    {
      A[j][m] -= A[j][i] * v;
      A[j][i] = 0;
    }
  }
  return ks;
}

function zerosMat (r,c) {
  const A = [];
  for(let i=0; i<r; i++) {
    A.push([]);
    for(let j=0; j<c; j++) A[i].push(0);
  }
  return A;
}

function swapRows (m, k, l) {
  const p = m[k];
  m[k] = m[l];
  m[l] = p;
}

var customCubicSpline = function cubicSpline (xs, ys) {
  const ks = getNaturalKs(xs, ys, new Array(xs.length));

  return function evaluateCubicSpline (x) {
    let i = 1;
    while (xs[i] < x) i++;
    const t = (x - xs[i - 1]) / (xs[i] - xs[i - 1]);
    const a = ks[i - 1] * (xs[i] - xs[i - 1]) - (ys[i] - ys[i - 1]);
    const b = -ks[i] * (xs[i] - xs[i - 1]) + (ys[i] - ys[i - 1]);
    return (1 - t) * ys[i - 1] + t * ys[i] + t * (1 - t) * (a * (1 - t) + b * t);
  };
};

class FakeRaycast {

	constructor(){

		this.camera = Globals.get('camera');

		this.geo = new THREE.PlaneBufferGeometry(100,100,1,1);
		this.mesh = new THREE.Mesh(this.geo);
		this.mesh.frustumCulled = false;
		this.scene = new THREE.Scene();

		this.scene.add(this.mesh);

		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();

	}

	getAbsoluteCoord(x,y,z){
		this.mouse.x = x;
		this.mouse.y = y;
		this.mesh.position.z = z;
		this.mesh.quaternion.copy(this.camera.quaternion);

		this.raycaster.setFromCamera( this.mouse, this.camera );
		var intersects = this.raycaster.intersectObjects( this.scene.children );

		if(intersects.length > 0){

			return intersects[0].point
		}

		else{

			return null
		}
	}

	getCoord(x,y,z){

		this.setMouse(x,y);
		this.mesh.position.z = z;
		this.mesh.quaternion.copy(this.camera.quaternion);

		this.raycaster.setFromCamera( this.mouse, this.camera );
		var intersects = this.raycaster.intersectObjects( this.scene.children );

		if(intersects.length > 0){

			return intersects[0].point
		}

		else{

			return null
		}
	}

	setMouse(x,y) {
		// calculate mouse position in normalized device coordinates
		// (-1 to +1) for both components

		this.mouse.x =   ( x / window.innerWidth ) * 2 - 1;
		this.mouse.y = - ( y / window.innerHeight ) * 2 + 1;

	}


	setDepth(z){

		this.depth = z;
	}
}

let tempVector ;
let tempObj    ;

function toscreenposition(x,y,z, camera){

    if(tempVector == null){

      tempVector = new THREE.Vector3();
      tempObj = new THREE.Object3D();
    }

	  tempVector.set(0,0,0);
    tempObj.position.set(x, y, z);
   	var widthHalf = 0.5*window.innerWidth;
   	var heightHalf = 0.5*window.innerHeight;
   	tempObj.updateMatrixWorld();

   	tempVector.setFromMatrixPosition(tempObj.matrixWorld);
   	tempVector.project(camera);

   	tempVector.x = ( tempVector.x * widthHalf ) + widthHalf;
   	tempVector.y = - ( tempVector.y * heightHalf ) + heightHalf;

   	return { 
       x: tempVector.x,
       y: tempVector.y
   	};
}

class HeroState extends State {

    constructor() {


        super('hero');

        this.resized = 0;

        window.hero = this;

        this.isLandscape = null;

        // this.debugInsert = document.createElement('div')
        // this.debugInsert.className ='debugInsert'
        // this.debugInsert.style.top = '0px'
        // this.debugInsert.style.position = 'fixed'
        // this.debugInsert.style.left = '0px'
        // this.debugInsert.style.zIndex = '1000'

        // document.body.appendChild(this.debugInsert)


        this.fakeRay = new FakeRaycast();

        // const startY = this.computeStartY();

        this.firstCompute = true;
        this.firstComputeValue = 0;

        this.startPosition = new THREE.Vector3(0, 0, 0);
        // this.startPosition = new THREE.Vector3(0, -2, 0);
        this.endPosition = new THREE.Vector3(0.57, 1.65, 1);

        this.startRotation = new THREE.Euler(-0.35, 0.45, 0.26, 'XYZ');
        this.endRotation = new THREE.Euler(-0.2, 0.29, 0.12, 'XYZ');

        this.isFirstTime = true;
        this.displayDelay = 500;
        this.displayDuration = 1000;
        this.displayTime = 0;
        this.displaying = false;

        Mouse.ortho.x = Mouse.ortho.sx = 0.5;
        Mouse.ortho.y = Mouse.ortho.sy = 0.5;

        this.onGUI();

        this.keyPoints = [];
        this.rotationXPoints    = [0,-0.35,-0.2];
        this.rotationYPoints    = [0,0.45,0.29];
        this.rotationZPoints    = [0,0.26,0.12];

        this.keyLength = this.rotationXPoints.length;
        for (let i = 0; i < this.keyLength; i++) {
            this.keyPoints[i] = i;
        }

       
        this.rotationXSpline        = monotoneCubicSpline(this.keyPoints, this.rotationXPoints);
        this.rotationYSpline        = monotoneCubicSpline(this.keyPoints, this.rotationYPoints);
        this.rotationZSpline        = monotoneCubicSpline(this.keyPoints, this.rotationZPoints);


    }

    isInBounds() {
        return Scroll.position.sy < Globals.get('hero.bounds').height * 0.5;
    }

    onGUI() {
        this.gui.add(Mouse.ortho, 'ease', 0, 0.2).step(0.01).name('mouseEase');

        this.gui.add(this.endRotation, 'x', -2 * Math.PI, 2 * Math.PI).step(0.01).name('endRX');
        this.gui.add(this.endRotation, 'y', -2 * Math.PI, 2 * Math.PI).step(0.01).name('endRY');
        this.gui.add(this.endRotation, 'z', -2 * Math.PI, 2 * Math.PI).step(0.01).name('endRZ');

        this.gui.add(this.endPosition, 'x', -2, 2).step(0.01).name('endPX');
        this.gui.add(this.endPosition, 'y', -2, 2).step(0.01).name('endPY');
        this.gui.add(this.endPosition, 'z', -2, 2).step(0.01).name('endPZ');
    }

    onEnter() {


        let card = Globals.get('card');


        
        super.onEnter();

        if (!this.isFirstTime) {
            this.isFirstTime = true;
            this.displayTime = Date.now();
            this.displaying = true;
        }

        card.front.renderOrder = 10;
        card.back.renderOrder = 10;
        card.shadow.renderOrder = 10;
        card.front.material.depthTest = false;
        card.back.material.depthTest = false;
        card.shadow.material.depthTest = false;

        

    }

    onLeave(){
        let card = Globals.get('card');
        card.updateShadow();
        card.setShadowOpacity(0);
        super.onLeave();


    }
    update() {
        if (!this.entered) return;

        let card = Globals.get('card');

        const displayDelta = window.NOW - this.displayTime - this.displayDelay;
        const displayProgress = clamp(displayDelta / this.displayDuration, 0, 1);
        const displayProgressEased = quartInOut(displayProgress);

        const opacity = displayProgressEased;
        card.front.material.uniforms.opacity.value = opacity;
        card.back.material.uniforms.opacity.value = opacity;

        // display rotation
       
        const heroBounds = Globals.get('hero.bounds');
        const start = heroBounds.top;
        const end = heroBounds.top + heroBounds.height * 0.5;

        const progress = clamp(Scroll.position.sy - start, 0, end) / (end - start);

        // const Mix = function mix(min, max, value) {
        //     return min * (1 - value) + max * value
        // }
        // const y = map(progress, 0, 1, this.startPosition.y, this.endPosition.y);
        // const y = map(progress, 0, 1, this.startPosition.y, this.endPosition.y);

        var y = this.mix(this.startPosition.y, 1.65, progress);
        // console.log(y)

        card.front.position.x = 0;
        card.front.position.y = y;
        card.front.position.z = 0;



        const rx = this.rotationXSpline(progress * (this.keyLength - 1) );
        const ry = this.rotationYSpline(progress * (this.keyLength - 1) );
        const rz = this.rotationZSpline(progress * (this.keyLength - 1) );

        card.front.rotation.x = rx;
        card.front.rotation.y = ry;
        card.front.rotation.z = rz;


        card.back.position.copy(card.front.position);
        card.back.rotation.copy(card.front.rotation);

        card.updateShadow();
        card.setShadowOpacity(opacity);

    }

    computeStartY() {

        if(this.anchor == null){
            this.anchor = document.querySelector('.description');
        }

        let card = Globals.get('card');

        let screenPosOfCard    = toscreenposition(
            card.front.position.x,
            card.front.position.y,
            card.front.position.z,
            Globals.get('camera')
        );
        let screenPosOfCardTop = toscreenposition(
            card.front.position.x,
            card.front.position.y - 0.5 * card.front.scale.y,
            card.front.position.z,
            Globals.get('camera')
        );

        let diffCard = screenPosOfCard.y - screenPosOfCardTop.y;


        let top = this.offset(this.anchor);

        let decalY  = -80 + diffCard;
        let cTop = top;
        let pointY = 0;

        // first compute and with motion

        if(this.firstCompute && document.querySelector('html').classList.contains('disable-motion') == false ){

            cTop -= 100;

            this.firstComputeValue = cTop;

            this.firstCompute = false;

        }


        cTop -= decalY;

        let point =  this.fakeRay.getCoord(0,cTop,0);

        if(point != null){

            pointY = point.y;
        }  

        return pointY
       

    }

    mix(min, max, value) {
        return min * (1 - value) + max * value
    }

    offset(el) {
        var rect = el.getBoundingClientRect(),
        scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        return rect.bottom + scrollTop
    }

    resize() {

        // const isLandscape = window.innerWidth > window.innerHeight

        // const isMobile = Globals.get('mobile-webgl')

        // this.debugInsert.innerHTML = window.screen.height + ' ' + this.resized 

        this.startPosition.y = this.computeStartY();

        // this.resized++

        // this.isLandscape = isLandscape


        // console.log(window.screen.height)
        // this.startPosition.y = this.computeStartY();
    }
}

const Remap = function remap(inMin, inMax, outMin, outMax, value) {

   return Mix(outMin, outMax, Smoothstep(inMin, inMax, value) );
   
};

class FeeState extends State {

    constructor() {
        super('fee');


        const isMobile = Globals.get('mobile-webgl');

        this.endRemap = 1.5;


        if(isMobile){

            this.endRemap = 1.5;
        }

        // this.mouseAngle = -Math.PI * 0.15;
       

        this.startPosition = new THREE.Vector3(0, 0, 0); // this gets updated by previous state
        this.endPosition = new THREE.Vector3(0, 0, 0);

        this.startRotation = new THREE.Euler(-0.2, 0.29, 0.12, 'XYZ');
        this.endRotation = new THREE.Euler(degToRad(-5), degToRad(6), degToRad(-100), 'XYZ');

        this.billsData = [
            [
                {
                    startPosition: new THREE.Vector3(0, 0, -1.2),
                    endPosition: new THREE.Vector3(-2.4, -1, -1.2),
                    startAngle: 0,
                    endAngle: 0.75,
                    startScale: 0.7,
                    endScale: 0.8,
                    delay: 0.35,
                    speed: 1,
                },
                {
                    startPosition: new THREE.Vector3(0, 0, -1.05),
                    endPosition: new THREE.Vector3(-2.05, -0.02, -1.05),
                    startAngle: 0,
                    endAngle: 0.53,
                    startScale: 0.7,
                    endScale: 0.9,
                    delay: 0.45,
                    speed: 1,
                },
                {
                    startPosition: new THREE.Vector3(0, 0, -1),
                    endPosition: new THREE.Vector3(-1.5, 0.25, -1),
                    startAngle: 0,
                    endAngle: Math.PI * 0.1,
                    startScale: 0.7,
                    endScale: 1,
                    delay: 0.7,
                    speed: 1,
                },
                {
                    startPosition: new THREE.Vector3(0, 0, -1.08),
                    endPosition: new THREE.Vector3(-0.8, 0.8, -1.08),
                    startAngle: 0,
                    endAngle: 0.15,
                    startScale: 0.7,
                    endScale: 0.8,
                    delay: 0.5,
                    speed: 1,
                },
                {
                    startPosition: new THREE.Vector3(0, 0, -1.2),
                    endPosition: new THREE.Vector3(-2.84, 2, -1.3),
                    startAngle: 0,
                    endAngle: 0.45,
                    startScale: 0.7,
                    endScale: 0.8,
                    delay: 0.1,
                    speed: 1,
                },
                {
                    startPosition: new THREE.Vector3(0, 0, -1.7),
                    endPosition: new THREE.Vector3(-3.08, 0.25, -1.7),
                    startAngle: 0,
                    endAngle: 0.87,
                    startScale: 0.7,
                    endScale: 0.8,
                    delay: 0,
                    speed: 1,
                },
            ],
            [
                {
                    endPosition: new THREE.Vector3(0, 0, -1.2),
                    endAngle: 0,
                    endScale: 0.7,
                    delay: 0,
                },
                {
                    endPosition: new THREE.Vector3(0, 0, -1.05),
                    endAngle: 0,
                    endScale: 0.7,
                    delay: 0,
                },
                {
                    endPosition: new THREE.Vector3(0, 0, -1),
                    endAngle: 0,
                    endScale: 0.7,
                    delay: 0,
                },
                {
                    endPosition: new THREE.Vector3(0, 0, -1.08),
                    endAngle: 0,
                    endScale: 0.7,
                    delay: 0,
                },
                {
                    endPosition: new THREE.Vector3(0, 0, -1.3),
                    endAngle: 0,
                    endScale: 0.7,
                    delay: 0,
                },
                {
                    endPosition: new THREE.Vector3(0, 0, -1.7),
                    endAngle: 0,
                    endScale: 0.7,
                    delay: 0,
                },
            ]
        ];

        this.onGUI();
    }

    isInBounds() {

        const heroBounds = Globals.get('hero.bounds');
        const bounds = Globals.get('fee.bounds');
        const isMobile = Globals.get('mobile-webgl');

        if(isMobile){

            var displace = Globals.get('displace-mobile-fee');

            return Scroll.position.sy >= heroBounds.height * 0.5 && Scroll.position.sy < (bounds.top + bounds.height - window.innerHeight - displace);
        }
        else{

            return Scroll.position.sy >= heroBounds.height * 0.5 && Scroll.position.sy < (bounds.top + bounds.height - window.innerHeight);
            
        }

    }

    onEnter() {
        super.onEnter();

        let card = Globals.get('card');

        card.front.renderOrder = 10;
        card.back.renderOrder = 10;
        card.shadow.renderOrder = 10;
        card.front.material.depthTest = false;
        card.back.material.depthTest = false;
        card.shadow.material.depthTest = false;

        card.setShadowOpacity(1);


        if (Scroll.direction.y > 0) {

            // this.startRotation.copy(card.front.rotation);
            // card.back.rotation.copy(card.front.rotation);

            this.keyPoints = [];
            this.verticalKeysPoints = [card.front.position.y,card.front.position.y + 0.4, this.endPosition.y];
            
            this.rotationXPoints    = [this.startRotation.x,0, this.endRotation.x];
            this.rotationYPoints    = [this.startRotation.y,this.startRotation.y,   this.endRotation.y];
            this.rotationZPoints    = [this.startRotation.z,-0.13, this.endRotation.z];
            
            this.keyLength = this.verticalKeysPoints.length;
            for (let i = 0; i < this.keyLength; i++) {
                this.keyPoints[i] = i;
            }
            this.verticalParallaxSpline = customCubicSpline(this.keyPoints, this.verticalKeysPoints);
            this.rotationXSpline        = monotoneCubicSpline(this.keyPoints, this.rotationXPoints);
            this.rotationYSpline        = monotoneCubicSpline(this.keyPoints, this.rotationYPoints);
            this.rotationZSpline        = monotoneCubicSpline(this.keyPoints, this.rotationZPoints);

        } else {
            card.front.rotation.copy(this.endRotation);
            card.back.rotation.copy(card.front.rotation);
        }

      

    }

    onLeave() {
        super.onLeave();

        let card = Globals.get('card');

        card.front.renderOrder = 0;
        card.back.renderOrder  = 0;
        card.shadow.renderOrder  = 0;
        card.front.material.depthTest = true;
        card.back.material.depthTest = true;
        card.shadow.material.depthTest = true;
    }

    onGUI() {
        this.gui.add(this.endRotation, 'x', -2 * Math.PI, 2 * Math.PI).step(0.01);
        this.gui.add(this.endRotation, 'y', -2 * Math.PI, 2 * Math.PI).step(0.01);
        this.gui.add(this.endRotation, 'z', -2 * Math.PI, 2 * Math.PI).step(0.01);

        for (let i = 0; i < this.billsData.length; i++) {
            const data = this.billsData[i];
            const name = i === 0 ? 'display' : 'hide';
            const gui = this.gui.addFolder(name);

            for (let j = 0; j < data.length; j++) {
                const guiBill = gui.addFolder(`bill${j}`);

                Object.keys(data[j]).map(k => {
                    const param = data[j][k];

                    if (param.isVector3) {
                        guiBill.add(param, 'x', -10, 10).name(`${k} x`);
                        guiBill.add(param, 'y', -10, 10).name(`${k} y`);
                        guiBill.add(param, 'z', -10, 10).name(`${k} z`);
                    } else {
                        const range = k.includes('Angle') ? [-Math.PI, Math.PI] : [0, 1];

                        guiBill.add(data[j], k, range[0], range[1]);
                    }
                });
            }
        }
    }

    update() {

        let card = Globals.get('card');
        let bills = Globals.get('bills');

        this.updateCard(card, bills);
        this.updateBills(bills, card);
    }

    updateCard(card, bills) {

        const heroBounds = Globals.get('hero.bounds');
        const feeBounds = Globals.get('fee.bounds');

        const isMobile = Globals.get('mobile-webgl');

        const top = heroBounds.height * 0.5;
        var bottom = feeBounds.top;


        if(isMobile){
            bottom -= Globals.get('displace-mobile-fee');
        }

        let p = map$1(Scroll.position.sy, top, bottom, 0, 1);


        if (p >= 0 && p <= this.endRemap) {

            const pEased = quartOut(Remap(0, this.endRemap, 0, 1, p));

            this.targetPosition = pEased;

            card.front.position.x = 0;
            card.front.position.y = this.verticalParallaxSpline(pEased * (this.keyLength - 1));
            card.front.position.z = 0;

            const rx = this.rotationXSpline(pEased * (this.keyLength - 1) ); 
            const ry = this.rotationYSpline(pEased * (this.keyLength - 1) ); 
            const rz = this.rotationZSpline(pEased * (this.keyLength - 1) );

            card.front.rotation.x = rx;
            card.front.rotation.y = ry;
            card.front.rotation.z = rz;
    
            card.back.position.copy(card.front.position);
            card.back.rotation.copy(card.front.rotation);

            card.updateShadow();


        }

    }

    updateBills(bills, card) {
        // bills.container.visible = this.entered;

        const heroBounds = Globals.get('hero.bounds');
        const feeBounds = Globals.get('fee.bounds');
        const globalBounds = Globals.get('global.bounds');
        const isMobile = Globals.get('mobile-webgl');

        var displayTop = feeBounds.top - 90;
        var displayBottom = feeBounds.top + feeBounds.height - window.innerHeight - feeBounds.height * 0.25;

        var hideTop = feeBounds.top + feeBounds.height - window.innerHeight - feeBounds.height * 0.25;
        var hideBottom = feeBounds.top + feeBounds.height - window.innerHeight;


        if(isMobile){

            var displace = Globals.get('displace-mobile-fee');
            displayTop -=  displace;
            displayBottom -=  displace;
            hideTop -= displace;
            hideBottom -= displace;

        }




        const inDisplay = between(Scroll.position.sy, displayTop, displayBottom);
        const inHide = between(Scroll.position.sy, hideTop, hideBottom);

        // console.log(inDisplay)

        if (Scroll.position.sy > hideBottom || Scroll.position.sy < displayTop) {
            bills.container.visible = false;
        } else {
            bills.container.visible = true;
        }

        if (inDisplay || inHide) {
            const data = inDisplay ? this.billsData[0] : this.billsData[1];
            const easing = inDisplay ? quartOut : quartInOut;
            // const easing = easeInOut;

            let progress = inDisplay ? map$1(Scroll.position.sy, displayTop, displayBottom, 0, 1) : map$1(Scroll.position.sy, hideTop, hideBottom, 0, 1);

            // console.log(progress)

            for (let i = 0; i < data.length; i++) {
                const startPosition = inDisplay ? data[i].startPosition : this.billsData[0][i].endPosition;
                const startAngle = inDisplay ? data[i].startAngle : this.billsData[0][i].endAngle;
                const startScale = inDisplay ? data[i].startScale : this.billsData[0][i].endScale;

                const { endPosition, endAngle, endScale, delay } = data[i];

                let p = map$1(progress - delay, 0, 1 - delay, 0, 1);
                p = clamp(p, 0, 1);
                p = easing(p);

                const position = mix(startPosition, endPosition, p);
                const angle = mix(startAngle, endAngle, p);
                const scale = mix(startScale, endScale, p) * 5.5 * bills.globalScale;

                const mesh = bills.bills[i];
                mesh.position.set(position.x, position.y, position.z);
                mesh.scale.set(scale * mesh.scaling.x, scale * mesh.scaling.y, 1);
                mesh.rotation.z = angle;

                if ( i < 4 ) {
                    const shadow = bills.shadows[i];
                    shadow.position.copy(mesh.position);
                    shadow.position.z -= 0.01;
                    shadow.scale.copy(mesh.scale).multiplyScalar(1.12);
                    shadow.rotation.copy(mesh.rotation);
                }
            }   

            const shadowOpacity = inHide ? 1 - progress : undefined;
            card.setShadowOpacity(shadowOpacity);
        }

        if (Scroll.position.sy > hideBottom) {
            card.setShadowOpacity(0);
            card.shadow.visible = false;
        } else if (Scroll.position.sy < hideBottom) {
            card.shadow.visible = true;
        }
    }
}

class GlobalState extends State {

    constructor() {
        super('global');

        const isMobile = Globals.get('mobile-webgl');

        this.card = {
           paths: [
               {
                   // rotation: new THREE.Vector3(0, 0, Math.PI * 0.25),
                   rotation: new THREE.Vector3(0, 0, 0.98),
                   position: new THREE.Vector3(0, 0.3, 0),
                   offset: 0.95,
                   radius: 3,
                   direction: 1,
               },
               {
                   rotation: new THREE.Vector3(Math.PI * 0.1, -0.79, -0.95),
                   position: new THREE.Vector3(0, 0.3, 0),
                   offset: -3,
                   radius: 3,
                   direction: -1,
               },
               {
                   rotation: new THREE.Vector3(0, -0.2, -0.65),
                   position: new THREE.Vector3(0, 0, 0),
                   offset: -2.05,
                   radius: 3,
                   direction: -1,
               },
           ]
        }; 

        if(isMobile){ 

            this.card.paths[0].offset += 0.3;
            this.card.paths[1].offset += 0.3;
        }


        const x = this.computeX();

        this.globe = {
            startPosition: new THREE.Vector3(x, -10, -5),
            middlePosition: new THREE.Vector3(x, 0, -5),
            endPosition: new THREE.Vector3(x, 14, -5),
            startAngle: -Math.PI * 1.5,
            middleAngle: -Math.PI * 0.35,
            endAngle: -Math.PI * 0.35,
        };

        this.onGUI();
    }

    onEnter() {
        super.onEnter();

        this.resize();

        let globe = Globals.get('globe');

        const fromTop = Scroll.direction.y > 0;

        const progress = fromTop ? 0 : 1;

        globe.updatePath(0, progress);
        globe.updatePath(1, progress);
        globe.updatePath(2, progress);


    }

    onLeave() {

        super.onLeave();

        let globe = Globals.get('globe');
        let card = Globals.get('card');
        // card.setDisplacement(0);
        card.reset();
        card.setScale(card.baseScale);
        card.setDisplacement(0);


        card.front.position.copy(globe.container.position);
        card.front.position.z = -8;
        card.back.position.copy(card.front.position);

        if (Scroll.direction.y > 0) {
            card.container.visible = false;
        } else {
            card.container.visible = true;
        }
    }

    onGUI() {
        const $element = document.querySelector('.page-section.global');
        const params = {
            height: $element.offsetHeight,
        };

        // this.gui.add(params, 'height', 0, params.height * 2).step(1).onChange( () => {
        //     $element.style.height = `${params.height}px`;

        //     const rect = $element.getBoundingClientRect();

        //     const values = {
        //         top: rect.top + Scroll.position.y,
        //         bottom: rect.bottom,
        //         left: rect.left,
        //         right: rect.right,
        //         width: rect.width,
        //         height: rect.height,
        //     };

        //     Globals.set('global.bounds', values);
        // })
        // const path = this.card.paths[2];

        // this.gui.add(path, 'offset', -2 * Math.PI, 2 * Math.PI).step(0.01);
        // this.gui.add(path.position, 'x', -1, 1).step(0.01).name('px');
        // this.gui.add(path.position, 'y', -1, 1).step(0.01).name('py');
        // this.gui.add(path.position, 'z', -1, 1).step(0.01).name('pz');
        
        // this.gui.add(path.rotation, 'x', -2 * Math.PI, 2 * Math.PI).step(0.01).name('rx');
        // this.gui.add(path.rotation, 'y', -2 * Math.PI, 2 * Math.PI).step(0.01).name('ry');
        // this.gui.add(path.rotation, 'z', -2 * Math.PI, 2 * Math.PI).step(0.01).name('rz');
    }

    isInBounds() {
        const feeBounds = Globals.get('fee.bounds');
        const globalBounds = Globals.get('global.bounds');

        // console.log('top global to cashback :', (globalBounds.top + globalBounds.height - window.innerHeight * 0.5))
        const isMobile = Globals.get('mobile-webgl');
   
       
        if(isMobile){

            return Scroll.position.sy 
                    >= (globalBounds.top) - Globals.get('displace-globe') 
                && Scroll.position.sy 
                    < (globalBounds.top + globalBounds.height - window.innerHeight * 0.5) - Globals.get('displace-end-globe');

        }
        else{

            return Scroll.position.sy >= (globalBounds.top) && Scroll.position.sy < (globalBounds.top + globalBounds.height - window.innerHeight * 0.5);

        }

    }

    update() {
        // if (!this.entered) return;

        let globe = Globals.get('globe');
        let card = Globals.get('card');

        
        const feeBounds = Globals.get('fee.bounds');
        const globalBounds = Globals.get('global.bounds');

        // handle globe progress
        var globeDisplayTop = globalBounds.top - globalBounds.height * 0.2;
        var globeDisplayBottom = globalBounds.top;
        var globeMiddleTop = globeDisplayBottom;
        var globeMiddleBottom = globalBounds.top + globalBounds.height * 0.5;
        var globeHideTop = globeMiddleBottom;
        var globeHideBottom = globeMiddleBottom + globalBounds.height * 0.5;

        const isMobile = Globals.get('mobile-webgl');
        var displace = Globals.get('displace-globe'); 
        var displace2 = Globals.get('displace-end-globe'); 

        if(isMobile){

            globeDisplayTop -= displace;
            globeDisplayBottom -= displace;
            globeMiddleTop -= displace;
            globeMiddleBottom -= displace2;
            globeHideTop -= displace2;
            globeHideBottom -= displace2;
        }

        // compute values for card animation 
        let progressMiddle = map$1(Scroll.position.sy, globeMiddleTop, globeMiddleBottom, 0, 1);

        if (this.entered) {
    
            if (Scroll.position.sy >= globeMiddleTop && Scroll.position.sy < globeMiddleBottom) {
                progressMiddle = clamp(progressMiddle, 0, 1);
        
                let p1 = map$1(progressMiddle, 0., 0.25, 0., 1);
                p1 = clamp(p1, 0, 1);

                let p2 = map$1(progressMiddle, 0.25, 0.5, 0., 1);
                p2 = clamp(p2, 0, 1);

                let p3 = map$1(progressMiddle, 0.5, 0.75, 0., 1);
                p3 = clamp(p3, 0, 1);
        
                const isP1 = progressMiddle <= 0.25;
                const isP2 = progressMiddle > 0.25 && progressMiddle <= 0.5;
                const progressCard = isP1 ? p1 : (isP2 ? p2 : p3);
                const pathCard = isP1 ? this.card.paths[0] : (isP2 ? this.card.paths[1] : this.card.paths[2]);
    
                globe.updatePath(0, p1);
                globe.updatePath(1, p2);
                globe.updatePath(2, p3);

                this.updateCardPath(card, pathCard, progressCard, globe);
            } else if (this.entered && Scroll.position.sy >= globeMiddleBottom ) ; else if (this.entered && Scroll.position.sy < globeMiddleTop ) {
                card.reset();
    
                card.setDisplacement(0.0);
            }
        }

        var globeBounds = {
            displayTop: globeDisplayTop,
            displayBottom: globeDisplayBottom,
            middleTop: globeMiddleTop,
            middleBottom: globeMiddleBottom,
            hideTop: globeHideTop,
            hideBottom: globeHideBottom,
        };

        this.globeBounds = globeBounds;

        this.updateGlobe(globe, globeBounds);

        
    }

    updateCardPath(card, path, progress, globe) {
        const { offset, rotation, position, direction, radius } = path;

        card.cardAxis.position.copy(globe.container.position).add(position);

        const isMobile = Globals.get('mobile-webgl');

        const angle = (2 * Math.PI * progress + offset);

        card.cardContainer.rotation.x = 0;
        card.cardContainer.rotation.y = -Math.PI * 0.5;
        card.cardContainer.rotation.z = angle * direction;

        card.cardAxis.rotation.x = rotation.x;
        card.cardAxis.rotation.y = rotation.y;
        card.cardAxis.rotation.z = rotation.z;


        card.setScale(card.worldScale);
        card.setDisplacement(0.1);

        const p = new THREE.Vector3(0, globe.mesh.scale.y + 0.2, 0);
        card.front.position.copy(p);
        card.back.position.copy(card.front.position);

        const r = new THREE.Euler(-Math.PI * 0.5, 0, Math.PI, 'XYZ');
        card.front.rotation.copy(r);
        card.back.rotation.copy(card.front.rotation);
    }

    updateGlobe(globe, bounds) {

        let card = Globals.get('card');

        globe.container.visible = this.entered;

        const { 
            displayTop,
            displayBottom,
            middleTop, 
            middleBottom, 
            hideTop, 
            hideBottom
        } = bounds;

        const inDisplay = between(Scroll.position.sy, displayTop, displayBottom);
        const inMiddle = between(Scroll.position.sy, middleTop, middleBottom);
        const inHide = between(Scroll.position.sy, hideTop, hideBottom);

        if ((inDisplay || inMiddle || inHide) && !globe.container.visible) {
            globe.container.visible = true;
        }

        if (!inDisplay && !inMiddle && !inHide && globe.container.visible) {
            globe.container.visible = false;
        }

        if (inDisplay) {

            // console.log('inDisplay')
            let progress = map$1(Scroll.position.sy, displayTop, displayBottom, 0, 1);
            progress = clamp(progress, 0, 1);

            // const ease = easeOut(progress);
            const ease = progress;

            const x = mix(this.globe.startPosition.x, this.globe.middlePosition.x, ease);
            const y = mix(this.globe.startPosition.y, this.globe.middlePosition.y, ease);
            const z = mix(this.globe.startPosition.z, this.globe.middlePosition.z, ease);

            globe.container.position.set(x, y, z);

            const angle = mix(this.globe.startAngle, this.globe.middleAngle, progress);

            globe.mesh.rotation.y = angle;
        } else if (inMiddle) {

            // console.log('inMiddle')
            // let progress = map(Scroll.position.sy, middleTop, middleBottom, 0, 1);
            // progress = clamp(progress, 0, 1);

            globe.container.position.set(this.globe.middlePosition.x, this.globe.middlePosition.y, this.globe.middlePosition.z);
            globe.mesh.rotation.y = this.globe.middleAngle;
        } else if (inHide) {

            // console.log('inHide')
            let progress = map$1(Scroll.position.sy, hideTop, hideBottom, 0, 1);

            progress = clamp(progress, 0, 1);


            // const ease = easeIn(progress);
            const ease = progress;

            const x = mix(this.globe.middlePosition.x, this.globe.endPosition.x, ease);
            const y = mix(this.globe.middlePosition.y, this.globe.endPosition.y, ease);
            const z = mix(this.globe.middlePosition.z, this.globe.endPosition.z, ease);

            globe.container.position.set(x, y, z);


            const angle = mix(this.globe.middleAngle, this.globe.endAngle, progress);
            globe.mesh.rotation.y = angle;

        }

        if(this.isInBounds()){
            if(inHide){
                card.container.visible = false;
            }
            else{
                card.container.visible = true;
            }
        }
       

        globe.pathsContainer.rotation.y = globe.mesh.rotation.y;
    }

    reversePosition(scroll){

        let card = Globals.get('card');

        this.update();

        const { 
            displayTop,
            displayBottom,
            middleTop, 
            middleBottom, 
            hideTop, 
            hideBottom
        } = this.globeBounds;

        const inDisplay = between(Scroll.position.sy, displayTop, displayBottom);
        const inMiddle = between(Scroll.position.sy, middleTop, middleBottom);
        const inHide = between(Scroll.position.sy, hideTop, hideBottom);

      
        let progress = map$1(scroll, hideTop, hideBottom, 0, 1);

        progress = clamp(progress, 0, 1);


        // const ease = easeIn(progress);
        const ease = progress;

        const x = mix(this.globe.middlePosition.x, this.globe.endPosition.x, ease);
        const y = mix(this.globe.middlePosition.y, this.globe.endPosition.y, ease);
        const z = mix(this.globe.middlePosition.z, this.globe.endPosition.z, ease);

        
        return {
            x: x,
            y: y,
            z: z
        }

      
    }

    computeX() {
        const maxWidth = 1047;

       
        let screenPos = 0;

        if (window.innerWidth > maxWidth) {
            screenPos = maxWidth * 0.35;
        } else {
            screenPos = (window.innerWidth) * 0.35;
        }

        var x = (screenPos / (window.innerWidth * 0.5)) * Globals.get('fullscreen.x') * 0.5;

        const isMobile = Globals.get('mobile-webgl');

        if(isMobile){
            x = 0;
        }


        return x;
    }

    resize() {
        const x = this.computeX();

        this.globe.startPosition.x = x;
        this.globe.middlePosition.x = x;
        this.globe.endPosition.x = x;
    }
}

class FeeToGlobalState extends State {

    constructor() {
        super('feeToGlobal');

        this.coords = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(1, -2, -3),
            new THREE.Vector3(2, -2, -3),
            new THREE.Vector3(3.5, 0, -4),
            new THREE.Vector3(4, 2, -5),
            new THREE.Vector3(3, 4, -8),
            new THREE.Vector3(1, 4, -10),
            new THREE.Vector3(0, 2, -15),
            new THREE.Vector3(1, 0, -12),
            new THREE.Vector3(4, -1, -10)

        ];

        const isMobile = Globals.get('mobile-webgl');

        if(isMobile){

            this.coords = [
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(1, -2, -3),
                new THREE.Vector3(2, -2, -3),
                new THREE.Vector3(3.5, -1, -4),
                new THREE.Vector3(4, 0, -5),

                new THREE.Vector3(3.5, 2, -8),

                new THREE.Vector3(2.8, 2, -10),

                new THREE.Vector3(1.7, 2, -15),
                new THREE.Vector3(0.7, 0, -12),
                new THREE.Vector3(0, -1, -10)

            ];
        }


        this.curve = new THREE.CatmullRomCurve3(this.coords); 



        this.rotationCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-5, 6, -100),
            new THREE.Vector3(-59, 6, -6),
            new THREE.Vector3(-44, -160, -20),
            new THREE.Vector3(-32, -205, -37),
            new THREE.Vector3(-27, -171, -135.28),
            new THREE.Vector3(-27, -171, -135.28),
        ]);

        // this.onGUI();

        this.debugging = false;

        if (this.debugging) {
            this.debug();
        }
    }

    isInBounds() {
        const feeBounds = Globals.get('fee.bounds');
        const globalBounds = Globals.get('global.bounds');

        const isMobile = Globals.get('mobile-webgl');

        var displace = Globals.get('displace-mobile-fee');
        var displaceglobe = Globals.get('displace-globe');

        if(isMobile){

            return Scroll.position.sy >= (feeBounds.top + feeBounds.height - window.innerHeight) - displace && Scroll.position.sy < globalBounds.top - displaceglobe;
        }
        else{

            return Scroll.position.sy >= (feeBounds.top + feeBounds.height - window.innerHeight) && Scroll.position.sy < globalBounds.top;
            
        }

    }

    onEnter() {

        let card = Globals.get('card');
        super.onEnter();
        // card.reset();
        card.setScale(card.baseScale);

        if (this.debugging) {
            card.container.parent.add(this.curveObject);
        }

        if (Scroll.direction.y > 0) {
            const position = this.curve.getPoint(0);
            card.front.position.copy(position);
            card.back.position.copy(card.front.position);

            const { x, y, z } = this.rotationCurve.getPoint(0);

            card.front.rotation.x = degToRad(x);
            card.front.rotation.y = degToRad(y);
            card.front.rotation.z = degToRad(z);

            card.back.rotation.copy(card.front.rotation);
        } else {
            const position = this.curve.getPoint(1);
            card.front.position.copy(position);
            card.back.position.copy(card.front.position);

            const { x, y, z } = this.rotationCurve.getPoint(1);

            card.front.rotation.x = degToRad(x);
            card.front.rotation.y = degToRad(y);
            card.front.rotation.z = degToRad(z);
            card.back.rotation.copy(card.front.rotation);
        }

    }

    onLeave() {
        super.onLeave();

        let card = Globals.get('card');

        if (Scroll.direction.y > 0) {
            const position = this.curve.getPoint(1);
            card.front.position.copy(position);
            card.back.position.copy(card.front.position);

            const { x, y, z } = this.rotationCurve.getPoint(1);

            card.front.rotation.x = degToRad(x);
            card.front.rotation.y = degToRad(y);
            card.front.rotation.z = degToRad(z);

            card.back.rotation.copy(card.front.rotation);
        } else {
            const position = this.curve.getPoint(0);
            card.front.position.copy(position);
            card.back.position.copy(card.front.position);

            const { x, y, z } = this.rotationCurve.getPoint(0);

            card.front.rotation.x = degToRad(x);
            card.front.rotation.y = degToRad(y);
            card.front.rotation.z = degToRad(z);
            card.back.rotation.copy(card.front.rotation);
        }

        if (this.debugging) {
            card.container.parent.remove(this.curveObject);
        }
    }


    debug() {
        const curveGeometry = new THREE.BufferGeometry().setFromPoints(this.coords);
        const curveMaterial = new THREE.LineBasicMaterial({ color: 0xFF0000 });
        this.curveObject = new THREE.Line(curveGeometry, curveMaterial);
    }

    update() {

        let card = Globals.get('card');
        const feeBounds = Globals.get('fee.bounds');
        const globalBounds = Globals.get('global.bounds');

        var top = feeBounds.top + feeBounds.height - window.innerHeight;
        var bottom = globalBounds.top;

        const isMobile = Globals.get('mobile-webgl');
        // var displace = Globals.get('displace-mobile-fee')

        if(isMobile){
            top -= Globals.get('displace-mobile-fee');
            bottom -= Globals.get('displace-globe');
        }

        let progress = map$1(Scroll.position.sy, top, bottom, 0, 1);


        if (progress >= 0 && progress <= 1) {
            // const position = this.curve.getPointAt(progress);
            const position = this.curve.getPoint(progress);
            card.front.position.copy(position);
            card.back.position.copy(card.front.position);

            const { x, y, z } = this.rotationCurve.getPoint(progress);

            card.front.rotation.x = degToRad(x);
            card.front.rotation.y = degToRad(y);
            card.front.rotation.z = degToRad(z);

            card.back.rotation.copy(card.front.rotation);

            card.updateShadow();
        }
    }

    resize(){


        const isMobile = Globals.get('mobile-webgl');

        if(isMobile){

            const isLandscape = window.innerWidth > window.innerHeight;

            if(isLandscape){

            this.coords[this.coords.length-1] = new THREE.Vector3(0, -0.7, -10);

            }
            else{

                this.coords[this.coords.length-1] = new THREE.Vector3(0, 0.5, -10);

            }

        
        }

        this.curve = new THREE.CatmullRomCurve3(this.coords); 


        //     new THREE.Vector3(2.7, 0.5, -10)
        
    }
}

class GlobalToCashback extends State {

    constructor() {
        super('globalToCashback');


        this.fakeRay = new FakeRaycast();

        this.computedMobilePositionY = 0;
        this.startPosition = this.computeStartPosition();
        this.middlePosition = this.computeMiddlePosition();
        this.endPosition = this.computeEndPosition();

        const isMobile = Globals.get('behave-mobile-webgl');
        const isLandscape = window.innerWidth > window.innerHeight;
        // this.startRotation = new THREE.Euler(-0.6, 0.49, 3.1, 'XYZ');
        // this.endRotation = new THREE.Euler(-0.41, 0.6, 2, 'XYZ');
        this.startRotation = new THREE.Euler(-0.48, 0.56, 3.1, 'XYZ');
        this.endRotation = new THREE.Euler(-0.65, 0.58, 2.08, 'XYZ');
        this.perspective = new THREE.Vector3(-0.11, 0.07, -0.06);

        if(isMobile){

            this.endRotation = new THREE.Euler(-0.65,  0.38, 1.95, 'XYZ');
            this.perspective = new THREE.Vector3(  -0.11, 0.1, 0.11);

        }

        this.axisRotation = new THREE.Euler(0, 0, 0, 'XYZ');

        this.curve = this.computeCurve();

        this.onGUI();
    }

    onEnter() {
        super.onEnter();

        this.resize();

        let card = Globals.get('card');

        if (Scroll.direction.y > 0) {
            card.container.visible = true;
        }

        const isMobile = Globals.get('behave-mobile-webgl');
        if(isMobile){
            this.computedMobilePositionY = this.computeEndYPosition(card);
        }
        this.endPosition = this.computeEndPosition();
    }

    onLeave(card) {
        super.onLeave();
    }

    onGUI() {
        // this.gui.add(this.startRotation, 'x', -2 * Math.PI, 2 * Math.PI).step(0.01);
        // this.gui.add(this.startRotation, 'y', -2 * Math.PI, 2 * Math.PI).step(0.01);
        // this.gui.add(this.startRotation, 'z', -2 * Math.PI, 2 * Math.PI).step(0.01);
        // this.gui.add(this.endRotation, 'x', -2 * Math.PI, 2 * Math.PI).step(0.01);
        // this.gui.add(this.endRotation, 'y', -2 * Math.PI, 2 * Math.PI).step(0.01);
        // this.gui.add(this.endRotation, 'z', -2 * Math.PI, 2 * Math.PI).step(0.01);

        // this.gui.add(this.axisRotation, 'x', -2 * Math.PI, 2 * Math.PI).name('axis x').step(0.01);
        // this.gui.add(this.axisRotation, 'y', -2 * Math.PI, 2 * Math.PI).name('axis y').step(0.01);
        // this.gui.add(this.axisRotation, 'z', -2 * Math.PI, 2 * Math.PI).name('axis z').step(0.01);
    }

    isInBounds() {
        const globalBounds = Globals.get('global.bounds');
        const cashbackBounds = Globals.get('cashback.bounds');
        const isMobile = Globals.get('mobile-webgl');

        if(isMobile){

            return Scroll.position.y 
                > (globalBounds.top + globalBounds.height - window.innerHeight * 0.5) - Globals.get('displace-globe')
            && Scroll.position.y <=
                 (cashbackBounds.top);

        }

        else{

            return Scroll.position.sy 
                > (globalBounds.top + globalBounds.height - window.innerHeight * 0.5)
            && Scroll.position.sy <=
                 (cashbackBounds.top);
        }


    }

    update() {

        let card = Globals.get('card');
        
        const globalBounds = Globals.get('global.bounds');
        const cashbackBounds = Globals.get('cashback.bounds');
        const readerBounds = Globals.get('reader.bounds');

        const top = (globalBounds.top + globalBounds.height) - window.innerHeight * 0.5;
        const bottom = cashbackBounds.top;

        let progress = map$1(Scroll.position.sy, top, bottom, 0, 1);

        if (progress >= 0) {
            card.container.visible = true;

            progress = clamp(progress, 0, 1);
            const easedProgress = quartOut(progress);

            let ps = map$1(progress, 0, 0.5, 0, 1);
            ps = clamp(ps, 0, 1);

            let pe = map$1(progress, 0.5, 1, 0, 1);
            pe = clamp(pe, 0, 1);
            
            let psEased = quartOut(ps);

            const isMobile = Globals.get('behave-mobile-webgl');

            if(isMobile){
                this.endPosition.y = this.computedMobilePositionY;
            }

            const sPos = mix(this.startPosition, this.middlePosition, psEased);
            const ePos = mix(this.middlePosition, this.endPosition, pe);

            const position = progress <= 0.5 ? sPos : ePos;


            card.front.position.copy(position);
            card.back.position.copy(card.front.position);
            
    
            const rx = mix(this.startRotation.x, this.endRotation.x, easedProgress); 
            const ry = mix(this.startRotation.y, this.endRotation.y, easedProgress); 
            const rz = mix(this.startRotation.z, this.endRotation.z, easedProgress);
        
            card.front.rotation.x = rx;
            card.front.rotation.y = ry;
            card.front.rotation.z = rz;

            card.setScale(card.baseScale);
            card.back.rotation.copy(card.front.rotation);

            card.cardAxis.rotation.copy(this.axisRotation);

            const x = this.perspective.x * progress;
            const y = this.perspective.y * progress;
            const z = this.perspective.z * progress;

            card.setPerspective(x, y, z);
        }


    }

    resize() {

        this.startPosition = this.computeStartPosition();
        this.middlePosition = this.computeMiddlePosition();
        this.endPosition = this.computeEndPosition();

    }

    computeStartPosition() {
        const maxWidth = 1047;

        let screenPos = 0;

        if (window.innerWidth > maxWidth) {
            screenPos = maxWidth * 0.35;
        } else {
            screenPos = (window.innerWidth) * 0.35;
        }

        var x = (screenPos / (window.innerWidth * 0.5)) * Globals.get('fullscreen.x') * 0.5;

        var y = 7;
        const isMobile = Globals.get('behave-mobile-webgl');
        const isLandscape = window.innerWidth > window.innerHeight;

        if(isMobile && Globals.get('GlobalState')){ 

            const globalBounds = Globals.get('global.bounds');
            let scrollVal = globalBounds.top + globalBounds.height - window.innerHeight * 0.5;
            let pos =  Globals.get('GlobalState').reversePosition(scrollVal);
            x = 0;
            y = pos.y;

        }

        return new THREE.Vector3(x, y, -11);
    }

    computeMiddlePosition() {
        const fullScreenX = Globals.get('fullscreen.x');
        const fullScreenY = Globals.get('fullscreen.y');
        const readerBounds = Globals.get('reader.bounds');

        const screenEndX = (readerBounds.left + readerBounds.width * 0.25) / window.innerWidth;
        const worldEndX = screenEndX * fullScreenX - fullScreenX * 0.5;
        const worlEndY = fullScreenY * 0.25;

        return new THREE.Vector3(worldEndX, worlEndY, 0);
    }

    computeEndPosition() {
        const fullScreenX = Globals.get('fullscreen.x');
        const fullScreenY = Globals.get('fullscreen.y');
        const readerBounds = Globals.get('reader.bounds');

        var worlEndY = fullScreenY * 0.15;
        var worldEndX= 0;
        const isMobile = Globals.get('behave-mobile-webgl');

        let prop = 0.395;

        if(this.img == null){
           this.img = document.querySelector('.card-reader');
           this.stick = document.querySelector('.sticky-reader-wrapper');
       }

       let top = 0;

        if(isMobile){
            prop = 0.35;
            top = this.img.getBoundingClientRect().top;

        }


        let temp = this.fakeRay.getCoord(readerBounds.left + readerBounds.width * prop, top, 0);

        if(temp != null){
            worldEndX = temp.x;
        }

        // console.log(worldEndX, worlEndY)

        return new THREE.Vector3(worldEndX, worlEndY, 0);
    }

    computeEndYPosition(card){

        let res = this.fakeRay.getCoord(0,  Globals.get('height-reader-ratio') * window.innerHeight, 0).y;
        
        return res
    }

    computeCurve() {
        return new THREE.CatmullRomCurve3([
            new THREE.Vector3(5, 6, -8),
            new THREE.Vector3(1, -2, -3),
            new THREE.Vector3(2, -2, -3),
            new THREE.Vector3(3.5, 0, -4),
            new THREE.Vector3(4, 2, -5),
            new THREE.Vector3(3, 4, -8),
            new THREE.Vector3(1, 4, -10),
            new THREE.Vector3(0, 2, -15),
            new THREE.Vector3(1, 0, -12),
            new THREE.Vector3(4, -1, -10)
        ]);
    }
}

class Cashback extends State {

    constructor() {
        super('cashback');

        this.startRotation = new THREE.Euler(); // this gets updated by the previous state
        this.startPosition = new THREE.Vector3();//this gets updated by the previous state
        this.perspective = new THREE.Vector3(); // this gets updated by the previous state

        this.originalStick =  {x: 0,y:0,z:0};
        this.fakeRay = new FakeRaycast();

        this.endRotation = new THREE.Euler(-0.65, 0.58, 2.08, 'XYZ');
        this.axisRotation = new THREE.Euler(0, 0, 0, 'XYZ');
    }

    onEnter() {
        super.onEnter();
        this.resize();
    }

    onLeave() {
        super.onLeave();
        this.resize();
    }

    isInBounds() {
        const readerBounds = Globals.get('reader.bounds');
        const globalBounds = Globals.get('global.bounds');
        const cashbackBounds = Globals.get('cashback.bounds');
        const convenientBounds = Globals.get('convenient.bounds');

       const isMobile = Globals.get('mobile-webgl');

       if(isMobile){

            return Scroll.position.y > cashbackBounds.top && Scroll.position.y <= convenientBounds.top;

       }

       else{

            return Scroll.position.sy > cashbackBounds.top && Scroll.position.y <= convenientBounds.top;

       }
        
    }

    update() {


        let card = Globals.get('card');
        if(this.img == null){
            this.img = document.querySelector('.card-reader');
            this.stick = document.querySelector('.sticky-reader-wrapper');
        }


        const globalBounds = Globals.get('global.bounds');
        const readerBounds = Globals.get('reader.bounds');
        const cashbackBounds = Globals.get('cashback.bounds');
        const fullScreenX = Globals.get('fullscreen.x');
        const fullScreenY = Globals.get('fullscreen.y');
        
        var top = cashbackBounds.top;
        var bottom = (cashbackBounds.top + cashbackBounds.height);

        const isMobile = Globals.get('behave-mobile-webgl');

     
        // top = cashbackBounds.top


        let progress = map$1(Scroll.position.y, top, bottom, 0, 1);


        // console.log(progress)
        // console.log(progress)
        // console.log(progress)

        card.front.position.x = this.computeStartXPosition();

        if (progress >= 0) {  

            card.setPerspective(this.perspective.x, this.perspective.y, this.perspective.z);

            const isMobile = Globals.get('behave-mobile-webgl');

            const isTablet = Globals.get('tablet-webgl');

            if(isMobile){

                let top = this.topOfWrapper - Scroll.position.sy +  Globals.get('height-reader-ratio') * window.innerHeight;

                let point =  this.fakeRay.getCoord(0, top, 0);

                card.front.position.y = point.y;


            }

            else{

                let top = this.img.getBoundingClientRect().top;

                let point =  this.fakeRay.getCoord(0, top, card.front.position.z);

                if(point != null){

                    let diff = this.originalStick.y - point.y;

                    card.front.position.y = this.computeYPosition() - diff;

                    card.back.position.y  = card.front.position.y;

                }  

            }
           

        }

        // console.log("b ", card.front.position.y)

        card.front.position.z = this.startPosition.z;
        card.back.position.z = this.startPosition.z;


        card.front.rotation.x = this.endRotation.x;
        card.front.rotation.y = this.endRotation.y;
        card.front.rotation.z = this.endRotation.z;
        card.back.rotation.copy(card.front.rotation);
        card.cardAxis.rotation.copy(this.axisRotation);


        if (Scroll.position.y > bottom) {
            card.container.visible = false;
        } else {
            card.container.visible = true;
        }


    }

    computeStartXPosition(){

        const fullScreenX = Globals.get('fullscreen.x');
        const readerBounds = Globals.get('reader.bounds');

        var worldEndX= 0;
        const isMobile = Globals.get('behave-mobile-webgl');

         let prop = 0.395;

        if(isMobile){
            prop = 0.35;
        }

        let temp = this.fakeRay.getCoord(readerBounds.left + readerBounds.width * prop, 0, 0);

        if(temp != null){
            worldEndX = temp.x;
        }

        return worldEndX
    }

    // non mobile
    computeYPosition(){

        const fullScreenX = Globals.get('fullscreen.x');
        const fullScreenY = Globals.get('fullscreen.y');
        const readerBounds = Globals.get('reader.bounds');

        const screenEndX = (readerBounds.left + readerBounds.width * 0.4) / window.innerWidth;
        const worlEndY = fullScreenY * 0.15;

        return worlEndY;
            // return new THREE.Vector3(worl, 0, 0);
    }

    // computeEndPosition() {
    //     const readerBounds = Globals.get('reader.bounds');
    //     const fullScreenX = Globals.get('fullscreen.x');
    //     const fullScreenY = Globals.get('fullscreen.y');

    //     const screenEndX = (readerBounds.left + readerBounds.width * 0.4) / window.innerWidth;
    //     const worldEndX = screenEndX * fullScreenX - fullScreenX * 0.5;
    //     const worldEndY = 4;

    //     return new THREE.Vector3(worldEndX, worldEndY, this.startPosition.z);
    // }

    resize() {

        let card = Globals.get('card');
        
        if(this.img == null){
            this.img = document.querySelector('.card-reader');
            this.stick = document.querySelector('.sticky-reader-wrapper');


        }

        const isMobile = Globals.get('behave-mobile-webgl');

        if(isMobile){

            this.originalStick = this.fakeRay.getCoord(0,  Globals.get('height-reader-ratio') * window.innerHeight ,0);

            this.topOfWrapper = this.stick.getBoundingClientRect().top + Scroll.position.y;

        }

        else{

         
           let top  =  this.stick.style.top; 
           let left =  this.stick.style.left; 
           this.stick.style.top = '0px';
           this.stick.style.left = '1500px';

           let bounds = this.img.getBoundingClientRect();

           this.originalStick = this.fakeRay.getCoord(0, bounds.top,card.front.position.z);
           
           if(this.originalStick == null){
               this.originalStick = {x:0,y:0,z:0};
           }

           this.stick.style.top = top;
           this.stick.style.left = left;
 
        }


        if(this.entered){
            this.update();
        }

    }
}

class GL {

    constructor($canvas, { country = '', pathTextures = '/assets/textures', pathScripts = '/js' } = {}) {
        this.$canvas = $canvas;


        // console.log('YOLO')
        // console.log('YOLO')
        // console.log('YOLO')
        // console.log('YOLO')
        if (window.GL_DISABLE) {
            return;
        }  

        let isMobilewebgl = document.querySelector('html').classList.contains('mobile-webgl-enabled');
        Globals.set('mobile-webgl', isMobilewebgl);
        Globals.set('behave-mobile-webgl', isMobilewebgl || Device.tablet());
        Globals.set('tablet-webgl', Device.tablet());

        // import { Mouse } from '../../utils/Mouse';

        // Device.tablet()



        this.update = this.update.bind(this);
        this.resize = this.resize.bind(this);

        this.currentState = null;
        this.previousState = null;
        this.loaded = false;
        this.hiddenWebGL = false;
        this.velocityTresholdMax = 40;
        this.velocityTresholdMin = 2;

        Globals.set('ratioX', 1);
        Globals.set('ratioY', 1);

        Globals.set('bodyHeight', window.innerHeight);
        Globals.set('globalOpacity', 1);

        Globals.set('displace-mobile-fee', 150);
        Globals.set('displace-globe', 200);
        Globals.set('displace-end-globe', 300);
        Globals.set('height-reader-ratio', Device.tablet() ? 0.4 : 0.3);

        this.options = {
            country: country,
            pathScripts: pathScripts,
            pathTextures: pathTextures
        };
    }

    init() {
        const pixelRatio = window.PIXEL_RATIO = window.devicePixelRatio; 
        // const pixelRatio = window.PIXEL_RATIO = 0.75;

        // -- Globals
        window.NOW = Date.now();
        window.DELTA_TIME = 0;
        window.TIME = 0;
        window.U_TIME = { value: 0 };
        window.U_RESOLUTION = { value: new THREE.Vector2(window.innerWidth, window.innerHeight) };
        window.U_PIXEL_RATIO = { value: window.PIXEL_RATIO };

        // window.addEventListener('resize', this.resize);

        Mouse.listen();

        // this.$wrapper = document.querySelector('.site-container');
        // Scroll.smooth(this.$wrapper);

        Scroll.listen();

        this.fpsMeter = new FPSMeter();
        this.fpsMeter.enable(false);

        window.gui = new index.GUI(); 
        window.gui.hide(); 

        this.samGUI = new index.GUI();

        // if(Globals.get('mobile-webgl')){
        // }
        this.samGUI.hide();


        this.GUIOPTS = {
            currentState : 'start',
            progress : 0
        }; 

        this.samGUI.add(this.GUIOPTS, 'currentState').listen();
        this.samGUI.add(this.GUIOPTS, 'progress', 0, 1).listen().step(0.0001);

        let needantialias = (window.devicePixelRatio <= 2) && (Globals.get('mobile-webgl') == false);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.$canvas,
            alpha: true,
            antialias: needantialias
        });

        this.renderer.domElement.style.pointerEvents = 'none';
        // this.renderer.domElement.style.display = 'none';
        this.renderer.debug.checkShaderErrors = false;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(pixelRatio);
        Globals.set('renderer', this.renderer);

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 60);
        this.camera.position.set(0, 0, 10);
        this.camera.lookAt(new THREE.Vector3());

        Globals.set('camera', this.camera);

        this.computeFullscreenSize();

        // this.controls = new THREE.OrbitControls(this.camera);
        // this.controls.enableZoom = false;
        // this.controls.enabled = false;
        
        // window.gui.add(this.controls, 'enabled').name('controls');

        this.onGUI();

        this.particles = new Particles();
        this.scene.add(this.particles.container);

        this.bills = new Bills();
        this.scene.add(this.bills.container);
        Globals.set('bills', this.bills);

        this.card = new Card();

        Globals.set('card', this.card);
        this.scene.add(this.card.container);

        this.globe = new Globe();
        this.scene.add(this.globe.container);
        Globals.set('globe', this.globe);

        this.states = [
            new HeroState(),
            new FeeState(),
            new FeeToGlobalState(),
            new GlobalState(),
            new GlobalToCashback(),
            new Cashback(),
        ];

        Globals.set('GlobalState', this.states[3]);

        this.loaded = true;

        this.fakeCast = new FakeRaycast();

        // console.log(this.bills.container)

        this.bills.container.visible = true;

        this.renderer.render(this.scene, Globals.get('camera'));

        this.bills.container.visible = false;

    }

    onGUI() {
        const renderingParams = {
            pixelRatio: window.PIXEL_RATIO,
            fpsMeter: this.fpsMeter.isEnabled,
            // fov: this.camera.fov,
        };
        const renderingGUI = window.gui.addFolder('Rendering');
        renderingGUI.add(renderingParams, 'pixelRatio', 0, window.devicePixelRatio).step(0.01).onChange(() => {
            // Scroll.progress.ease = 1 - scrollParams.inertia;
            window.PIXEL_RATIO = renderingParams.pixelRatio;
            window.U_PIXEL_RATIO.value = window.PIXEL_RATIO;
            this.renderer.setPixelRatio(window.PIXEL_RATIO);
        });
        

        renderingGUI.add(renderingParams, 'fpsMeter').onChange(() => {
            this.fpsMeter.enable(renderingParams.fpsMeter);
        });
        renderingGUI.add(this.camera, 'fov', 0, 100).onChange( () => {
            this.camera.updateProjectionMatrix();
        });

        const scrollParams = {
            inertia: 1 - Scroll.position.ease,
        };
        const scrollGUI = window.gui.addFolder('Scroll');
        scrollGUI.add(scrollParams, 'inertia', 0, 1).step(0.01).onChange(() => {
            Scroll.position.ease = 1 - scrollParams.inertia;
        });
        scrollGUI.add(this, 'velocityTresholdMax', 0, 200).step(0.1);
        scrollGUI.add(this, 'velocityTresholdMin', 0, 200).step(0.1);
    }

    setCountry(country) {
        this.options.country = country;
    }

    load(callback) {
        return new Promise( (resolve, reject) => {
            if (window.disable_webgl) {
                console.warn(`GL is disabled.`);
                resolve();
            }
            
            if (this.options.country === '') {
                console.error(`GL: You need to call setCountry() method before calling load or pass country as a parameter in the constructor.`);
                reject();
            }
            
            // const countries = ['mexico', 'brazil'];
    
            // if (!countries.includes(this.options.country)) {
            //     console.error(`GL: You need to call setCountry() with 'brazil' or 'mexico' arguments and not`, this.options.country);
            //     reject();
            // }

            const textures = [
                { path: `/bill-${this.options.country}-0.jpg`, name: 'bill-0' },
                { path: `/bill-${this.options.country}-1.jpg`, name: 'bill-1' },
                { path: `/bill-${this.options.country}-0-blur.png`, name: 'bill-0-blur' },
                { path: `/bill-${this.options.country}-1-blur.png`, name: 'bill-1-blur' },
                { path: `/worldmap-sq.jpg`, name: 'worldmap' },
                { path: `/particle2.png`, name: 'particle' },
                { path: `/card-front-sq.png`, name: 'card-front' },
                { path: `/card-shadow.png`, name: 'card-shadow' },
                { path: `/earth-shadow.png`, name: 'earth-shadow' },
                { path: `/card-back-sq.png`, name: 'card-back' },
                { path: `/card-front-black-shadow.png`, name: 'card-front-black' },
            ];

            const scripts = [
                '/three.min.js',
                // '/three.OrbitControls.js',
            ];

            createScript(`${this.options.pathScripts}${scripts[0]}`)
                // .then(() => createScript(`${this.options.pathScripts}${scripts[1]}`))
                .then(() => this.textureLoader = new THREE.TextureLoader())
                .then(() => Promise.all(textures.map(texture => this.loadTexture(texture))))
                .then(() => {
                    this.init();
                    this.update();

                    resolve();
                }).catch(err => {
                    console.error(`GL :: error while loading`);
                    console.error(err);
                });
        });
    }

    loadTexture({ path, name }) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(`${this.options.pathTextures}${path}`, (texture) => {
                Assets.set(name, texture);
                resolve();
            }, undefined, (error) => {
                console.error(`Gl :: error while loading texture ${path}`);
                console.error(error);
                reject();
            });
        });
    }

    update() {

        this.render();
       
        requestAnimationFrame(this.update);
    }

    render(){

        // this.$wrapper.style.transform = `translate3d(0px, -${Scroll.position.y}px, 0px)`;
        // this.renderer.domElement.style.transform = `translate3d(0px, ${Scroll.position.y}px, 0px)`;

        const n = Date.now();

        window.DELTA_TIME = (n - NOW) / 1000;
        window.TIME += DELTA_TIME;
        window.NOW = n;
        window.U_TIME.value = window.TIME;

        emitter.emit('frame');

        this.updateState();

        const vy = Math.abs(Scroll.velocity.sy);

        // console.log(vy)

        let max = 80;
        let min = 35;

        if(this.card){
            this.card.updateRota();
            let alpha = Smoothstep(max, min, vy);
            this.card.setGlobalAlphaSpeed(alpha);
            this.bills.setGlobalAlphaSpeed(alpha);
            this.globe.setGlobalAlphaSpeed(alpha);
        }
        
        

        this.renderer.render(this.scene, this.camera);

        if(this.card){
            this.card.backRota();
        }

    }

    updateState() {
        if (!Globals.get('boundsExists')) return;

        // new HeroState(),
        // new FeeState(),
        // new FeeToGlobalState(),
        // new GlobalState(),
        // new GlobalToCashback(),
        // new Cashback(),

        // match values between states
        this.states[1].startPosition.copy(this.states[0].endPosition);
        // this.states[2].startRotation.copy(this.states[1].endRotation);
        this.states[5].startRotation.copy(this.states[4].endRotation);
        this.states[5].startPosition.copy(this.states[4].endPosition);
        this.states[5].perspective.copy(this.states[4].perspective);
        this.states[5].endRotation.copy(this.states[4].endRotation);

        this.maxScroll = Globals.get('convenient.bounds').top;
   
        let tempCurrentState = null;
        // states updates
        for (let i = 0; i < this.states.length; i++) {
            const state = this.states[i];

            const inBounds = state.isInBounds();


            if (inBounds && !state.entered) {

                tempCurrentState = state;
                
            }

            if(state.id == 'global' && !state.entered){
                state.update();
            }

        }

        if(tempCurrentState != null && this.currentState != tempCurrentState){
            
            this.previousState = this.currentState;

            this.currentState = tempCurrentState;

            if(this.previousState != null){

                this.previousState.onLeave();
            }
            
            this.currentState.resize();
            this.currentState.onEnter();

            if(this.currentState.id == 'hero' || this.currentState.id == 'fee'){
                this.card.toggleMouse(true);
            }
            else{
                this.card.toggleMouse(false);
            }

        }


        // if maxed
        if(Scroll.position.sy > this.maxScroll){

            if(this.currentState){

             
                if(this.currentState){
                    this.currentState.onLeave();
                }

                this.currentState = null;
                this.previousState = null;

                this.GUIOPTS.currentState = 'over max';

                // this.card.onLeave()

                this.card.resetOverMax();
                // this.card.container.visible = false
                // this.card.setShadowOpacity(0)

                // console.log()
            }
        }

        if(this.currentState){

            this.GUIOPTS.currentState = this.currentState.id;

            let progress, top, bottom;

            const heroBounds = Globals.get('hero.bounds');
            const feeBounds = Globals.get('fee.bounds');
            const globalBounds = Globals.get('global.bounds');
            const cashbackBounds = Globals.get('cashback.bounds');
            const readerBounds = Globals.get('reader.bounds');
            const convenientBounds = Globals.get('convenient.bounds');

            const isMobile = Globals.get('mobile-webgl');


            
            // convenientBounds.top
            switch(this.currentState.id){

                case 'hero': 

                    top    =  heroBounds.top;
                    bottom =  heroBounds.height * 0.5;
                    this.card.container.visible = true;
               
                break;

                case 'fee': 

                    top = heroBounds.height * 0.5;
                    bottom = (feeBounds.top + feeBounds.height - window.innerHeight);
           

                    if(isMobile){
                        bottom   -= Globals.get('displace-mobile-fee');
                    }
                  

                break;

                case 'feeToGlobal': 

                    top    = feeBounds.top + feeBounds.height - window.innerHeight;
                    bottom = globalBounds.top;

                    if(isMobile){
                        top   -= Globals.get('displace-mobile-fee');
                        bottom   -= Globals.get('displace-globe');
                    }
                  

                break;

                case 'global': 

                    top    = globalBounds.top;
                    bottom = (globalBounds.top + globalBounds.height - window.innerHeight * 0.5);

                    if(isMobile){
                        top   -= Globals.get('displace-globe');
                        bottom   -= Globals.get('displace-globe');
                    }
                
                break;

                case 'globalToCashback': 


                    top    = (globalBounds.top + globalBounds.height - window.innerHeight * 0.5); 
                    bottom = cashbackBounds.top;

                    if(isMobile){
                        top    = (globalBounds.top + globalBounds.height - window.innerHeight * 0.5) - Globals.get('displace-globe');
                    }

                    // console.log(Scroll.position.sy, cashbackBounds.top)

                break;

                case 'cashback': 

                    top    = cashbackBounds.top;
                    bottom = convenientBounds.top;

                break;

            }

            progress = map$1(Scroll.position.sy, top, bottom, 0, 1);

            Globals.set('trueprogress', progress);
            Globals.set('currentState', this.currentState);
            this.GUIOPTS.progress = progress;
           
        }

    }

    hideWebGL() {
        this.hiddenWebGL = true;

        const opacity = { value: 1 };

        TweenMax.to(opacity, 0.3, {
            value: 0,
            ease: Sine.easeInOut, 
            onUpdate: () => {
                Globals.set('globalOpacity', opacity.value);
            }
        });
    }

    showWebGL() {
        this.hiddenWebGL = false;

        const opacity = { value: 0 };

        TweenMax.to(opacity, 0.3, {
            value: 1,
            ease: Sine.easeInOut,
            onUpdate: () => {
                Globals.set('globalOpacity', opacity.value);
            }
        });
    }

    resize() {
        window.U_RESOLUTION.value.x = window.innerWidth;
        window.U_RESOLUTION.value.y = window.innerHeight;

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(window.innerWidth, innerHeight);

        this.computeFullscreenSize();

        let baseRatioX = 1.5;

        let space = 0.25;
        let LEFT   = this.fakeCast.getAbsoluteCoord(-space, 0, 1);
        let RIGHT  = this.fakeCast.getAbsoluteCoord(space, 0,  1);

        let ratioX =  (RIGHT.x  - LEFT.x ) / baseRatioX; 
        // let ratioY =  (TOP.y    - BOTTOM.y ) / 1.5
        // console.log(ratioY)

        Globals.set('ratioX',  Math.min(1.0,  ratioX));
        Globals.set('trueRatioX', ratioX);
        // Globals.set('ratioY', ratioY);

        for (let i = 0; i < this.states.length; i++) {
            this.states[i].resize();
        }

        emitter.emit('resize');

        this.render();
        // this.update()
    }

    computeFullscreenSize() {
        const [sizeX, sizeY] = computeFullscreenSize(0);

        Globals.set('fullscreen.x', sizeX);
        Globals.set('fullscreen.y', sizeY);
    }

    setPageHeight(height) {
        Globals.set('bodyHeight', height);
    }

    setParticlesBounds(bounds) {
        if (!this.loaded) return;

        this.particles.setBounds(bounds);
    }

    setBounds(bounds) {

        // if (!this.loaded) return;

        // console.log('WebGL :: setBounds')

        const keys = Object.keys(bounds);

        for (let i = 0; i < keys.length; i++) {


            const key = keys[i];
            const rect = bounds[key];

            const values = {
                top: rect.top + Scroll.position.y,
                bottom: rect.bottom,
                left: rect.left,
                right: rect.right,
                width: rect.width,
                height: rect.height,
            };


            Globals.set(`${key}.bounds`, values);
        }

        const heroBounds = Globals.get('hero.bounds');

        Globals.set('boundsExists', true);
        
        this.resize();

        window.Globals = Globals;
    }

}

window.GL = GL;
//# sourceMappingURL=webgl.js.map
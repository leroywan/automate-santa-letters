(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const wrap = require("word-wrap");
const outdent = require('outdent');

// Scales pixels to points
function pt(pixels) {
  return pixels * 4;
}

const c = document.getElementById("canvas");
const ctx = c.getContext("2d");

// Draw background image
const img = new Image();
img.onload = function () {
  drawerLetterhead();
};
img.src =
  "https://santas-postal-service.s3.us-east-2.amazonaws.com/images/letterhead.png";

// Load font
const f = new FontFace(
  "Santa",
  "url(https://santas-postal-service.s3.us-east-2.amazonaws.com/font/dear-sarah-regular.otf"
);
f.load().then(function (font) {
  document.fonts.add(font);
  ctx.font = `${pt(20)}px Santa`;
});

const orderIdInput = document.getElementById("orderId");
const submitInput = document.getElementById("submit");
const orderInfo = document.getElementById("orderInfo");
const output = document.getElementById("output");
const itemSelector = document.getElementById("itemSelector");

const lineHeightInput = document.getElementById("lineHeight");
const fontSizeInput = document.getElementById("fontSize");
const contentWidthInput = document.getElementById("contentWidth");

const enabledBgInput = document.getElementById("enabledBg");

const updateLetterInput = document.getElementById("updateLetterInput");
const updateLetterButton = document.getElementById("updateLetterButton");

const x = pt(60);
const y = pt(180);

function drawerLetterhead() {
  ctx.drawImage(img, 45, 45);
}

function clearBoard() {
  ctx.clearRect(0, 0, pt(c.clientWidth) * 5, pt(c.clientHeight) * 5);
}

function stripTags(someHtml) {
  const html = someHtml;
  const div = document.createElement("div");
  div.innerHTML = html;
  const text = div.textContent || div.innerText || "";
  
  return text;
}

function writeLetter(letter, fontSize, lineHeight, width) {

  const letterWrapped = wrap(stripTags(letter), { width: width });
  const lines = letterWrapped.split("\n").map((item) => item.trim());
  ctx.font = `${pt(fontSize)}px Santa`;
  for (var i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, y + i * pt(lineHeight));
  }
}

let letterData;
function handleUpdateLetter(e) {
  const { lineHeight, fontSize, letter, width } = letterData;
  clearBoard();
  ctx.drawImage(img, 45, 45);

  writeLetter(
    updateLetterInput.value || letter,
    fontSizeInput.value || fontSize,
    lineHeightInput.value || lineHeight,
    contentWidthInput.value || width
  );
}

lineHeightInput.addEventListener("change", handleUpdateLetter);
fontSizeInput.addEventListener("change", handleUpdateLetter);
contentWidthInput.addEventListener("change", handleUpdateLetter);
enabledBgInput.addEventListener("change", function (e) {
  const { lineHeight, fontSize, letter, width } = letterData;
  clearBoard();
  writeLetter(
    updateLetterInput.value || letter,
    fontSizeInput.value || fontSize,
    lineHeightInput.value || lineHeight,
    contentWidthInput.value || width
  );

  if (e.target.checked) {
    drawerLetterhead();
  }
});

updateLetterButton.addEventListener("click", async (e) => {
  const { lineHeight, fontSize, letter, width } = letterData;
  clearBoard();
  writeLetter(
    updateLetterInput.value || letter,
    fontSizeInput.value || fontSize,
    lineHeightInput.value || lineHeight,
    contentWidthInput.value || width
  );
  drawerLetterhead();

  output.innerHTML = '';
  output.innerHTML = `<p>${updateLetterInput.value}</p>`;
})

submitInput.addEventListener("click", async (e) => {
  e.preventDefault();

  const data = await (
    await fetch(`/order/${orderIdInput.value}?item=${itemSelector.value}`)
  ).json();

  clearBoard();
  const { lineHeight, fontSize, letter, width, numOfItems, orderNumber } = data;

  // Set values for the input elements
  letterData = data;
  lineHeightInput.value = lineHeight;
  fontSizeInput.value = fontSize;
  contentWidthInput.value = width;
  updateLetterInput.value = stripTags(letterData.letter.replace(/  +/g, '').replace(/\r\n/g, '\n\n'));

  orderInfo.innerHTML = '';
  orderInfo.innerHTML = `<p>Envelope name: ${letterData.envelopeName}
  Letter name: ${letterData.name}
  Order number: ${orderNumber}
  Items in order: ${numOfItems}</p>`

  output.innerHTML = '';
  output.innerHTML = `<p>${letterData.letter.replace(/  +/g, '').replace(/\r\n/g, '\n\n')}</p>`;

  writeLetter(letter, fontSize, lineHeight, width);
  drawerLetterhead();
});

},{"outdent":2,"word-wrap":3}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// In the absence of a WeakSet or WeakMap implementation, don't break, but don't cache either.
function noop() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
}
function createWeakMap() {
    if (typeof WeakMap !== 'undefined') {
        return new WeakMap();
    }
    else {
        return fakeSetOrMap();
    }
}
/**
 * Creates and returns a no-op implementation of a WeakMap / WeakSet that never stores anything.
 */
function fakeSetOrMap() {
    return {
        add: noop,
        delete: noop,
        get: noop,
        set: noop,
        has: function (k) { return false; },
    };
}
// Safe hasOwnProperty
var hop = Object.prototype.hasOwnProperty;
var has = function (obj, prop) {
    return hop.call(obj, prop);
};
// Copy all own enumerable properties from source to target
function extend(target, source) {
    for (var prop in source) {
        if (has(source, prop)) {
            target[prop] = source[prop];
        }
    }
    return target;
}
var reLeadingNewline = /^[ \t]*(?:\r\n|\r|\n)/;
var reTrailingNewline = /(?:\r\n|\r|\n)[ \t]*$/;
var reStartsWithNewlineOrIsEmpty = /^(?:[\r\n]|$)/;
var reDetectIndentation = /(?:\r\n|\r|\n)([ \t]*)(?:[^ \t\r\n]|$)/;
var reOnlyWhitespaceWithAtLeastOneNewline = /^[ \t]*[\r\n][ \t\r\n]*$/;
function _outdentArray(strings, firstInterpolatedValueSetsIndentationLevel, options) {
    // If first interpolated value is a reference to outdent,
    // determine indentation level from the indentation of the interpolated value.
    var indentationLevel = 0;
    var match = strings[0].match(reDetectIndentation);
    if (match) {
        indentationLevel = match[1].length;
    }
    var reSource = "(\\r\\n|\\r|\\n).{0," + indentationLevel + "}";
    var reMatchIndent = new RegExp(reSource, 'g');
    if (firstInterpolatedValueSetsIndentationLevel) {
        strings = strings.slice(1);
    }
    var newline = options.newline, trimLeadingNewline = options.trimLeadingNewline, trimTrailingNewline = options.trimTrailingNewline;
    var normalizeNewlines = typeof newline === 'string';
    var l = strings.length;
    var outdentedStrings = strings.map(function (v, i) {
        // Remove leading indentation from all lines
        v = v.replace(reMatchIndent, '$1');
        // Trim a leading newline from the first string
        if (i === 0 && trimLeadingNewline) {
            v = v.replace(reLeadingNewline, '');
        }
        // Trim a trailing newline from the last string
        if (i === l - 1 && trimTrailingNewline) {
            v = v.replace(reTrailingNewline, '');
        }
        // Normalize newlines
        if (normalizeNewlines) {
            v = v.replace(/\r\n|\n|\r/g, function (_) { return newline; });
        }
        return v;
    });
    return outdentedStrings;
}
function concatStringsAndValues(strings, values) {
    var ret = '';
    for (var i = 0, l = strings.length; i < l; i++) {
        ret += strings[i];
        if (i < l - 1) {
            ret += values[i];
        }
    }
    return ret;
}
function isTemplateStringsArray(v) {
    return has(v, 'raw') && has(v, 'length');
}
/**
 * It is assumed that opts will not change.  If this is a problem, clone your options object and pass the clone to
 * makeInstance
 * @param options
 * @return {outdent}
 */
function createInstance(options) {
    /** Cache of pre-processed template literal arrays */
    var arrayAutoIndentCache = createWeakMap();
    /**
     * Cache of pre-processed template literal arrays, where first interpolated value is a reference to outdent,
     * before interpolated values are injected.
     */
    var arrayFirstInterpSetsIndentCache = createWeakMap();
    function outdent(stringsOrOptions) {
        var values = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            values[_i - 1] = arguments[_i];
        }
        /* tslint:enable:no-shadowed-variable */
        if (isTemplateStringsArray(stringsOrOptions)) {
            var strings = stringsOrOptions;
            // Is first interpolated value a reference to outdent, alone on its own line, without any preceding non-whitespace?
            var firstInterpolatedValueSetsIndentationLevel = (values[0] === outdent || values[0] === defaultOutdent) &&
                reOnlyWhitespaceWithAtLeastOneNewline.test(strings[0]) &&
                reStartsWithNewlineOrIsEmpty.test(strings[1]);
            // Perform outdentation
            var cache = firstInterpolatedValueSetsIndentationLevel ? arrayFirstInterpSetsIndentCache : arrayAutoIndentCache;
            var renderedArray = cache.get(strings);
            if (!renderedArray) {
                renderedArray = _outdentArray(strings, firstInterpolatedValueSetsIndentationLevel, options);
                cache.set(strings, renderedArray);
            }
            /** If no interpolated values, skip concatenation step */
            if (values.length === 0) {
                return renderedArray[0];
            }
            /** Concatenate string literals with interpolated values */
            var rendered = concatStringsAndValues(renderedArray, firstInterpolatedValueSetsIndentationLevel ? values.slice(1) : values);
            return rendered;
        }
        else {
            // Create and return a new instance of outdent with the given options
            return createInstance(extend(extend({}, options), stringsOrOptions || {}));
        }
    }
    var fullOutdent = extend(outdent, {
        string: function (str) {
            return _outdentArray([str], false, options)[0];
        },
    });
    return fullOutdent;
}
var defaultOutdent = createInstance({
    trimLeadingNewline: true,
    trimTrailingNewline: true,
});
exports.outdent = defaultOutdent;
// Named exports.  Simple and preferred.
// import outdent from 'outdent';
exports.default = defaultOutdent;
if (typeof module !== 'undefined') {
    // In webpack harmony-modules environments, module.exports is read-only,
    // so we fail gracefully.
    try {
        module.exports = defaultOutdent;
        Object.defineProperty(defaultOutdent, '__esModule', { value: true });
        defaultOutdent.default = defaultOutdent;
        defaultOutdent.outdent = defaultOutdent;
    }
    catch (e) { }
}

},{}],3:[function(require,module,exports){
/*!
 * word-wrap <https://github.com/jonschlinkert/word-wrap>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

module.exports = function(str, options) {
  options = options || {};
  if (str == null) {
    return str;
  }

  var width = options.width || 50;
  var indent = (typeof options.indent === 'string')
    ? options.indent
    : '  ';

  var newline = options.newline || '\n' + indent;
  var escape = typeof options.escape === 'function'
    ? options.escape
    : identity;

  var regexString = '.{1,' + width + '}';
  if (options.cut !== true) {
    regexString += '([\\s\u200B]+|$)|[^\\s\u200B]+?([\\s\u200B]+|$)';
  }

  var re = new RegExp(regexString, 'g');
  var lines = str.match(re) || [];
  var result = indent + lines.map(function(line) {
    if (line.slice(-1) === '\n') {
      line = line.slice(0, line.length - 1);
    }
    return escape(line);
  }).join(newline);

  if (options.trim === true) {
    result = result.replace(/[ \t]*$/gm, '');
  }
  return result;
};

function identity(str) {
  return str;
}

},{}]},{},[1]);

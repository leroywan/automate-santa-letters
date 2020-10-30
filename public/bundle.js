(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const wrap = require("word-wrap");

// Scales pixels to points
function pt(pixels) {
  return pixels * 4;
}

const c = document.getElementById("canvas");
const ctx = c.getContext("2d");

const img = new Image();
img.onload = function () {
  ctx.drawImage(img, 45, 45);
};
img.src =
  "https://santas-postal-service.s3.us-east-2.amazonaws.com/images/letterhead.png";

const orderIdInput = document.getElementById("orderId");
const submitInput = document.getElementById("submit");
const output = document.getElementById("output");
const itemSelector = document.getElementById("itemSelector");

submitInput.addEventListener("click", async (e) => {
  e.preventDefault();
  const x = pt(60);
  const y = pt(180);

  const data = await (
    await fetch(`/order/${orderIdInput.value}?item=${itemSelector.value}`)
  ).json();

  const { lineHeight, fontSize, letter, width } = data;
  const letterWrapped = wrap(letter, { width: width });

  var f = new FontFace(
    "Santa",
    "url(https://santas-postal-service.s3.us-east-2.amazonaws.com/font/dear-sarah-regular.otf"
  );
  f.load().then(function (font) {
    document.fonts.add(font);
    ctx.clearRect(0, 0, pt(c.clientWidth), pt(c.clientHeight));
    ctx.drawImage(img, 45, 45);
    ctx.font = `${pt(fontSize)}px Santa`;

    var lines = letterWrapped.split("\n").map((item) => item.trim());
    for (var i = 0; i < lines.length; i++)
      ctx.fillText(lines[i], x, y + i * pt(lineHeight));
  });
});

},{"word-wrap":2}],2:[function(require,module,exports){
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

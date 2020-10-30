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

const lineHeightInput = document.getElementById("lineHeight");
const fontSizeInput = document.getElementById("fontSize");
const contentWidthInput = document.getElementById("contentWidth");

const x = pt(60);
const y = pt(180);

let letterData;
function handleUpdateLetter(e) {
  const { lineHeight, fontSize, letter, width } = letterData;
  ctx.clearRect(0, 0, pt(c.clientWidth) * 5, pt(c.clientHeight) * 5);
  ctx.drawImage(img, 45, 45);
  ctx.font = `${pt(fontSizeInput.value || fontSize)}px Santa`;
  const letterWrapped = wrap(letter, {
    width: contentWidthInput.value || width,
  });

  var lines = letterWrapped.split("\n").map((item) => item.trim());
  for (var i = 0; i < lines.length; i++)
    ctx.fillText(lines[i], x, y + i * pt(lineHeightInput.value || lineHeight));
}

lineHeightInput.addEventListener("change", handleUpdateLetter);
fontSizeInput.addEventListener("change", handleUpdateLetter);
contentWidthInput.addEventListener("change", handleUpdateLetter);

submitInput.addEventListener("click", async (e) => {
  e.preventDefault();

  const data = await (
    await fetch(`/order/${orderIdInput.value}?item=${itemSelector.value}`)
  ).json();

  const { lineHeight, fontSize, letter, width } = data;
  letterData = data;
  lineHeightInput.value = lineHeight;
  fontSizeInput.value = fontSize;
  contentWidthInput.value = width;

  var f = new FontFace(
    "Santa",
    "url(https://santas-postal-service.s3.us-east-2.amazonaws.com/font/dear-sarah-regular.otf"
  );
  f.load().then(function (font) {
    document.fonts.add(font);
    const letterWrapped = wrap(letter, { width: width });
    ctx.clearRect(0, 0, pt(c.clientWidth) * 5, pt(c.clientHeight) * 5);
    ctx.drawImage(img, 45, 45);
    ctx.font = `${pt(fontSize)}px Santa`;

    var lines = letterWrapped.split("\n").map((item) => item.trim());
    for (var i = 0; i < lines.length; i++)
      ctx.fillText(lines[i], x, y + i * pt(lineHeight));
  });
});

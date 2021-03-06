const wrap = require("word-wrap");

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
img.crossOrigin="anonymous";
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
const downloadButton = document.getElementById("downloadButton");
const downloadLink = document.getElementById("downloadLink");

const updateLetterInput = document.getElementById("updateLetterInput");
const updateLetterButton = document.getElementById("updateLetterButton");

const x = pt(60);
const y = pt(180);

function drawerLetterhead() {
  ctx.drawImage(img, 0, 0);
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

function writeLetter(letter, fontSize, lineHeight, width, orderNumber, numOfItems) {

  const letterWrapped = wrap(stripTags(letter.replace(/  +/g, '').replace(/\r\n(\r\n)?/g, '\n\n')), { width: width });
  const lines = letterWrapped.split("\n").map((item) => item.trim());
  ctx.font = `${pt(fontSize)}px Santa`;
  for (var i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, y + i * pt(lineHeight));
  }

  ctx.font = `${pt(8)}px Arial`;
  ctx.fillText(`${orderNumber} - ${Number(itemSelector.value) + 1}/${numOfItems}`, 2448 / 2 - 100, 3168 - 350);
}

let letterData;
function handleUpdateLetter(e) {
  const { lineHeight, fontSize, letter, width, orderNumber, numOfItems } = letterData;
  clearBoard();
  ctx.drawImage(img, 0, 0);

  writeLetter(
    updateLetterInput.value || letter,
    fontSizeInput.value || fontSize,
    lineHeightInput.value || lineHeight,
    contentWidthInput.value || width,
    orderNumber,
    numOfItems
  );
}

lineHeightInput.addEventListener("change", handleUpdateLetter);
fontSizeInput.addEventListener("change", handleUpdateLetter);
contentWidthInput.addEventListener("change", handleUpdateLetter);
enabledBgInput.addEventListener("change", function (e) {
  const { lineHeight, fontSize, letter, width, orderNumber, numOfItems} = letterData;
  clearBoard();
  writeLetter(
    updateLetterInput.value || letter,
    fontSizeInput.value || fontSize,
    lineHeightInput.value || lineHeight,
    contentWidthInput.value || width,
    orderNumber,
    numOfItems
  );

  if (e.target.checked) {
    drawerLetterhead();
  }
});

updateLetterButton.addEventListener("click", async (e) => {
  const { lineHeight, fontSize, letter, width, orderNumber, numOfItems } = letterData;
  clearBoard();
  writeLetter(
    updateLetterInput.value || letter,
    fontSizeInput.value || fontSize,
    lineHeightInput.value || lineHeight,
    contentWidthInput.value || width,
    orderNumber,
    numOfItems
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
  const { lineHeight, fontSize, letter, width, numOfItems, orderNumber} = data;

  // Set values for the input elements
  letterData = data;
  lineHeightInput.value = lineHeight;
  fontSizeInput.value = fontSize;
  contentWidthInput.value = width;
  updateLetterInput.value = stripTags(letter.replace(/  +/g, '').replace(/\r\n(\r\n)?/g, '\n\n'));

  orderInfo.innerHTML = '';
  orderInfo.innerHTML = `<p>Envelope name: ${letterData.envelopeName}
  Letter name: ${letterData.name}
  Order number: ${orderNumber}
  Items in order: ${numOfItems}</p>`

  output.innerHTML = '';
  output.innerHTML = `<p>${letter.replace(/  +/g, '').replace(/\r\n(\r\n)?/g, '\n\n')}</p>`;

  writeLetter(letter, fontSize, lineHeight, width, orderNumber, numOfItems);
  drawerLetterhead();

  downloadLink.download = `${orderNumber.replace('#', '')}_${Number(itemSelector.value) + 1}-${numOfItems}.png`
});

downloadButton.addEventListener("click", function() {
  enabledBgInput.click();
  const img = c.toDataURL("image/png").replace("image/png", "image/octet-stream");
  downloadLink.href = img;
  downloadLink.click();
})

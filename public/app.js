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

submitInput.addEventListener("click", async (e) => {
  e.preventDefault();

  const data = await (await fetch(`/order/${orderIdInput.value}`)).json();

  output.appendChild(document.createTextNode(JSON.stringify(data)));
});

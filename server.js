const express = require("express");
const dotenv = require("dotenv");
const fetch = require("node-fetch");
const path = require("path");
dotenv.config();

const { SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY } = process.env;
const app = express();
const port = 3000;

app.use("/public", express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.get("/order/:id", async (req, res) => {
  const orderData = await (
    await fetch(
      "https://looloolo.myshopify.com/admin/api/2020-10/graphql.json",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/graphql",
          "X-Shopify-Access-Token": SHOPIFY_API_SECRET_KEY,
          Accept: "application/json",
        },
        body: `
          {
            order(id: "gid://shopify/Order/${req.params.id}") {
              lineItems(first: 5) {
                edges {
                  node {
                    name
                    customAttributes {
                      key
                      value
                    }
                  }
                }
              }
            }
          }
        `,
      }
    )
  ).json();

  res.json(orderData);
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

const express = require("express");
const dotenv = require("dotenv");
const fetch = require("node-fetch");
const path = require("path");
const wrap = require("word-wrap");
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

  const letterData = getLetterFromData(orderData, req.query.item);
  res.json(letterData);
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

function getLetterFromData(r, item = 0) {
  const letter = r.data.order.lineItems.edges[item].node;
  const lineItems = {};
  letter.customAttributes.forEach((item) => {
    lineItems[item.key] = item.value.trim();
  });
  const numOfItems = r.data.order.lineItems.edges.length;

  const niceList = `Dear ${lineItems["First Name"]},\n
I looked at my naughty list a few minutes ago and there were a lot of names written on it. I can’t believe there were more naughty children than nice ones this year! With that said, I have checked twice and I am extremely happy to announce that you are not on the naughty list but actually one of the top names on my official nice list this year! It is usually hard for me to decide which child gets to be on the nice list but you made the decision very easy for me this year because ${lineItems["Good Behaviour"]}.\n
Our elves here the workshop heard about the good news and they are planning on putting a little extra effort into your present. I will be visiting your home in ${lineItems["Location"]} on Christmas Eve and Rudolph is very excited about it because he loved seeing the beautiful Christmas lights around your neighbourhood last time we flew by. Make sure to be in bed early and we will try to land the sleigh quietly when we arrive. Keep up the amazing work ${lineItems["First Name"]}!`;

  const thePresent = `Merry Christmas ${lineItems["First Name"]}!\n
The elves at the workshop and I are all very busy preparing the mountains of toys that we will be delivering on Christmas Eve. I am very happy to announce that I will be visiting your home at ${lineItems["Location"]}, it has been a long time but I loved the ${lineItems["Landmark"]} the last time I visited.\n
Have you been a good this year? I have been making a list and checking it twice and it tells me that you were very good this year! Every year, Santa brings toys to children who are nice to others, work hard, and listen to their parents - and you are one of them! Your ${lineItems["Mom or Dad"]} told me that you wanted a ${lineItems["Present Name"]} this year and I will do my best to bring you that or something made here in The Workshop by the elves. I am so proud of you this year and I will bring you your present the night of Christmas Eve. Until then, have a very Merry Christmas!`;

  const christmasCoal = `Dear ${lineItems["First Name"]},\n
So there has been a rumour going on around town that Santa Claus gives out lumps of coals to children who had been behaving naughty throughout the year. I do not know how the rumour started spreading, but the rumour is actually true!\n
I have been looking at my list and checking it twice and your name was not on either the naughty or nice list, which means that you were neither naughty OR nice. If you start behaving nicer such as ${lineItems["Good Deed"]}, your name might just pop up in the Nice List. However, if you do something naughty in the upcoming weeks such as ${lineItems["Naughty Deed"]}, you may have to receive a piece of coal this Christmas! I look forward to delivering you a present this year and I will be keeping a close eye on you ${lineItems["First Name"]}! Until then, continue being good, enjoy your time with your family, and have a Merry Merry Christmas!`;

  const familyHistory = `Dear ${lineItems["First Name"]},\n
Merry Christmas! I was looking at the nice list that I have made a long time ago and guess what? Both your parents were at the top of my nice list every year when they were a child, your grandparents too! I wonder if you would be able to keep this streak going for your family because it really is an incredible family achievement!\n
People usually see Christmas as a holiday to receive presents and play, but Christmas is also a holiday to spend time with your family - and you are blessed with a wonderful, loving, family. ${lineItems["First Name"]}, I am very proud of you this year, especially when you ${lineItems["Good Deed"]}. I can’t wait until I visit your home in ${lineItems["Location"]} on Christmas Eve to deliver you your present. I have to go now but until then, continue setting an amazing example and enjoy this lovely Christmas spirit with your family! Ho Ho Ho!`;

  const theVisit = `Dear ${lineItems["First Name"]},\n
Ho Ho Ho, it's Christmas time again! I am very proud to tell you that you have made it to my nice list this year for beings so good year-round. The elves at the workshop have already finished wrapping all the presents and I will be visiting your home in ${lineItems["Location"]} on Christmas Eve to deliver them to you. I know you are just as excited about Christmas as I am but remember to sleep early or else I can’t deliver the presents!\n
Rudolph and the rest of the reindeer love seeing the ${lineItems["Nearby Landmark"]} every time we fly over your area. They also love eating the carrots bits that people seem to leave near the grass close to where we land. As for me, I love chocolate chip cookies which usually go really well with a nice glass of milk. Speaking of food, I heard that you are going to have ${lineItems["Christmas Dinner Item"]} for dinner this Christmas, how delicious! I have to go now because all this talk about food is making me very hungry and it is time for dinner here at the North Pole. I just want to let you know again that I am very proud of you this year and I can’t wait to visit and bring you your present! Have a very Merry Christmas!`;

  switch (letter.name) {
    case "Nice List":
      return {
        numOfItems,
        fontSize: 18,
        lineHeight: 23,
        width: 60,
        letter: niceList,
      };
    case "The Present":
      return {
        numOfItems,
        fontSize: 19,
        lineHeight: 25,
        width: 56,
        letter: thePresent,
      };
    case "Christmas Coal":
      return {
        numOfItems,
        fontSize: 17.5,
        lineHeight: 26,
        width: 60,
        letter: christmasCoal,
      };
    case "Family History":
      return {
        numOfItems,
        fontSize: 18,
        lineHeight: 26,
        width: 60,
        letter: familyHistory,
      };
    case "The Visit":
      return {
        numOfItems,
        fontSize: 16.5,
        lineHeight: 21,
        width: 60,
        letter: theVisit,
      };
  }
}

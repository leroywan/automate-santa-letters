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
            orders(first: 1, query: "name:#${req.params.id}") {
              edges {
                node {
                  name
                  displayFulfillmentStatus
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
            }
          }
        
        `,
      }
    )
  ).json();

  // console.log(JSON.stringify(orderData, null, 2));

  const letterData = getLetterFromData(orderData, req.query.item);
  res.json(letterData);
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

function getLetterFromData(r, item = 0) {
  const letter = r.data.orders.edges[0].node.lineItems.edges[item].node;
  const lineItems = {};
  letter.customAttributes.forEach((item) => {
    lineItems[item.key] = `<b>${item.value.trim()}</b>`;
  });

  const orderNumber = r.data.orders.edges[0].node.name;
  const numOfItems = r.data.orders.edges[0].node.lineItems.edges.length;

  const orderInfo = {
    orderNumber,
    numOfItems,
    lineItems,
    envelopeName: lineItems["Envelope Name"],
    name: letter.name,
  };

  const niceList = `Dear ${lineItems["First Name"]},\n
I looked at my naughty list a few minutes ago and there were a lot of names written on it. I can’t believe there were more naughty children than nice ones this year! With that said, I have checked twice, and I am extremely happy to announce that you are not on the naughty list but actually one of the top names on my official nice list this year! It is usually hard for me to decide which child gets to be on the nice list but you made the decision very easy for me this year because ${lineItems["Good Behaviour"]}.\n
Our elves here at the workshop heard about the good news and they are planning on putting a little extra effort into your present. I will be visiting your home in ${lineItems["Location"]} on Christmas Eve and Rudolph is very excited about it because he loved seeing the beautiful Christmas lights around your neighbourhood last time we flew by. Make sure to be in bed early and we will try to land the sleigh quietly when we arrive. Keep up the amazing work ${lineItems["First Name"]}!`;

  const thePresent = `Merry Christmas ${lineItems["First Name"]}!\n
The elves at the workshop and I are all very busy preparing the mountains of toys that we will be delivering on Christmas Eve. I am very happy to announce that I will be visiting your home at ${lineItems["Location"]}, it has been a long time but I loved the ${lineItems["Landmark"]} the last time I visited.\n
Have you been a good this year? I have been making a list and checking it twice and it tells me that you were very good this year! Every year, Santa brings toys to children who are nice to others, work hard, and listen to their parents - and you are one of them! Your ${lineItems["Mom or Dad"]} told me that you wanted a ${lineItems["Present Name"]} this Christmas and I will do my best to bring you that or something made here in The Workshop by the elves. I am so proud of you this year ${lineItems["First Name"]}, have a very Merry Christmas!`;

  const christmasCoal = `Dear ${lineItems["First Name"]},\n
So there has been a rumour going on around town that Santa Claus gives out lumps of coals to children who had been behaving naughty throughout the year. I do not know how the rumour started spreading, but the rumour is actually true!\n
I have been looking at my list and checking it twice and your name was not on either the naughty or nice list, which means that you were neither naughty OR nice. If you start behaving nicer such as ${lineItems["Good Deed"]}, your name might just pop up in the Nice List. However, if you do something naughty in the upcoming weeks such as ${lineItems["Naughty Deed"]}, you may have to receive a piece of coal this Christmas! I look forward to delivering you a present this year and I will be keeping a close eye on you ${lineItems["First Name"]}! Until then, continue being good, enjoy your time with your family, and have a Merry Merry Christmas!`;

  const familyHistory = `Dear ${lineItems["First Name"]},\n
Merry Christmas! I was looking at the nice list that I have made a long time ago and guess what? Both your parents were at the top of my nice list every year when they were a child, your grandparents too! I wonder if you would be able to keep this streak going for your family because it really is an incredible family achievement!\n
People usually see Christmas as a holiday to receive presents and play, but Christmas is also a holiday to spend time with your family - and you are blessed with a wonderful, loving, family. ${lineItems["First Name"]}, I am very proud of you this year, especially when you ${lineItems["Good Deed"]}. I can’t wait until I visit your home in ${lineItems["Location"]} on Christmas Eve to deliver you your present. I have to go now but until then, continue setting an amazing example and enjoy this lovely Christmas spirit with your family! Ho Ho Ho!`;

  const theVisit = `Dear ${lineItems["First Name"]},\n
Ho Ho Ho, it's Christmas time again! I am very proud to tell you that you have made it to my nice list this year for being so good year-round. The elves at the workshop have already finished wrapping all the presents and I will be visiting your home in ${lineItems["Location"]} on Christmas Eve to deliver them to you. I know you are just as excited about Christmas as I am but remember to sleep early or else I can’t deliver the presents!\n
Rudolph and the rest of the reindeer love seeing the ${lineItems["Nearby Landmark"]} every time we fly over your area. They also love eating the carrots bits that people seem to leave near the grass close to where we land. As for me, I love chocolate chip cookies which usually go really well with a nice glass of milk. Speaking of food, I heard that you are going to have ${lineItems["Christmas Dinner Item"]} for dinner this Christmas, how delicious! I have to go now because all this talk about food is making me very hungry and it is time for dinner here at the North Pole. I just want to let you know again that I am very proud of you this year and I can’t wait to visit and bring you your present! Have a very Merry Christmas!`;

  const gettingOlder = `Dear ${lineItems["First Name"]},\n
Merry Christmas from the North Pole! I cannot wait until Christmas Eve when I come visit your home in ${lineItems["Location"]} to see all the beautiful decorations that you have put up. It is starting to get really snowy here in the North Pole and the elves have been building a giant snowman around my workshop – it is almost as tall as the workshop itself!\n
Oh, and before I forget, I just want to congratulate you for making this year’s official nice list! I have already checked twice and there is no doubt that you have been an amazing child year-round. I remembered seeing your name beside ${lineItems["Friend or Family"]}'s name on my list last year and I can’t believe you are already ${lineItems["Age"]} years old this year. You have grown up so much and I am super proud of you for setting such a great example again. Keep up the good work and don’t forget to go to bed early on Christmas Eve!`;

  const goodGirl = `Dear ${lineItems["First Name"]},\n
Merry Christmas! There were a lot of naughty girls this year, especially from your school ${lineItems["School Name"]}, which is why I checked twice to make sure that you really made it to my nice list this year - and you did! Both Mrs. Claus and I are really impressed this year by all of your accomplishments and we are both super proud of you.\n
The elves at The Workshop are currently preparing toys for this Christmas season and they told me that they made ten million dolls in the last ten days! Your ${lineItems["Mom or Dad"]} already told me about what you wanted for Christmas and I will try my very best to get that for you. Until then, continue being a good girl and I will visit your home on Christmas Eve! Leave me a cookie before I arrive if you want to be extra good, Ho Ho Ho!`

  const christmasLights = `Dear ${lineItems["First Name"]},\n
Look outside your window, do you see all those beautiful Christmas lights? Few people know about this, but Christmas lights have been around for as long as Christmas itself! Over a hundred years ago, I was delivering presents to your neighbourhood at ${lineItems["Neighbourhood Name"]} and people used to put small candles around Christmas trees to guide my reindeer through the night - it was much, much harder to deliver my presents back then since lights were not even invented yet!\n
Before I get too distracted talking about Christmas lights, I want to congratulate you for being so good this year! I can’t wait until I visit your home and deliver you your lovely present and see the ${lineItems["Nearby Landmark"]} again, it was so beautiful last Christmas! I have to go now because the reindeer are waiting for me to feed them. For now, enjoy the beautiful Christmas lights and have a Merry, Merry Christmas!`

  const winterWonderland = `Dear ${lineItems["First Name"]},\n
Ho Ho Ho, Merry Christmas! Congratulations for making it to my official nice list this year! One of my favourite things to do every Christmas is to send letters to children who have been excellent throughout the year and you are one of them. It is a winter wonderland up here in the North Pole and the elves and reindeer are having so much fun playing in the snow. Can you believe that the elves worked together to build a snowman the size of my Workshop the other day? It is incredible what you can achieve when teamwork is involved! Rudolph is so excited about the giant snowfall last night that his nose is glowing as red as ever! Speaking of winter wonderland, you should go outside and build a snowman with ${lineItems["Family or Friend"]} since the snow is perfect for it right now! I can’t wait until Christmas Eve during my visit to ${lineItems["Location"]} and see how beautifully decorated everything is this year! In the meantime, keep being good and maybe roast some chestnuts with your family and friends while we count down to Christmas day.`

  const firstChristmas = `Dear ${lineItems["First Name"]},\n
I have been waiting to write a letter to you ever since the moment I heard you were born. My name is Santa Claus and I travel from the North Pole every year during Christmas time with my reindeer to bring presents to children who have been good throughout the year. I have a list of every children’s name in the world and I check that list twice to make sure that presents only get delivered to the good children while the naughty ones get a lump of coal instead.\n
You are still so tiny, but you have already accomplished so much this year and I am super proud of you for that. As you get older and wiser, you will start to understand the true meaning of Christmas and it will be even more magical than you could have ever imagined. I will be watching you on your journey growing up and I hope to see your name on my nice list next year and every year after that. I know you would be sound asleep, but I cannot wait until I visit you on Christmas Eve to deliver you your present. Have a very merry Christmas.\n
Santa`

  const elfOnTheShelf = `Dear ${lineItems["Name(s)"]},\n
I am extremely delighted to introduce you to this magical elf named ${lineItems["Elf Name"]} this Christmas. Every day between now and Christmas Eve, ${lineItems["Elf Name"]} will be at the house seeing if you have been behaving naughty or nice. ${lineItems["Elf Name"]} is one of the best at the job and will be reporting to me every night about all observations made at the house. Each morning, your elf may decide to move to a new location since being in the same spot for too long gets a bit tiring. You may speak with ${lineItems["Elf Name"]} during the day but there is one rule that you have to follow very strictly: you can not touch ${lineItems["Elf Name"]}. If you do, the elf’s power will be lost and won’t be able to return to the North Pole!\n
I look forward to visiting you on Christmas Eve. Until then, enjoy the company of your new magical elf friend. ${lineItems["Elf Name"]} is a naughty one and may try to do some silly tricks around the house so be on the lookout for anything strange happening. Until then, be good because ${lineItems["Elf Name"]} sees all the good and bad that goes on in the house!`

  const washYourHands = `Dear ${lineItems["First Name"]},\n
I heard that there is a big virus going on and many people are staying home this year to prevent it from spreading. In the North Pole, the elves, the reindeer, and I are doing everything we can to make sure we stay safe by wearing masks and washing our hands regularly. The reindeer would wash their hooves in our soapy snow while the elves would bathe themselves in our magical hot spring - it is so important to be clean so you need to remember to wash your hands as often as you can!\n
${lineItems["First Name"]}, I have been keeping a close eye on you this year and I have noticed that you have been a very good ${lineItems["Boy or Girl"]} lately. Since you have been so good, I crafted something super special for you in my workshop - I hope that you like it. Rudolph and I cannot wait to see the beautiful lights when we fly our sleigh out to visit ${lineItems["Location"]} during Christmas. Keep up the amazing work, wash your hands, and enjoy this wonderful winter wonderland! I’ll see you soon. Ho Ho Ho, Merry Christmas!`

  const customLetter = `${lineItems["Custom Message"]}`;

  switch (letter.name.toLowerCase()) {
    case "nice list":
      return {
        ...orderInfo,
        fontSize: 18,
        lineHeight: 23,
        width: 60,
        letter: niceList,
      };
    case "the present":
      return {
        ...orderInfo,
        fontSize: 19,
        lineHeight: 25,
        width: 56,
        letter: thePresent,
      };
    case "christmas coal":
      return {
        ...orderInfo,
        fontSize: 17.5,
        lineHeight: 26,
        width: 60,
        letter: christmasCoal,
      };
    case "family history":
      return {
        ...orderInfo,
        fontSize: 18,
        lineHeight: 26,
        width: 60,
        letter: familyHistory,
      };
    case "the visit":
      return {
        ...orderInfo,
        fontSize: 16.5,
        lineHeight: 21,
        width: 60,
        letter: theVisit,
      };
    case "getting older":
      return {
        ...orderInfo,
        fontSize: 18,
        lineHeight: 26,
        width: 58,
        letter: gettingOlder,
      };
    case "good girl":
      return {
        ...orderInfo,
        fontSize: 18,
        lineHeight: 26,
        width: 58,
        letter: goodGirl,
      };
    case "christmas lights":
      return {
        ...orderInfo,
        fontSize: 17,
        lineHeight: 27,
        width: 62,
        letter: christmasLights,
      };
    case "winter wonderland":
      return {
        ...orderInfo,
        fontSize: 16.5,
        lineHeight: 21,
        width: 60,
        letter: winterWonderland,
      };
    case "first christmas":
      return {
        ...orderInfo,
        fontSize: 17,
        lineHeight: 21,
        width: 60,
        letter: firstChristmas,
      };
    case "elf on the shelf":
      return {
        ...orderInfo,
        fontSize: 17,
        lineHeight: 23,
        width: 60,
        letter: elfOnTheShelf,
      };
    case "wash your hands (covid)":
      return {
        ...orderInfo,
        fontSize: 17,
        lineHeight: 23,
        width: 60,
        letter: washYourHands
      }
    case "custom letter":
      return {
        ...orderInfo,
        fontSize: 16.5,
        lineHeight: 21,
        width: 60,
        letter: customLetter
      }
  }
}

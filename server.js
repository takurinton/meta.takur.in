const express = require("express");
const { JSDOM } = require("jsdom");

const app = express();
const port = process.env.PORT || 3000;

const getMetaTags = (html, link) => {
  const description = html.getElementsByName("description")[0];

  const ogImage = html.querySelector('meta[property="og:image"]');
  const ogImageContent = ogImage ? ogImage.content : "";

  if (!link) return;

  const domain = link.match(/^https?:\/{2,}(.*?)(?:\/|\?|#|$)/)[1];
  let image;
  if (ogImage === undefined) {
    image = "";
  } else if (/^https?:\/\//.test(ogImageContent)) {
    const file = ogImageContent;
    const fileLink = file.match(/^https?:\/{2,}(.*?)(?:\/|\?|#|$)/);

    if (fileLink === null) image = `https://${domain}${file.slice(7)}`;
    else if (fileLink[1] !== domain) {
      const filePathSplit = file.split("/")[3];
      image = `https://${fileLink[1]}/${filePathSplit}`;
    }
  } else {
    const file = ogImageContent;
    const fileLink = file.match(/^https?:\/{2,}(.*?)(?:\/|\?|#|$)/);
    if (fileLink === null) {
      image = `https://${domain}${file.slice(7)}`;
    } else {
      const filePathSplit = file.split("/").slice(3).join("/");
      image = `https://${domain}/${filePathSplit}`;
    }
  }

  return {
    title: html.title,
    description: description === undefined ? "" : description.content,
    image: image ?? "",
  };
};

app.get("/", (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("No URL provided");

  fetch(url)
    .then((response) => response.text())
    .then((htmlString) => {
      const html = new JSDOM(htmlString).window.document;
      const metaTags = getMetaTags(html, url);

      res.json(metaTags);
    });
});

app.listen(port, () => console.log(`HelloNode app listening on port ${port}!`));

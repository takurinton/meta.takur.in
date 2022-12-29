const express = require("express");
const cors = require("cors");
const { JSDOM } = require("jsdom");

const app = express();
const port = process.env.PORT || 3000;

const getMetaTag = (html) => {
  const headElement = html.head.children;
  const meta = Array.from(headElement).map((v) => {
    const property = v.getAttribute("property") ?? v.getAttribute("name");
    return {
      [property]: v.content,
    };
  });

  let res = {};
  meta.forEach((v) => {
    if (v["og:title"] || v["twitter:title"])
      res.title = v["og:title"] ?? v["twitter:title"];
    if (v["og:description"] || v["twitter:description"])
      res.description = v["og:description"] ?? v["twitter:description"];
    if (v["og:image"] || v["twitter:image"])
      res.image = v["og:image"] ?? v["twitter:image"];
  });

  return res;
};

app.use(cors());

app.get("/api", (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send("No URL provided");

  fetch(url)
    .then((response) => response.text())
    .then((htmlString) => {
      const html = new JSDOM(htmlString).window.document;
      const metaTags = getMetaTag(html);

      res.json(metaTags);
    });
});

app.listen(port, () => console.log(`HelloNode app listening on port ${port}!`));

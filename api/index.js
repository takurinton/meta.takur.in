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

  const icon =
    html.querySelector('link[rel="icon"]') ||
    html.querySelector('link[rel="shortcut icon"]') ||
    html.querySelector('link[rel="apple-touch-icon"]');

  if (icon) {
    const href = icon.getAttribute("href");
    if (href.startsWith("/")) {
      const origin = new URL(baseUrl).origin;
      res.favicon = origin + href;
    } else {
      res.favicon = new URL(href, baseUrl).href;
    }
  } else {
    // fallback
    res.favicon = new URL("/favicon.ico", baseUrl).href;
  }

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

app.listen(port, () => console.log(`working meta.takur.in on ${port}!`));

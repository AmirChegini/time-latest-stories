const http = require("http");
const url = require("url");
const https = require("https");

const host = "localhost";
const port = 8000;

const crawler = (data) => {
  const updatedText = data.replace(/\n/g, "").replace(/  /g, "");

  const contentRegEx = /(?<=<li class="latest-stories__item">)(.*?)(?=<\/li>)/g;

  const titleRegEx =
    /(?<=<h3 class="latest-stories__item-headline">)(.*)(?=<\/h3>)/g;

  const urlRegEx = /(?<=<a href=")(.*?)(?=")/g;
  let content = updatedText.match(contentRegEx);
  let result = content.map((item) => {
    return {
      title: item.match(titleRegEx)[0],
      link: `https://time.com${item.match(urlRegEx)[0]}`,
    };
  });
  return result;
};

const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "Application/json");
  const reqUrl = url.parse(req.url).pathname;

  let data = "";
  if (reqUrl == "/getTimeStories") {
    await https
      .get("https://time.com", (resp) => {
        resp.on("data", (chunk) => {
          data += chunk.toString();
        });
        resp.on("end", () => {
          res.write(JSON.stringify(crawler(data)));
          res.end();
        });
      })
      .on("error", (err) => {
        console.log("Error: " + err.message);
      });
  } else {
    res.statusCode = 404;
    res.write("not found");
    res.end();
  }
});
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});

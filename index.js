const http = require("http");
const server = require("websocket").server;

const port = process.env.PORT || 1337;
const httpServer = http.createServer(function (request, response) {
  console.log(new Date() + " Received request for " + request.url);
  response.writeHead(404);
  response.end();
});

const wsServer = new server({
  httpServer: httpServer,
});
httpServer.listen(port, () => {
  console.log("Server listening at port : " + port);
});

const peersByCode = {};

wsServer.on("request", (request) => {
  const connection = request.accept();
  const id =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  connection.on("message", (message) => {
    const {code} = JSON.parse(message.utf8Data);
    if (!peersByCode[code]) {
      peersByCode[code] = [{connection, id}];
    } else if (!peersByCode[code].find((peer) => peer.id === id)) {
      peersByCode[code].push({connection, id});
    }

    peersByCode[code]
      .filter((peer) => peer.id !== id)
      .forEach((peer) => peer.connection.send(message.utf8Data));
  });
});

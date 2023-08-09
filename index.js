require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const https = require("https");
const fs = require("fs");

const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger_output.json");

var options = {
  key: fs.readFileSync("./certs/ssl-key.pem"),
  cert: fs.readFileSync("./certs/ssl-cert.pem"),
};

// defining the Express app
const app = express();

// adding Helmet to enhance your API's security
app.use(helmet());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Router and routes
const calculationsRouter = require("./routes/calculations");
app.use("/calc", calculationsRouter);

// Starting the server
/*
https.createServer(options, app).listen(443, () => {
  console.log("listening on port 443");
});
*/

app.listen(80, () => {
  console.log("HTTP server running on port 80");
});

// Swagger endpoint - /doc
app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Redirect basepath to Swagger
app.get("/", (req, res) => {
  res.redirect("/doc");
});

app.get(
  "/.well-known/acme-challenge/Bk36vQraWCLb2GiQZajzxWn4zLGMqXHru9pHWhbGKNc",
  (req, res) => {
    res.send(
      "Bk36vQraWCLb2GiQZajzxWn4zLGMqXHru9pHWhbGKNc.Sf7xyyKDbj8yEV1xrNYuEB4ZC-MjgZbliBF3ncDYYMY"
    );
  }
);

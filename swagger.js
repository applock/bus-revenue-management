const swaggerAutogen = require("swagger-autogen")();

const outputFile = "./swagger_output.json";
const endpointsFiles = ["./routes/*"];

const doc = {
  info: {
    version: "1.0.0",
    title: "Passenger Management System API",
    description: "Passenger Management System API Documentation",
  },
  //host: process.env.HOST + ":443",
  host: "localhost",
  basePath: "/",
  schemes: ["http","https"],
  consumes: ["application/json"],
  produces: ["application/json"],
};

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  require("./index.js");
});

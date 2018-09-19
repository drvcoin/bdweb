#! /usr/bin/env node

const InvalidArgumentException = require("../lib/common/Exception.js").InvalidArgumentException;
const Api = require("../lib/common/Api.js").Api;


class Router {
  
  constructor() {
    this.express = require("express");
    this.app = this.express();
  }


  init() {
    this.app.all("/", function(request, response) {
      response.set("Content-Type", "text/html");
      response.sendFile("views/index.html", { root : __dirname });
    });

    this.app.use(this.express.static("public"));

    let _this = this;

    this.app.all("/api/*", function(req, res) {
      let uri = Router.__parseUrl(req.path);
      let args = Router.__parseArguments(req);

      _this.__callApi(uri.path, uri.action, args, res)
        .then(result => {
          res.json(result);
        })
        .catch(ex => {
          res.status(500).json({
            Type : "Error",
            Code : ex.code ? ex.code : 1,
            Message : ex.message
          })
        });
    });
  }


  async run(port) {
    return new Promise(resolve => this.app.listen(port, resolve));
  }


  async __callApi(path, action, args, request, response) {
    let api = await Api.create(path);

    if (action) {
      let func = api[action];
      let method = func.bind(api);
      return await method(args, request, response);
    } else {
      return {
        Path : api.path,
        Type : api.type
      };
    }
  }

  
  static __parseUrl(path) {
    let result = { url : path };

    let components = path.split("/"); // example: ["", "api", "scheme", "path1".."pathn", "action"]
    if (components.length < 5 || components[0] !== "") {
      throw new InvalidArgumentException("path");
    }

    result.urltype = components[1];

    result.path = components[2] + ":/";
    for (let i = 3; i < components.length - 1; ++i) {
      result.path += "/" + components[i];
    }

    result.action = components[components.length - 1];

    if (result.action.startsWith("__")) {
      throw new InvalidArgumentException("path");
    }

    return result;
  }


  static __parseArguments(req) {
    let args = Object.assign({}, req.cookies, req.query);

    if (req.is("application/json") || req.is("application/x-www-form-urlencoded")) {
      args = Object.assign(args, req.body);
    }

    return args;
  }
}


module.exports = {
  Router : Router
};
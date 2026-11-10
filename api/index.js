"use strict";

const { server } = require("../server/server");
const handleRequest = server.listeners("request")[0];

// Keep all API routes in one function; static assets are served separately by Vercel.
module.exports = async function handler(req, res) {
  const url = new URL(req.url, "http://localhost");
  const route = url.searchParams.get("astraPath") || req.query?.astraPath;
  if (typeof route === "string") {
    url.searchParams.delete("astraPath");
    url.pathname = "/api/" + route;
    req.url = url.pathname + url.search;
  }
  if (!new URL(req.url, "http://localhost").pathname.startsWith("/api/")) {
    res.writeHead(404, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "unknown api" }));
  }
  return handleRequest(req, res);
};

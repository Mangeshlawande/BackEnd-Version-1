const http = require("http");
const fs = require("fs");
const path = require("path");

const port = 3000;

const server = http.createServer((req, res) => {
  const filePath = path.join(// I want to get absolute path 
    __dirname,// give access to current directory,
    req.url === "/" ? "index.html" : req.url // 
  );// pwd == dirname 
  console.log(filePath); //

  const extName = String(path.extname(filePath)).toLowerCase(); // return extension of path from last dot.
   // which type of filename I'm supporting. 
  const mimeTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".png": "text/png",
  };

  const contentType = mimeTypes[extName] || "application/octet-stream";
/**   ## request / response 
 * 1.head      2. body 
 * 1.1 metadata  2.1 content 
 * 
 * ## Informational Responses (100 - 199)
 * ## Successful Responses (200 - 299)
 * ## Redirectional Responses (300 - 399)
 * ## Client Error Responses (400 - 499)
 * ## Server Error Responses (500 - 599)
 */
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === "ENOENT")//error no entry
       {
        res.writeHead(404, { "Content-Type": "text/html" }); // metadata first 
        res.end("404: File Not Found BRooooo");
      }
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content, "utf-8");
    }
  });
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});


// http://localhost:3000

/**
 * Ngnx (Enginex) :: a popular web server ,(apache )
 * ngnx is an http and reverse proxy server , mail proxy server and generic server 
 
 *  Features ::
  serving static index files ,
  Serving web applications and APIs.
  Acting as a content delivery network (CDN) edge server.
  Proxying traffic to application servers like Node.js, Python, Ruby, or PHP.
  Hosting websites or web applications.
  Distributing requests to a pool of servers to prevent bottlenecks.
  Terminating SSL to offload encryption/decryption from backend servers.
  Setting up a secure, scalable web infrastructure.


 */

// const http = require('http');
// const fs = require('fs') // file system to handle the files 
// const path  = require('path');


// const  port = 3000;
// const server = http.createServer((req, res) => {

// })


// server.listen(port, ()=>{
//   console.log(`Server is listening on port ${port}`);
// })

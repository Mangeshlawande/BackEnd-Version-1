const http = require('http')
const fs = require('fs')
const path = require('path')

const port = 3000;


const server = http.createServer((req, res) => {
    const filePath = path.join(// I want to get absolute path 
        __dirname,// give access to current directory,
        req.url === "/" ? "index.html" : req.url // 
    );// pwd == dirname 
    console.log(filePath); //
    // extension name

    const extName = String(path.extname(filePath)).toLowerCase();
    // i can allow the type of file supporting
    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.png': 'text/png',
    }


    const contentType = mimeTypes[extName] || "application/octet-stream"


    fs.readFile(filePath, (err, content) => {
    if(err)
        if (err.code ==="ENOENT") {

            res.writeHead(404, { "Content-Type": 'text/html' })
            res.end("404: File Not Found !!")
            // how we can customize our 404 error :: PAGE NOT FOUND 

        } else {


            // meta data 
            res.writeHead(200, { "Content-Type": contentType });
            res.end(content, 'utf-8')
        }
    })

})

// Listening the server 

server.listen(port, () => {
    console.log(`server is listening on port ${port}`);

})
// http://localhost:3000

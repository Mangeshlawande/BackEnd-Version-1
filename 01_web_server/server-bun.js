import {serve} from 'bun';

/**
 * 
 */
let server = serve({
    fetch(request){
        const url = new URL(request.url);
        if(url.pathname === '/'){
            return new Response("Hello ice tea", {status : 200})
        }else if(url.pathname === '/ice-tea'){
            return new Response("Ice tea is always a good option ", {status : 200})
        }else{
            return new Response("404 not Found!! ", {status : 404})
        }
    },
    port  : 3000,
    hostname :'127.0.0.1'
});
console.log(`Listening on http://localhost:${server.port} ...`);



// import { serve } from 'bun';

// let server = serve({
//     fetch(request) {
//         const url = new URL(request.url, "http://127.0.0.1:3000"); // Use a valid base URL without spaces
//         if (url.pathname === '/') {
//             return new Response("Hello ice tea", { status: 200 });
//         } else if (url.pathname === '/ice-tea') {
//             return new Response("Ice tea is always a good option", { status: 200 });
//         } else {
//             return new Response("404 Not Found!!", { status: 404 });
//         }
//     },
//     port: 3000,
// });

// console.log(`Listening on http://127.0.0.1:3000 ...`);



//bun 


//  import {serve} from 'bun'

// const server = serve({
//     port: 3000,
//     fetch(req) {
//       return new Response("Bun!");
//     },
//   });
  
//   console.log(`Listening on http://localhost:${server.port} ...`);
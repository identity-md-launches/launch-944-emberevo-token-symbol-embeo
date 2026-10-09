import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','web');
const mime={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png'};
const server=http.createServer(async(req,res)=>{
  try {
    if(!['GET','HEAD'].includes(req.method)) {res.writeHead(405);res.end();return;}
    const url=new URL(req.url,'http://127.0.0.1');
    let relative=decodeURIComponent(url.pathname);
    if(relative==='/' || relative==='/token/embeo/' || relative==='/token/embeo') relative='/index.html';
    else if(relative.startsWith('/token/embeo/')) relative=relative.slice('/token/embeo'.length);
    const target=path.resolve(root,'.'+relative);
    if(!target.startsWith(root+path.sep) || !mime[path.extname(target)]) {res.writeHead(403);res.end();return;}
    const data=await fs.readFile(target);
    res.writeHead(200,{'content-type':mime[path.extname(target)],'cache-control':'no-store','x-content-type-options':'nosniff','content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self' https://ethereum-rpc.publicnode.com https://rpc.mevblocker.io; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"});
    res.end(req.method==='HEAD'?undefined:data);
  } catch {res.writeHead(404);res.end('Not found');}
});
server.listen(8789,'127.0.0.1',()=>console.log('EMBEO local preview: http://127.0.0.1:8789/token/embeo/'));

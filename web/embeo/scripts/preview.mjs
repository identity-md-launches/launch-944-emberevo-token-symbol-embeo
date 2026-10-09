import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {publicFiles} from './public-files.mjs';
export function previewServer() {
  const root=new URL('../../../dist/',import.meta.url);
  const types={html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',mjs:'text/javascript; charset=utf-8',json:'application/json',png:'image/png'};
  return createServer(async(req,res)=>{
    const pathname=new URL(req.url,'http://localhost').pathname;
    const file=pathname==='/preview/'?'index.html':pathname.startsWith('/preview/')?pathname.slice(9):'';
    if(!publicFiles.includes(file)){res.writeHead(404);res.end('Not in public export');return;}
    try {const data=await readFile(new URL(file,root));res.writeHead(200,{'content-type':types[file.split('.').pop()],'cache-control':'no-store'});res.end(data);}
    catch {res.writeHead(404);res.end('Build the page first');}
  });
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {
  const server=previewServer();
  server.listen(Number(process.env.EMBEO_PREVIEW_PORT||4173),'127.0.0.1',()=>console.log('Preview: http://127.0.0.1:'+server.address().port+'/preview/'));
}

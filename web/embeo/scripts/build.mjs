import {readFile, mkdir, copyFile, readdir, lstat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {publicFiles} from './public-files.mjs';
import {verifyReference} from './verify-reference.mjs';
const source=fileURLToPath(new URL('../',import.meta.url));
const repo=path.resolve(source,'../..'), out=path.join(repo,'dist');
await verifyReference();
async function files(dir,prefix='') {
  const result=[];
  for(const entry of await readdir(dir,{withFileTypes:true}).catch(e=>{if(e.code==='ENOENT')return [];throw e;})) {
    assert(!entry.isSymbolicLink(),'symlinks are outside the public scope');
    const name=prefix+entry.name;
    result.push(...(entry.isDirectory()?await files(path.join(dir,entry.name),name+'/'):[name]));
  }
  return result;
}
// Fail closed instead of silently publishing or deleting unexpected output.
const extras=(await files(out)).filter(p=>!publicFiles.includes(p));
assert.equal(extras.length,0,'dist contains unapproved files: '+extras.join(', '));
const manifest=[];
for(const file of publicFiles) {
  const from=path.join(source,file), to=path.join(out,file);
  assert((await lstat(from)).isFile(),'source must be an ordinary file: '+file);
  const bytes=await readFile(from);
  if(/\.(html|css|mjs|json)$/.test(file)) {
    const text=bytes.toString();
    assert(!/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text),'contact email in export');
    assert(!/mailto:|window\.ethereum|ethereum\.request|eth_sendRawTransaction|eth_sendTransaction|personal_sign/.test(text),'out-of-scope action in export');
  }
  await mkdir(path.dirname(to),{recursive:true});
  await copyFile(from,to);
  manifest.push({path:file,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
}
const html=await readFile(path.join(out,'index.html'),'utf8');
assert(!/\b(?:src|href)=["']\//.test(html),'absolute runtime URL');
assert(!/<(?:iframe|model-viewer|canvas)\b/i.test(html),'unapproved embedded surface');
for(const match of html.matchAll(/\b(?:src|href)="([^"#:]+)"/g)) {
  const link=match[1];
  if(!/^https:/.test(link)) assert(publicFiles.includes(link),'unexported asset: '+link);
}
const logo=manifest.find(x=>x.path==='assets/emberevo-flame-64.png');
assert.equal(logo.sha256,'771f691c330cf00a0a9038b0aac718fd519000872f3cfb0532113739fccac4b4');
await mkdir(path.join(repo,'artifacts/embeo'),{recursive:true});
const {writeFile}=await import('node:fs/promises');
await writeFile(path.join(repo,'artifacts/embeo/public-export.json'),JSON.stringify({
  route:'official build-website continuation',directory:'dist',files:manifest,
  totalBytes:manifest.reduce((sum,x)=>sum+x.bytes,0),
  publication:'Prepared for the official Website publisher; no IPFS receipt available locally.',
  independentReview:'pending'
},null,2)+'\n');
const reference=JSON.parse(await readFile(path.join(repo,'docs/embeo/reference/public-manifest.json'),'utf8'));
const destinations=[];
for(const original of reference.files.filter(x=>x.path.startsWith('web/') || x.path==='scripts/test-fees.mjs')) {
  const relative=original.path.startsWith('web/')?original.path.slice(4):original.path;
  const final=await readFile(path.join(source,relative));
  const digest=createHash('sha256').update(final).digest('hex');
  destinations.push({reference:original.path,referenceSha256:original.sha256,destination:'web/embeo/'+relative,
    bytes:final.length,sha256:digest,byteIdentical:digest===original.sha256,published:publicFiles.includes(relative)});
}
await writeFile(path.join(repo,'artifacts/embeo/destination-digests.json'),JSON.stringify(destinations,null,2)+'\n');
console.log('Built '+manifest.length+' allowlisted public files in dist/ ('+manifest.reduce((sum,x)=>sum+x.bytes,0)+' bytes).');

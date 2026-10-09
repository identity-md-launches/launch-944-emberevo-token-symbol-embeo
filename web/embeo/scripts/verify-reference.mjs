import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
export async function verifyReference() {
  const root=fileURLToPath(new URL('../../../docs/embeo/reference/',import.meta.url));
  const raw=await readFile(path.join(root,'public-manifest.json'));
  const record=JSON.parse(await readFile(new URL('../../../artifacts/embeo/reference-verification.json',import.meta.url),'utf8'));
  assert.equal(createHash('sha256').update(raw).digest('hex'),record.manifestSha256);
  const manifest=JSON.parse(raw);
  async function walk(dir,prefix='') {
    let count=0;
    for(const entry of await readdir(dir,{withFileTypes:true})) {
      assert(!entry.isSymbolicLink());
      const relative=prefix+entry.name;
      if(entry.isDirectory()){count+=await walk(path.join(dir,entry.name),relative+'/');continue;}
      if(relative==='public-manifest.json')continue;
      const expected=manifest.files.find(f=>f.path===relative);
      assert(expected,'file absent from pinned manifest: '+relative);
      const actual=await readFile(path.join(dir,entry.name));
      assert.equal(actual.length,expected.bytes,relative);
      assert.equal(createHash('sha256').update(actual).digest('hex'),expected.sha256,relative);
      count++;
    }
    return count;
  }
  const count=await walk(root);
  console.log('Verified '+count+' included reference files against the pinned manifest.');
}
if(process.argv[1]===fileURLToPath(import.meta.url))await verifyReference();

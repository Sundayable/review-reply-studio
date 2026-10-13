import {mkdir,copyFile,cp,rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'dist');await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
for(const name of ['index.html','style.css','app.js','engine.js']) await copyFile(path.join(root,'src',name),path.join(out,name));
await cp(path.join(root,'public'),out,{recursive:true});
console.log('Built static app to dist (no runtime dependencies).');

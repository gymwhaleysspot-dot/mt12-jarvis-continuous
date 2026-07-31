#!/usr/bin/env node
import fs from 'node:fs';
const file='factory.html';
const tags=['<script src="factory-admin.js?v=3"></script>','<script src="factory-tool-ui.js?v=1"></script>','<script src="scratch-builder-ui.js?v=1"></script>','<script src="autonomous-one-button-ui.js?v=1"></script>'];
let s=fs.readFileSync(file,'utf8'),changed=false;
for(const tag of tags){
  const name=tag.match(/src="([^"]+)/)?.[1].split('?')[0];
  if(name&&!s.includes(name)){s=s.replace('</body>',tag+'</body>');changed=true;}
}
if(changed){fs.writeFileSync(file,s);console.log('Installed factory administration, source compiler, scratch builder, and autonomous one-button Lua architect.');}
else console.log('Factory HTML controls already installed.');

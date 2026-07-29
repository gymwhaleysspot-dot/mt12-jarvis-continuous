#!/usr/bin/env node
import fs from 'node:fs';
const file='factory.html',tag='<script src="factory-admin.js?v=2"></script>';
let s=fs.readFileSync(file,'utf8');
if(!s.includes('factory-admin.js')){s=s.replace('</body>',tag+'</body>');fs.writeFileSync(file,s);console.log('Installed factory vault admin controls.')}else console.log('Factory vault admin controls already installed.');

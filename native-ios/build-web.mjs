// Preparatory native asset bundler only. Does not build or sign an iOS binary.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here,'..'), dest = path.join(here,'www');
if (fs.existsSync(dest)) fs.rmSync(dest,{recursive:true,force:true});
fs.mkdirSync(dest,{recursive:true});
const dirs = ['assets','css','da','en','experimente','js','src','utils','vendor'];
const files = ['index.html','init.js','offline.html','manifest.webmanifest','robots.txt'];
for (const name of dirs) fs.cpSync(path.join(root,name),path.join(dest,name),{recursive:true});
for (const name of files) fs.copyFileSync(path.join(root,name),path.join(dest,name));
fs.mkdirSync(path.join(dest,'data','i18n'),{recursive:true});
for (const name of ['spots.json','tours.json','play-ideas.json','index.json','partners.json','codes.json','community-play.json'])
  fs.copyFileSync(path.join(root,'data',name),path.join(dest,'data',name));
for (const lang of ['de','en','da']) fs.copyFileSync(path.join(root,'data','i18n',lang+'.json'),path.join(dest,'data','i18n',lang+'.json'));
// No service-worker.js in the native package: updates are delivered by signed app binaries,
// not via GitHub Pages or a second competing SW update mechanism.
console.log('Native static web assets prepared at native-ios/www. Device/Xcode validation still required.');

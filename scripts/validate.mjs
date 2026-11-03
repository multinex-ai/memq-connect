import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const json=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const plugin=json('memq-brain/plugin.json');
const claude=json('memq-brain/.claude-plugin/plugin.json');
assert.equal(plugin.name,claude.name);assert.equal(plugin.version,claude.version);
assert.equal(plugin.license,'MIT');
for(const market of ['.claude-plugin/marketplace.json','.agents/plugins/marketplace.json']) {
  for(const entry of json(market).plugins){
    const folder=typeof entry.source==='string'?entry.source:entry.source.path;
    assert(fs.existsSync(path.join(root,folder,'plugin.json')),`Missing plugin: ${folder}`);
    assert.equal(entry.name,plugin.name);
  }
}
const remote=json('memq-brain/mcp.json').mcpServers.memq;
assert.equal(remote.url,json('memq-brain/.mcp.json').memq.url);
assert.equal(remote.type,'streamable-http');
assert.equal(remote.extensions['com.openai'].auth.client.mode,'dcr');
assert(!remote.headers && !remote.command,'Hosted plugin must not contain static auth or executables');
const ui=plugin.extensions['com.openai'];
for(const file of [ui.onboardingSkill,ui.interface.logo,ui.interface.composerIcon])assert(fs.existsSync(path.join(root,'memq-brain',file)),`Missing asset ${file}`);
const files=fs.readdirSync(path.join(root,'memq-brain'),{recursive:true,withFileTypes:true});
let count=0;
for(const f of files){
 if(!f.isFile())continue;
 const full=path.join(f.parentPath,f.name);
 assert(!/^(\.env|auth\.json|config\.toml|credentials)/i.test(f.name),`Sensitive filename: ${f.name}`);
 if(f.name==='SKILL.md'){
  const t=fs.readFileSync(full,'utf8');const name=t.match(/^name: (.+)$/m)?.[1];
  assert.equal(name,path.basename(path.dirname(full)));assert(/^[a-z0-9-]{1,64}$/.test(name));
  assert(/^description: .+/m.test(t));assert(t.startsWith('---\n'));assert(t.length<12000);count++;
 }
 if(/\.(json|md|mjs)$/.test(f.name))assert(!/(?:sk_live_|sk_test_|ghp_|github_pat_|mnxoa_)[a-zA-Z0-9_]{16,}/.test(fs.readFileSync(full,'utf8')),`Credential-like content in ${f.name}`);
}
assert.equal(count,5);
console.log(`Validated ${plugin.name} ${plugin.version}: ${count} skills, two marketplaces, OAuth config, assets, and publication file checks.`);

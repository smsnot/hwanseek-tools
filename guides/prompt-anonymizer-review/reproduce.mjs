import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRequire,stripTypeScriptTypes} from 'node:module';
const option=name=>process.argv.find(x=>x.startsWith(name+'='))?.slice(name.length+1);
const runtime=path.resolve(option('--runtime')??process.cwd());
const source=path.resolve(option('--source')??path.join(runtime,'../prompt-anonymizer-review'));
const reportFolder=path.dirname(fileURLToPath(import.meta.url));
process.chdir(runtime);
await fs.mkdir(path.join(runtime,'core'),{recursive:true});
for(const name of await fs.readdir(path.join(source,'web/packages/core/src'))){
 if(!name.endsWith('.ts'))continue;
 const input=await fs.readFile(path.join(source,'web/packages/core/src',name),'utf8');
 await fs.writeFile(path.join(runtime,'core',name.replace(/\.ts$/,'.js')),stripTypeScriptTypes(input,{mode:'transform'}));
}
const {Anonymizer,RestoreSession,restoreText,TransformersNerBackend}=await import(pathToFileURL(path.join(runtime,'core/index.js')).href);
const require=createRequire(path.join(runtime,'package.json'));
const out=reportFolder;
const fixtures=JSON.parse(await fs.readFile(path.join(out,'fixtures.json'),'utf8'));
const results={commit:'d7d5771ffd684d1f5dde4d0ba38d3c4f8cf3d3d7',node:process.version,dependencies:{transformers:'4.2.0',ibantools:'4.5.4'},scope:'Actual upstream TypeScript core, with types removed only. No GUI or LLM tested. Synthetic data only.',regexOnly:[],ner:[],session:[]};
for(const item of fixtures.cases){
 const engine=new Anonymizer(item.options??{});
 const value=await engine.anonymize(item.text,{language:item.language});
 const restored=engine.deanonymize(value.text,value.mapping);
 results.regexOnly.push({...item,anonymized:value.text,mapping:value.mapping,entities:value.entities,restored,exactRoundTrip:restored===item.text,restoreDetails:restoreText(value.text,value.mapping)});
}
const session=new RestoreSession({engine:new Anonymizer()});
const first=await session.anonymize('Write to mara.ellison@example.com.',{language:'en'});
await session.anonymize('Write to riley.north@example.com.',{language:'en'});
results.session.push({id:'restore_first_after_second_session',firstAnonymized:first.text,restored:await session.restore(first.text),expected:'Write to mara.ellison@example.com.',classification:'Latest-mapping session limitation; no concurrent execution required.'});
let release;
const gate=new Promise(r=>release=r);
const delayed=new RestoreSession({engine:{async anonymize(text,options){await gate;return new Anonymizer().anonymize(text,options);}}});
const pending=delayed.anonymize('Write to mara.ellison@example.com.',{language:'en'});
await delayed.clear();
const mappingImmediatelyAfterClear=await delayed.loadMapping();
release();
await pending;
results.session.push({id:'clear_during_inflight_anonymize',mappingImmediatelyAfterClear,mappingAfterCompletion:await delayed.loadMapping(),classification:'Executed upstream RestoreSession with a deterministic delayed adapter around the actual upstream anonymizer. UI not tested.'});
const malformed=['<Email_1>','&lt;Email_1&gt;','<Email_99>','Email_1'];
for(const reply of malformed)results.session.push({id:'synthetic_llm_reply',reply,restored:restoreText(reply,{'<Email_1>':'mara.ellison@example.com'})});
await fs.writeFile(path.join(out,'executed-results.json'),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify({regexOnly:results.regexOnly.map(r=>({id:r.id,anonymized:r.anonymized,exactRoundTrip:r.exactRoundTrip})),session:results.session},null,2));

if(process.argv.includes('--ner')){
 try{
  const {env}=await import(pathToFileURL(path.join(path.dirname(require.resolve('@huggingface/transformers')),'transformers.node.mjs')).href);
  env.cacheDir=path.resolve('../prompt-anonymizer-model-cache');
  env.allowRemoteModels=process.argv.includes('--download-model');
  const ner=new TransformersNerBackend({device:'cpu',onProgress:e=>{if(e.status==='ready')console.log('NER model ready.');}});
  await ner.warmup('en');
  const extended={id:'long_prompt_late_name',language:'en',text:'The sample contains ordinary project notes. '.repeat(180)+'Customer Mara Ellison asked for an answer.'};
  await fs.writeFile(path.join(out,'long-prompt-fixture.txt'),extended.text+'\n');
  for(const item of [...fixtures.cases.filter(x=>['ordinary_name_repeated','name_email_mixed','name_baseline_overlap','name_deny_overlap','lowercase_name','unicode_email','quoted_email'].includes(x.id)),extended]){
   const engine=new Anonymizer({ner,...item.options});
   const value=await engine.anonymize(item.text,{language:item.language});
   const restored=engine.deanonymize(value.text,value.mapping);
   results.ner.push({...item,anonymized:value.text,mapping:value.mapping,entities:value.entities,restored,exactRoundTrip:restored===item.text});
  }
  results.nerStatus={status:'executed',model:'Xenova/bert-base-NER',device:ner.device,remoteModelDownloadsAllowed:env.allowRemoteModels};
 }catch(error){results.nerStatus={status:'not executed',error:error.stack};}
 await fs.writeFile(path.join(out,'executed-results.json'),JSON.stringify(results,null,2)+'\n');
 console.log(JSON.stringify({nerStatus:results.nerStatus,ner:results.ner.map(r=>({id:r.id,characters:r.text.length,entities:r.entities.length,exactRoundTrip:r.exactRoundTrip,anonymized:r.anonymized.length<250?r.anonymized:r.anonymized.slice(-100)}))},null,2));
}

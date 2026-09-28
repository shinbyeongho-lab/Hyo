import {sourceCatalog,type SourceStatus} from './sources';
let cache:{at:number;value:SourceStatus[]}|undefined;
let pending:Promise<SourceStatus[]>|undefined;
function plain(html:string){return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<!--([\s\S]*?)-->/g,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim()}
export async function loadSources(){
 if(cache&&Date.now()-cache.at<6*60*60*1000)return cache.value;
 if(pending)return pending;
 pending=Promise.all(sourceCatalog.map(async source=>{const attemptedAt=new Date().toISOString();try{const r=await fetch(source.url,{signal:AbortSignal.timeout(10000),headers:{Accept:'text/html'},redirect:'error'});if(!r.ok||!r.headers.get('content-type')?.includes('text/html'))throw Error('unavailable');const text=plain(await r.text());const i=text.indexOf(source.marker);if(i<0)throw Error('content changed');return {...source,status:'live' as const,attemptedAt,checkedAt:attemptedAt,excerpt:text.slice(i,i+1800)}}catch{return {...source,status:'snapshot' as const,attemptedAt}}})).then(value=>{cache={at:Date.now(),value};return value}).finally(()=>{pending=undefined});
 return pending;
}

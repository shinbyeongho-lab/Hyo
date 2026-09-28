import {credentials} from '@/lib/ai-credentials';
import {requestAI,AIServiceError} from '@/lib/ai-provider-request';
export const runtime='nodejs';
export const maxDuration=120;
import {subjects,topics,type Question} from '@/lib/learning';
import {weekdays,dayFocus,addDays} from '@/lib/weekly';
import {loadSources} from '@/lib/source-loader';
import {editorialInstructions,worksheetPlan,skills,skillAt} from '@/lib/worksheet';
const schema={type:'object',properties:{questions:{type:'array',items:{type:'object',properties:{prompt:{type:'string'},passage:{type:'string'},choices:{type:'array',items:{type:'string'}},answer:{type:'string'},explanation:{type:'string'},concept:{type:'string'},skill:{type:'string',enum:[...skills]},hint:{type:'string'},thinking:{type:'string'},sampleResponse:{type:'string'}},required:['prompt','passage','choices','answer','explanation','concept','skill','hint','thinking','sampleResponse'],additionalProperties:false}}},required:['questions'],additionalProperties:false};
const normalize=(s:string)=>s.replace(/\s+/g,'').toLowerCase();
function validateQuestions(items:any,count:number,exclude:string[]):items is Question[]{
 if(!Array.isArray(items)||items.length!==count)return false;
 const seen=new Set(exclude.map(normalize));
 if(items.filter(q=>typeof q?.passage==='string'&&q.passage.trim().length>=20).length<Math.ceil(count/2))return false;
 if(items.some((q,i)=>q?.skill!==skillAt(i,count)||['concept','hint','thinking','sampleResponse'].some(field=>typeof q?.[field]!=='string'||!q[field].trim()||q[field].length>800)||q.explanation?.length<40))return false;
 for(const q of items){if(!q||typeof q.prompt!=='string'||!q.prompt.trim()||q.prompt.length>2000||typeof q.passage!=='string'||q.passage.length>5000||typeof q.explanation!=='string'||!q.explanation.trim()||q.explanation.length>3000||typeof q.answer!=='string'||!Array.isArray(q.choices)||q.choices.length!==4||q.choices.some((x:any)=>typeof x!=='string'||!x.trim()||x.length>500)||new Set(q.choices.map(normalize)).size!==4||!q.choices.includes(q.answer))return false;const key=normalize(q.prompt+' '+q.passage);if(seen.has(key))return false;seen.add(key)}return true;
}
export async function POST(request:Request){
 const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
 if(request.headers.get('origin')&&request.headers.get('origin')!==new URL(request.url).origin)return json({error:'이 사이트 안에서 요청해 주세요.'},403);
 let s:any;try{const raw=await request.text();if(raw.length>60000)return json({error:'요청이 너무 큽니다.'},413);s=JSON.parse(raw)}catch(error){return json({error:error instanceof AIServiceError?error.message:'학습 설정을 다시 확인해 주세요.'},400)}
 if(!s||![1,2,3,4,5,6].includes(s.grade)||!subjects(s.grade).includes(s.subject)||![5,10,15,20].includes(s.count)||![0,1].includes(s.topic)||!Number.isInteger(s.day)||s.day<0||s.day>6||typeof s.week!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s.week))return json({error:'학습 설정이나 요일이 올바르지 않습니다.'},400);
 const date=new Date(s.week+'T12:00:00Z');if(Number.isNaN(date.valueOf())||date.toISOString().slice(0,10)!==s.week||date.getUTCDay()!==1)return json({error:'주간 시작일은 월요일이어야 합니다.'},400);
 if(s.exclude!==undefined&&(!Array.isArray(s.exclude)||s.exclude.length>140||s.exclude.some((x:any)=>typeof x!=='string'||x.length>3000)))return json({error:'중복 확인 목록을 다시 확인해 주세요.'},400);
 const active=credentials(request);
 if(!active)return json({error:'AI 연결 탭에서 API 키를 입력하고 연결 테스트 후 적용해 주세요.'},401);

 try{
 const sources=await loadSources();const exclusions=s.exclude||[];
 const context=sources.map(x=>({title:x.title,url:x.url,checkedAt:x.checkedAt,status:x.status,reviewedSummary:x.context,currentPageExcerpt:x.excerpt||null}));
 const text=await requestAI(active,{instructions:editorialInstructions,input:JSON.stringify({edition:crypto.randomUUID(),grade:s.grade,subject:s.subject,topic:topics(s.grade,s.subject)[s.topic],date:addDays(s.week,s.day),weekday:weekdays[s.day],focus:dayFocus[s.day],count:s.count,blueprint:skills.map((skill,i)=>({skill,count:worksheetPlan(s.count)[i]})),instruction:'정확히 count개의 4지선다 문항. 문항 순서는 blueprint대로. 절반 이상에 필요한 지문·관찰 자료·생활 상황을 포함한다.',sourceContext:context,previousQuestions:exclusions}),schema});
 const parsed=JSON.parse(text);
 if(!validateQuestions(parsed.questions,s.count,exclusions))throw Error('invalid');
 return json({questions:parsed.questions,sources:sources.map(({title,url,checkedAt,status})=>({title,url,checkedAt,status})),date:addDays(s.week,s.day),scope:'공개 안내 기반 자체 출제 · 보호자 검토 권장'});
 }catch(error){return json({error:error instanceof AIServiceError?error.message:'문제 생성이 지연되거나 중복·형식 검증을 통과하지 못했어요. 이미 만든 요일의 문제는 유지됩니다. 잠시 뒤 다시 시도해 주세요.'},502)}
}

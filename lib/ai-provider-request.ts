import {providerError} from './ai-credentials';
import type {Provider} from './ai-providers';
type Connection={provider:Provider;key:string;model:string};
export class AIServiceError extends Error {}
// Fixed destinations prevent a supplied key from being forwarded to arbitrary hosts.
const urls={openai:'https://api.openai.com/v1/responses',gemini:'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',grok:'https://api.x.ai/v1/chat/completions'};
export async function requestAI(active:Connection,{instructions,input,schema,test=false}:{instructions:string;input:string;schema?:object;test?:boolean}){
 const format=schema?{type:'json_schema',name:'daily_worksheet',strict:true,schema}:undefined;
 const body=active.provider==='openai'?{
  model:active.model,store:false,instructions,input,max_output_tokens:test?2048:14000,...(format?{text:{format}}:{}),
 }:{
  model:active.model,messages:[{role:'system',content:instructions},{role:'user',content:input}],max_tokens:test?2048:14000,
  ...(active.provider==='gemini'?{reasoning_effort:'low'}:{}),
  ...(schema?{response_format:{type:'json_schema',json_schema:{name:'daily_worksheet',strict:true,schema}}}:{}),
 };
 const response=await fetch(urls[active.provider],{method:'POST',redirect:'error',headers:{Authorization:`Bearer ${active.key}`,'Content-Type':'application/json'},signal:AbortSignal.timeout(test?25000:65000),body:JSON.stringify(body)});
 if(!response.ok)throw new AIServiceError(await providerError(response));
 const data=await response.json();let text:string|undefined;
 if(active.provider==='openai'){
  if(data.status!=='completed')throw new AIServiceError('AI 응답이 완료되지 않았습니다. 기본 모델로 다시 시도해 주세요.');
  text=data.output?.flatMap((o:any)=>o.content||[]).filter((c:any)=>c.type==='output_text').map((c:any)=>c.text).join('');
 }else{
  const choice=data.choices?.[0];
  if(choice?.finish_reason!=='stop'||choice.message?.refusal)throw new AIServiceError('AI 응답이 중단되었거나 요청을 거절했습니다. 기본 모델로 다시 시도해 주세요.');
  text=choice.message?.content;
 }
 if(typeof text!=='string'||!text.trim())throw new AIServiceError('AI가 빈 응답을 반환했습니다. 모델 설정을 확인해 주세요.');
 return text;
}

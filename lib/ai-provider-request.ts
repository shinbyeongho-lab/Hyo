import {providerError} from './ai-credentials';
import type {Provider} from './ai-providers';
type Connection={provider:Provider;key:string;model:string};
export class AIServiceError extends Error {}
// Use Gemini's native API. New AQ. authorization keys are supported through
// x-goog-api-key, while the OpenAI-compatible endpoint can reject them in some
// deployed environments.
const endpoint=(model:string)=>`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
const stableModel='gemini-2.5-flash';
export async function requestAI(active:Connection,{instructions,input,schema,test=false}:{instructions:string;input:string;schema?:object;test?:boolean}){
 const body={
  systemInstruction:{parts:[{text:instructions}]},
  contents:[{role:'user',parts:[{text:input}]}],
  generationConfig:{
   maxOutputTokens:test?2048:14000,
   ...(schema?{responseMimeType:'application/json',responseJsonSchema:schema}:{}),
  },
 };
 const send=(model:string)=>fetch(endpoint(model),{method:'POST',redirect:'error',headers:{'x-goog-api-key':active.key,'Content-Type':'application/json'},signal:AbortSignal.timeout(test?25000:65000),body:JSON.stringify(body)});
 let response=await send(active.model);
 // Preview/new models can temporarily return 503 under high demand. Retry once
 // with Google's stable Flash model so a valid key is not reported as broken.
 if(response.status===503&&active.model!==stableModel)response=await send(stableModel);
 if(!response.ok)throw new AIServiceError(await providerError(response));
 const data=await response.json();let text:string|undefined;
 const candidate=data.candidates?.[0];
 if(!candidate||!['STOP','MAX_TOKENS'].includes(candidate.finishReason))throw new AIServiceError('Gemini 응답이 중단되었거나 요청을 거절했습니다. 모델과 안전 설정을 확인해 주세요.');
 text=candidate.content?.parts?.map((part:{text?:unknown})=>typeof part.text==='string'?part.text:'').join('');
 if(typeof text!=='string'||!text.trim())throw new AIServiceError('AI가 빈 응답을 반환했습니다. 모델 설정을 확인해 주세요.');
 return text;
}

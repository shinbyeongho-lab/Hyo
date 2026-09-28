import {authorized,configured,equal,session,sameOrigin} from '@/lib/ai-auth';
import {credentials} from '@/lib/ai-credentials';
import {requestAI,AIServiceError} from '@/lib/ai-provider-request';
import {providers} from '@/lib/ai-providers';
export const runtime='nodejs';
export const maxDuration=30;
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request){
 if(!sameOrigin(request))return json({error:'사이트 안에서 요청해 주세요.'},403);
 let body;try{const raw=await request.text();if(raw.length>2048)return json({error:'요청이 너무 큽니다.'},413);body=JSON.parse(raw)}catch{return json({error:'입력값을 확인해 주세요.'},400)}
 if(!body||typeof body!=='object')return json({error:'입력값을 확인해 주세요.'},400);
 if(body.action==='unlock'){
  if(!configured())return json({error:'서버 키가 설정되지 않았습니다. API 키 직접 입력을 이용해 주세요.'},503);
  if(typeof body.password!=='string'||!equal(body.password,process.env.AI_ACCESS_PASSWORD!))return json({error:'보호자 비밀번호가 일치하지 않습니다.'},401);
  const response=json({message:'8시간 동안 이 브라우저에서 AI 출제를 사용할 수 있습니다.'});
  response.headers.set('Set-Cookie',`haru_ai=${session()}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${new URL(request.url).protocol==='https:'?'; Secure':''}`);return response;
 }
 const active=credentials(request);
 if(!active)return json({error:'API 키와 모델 입력값을 확인하거나 서버 키 잠금을 해제해 주세요.'},401);
 if(body.action!=='test')return json({error:'올바르지 않은 요청입니다.'},400);
 try{
  await requestAI(active,{instructions:'You are a connection test assistant.',input:'Reply with OK.',test:true});
  return json({message:providers[active.provider].name+' 실제 응답 확인 완료! 이제 요일별 문제를 만들 수 있어요.'});
 }catch(error){return json({error:error instanceof AIServiceError?error.message:'연결 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.'},502)}
}
export async function DELETE(request:Request){if(!sameOrigin(request))return json({error:'잘못된 요청입니다.'},403);const response=json({message:'AI 출제를 잠갔습니다.'});response.headers.set('Set-Cookie','haru_ai=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');return response}


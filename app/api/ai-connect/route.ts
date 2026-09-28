import {authorized,configured,equal,session,sameOrigin} from '@/lib/ai-auth';
export const runtime='nodejs';
export const maxDuration=30;
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request){
 if(!sameOrigin(request))return json({error:'사이트 안에서 요청해 주세요.'},403);
 if(!configured())return json({error:'서버의 API 키와 보호자 비밀번호 설정이 필요합니다.'},503);
 let body;try{const raw=await request.text();if(raw.length>2048)return json({error:'요청이 너무 큽니다.'},413);body=JSON.parse(raw)}catch{return json({error:'입력값을 확인해 주세요.'},400)}
 if(!body||typeof body!=='object')return json({error:'입력값을 확인해 주세요.'},400);
 if(body.action==='unlock'){
  if(typeof body.password!=='string'||!equal(body.password,process.env.AI_ACCESS_PASSWORD!))return json({error:'보호자 비밀번호가 일치하지 않습니다.'},401);
  const response=json({message:'8시간 동안 이 브라우저에서 AI 출제를 사용할 수 있습니다.'});
  response.headers.set('Set-Cookie',`haru_ai=${session()}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${new URL(request.url).protocol==='https:'?'; Secure':''}`);return response;
 }
 if(!authorized(request))return json({error:'먼저 보호자 비밀번호로 잠금을 해제해 주세요.'},401);
 if(body.action!=='test')return json({error:'올바르지 않은 요청입니다.'},400);
 try{
  const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},signal:AbortSignal.timeout(20000),body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4o-mini',input:'Reply with OK.',max_output_tokens:64,store:false})});
  if(!response.ok)return json({error:response.status===401?'API 키를 확인해 주세요.':response.status===429?'OpenAI 사용 한도 또는 결제 상태를 확인해 주세요.':'모델 설정 및 OpenAI 서비스 상태를 확인해 주세요.'},502);
  const data=await response.json();if(data.status!=='completed')return json({error:'응답이 완료되지 않았습니다. 모델 설정을 확인해 주세요.'},502);
  return json({message:'OpenAI 실제 응답 확인 완료! 이제 요일별 문제를 만들 수 있어요.'});
 }catch{return json({error:'연결 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.'},502)}
}
export async function DELETE(request:Request){if(!sameOrigin(request))return json({error:'잘못된 요청입니다.'},403);const response=json({message:'AI 출제를 잠갔습니다.'});response.headers.set('Set-Cookie','haru_ai=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');return response}


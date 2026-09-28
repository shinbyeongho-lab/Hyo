import {authorized,configured} from '@/lib/ai-auth';
export const runtime='nodejs';
export async function GET(request:Request){return Response.json({configured:configured(),unlocked:authorized(request),model:process.env.OPENAI_MODEL||'gpt-4o-mini',message:configured()?'서버 설정 완료 · 잠금 해제 후 실제 연결을 테스트하세요.':'Vercel 환경 변수에 OPENAI_API_KEY와 12자 이상의 AI_ACCESS_PASSWORD를 설정하고 재배포하세요.'},{headers:{'Cache-Control':'no-store'}})}

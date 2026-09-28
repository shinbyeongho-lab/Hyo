import {authorized,configured} from '@/lib/ai-auth';
import {credentials} from '@/lib/ai-credentials';
export const runtime='nodejs';
export async function GET(request:Request){const active=credentials(request);return Response.json({configured:configured(),unlocked:!!active,mode:active?.mode||null,provider:active?.provider||'gemini',model:active?.model||process.env.GEMINI_MODEL||'gemini-3.8-flash',message:active?.mode==='direct'?'직접 입력한 키가 이 탭에 적용되어 있습니다.':authorized(request)?'서버 키 잠금이 해제되어 있습니다.':'아래에서 API 키를 입력하고 연결 테스트 후 적용하세요. 환경 변수 설정 없이 사용할 수 있습니다.'},{headers:{'Cache-Control':'no-store'}})}

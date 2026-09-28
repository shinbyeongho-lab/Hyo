import {authorized} from './ai-auth';
import {isProvider,providers,validKey,validModel} from './ai-providers';

export function credentials(request:Request){
 const supplied=request.headers.get('x-haru-api-key');
 if(supplied!==null){
  const provider=request.headers.get('x-haru-provider')||'gemini';
  if(!isProvider(provider))return null;
  const key=supplied.trim(), model=request.headers.get('x-haru-model')?.trim()||providers[provider].model;
  // A malformed supplied key must never fall back to the site's paid key.
  if(!validKey(provider,key)||!validModel(provider,model))return null;
  return {key,model,provider,mode:'direct' as const};
 }
 if(!authorized(request))return null;
 return {key:process.env.GEMINI_API_KEY!,model:process.env.GEMINI_MODEL||'gemini-3.8-flash',provider:'gemini' as const,mode:'server' as const};
}

export async function providerError(response:Response){
 let code='';try{const body=await response.json();code=body?.error?.code||''}catch{}
 if(response.status===401)return 'API 키가 유효하지 않습니다. 키를 다시 확인해 주세요.';
 if(response.status===429)return code==='insufficient_quota'?'API 잔액이나 결제 한도가 부족합니다. 선택한 서비스의 API 결제 설정을 확인해 주세요.':'요청 또는 사용 한도에 도달했습니다. 선택한 서비스의 API 한도를 확인하고 잠시 후 다시 시도해 주세요.';
 if(response.status===403)return '이 API 키에 모델을 사용할 권한이 없습니다. 프로젝트 권한을 확인해 주세요.';
 if(response.status===404||code==='model_not_found')return '선택한 모델을 사용할 수 없습니다. 모델 이름과 접근 권한을 확인해 주세요.';
 if(response.status===400)return 'API 키 또는 요청 형식을 확인해 주세요. 선택한 서비스의 기본 모델로 다시 시도해 주세요.';
 return 'AI 서비스에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.';
}

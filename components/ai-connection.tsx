"use client";
import {useEffect,useState} from 'react';
import {Sparkles,KeyRound,CheckCircle2} from 'lucide-react';
import {aiFetch,directModel,setDirectConnection} from '@/lib/ai-client';

import {providers,validKey,validModel,type Provider} from '@/lib/ai-providers';

type Status={provider:Provider;configured:boolean;unlocked:boolean;mode:'direct'|'server'|null;model:string;message:string};
export function AIConnection({onGenerate,busy}:{onGenerate:()=>void;busy:boolean}){
 const provider:Provider='gemini';
 const selected=providers[provider];
 const [status,setStatus]=useState<Status|null>(null);
 const [checking,setChecking]=useState(false),[message,setMessage]=useState(''),[success,setSuccess]=useState(false);
 const [key,setKey]=useState(''),[model,setModel]=useState(()=>directModel()||providers.gemini.model),[password,setPassword]=useState('');
 async function refresh(){try{const r=await aiFetch('/api/ai-status');if(!r.ok)throw Error();setStatus(await r.json())}catch{setSuccess(false);setMessage('서버 연결 상태를 확인하지 못했습니다.')}}
 useEffect(()=>{void refresh()},[]);
 async function connect(){
  const candidate={key:key.trim(),model:model.trim(),provider};
  if(!validKey(provider,candidate.key)){setSuccess(false);setMessage(selected.name+' API 키 전체를 입력해 주세요.');return}
  if(!validModel(provider,candidate.model)){setSuccess(false);setMessage(selected.name+'에 맞는 모델 이름을 입력해 주세요.');return}
  setChecking(true);setSuccess(false);setMessage('입력한 키로 실제 AI 응답을 확인하고 있어요…');
  try{
   const r=await aiFetch('/api/ai-connect',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'test'})},candidate);
   const data=await r.json();if(!r.ok){setMessage(data.error||'연결하지 못했습니다.');return}
   setDirectConnection(candidate);setKey('');setSuccess(true);setMessage('연결 테스트 성공! 이 탭에 적용했습니다. 이제 하루 또는 7일 문제를 만들 수 있어요.');await refresh();
  }catch{setMessage('서버에 연결하지 못했습니다. 인터넷 연결과 배포 상태를 확인해 주세요.')}finally{setChecking(false)}
 }
 async function action(kind:'unlock'|'test'|'lock'){
  setChecking(true);setMessage('');setSuccess(false);
  if(kind==='lock'){setDirectConnection(null);setKey('')}
  try{
   const r=await aiFetch('/api/ai-connect',{method:kind==='lock'?'DELETE':'POST',headers:{'Content-Type':'application/json'},body:kind==='lock'?undefined:JSON.stringify({action:kind,password:kind==='unlock'?password:undefined})});
   const data=await r.json();setSuccess(r.ok);setMessage(data.error||(kind==='lock'?'직접 입력한 키를 지우고 AI 출제를 잠갔습니다.':data.message));if(r.ok&&kind==='unlock')setPassword('');await refresh();
  }catch{setMessage('서버에 연결하지 못했습니다. 다시 시도해 주세요.');await refresh()}finally{setChecking(false)}
 }
 const disabled=checking||busy;
 return <section className="info ai-connection"><span className="pill">보호자 설정</span><h2>Gemini와 연결하기</h2><p>API 키를 입력하고 테스트하면 바로 맞춤 문제를 만들 수 있어요.</p>
  <div className="connection-card">{status?.unlocked?<CheckCircle2 size={28}/>:<Sparkles size={28}/>}<div><h3>{status?.unlocked?'AI 출제 준비 완료':'API 키를 연결해 주세요'}</h3><p>{status?.message||'설정 확인 중…'}</p><small>{status?.unlocked?providers[status.provider].name:selected.name} · {status?.unlocked?status.model:model}{status?.mode==='direct'?' · 직접 입력한 키':status?.mode==='server'?' · 서버 키':''}</small></div></div>
  <form className="ai-key-form" onSubmit={e=>{e.preventDefault();void connect()}}>
   <h3><KeyRound size={20}/> API 키 직접 입력</h3>
   <label htmlFor="gemini-key">{selected.name} API 키</label>
   <input id="gemini-key" type="password" value={key} onChange={e=>setKey(e.target.value)} placeholder={selected.placeholder} autoComplete="off" spellCheck={false} autoCapitalize="none" maxLength={510} required disabled={disabled} aria-describedby="key-help"/>
   <label htmlFor="gemini-model">사용할 모델</label>
   <input id="gemini-model" value={model} onChange={e=>setModel(e.target.value)} placeholder={selected.model} spellCheck={false} autoCapitalize="none" maxLength={95} required disabled={disabled}/>
   <p id="key-help">키는 현재 탭의 메모리에만 유지됩니다. 새로고침하거나 탭을 닫으면 다시 입력해 주세요. 입력한 키는 이 사이트 서버를 통해 Gemini 호출에만 사용하며 서버에 저장하지 않습니다.</p>
   <div className="connection-actions"><button className="primary" disabled={disabled||!key.trim()}>{checking?'연결 확인 중…':'연결 테스트 후 적용'}</button><a href={selected.keyUrl} target="_blank" rel="noreferrer">API 키 발급 페이지 ↗</a></div>
   <p className="ai-cost">테스트와 문제 생성은 Gemini API 한도를 사용하며 요금이 발생할 수 있습니다. 일반 챗봇 구독과 API 결제는 별개입니다.</p>
  </form>
  {message&&<p role="status" aria-live="polite" className={`notice ${success?'ai-success':''}`}>{message}</p>}
  <div className="connection-actions"><button className="secondary" disabled={disabled} onClick={()=>void refresh()}>상태 새로 확인</button>{status?.unlocked&&<><button className="secondary" disabled={disabled} onClick={()=>void action('test')}>다시 연결 테스트</button><button className="secondary" disabled={disabled} onClick={()=>void action('lock')}>연결 해제</button></>}<button className="primary" disabled={!status?.unlocked||disabled} onClick={onGenerate}>{busy?'출제 중…':'선택 요일 AI 문제 만들기'}</button></div>
  {status?.configured&&<details className="ai-server-option"><summary>기존 서버 키로 사용하기</summary><p>Vercel에 설정한 서버 키는 보호자 비밀번호로 사용할 수 있습니다. 직접 입력한 키가 있으면 우선 적용됩니다.</p><form className="ai-unlock" onSubmit={e=>{e.preventDefault();void action('unlock')}}><label htmlFor="ai-password">보호자 비밀번호</label><input id="ai-password" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} maxLength={512} required disabled={disabled}/><button className="secondary" disabled={disabled}>서버 키 잠금 해제</button></form></details>}
  <p className="notice">.env.example은 설정 예시이므로 수정해도 배포 환경에 적용되지 않습니다. 위 직접 입력 방식은 환경 변수 없이 사용할 수 있습니다. AI 문제의 정답과 해설은 보호자가 확인해 주세요.</p>
 </section>
}

"use client";
import {useEffect,useState} from 'react';
import {BookOpen,Plus,Star,Trophy} from 'lucide-react';
import {createProfile,importLegacyLearning,readProfiles,readProfileSummary,saveProfiles,type LearnerProfile} from '@/lib/profiles';

export function ProfileGate({onEnter}:{onEnter:(profile:LearnerProfile)=>void}){
 const [profiles,setProfiles]=useState<LearnerProfile[]>([]),[name,setName]=useState(''),[ready,setReady]=useState(false),[message,setMessage]=useState('');
 useEffect(()=>{setProfiles(readProfiles());setReady(true)},[]);
 function add(){const clean=name.trim().replace(/\s+/g,' ');if(!clean){setMessage('사용자 이름을 입력해 주세요.');return}if(profiles.length>=8){setMessage('사용자는 최대 8명까지 추가할 수 있어요.');return}const profile=createProfile(clean),next=[...profiles,profile];saveProfiles(next);if(profiles.length===0)importLegacyLearning(profile.id);setProfiles(next);setName('');setMessage('');onEnter(profile)}
 if(!ready)return <main className="profile-gate"><p>사용자 정보를 불러오고 있어요…</p></main>;
 return <main className="profile-gate"><section className="profile-welcome"><span className="brand-mark"><BookOpen size={25}/></span><p>하루한뼘</p><h1>누가 오늘 공부하나요?</h1><span>내 이름을 선택하면 학습 기록과 점수가 이어져요.</span></section>
  {profiles.length>0&&<div className="profile-grid">{profiles.map(profile=>{const summary=readProfileSummary(profile.id);return <button key={profile.id} className="profile-card" onClick={()=>onEnter(profile)}><span className="profile-avatar">{profile.name.slice(0,1)}</span><strong>{profile.name}</strong><span className="profile-points"><Star size={15}/>{summary.points.toLocaleString()}점</span><small><Trophy size={13}/>{summary.sessions}회 학습 · 정답률 {summary.accuracy}%</small></button>})}</div>}
  <form className="profile-add" onSubmit={e=>{e.preventDefault();add()}}><label htmlFor="learner-name">새 사용자 추가</label><div><input id="learner-name" value={name} onChange={e=>setName(e.target.value)} maxLength={12} placeholder="아이 이름 또는 별명" autoComplete="off"/><button disabled={!name.trim()||profiles.length>=8}><Plus size={18}/>추가하고 입장</button></div>{message&&<p role="alert">{message}</p>}<small>사용자별 학습 기록은 이 브라우저에 따로 저장됩니다.</small></form>
 </main>
}

export function LearningDashboard({profile,summary,onSwitch}:{profile:LearnerProfile;summary:ReturnType<typeof readProfileSummary>;onSwitch:()=>void}){
 const progress=summary.points%500;
 return <section className="learner-dashboard"><div className="learner-name"><span>{profile.name.slice(0,1)}</span><div><small>오늘도 반가워요</small><h2>{profile.name}의 학습 기록</h2></div><button onClick={onSwitch}>사용자 변경</button></div><div className="score-cards"><article><small>누적 점수</small><strong>{summary.points.toLocaleString()}<em>점</em></strong></article><article><small>완료한 학습</small><strong>{summary.sessions}<em>회</em></strong></article><article><small>맞힌 문제</small><strong>{summary.correct}<em>문제</em></strong></article><article><small>정답률</small><strong>{summary.accuracy}<em>%</em></strong></article></div><div className="level-progress"><span>LEVEL {summary.level}</span><div><i style={{width:`${progress/5}%`}}/></div><small>다음 레벨까지 {(500-progress).toLocaleString()}점</small></div><p>문제를 풀면 2점, 정답이면 8점이 더해지고 학습 완료 시 10점을 받아요. 같은 학습은 한 번만 적립됩니다.</p></section>
}

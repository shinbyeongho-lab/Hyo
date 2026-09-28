"use client";
import {useEffect,useState} from 'react';
export const studyThemes={
 forest:{name:'토리',animal:'토끼',label:'숲속 탐험',tag:'초록 숲에서 쑥쑥!',fur:'#fff6df',ear:'#efaaa0',accent:'#548664'},
 ocean:{name:'모모',animal:'고양이',label:'바다 여행',tag:'호기심 따라 둥실!',fur:'#ffdc9f',ear:'#f49e97',accent:'#3282a4'},
 space:{name:'루루',animal:'곰',label:'우주 모험',tag:'생각이 별처럼 반짝!',fur:'#dcb992',ear:'#bd9275',accent:'#7f65b7'},
} as const;
export type StudyTheme=keyof typeof studyThemes;
export function useStudyTheme(){
 const [theme,setTheme]=useState<StudyTheme>('forest'),[ready,setReady]=useState(false);
 useEffect(()=>{try{const saved=localStorage.getItem('haru-theme');if(saved&&Object.hasOwn(studyThemes,saved))setTheme(saved as StudyTheme)}catch{}setReady(true)},[]);
 useEffect(()=>{document.documentElement.dataset.studyTheme=theme;if(ready)try{localStorage.setItem('haru-theme',theme)}catch{}},[theme,ready]);
 return {theme,setTheme};
}
// Original vector characters stay crisp at every size and need no image downloads.
export function StudyCompanion({theme,celebrating=false,decorative=false}:{theme:StudyTheme;celebrating?:boolean;decorative?:boolean}){
 const t=studyThemes[theme];
 return <svg className={`study-mascot ${celebrating?'mascot-celebrating':''}`} viewBox="0 0 220 230" role={decorative?undefined:'img'} aria-hidden={decorative||undefined} aria-label={decorative?undefined:`공부 친구 ${t.animal} ${t.name}${celebrating?'의 축하 인사':''}`}>
  <ellipse cx="111" cy="214" rx="72" ry="9" fill={t.accent} opacity=".12"/>
  <circle cx="110" cy="120" r="90" fill="white" opacity=".12"/>
  <g fill="#ffe496"><path d="m28 73 3-8 3 8 8 3-8 3-3 8-3-8-8-3Z"/><path d="m184 37 3-8 3 8 8 3-8 3-3 8-3-8-8-3Z"/><circle cx="191" cy="151" r="4"/></g>
  <g stroke="#594837" strokeWidth="3" strokeLinejoin="round">
   <ellipse cx="110" cy="163" rx="45" ry="44" fill={t.fur}/><ellipse cx="84" cy="205" rx="21" ry="10" fill={t.fur}/><ellipse cx="139" cy="205" rx="21" ry="10" fill={t.fur}/>
   {theme==='forest'?<><ellipse cx="83" cy="49" rx="16" ry="37" transform="rotate(-12 83 49)" fill={t.fur}/><ellipse cx="137" cy="49" rx="16" ry="37" transform="rotate(12 137 49)" fill={t.fur}/><path d="m79 30 7 37m55-37-7 37" stroke={t.ear} strokeWidth="10" strokeLinecap="round"/></>:theme==='ocean'?<><path d="M59 94 60 37 96 65M126 65l36-28 1 57" fill={t.fur}/><path d="m69 65 1-15 13 15m53 0 15-15 1 15" stroke={t.ear} strokeWidth="7"/></>:<><circle cx="66" cy="67" r="22" fill={t.fur}/><circle cx="154" cy="67" r="22" fill={t.fur}/><circle cx="66" cy="67" r="11" fill={t.ear} stroke="none"/><circle cx="154" cy="67" r="11" fill={t.ear} stroke="none"/></>}
   <rect x="53" y="60" width="114" height="94" rx="44" fill={t.fur}/>
   {theme==='ocean'&&<path d="m97 65 4 12m9-13v12m12-11-4 12" stroke="#d49a62" strokeWidth="5" strokeLinecap="round"/>}
   <ellipse cx="77" cy="117" rx="11" ry="7" fill="#efa79e" stroke="none"/><ellipse cx="143" cy="117" rx="11" ry="7" fill="#efa79e" stroke="none"/>
   {celebrating?<path d="m82 103 6-5 6 5m33 0 6-5 6 5" fill="none" strokeLinecap="round"/>:<><ellipse cx="89" cy="102" rx="4" ry="6" fill="#594837" stroke="none"/><ellipse cx="132" cy="102" rx="4" ry="6" fill="#594837" stroke="none"/></>}
   <path d="m106 113 5 4 5-4Z" fill="#bc8674" stroke="none"/><path d="M111 118q-1 13-12 5m12-5q1 13 12 5" fill="none" strokeLinecap="round"/>
   {theme==='space'&&<><circle cx="110" cy="103" r="70" fill="none" stroke="#e5f6ff" strokeWidth="7"/><path d="M65 155q45 21 90 0" fill="none" stroke="#b6dce9" strokeWidth="10"/><path d="M61 83q4-20 19-28" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round"/></>}
   <path d="M68 166q23-7 42 4 19-11 42-4v35q-23-7-42 2-19-9-42-2Z" fill={t.accent}/><path d="M110 170v32" stroke="#fff3ce" strokeWidth="2"/>
   <path d="m81 180 15 2m-15 7 15 2m29-9 15-2m-15 11 15-2" stroke="#fff3ce" strokeWidth="2"/>
   <ellipse cx="63" cy="175" rx="10" ry="14" transform="rotate(-20 63 175)" fill={t.fur}/><ellipse cx="157" cy="175" rx="10" ry="14" transform="rotate(20 157 175)" fill={t.fur}/>
  </g>
  {celebrating&&<g fill="#f2b95f"><path d="m23 128 8 9-11 2Z"/><path d="m189 99 11-4-2 12Z"/><circle cx="43" cy="39" r="4"/></g>}
 </svg>
}
export function ThemePicker({theme,onChange}:{theme:StudyTheme;onChange:(v:StudyTheme)=>void}){
 return <section className="theme-picker" aria-label="공부 친구와 테마 선택"><div className="theme-picker-title"><span>MY STUDY BUDDY</span><strong>오늘은 누구와 공부할까?</strong></div><div className="theme-options">{(Object.keys(studyThemes) as StudyTheme[]).map(id=><button key={id} type="button" data-theme-card={id} aria-pressed={theme===id} onClick={()=>onChange(id)}><StudyCompanion theme={id} decorative/><span><strong>{studyThemes[id].label}</strong><small>{studyThemes[id].name}와 함께</small></span><span className="theme-selected" aria-hidden="true">{theme===id?'✓':'+'}</span></button>)}</div></section>
}

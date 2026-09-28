"use client";
import {useState,useEffect,useRef} from 'react';
import type {Settings,Question} from './learning';
import {monday,dateKey,recordKey,dailyQuestions,newRecord,validRecord,type DailyRecord} from './weekly';
const STORAGE='haru-weekly-v1';
export function useWeekly(s:Settings,ready:boolean){
 const [week,setWeek]=useState(''),[day,setDay]=useState(0),[records,setRecords]=useState<Record<string,DailyRecord>>({}),[loaded,setLoaded]=useState(false),[storageError,setStorageError]=useState('');
 const current=useRef({s,week,day});current.current={s,week,day};
 useEffect(()=>{const w=monday();setWeek(w);setDay((new Date(dateKey()+'T12:00:00Z').getUTCDay()+6)%7);try{const raw=JSON.parse(localStorage.getItem(STORAGE)||'{}');if(raw&&typeof raw==='object')setRecords(Object.fromEntries(Object.entries(raw).filter(([k,v])=>k.length<120&&validRecord(v))) as Record<string,DailyRecord>)}catch{setStorageError('저장한 기록을 읽지 못했습니다. 이 화면에서는 계속 공부할 수 있어요.')}setLoaded(true)},[]);
 useEffect(()=>{if(!loaded)return;try{const entries=Object.entries(records).sort((a,b)=>b[1].createdAt.localeCompare(a[1].createdAt)).slice(0,100);localStorage.setItem(STORAGE,JSON.stringify(Object.fromEntries(entries)))}catch{setStorageError('기기 저장 공간을 확인해 주세요. 새로고침하면 이번 기록이 사라질 수 있어요.')}},[records,loaded]);
 const key=recordKey(s,week,day),record=records[key];
 function ensure(){if(!loaded||!ready||!week)return;setRecords(r=>r[key]?r:{...r,[key]:newRecord(dailyQuestions(s,week,day))})}
 function update(p:Partial<DailyRecord>){setRecords(r=>r[key]?{...r,[key]:{...r[key],...p}}:r)}
 function put(target:string,questions:Question[],source:string,references?:DailyRecord['references']){setRecords(r=>({...r,[target]:{...newRecord(questions,source),references}}))}
 function prepareWeek(){setRecords(r=>{const next={...r};for(let d=0;d<7;d++){const k=recordKey(s,week,d);if(!next[k])next[k]=newRecord(dailyQuestions(s,week,d))}return next})}
 return {week,setWeek,day,setDay,records,key,record,ensure,update,put,prepareWeek,loaded,storageError,current};
}


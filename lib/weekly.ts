import {generate,type Settings,type Question} from './learning';
import {enrichPractice} from './worksheet';
export const weekdays=['월','화','수','목','금','토','일'];
export const dayFocus=['개념 익히기','기본 다지기','응용하기','문장으로 생각하기','실력 점검','다시 연습하기','한 주 마무리'];
export function dateKey(date=new Date()){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(date)}
export function addDays(date:string,n:number){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
export function monday(date=dateKey()){const day=new Date(date+'T12:00:00Z').getUTCDay();return addDays(date,-((day+6)%7))}
export function recordKey(s:Settings,week:string,day:number){return `${week}|${s.grade}|${s.subject}|${s.count}|balanced|${s.topic}|${day}`}
export function seededRandom(seed:string){let h=2166136261;for(const c of seed)h=Math.imul(h^c.charCodeAt(0),16777619);return()=>{h+=0x6D2B79F5;let t=Math.imul(h^h>>>15,1|h);t^=t+Math.imul(t^t>>>7,61|t);return ((t^t>>>14)>>>0)/4294967296}}
export function dailyQuestions(s:Settings,week:string,day:number){return enrichPractice(generate(s,seededRandom(recordKey(s,week,day)),day),s)}
export type ScoreAward={points:number;answered:number;correct:number;at:string};
export type DailyRecord={questions:Question[];answers:Record<number,string>;notes?:Record<number,string>;index:number;done:boolean;source:string;createdAt:string;awarded?:ScoreAward;references?:{title:string;url:string;checkedAt:string;status:string}[]};
export function newRecord(questions:Question[],source='기본 연습 · 자체 제작'):DailyRecord{return {questions,answers:{},index:0,done:false,source,createdAt:new Date().toISOString()}}
export function validRecord(x:any):x is DailyRecord{return !!x&&Array.isArray(x.questions)&&x.questions.length>0&&x.questions.length<=20&&x.questions.every((q:any)=>typeof q.prompt==='string'&&typeof q.passage==='string'&&typeof q.explanation==='string'&&Array.isArray(q.choices)&&q.choices.every((v:any)=>typeof v==='string')&&q.choices.includes(q.answer))&&['createdAt','source'].every(k=>typeof x[k]==='string')&&(!x.notes||(typeof x.notes==='object'&&Object.values(x.notes).every(n=>typeof n==='string')))&&(!x.awarded||(Number.isInteger(x.awarded.points)&&x.awarded.points>=0&&Number.isInteger(x.awarded.answered)&&Number.isInteger(x.awarded.correct)&&typeof x.awarded.at==='string'))&&x.answers&&typeof x.answers==='object'&&Number.isInteger(x.index)&&x.index>=0&&x.index<x.questions.length&&typeof x.done==='boolean'&&typeof x.source==='string'}

export function migrateRecords(raw:Record<string,DailyRecord>){
 const next={...raw};for(const [key,value] of Object.entries(raw)){const parts=key.split('|');if(parts.length!==7||!['1','2','3'].includes(parts[4]))continue;parts[4]='balanced';const target=parts.join('|');const current=next[target];if(!current||((value.done||Object.keys(value.answers).length>0)&&!current.done&&!Object.keys(current.answers).length)||((value.done===current.done)&&value.createdAt>current.createdAt))next[target]=value;}return next;
}

export function keepExisting(record:DailyRecord|undefined,refresh=false){return !!record&&(record.done||Object.keys(record.answers).length>0||Object.values(record.notes||{}).some(note=>note.trim().length>0)||(!refresh&&record.source.startsWith('AI')))}

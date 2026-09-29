import type {DailyRecord} from './weekly';

export type ProfileTheme='forest'|'ocean'|'space';
export type LearnerProfile={id:string;name:string;grade:number;theme:ProfileTheme;createdAt:string};
export type LearningSummary={points:number;sessions:number;answered:number;correct:number;accuracy:number;level:number;nextLevel:number};
export const PROFILE_STORAGE='haru-profiles-v1';
export const recordStorage=(profileId:string)=>`haru-weekly-v2:${profileId}`;
export const settingsStorage=(profileId:string)=>`haru-settings-v2:${profileId}`;
export const progressStorage=(profileId:string)=>`haru-progress-v1:${profileId}`;

export function readProfiles():LearnerProfile[]{try{const value=JSON.parse(localStorage.getItem(PROFILE_STORAGE)||'[]');return Array.isArray(value)?value.filter(p=>p&&typeof p.id==='string'&&typeof p.name==='string'&&typeof p.createdAt==='string').slice(0,8).map((p,i)=>({...p,grade:Number.isInteger(p.grade)&&p.grade>=1&&p.grade<=6?p.grade:3,theme:['forest','ocean','space'].includes(p.theme)?p.theme:['forest','ocean','space'][i%3] as ProfileTheme})):[]}catch{return []}}
export function saveProfiles(profiles:LearnerProfile[]){localStorage.setItem(PROFILE_STORAGE,JSON.stringify(profiles.slice(0,8)))}
export function createProfile(name:string,grade:number,theme:ProfileTheme):LearnerProfile{return {id:crypto.randomUUID(),name:name.trim().replace(/\s+/g,' ').slice(0,12),grade,theme,createdAt:new Date().toISOString()}}
export function updateProfile(profile:LearnerProfile){const profiles=readProfiles(),index=profiles.findIndex(item=>item.id===profile.id);if(index<0)return;profiles[index]=profile;saveProfiles(profiles)}
export function pointsFor(answered:number,correct:number){return answered*2+correct*8+10}
function finishSummary(points:number,sessions:number,answered:number,correct:number):LearningSummary{const level=Math.floor(points/500)+1;return {points,sessions,answered,correct,accuracy:answered?Math.round(correct/answered*100):0,level,nextLevel:level*500}}
export function learningSummary(records:Record<string,DailyRecord>):LearningSummary{
 const awards=Object.values(records).flatMap(record=>record.awarded?[record.awarded]:[]);
 const points=awards.reduce((sum,item)=>sum+item.points,0),answered=awards.reduce((sum,item)=>sum+item.answered,0),correct=awards.reduce((sum,item)=>sum+item.correct,0);
 return finishSummary(points,awards.length,answered,correct);
}
export function addAward(summary:LearningSummary,award:{points:number;answered:number;correct:number}){return finishSummary(summary.points+award.points,summary.sessions+1,summary.answered+award.answered,summary.correct+award.correct)}
export function saveProfileSummary(profileId:string,summary:LearningSummary){localStorage.setItem(progressStorage(profileId),JSON.stringify({points:summary.points,sessions:summary.sessions,answered:summary.answered,correct:summary.correct}))}
export function readProfileSummary(profileId:string):LearningSummary{try{const saved=JSON.parse(localStorage.getItem(progressStorage(profileId))||'null');if(saved&&[saved.points,saved.sessions,saved.answered,saved.correct].every(Number.isInteger))return finishSummary(saved.points,saved.sessions,saved.answered,saved.correct);const raw=JSON.parse(localStorage.getItem(recordStorage(profileId))||'{}'),summary=learningSummary(raw&&typeof raw==='object'?raw:{});if(summary.sessions)saveProfileSummary(profileId,summary);return summary}catch{return learningSummary({})}}
export function importLegacyLearning(profileId:string){try{if(localStorage.getItem(recordStorage(profileId)))return;const legacy=JSON.parse(localStorage.getItem('haru-weekly-v1')||'null');if(!legacy||typeof legacy!=='object')return;for(const item of Object.values(legacy) as DailyRecord[]){if(!item?.done||item.awarded||!Array.isArray(item.questions)||!item.answers)continue;const answered=Object.keys(item.answers).length,correct=item.questions.filter((q,i)=>item.answers[i]===q.answer).length;item.awarded={answered,correct,points:pointsFor(answered,correct),at:item.createdAt||new Date().toISOString()}}localStorage.setItem(recordStorage(profileId),JSON.stringify(legacy));const summary=learningSummary(legacy);saveProfileSummary(profileId,summary)}catch{}}

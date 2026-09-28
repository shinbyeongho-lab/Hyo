"use client";

// User-supplied credentials live only in this tab's memory, never Web Storage.
import type {Provider} from './ai-providers';
// Older OpenAI forms pass only key/model. Normalize that input at the boundary.
export type DirectConnection = {key:string; model:string; provider?:Provider};
type ResolvedConnection = DirectConnection & {provider:Provider};
const resolveConnection=(value:DirectConnection):ResolvedConnection=>({...value,provider:value.provider??'openai'});
let connection:ResolvedConnection|null=null;
export function setDirectConnection(value:DirectConnection|null){connection=value?resolveConnection(value):null}
export function directModel(){return connection?.model||null}
export function directProvider(){return connection?.provider||'openai'}
export function aiFetch(path:'/api/generate'|'/api/ai-status'|'/api/ai-connect',init:RequestInit={},override?:DirectConnection){
 const active=override?resolveConnection(override):connection;
 const headers=new Headers(init.headers);
 if(active){headers.set('x-haru-api-key',active.key);headers.set('x-haru-model',active.model);headers.set('x-haru-provider',active.provider)}
 return fetch(path,{...init,headers,cache:'no-store',redirect:'error'});
}

import {createHmac, timingSafeEqual} from 'node:crypto';
export const configured=()=>!!process.env.OPENAI_API_KEY && (process.env.AI_ACCESS_PASSWORD?.length||0)>=12;
const sign=(value:string)=>createHmac('sha256',process.env.OPENAI_API_KEY+'|'+process.env.AI_ACCESS_PASSWORD).update(value).digest('hex');
export function equal(a:string,b:string){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y)}
export function session(){const expires=String(Date.now()+8*60*60*1000);return expires+'.'+sign(expires)}
export function authorized(request:Request){
 if(!configured())return false;
 const token=request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith('haru_ai='))?.slice(8)||'';
 const [expires,signature]=token.split('.');
 return !!expires&&!!signature&&Number(expires)>Date.now()&&equal(signature,sign(expires));
}
export const sameOrigin=(request:Request)=>request.headers.get('origin')===new URL(request.url).origin;

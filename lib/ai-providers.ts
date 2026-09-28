export const providers={
 gemini:{name:'Gemini',model:'gemini-3.8-flash',keyUrl:'https://aistudio.google.com/api-keys',placeholder:'Google AI Studio API 키'},
} as const;
export type Provider=keyof typeof providers;
export const isProvider=(value:string):value is Provider=>value==='gemini';
export function validKey(provider:Provider,key:string){
 return provider==='gemini' && /^(?:AQ\.)?[A-Za-z0-9_-]{20,500}$/.test(key) && !/^(sk-|xai-)/.test(key);
}
export const validModel=(provider:Provider,model:string)=>provider==='gemini' && /^gemini-[A-Za-z0-9._-]{1,90}$/.test(model);

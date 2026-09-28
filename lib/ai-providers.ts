export const providers={
 openai:{name:'OpenAI',model:'gpt-4o-mini',keyUrl:'https://platform.openai.com/api-keys',placeholder:'sk-…'},
 gemini:{name:'Gemini',model:'gemini-3.8-flash',keyUrl:'https://aistudio.google.com/api-keys',placeholder:'Google AI Studio API 키'},
 grok:{name:'Grok',model:'grok-4.7',keyUrl:'https://console.x.ai/',placeholder:'xai-…'},
} as const;
export type Provider=keyof typeof providers;
export const isProvider=(value:string):value is Provider=>Object.hasOwn(providers,value);
export function validKey(provider:Provider,key:string){
 if(provider==='openai')return /^sk-[A-Za-z0-9_-]{16,500}$/.test(key);
 if(provider==='grok')return /^xai-[A-Za-z0-9_-]{16,500}$/.test(key);
 return /^[A-Za-z0-9_-]{20,500}$/.test(key);
}
export const validModel=(provider:Provider,model:string)=>new RegExp(`^${provider==='openai'?'gpt':provider==='gemini'?'gemini':'grok'}-[A-Za-z0-9._-]{1,90}$`).test(model);

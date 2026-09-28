import {loadSources} from '@/lib/source-loader';
export async function GET(){const sources=await loadSources();return Response.json({sources:sources.map(({excerpt,context,marker,...s})=>s),scope:'공개 교육과정 고시·교재 안내 기반. 성취기준 전체와 EBS 문항 원문은 수록하지 않습니다.'},{headers:{'Cache-Control':'no-store'}})}

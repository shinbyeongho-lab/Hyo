"use client";
import {Printer} from 'lucide-react';
import {topics,type Settings} from '@/lib/learning';
import {addDays,weekdays,type DailyRecord} from '@/lib/weekly';
import {subjectGuidance} from '@/lib/worksheet';
export function Worksheet({settings:s,record,week,day,onBack}:{settings:Settings;record?:DailyRecord;week:string;day:number;onBack:()=>void}){
 const questions=record?.questions||[];
 const goals=[...new Set(questions.map(q=>q.concept).filter(Boolean))].slice(0,4);
 return <section className="print-preview"><div className="print-tools"><div><h2>차곡차곡, 나의 주간 워크북</h2><p>문제 · 생각 쓰기 · 별도 정답과 해설</p></div><button className="primary" onClick={()=>window.print()}><Printer size={18}/>인쇄 / PDF 저장</button><button onClick={onBack}>돌아가기</button></div>
 <div className="worksheet editorial-paper"><div className="paper-head"><strong>하루한뼘 <small>WEEKLY WORKBOOK</small></strong><span>{s.grade}학년 · {s.subject}</span></div>
 <div className="paper-title"><span>차근차근 배우고, 내 말로 설명하는 하루</span><h1>{topics(s.grade,s.subject)[s.topic]}</h1><p>{week&&addDays(week,day)} {weekdays[day]}요일　|　이름 __________________</p></div>
 <section className="paper-goals"><h2>오늘의 배움</h2><p>{subjectGuidance[s.subject]}</p>{goals.length>0&&<p className="goal-keywords">{goals.join(' · ')}</p>}<div><span>01 개념 확인</span><span>02 자료·상황 적용</span><span>03 이유 설명</span></div></section>
 <p className="paper-source">{record?.source||'기본 연습'} · {questions.length}문제 · 정답과 해설은 뒤쪽에 있어요.</p>
 {questions.map((q,i)=><article className="paper-question" key={i}><div className="paper-question-top"><span>{String(i+1).padStart(2,'0')}</span><small>{q.skill||'복습'}{q.concept?' · '+q.concept:''}</small></div><h3>{q.prompt}</h3>{q.passage&&<div className="paper-passage">{q.passage}</div>}<ol className="paper-choices">{q.choices.map((choice,j)=><li key={j}><span>{j+1}</span>{choice}</li>)}</ol><div className="paper-answer">정답 ________</div>{q.thinking&&<div className="paper-thinking"><strong>생각을 남겨요</strong><p>{q.thinking}</p><div/><div/></div>}</article>)}
 <section className="paper-check"><h2>오늘의 공부를 돌아봐요</h2><p>□ 자료를 꼼꼼히 읽었어요　 □ 답의 근거를 설명했어요　 □ 틀린 문제를 다시 봤어요</p><p>새롭게 알게 된 것: __________________________________________________</p></section>
 <div className="answer-sheet"><div className="paper-head"><strong>보호자와 함께 읽는 해설</strong><span>{s.grade}학년 {s.subject}</span></div><h2>정답보다 중요한, 생각의 과정</h2><p className="paper-source">생각 쓰기 예시는 하나의 가능한 답입니다. 표현이 달라도 근거가 타당한지 함께 살펴보세요. AI 문항은 보호자의 검토가 필요합니다.</p>{questions.map((q,i)=><div className="editorial-answer" key={i}><strong>{String(i+1).padStart(2,'0')}　정답 {q.choices.indexOf(q.answer)+1}번 · {q.answer}</strong><p>{q.explanation}</p>{q.sampleResponse&&<div><b>생각 쓰기 예시</b><p>{q.sampleResponse}</p></div>}</div>)}{record?.references&&<section className="paper-references"><h3>출제 참고자료</h3>{record.references.map(ref=><p key={ref.url}>{ref.title} · {ref.checkedAt.slice(0,10)}<br/>{ref.url}</p>)}</section>}</div>
 </div></section>
}

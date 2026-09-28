# 하루한뼘 — Vercel 배포용

이 폴더 자체가 독립적인 Next.js 프로젝트입니다. 기존 Cloudflare/Sites 환경은 필요하지 않습니다.

## 가장 간단한 배포

1. Node.js 24 LTS를 설치합니다: https://nodejs.org/
2. 이 폴더의 `deploy-vercel.cmd`를 실행합니다. Vercel 로그인 후 프로젝트 생성 질문에 답하면 소스가 업로드되고 배포됩니다. Next.js 기본 설정을 사용하세요.
3. Vercel 프로젝트 → Settings → Environment Variables에서 아래 두 값을 추가합니다. Production에 적용하고 Deployments에서 **Redeploy** 합니다.
4. 사이트의 **AI 연결** 탭에서 보호자 비밀번호를 입력하고 **실제 AI 연결 테스트**를 누릅니다.

| 환경 변수 | 입력할 값 |
|---|---|
| `OPENAI_API_KEY` | 본인의 OpenAI API 키. https://platform.openai.com/api-keys 에서 생성 |
| `AI_ACCESS_PASSWORD` | 직접 정한 12자 이상의 긴 보호자 비밀번호. 무작위 20자 이상 권장 |
| `OPENAI_MODEL` | 선택. 기본 `gpt-4o-mini` |

키가 없어도 기본 문제 풀이와 인쇄는 가능합니다. 실제 AI 출제에는 API 키와 OpenAI API 결제/사용 가능 잔액이 필요합니다. ChatGPT 구독과 API 요금은 별개입니다. 키를 소스에 넣거나 `NEXT_PUBLIC_` 변수로 만들지 마세요.

## GitHub로 배포하기

이 폴더의 내용만 새 저장소에 올리고 Vercel의 Add New → Project에서 해당 저장소를 가져오세요. Framework Preset은 Next.js, Root Directory는 저장소 루트, 나머지는 기본값입니다. 위 환경 변수를 추가한 뒤 Deploy 합니다. ZIP 파일은 보관·전달용이며, 배포 스크립트는 압축을 푼 폴더에서 실행합니다.

## 로컬 실행

`.env.example`을 `.env.local`로 복사하고 값을 입력한 뒤:

```sh
npm ci
npm run dev
```

http://localhost:3000 에서 확인합니다. 배포 빌드는 `npm run build`, 실행은 `npm start`입니다.

## 포함 기능과 데이터 범위

- 초등 1~6학년, 학년별 과목, 난이도 1~3, 하루 5·10·15·20문제.
- 월~일 기본 문제 및 AI 일별/7일 출제, 채점·해설, A4 학습지 출력.
- AI 키는 서버 환경 변수에서만 읽습니다. 보호자 잠금 해제는 서명된 HttpOnly 쿠키로 8시간 유지되며, 생성 및 연결 테스트 API 모두 인증을 확인합니다.
- EBS·교육부·국가교육위원회 공개 안내를 읽어 출제에 참고합니다. 조회 실패 시 확인 날짜가 표시된 요약을 사용합니다. 원문은 최대 6시간 캐시합니다.
- 모든 성취기준 및 첨부 교재를 자동 수집하는 서비스가 아닙니다. EBS 문제를 복제하지 않으며 공식 검수·제휴를 의미하지 않습니다. 자료실에서 범위와 날짜를 확인하세요.
- 학습 기록은 현재 브라우저에만 저장됩니다. 기기 간 동기화나 회원별 데이터베이스는 없습니다.
- 연결 테스트와 AI 출제는 유료 API를 호출합니다. 7일 출제는 최대 7회 요청하며 기존 AI/풀이 중 문항을 보존합니다. AI 정답과 해설은 보호자가 검토하세요.
- 가족용 공유 비밀번호 방식입니다. 대규모 공개 서비스용 회원 관리나 영구 사용량 제한은 포함하지 않습니다. OpenAI 프로젝트 사용 한도를 설정하세요.

## 공식 안내

- Vercel CLI 배포: https://vercel.com/docs/projects/deploy-from-cli
- Vercel 환경 변수: https://vercel.com/docs/environment-variables
- OpenAI API: https://developers.openai.com/api/docs/quickstart

실제 계정 배포와 유효한 키를 통한 AI 출제는 사용자 환경에서 위 단계로 완료해야 합니다.

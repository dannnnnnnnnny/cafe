# 카페 메뉴 · 주문 예약 · 합배송

손님용 메뉴/장바구니/구매 신청 + **회사 합배송** + 관리자 메뉴·주문 관리.  
**Next.js + Supabase + Vercel** 무료 티어.

## 기능

| 화면 | 내용 |
|------|------|
| `/` | 메뉴 조회, 장바구니, 합배송 만들기 |
| `/checkout` | 개인 방문/배달 신청 |
| `/group/new` | 합배송 모임 생성 (회사·주소·시간 고정) |
| `/group/[code]` | 초대 링크·참가자 현황 |
| `/done` | 신청 완료 · 주문 번호 |
| `/admin` | 합배송 / 개인 주문 탭 |
| `/admin/menus` | 메뉴 CRUD |

### 합배송이란?

같은 회사 동료가 **각자 장바구니·구매자 정보**로 주문하되, **배달 주소·희망 시간은 한 건**으로 묶는 방식입니다.

1. 호스트가 모임 생성 → 링크/코드 공유  
2. 동료가 링크로 들어와 메뉴 담기 → 본인 정보로 참여  
3. Admin은 모임 단위로 배달 처리, 펼치면 구매자별 내역  

- 손님 로그인 없음  
- 관리자만 Supabase Auth  
- 온라인 결제(PG) 없음 (신청만)

## 빠른 시작

### 1. Supabase

1. 프로젝트 생성 (Free)  
2. SQL Editor에서 `supabase/schema.sql` 실행 (또는 마이그레이션 순차 적용)  
3. Auth Users에 관리자 1명 생성  
4. API 키를 `.env.local`에 설정  

### 2. 로컬

```bash
cp .env.example .env.local
npm install
npm run dev
```

- 손님: http://localhost:3000  
- 관리자: http://localhost:3000/admin/login  

### 3. 배포

GitHub `master` 푸시 → Vercel 자동 배포  
https://cafe-menu-five-virid.vercel.app

## 환경 변수

| 변수 | 용도 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 브라우저/서버 anon |
| `SUPABASE_SERVICE_ROLE_KEY` | 주문·모임 API 서버 쓰기 |

## 스택

Next.js App Router · TypeScript · Tailwind · Supabase · Vercel

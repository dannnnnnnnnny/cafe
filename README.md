# 카페 메뉴 · 주문 예약

손님용 메뉴/장바구니/구매 신청 + 관리자 메뉴·주문 관리.  
**Next.js + Supabase + Vercel** 무료 티어로 동작합니다.

## 기능

| 화면 | 내용 |
|------|------|
| `/` | 메뉴 조회, 장바구니 담기 |
| `/checkout` | 방문/배달, 희망 시간, 이름·연락처, 포인트·현금영수증 |
| `/done` | 신청 완료 · 주문 번호 |
| `/admin` | 주문 목록 · 완료/취소 |
| `/admin/menus` | 메뉴 CRUD · 이미지 · 품절 |

- 손님 로그인 없음
- 관리자만 Supabase Auth 이메일 로그인
- 온라인 결제(PG) 없음 (신청만)
- 알림: 주문 생성 시 서버 로그 + `// TODO: notify admin` (추후 연동)

## 빠른 시작

### 1. Supabase

1. [supabase.com](https://supabase.com) 프로젝트 생성 (Free)
2. SQL Editor에서 `supabase/schema.sql` 전체 실행
3. Authentication → Users → 관리자 계정 1개 생성
4. Settings → API 에서 URL / anon key / service_role key 복사

### 2. 로컬

```bash
cp .env.example .env.local
# .env.local 값 채우기

npm install
npm run dev
```

- 손님: http://localhost:3000  
- 관리자: http://localhost:3000/admin/login  

`.env.local` 없이 실행하면 **데모 메뉴**만 보입니다 (주문 신청은 Supabase 필요).

### 3. Vercel 배포 (무료 서브도메인)

1. GitHub에 푸시 후 Vercel Import
2. Environment Variables에 `.env.local`과 동일 키 등록
3. `https://프로젝트명.vercel.app` 로 접속

## 환경 변수

| 변수 | 용도 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 브라우저/서버 anon |
| `SUPABASE_SERVICE_ROLE_KEY` | 주문 API 서버 쓰기 (권장) |

## 스택

- Next.js (App Router) · TypeScript · Tailwind CSS v4
- Supabase (Postgres + Auth + Storage)
- Vercel serverless

## 개인정보

주문에 이름·연락처가 저장됩니다. 관리자만 조회하며, 운영 시 보관 기간을 정하세요.

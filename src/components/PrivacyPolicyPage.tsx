import type { ReactNode } from "react";

type PolicySection = {
  readonly id: string;
  readonly title: string;
};

type DataRow = {
  readonly category: string;
  readonly items: string;
  readonly purpose: string;
  readonly note: string;
};

type RetentionRow = {
  readonly data: string;
  readonly period: string;
  readonly source: string;
};

type ExternalRow = {
  readonly provider: string;
  readonly role: string;
  readonly purpose: string;
  readonly items: string;
  readonly transfer: string;
  readonly retention: string;
};

const policySections: readonly PolicySection[] = [
  { id: "overview", title: "개인정보처리방침 개요" },
  { id: "collected-items", title: "수집하는 개인정보 항목" },
  { id: "purposes", title: "개인정보의 처리 목적" },
  { id: "retention", title: "개인정보의 보유 및 이용기간" },
  { id: "destruction", title: "개인정보의 파기 절차 및 방법" },
  { id: "third-parties", title: "개인정보의 제3자 제공" },
  { id: "delegation", title: "개인정보 처리업무 위탁" },
  { id: "overseas-transfer", title: "개인정보의 국외 이전" },
  { id: "location", title: "위치정보 처리" },
  { id: "push-device", title: "푸시 알림 및 기기정보 처리" },
  { id: "images-ai", title: "이미지 업로드 및 AI 기능 관련 처리" },
  { id: "payments", title: "결제 및 구독 정보 처리" },
  { id: "rights", title: "정보주체의 권리와 행사 방법" },
  { id: "children", title: "만 14세 미만 아동 관련 정책" },
  { id: "automatic", title: "자동 수집 정보 및 쿠키/로그" },
  { id: "security", title: "개인정보의 안전성 확보조치" },
  { id: "contact", title: "개인정보 보호책임자 및 문의처" },
  { id: "changes", title: "개인정보처리방침 변경 고지" },
];

const collectedRows: readonly DataRow[] = [
  {
    category: "계정/인증",
    items:
      "이메일, 암호화 또는 해시 처리된 비밀번호, 로그인 유형, Google/Apple provider ID, 회원 상태, 권한, 생성일, 게스트 계정 만료일",
    purpose: "회원 가입, 로그인, 소셜 로그인 연동, 게스트 이용, 권한 관리",
    note: "사업자명, 도메인, 계정 정책은 운영자가 확정해야 합니다.",
  },
  {
    category: "세션/보안",
    items:
      "access token, refresh token hash, sessionId, deviceId, 이메일 인증코드, 비밀번호 재설정 토큰 hash",
    purpose: "인증 상태 유지, 비정상 접근 방지, 이메일 인증, 비밀번호 재설정",
    note:
      "토큰 원문은 공개 페이지에 표시하지 않으며, refresh/reset 계열은 hash 형태 저장을 전제로 작성했습니다.",
  },
  {
    category: "냉장고/공동공간",
    items:
      "house 이름, 멤버명, 멤버 아이콘, 역할, 초대/가입요청 정보, 공유 스토리지 권한",
    purpose: "가구 또는 공동공간 생성, 멤버 초대, 역할별 접근 제어, 공유 냉장고 운영",
    note: "공동공간 표시명에 실명 등 개인 식별정보를 입력하지 않도록 안내가 필요합니다.",
  },
  {
    category: "식재료",
    items:
      "식재료명, 수량, 단위, 유통기한, 보관위치, 메모, 이미지, 즐겨찾기, 추가/수정/삭제 로그",
    purpose: "냉장고 재고 관리, 유통기한 알림, 레시피 추천, 변경 이력 확인",
    note: "메모와 이미지에는 이용자가 직접 입력한 내용이 포함될 수 있습니다.",
  },
  {
    category: "위치/지역",
    items:
      "위도/경도 기반 Google Geocoding 요청, placeId, 국가/도시/구, 지역 key, 중심좌표, viewport",
    purpose: "지역 기반 레시피 탐색, 지역명 정규화, 위치 기반 표시와 검색",
    note: "정확한 위치 수집 여부, 보관 여부, 위치기반서비스 약관 필요 여부는 TODO로 검토해야 합니다.",
  },
  {
    category: "이미지",
    items:
      "업로드 이미지, S3 object key, content type, 파일 크기, 소유자, house ID, 검증/삭제/만료 정보",
    purpose: "식재료 이미지 저장, 이미지 검증, 접근 권한 관리, 만료 및 삭제 처리",
    note: "이미지에는 사람, 주소, 영수증 등 민감한 내용이 포함될 수 있어 업로드 안내가 필요합니다.",
  },
  {
    category: "AI 기능",
    items:
      "이미지 스캔 요청, 결과 JSON, 에러 정보, 레시피 번역용 제목/설명/조리팁/단계 텍스트",
    purpose: "식재료 인식, 레시피 생성 또는 보조, 번역, 오류 분석과 품질 개선",
    note: "AI 제공자, 학습 사용 여부, 보관 기간, 입력 제한 문구는 운영자가 확정해야 합니다.",
  },
  {
    category: "레시피",
    items:
      "제목, 이미지, 재료, 조리단계, 공개범위, 좋아요/저장/조회수, 지역 기반 사용 여부",
    purpose: "공개 레시피 열람, 검색, 저장, 인기순/최신순 정렬, 지역 기반 추천",
    note: "현재 웹 카탈로그는 공개 레시피 조회와 게스트 인증 흐름을 사용합니다.",
  },
  {
    category: "식단 선호",
    items: "vegan, halal, gluten-free, lactose-free, low-sodium 등 선택 입력값",
    purpose: "식단 제한과 선호에 맞춘 검색, 필터링, 추천",
    note: "건강 관련 추론이 발생하지 않도록 입력 목적과 표시 범위를 제한해야 합니다.",
  },
  {
    category: "푸시",
    items: "FCM token, platform, deviceName, locale, 알림 수신 여부, 알림 payload",
    purpose: "유통기한, 초대, 서비스 알림, 수신 동의 관리, 발송 실패 처리",
    note: "광고성 정보 수신 동의와 야간 발송 제한 적용 여부는 별도 TODO입니다.",
  },
  {
    category: "결제",
    items:
      "Google Play/App Store productId, packageName, purchaseToken, transactionId, orderId, 구독상태, 자동갱신 여부, 만료일, 결제 raw payload, 티켓 지급 이력",
    purpose: "구독 구매 검증, 자동갱신 상태 확인, 유료 기능 제공, 환불/분쟁 대응",
    note: "카드번호 등 결제수단 원문은 앱마켓이 처리하며 서비스는 검증 결과와 토큰성 정보를 처리합니다.",
  },
  {
    category: "운영/관리",
    items:
      "관리자 작업 로그, actor, 요청/응답 preview, 에러, 처리시간, 관리자 로그인 실패/차단 관련 접속 정보",
    purpose: "운영자 감사, 장애 대응, 부정 이용 방지, 관리자 계정 보호",
    note: "로그 preview에 개인정보가 과도하게 남지 않도록 마스킹 정책을 운영해야 합니다.",
  },
];

const retentionRows: readonly RetentionRow[] = [
  {
    data: "이메일 인증코드",
    period: "생성 후 5분",
    source: "코드/운영 요구사항에서 확인 가능한 짧은 인증 유효기간",
  },
  {
    data: "비밀번호 재설정 토큰",
    period: "생성 후 10분",
    source: "코드/운영 요구사항에서 확인 가능한 재설정 유효기간",
  },
  {
    data: "refresh token/session",
    period: "기본 60일",
    source: "세션 유지 정책값. 실제 만료/회전/폐기 정책은 운영자가 확인",
  },
  {
    data: "게스트 계정",
    period: "기본 24시간",
    source: "게스트 계정 만료 정책값",
  },
  {
    data: "S3 presigned URL",
    period: "기본 10분",
    source: "임시 접근 URL 유효기간. 파일 자체 보관기간과 구분",
  },
  {
    data: "푸시 토큰",
    period: "사용자가 삭제/비활성화하거나 유효하지 않은 토큰으로 확인될 때까지",
    source: "알림 발송 및 실패 처리 목적",
  },
  {
    data: "회원정보, 식재료, 이미지, 레시피, 결제정보",
    period: "회원 탈퇴 또는 목적 달성 시까지. 단, 관계 법령상 보존 필요 시 해당 기간",
    source: "운영자가 실제 삭제 API, 백업 보관, 법정 보존기간을 TODO로 확정",
  },
  {
    data: "결제 기록, 계약/청약철회, 대금결제, 소비자 불만/분쟁 처리 기록",
    period: "TODO: 전자상거래 등 관계 법령상 보존 항목과 기간 확인 후 기재",
    source: "앱마켓 결제와 구독 운영에 따라 적용 여부 확인 필요",
  },
  {
    data: "관리자 작업 로그, 접속/보안 로그",
    period: "TODO: 보안감사, 침해사고 대응, 내부통제 목적에 필요한 기간 확정",
    source: "로그 최소화와 접근권한 통제 기준 필요",
  },
];

const externalRows: readonly ExternalRow[] = [
  {
    provider: "Google",
    role: "TODO: 정확한 법인명 확인",
    purpose:
      "OAuth 로그인, Maps/Geocoding, Google Play 결제검증, Firebase Cloud Messaging, Gemini AI 기능",
    items:
      "Google provider ID, 이메일, 위도/경도, placeId, 지역 정보, purchaseToken, productId, FCM token, 알림 payload, 이미지/텍스트 AI 요청 및 결과",
    transfer: "TODO: 제공/위탁/국외 이전 해당 여부, 국가, 이전 일시와 방법 확인",
    retention: "TODO: Google 서비스별 보유기간과 삭제 방법 확인",
  },
  {
    provider: "Apple",
    role: "TODO: 정확한 법인명 확인",
    purpose: "Apple 로그인, App Store 결제검증, 서버 알림 처리",
    items:
      "Apple provider ID, 이메일 또는 private relay 이메일, transactionId, orderId, productId, 구독상태, 자동갱신 여부, 만료일, 결제 검증 payload",
    transfer: "TODO: 제공/위탁/국외 이전 해당 여부, 국가, 이전 일시와 방법 확인",
    retention: "TODO: Apple 서비스별 보유기간과 삭제 방법 확인",
  },
  {
    provider: "AWS S3",
    role: "TODO: Amazon Web Services 관련 계약 법인명 확인",
    purpose: "식재료/레시피 이미지 저장, 임시 접근 URL 발급, 삭제/만료 관리",
    items:
      "업로드 이미지, S3 object key, content type, 파일 크기, 소유자, house ID, 검증/삭제/만료 정보",
    transfer: "TODO: 리전, 국가, 이전 방식, 접근권한 관리 기준 확인",
    retention: "회원 탈퇴 또는 목적 달성 시까지. 세부 보관기간 TODO",
  },
  {
    provider: "Resend",
    role: "TODO: 정확한 법인명 확인",
    purpose: "이메일 인증, 비밀번호 재설정 메일 발송",
    items: "이메일 주소, 인증/재설정 메일 내용, 발송 상태와 오류 정보",
    transfer: "TODO: 제공/위탁/국외 이전 해당 여부, 국가, 이전 일시와 방법 확인",
    retention: "TODO: 발송 로그 보유기간 확인",
  },
  {
    provider: "PostgreSQL/Redis 호스팅 사업자",
    role: "TODO: 실제 DB/캐시 호스팅 사업자 법인명 확인",
    purpose: "서비스 데이터, 계정 데이터, 세션성 데이터 저장",
    items:
      "회원정보, 냉장고/식재료/레시피/결제/로그 데이터, refresh token hash, sessionId, deviceId 등",
    transfer: "TODO: 호스팅 리전, 국가, 암호화, 백업 위치, 이전 방식 확인",
    retention: "서비스 보유기간 및 백업 삭제주기 TODO",
  },
  {
    provider: "외부 ingredient/master API",
    role: "TODO: 정확한 API 제공자 법인명 확인",
    purpose: "식재료 검색, 식재료명 정규화, master ID 매핑",
    items: "검색어, 식재료명, 언어/locale, master ID, 매핑 결과",
    transfer: "TODO: 제공/위탁/국외 이전 해당 여부, 국가, 이전 일시와 방법 확인",
    retention: "TODO: API 제공자 보유기간 확인",
  },
];

export function PrivacyPolicyPage(): JSX.Element {
  return (
    <main className="privacy-page">
      <article className="privacy-document" aria-labelledby="privacy-title">
        <header className="privacy-hero">
          <p className="privacy-eyebrow">SmartRef / 스마트 냉장고 서비스</p>
          <h1 id="privacy-title">개인정보처리방침</h1>
          <p className="privacy-lead">
            본 문서는 앱스토어, 플레이스토어 및 서비스 내 공개 URL로 게시하기 위한
            개인정보처리방침 초안입니다. 2026-06-15 기준 프로젝트 코드와 운영 요구사항,
            대한민국 개인정보 보호법 제30조 및 개인정보보호위원회 작성지침을 참고했으며,
            실제 운영자가 확인해야 하는 항목은 TODO로 남겨두었습니다.
          </p>
          <dl className="privacy-meta" aria-label="정책 기본 정보">
            <div>
              <dt>시행일</dt>
              <dd>2026-06-15</dd>
            </div>
            <div>
              <dt>최종 수정일</dt>
              <dd>2026-06-15</dd>
            </div>
            <div>
              <dt>운영자</dt>
              <dd>TODO: 사업자명 / 대표자 / 주소</dd>
            </div>
            <div>
              <dt>공개 도메인</dt>
              <dd>TODO: https://your-domain.example/privacy</dd>
            </div>
          </dl>
        </header>

        <nav className="privacy-toc" aria-label="개인정보처리방침 목차">
          <h2>목차</h2>
          <ol>
            {policySections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.title}</a>
              </li>
            ))}
          </ol>
        </nav>

        <PolicySection id="overview" title="개인정보처리방침 개요">
          <p>
            SmartRef는 냉장고 식재료 관리, 공동공간 관리, 레시피 탐색, 이미지 업로드,
            AI 보조 기능, 푸시 알림, 결제 및 구독 제공을 위해 필요한 범위에서
            개인정보를 처리합니다. 이 방침은 이용자가 어떤 정보가 어떤 목적으로 처리되는지
            쉽게 확인할 수 있도록 작성한 공개용 문서입니다.
          </p>
          <p>
            본 문서는 법률 자문이나 완성된 준수 보증 문서가 아닙니다. 실제 서비스 배포 전
            운영자는 사업자 정보, 서비스 도메인, 수탁사 계약, 국외 이전 현황, 법정 보존기간,
            회원탈퇴/삭제 API 구현 여부, 광고성 알림 동의 정책을 확인하여 TODO 항목을
            확정해야 합니다.
          </p>
          <ul>
            <li>
              공식 기준:{" "}
              <a href="https://www.law.go.kr/법령/개인정보보호법" rel="noreferrer">
                개인정보 보호법
              </a>{" "}
              및{" "}
              <a
                href="https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS217&mCode=D010030000&nttId=12018"
                rel="noreferrer"
              >
                개인정보보호위원회 개인정보 처리방침 작성지침(2026.4. 개정)
              </a>
            </li>
            <li>법령/지침 확인 기준일: 2026-06-15</li>
            <li>서비스 운영자 정보: TODO: 사업자명, 대표자, 주소, 연락처, 이메일</li>
          </ul>
        </PolicySection>

        <PolicySection id="collected-items" title="수집하는 개인정보 항목">
          <p>
            서비스 기능 사용 과정에서 다음 항목이 수집 또는 생성될 수 있습니다. 실제 수집
            항목은 앱, 서버, 관리자 도구의 구현 범위에 따라 달라질 수 있으므로 운영자는
            배포 전 스키마와 로그 정책을 다시 확인해야 합니다.
          </p>
          <TableWrap>
            <table>
              <thead>
                <tr>
                  <th scope="col">구분</th>
                  <th scope="col">처리 항목</th>
                  <th scope="col">주요 목적</th>
                  <th scope="col">비고 / TODO</th>
                </tr>
              </thead>
              <tbody>
                {collectedRows.map((row) => (
                  <tr key={row.category}>
                    <th scope="row">{row.category}</th>
                    <td>{row.items}</td>
                    <td>{row.purpose}</td>
                    <td>{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        </PolicySection>

        <PolicySection id="purposes" title="개인정보의 처리 목적">
          <ul>
            <li>회원 가입, 로그인, 소셜 인증, 게스트 이용, 세션 유지 및 계정 보호</li>
            <li>냉장고, house, 멤버, 역할, 초대와 가입요청 등 공동공간 기능 제공</li>
            <li>식재료 등록, 유통기한 관리, 이미지 저장, 즐겨찾기와 변경 이력 관리</li>
            <li>지역 기반 레시피 검색, 공개 레시피 열람, 저장, 좋아요, 조회수 집계</li>
            <li>식단 선호와 제한식 기반 필터링 및 추천 기능 제공</li>
            <li>이미지 스캔, 레시피 번역, AI 결과 생성 및 오류 분석</li>
            <li>푸시 알림 발송, 알림 수신 동의 관리, 발송 실패 토큰 정리</li>
            <li>Google Play 및 App Store 결제 검증, 구독 상태 관리, 티켓 지급 이력 관리</li>
            <li>부정 이용 방지, 관리자 감사, 장애 대응, 보안 이벤트 분석</li>
            <li>법령상 의무 이행, 이용자 문의 및 분쟁 대응</li>
          </ul>
        </PolicySection>

        <PolicySection id="retention" title="개인정보의 보유 및 이용기간">
          <p>
            SmartRef는 원칙적으로 개인정보 처리 목적이 달성되거나 이용자가 삭제를 요청하면
            지체 없이 파기합니다. 다만 관계 법령에 따라 보존해야 하는 정보는 해당 법령에서
            정한 기간 동안 분리 보관할 수 있습니다.
          </p>
          <TableWrap>
            <table>
              <thead>
                <tr>
                  <th scope="col">항목</th>
                  <th scope="col">보유기간</th>
                  <th scope="col">근거 / 확인 상태</th>
                </tr>
              </thead>
              <tbody>
                {retentionRows.map((row) => (
                  <tr key={row.data}>
                    <th scope="row">{row.data}</th>
                    <td>{row.period}</td>
                    <td>{row.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
          <p className="privacy-note">
            TODO: 정식 회원 탈퇴 API가 없다면 “회원탈퇴/삭제 요청 시 처리” 절차를 운영
            문서와 서비스 화면에 명시하고, 실제 삭제/비활성화/백업 삭제 흐름을 구현해야 합니다.
          </p>
        </PolicySection>

        <PolicySection id="destruction" title="개인정보의 파기 절차 및 방법">
          <ul>
            <li>
              파기 사유가 발생하면 해당 계정, 식재료, 이미지, 레시피, 세션, 결제 검증 기록,
              로그를 목적별 보유기간에 따라 삭제하거나 분리 보관합니다.
            </li>
            <li>
              전자 파일은 복구하기 어렵도록 삭제하고, 데이터베이스 레코드는 삭제 또는
              비식별화합니다. 백업 데이터는 TODO: 백업 주기와 보관기간에 따라 순차 삭제합니다.
            </li>
            <li>
              법령상 보존이 필요한 결제·분쟁·보안 로그는 별도 저장소에 분리하고 접근 권한을
              제한합니다.
            </li>
            <li>
              S3 이미지와 presigned URL은 파일 보관기간과 임시 URL 유효기간을 구분해 관리하며,
              URL은 기본 10분 후 만료되도록 운영합니다.
            </li>
          </ul>
        </PolicySection>

        <PolicySection id="third-parties" title="개인정보의 제3자 제공">
          <p>
            SmartRef는 이용자의 개인정보를 개인정보 처리 목적 범위 내에서 처리하며, 원칙적으로
            이용자의 동의 없이 제3자에게 제공하지 않습니다. 다만 법령에 근거가 있거나 수사기관,
            법원 등 적법한 절차에 따른 요청이 있는 경우 필요한 범위에서 제공될 수 있습니다.
          </p>
          <p className="privacy-note">
            TODO: Google, Apple, AWS, Resend, DB/Redis 호스팅, 외부 ingredient/master API가
            법적으로 제3자 제공인지, 처리위탁인지, 국외 이전인지 계약과 데이터 흐름 기준으로
            확정해야 합니다.
          </p>
        </PolicySection>

        <PolicySection id="delegation" title="개인정보 처리업무 위탁">
          <p>
            서비스 제공을 위해 다음 외부 사업자에게 개인정보 처리업무를 위탁하거나 위탁 후보로
            둘 수 있습니다. 정확한 법인명, 국가, 보유기간, 재위탁 여부, 이전 일시와 방법은
            운영자가 계약서를 기준으로 TODO를 채워야 합니다.
          </p>
          <ExternalTable />
        </PolicySection>

        <PolicySection id="overseas-transfer" title="개인정보의 국외 이전">
          <p>
            OAuth, 지도/지오코딩, 앱마켓 결제검증, 푸시 발송, AI 처리, 이미지 저장, DB/캐시
            호스팅 과정에서 국외 이전이 발생할 수 있습니다. 국외 이전이 실제로 발생하는 경우
            이전받는 자, 이전 국가, 이전 항목, 이전 일시와 방법, 보유 및 이용기간, 거부 방법과
            불이익을 별도로 고지해야 합니다.
          </p>
          <ExternalTable />
        </PolicySection>

        <PolicySection id="location" title="위치정보 처리">
          <ul>
            <li>
              서비스는 지역 기반 레시피 탐색과 지역명 정규화를 위해 위도/경도, placeId,
              국가/도시/구, 지역 key, 중심좌표, viewport 정보를 처리할 수 있습니다.
            </li>
            <li>
              Google Geocoding 요청에는 위치 좌표 또는 검색어가 외부 서비스로 전송될 수
              있습니다. 정확한 전송 항목, 국가, 보유기간은 TODO로 확정해야 합니다.
            </li>
            <li>
              위치정보 수집은 OS 권한 또는 이용자 입력을 통해 이루어져야 하며, 이용자는
              기기 설정에서 위치 권한을 변경할 수 있습니다.
            </li>
            <li>
              TODO: 위치정보의 보호 및 이용 등에 관한 법률상 위치기반서비스 이용약관, 신고,
              보유기간, 개인위치정보 파기 절차가 필요한지 검토해야 합니다.
            </li>
          </ul>
        </PolicySection>

        <PolicySection id="push-device" title="푸시 알림 및 기기정보 처리">
          <ul>
            <li>
              푸시 알림을 위해 FCM token, platform, deviceName, locale, 알림 수신 여부,
              알림 payload를 처리할 수 있습니다.
            </li>
            <li>
              푸시 토큰은 사용자가 앱을 삭제하거나 알림을 비활성화하거나, 발송 과정에서
              유효하지 않은 토큰으로 확인될 때까지 보관할 수 있습니다.
            </li>
            <li>
              유통기한, 초대, 보안, 서비스 운영 알림은 서비스 이용에 필요한 범위에서 발송될
              수 있습니다. 이벤트·마케팅성 알림은 별도 동의와 철회 경로가 필요합니다.
            </li>
            <li>TODO: 광고성 정보 수신 동의, 야간 발송 제한, 철회 화면과 로그 보관기간 확정</li>
          </ul>
        </PolicySection>

        <PolicySection id="images-ai" title="이미지 업로드 및 AI 기능 관련 처리">
          <ul>
            <li>
              식재료 이미지 업로드 시 이미지 파일, S3 object key, content type, 파일 크기,
              소유자, house ID, 검증/삭제/만료 정보가 처리될 수 있습니다.
            </li>
            <li>
              이미지 스캔 또는 AI 기능을 사용하는 경우 이미지, 요청 텍스트, 결과 JSON, 에러 정보,
              레시피 제목/설명/조리팁/단계 텍스트가 AI 제공자에게 전송되거나 서버에서 처리될 수
              있습니다.
            </li>
            <li>
              이용자는 사람 얼굴, 신분증, 주소, 결제정보, 건강정보 등 식재료 인식 목적과
              관련 없는 민감한 내용을 이미지나 메모에 업로드하지 않도록 안내받아야 합니다.
            </li>
            <li>
              TODO: Gemini 등 AI 제공자의 정확한 법인명, 처리 국가, 학습 사용 여부, 입력/출력
              보관기간, 삭제 요청 경로, 미성년자 이용 제한, 부정확한 AI 결과 고지 문구 확정
            </li>
          </ul>
        </PolicySection>

        <PolicySection id="payments" title="결제 및 구독 정보 처리">
          <ul>
            <li>
              유료 기능 제공을 위해 Google Play 또는 App Store의 productId, packageName,
              purchaseToken, transactionId, orderId, 구독상태, 자동갱신 여부, 만료일, 결제 raw
              payload, 티켓 지급 이력을 처리할 수 있습니다.
            </li>
            <li>
              카드번호, 계좌번호 등 결제수단 원문은 앱마켓 결제 시스템이 처리하며, SmartRef는
              구매 검증과 구독 상태 확인에 필요한 정보만 수신하는 것을 전제로 합니다.
            </li>
            <li>
              환불, 취소, 결제 오류, 분쟁 대응을 위해 관련 기록을 보관할 수 있습니다.
            </li>
            <li>
              TODO: 관계 법령상 결제·계약·청약철회·소비자 불만 처리 기록의 보존 항목과
              기간을 확인하여 확정
            </li>
          </ul>
        </PolicySection>

        <PolicySection id="rights" title="정보주체의 권리와 행사 방법">
          <p>
            이용자는 개인정보 열람, 정정, 삭제, 처리정지, 동의 철회, 회원탈퇴를 요청할 수
            있습니다. SmartRef는 본인 확인 후 관련 법령에 따라 요청을 처리합니다.
          </p>
          <ul>
            <li>요청 경로: TODO: 앱 설정 경로 / 고객센터 이메일 / 문의 페이지 URL</li>
            <li>본인 확인: 로그인 상태, 이메일 인증, 구매정보 확인 등 필요한 범위에서 수행</li>
            <li>
              삭제 예외: 법령상 보존 의무가 있는 정보, 분쟁 대응에 필요한 정보, 다른 이용자의
              권리와 안전을 위해 필요한 정보는 제한될 수 있습니다.
            </li>
            <li>
              TODO: 정식 회원탈퇴 API가 없는 경우, “회원탈퇴/삭제 요청 시 처리” 문구와
              내부 처리 SLA, 삭제 범위, 백업 삭제 시점을 운영 정책에 명시하고 구현해야 합니다.
            </li>
          </ul>
        </PolicySection>

        <PolicySection id="children" title="만 14세 미만 아동 관련 정책">
          <p>
            SmartRef는 원칙적으로 만 14세 미만 아동을 주요 대상으로 하지 않습니다. 만 14세
            미만 아동의 개인정보를 처리해야 하는 경우 법정대리인의 동의를 받고, 법정대리인이
            열람·정정·삭제·처리정지를 요청할 수 있는 절차를 제공해야 합니다.
          </p>
          <p className="privacy-note">
            TODO: 실제 가입 가능 연령, 보호자 동의 절차, 아동 계정 차단 또는 삭제 정책,
            앱마켓 연령 등급을 확정해야 합니다.
          </p>
        </PolicySection>

        <PolicySection id="automatic" title="자동 수집 정보 및 쿠키/로그">
          <ul>
            <li>
              웹 카탈로그는 게스트 이용을 위해 브라우저 sessionStorage에 게스트 access token을,
              localStorage에 guest deviceId를 저장할 수 있습니다. 이 정보는 공개 페이지 자체에는
              표시되지 않습니다.
            </li>
            <li>
              서버는 접속 일시, IP 주소, user-agent, 요청 URL, 응답 상태, 처리시간, 에러 로그,
              관리자 로그인 실패/차단 관련 접속 정보를 자동으로 생성할 수 있습니다.
            </li>
            <li>
              현재 코드 기준 별도 광고 쿠키나 추적 쿠키 사용은 확인되지 않았습니다. TODO:
              분석 도구, 광고 SDK, A/B 테스트 도구 도입 시 쿠키/SDK 목록과 거부 방법을 추가해야
              합니다.
            </li>
            <li>
              로그의 요청/응답 preview에는 개인정보가 포함될 수 있으므로 최소화, 마스킹, 접근권한
              통제가 필요합니다.
            </li>
          </ul>
        </PolicySection>

        <PolicySection id="security" title="개인정보의 안전성 확보조치">
          <ul>
            <li>비밀번호, refresh token, 비밀번호 재설정 토큰 등 인증정보는 암호화 또는 hash 처리</li>
            <li>access token/session 만료, refresh token 회전 또는 폐기, 관리자 로그인 실패 차단</li>
            <li>역할 기반 접근 제어로 house, 이미지, 레시피, 관리자 기능 접근 제한</li>
            <li>S3 object key 직접 노출 최소화, presigned URL 기본 10분 만료, 이미지 삭제/만료 관리</li>
            <li>전송 구간 암호화, 데이터베이스와 백업 접근권한 제한, 운영 로그 마스킹</li>
            <li>관리자 작업 로그 기록, 오류와 처리시간 모니터링, 침해사고 대응 절차 운영</li>
            <li>
              TODO: 실제 암호화 알고리즘, 키 관리, 접근권한 검토 주기, 백업 암호화, 수탁사 보안
              조치 확인
            </li>
          </ul>
        </PolicySection>

        <PolicySection id="contact" title="개인정보 보호책임자 및 문의처">
          <p>
            개인정보 처리와 관련한 문의, 권리 행사, 불만 처리, 피해 구제 요청은 아래 연락처로
            접수할 수 있습니다.
          </p>
          <TableWrap>
            <table>
              <tbody>
                <tr>
                  <th scope="row">개인정보 보호책임자</th>
                  <td>TODO: 이름 / 직책</td>
                </tr>
                <tr>
                  <th scope="row">담당 부서</th>
                  <td>TODO: 부서명</td>
                </tr>
                <tr>
                  <th scope="row">이메일</th>
                  <td>TODO: privacy@example.com</td>
                </tr>
                <tr>
                  <th scope="row">전화번호</th>
                  <td>TODO: +82-00-0000-0000</td>
                </tr>
                <tr>
                  <th scope="row">주소</th>
                  <td>TODO: 사업장 주소</td>
                </tr>
              </tbody>
            </table>
          </TableWrap>
          <p className="privacy-note">
            개인정보 침해에 대한 신고나 상담이 필요한 경우 개인정보침해신고센터, 개인정보
            분쟁조정위원회 등 관계 기관을 통해 도움을 받을 수 있습니다. TODO: 공식 기관 링크와
            연락처 최신 확인 후 추가
          </p>
        </PolicySection>

        <PolicySection id="changes" title="개인정보처리방침 변경 고지">
          <p>
            이 개인정보처리방침은 법령, 지침, 서비스 기능, 수탁사, 국외 이전 현황이 변경되는
            경우 개정될 수 있습니다. 중요한 변경이 있는 경우 시행 전 서비스 내 공지, 이메일,
            앱 알림 또는 이 페이지를 통해 고지합니다.
          </p>
          <ul>
            <li>현재 버전: 2026-06-15</li>
            <li>이전 버전: TODO: 이전 방침 URL 또는 변경 이력</li>
            <li>변경 고지 방법과 사전 고지 기간: TODO: 운영 정책 확정</li>
          </ul>
        </PolicySection>
      </article>
    </main>
  );
}

function PolicySection({
  id,
  title,
  children,
}: {
  readonly id: string;
  readonly title: string;
  readonly children: ReactNode;
}): JSX.Element {
  return (
    <section className="privacy-section" id={id}>
      <h2>{title}</h2>
      <div className="privacy-section__body">{children}</div>
    </section>
  );
}

function TableWrap({ children }: { readonly children: ReactNode }): JSX.Element {
  return (
    <div className="privacy-table-wrap" role="region" tabIndex={0}>
      {children}
    </div>
  );
}

function ExternalTable(): JSX.Element {
  return (
    <TableWrap>
      <table>
        <thead>
          <tr>
            <th scope="col">외부 사업자 후보</th>
            <th scope="col">법인명 / 역할</th>
            <th scope="col">목적</th>
            <th scope="col">처리 항목</th>
            <th scope="col">국외 이전 / 제공 여부</th>
            <th scope="col">보유기간</th>
          </tr>
        </thead>
        <tbody>
          {externalRows.map((row) => (
            <tr key={row.provider}>
              <th scope="row">{row.provider}</th>
              <td>{row.role}</td>
              <td>{row.purpose}</td>
              <td>{row.items}</td>
              <td>{row.transfer}</td>
              <td>{row.retention}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrap>
  );
}

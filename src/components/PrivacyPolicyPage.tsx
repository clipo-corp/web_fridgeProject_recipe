import type { ReactNode } from "react";

type PolicySection = {
  readonly id: string;
  readonly title: string;
};

const policySections: readonly PolicySection[] = [
  { id: "purpose", title: "제1조 개인정보의 처리 목적" },
  { id: "items", title: "제2조 처리하는 개인정보의 항목" },
  { id: "retention", title: "제3조 개인정보의 처리 및 보유 기간" },
  { id: "third-party", title: "제4조 개인정보의 제3자 제공" },
  { id: "delegation", title: "제5조 개인정보 처리의 위탁" },
  { id: "rights", title: "제6조 정보주체의 권리·의무 및 행사방법" },
  { id: "destruction", title: "제7조 개인정보의 파기" },
  { id: "location", title: "제7조의2 위치정보의 처리" },
  { id: "permissions", title: "제7조의3 모바일 앱 접근권한" },
  { id: "payments", title: "제7조의4 유료결제 정보 처리" },
  { id: "contact", title: "제8조 개인정보 보호책임자" },
];

const requiredItems = [
  "이메일",
  "비밀번호(일반 회원가입 시 암호화 저장)",
  "소셜 로그인 식별정보",
  "닉네임/표시이름",
  "프로필 이미지",
  "자기소개",
  "회원 상태",
  "유료회원 여부",
  "티켓/이용권 보유 내역",
  "기기정보",
  "푸시 알림 토큰",
  "서비스 이용기록",
  "접속 로그",
  "IP 주소",
  "위치정보(위도/경도, 국가/도시/지역 등 행정구역 정보)",
  "냉장고/하우스/보관공간 정보",
  "식재료명",
  "수량",
  "단위",
  "유통기한",
  "메모",
  "식재료 이미지",
  "레시피 작성 내용",
  "레시피 이미지",
  "좋아요/저장/팔로우 정보",
  "문의/신고 내용",
  "결제 상품ID",
  "구매토큰",
  "거래ID",
  "주문ID",
  "결제 및 구독 상태",
];

export function PrivacyPolicyPage(): JSX.Element {
  return (
    <main className="privacy-page">
      <article className="privacy-document" aria-labelledby="privacy-title">
        <header className="privacy-hero">
          <p className="privacy-eyebrow">Clipo</p>
          <h1 id="privacy-title">개인정보처리방침</h1>
          <p className="privacy-lead">
            Clipo(이하 &quot;회사&quot;)는 개인정보보호법에 따라 이용자의 개인정보를 보호하고 이와
            관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보 처리방침을
            수립·공개합니다.
          </p>
          <dl className="privacy-meta" aria-label="정책 기본 정보">
            <div>
              <dt>시행일</dt>
              <dd>2026-06-26</dd>
            </div>
            <div>
              <dt>회사명</dt>
              <dd>Clipo</dd>
            </div>
            <div>
              <dt>웹사이트</dt>
              <dd>
                <a href="https://webfridgerecipe.netlify.app/" rel="noreferrer">
                  webfridgerecipe.netlify.app
                </a>
              </dd>
            </div>
            <div>
              <dt>이메일</dt>
              <dd>
                <a href="mailto:clipocor@gmail.com">clipocor@gmail.com</a>
              </dd>
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

        <PolicySection id="purpose" title="제1조 (개인정보의 처리 목적)">
          <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다.</p>
          <ul>
            <li>회원가입 및 로그인, 본인 식별, 회원 관리</li>
            <li>서비스 제공, 냉장고 및 식재료 관리</li>
            <li>위치 기반 지역 설정 및 레시피 추천/검색 제공</li>
            <li>레시피 작성·공개·저장·좋아요·팔로우 등 커뮤니티 기능 제공</li>
            <li>이미지 업로드 및 분석 기능 제공</li>
            <li>유료 결제 검증, 구독 및 티켓 지급/관리</li>
            <li>푸시 알림 발송</li>
            <li>고객 문의 및 신고 처리</li>
            <li>부정 이용 방지</li>
            <li>서비스 안정성 확보 및 오류 분석</li>
          </ul>
        </PolicySection>

        <PolicySection id="items" title="제2조 (처리하는 개인정보의 항목)">
          <p>회사는 다음의 개인정보를 처리합니다.</p>
          <p>
            <strong>필수 수집 항목:</strong> {requiredItems.join(", ")}
          </p>
          <p>
            <strong>위치정보 수집:</strong> 현재 위치정보(GPS)
          </p>
        </PolicySection>

        <PolicySection id="retention" title="제3조 (개인정보의 처리 및 보유 기간)">
          <p>
            회원 탈퇴 시까지 보유합니다. 단, 이용자가 직접 삭제한 정보는 삭제 시까지 보관하며,
            관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.
          </p>
          <ul>
            <li>결제 및 거래 관련 기록: 전자상거래 등에서의 소비자보호에 관한 법률에 따라 5년</li>
            <li>소비자 불만 또는 분쟁처리 기록: 3년</li>
            <li>접속 로그 등 통신사실확인자료: 통신비밀보호법에 따라 3개월</li>
            <li>
              위치정보 이용·제공 사실 확인자료: 위치정보의 보호 및 이용 등에 관한 법률에 따라
              6개월
            </li>
          </ul>
          <p>단, 관계 법령에 의해 보존할 필요가 있는 경우 해당 법령에서 정한 기간 동안 보관합니다.</p>
        </PolicySection>

        <PolicySection id="third-party" title="제4조 (개인정보의 제3자 제공)">
          <p>회사는 이용자의 개인정보를 제3자에게 제공하지 않습니다.</p>
        </PolicySection>

        <PolicySection id="delegation" title="제5조 (개인정보 처리의 위탁)">
          <p>회사는 개인정보 처리를 위탁하지 않습니다.</p>
        </PolicySection>

        <PolicySection id="rights" title="제6조 (정보주체의 권리·의무 및 그 행사방법)">
          <p>
            이용자는 개인정보 열람, 정정, 삭제, 처리정지를 요청할 수 있습니다. 이용자는 언제든지
            개인정보 처리에 대한 동의를 철회할 수 있으며, 회사는 지체 없이 처리합니다.
          </p>
        </PolicySection>

        <PolicySection id="destruction" title="제7조 (개인정보의 파기)">
          <p>
            개인정보 보유기간이 경과하거나 처리 목적이 달성된 경우 지체 없이 파기합니다. 전자적
            파일 형태는 복구 불가능한 방법으로 영구 삭제하며, 출력물은 분쇄 또는 소각합니다.
          </p>
        </PolicySection>

        <PolicySection id="location" title="제7조의2 (위치정보의 처리)">
          <p>
            회사는 위치정보의 보호 및 이용 등에 관한 법률에 따라 이용자의 위치정보를 처리합니다.
            위치정보는 서비스 제공 목적으로만 이용되며, 이용자의 동의 없이 제3자에게 제공하지
            않습니다.
          </p>
        </PolicySection>

        <PolicySection id="permissions" title="제7조의3 (모바일 앱 접근권한)">
          <p>
            앱 서비스 이용 시 특정 기기 접근권한을 요청할 수 있습니다. 접근권한은 서비스 제공에
            필요한 최소한으로 요청하며, 이용자는 언제든지 기기 설정에서 철회할 수 있습니다.
          </p>
        </PolicySection>

        <PolicySection id="payments" title="제7조의4 (유료결제 정보 처리)">
          <p>
            유료 서비스 이용 시 결제 정보를 처리합니다. 결제 정보는 전자금융거래법에 따라
            보호되며, 결제 대행사에 최소한의 정보만 제공됩니다.
          </p>
        </PolicySection>

        <PolicySection id="contact" title="제8조 (개인정보 보호책임자)">
          <TableWrap>
            <table>
              <tbody>
                <tr>
                  <th scope="row">성명</th>
                  <td>유현우</td>
                </tr>
                <tr>
                  <th scope="row">이메일</th>
                  <td>
                    <a href="mailto:clipocor@gmail.com">clipocor@gmail.com</a>
                  </td>
                </tr>
                <tr>
                  <th scope="row">문의처</th>
                  <td>
                    <a href="tel:01042337306">01042337306</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </TableWrap>
          <p>이 방침은 2026-06-26부터 시행합니다.</p>
          <p>
            Clipo
            <br />
            웹사이트:{" "}
            <a href="https://webfridgerecipe.netlify.app/" rel="noreferrer">
              https://webfridgerecipe.netlify.app/
            </a>
            <br />
            이메일: <a href="mailto:clipocor@gmail.com">clipocor@gmail.com</a>
          </p>
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

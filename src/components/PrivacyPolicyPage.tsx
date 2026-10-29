import type { ReactNode } from "react";
import { LEGAL_AI_SANCTION_CLAUSES, LEGAL_LAUNCH_CLAUSES } from "../lib/legalPublication";
import { Pending, UserCheck } from "./legal/LegalMarks";

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
  { id: "overseas-transfer", title: "제5조의2 개인정보의 국외 이전" },
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

// 〔출시 때〕·AI 이용 제한 문구는 `{스위치 && …}` 로 감싼다. 스위치가 빌드 때 상수로 접혀, 꺼진
// 문구는 결과물에 남지 않는다(결과물 [확인 필요] 검사도 실제로 보이는 것에만 걸린다).

// AI 이용 제한(이용약관 AI 기능 장)과 짝인 조. 목차에도 그때만 넣는다.
const automatedDecisionSection: PolicySection = {
  id: "automated-decision",
  title: "제7조의5 자동화된 결정",
};

export function PrivacyPolicyPage(): JSX.Element {
  const tocSections = policySections.flatMap((section) =>
    section.id === "payments" && LEGAL_AI_SANCTION_CLAUSES ? [section, automatedDecisionSection] : [section],
  );

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
              <dd>
                <Pending>개정 시행일</Pending>
              </dd>
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
            {tocSections.map((section) => (
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
            <li>
              레시피 관심사(온보딩에서 고른 관심 주제·관심 식단)와 영양 관심을 반영한 추천: 맞는 레시피를
              더 보여 주거나 앞에 놓고 배지를 붙이는 데만 쓰며, 다른 레시피를 숨기거나 빼지 않습니다
            </li>
            <li>
              이용자가 프로필에 저장한 식단·알레르기를 레시피 검색의 기본 조건으로 적용: 그 식단에 맞지
              않거나 그 알레르기 재료가 든 것으로 확인되는 레시피를 결과에서 뺍니다. 확인하지 못한 재료는
              앱에 따로 표시하며, 이용자는 검색마다 이번 검색에서만 조건을 끌 수 있습니다
            </li>
            {LEGAL_LAUNCH_CLAUSES && (
              <li>
                AI 대화로 레시피를 찾거나 만들 때 프로필의 식단·알레르기를 기본 조건으로 적용: 알레르기
                재료가 든 레시피를 빼고, AI 가 만드는 레시피에 그 재료를 넣지 않도록 요청합니다
              </li>
            )}
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
          <ul>
            <li>
              레시피 관심사를 고른 경우(선택, 약한 선호): 관심 주제, 관심 식단(비건·채식·페스코 중 하나),
              영양 관심(저염·고단백 등, 최대 3개). 추천(더 보여 주기·순서·배지)에만 쓰며 레시피를 거르지 않습니다.
              영양 관심은 이용자가 직접 고르거나 AI 대화의 저장 제안을 눌렀을 때만 저장합니다.
            </li>
            <li>
              프로필에 식단·알레르기를 저장한 경우(선택, 엄격 조건): 식단(비건·채식·페스코·할랄·글루텐
              프리·락토프리 중 하나), 알레르기 식품, 직접 적은 알레르기 재료 이름. 검색 결과(AI 대화를
              켠 경우 AI 가 만드는 레시피 포함)에서 해당 재료가 든 레시피를 빼는 데 씁니다. 이용자가 직접
              입력하거나 AI 대화의 저장 제안을 눌렀을 때만 저장하며, 설정에서 언제든 고치거나 지울 수
              있습니다. 이 정보는 건강과 관련된 정보일 수 있어 회사는 건강 관련 정보로 다룹니다.{" "}
              <UserCheck>
                식단·알레르기(및 영양 관심)가 민감정보(건강)에 해당해 별도 동의를 받아야 하는지, AI 대화로
                만들 때 OpenAI(미국)로 보내는 데 국외 이전 동의를 따로 받아야 하는지
              </UserCheck>
            </li>
            <li>
              AI 기능 이용 시: 이용자가 입력한 요청 글(AI 레시피 만들기, 레시피 고쳐 만들기), 사진
              인식에 사용한 사진
            </li>
            {LEGAL_LAUNCH_CLAUSES && (
              <>
                <li>AI 대화 이용 시: 이용자가 입력한 질문과 AI 대화 내용</li>
                <li>
                  음성 명령 이용 시: 받아쓴 명령 문장, 명령 처리 결과. 음성은 휴대폰 안에서 글자로
                  바꾸며, 휴대폰 밖으로 보내거나 저장하지 않습니다.
                </li>
              </>
            )}
            {LEGAL_AI_SANCTION_CLAUSES && (
              <li>
                AI 기능 이용 제한·이의 처리 시: 판정 결과, 가린 요청 글 일부(음성 명령은 받아쓴
                글자. 음성은 보관하지 않음), 제한 단계와 기간, 이의 신청 내용과 처리 결과
              </li>
            )}
            {/*
              〔베타 정식 때〕 태국어·이탈리아어 음성을 일반 이용자에게 열 때만 넣는다(출시 범위 아님).
              <li>
                태국어·이탈리아어 음성 명령 이용 시: 음성(글자로 바꾸기 위해 서버를 거쳐 OpenAI 로
                보내며, 바꾼 뒤 바로 폐기하고 저장하지 않음)
              </li>
            */}
          </ul>
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
            <li>
              레시피 관심사·영양 관심, 프로필 식단·알레르기: 이용자가 설정에서 지우거나 바꾸면 바로
              반영하고, 회원 탈퇴 시 바로 삭제합니다.
            </li>
          </ul>
          {LEGAL_LAUNCH_CLAUSES && (
            <ul>
              <li>AI 대화 내용: 마지막 대화 후 30일. 이용자가 대화를 지우면 바로 삭제합니다.</li>
              <li>
                AI 요청 판정 기록: 30일. 연락처·카드번호 등은 가린 상태로 보관합니다. 30일이 지나면
                글 내용을 지우고, 이용자를 알아볼 수 없는 분류·비용 통계만 1년 보관합니다.
              </li>
              <li>받아쓴 음성 명령 문장: 30일. 그 뒤에는 이용자를 알아볼 수 없는 통계만 보관합니다.</li>
              {LEGAL_AI_SANCTION_CLAUSES && (
                <>
                  <li>
                    AI 기능 이용 제한 기록: 마지막 기록 뒤 1년. 가린 요청 글은 제한 단계가 처음으로
                    돌아간 날부터 30일(3차 이상 제한은 이의 신청 기간이 끝날 때까지)
                  </li>
                  <li>
                    이의 신청과 처리 결과: <Pending>3년</Pending>
                  </li>
                </>
              )}
            </ul>
          )}
          {/*
            설계 결정 9 의 '평가 사례 보관'을 쓰기로 하면 넣는다.
            <li>
              서비스 품질을 높이기 위해 고른 일부 사례는 이용자를 알아볼 수 없게 처리하여 보관합니다.
            </li>
          */}
          <p>단, 관계 법령에 의해 보존할 필요가 있는 경우 해당 법령에서 정한 기간 동안 보관합니다.</p>
        </PolicySection>

        <PolicySection id="third-party" title="제4조 (개인정보의 제3자 제공)">
          <p>회사는 이용자의 개인정보를 제3자에게 제공하지 않습니다.</p>
        </PolicySection>

        <PolicySection id="delegation" title="제5조 (개인정보 처리의 위탁)">
          <p>회사는 서비스 제공을 위하여 다음과 같이 개인정보 처리 업무를 위탁합니다.</p>
          <TableWrap>
            <table>
              <thead>
                <tr>
                  <th scope="col">수탁자</th>
                  <th scope="col">위탁 업무</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">
                    OpenAI, L.L.C. <Pending>계약 법인명</Pending>
                  </th>
                  <td>
                    AI 레시피 만들기, 레시피 고쳐 만들기, 사진 속 식재료 인식.
                    {LEGAL_LAUNCH_CLAUSES &&
                      " AI 대화 답변, 받아쓴 음성 명령 문장의 판단, 서비스 목적과 맞지 않는 요청의 판정, 재료 이름 판정."}
                    {/* 〔v3 를 켤 때〕 더함(출시 범위 아님): 영상 레시피 분석 */}
                    {/* 〔베타 정식 때〕 더함: 음성 인식(태국어·이탈리아어) */}
                  </td>
                </tr>
                <tr>
                  <th scope="row">Amazon Web Services, Inc.</th>
                  <td>AI 처리 서버 운영, 이미지 저장, 실행 기록 보관</td>
                </tr>
                <tr>
                  <th scope="row">
                    Render Services, Inc. <Pending>계약 법인명</Pending>
                  </th>
                  <td>앱 서버 운영</td>
                </tr>
                <tr>
                  <th scope="row">
                    Neon, Inc. <Pending>계약 법인명</Pending>
                  </th>
                  <td>데이터베이스 운영</td>
                </tr>
                <tr>
                  <th scope="row">Google LLC</th>
                  <td>
                    푸시 알림 발송(Firebase), 위치의 행정구역 확인(Google Maps), 레시피 번역(Vertex AI),
                    {LEGAL_LAUNCH_CLAUSES && " 영상 레시피 분석(Vertex AI),"} Android 결제 확인(Google
                    Play)
                  </td>
                </tr>
                <tr>
                  <th scope="row">Apple Inc.</th>
                  <td>iOS 결제 확인</td>
                </tr>
                <tr>
                  <th scope="row">RevenueCat, Inc.</th>
                  <td>구독 상태 관리</td>
                </tr>
                <tr>
                  <th scope="row">
                    Resend <Pending>계약 법인명</Pending>
                  </th>
                  <td>인증 메일 발송</td>
                </tr>
                <tr>
                  <th scope="row">Netlify, Inc.</th>
                  <td>웹사이트 운영</td>
                </tr>
              </tbody>
            </table>
          </TableWrap>
          <p>
            회사는 위탁 계약을 맺을 때 위탁 업무 목적 밖의 처리 금지, 안전성 확보 조치, 재위탁 제한
            등을 정하고, 수탁자가 개인정보를 안전하게 처리하는지 감독합니다.{" "}
            <Pending>업체별 데이터 처리 부속서(DPA) 체결 여부</Pending>
          </p>
        </PolicySection>

        <PolicySection id="overseas-transfer" title="제5조의2 (개인정보의 국외 이전)">
          <p>
            회사는 제5조의 위탁 업무를 위하여 아래와 같이 개인정보를 국외로 이전합니다. 이용자가
            해당 기능을 사용할 때 암호화된 통신으로 전송합니다.
          </p>
          <TableWrap>
            <table>
              <thead>
                <tr>
                  <th scope="col">이전받는 자 (연락처)</th>
                  <th scope="col">국가</th>
                  <th scope="col">이전 항목</th>
                  <th scope="col">목적</th>
                  <th scope="col">보유 기간</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">
                    OpenAI, L.L.C. (<Pending>개인정보 문의 연락처</Pending>)
                  </th>
                  <td>미국</td>
                  <td>
                    AI 기능에 입력한 글, 고쳐 만들 레시피 내용, 선택한 경우 냉장고 재료 이름, 사진
                    인식에 쓴 사진, 앱 언어.
                    {LEGAL_LAUNCH_CLAUSES &&
                      " AI 대화 내용, AI 대화로 레시피를 만들 때 프로필의 식단·알레르기, 음성 명령의 받아쓴 글자(음성 자체는 휴대폰 밖으로 보내지 않음), 목록에 없어 새로 저장된 재료 이름과 그 언어·입력 경로(재료 이름 판정)."}
                    {/*
                      〔v3 를 켤 때〕 더함(출시 범위 아님): 영상 레시피로 가져오려는 영상의 주소·설명·자막·화면
                      설명.
                    */}
                    {/*
                      〔베타 정식 때〕 더함: 태국어·이탈리아어 음성 명령의 음성(글자로 바꾼 뒤 바로
                      폐기하며 OpenAI 도 앱 상태로 저장하지 않음)
                    */}{" "}
                    <strong>
                      회원 번호·이메일·전화번호는 보내지 않습니다. 입력한 글 속 연락처·카드번호는
                      가린 뒤 보냅니다.
                    </strong>
                  </td>
                  <td>제5조의 AI 업무</td>
                  <td>
                    OpenAI 는 받은 정보를 AI 학습에 쓰지 않으며, 남용 감시 기록을 최대 30일
                    보관합니다. 회사는 OpenAI 가 요청·응답을 따로 저장하지 않도록 설정합니다.
                  </td>
                </tr>
                <tr>
                  <th scope="row">Render Services, Inc.</th>
                  <td>싱가포르</td>
                  <td>앱 서버가 처리하는 회원·서비스 정보, 접속 기록</td>
                  <td>앱 서버 운영</td>
                  <td>회원 탈퇴 또는 위탁 계약 종료 시까지</td>
                </tr>
                <tr>
                  <th scope="row">Neon, Inc.</th>
                  <td>
                    <Pending>운영 DB 지역</Pending>
                  </td>
                  <td>회원·서비스 정보</td>
                  <td>데이터베이스 운영</td>
                  <td>회원 탈퇴 또는 위탁 계약 종료 시까지</td>
                </tr>
                <tr>
                  <th scope="row">Google LLC</th>
                  <td>미국</td>
                  <td>
                    푸시 토큰과 알림 내용, 반올림한 위치 좌표(약 110m 단위), 번역할 레시피 내용,
                    Android 구매 정보
                    {LEGAL_LAUNCH_CLAUSES && ". 영상 레시피로 가져오려는 영상의 주소·설명·자막·화면 설명"}
                  </td>
                  <td>제5조의 Google 업무</td>
                  <td>
                    처리 목적을 이룰 때까지 <Pending>서비스별 보관 기간</Pending>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Apple Inc.</th>
                  <td>미국</td>
                  <td>iOS 거래 정보</td>
                  <td>결제 확인</td>
                  <td>관계 법령에서 정한 기간</td>
                </tr>
                <tr>
                  <th scope="row">RevenueCat, Inc.</th>
                  <td>미국</td>
                  <td>앱 회원 식별값, 구매·구독 정보</td>
                  <td>구독 관리</td>
                  <td>회원 탈퇴 시까지</td>
                </tr>
                <tr>
                  <th scope="row">
                    Resend <Pending>계약 법인명</Pending>
                  </th>
                  <td>미국</td>
                  <td>이메일 주소, 인증 메일 내용</td>
                  <td>인증 메일 발송</td>
                  <td>
                    <Pending>업체 보관 기간</Pending>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Netlify, Inc.</th>
                  <td>미국</td>
                  <td>웹 접속 기록</td>
                  <td>웹사이트 운영</td>
                  <td>
                    <Pending>업체 보관 기간</Pending>
                  </td>
                </tr>
              </tbody>
            </table>
          </TableWrap>
          <p>
            국외 이전을 원하지 않으면 해당 기능(AI 기능, 음성 명령, 푸시 알림, 위치 설정 등)을 쓰지
            않거나 설정에서 끌 수 있습니다. 이 경우 그 기능만 쓸 수 없고 나머지 서비스는 그대로
            이용할 수 있습니다.
            {LEGAL_LAUNCH_CLAUSES && (
              <>
                {" "}
                재료 이름 판정을 원하지 않으면 제8조의 개인정보 보호책임자에게 요청할 수 있으며, 그
                이용자가 적은 재료 이름은 판정에서 뺍니다.{" "}
                <Pending>제외 처리 구현 — AI 매칭 처리방침 초안 4-3</Pending>
              </>
            )}{" "}
            앱 서버·데이터베이스 운영을 위한 이전은 서비스 제공에 꼭 필요하여, 거부하시면 회원
            서비스를 이용할 수 없습니다.
          </p>
          {/*
            〔베타 정식 때〕 더함: 태국어·이탈리아어 음성 명령을 쓰지 않으면 음성이 국외로 가지
            않습니다. 다른 언어의 음성은 휴대폰 밖으로 나가지 않습니다.
          */}
          <p>
            <Pending>
              AWS(서울 리전 저장)를 국외 이전 표에 넣을지, Google·Apple 로그인을 위탁·이전 표에
              넣을지 — 법무 판단
            </Pending>
          </p>
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
          {LEGAL_LAUNCH_CLAUSES && (
            <ul>
              <li>
                마이크(선택): 음성 명령 버튼을 누르고 있는 동안에만 씁니다. 음성은 휴대폰 안에서
                글자로 바꾸며 휴대폰 밖으로 보내지 않습니다. 허용하지 않아도 다른 기능은 쓸 수
                있습니다.
              </li>
            </ul>
          )}
        </PolicySection>

        <PolicySection id="payments" title="제7조의4 (유료결제 정보 처리)">
          <p>
            유료 서비스 이용 시 결제 정보를 처리합니다. 결제 정보는 전자금융거래법에 따라
            보호되며, 결제 대행사에 최소한의 정보만 제공됩니다.
          </p>
        </PolicySection>

        {LEGAL_AI_SANCTION_CLAUSES && (
          <PolicySection id={automatedDecisionSection.id} title="제7조의5 (자동화된 결정)">
            <p>
              <Pending>
                법무 — 「개인정보 보호법」 제37조의2 &apos;자동화된 결정&apos;에 해당하는지. 해당하면
                기준·절차 공개와 설명·검토 요구 방법이 필요하다
              </Pending>
            </p>
            <p>
              회사는 AI 기능의 금지 행위를 막기 위해 요청 글(음성 명령은 받아쓴 글자)을 자동으로
              판정하고, 그 결과로 AI 기능을 24시간 또는 7일 정지할 수 있습니다. 판정은 요청 글의
              내용으로만 하며, 더 무거운 제한은 담당자가 확인한 뒤에만 합니다. 이용자는 판정에 대한
              설명을 요구하거나 이의를 신청할 수 있습니다(이용약관 제A6조).
            </p>
          </PolicySection>
        )}

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
          <p>
            이 방침은 <Pending>개정 시행일</Pending>부터 시행합니다. 종전 방침은 2026-06-26부터
            시행되었습니다.
          </p>
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

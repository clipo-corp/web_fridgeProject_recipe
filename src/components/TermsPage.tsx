import type { ReactNode } from "react";
import { LEGAL_AI_SANCTION_CLAUSES } from "../lib/legalPublication";
import { Pending } from "./legal/LegalMarks";

// 이용약관은 본문(출시 체크리스트 C1)이 아직 없고, 여기에는 'AI 기능' 장만 있다.
// AI 기능 장은 처리방침의 이용 제한 줄(제2조·제3조 덧붙임, 제7조의5)과 짝이라 같은 스위치
// (LEGAL_AI_SANCTION_CLAUSES)로만 보인다. 꺼져 있으면 결과물에서 빠진다.
// 조 번호(제A1조~제A8조)는 본문이 정해지면 맞춘다. 단계·셈 기간·기한 숫자는
// AI 관문 설계 2-5 와 글자까지 같아야 한다 — 바꿀 때는 2-5 → 정책 파일 → 이 조항 순서로 고치고
// 약관 버전(KEEPCOOK_TERMS_VERSION)을 올린다.

type TermsSection = {
  readonly id: string;
  readonly title: string;
};

const termsSections: readonly TermsSection[] = [
  { id: "ai-features", title: "제A1조 AI 기능" },
  { id: "ai-prohibited", title: "제A2조 AI 기능에서 금지하는 행위" },
  { id: "ai-restriction", title: "제A3조 자동 판정과 단계별 이용 제한" },
  { id: "ai-heavier", title: "제A4조 더 무거운 제한" },
  { id: "ai-notice", title: "제A5조 알림" },
  { id: "ai-appeal", title: "제A6조 이의 신청" },
  { id: "ai-paid", title: "제A7조 유료 서비스와의 관계" },
  { id: "ai-records", title: "제A8조 기록" },
];

const sanctionSteps = [
  { step: "1차", restriction: "안내" },
  { step: "2차", restriction: "경고" },
  { step: "3차", restriction: "AI 기능 24시간 정지" },
  { step: "4차", restriction: "AI 기능 7일 정지" },
  { step: "5차 이후", restriction: "AI 기능 7일 정지, 그리고 제A4조의 더 무거운 제한을 검토" },
];

export function TermsPage(): JSX.Element {
  return (
    <main className="privacy-page">
      <article className="privacy-document" aria-labelledby="terms-title">
        <header className="privacy-hero">
          <p className="privacy-eyebrow">Clipo</p>
          <h1 id="terms-title">이용약관</h1>
          <p className="privacy-lead">
            <Pending>이용약관 본문(총칙·회원·유료 서비스 등) — 출시 체크리스트 C1</Pending>
          </p>
        </header>

        {LEGAL_AI_SANCTION_CLAUSES && (
          <>
            <nav className="privacy-toc" aria-label="이용약관 AI 기능 목차">
              <h2>AI 기능</h2>
              <ol>
                {termsSections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`}>{section.title}</a>
                  </li>
                ))}
              </ol>
            </nav>

            <TermsArticle id="ai-features" title="제A1조 (AI 기능)">
              <p>
                {/* '레시피 AI 대화, 음성 명령' 은 〔출시 때〕 — 이 장 전체가 출시 조항 스위치를 따르므로 그대로 둔다. */}
                ① 회사는 AI 레시피 만들기, 레시피 고쳐 만들기, 사진으로 재료 인식, 레시피 AI 대화, 음성
                명령(이하 &quot;AI 기능&quot;)을 제공합니다.
              </p>
              <p>
                ② AI 기능의 답은 참고용입니다. 알레르기·질환·임신·영유아 식단처럼 건강과 관련된 판단은
                이용자가 직접 확인하거나 전문가와 상의해야 합니다.
              </p>
              <p>
                ③ AI 기능은 요리·재료·레시피에 관한 이용을 위해 제공합니다. 요리와 관계없는 질문에는
                답하지 않고 안내 문구만 보여 드릴 수 있으며, 이것은 이용 제한이 아닙니다.
              </p>
            </TermsArticle>

            <TermsArticle id="ai-prohibited" title="제A2조 (AI 기능에서 금지하는 행위)">
              <p>이용자는 AI 기능을 이용할 때 다음 행위를 해서는 안 됩니다.</p>
              <ol>
                <li>
                  AI 의 지시·규칙·설정을 바꾸거나 무시하게 하려는 입력(다른 글, 번역 요청, 바꿔 쓴 글자
                  속에 숨긴 경우를 포함합니다)
                </li>
                <li>
                  서비스의 AI 지시문·설정·소스 코드, 서버와 데이터베이스의 구조, 데이터를 저장·관리·계산하는
                  방식, 다른 이용자의 정보를 알아내려는 입력(요리 질문처럼 보이게 한 경우를 포함합니다)
                </li>
                <li>
                  사람이나 동물에게 해를 끼치려는 요청(몰래 먹이기, 독, 음식 오염 등), 불법 약물·무기 제조,
                  자해, 성적인 내용에 관한 요청
                </li>
                <li>
                  자동화된 수단으로 AI 기능을 대량으로 부르거나, 같은 내용을 반복해 서비스 운영을 방해하는
                  행위
                </li>
                <li>그 밖에 법령이나 이 약관을 위반하여 AI 기능을 이용하는 행위</li>
              </ol>
            </TermsArticle>

            <TermsArticle id="ai-restriction" title="제A3조 (자동 판정과 단계별 이용 제한)">
              <p>
                ① 회사는 제A2조의 행위를 막기 위해 AI 기능에 들어오는 요청을 자동으로 판정합니다. 판정은
                AI 모델과 미리 정한 규칙으로 하며, 잘못 판정될 수 있습니다. 잘못 판정됐다고 생각하면
                제A6조에 따라 이의를 신청하거나 판정에 대한 설명을 요청할 수 있습니다.
              </p>
              <p>
                ② 제A2조 제1호부터 제3호까지에 해당한다고 판정된 요청은 처리하지 않으며, 다음과 같이
                단계별로 AI 기능 이용을 제한합니다. 10분 안에 이어서 보낸 요청은 한 번으로 셉니다. 다만
                10분 안에 다섯 번 이상이면 두 번으로 셉니다.
              </p>
              <div className="privacy-table-wrap" role="region" tabIndex={0}>
                <table>
                  <thead>
                    <tr>
                      <th scope="col">단계</th>
                      <th scope="col">제한</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sanctionSteps.map((row) => (
                      <tr key={row.step}>
                        <th scope="row">{row.step}</th>
                        <td>{row.restriction}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                ③ 마지막으로 해당한 날부터 30일 동안 새로 해당하는 요청이 없으면 단계는 처음으로
                돌아갑니다.
              </p>
              <p>
                ④ 회사 쪽 오류로 처리되지 않은 요청, 요리와 관계없는 질문, 개인정보가 들어 있어 처리하지
                않은 요청은 단계에 세지 않습니다. 제A2조 제4호의 반복·대량 요청은 단계에 세지 않고 잠시
                처리를 멈출 수 있습니다.
              </p>
              <p>
                ⑤ 3차·4차 정지는 판정의 확신이 높은 요청이 있을 때만 자동으로 합니다. 그렇지 않으면 2차
                경고에 머뭅니다.
              </p>
              <p>
                ⑥ AI 기능 정지 중에도 레시피 보기, 냉장고 관리 등 AI 기능이 아닌 서비스는 그대로 이용할
                수 있습니다. 정지 중에는 AI 질문 수와 물방울이 차감되지 않습니다.
              </p>
            </TermsArticle>

            <TermsArticle id="ai-heavier" title="제A4조 (더 무거운 제한)">
              <p>① 5차 이후에는 회사 담당자가 기록을 직접 확인한 뒤에만 다음 중 하나를 할 수 있습니다.</p>
              <ol>
                <li>AI 기능 30일 정지</li>
                <li>AI 기능 이용의 무기한 정지</li>
                <li>이용계약 해지(탈퇴 처리)</li>
              </ol>
              <p>
                ② 이용계약 해지는 이용자에게 이유를 알리고 14일 동안 의견을 낼 기회를 드린 뒤에
                합니다. <Pending>다른 사람에게 해를 끼칠 급박한 위험이 있을 때의 예외를 둘지</Pending>
              </p>
              <p>③ 자동 판정만으로는 제1항의 제한을 하지 않습니다.</p>
            </TermsArticle>

            <TermsArticle id="ai-notice" title="제A5조 (알림)">
              <p>
                회사는 이용을 제한할 때 그 이유, 기간, 이의 신청 방법을 알립니다. 1차·2차는 해당 화면의
                안내 문구로, 3차 이후는 안내 문구와 가입한 이메일로 알립니다.
                {/* 〔앱 알림함 출시 때〕 더함: 앱 알림함에도 남깁니다. */}
              </p>
            </TermsArticle>

            <TermsArticle id="ai-appeal" title="제A6조 (이의 신청)">
              <p>
                ① 이용자는 이용 제한을 알게 된 날부터 30일 안에 앱의 &apos;문의하기 &gt; AI 제한
                이의&apos; 또는 이메일(<Pending>고객 문의 주소</Pending>)로 이의를 신청할 수 있습니다.
              </p>
              <p>
                ② 회사 담당자가 직접 검토하여, AI 기능이 정지 중이면 72시간 안에, 그 밖에는 7일 안에
                결과를 알립니다. 기한 안에 처리하기 어려우면 그 이유와 예정일을 알립니다.
              </p>
              <p>
                ③ 정지 중에 신청한 이의를 72시간 안에 처리하지 못하면, 결과가 나올 때까지 정지를
                멈춥니다.
              </p>
              <p>
                ④ 이의가 받아들여지면 해당 판정을 무효로 하고 단계를 다시 계산하며, 그 판정 때문에 걸린
                정지는 바로 풉니다.
              </p>
              <p>⑤ 결과에 동의하지 않으면 결과를 받은 날부터 14일 안에 한 번 더 이의를 신청할 수 있습니다.</p>
            </TermsArticle>

            <TermsArticle id="ai-paid" title="제A7조 (유료 서비스와의 관계)">
              <p>
                ① 이용자의 금지 행위로 AI 기능이 정지된 기간에도 구독 기간은 그대로 흐르며, 그 기간에
                대해서는 환불하지 않습니다.{" "}
                <Pending>
                  「전자상거래 등에서의 소비자보호에 관한 법률」과 앱 마켓 환불 정책(앱 결제는 각 마켓
                  정책을 따름)과의 관계
                </Pending>
              </p>
              <p>
                ② 회사의 잘못된 판정으로 AI 기능이 정지된 경우 <Pending>보상 방식 — 결정 25</Pending>을
                드립니다.
              </p>
              <p>③ 정지 중에는 물방울을 쓰는 AI 기능도 이용할 수 없으며, 가지고 있는 물방울은 사라지지 않습니다.</p>
            </TermsArticle>

            <TermsArticle id="ai-records" title="제A8조 (기록)">
              <p>
                ① 회사는 이용 제한과 이의 처리를 위해 판정 기록(판정 결과와, 연락처·카드번호 등을 가린
                요청 글 일부)을 보관합니다. 요청 글은 단계가 처음으로 돌아간 날부터 30일이 지나면
                지웁니다. 다만 3차 이상 제한이 있었으면 이의 신청 기간이 끝날 때까지 보관합니다.
              </p>
              <p>
                ② 이의 신청 내용과 처리 결과는{" "}
                <Pending>
                  3년 — 「전자상거래 등에서의 소비자보호에 관한 법률」의 &apos;소비자 불만 또는 분쟁
                  처리 기록&apos; 보존 기간을 따를지
                </Pending>{" "}
                보관합니다.
              </p>
              <p>
                ③ 자세한 내용은 <a href="/privacy">개인정보 처리방침</a>에 따릅니다.
              </p>
            </TermsArticle>
          </>
        )}
      </article>
    </main>
  );
}

function TermsArticle({
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

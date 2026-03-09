/**
 * ─────────────────────────────────────────────────────────────
 * [js/contact-engine.js] - 픽카(PICK CAR) 실시간 알림 엔진 v2.5
 * ─────────────────────────────────────────────────────────────
 * 본 파일은 상담 신청 데이터의 수집, 저장 및 관리자 알림을 담당합니다.
 * 주요기능: 유효성 검사, Supabase DB 저장, 본사/지점 듀얼 텔레그램 발송
 */

const CONTACT_SYSTEM_CONFIG = {
    FORMSPREE_ENDPOINT: 'https://formspree.io/f/meelygdy', // 폼스프리 백업용
    TG_BOT_TOKEN: '8716905489:AAENMbkYCjMbsA302CTQdN3Cd7AEnzVYoqE', // 통합 봇 토큰
    HQ_CHAT_ID: '8716905489' // 대표님(본사) 채팅방 ID
};

/**
 * 상담 신청 폼 제출 메인 프로세스
 */
async function processConsultationSubmit(event) {
    event.preventDefault(); // 페이지 새로고침 방지
    
    const targetForm = event.target;
    const rawFormData = new FormData(targetForm);
    const submissionData = Object.fromEntries(rawFormData.entries());

    // 1. 필수 입력 항목 유효성 체크 (성함, 연락처)
    if (!submissionData.name || !submissionData.phone) {
        alert("성함과 연락처를 모두 입력해 주셔야 상담 신청이 가능합니다.");
        return;
    }

    // 2. 전송 버튼 상태 제어 (중복 클릭 방지)
    const actionButton = targetForm.querySelector('button[type="submit"]');
    const originalBtnText = actionButton.innerText;
    
    actionButton.disabled = true;
    actionButton.innerText = "상담 데이터를 안전하게 전송 중...";

    try {
        // 3. [데이터 보존] 수파베이스 실시간 DB 저장
        // (common.js에서 생성된 branchInfo 변수를 참조합니다)
        const { error: dbSaveError } = await supabaseClient
            .from('contacts')
            .insert([{
                user_name: submissionData.name,
                user_phone: submissionData.phone,
                car_item: submissionData.car || submissionData.car_name || '차종미정',
                memo: submissionData.message || '추가 내용 없음',
                site_name: branchInfo.title, // 💡 어느 지점의 손님인지 기록
                status: '신규접수'
            }]);

        if (dbSaveError) {
            console.error("DB 저장 실패:", dbSaveError);
            throw new Error("데이터베이스 저장 오류");
        }

        // 4. [이메일 백업] 폼스프리 전송
        await fetch(CONTACT_SYSTEM_CONFIG.FORMSPREE_ENDPOINT, {
            method: 'POST',
            body: rawFormData,
            headers: { 'Accept': 'application/json' }
        });

        // 5. [실시간 푸시] 본사 및 지점 듀얼 텔레그램 전송
        await executeDualTelegramPush(submissionData);
        
        // 6. 완료 처리
        alert(`${branchInfo.title} 상담 신청이 완료되었습니다! 
확인 후 담당 전문가가 빠르게 연락드리겠습니다.`);
        
        targetForm.reset(); // 폼 초기화

    } catch (processError) {
        console.error("전체 프로세스 오류:", processError);
        alert("일시적인 서버 통신 오류가 발생했습니다. 
불편하시겠지만 1588-9097로 직접 전화 주시면 즉시 상담해 드리겠습니다.");
    } finally {
        // 버튼 상태 복구
        actionButton.disabled = false;
        actionButton.innerText = originalBtnText;
    }
}

/**
 * 본사 대표님과 지점 점주님에게 각각 알림을 쏘는 듀얼 푸시 함수
 */
async function executeDualTelegramPush(uData) {
    const telegramApiUrl = `https://api.telegram.org/bot${CONTACT_SYSTEM_CONFIG.TG_BOT_TOKEN}/sendMessage`;
    
    // [메시지 구성] 본사 모니터링용 상세 메시지
    const adminPushText = `
🚨 [PICK CAR 지점 신규 문의 알림]
━━━━━━━━━━━━━━
🏢 접수지점: ${branchInfo.title}
👤 고객성함: ${uData.name}
📞 고객번호: ${uData.phone}
🚘 신청항목: ${uData.car || uData.car_name || '미지정'}
📝 상세내용: ${uData.message || '내용 없음'}
⏰ 접수일시: ${new Date().toLocaleString()}
━━━━━━━━━━━━━━
전체 상담 리스트는 관리자 페이지에서 확인하세요.
    `;

    // 1. [본사 대표님]에게 알림 전송 (무조건 발송)
    await fetch(telegramApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: CONTACT_SYSTEM_CONFIG.HQ_CHAT_ID,
            text: adminPushText
        })
    });

    // 2. [지점 점주님]에게 알림 전송 (점주 ID가 등록되어 있고 본사와 다를 때만)
    const isBranchOwnerRegistered = branchInfo.telegram_id && branchInfo.telegram_id !== CONTACT_SYSTEM_CONFIG.HQ_CHAT_ID;

    if (isBranchOwnerRegistered) {
const branchOwnerMessage = `
🔔 [${branchName}] 신규 고객 상담건 도착!
━━━━━━━━━━━━━━━━━━━━
대표님, 내 지점에서 상담 신청이 접수되었습니다.
신속하게 연락하여 계약을 확정지으세요!

👤 고객성함 : ${customerName}님
📞 연락처   : ${customerPhone}

🚘 문의차량 : ${inquiredCar}
💳 계약방식 : ${contractWay} (렌트/리스/할부)

📝 상담메모 : 
${detailMemo}

━━━━━━━━━━━━━━━━━━━━
"정직한 숫자가 고객의 마음을 움직입니다."
- PICK CAR 전국 통합 시스템 -
`;
        
        await fetch(telegramApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: branchInfo.telegram_id,
                text: ownerPushText
            })
        });
        
        console.log(`지점 점주(${branchInfo.telegram_id})에게 푸시 전송 완료`);
    }
}

// HTML에 선언된 inquiryForm 요소에 상담 프로세스 연결
const mainInquiryForm = document.getElementById('inquiryForm');
if (mainInquiryForm) {
    mainInquiryForm.addEventListener('submit', processConsultationSubmit);
}

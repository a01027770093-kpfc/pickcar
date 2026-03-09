/**
 * PICK CAR 실시간 상담 및 알림 시스템 v1.5
 * 기능: 폼스프리 전송 + 텔레그램 실시간 알림 + 유효성 검사
 */

const CONTACT_CONFIG = {
    FORMSPREE_URL: 'https://formspree.io/f/meelygdy',
    TELEGRAM_TOKEN: 'YOUR_BOT_TOKEN', // 여기에 봇 토큰 입력
    TELEGRAM_CHAT_ID: 'YOUR_CHAT_ID'   // 여기에 본인 챗 ID 입력
};

/**
 * 상담 신청 폼 제출 프로세스
 */
async function submitConsultation(event) {
    event.preventDefault(); // 기본 제출 막기
    
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // [디테일 1] 유효성 검사 (입력 안 하면 전송 안 됨)
    if (!data.name || !data.phone) {
        alert("성함과 연락처는 필수 입력 항목입니다.");
        return;
    }

    // 버튼 로딩 상태 표시
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.disabled = true;
    submitBtn.innerText = "상담 요청 전송 중...";

    try {
        // [디테일 2] 폼스프리(Formspree) 데이터 저장
        const response = await fetch(CONTACT_CONFIG.FORMSPREE_URL, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            // [디테일 3] 텔레그램 실시간 알림 전송 (이게 핵심!)
            await sendTelegramAlert(data);
            
            alert("상담 신청이 완료되었습니다! 담당 카매니저가 곧 연락드리겠습니다.");
            form.reset();
        } else {
            throw new Error("전송 실패");
        }

    } catch (error) {
        console.error("전송 오류:", error);
        alert("일시적인 오류가 발생했습니다. 전화 상담(1588-9097)을 이용해 주세요.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = originalText;
    }
}

/**
 * 텔레그램 알림 전송 함수 (디테일한 메시지 구성)
 */
async function sendTelegramAlert(userData) {
    const message = `
🚗 [픽카(PICK CAR) 신규 견적 문의]
━━━━━━━━━━━━━━
👤 고객명: ${userData.name}
📞 연락처: ${userData.phone}
🚘 희망차종: ${userData.car_name || '미정'}
📝 문의내용: ${userData.message || '내용 없음'}
📅 접수시간: ${new Date().toLocaleString()}
━━━━━━━━━━━━━━
진행 상황을 확인하고 즉시 응대해 주세요!
    `;

    const url = `https://api.telegram.org/bot${CONTACT_CONFIG.TELEGRAM_TOKEN}/sendMessage`;
    
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: CONTACT_CONFIG.TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        })
    });
}

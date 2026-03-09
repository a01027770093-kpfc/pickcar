// [js/common.js] - 픽카 통합 마스터 엔진

// 1. 헤더 스크롤 효과 (기존 기능 유지)
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
});

// 2. 현재 메뉴 활성화 (기존 기능 유지)
document.addEventListener("DOMContentLoaded", function() {
    const currentPath = window.location.pathname.split("/").pop();
    const targetPath = (currentPath === "" || currentPath === "/") ? "index.html" : currentPath;
    const navLinks = document.querySelectorAll('.nav-links a'); // 클래스명 .nav-links로 수정
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href').replace('#', '');
        if (linkPath === targetPath) {
            link.classList.add('active');
        }
    });
});

// 3. 수파베이스 설정 (지점 데이터를 실시간으로 가져옵니다)
const supabaseUrl = 'https://zewgvucgnpswdkghxdyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpld2d2dWNnbnBzd2RrZ2h4ZHl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNzQ4MjMsImV4cCI6MjA4ODY1MDgyM30.WfBS_D3U-8c71Mu3eASp-mF_wuwe5MJp66UJKkPPZio';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// 💡 대표님이 강조하신 차량 8대 데이터 (이미지 포함)
const cars = [
    { name: "더 뉴 그랜저 하이브리드", brand: "현대자동차", price: 450000, cond: "무보증 / 48개월", img: "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?q=80&w=600" },
    { name: "제네시스 GV80", brand: "GENESIS", price: 890000, cond: "선납금 30% / 60개월", img: "https://images.unsplash.com/photo-1629895020190-67292215c2be?q=80&w=600" },
    { name: "쏘렌토 하이브리드", brand: "기아", price: 420000, cond: "무보증 / 60개월", img: "https://images.unsplash.com/photo-1630136602824-060799045864?q=80&w=600" },
    { name: "카니발 하이브리드", brand: "기아", price: 430000, cond: "무보증 / 48개월", img: "https://images.unsplash.com/photo-1590362891991-f776e747a588?q=80&w=600" },
    { name: "더 뉴 아반떼", brand: "현대자동차", price: 280000, cond: "무보증 / 48개월", img: "https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?q=80&w=600" },
    { name: "K8 하이브리드", brand: "기아", price: 410000, cond: "무보증 / 60개월", img: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=600" },
    { name: "팰리세이드", brand: "현대자동차", price: 520000, cond: "선납 30% / 48개월", img: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=600" },
    { name: "스포티지", brand: "기아", price: 350000, cond: "무보증 / 60개월", img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600" }
];

// 전역 변수로 현재 지점 데이터 보관
let branchInfo = { title: 'PICK CAR 본사', phone: '1588-9097', telegram_id: '8716905489' };

// 4. 차량 리스트 렌더링 함수 (8대를 화면에 그려줍니다)
function renderCars() {
    const carGrid = document.getElementById('carGrid');
    if (!carGrid) return; // 그릇이 없으면 실행 안 함
    
    carGrid.innerHTML = cars.map(car => `
        <div class="car-card">
            <div class="car-img-box">
                <div class="car-tag">HOT</div>
                <img src="${car.img}" alt="${car.name}">
            </div>
            <div class="car-detail">
                <div class="car-brand">${car.brand}</div>
                <h3 class="car-name">${car.name}</h3>
                <p class="car-cond">${car.cond}</p>
                <div class="car-price">월 ${car.price.toLocaleString()}<span>원~</span></div>
            </div>
        </div>
    `).join('');
}

// 5. 지점 인식 및 화면 데이터 교체 엔진
async function initBranch() {
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];

    // 주소창에 'wonju' 등이 있을 때만 변신 시도
    if (subdomain !== 'www' && subdomain !== 'pickcar' && subdomain !== 'localhost' && subdomain !== '127') {
        const { data, error } = await supabaseClient.from('sites').select('*').eq('slug', subdomain).single();
        if (data && !error) {
            branchInfo = data;
            applyBranchInfo(data);
        }
    }
    renderCars(); // 차 8대 그리기
}

// 지점 정보를 HTML 요소에 꽂아넣기
function applyBranchInfo(data) {
    document.title = `${data.title} | 픽카 공식 대리점`;
    // 로고 및 번호 변경
    const siteName = document.getElementById('site-name');
    const phoneText = document.getElementById('site-phone-text');
    const phoneBtn = document.getElementById('site-phone-btn');
    
    if(siteName) siteName.innerText = data.title;
    if(phoneText) phoneText.innerText = data.phone;
    if(phoneBtn) phoneBtn.href = "tel:" + data.phone;

    // 💡 대표자 소개란 변경
    const ceoName = document.getElementById('view-ceo-name');
    const ceoIntroName = document.getElementById('view-ceo-name2');
    const ceoMemo = document.getElementById('view-ceo-memo');
    
    if(ceoName) ceoName.innerText = data.ceo_name || '이종현';
    if(ceoIntroName) ceoIntroName.innerText = data.ceo_name || '이종현';
    if(ceoMemo && data.ceo_memo) ceoMemo.innerText = data.ceo_memo;

    // 지점 테마색 적용
    document.documentElement.style.setProperty('--primary', data.theme_color || '#0052CC');
}

// 페이지가 로드되면 엔진 가동!
initBranch();

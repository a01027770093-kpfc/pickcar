// [js/common.js] 파일 내용

// 1. 헤더 스크롤 효과 (스크롤 내리면 헤더에 그림자 생김)
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
});

// 2. 현재 위치한 메뉴 활성화 (내가 '회사소개'에 있으면 메뉴 '회사소개' 글씨가 파란색으로 유지됨)
document.addEventListener("DOMContentLoaded", function() {
    const currentPath = window.location.pathname.split("/").pop();
    // 메인 페이지이거나 경로가 없을 때 예외 처리
    const targetPath = (currentPath === "" || currentPath === "/") ? "index.html" : currentPath;
    
    const navLinks = document.querySelectorAll('.nav a');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === targetPath) {
            link.classList.add('active');
        }
    });
});

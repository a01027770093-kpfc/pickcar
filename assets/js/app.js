// app.js
(function(){
  const DATA = window.PICKCAR_DATA;
  if(!DATA || !DATA.cars) return;

  // ===== HERO SLIDER =====
  const slider = document.querySelector("[data-slider]");
  if(slider){
    const slides = [...slider.querySelectorAll(".hero__slide")];
    const prev = slider.querySelector("[data-prev]");
    const next = slider.querySelector("[data-next]");
    const dotsWrap = slider.querySelector("[data-dots]");
    let idx = 0;

    const renderDots = () => {
      dotsWrap.innerHTML = slides.map((_,i)=>`<button class="dot ${i===idx?'is-active':''}" data-dot="${i}"></button>`).join("");
      dotsWrap.querySelectorAll("[data-dot]").forEach(btn=>{
        btn.addEventListener("click", ()=>{ idx = +btn.dataset.dot; update(); });
      });
    };

    const update = () => {
      slides.forEach((s,i)=>s.classList.toggle("is-active", i===idx));
      renderDots();
    };

    prev && prev.addEventListener("click", ()=>{ idx = (idx-1+slides.length)%slides.length; update(); });
    next && next.addEventListener("click", ()=>{ idx = (idx+1)%slides.length; update(); });

    update();
    setInterval(()=>{ idx = (idx+1)%slides.length; update(); }, 5500);
  }

  // ===== 인기차(홈) =====
  const popularGrid = document.getElementById("popularGrid");
  if(popularGrid){
    const top = DATA.cars.slice(0,8);
    popularGrid.innerHTML = top.map(c=>cardHTML(c)).join("");
  }

  // ===== 홈 빠른견적 → cars.html로 이동 =====
  const goCars = document.getElementById("goCars");
  if(goCars){
    goCars.addEventListener("click", ()=>{
      const q = (document.getElementById("q")?.value || "").trim();
      const params = new URLSearchParams();
      if(q) params.set("q", q);

      // 기본값(요청사항): 렌트/리스, 48/60, 선수금30, 초기0
      const active = (sel)=>document.querySelector(sel)?.dataset || {};
      // 아래는 cars.html에서 다시 선택하게 될 거라 최소만 전달
      window.location.href = `cars.html?${params.toString()}`;
    });
  }

  function cardHTML(c){
    // 기본 월 금액: rent/p3/d30/t60/km1 우선
    const base = c?.prices?.rent?.p3?.d30?.t60?.km1;
    const priceText = (typeof base==="number") ? `월 ${base}만원~` : `월 비용 보기`;
    return `
      <a class="car" href="car.html?id=${encodeURIComponent(c.id)}">
        <div class="car__img"><img src="${c.img}" alt="${c.brand} ${c.model}"></div>
        <div class="car__body">
          <b>${c.brand} ${c.model}</b>
          <small class="muted">${c.trim || ""}</small>
          <div class="price">${priceText}</div>
          <span class="badge">렌트/리스 예상가</span>
        </div>
      </a>
    `;
  }
})();

// assets/js/app.js
(function(){
  const $ = (s, p=document) => p.querySelector(s);
  const $$ = (s, p=document) => [...p.querySelectorAll(s)];

  // Slider
  const slider = document.querySelector("[data-slider]");
  if(slider){
    const slides = $$(".hero__slide", slider);
    const dotsBox = $("[data-dots]", slider);
    let idx = 0, timer = null;

    const makeDots = () => {
      dotsBox.innerHTML = slides.map((_,i)=>`<button class="dot ${i===0?'is-active':''}" data-dot="${i}" aria-label="${i+1}"></button>`).join("");
    };

    const set = (n) => {
      idx = (n + slides.length) % slides.length;
      slides.forEach((el,i)=>el.classList.toggle("is-active", i===idx));
      $$(".dot", dotsBox).forEach((d,i)=>d.classList.toggle("is-active", i===idx));
    };

    const next = () => set(idx+1);
    const prev = () => set(idx-1);

    makeDots();
    $("[data-next]", slider)?.addEventListener("click", next);
    $("[data-prev]", slider)?.addEventListener("click", prev);
    dotsBox.addEventListener("click", (e)=>{
      const b = e.target.closest("[data-dot]");
      if(!b) return;
      set(parseInt(b.dataset.dot,10));
    });

    timer = setInterval(next, 5500);
    slider.addEventListener("mouseenter", ()=>clearInterval(timer));
    slider.addEventListener("mouseleave", ()=>timer=setInterval(next, 5500));
  }

  // Popular cars render (홈)
  const grid = document.getElementById("popularGrid");
  if(grid && window.PICKCAR_DATA){
    const list = window.PICKCAR_DATA.cars.filter(c=>c.popular).slice(0,8);
    grid.innerHTML = list.map(c=>{
      const base = c.trims[0]?.price ?? 0;
      return `
        <a class="car" href="car.html?car=${encodeURIComponent(c.id)}">
          <div class="car__img" data-img="${c.id}"></div>
          <div class="car__body">
            <b>${c.brand} ${c.model}</b>
            <small class="muted">${c.segment} · ${c.fuel} · 기준가 ${fmt(base)}</small>
          </div>
        </a>
      `;
    }).join("");

    // 이미지: 대표님이 원하면 로컬 이미지로 바꿔도 됨
    // 지금은 “플랫폼 느낌용”으로 간단한 배경 그라데이션만 깔아둠
    document.querySelectorAll(".car__img").forEach(el=>{
      el.style.background = "linear-gradient(135deg, rgba(61,18,255,.18), rgba(0,0,0,.06))";
    });
  }

  // Quick estimate -> cars로 조건 전달
  const go = document.getElementById("goCars");
  if(go){
    const state = { type:"rent", term:"60", pay:"30", init:"0" };

    document.addEventListener("click", (e)=>{
      const b1 = e.target.closest("[data-qtype]");
      if(b1){ setSeg(b1, "[data-qtype]"); state.type=b1.dataset.qtype; }
      const b2 = e.target.closest("[data-qterm]");
      if(b2){ setSeg(b2, "[data-qterm]"); state.term=b2.dataset.qterm; }
      const b3 = e.target.closest("[data-qpay]");
      if(b3){ setSeg(b3, "[data-qpay]"); state.pay=b3.dataset.qpay; }
      const b4 = e.target.closest("[data-qinit]");
      if(b4){ setSeg(b4, "[data-qinit]"); state.init=b4.dataset.qinit; }
    });

    go.addEventListener("click", ()=>{
      const q = (document.getElementById("q")?.value || "").trim();
      const url = new URL(location.origin + location.pathname.replace("index.html","") + "cars.html");
      if(q) url.searchParams.set("q", q);
      url.searchParams.set("type", state.type);
      url.searchParams.set("term", state.term);
      url.searchParams.set("pay", state.pay);
      url.searchParams.set("init", state.init);
      location.href = url.toString();
    });
  }

  function setSeg(btn, selector){
    document.querySelectorAll(selector).forEach(x=>x.classList.remove("is-active"));
    btn.classList.add("is-active");
  }
  function fmt(n){
    return (n||0).toLocaleString("ko-KR")+"원";
  }
})();

// ===== 공통 유틸 =====
const fmtWon = (n) => n.toLocaleString("ko-KR") + "원";

// 타입별 기본 이미지(무료/대충)
const TYPE_IMG = {
  "경차·소형": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=60",
  "준중형": "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=60",
  "중형": "https://images.unsplash.com/photo-1519648023493-d82b5f8d7b8a?auto=format&fit=crop&w=1200&q=60",
  "준대형": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=60",
  "대형승용": "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=60",
  "SUV·RV": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=60",
  "화물·승합": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=60",
};

// 잔존율(대략): 기간/차종/브랜드에 따라 “대충”
function residualRate({make, type, term}) {
  // base
  let r = term === 48 ? 0.55 : 0.48;

  if (type === "SUV·RV") r += 0.03;
  if (type === "대형승용") r += 0.02;
  if (type === "준중형") r -= 0.01;

  // 수입 프리미엄 잔존율 약간 상향
  const premium = ["벤츠","BMW","아우디","볼보","렉서스"];
  if (premium.includes(make)) r += 0.02;

  // 전기차 변동성: 보수적으로 약간 하향
  // (대표님이 “대략”이 목적이라 안정적으로)
  // fuel 정보가 없어서 여기선 make/type로만
  return Math.max(0.40, Math.min(0.68, r));
}

// 트림 계수(스탠다드/프리미엄/하이엔드)
function trimFactor(trim){
  if (trim === "프리미엄") return 1.08;
  if (trim === "하이엔드") return 1.17;
  return 1.0;
}

// 상품(렌트/리스) 계수: 렌트는 보험/세금 포함 구조가 많아 약간 상향(대략)
function planFactor(plan){
  if (plan === "리스") return 0.98;
  return 1.02; // 렌트
}

// 이자(대략) 계수: 기간 길수록 약간 상향
function interestFactor(term){
  return term === 48 ? 1.06 : 1.08;
}

// ===== “예상 월 비용” 계산 =====
// msrp: 만원 단위
// 선수금 30%: msrp * 0.30 선납
// 초기비용 0: 선납 0
function estimateMonthly({msrp, make, type, plan, term, pay, trim}) {
  const priceWon = msrp * 10000; // 만원 -> 원
  const r = residualRate({make, type, term});
  const residualWon = priceWon * r;

  const downWon = (pay === "선수금30") ? priceWon * 0.30 : 0;

  // (차량가격 - 선수금 - 잔존가) / 개월수
  const base = (priceWon - downWon - residualWon) / term;

  // 계수 적용
  const monthly = base
    * interestFactor(term)
    * planFactor(plan)
    * trimFactor(trim);

  return Math.round(monthly / 1000) * 1000; // 천원 단위 반올림
}

// 월 대여료 필터는 “예상 월비용(렌트/60/초기0/스탠다드)” 기준으로 분류
function priceBucket(car){
  const v = estimateMonthly({
    msrp: car.msrp,
    make: car.make,
    type: car.type,
    plan: "렌트",
    term: 60,
    pay: "초기0",
    trim: "스탠다드"
  });
  if (v <= 500000) return "50만 원 이하";
  if (v <= 700000) return "50~70만원";
  if (v <= 1000000) return "70~100만원";
  return "100만원 이상";
}

// ===== 페이지 분기 =====
const isIndex = location.pathname.endsWith("index.html") || location.pathname.endsWith("/");
const isCar = location.pathname.endsWith("car.html");

// ===== INDEX: 필터/검색/리스트 =====
if (isIndex){
  const state = {
    make: "전체",
    price: "전체",
    type: "전체",
    fuel: "전체",
    q: ""
  };

  const makes = ["전체", ...Array.from(new Set(CARS.map(c=>c.make)))];
  const types = ["전체", ...Array.from(new Set(CARS.map(c=>c.type)))];
  const fuels = ["전체", ...Array.from(new Set(CARS.map(c=>c.fuel)))];
  const prices = ["전체","50만 원 이하","50~70만원","70~100만원","100만원 이상"];

  const chipsMake = document.getElementById("chipsMake");
  const segPrice = document.getElementById("segPrice");
  const segType = document.getElementById("segType");
  const segFuel = document.getElementById("segFuel");
  const grid = document.getElementById("grid");
  const meta = document.getElementById("resultMeta");
  const q = document.getElementById("q");
  const btnReset = document.getElementById("btnReset");

  function renderChips(){
    chipsMake.innerHTML = "";
    makes.forEach(m=>{
      const b = document.createElement("button");
      b.className = "chip" + (state.make===m ? " is-active":"");
      b.innerHTML = `<span class="chip__logo">${m==="전체" ? "ALL" : m[0]}</span>${m}`;
      b.onclick = ()=>{state.make=m; renderAll();};
      chipsMake.appendChild(b);
    });
  }

  function renderSeg(el, list, key){
    el.innerHTML="";
    list.forEach(v=>{
      const b=document.createElement("button");
      b.className="seg__btn"+(state[key]===v?" is-active":"");
      b.textContent=v;
      b.onclick=()=>{state[key]=v; renderAll();};
      el.appendChild(b);
    });
  }

  function filtered(){
    return CARS.filter(c=>{
      if (state.make!=="전체" && c.make!==state.make) return false;
      if (state.type!=="전체" && c.type!==state.type) return false;
      if (state.fuel!=="전체" && c.fuel!==state.fuel) return false;
      if (state.price!=="전체" && priceBucket(c)!==state.price) return false;

      if (state.q){
        const t = (c.make+" "+c.model).toLowerCase();
        if (!t.includes(state.q.toLowerCase())) return false;
      }
      return true;
    });
  }

  function cardHTML(c){
    const img = TYPE_IMG[c.type] || TYPE_IMG["SUV·RV"];
    const est = estimateMonthly({
      msrp:c.msrp, make:c.make, type:c.type,
      plan:"렌트", term:60, pay:"초기0", trim:"스탠다드"
    });
    const url = `./car.html?make=${encodeURIComponent(c.make)}&model=${encodeURIComponent(c.model)}`;
    return `
      <a class="card" href="${url}">
        <div class="thumb"><img src="${img}" alt="${c.model}"></div>
        <div class="card__body">
          <div class="card__title">${c.model}</div>
          <div class="card__meta">${c.make} · ${c.type} · ${c.fuel}</div>
          <div class="card__price">월 ${fmtWon(est)} ~</div>
          <div class="card__actions">
            <span class="btn btn--primary">견적 보기</span>
            <span class="btn btn--ghost">상담 연결</span>
          </div>
        </div>
      </a>
    `;
  }

  function renderAll(){
    const list = filtered();
    meta.textContent = `검색 결과: ${list.length}대`;
    grid.innerHTML = list.map(cardHTML).join("");

    renderChips();
    renderSeg(segPrice, prices, "price");
    renderSeg(segType, types, "type");
    renderSeg(segFuel, fuels, "fuel");
  }

  q.addEventListener("input", (e)=>{state.q=e.target.value.trim(); renderAll();});
  btnReset.onclick = ()=>{
    state.make="전체"; state.price="전체"; state.type="전체"; state.fuel="전체"; state.q="";
    q.value="";
    renderAll();
  };

  renderAll();
}

// ===== CAR: 조건 선택 + 월비용 =====
if (isCar){
  const params = new URLSearchParams(location.search);
  const make = params.get("make");
  const model = params.get("model");

  const car = CARS.find(c=>c.make===make && c.model===model) || CARS[0];

  const title = document.getElementById("title");
  const sub = document.getElementById("sub");
  const trimSel = document.getElementById("trim");
  const priceEl = document.getElementById("price");
  const bdEl = document.getElementById("breakdown");

  title.textContent = `${car.model} 견적`;
  sub.textContent = `${car.make} · ${car.type} · ${car.fuel} · (기준가 약 ${car.msrp}만원)`;

  // 등급 옵션
  TRIMS.forEach(t=>{
    const op = document.createElement("option");
    op.value=t; op.textContent=t;
    trimSel.appendChild(op);
  });

  // 세그먼트 버튼 생성
  function makeSeg(elId, items, defaultValue){
    const el = document.getElementById(elId);
    el.innerHTML="";
    const st = {v: defaultValue};
    items.forEach(v=>{
      const b=document.createElement("button");
      b.className="seg__btn"+(v===defaultValue?" is-active":"");
      b.textContent=v;
      b.onclick=()=>{
        st.v=v;
        Array.from(el.children).forEach(x=>x.classList.remove("is-active"));
        b.classList.add("is-active");
        update();
      };
      el.appendChild(b);
    });
    return st;
  }

  const stPlan = makeSeg("segPlan", ["렌트","리스"], "렌트");
  const stTerm = makeSeg("segTerm", ["48개월","60개월"], "60개월");
  const stPay  = makeSeg("segPay",  ["선수금 30%","초기비용 0원"], "선수금 30%");

  function update(){
    const plan = stPlan.v;                   // 렌트/리스
    const term = stTerm.v.startsWith("48") ? 48 : 60;
    const pay  = stPay.v.startsWith("선수금") ? "선수금30" : "초기0";
    const trim = trimSel.value;

    const est = estimateMonthly({
      msrp: car.msrp,
      make: car.make,
      type: car.type,
      plan,
      term,
      pay,
      trim
    });

    priceEl.textContent = fmtWon(est);

    const r = residualRate({make:car.make, type:car.type, term});
    const down = (pay==="선수금30") ? Math.round(car.msrp*0.30) : 0;

    bdEl.innerHTML = `
      <div>기준: ${plan} · ${term}개월 · ${pay==="선수금30" ? "선수금 30%" : "초기비용 0원"} · ${trim}</div>
      <div>차량 기준가: 약 ${car.msrp}만원</div>
      <div>선수금(추정): ${down}만원</div>
      <div>잔존율(추정): ${(r*100).toFixed(0)}%</div>
      <div class="tiny muted">※ 실제 금액은 금융사/프로모션/심사 조건에 따라 달라질 수 있습니다.</div>
    `;
  }

  trimSel.onchange = update;
  update();
}

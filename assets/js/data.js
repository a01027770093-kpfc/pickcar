// data.js
// 가격은 "만원" 단위로 통일 (예: 22만 = 22)
// key 규칙: plan(렌트/리스) + term(48/60) + km(1/2) + deposit(30/0) + p(3/5)

window.PICKCAR_DATA = {
  meta: {
    updated: "manual",
    note: "표시금액은 예상입니다. 정확 견적은 상담으로 확정됩니다."
  },
  cars: [
    {
      id: "hyundai-casper-10-smart",
      brand: "현대",
      model: "캐스퍼",
      trim: "1.0 스마트",
      fuel: "가솔린",
      type: "경·소형승용",
      img: "assets/cars/placeholder.jpg",
      // 대표님 제공 예시: 선수금30/3피, 60개월 1만=22, 2만=23
      prices: {
        // 렌트(예시) - 3피, 선수금30
        rent: {
          p3: {
            d30: { t48: { km1: 22, km2: 23 }, t60: { km1: 22, km2: 23 } }
          }
        }
      }
    },
    {
      id: "hyundai-tucson-hev-modern",
      brand: "현대",
      model: "투싼 하이브리드",
      trim: "모던",
      fuel: "하이브리드",
      type: "SUV·RV",
      img: "assets/cars/placeholder.jpg",
      // 대표님 표 기준: 선수금30/3피, 60개월 1만=30, 2만=31
      prices: {
        rent: {
          p3: {
            d30: { t48: { km1: 27, km2: 29 }, t60: { km1: 30, km2: 31 } }
          }
        }
      }
    },
    {
      id: "hyundai-grandeur-hev-premium",
      brand: "현대",
      model: "그랜저 하이브리드",
      trim: "프리미엄",
      fuel: "하이브리드",
      type: "준대형",
      img: "assets/cars/placeholder.jpg",
      prices: {
        rent: {
          p3: {
            d30: { t48: { km1: 34, km2: 36 }, t60: { km1: 37, km2: 38 } }
          }
        }
      }
    },

    // ✅ 여기에 대표님 표를 계속 추가하면 됩니다.
  ]
};

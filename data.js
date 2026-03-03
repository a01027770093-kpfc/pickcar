// 차량 데이터는 "대략 견적"용입니다.
// msrp(만원) 기준으로 잔존율/이자/상품계수로 예상 월 비용을 산출합니다.
const CARS = [
  // 현대
  {make:"현대", model:"아반떼", type:"준중형", fuel:"가솔린", msrp:2300},
  {make:"현대", model:"쏘나타", type:"중형", fuel:"가솔린", msrp:3000},
  {make:"현대", model:"그랜저", type:"준대형", fuel:"가솔린", msrp:3800},
  {make:"현대", model:"아이오닉5", type:"SUV·RV", fuel:"전기", msrp:5200},
  {make:"현대", model:"투싼", type:"SUV·RV", fuel:"가솔린", msrp:3200},
  {make:"현대", model:"싼타페", type:"SUV·RV", fuel:"가솔린", msrp:4000},
  {make:"현대", model:"팰리세이드", type:"SUV·RV", fuel:"가솔린", msrp:4800},
  {make:"현대", model:"스타리아", type:"대형승용", fuel:"디젤", msrp:4100},

  // 기아
  {make:"기아", model:"K3", type:"준중형", fuel:"가솔린", msrp:2200},
  {make:"기아", model:"K5", type:"중형", fuel:"가솔린", msrp:3000},
  {make:"기아", model:"K8", type:"준대형", fuel:"가솔린", msrp:3800},
  {make:"기아", model:"K9", type:"대형승용", fuel:"가솔린", msrp:6000},
  {make:"기아", model:"스포티지", type:"SUV·RV", fuel:"가솔린", msrp:3300},
  {make:"기아", model:"쏘렌토", type:"SUV·RV", fuel:"가솔린", msrp:4200},
  {make:"기아", model:"카니발", type:"대형승용", fuel:"가솔린", msrp:4500},
  {make:"기아", model:"EV6", type:"SUV·RV", fuel:"전기", msrp:5400},

  // 제네시스
  {make:"제네시스", model:"G70", type:"중형", fuel:"가솔린", msrp:4700},
  {make:"제네시스", model:"G80", type:"준대형", fuel:"가솔린", msrp:6500},
  {make:"제네시스", model:"G90", type:"대형승용", fuel:"가솔린", msrp:9500},
  {make:"제네시스", model:"GV70", type:"SUV·RV", fuel:"가솔린", msrp:5500},
  {make:"제네시스", model:"GV80", type:"SUV·RV", fuel:"가솔린", msrp:7800},

  // 쉐보레 / KGM / 르노
  {make:"한국지엠", model:"트레일블레이저", type:"SUV·RV", fuel:"가솔린", msrp:2800},
  {make:"한국지엠", model:"트래버스", type:"SUV·RV", fuel:"가솔린", msrp:5600},
  {make:"KGM", model:"토레스", type:"SUV·RV", fuel:"가솔린", msrp:3200},
  {make:"KGM", model:"렉스턴", type:"SUV·RV", fuel:"디젤", msrp:4800},
  {make:"르노코리아", model:"QM6", type:"SUV·RV", fuel:"가솔린", msrp:3200},
  {make:"르노코리아", model:"SM6", type:"중형", fuel:"가솔린", msrp:2800},

  // 벤츠
  {make:"벤츠", model:"C200", type:"중형", fuel:"가솔린", msrp:6900},
  {make:"벤츠", model:"E200", type:"준대형", fuel:"가솔린", msrp:8600},
  {make:"벤츠", model:"E300", type:"준대형", fuel:"가솔린", msrp:9900},
  {make:"벤츠", model:"GLC220d", type:"SUV·RV", fuel:"디젤", msrp:8500},
  {make:"벤츠", model:"GLE350", type:"SUV·RV", fuel:"가솔린", msrp:12500},

  // BMW
  {make:"BMW", model:"320i", type:"중형", fuel:"가솔린", msrp:6600},
  {make:"BMW", model:"520i", type:"준대형", fuel:"가솔린", msrp:8600},
  {make:"BMW", model:"530i", type:"준대형", fuel:"가솔린", msrp:9900},
  {make:"BMW", model:"X3", type:"SUV·RV", fuel:"가솔린", msrp:8700},
  {make:"BMW", model:"X5", type:"SUV·RV", fuel:"가솔린", msrp:12500},

  // 볼보
  {make:"볼보", model:"S60", type:"중형", fuel:"하이브리드", msrp:6200},
  {make:"볼보", model:"S90", type:"준대형", fuel:"하이브리드", msrp:7800},
  {make:"볼보", model:"XC60", type:"SUV·RV", fuel:"하이브리드", msrp:7400},
  {make:"볼보", model:"XC90", type:"SUV·RV", fuel:"하이브리드", msrp:9800},

  // 아우디
  {make:"아우디", model:"A4", type:"중형", fuel:"가솔린", msrp:6200},
  {make:"아우디", model:"A6", type:"준대형", fuel:"가솔린", msrp:8300},
  {make:"아우디", model:"Q5", type:"SUV·RV", fuel:"가솔린", msrp:7800},
  {make:"아우디", model:"Q7", type:"SUV·RV", fuel:"가솔린", msrp:11500},

  // 폭스바겐
  {make:"폭스바겐", model:"골프", type:"준중형", fuel:"가솔린", msrp:4200},
  {make:"폭스바겐", model:"티구안", type:"SUV·RV", fuel:"가솔린", msrp:5200},

  // 렉서스 / 토요타
  {make:"렉서스", model:"ES300h", type:"준대형", fuel:"하이브리드", msrp:7200},
  {make:"렉서스", model:"RX350h", type:"SUV·RV", fuel:"하이브리드", msrp:9800},
  {make:"토요타", model:"캠리", type:"중형", fuel:"하이브리드", msrp:4700},
  {make:"토요타", model:"RAV4", type:"SUV·RV", fuel:"하이브리드", msrp:5200},

  // 테슬라 / BYD / 폴스타
  {make:"테슬라", model:"Model 3", type:"중형", fuel:"전기", msrp:5500},
  {make:"테슬라", model:"Model Y", type:"SUV·RV", fuel:"전기", msrp:6500},
  {make:"BYD", model:"ATTO 3", type:"SUV·RV", fuel:"전기", msrp:4600},
  {make:"폴스타", model:"Polestar 2", type:"중형", fuel:"전기", msrp:6200},
];

// 트림(등급)은 “디테일 과하게” 말고 3단만 깔아둡니다.
const TRIMS = ["스탠다드", "프리미엄", "하이엔드"];

### READ.md

 1. Tmap API를 사용한 출발,경유,도착지 거리계산 페이지
    - 2020.04.
    - 사용언어 : html, css, javascript, jquery, jsp
    - SK Tmap API 문서 : http://tmapapi.sktelecom.com/main.html
    - SK Tmap API를 활용하여 지도(Map)을 구현하고 사용자가 건물명을 기준으로 검색한 후
    - 목적 : 출장 신청 시 거리비례 유류대 계산을 위함
     출발-경유-도착지를 선택하고 검색조건을 설정하면 자차 경로에 대한 거리(km)결과를 나타내는 페이지
    - jsp, javascript로 구현하였기 때문에 추후 클라이언트단에 API KEY를 숨길 수 있는 방안 필요
      1. JAVA로 구현 시 API관련 동작을 controller단에 구현하여 화면단에서는 controller를 호출하고 결과를 return하는 방식으로 처리
      2. 화면을 react로 구현 시 .env 파일 추가 후 KEY 관리
      

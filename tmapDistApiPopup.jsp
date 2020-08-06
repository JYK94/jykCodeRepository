<%-- **************************************************************** 					 --%>
<%-- 프로그램명 : tmapDistApiPopup.jsp														 --%>
<%-- 설     명	: Tmap API Map호출, 출발-경유-도착지 거리계산									 --%>
<%-- 작성자		: 2020.04.10. 김준영														 --%>
<%-- 비     고	:  tMap.js (TMap API호출, 계산 관련 등 script )								 --%>
<%-- 			  SK Tmap API 문서 : http://tmapapi.sktelecom.com/main.html				 --%>
<%-- 			  거리계산 API 호출은 1일 1000건 제한 (일일 API호출 건수 확인 문의는=>국토연구원)		 --%>
<%--  			  T map javascript V1은 2020.12.31. 종료 => V2로 사용 바람 					 --%>
<%-- *****************************************************************	--%>
<!DOCTYPE html>
<%@ page isELIgnored="false" contentType="text/html; charset=UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ page import="java.util.*"%>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>Tmap 거리계산</title>
<!-- jquery사용 -->
<script src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
<!-- SK Tmap API V2 (추후 API_KEY 값을 숨길수 있는 방안 모색 필요, 1. CONTROLLER단에 구현을 하여 JSP에서 호출한다.)-->
<script src="https://apis.openapi.sk.com/tmap/jsv2?version=1&appKey={API_KEY_VALUE}"></script>
<!-- tMap.js 등록 -->
<script type="text/javascript" src="tMap.js"></script>
<link rel="stylesheet" type="text/css" href="tmap.css" />
<%
	/* Parameter 처리, dt : 검색일자 기준 */
	Date dt;
	String strDt = "";
	/* calcYn - 계산여부 Y or N
				교통편이 '기타'인 경우에만 거리계산
				그 외는 계산하지 않고 출-경-도 주소지만 */
	String calcYn = request.getParameter("calcYn");
	
	if(request.getParameter("dt") != null ) {
		strDt = request.getParameter("dt");
		int year = Integer.parseInt(strDt.substring(0, 4));
		int month = Integer.parseInt(strDt.substring(4, 6)) - 1;
		int day = Integer.parseInt(strDt.substring(6, 8));
		
		Calendar cal = Calendar.getInstance();
		cal.set(year, month, day);
		
		dt = cal.getTime();
	}else {
		dt = new Date();
		Calendar cal = Calendar.getInstance();
		dt = cal.getTime();
	}
%>

<!-- 오늘날짜 설정 -->
<fmt:formatDate value="<%=dt%>" pattern="yyyy" var="thisYear"/>
<fmt:formatDate value="<%=dt%>" pattern="MM" var="thisMonth"/>
<fmt:formatDate value="<%=dt%>" pattern="dd" var="thisDate"/>
<script type="text/javascript">
	var resultArr = new Array();		// return Array 변수
	
	function initTmap(){
		window.focus();
		// 거리계산 여부
		var calcYn = "<%=calcYn%>";
		
		if(calcYn == "N") {
			// 거리계산이 필요하지 않는 경우
			$(".left_distCal").hide();
			$(".i_box03_txt01").hide();
			$("#totDistance").hide();
		}
		
		mapFn_initData();		//  tmap 초기 설정
		
		/* 이벤트 등록 */
		// 2. POI 통합 검색 API 요청
		$("#btn_select").click(
			function() {
				var searchKeyword = $('#searchKeyword').val(); // 검색 키워드
				
				var searchResultHtml = mapFn_searchEvent(searchKeyword);		// tMap.js
				
				$("#searchResult").html(searchResultHtml); //searchResult 결과값 노출
			});
		
		// 3. 경로탐색 API 사용요청
		$("#btn_routeCal").click(
			function() {
				// 출발, 도착이 로드 되어있으면 계산
				if( strMarker.isLoaded() && endMarker.isLoaded() ) {
					var predictionType = $(':radio[name="time_toggle"]:checked').val();
					var year = $("#year").val();
					var month = $("#month").val();
					var day = $("#day").val();
					var hour = $("#hour").val();
					var min = $("#min").val();
					var predictionTime = year + "-" + month + "-" + day
							+ "T" + hour + ":" + min + ":00+0900";
					var searchOption = $("#selectLevel").val();
					
					var totDistance = mapFn_doRouteCal(predictionType, predictionTime, searchOption);		// 총 거리 tMap.js
					
					// 초기화
 					resultArr = getResultArr();		// tMap.js
 					$("#totDistance").val(totDistance);
					
				}else {
					alert("도착점을 지정해주십시오.");
					return;
				}
			});
		
		// 버튼 클릭 시 default 상세보기 이벤트
		$("#btn_krihs").click(
			function() {
				// 230819 = 성결대 poiID value
				poiDetail(230819);			// tMap.js
			});
		
		// 확정(③) 클릭 한 경우
		$('#resultValue').click(
			function() {
				// 계산 여부
				if(calcYn == "Y") {
					if($("#totDistance").val() == null || $("#totDistance").val() == "") {
						alert("지도에서 시작, 도착지점 설정 후 거리계산을 먼저해주세요.");
						return;
					}
					// 총 거리
					resultArr[3] = $("#totDistance").val();
				}else {
					resultArr = getResultArr();		// tMap.js
				}
				
				// 호출한 페이지에 Array Return
				// resultArr = 출발지[0], 도착지[1], 경유지[2], 거리계산[3] 값을 배열에 담음
				window.close();
			});
	}// init function end***********************
	
	function closeWindow() {
		// 호출한 페이지에 Array Return
		// resultArr = 출발지[0], 도착지[1], 경유지[2], 거리계산[3] 값을 배열에 담음
		window.returnValue = resultArr;
	}
</script>

<!-- load 시 initTmap()수행, call Map, event 등록 등, tMap.js -->
<body onload="initTmap();self.focus();window.onblur=function(){window.focus()}" onunload="closeWindow();" style="width:1200px;">
	<div class="t_map_box">
		<div class="content_left">
			<div class="titleDiv">
				<b class="t_map_title">Tmap 거리계산</b>
				<div style="float:right; padding-top:20px;">
					<p id="btn_krihs">성결대학교</p>
					<!-- <img  id="btn_krihs"/> -->
				</div>
				
			</div>
			<!-- 1. 검색조건 -->
			<div class="searchKeywordDiv">
				<p class="title">검색조건</p>
				<input type="text" class="text_custom" id="searchKeyword" name="searchKeyword" value="성결대학교"/>
				<p id="btn_select">1. 검&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;색&nbsp;</p>
			</div>
			
			<!-- 2. 거리계산 -->
			<div class="left_distCal">
				<!-- 거리계산 조건 radio -->
				<input checked id="tt_st" name="time_toggle" type="radio" value="arrival"><label class="time_toggle" for="tt_st">출발시간</label>
				<input id="tt_ed" name="time_toggle" type="radio" value="departure"><label class="time_toggle" for="tt_ed">도착시간</label>
				<!-- 거리계산 조건 일자 -->
				<select id="year">
					<c:forEach var="index" begin="2017" end="2030" >
						<option value="${index}" <c:if test="${index eq thisYear}">selected='SELECTED'</c:if>>
							<c:out value="${index}"/>년
						</option>
					</c:forEach>
				</select>
				<select id="month">
					<c:forEach var="i" begin="1" end="12">
						<option value="<fmt:formatNumber minIntegerDigits="2" value="${i}" />" <c:if test="${i eq thisMonth}">selected='SELECTED'</c:if>>
							<fmt:formatNumber minIntegerDigits="2" value="${i}" />월
						</option>
					</c:forEach>
				</select>
				<select id="day">
					<c:forEach var="i" begin="1" end="31">
						<option value="<fmt:formatNumber minIntegerDigits="2" value="${i}" />" <c:if test="${i eq thisDate}">selected='SELECTED'</c:if>>
							<fmt:formatNumber minIntegerDigits="2" value="${i}" />일
						</option>
					</c:forEach>
				</select>
				
				<select id="hour">
					<c:forEach var="i" begin="0" end="24">
						<option value="<fmt:formatNumber minIntegerDigits="2" value="${i}" />" <c:if test="${i eq 9}">selected='SELECTED'</c:if>>
							<fmt:formatNumber minIntegerDigits="2" value="${i}" />시
						</option>
					</c:forEach>
				</select>
				
				<select id="min">
					<c:forEach var="i" begin="0" end="59">
						<option value="<fmt:formatNumber minIntegerDigits="2" value="${i}" />">
							<fmt:formatNumber minIntegerDigits="2" value="${i}"/>분
						</option>
					</c:forEach>
				</select>
				
				
				<!-- 거리계산 네비게이션 조건 (숨김 처리) -->
				<select id="selectLevel" style="display:none;">
					<option value="00" selected="selected">교통최적+추천</option>
					<option value="01">교통최적+무료우선</option>
					<option value="02">교통최적+최소시간</option>
					<option value="03">교통최적+초보</option>
					<option value="04">교통최적+고속도로우선</option>
					<option value="10">최단거리+유/무료</option>
				</select>
				
				<p id="btn_routeCal">2. 거리계산</p>
			</div>
			
			<!-- 검색결과 -->
			<div class="searchResultDiv">
				<ul class="searchResult" id="searchResult"></ul> 
			</div>
		</div>
		
		<!-- Map Div, tMap.js의 line 33번째 줄에서 new Tmapv2.Map(div id, 파라미터)를 통해 생성하고 있습니다.(API) -->
		<div id="map_div" class="map_wrap"></div>
		
		<!-- 거리계산 결과 -->
		<div class="t_map_txtbox">
			<ul>
				<li>
					<img src='http://tmapapis.sktelecom.com/upload/tmap/marker/pin_r_m_s.png' style='vertical-align:middle;'/>
					출발지 : <span id="result-s">성결대</span>
				</li>
				<li>
					<img src='http://tmapapis.sktelecom.com/upload/tmap/marker/pin_g_m_p.png' style='vertical-align:middle;'/>
					경유지 : <span id="result-p"></span>
				</li>
				<li>
					<img src='http://tmapapis.sktelecom.com/upload/tmap/marker/pin_r_m_e.png' style='vertical-align:middle;'/>
					도착지 : <span id="result-e"></span>
				</li>
			</ul>
		</div>
		
		<div class="input_box03">
			<p class="i_box03_txt01">총 거리(km)</p>
			<input type="number" id="totDistance" readonly/>
			<p id="resultValue">3. 확정</p>
		</div>
	</div>
</body>
</html>
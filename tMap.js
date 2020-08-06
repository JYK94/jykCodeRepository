/*--------------------------------------------------------------------------------------------
  	Filename	: tMap.js
 	Function	: 
 	Comment		: Tmap API 관련 javascript
 	History		: 2020.04.09, 최초작성
 	Version		: 1.0
 	Author		: 김준영 주임
----------------------------------------------------------------------------------------------------*/

/* 전역변수선언 */
var map, marker, marker_s, marker_e, marker_p;
var markerArr = [], labelArr = [];
var appKey = "{API_KEY_VALUE}";
var flag="";															// 출발, 도착 flag값( s:출발, e:도착, p:경유지 )
var strLat, strLng, endLat, endLng, passLat, passLng;					// 출발, 도착 좌표
var strName, strAddress, endName, endAddress, passName, passAddress		// 출발지, 도착지
//경로그림정보
var drawInfoArr = [];
var drawInfoArr2 = [];

var chktraffic = [];
var resultdrawArr = [];
var resultMarkerArr = [];

function mapFn_initData(){
	// 초기 세팅
	strLat = "37.38119704482303";
	strLng = "126.92866966483139";
	strName = "성결대학교";
	strAddress = "경기 안양시 만안구 안양동";
	flag="s";
 	// 1. 지도 띄우기
	map = new Tmapv2.Map("map_div", {
		center: new Tmapv2.LatLng(strLat, strLng),
		width : "70%",
		height : "700px",
		zoom : 18,
		zoomControl : true,
		scrollwheel : true
	});
	
	// 마커 초기화
	strMarker = new Tmapv2.Marker(
			{
				icon : "http://tmapapis.sktelecom.com/upload/tmap/marker/pin_b_m_a.png",
				iconSize : new Tmapv2.Size(24, 38),
				map : map
			});
	
	fn_doMakerMap(strLat, strLng);		// 마커 올리기
	
	// 마커 초기화
	endMarker = new Tmapv2.Marker(
			{
				icon : "http://tmapapis.sktelecom.com/upload/tmap/marker/pin_b_m_a.png",
				iconSize : new Tmapv2.Size(24, 38),
				map : map
			});
	
	// 마커 초기화
	passMarker = new Tmapv2.Marker(
			{
				icon : "http://tmapapis.sktelecom.com/upload/tmap/marker/pin_b_m_a.png",
				iconSize : new Tmapv2.Size(24, 38),
				map : map
			});
	
	/*
	// map 클릭 이벤트 부여
	map
	.addListener(
			"click",
			function onClick(evt) {
				var mapLatLng = evt.latLng;
				// 좌표 읽기
				fn_doMakerMap(mapLatLng._lat, mapLatLng._lng);
			});
	*/
	
}

/* 검색결과 */
function mapFn_searchEvent(searchKeyword){
	
	var innerHtml = ""; // Search Reulsts 결과값 노출 위한 변수
	
	$.ajax({
		method : "GET", // 요청 방식
		url : "https://apis.openapi.sk.com/tmap/pois?version=1&format=json&callback=result", // url 주소
		async : false, // 동기설정
		data : { // 요청 데이터 정보
			"appKey" : appKey, // 발급받은 Appkey
			"searchKeyword" : searchKeyword, // 검색 키워드
			"resCoordType" : "EPSG3857", // 요청 좌표계
			"reqCoordType" : "WGS84GEO", // 응답 좌표계
			"count" : 10 // 가져올 갯수
		},
		success : function(response) {
			var resultpoisData = response.searchPoiInfo.pois.poi;
			// 2. 기존 마커, 팝업 제거
			if (markerArr.length > 0) {
				for(var i in markerArr) {
					markerArr[i].setMap(null);
				}
				markerArr = [];
			}
			
			if (labelArr.length > 0) {
				for (var i in labelArr) {
					labelArr[i].setMap(null);
				}
				labelArr = [];
			}
			
			//맵에 결과물 확인 하기 위한 LatLngBounds객체 생성
			var positionBounds = new Tmapv2.LatLngBounds(); 

			// 3. POI 마커 표시
			for (var k in resultpoisData) {
				// POI 마커 정보 저장
				var noorLat = Number(resultpoisData[k].noorLat);
				var noorLon = Number(resultpoisData[k].noorLon);
				var name = resultpoisData[k].name;
				var address = resultpoisData[k].address;
				
				// POI 정보의 ID
				var id = resultpoisData[k].id;
				// 좌표 객체 생성
				var pointCng = new Tmapv2.Point(
						noorLon, noorLat);
				
				// EPSG3857좌표계를 WGS84GEO좌표계로 변환
				var projectionCng = new Tmapv2.Projection.convertEPSG3857ToWGS84GEO(
						pointCng);

				var lat = projectionCng._lat;
				var lon = projectionCng._lng;

				// 좌표 설정
				var markerPosition = new Tmapv2.LatLng(
						lat, lon);

				// Marker 설정
				marker = new Tmapv2.Marker(
					{
						position : markerPosition, // 마커가 표시될 좌표
						//icon : "http://tmapapis.sktelecom.com/upload/tmap/marker/pin_b_m_a.png",
						icon : "http://tmapapis.sktelecom.com/upload/tmap/marker/pin_b_m_"
								+ k
								+ ".png",		// 아이콘 등록
						iconSize : new Tmapv2.Size(
								24, 38),		// 아이콘 크기 설정
						title : name,			// 마커 타이틀
						map : map				// 마커가 등록될 지도 객체
					});
				console.log(resultpoisData[k]);
				// 결과창에 나타날 검색 결과 html
				innerHtml += "<li><div float='left'><img src='http://tmapapis.sktelecom.com/upload/tmap/marker/pin_b_m_" + k + ".png' style='vertical-align:middle;'/><span> "
						+ "<a href='javascript:poiDetail("+ id + ")'>" + name + "</a>"
//						+ "<a href='javascript:detailTest(" + resultpoisData[k] + ")'>" + name + "</a>"
						+ "</span>"
/* 									+ "    <button type='button' name='sendBtn' onClick='poiDetail("+ id + ");"
							+ "'>상세보기"
							+ "</button>" */
						+ "</div></li>";
				
				// 마커들을 담을 배열에 마커 저장
				markerArr.push(marker);
				positionBounds.extend(markerPosition); // LatLngBounds의 객체 확장
			}
			
			map.panToBounds(positionBounds); // 확장된 bounds의 중심으로 이동시키기
			map.zoomOut();
		},
		error : function(request, status, error) {
			console.log("code:"
					+ request.status + "\n"
					+ "message:"
					+ request.responseText
					+ "\n" + "error:" + error);
		}
	});
	
	return innerHtml;
}

function detailTest(data) {
	// POI 마커 정보 저장
	
	console.log(data);
}

/* 지도에 marker 올리기 (출발,도착) */
function fn_doMakerMap(lat, lng){
	var markerPosition = new Tmapv2.LatLng(lat, lng);
	
	if(flag == "s") {		// 출발 S
		//기존 마커 삭제
		strMarker.setMap(null);
		//마커 올리기
		strMarker = new Tmapv2.Marker(
				{
					position : markerPosition,
					icon : "http://tmapapis.sktelecom.com/upload/tmap/marker/pin_r_m_" + flag + ".png",
					iconSize : new Tmapv2.Size(24, 38),
					map : map
				});
		
		strLat = lat;
		strLng = lng;
	}else if(flag == "e"){		// 도착 E
		//기존 마커 삭제
		endMarker.setMap(null);
		//마커 올리기
		endMarker = new Tmapv2.Marker(
				{
					position : markerPosition,
					icon : "http://tmapapis.sktelecom.com/upload/tmap/marker/pin_r_m_" + flag + ".png",
					iconSize : new Tmapv2.Size(24, 38),
					map : map
				});
		endLat = lat;
		endLng = lng;
	}else {					// 경유 P
		//기존 마커 삭제
		passMarker.setMap(null);
		//마커 올리기
		passMarker = new Tmapv2.Marker(
				{
					position : markerPosition,
					icon : "http://tmapapis.sktelecom.com/upload/tmap/marker/pin_g_m_" + flag + ".png",
					iconSize : new Tmapv2.Size(24, 38),
					map : map
				});
		passLat = lat;
		passLng = lng;
	}
	
	reverseGeo(lat, lng);		// fn, 해당 좌표 input value
}

//click event
// 지도 클릭 시 해당 좌표 읽고 출력
function reverseGeo(lat, lon) {
$
	.ajax({
		method : "GET",
		url : "https://apis.openapi.sk.com/tmap/geo/reversegeocoding?version=1&format=json&callback=result",
		async : false,
		data : {
			"appKey" : appKey,
			"coordType" : "WGS84GEO",
			"addressType" : "A10",
			"lon" : lon,
			"lat" : lat
		},
		success : function(response) {
			// 3. json에서 주소 파싱
			var arrResult = response.addressInfo;

			//법정동 마지막 문자 
			var lastLegal = arrResult.legalDong
					.charAt(arrResult.legalDong.length - 1);

			// 새주소
			newRoadAddr = arrResult.city_do + ' '
					+ arrResult.gu_gun + ' ';

			if (arrResult.eup_myun == ''
					&& (lastLegal == "읍" || lastLegal == "면")) {//읍면
				newRoadAddr += arrResult.legalDong;
			} else {
				newRoadAddr += arrResult.eup_myun;
			}
			newRoadAddr += ' ' + arrResult.roadName + ' '
					+ arrResult.buildingIndex;
			
			// 새주소 법정동& 건물명 체크
			if (arrResult.legalDong != ''
					&& (lastLegal != "읍" && lastLegal != "면")) {//법정동과 읍면이 같은 경우

				if (arrResult.buildingName != '') {//빌딩명 존재하는 경우
					newRoadAddr += (' (' + arrResult.legalDong
							+ ', ' + arrResult.buildingName + ') ');
				} else {
					newRoadAddr += (' (' + arrResult.legalDong + ')');
				}
			} else if (arrResult.buildingName != '') {//빌딩명만 존재하는 경우
				newRoadAddr += (' (' + arrResult.buildingName + ') ');
			}

			// 구주소
			jibunAddr = arrResult.city_do + ' '
					+ arrResult.gu_gun + ' '
					+ arrResult.legalDong + ' ' + arrResult.ri
					+ ' ' + arrResult.bunji;
			//구주소 빌딩명 존재
			if (arrResult.buildingName != '') {//빌딩명만 존재하는 경우
				jibunAddr += (' ' + arrResult.buildingName);
			}

			result = newRoadAddr;
			/*result += "지번주소 : " + jibunAddr + "</br>";*/

			var resultDiv = document.getElementById("result-" + flag);
			// resultDiv.innerHTML = result;
		},
		error : function(request, status, error) {
			console.log("code:" + request.status + "\n"
					+ "message:" + request.responseText + "\n"
					+ "error:" + error);
		}
	});
}// reverseGeo function end *******************

//4. POI 상세 정보 API
function poiDetail(poiId) {
	// 상세정보 popup 초기화
	if (labelArr.length > 0) {
		for (var i in labelArr) {
			labelArr[i].setMap(null);
		}
		labelArr = [];
	}
	
	$.ajax({
		method : "GET", // 요청 방식
		url : "https://apis.openapi.sk.com/tmap/pois/"
				+ poiId // 상세보기를 누른 아이템의 POI ID
				+ "?version=1&resCoordType=EPSG3857&format=json&callback=result&appKey="
				+ appKey, // 발급받은 Appkey
		async : false, // 동기 설정
		success : function(response) {
			// 응답받은 POI 정보
			var detailInfo = response.poiDetailInfo;
			var name = detailInfo.name;
			var address = detailInfo.address;
			
			var noorLat = Number(detailInfo.frontLat);
			var noorLon = Number(detailInfo.frontLon);
			
			var pointCng = new Tmapv2.Point(noorLon, noorLat);
			var projectionCng = new Tmapv2.Projection.convertEPSG3857ToWGS84GEO(
					pointCng);
			
			var lat = projectionCng._lat;
			var lng = projectionCng._lng;
			
			var labelPosition = new Tmapv2.LatLng(lat, lng);
			
			var param;
			param = "\'" + lat + "\',";
			param += "\'" + lng + "\',";
			param += "\'" + name + "\',";
			param += "\'" + address + "\'";
			
			// 상세보기 클릭 시 지도에 표출할 popup창
			var content = "<div class='searchDetailDiv'>"
					+ "<div class='detail_info'>"
					+ "장소 : "
					+ name
					+ "</br>"
					+ "주소 : "
					+ address 
					+ "</br>"
					+ "<div class='btn-s-e'>"
					+ "<p class='btn-str' onclick=\"javascript:mapFn_locationClickEvent(" + "\'s\'," + param + ")\">출발</p>"
					+ "<p class='btn-pass' onclick=\"javascript:mapFn_locationClickEvent(" + "\'p\'," + param + ")\">경유</p>"
					+ "<p class='btn-end' onclick=\"javascript:mapFn_locationClickEvent(" + "\'e\'," + param + ")\">도착</p>"
					+ "</br>"
					+ "</div>"
					+ "</div>" + "</div>";
		
			var labelInfo = new Tmapv2.Label({
				position : labelPosition,
				content : content,
				map : map,
				zIndex : 5000
			});
			//popup 생성
			// map focus
			map.setCenter(labelPosition);
			map.setZoom(19);
			
			// popup들을 담을 배열에 팝업 저장
			labelArr.push(labelInfo);
		},
		error : function(request, status, error) {
			console.log("code:" + request.status + "\n"
					+ "message:" + request.responseText + "\n"
					+ "error:" + error);
		}
	});
}

/* 상세정보pop에서 출발/도착 버튼 클릭 이벤트 */
function mapFn_locationClickEvent(pFlag, pLat, pLng, pName, pAddress){
	// draw 초기화
	if (resultdrawArr.length > 0) {
		for (var i = 0; i < resultdrawArr.length; i++) {
			resultdrawArr[i].setMap(null);
		}
	}
	$("#totDistance").val('');
	
	chktraffic = [];
	drawInfoArr = [];
	resultMarkerArr = [];
	resultdrawArr = [];
	
	console.log(pFlag + ":" + pLat + ":" + pLng + ":" + pName + ":" + pAddress);
	flag = pFlag;					// flagSetting
	fn_doMakerMap(pLat, pLng);		// map에 marker 찍기
	
	if(flag=="s") {
		strName = pName;
		strAddress = pAddress;
	}else if(flag=="e") {
		endName = pName;
		endAddress = pAddress;
	}else {
		passName = pName;
		passAddress = pAddress;
	}
	
	var resultDiv = document.getElementById("result-" + flag);
	resultDiv.innerHTML = pName + "(" + pAddress + ")";
}

function drawLine(arrPoint) {
	var polyline_;

	polyline_ = new Tmapv2.Polyline({
		path : arrPoint,
		strokeColor : "#DD0000",
		strokeWeight : 6,
		map : map
	});
	resultdrawArr.push(polyline_);
}

/* 교통 경로 draw, 계산
 * return number;		// 소수점 1자리까지 총 거리
*/
function mapFn_doRouteCal(predictionType, predictionTime, searchOption) {
	var totalDistance;
	//기존 맵에 있던 정보들 초기화
	resettingMap();
	
	var headers = {};
	headers["appKey"] = appKey;
	headers["Content-Type"] = "application/json";

	var urlStr = "https://apis.openapi.sk.com/tmap/routes/prediction?version=1&reqCoordType=WGS84GEO&resCoordType=EPSG3857&format=json";

	// 출발
	var departureJson = new Object();
	departureJson.name = strName;
	departureJson.lon = strLng;
	departureJson.lat = strLat;
	// 도착
	var destinationJson = new Object();
	destinationJson.name = endName;
	destinationJson.lon = endLng;
	destinationJson.lat = endLat;
	var wayPointJson = new Object();
	if(passName != null){
		wayPointJson = new Object();
		wayPointJson.wayPoint = [{lon : passLng, lat : passLat}];
	}else {
		wayPointJson = null;
	}
	
	// master
	var strJson = new Object();
	strJson.routesInfo = new Object();
	strJson.routesInfo.departure = departureJson;
	strJson.routesInfo.destination = destinationJson;
	strJson.routesInfo.predictionType = predictionType;
	strJson.routesInfo.predictionTime = String(predictionTime);
	strJson.routesInfo.wayPoints = wayPointJson;
	strJson.routesInfo.searchOption = String(searchOption);
	
	var params = JSON.stringify(strJson);
	
	/*
	var params = JSON.stringify({
		"routesInfo" : {
			// 출발
			"departure" : {
				"name"	 : strName,
				"lon"	 : strLng,
				"lat"	 : strLat
			},
			// 도착
			"destination" : {
				"name"	 : endName,
				"lon"	 : endLng,
				"lat"	 : endLat
			},
			"predictionType" : predictionType,
			"predictionTime" : String(predictionTime),
			// 경유지
			"wayPoints" : null,
			"searchOption" : String(searchOption)
		}
	});*/
	
	$
			.ajax({
				method : "POST",
				url : urlStr,
				headers : headers,
				async : false,
				data : params,
				success : function(response) {
					var resultData = response.features;
					var resultProperties = resultData[0].properties;
					var innerHtml = "";
					
					totalDistance = (resultProperties.totalDistance/1000).toFixed(1);
					var tDistance = "총 거리 : "
							+ (resultProperties.totalDistance/1000).toFixed(1)
							+ "km, ";
					var tTime = "총 시간 : "
							+ (resultProperties.totalTime/60).toFixed(0)
							+ "분, ";
					var tFare = "총 요금 : "
							+ resultProperties.totalFare
							+ "원, ";
					var taxiFare = "예상 택시 요금 : "
							+ resultProperties.taxiFare
							+ "원";
					// result에 값 그리기
					//$("#result").text(tTime);
					
					//기존 그려진 라인 & 마커가 있다면 초기화
					if (resultdrawArr.length > 0) {
						for ( var i in resultdrawArr) {
							resultdrawArr[i]
									.setMap(null);
						}
						resultdrawArr = [];
					}

					if (resultMarkerArr.length > 0) {
						for ( var i in resultMarkerArr) {
							resultMarkerArr[i]
									.setMap(null);
						}
						resultMarkerArr = [];
					}

					//그리기
					//for문 [S]
					for ( var i in resultData) {
						var geometry = resultData[i].geometry;
						var properties = resultData[i].properties;

						drawInfoArr = [];

						if (geometry.type == "LineString") {
							for ( var j in geometry.coordinates) {
								// 경로들의 결과값들을 포인트 객체로 변환 
								var latlng = new Tmapv2.Point(
										geometry.coordinates[j][0],
										geometry.coordinates[j][1]);
								// 포인트 객체를 받아 좌표값으로 변환
								var convertPoint = new Tmapv2.Projection.convertEPSG3857ToWGS84GEO(
										latlng);
								// 포인트객체의 정보로 좌표값 변환 객체로 저장
								var convertChange = new Tmapv2.LatLng(
										convertPoint._lat,
										convertPoint._lng);
								// 배열에 담기
								drawInfoArr
										.push(convertChange);
							}
							drawLine(drawInfoArr);
						} else {

							var markerImg = "";
							var pType = "";

							if (properties.pointType == "S") { //출발지 마커
								markerImg = "http://tmapapis.sktelecom.com/upload/tmap/marker/pin_r_m_s.png";
								pType = "S";
							} else if (properties.pointType == "E") { //도착지 마커
								markerImg = "http://tmapapis.sktelecom.com/upload/tmap/marker/pin_r_m_e.png";
								pType = "E";
							} else { //각 포인트 마커
								markerImg = "http://tmapapis.sktelecom.com/upload/tmap/marker/pin_g_m_p.png";
								pType = "P"
							}

							// 경로들의 결과값들을 포인트 객체로 변환 
							var latlon = new Tmapv2.Point(
									geometry.coordinates[0],
									geometry.coordinates[1]);
							// 포인트 객체를 받아 좌표값으로 다시 변환
							var convertPoint = new Tmapv2.Projection.convertEPSG3857ToWGS84GEO(
									latlon);

							var routeInfoObj = {
								markerImage : markerImg,
								lng : convertPoint._lng,
								lat : convertPoint._lat,
								pointType : pType
							};

							// Marker 추가
							addMarkers(routeInfoObj);
						}
					}//for문 [E]
				}
			});
	
	return totalDistance;
}

function pad(n, width) {
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1)
			.join('0')
			+ n;
}

function addComma(num) {
	  var regexp = /\B(?=(\d{3})+(?!\d))/g;
	   return num.toString().replace(regexp, ',');
}

//마커 생성하기
function addMarkers(infoObj) {
	var size = new Tmapv2.Size(24, 38);//아이콘 크기 설정합니다.

	if (infoObj.pointType == "P") { //포인트점일때는 아이콘 크기를 줄입니다.
		size = new Tmapv2.Size(8, 8);
	}

	marker_p = new Tmapv2.Marker({
		position : new Tmapv2.LatLng(infoObj.lat, infoObj.lng),
		icon : infoObj.markerImage,
		iconSize : size,
		map : map
	});

	resultMarkerArr.push(marker_p);
}

function addMarkers(infoObj) {
	var size = new Tmapv2.Size(24, 38);//아이콘 크기 설정합니다.

	if (infoObj.pointType == "P") { //포인트점일때는 아이콘 크기를 줄입니다.
		size = new Tmapv2.Size(8, 8);
	}

	marker_p = new Tmapv2.Marker({
		position : new Tmapv2.LatLng(infoObj.lat, infoObj.lng),
		icon : infoObj.markerImage,
		iconSize : size,
		map : map
	});

	resultMarkerArr.push(marker_p);
}


//초기화 기능
function resettingMap() {
	strMarker.setMap(null);
	endMarker.setMap(null);
	passMarker.setMap(null);
	
	if (resultMarkerArr.length > 0) {
		for (var i = 0; i < resultMarkerArr.length; i++) {
			resultMarkerArr[i].setMap(null);
		}
	}
	
	if (resultdrawArr.length > 0) {
		for (var i = 0; i < resultdrawArr.length; i++) {
			resultdrawArr[i].setMap(null);
		}
	}

	chktraffic = [];
	drawInfoArr = [];
	resultMarkerArr = [];
	resultdrawArr = [];
}

function getResultArr(){
	var resultArr = [];
	// 2차원 배열 초기화
	resultArr[0] = [];
	resultArr[1] = [];
	resultArr[2] = [];
	resultArr[3] = "";
	
	resultArr[0][0] = strName;
	resultArr[0][1] = strAddress;
	resultArr[1][0] = endName;
	resultArr[1][1] = endAddress;
	resultArr[2][0] = passName;
	resultArr[2][1] = passAddress;
	
	console.log("strName:" + strName + ", strAddress:" + strAddress
				+ ", endName:" + endName + ", endAddress:" + endAddress
				+ ", passName:" + passName + ", passAddress" + passAddress);
	
//	console.log(resultArr);
	
	return resultArr;
}
import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;

import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.net.URL;
import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.security.cert.X509Certificate;

import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONArray;

import java.util.ArrayList;
import java.util.Date;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class CallRestAPIUtil {

	/* 
	 * path : {API url}/test
	 * desp : API 호출
	 */
	public void callTheAPI() {
		String rslt = "";			// 결과

		try {
			String url = "{API_URL}/test";
			String strParam = "test=1234";		// 파라미터
			// call API
			String jsonData = this.getRestAPIForCallJsonData(url, urlParameters);
			
			// JSONParse에 json데이터를 넣어 파싱한 다음 JSONObject로 변환한다.
			JSONObject jsonObj = new JSONObject(jsonData);
			JSONObject responseObj = jsonObj.getJSONObject("{FIRST_DEPTH_KEY}");
			int returnCode = jsonObj.getInt("{ITEM_KEY}");
//			System.out.println("returnCode = " + returnCode);
//			System.out.println(responseObj);
			if(returnCode != 0) {
				System.out.println("API return fail");
				return;
			}else {
				// SUCCESS, WRITE THE LOGIC
			}
		} catch (Exception e) {
			e.printStackTrace();
		}	
	}

	/*
	 * REST API Response JsonValue to String
	 */
	public String getRestAPIForCallJsonData(String url, String urlParameters) throws Exception{
		URL obj = new URL(url);
		HttpsURLConnection con = (HttpsURLConnection) obj.openConnection();

		//add reuqest header
		con.setRequestMethod("POST");
		con.setConnectTimeout(10000);		//컨텍션타임아웃 10초
		con.setReadTimeout(5000);			//컨텐츠조회 타임아웃 5초
		// Send post request
		con.setDoOutput(true);				//항상 갱신된내용을 가져옴.
		DataOutputStream wr = new DataOutputStream(con.getOutputStream());
		wr.writeBytes(urlParameters);
		wr.flush();
		wr.close();

//		int responseCode = con.getResponseCode();
//		System.out.println("\nSending 'POST' request to URL : " + url);
//		System.out.println("Post parameters : " + urlParameters);
//		System.out.println("Response Code : " + responseCode);

		Charset charset = Charset.forName("UTF-8");
		BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream(),charset));
		String inputLine;
		StringBuffer response = new StringBuffer();

		while ((inputLine = in.readLine()) != null) {
			response.append(inputLine);
		}
		in.close();
		
		return response.toString();
	}
	
	/*
	 * Https url접근 시 인증서 무시(무조건 신뢰함)
	 * Connection 신뢰할 수 없는 사이트 오류문제 우회
	 */
	public void allHostTrust() throws Exception{
		// Create a trust manager that does not validate certificate chains
		TrustManager[] trustAllCerts = new TrustManager[] {new X509TrustManager() {
				public java.security.cert.X509Certificate[] getAcceptedIssuers() {
					return null;
				}
				public void checkClientTrusted(X509Certificate[] certs, String authType) {}
				public void checkServerTrusted(X509Certificate[] certs, String authType) {}
			}
		};
		
		// Install the all-trusting trust manager
		SSLContext sc = SSLContext.getInstance("SSL");
		sc.init(null, trustAllCerts, new java.security.SecureRandom());
		HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
		// Create all-trusting host name verifier
		HostnameVerifier allHostsValid = new HostnameVerifier() {
			public boolean verify(String hostname, SSLSession session) {
				return true;
			}
		};
		
		// Install the all-trusting host verifier
		HttpsURLConnection.setDefaultHostnameVerifier(allHostsValid);
	}

	public static void main(String[] avrg) {
		this.allHostTrust();		// Connection 전 url접근 시 인증서 이슈 무시
		this.callTheAPI();
	}
}
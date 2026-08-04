package com.fashionshop.service.impl;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriUtils;

import com.fashionshop.entity.Order;
import com.fashionshop.service.VnPayService;

@Service
public class VnPayServiceImpl implements VnPayService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    @Value("${vnpay.tmn-code}")
    private String tmnCode;

    @Value("${vnpay.hash-secret}")
    private String hashSecret;

    @Value("${vnpay.pay-url}")
    private String payUrl;

    @Value("${vnpay.return-url}")
    private String returnUrl;

    @Value("${vnpay.version}")
    private String version;

    @Value("${vnpay.command}")
    private String command;

    @Value("${vnpay.currency}")
    private String currency;

    @Value("${vnpay.locale}")
    private String locale;

    @Override
    public String createPaymentUrl(Order order, String clientIp) {
        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", version);
        params.put("vnp_Command", command);
        params.put("vnp_TmnCode", tmnCode);
        params.put("vnp_Amount", order.getTotalAmount().multiply(BigDecimal.valueOf(100)).toBigInteger().toString());
        params.put("vnp_CurrCode", currency);
        params.put("vnp_TxnRef", order.getOrderCode());
        params.put("vnp_OrderInfo", "Thanh toan don hang " + order.getOrderCode());
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", locale);
        params.put("vnp_ReturnUrl", returnUrl);
        params.put("vnp_IpAddr", clientIp != null ? clientIp : "127.0.0.1");
        params.put("vnp_CreateDate", LocalDateTime.now().format(DATE_FORMAT));

        String secureHash = signParams(params);

        StringBuilder query = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (!query.isEmpty()) {
                query.append('&');
            }
            query.append(encode(entry.getKey())).append('=').append(encode(entry.getValue()));
        }
        query.append("&vnp_SecureHash=").append(secureHash);

        return payUrl + "?" + query;
    }

    @Override
    public VnPayCallbackResult verifyCallback(Map<String, String> params) {
        Map<String, String> data = new TreeMap<>(params);
        String receivedHash = data.remove("vnp_SecureHash");
        data.remove("vnp_SecureHashType");

        String computedHash = signParams(data);
        boolean validSignature = computedHash.equalsIgnoreCase(receivedHash);

        String responseCode = data.get("vnp_ResponseCode");
        String orderCode = data.get("vnp_TxnRef");
        boolean success = validSignature && "00".equals(responseCode);

        return new VnPayCallbackResult(validSignature, success, orderCode, responseCode);
    }

    private String signParams(Map<String, String> sortedParams) {
        List<String> parts = new ArrayList<>();
        for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
            if (entry.getValue() != null && !entry.getValue().isEmpty()) {
                parts.add(entry.getKey() + "=" + encode(entry.getValue()));
            }
        }
        String hashData = String.join("&", parts);
        return hmacSha512(hashSecret, hashData);
    }

    private String encode(String value) {
        return UriUtils.encode(value, StandardCharsets.US_ASCII);
    }

    private String hmacSha512(String key, String data) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            hmac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] bytes = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : bytes) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException | InvalidKeyException ex) {
            throw new IllegalStateException("Không thể tạo chữ ký VNPay", ex);
        }
    }
}

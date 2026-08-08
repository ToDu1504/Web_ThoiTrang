package com.fashionshop.service.impl;

import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.fashionshop.entity.Order;
import com.fashionshop.exception.BusinessException;
import com.fashionshop.service.MoMoService;

@Service
public class MoMoServiceImpl implements MoMoService {

    private final RestClient restClient = RestClient.create();

    @Value("${momo.partner-code}")
    private String partnerCode;

    @Value("${momo.access-key}")
    private String accessKey;

    @Value("${momo.secret-key}")
    private String secretKey;

    @Value("${momo.endpoint}")
    private String endpoint;

    @Value("${momo.redirect-url}")
    private String redirectUrl;

    @Value("${momo.ipn-url}")
    private String ipnUrl;

    @Value("${momo.request-type}")
    private String requestType;

    @Override
    public String createPaymentUrl(Order order, String clientIp) {
        if (!org.springframework.util.StringUtils.hasText(partnerCode)
                || !org.springframework.util.StringUtils.hasText(accessKey)
                || !org.springframework.util.StringUtils.hasText(secretKey)) {
            throw new BusinessException(
                    "Chưa cấu hình MoMo (thiếu MOMO_PARTNER_CODE/MOMO_ACCESS_KEY/MOMO_SECRET_KEY) — "
                            + "đăng ký merchant test tại business.momo.vn để lấy credentials sandbox");
        }

        String requestId = UUID.randomUUID().toString();
        String orderId = order.getOrderCode();
        String amount = order.getTotalAmount().setScale(0, RoundingMode.HALF_UP).toBigInteger().toString();
        String orderInfo = "Thanh toan don hang " + orderId;
        String extraData = "";

        String rawSignature = "accessKey=" + accessKey
                + "&amount=" + amount
                + "&extraData=" + extraData
                + "&ipnUrl=" + ipnUrl
                + "&orderId=" + orderId
                + "&orderInfo=" + orderInfo
                + "&partnerCode=" + partnerCode
                + "&redirectUrl=" + redirectUrl
                + "&requestId=" + requestId
                + "&requestType=" + requestType;
        String signature = hmacSha256(secretKey, rawSignature);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("partnerCode", partnerCode);
        body.put("requestId", requestId);
        body.put("amount", Long.parseLong(amount));
        body.put("orderId", orderId);
        body.put("orderInfo", orderInfo);
        body.put("redirectUrl", redirectUrl);
        body.put("ipnUrl", ipnUrl);
        body.put("requestType", requestType);
        body.put("extraData", extraData);
        body.put("lang", "vi");
        body.put("signature", signature);

        Map<String, Object> response;
        try {
            response = restClient.post()
                    .uri(endpoint)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {
                    });
        } catch (Exception ex) {
            throw new BusinessException("Không thể kết nối tới MoMo: " + ex.getMessage());
        }

        Object resultCode = response != null ? response.get("resultCode") : null;
        if (!(resultCode instanceof Number number) || number.intValue() != 0) {
            String message = response != null ? String.valueOf(response.get("message")) : "Không có phản hồi";
            throw new BusinessException("Tạo giao dịch MoMo thất bại: " + message);
        }

        return String.valueOf(response.get("payUrl"));
    }

    @Override
    public MoMoCallbackResult verifyCallback(Map<String, String> params) {
        String receivedSignature = params.get("signature");

        String rawSignature = "accessKey=" + accessKey
                + "&amount=" + params.getOrDefault("amount", "")
                + "&extraData=" + params.getOrDefault("extraData", "")
                + "&message=" + params.getOrDefault("message", "")
                + "&orderId=" + params.getOrDefault("orderId", "")
                + "&orderInfo=" + params.getOrDefault("orderInfo", "")
                + "&orderType=" + params.getOrDefault("orderType", "")
                + "&partnerCode=" + params.getOrDefault("partnerCode", "")
                + "&payType=" + params.getOrDefault("payType", "")
                + "&requestId=" + params.getOrDefault("requestId", "")
                + "&responseTime=" + params.getOrDefault("responseTime", "")
                + "&resultCode=" + params.getOrDefault("resultCode", "")
                + "&transId=" + params.getOrDefault("transId", "");

        String computedSignature = hmacSha256(secretKey, rawSignature);
        boolean validSignature = computedSignature.equalsIgnoreCase(receivedSignature);

        String resultCode = params.get("resultCode");
        String orderId = params.get("orderId");
        boolean success = validSignature && "0".equals(resultCode);

        return new MoMoCallbackResult(validSignature, success, orderId, resultCode);
    }

    private String hmacSha256(String key, String data) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA256");
            hmac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] bytes = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : bytes) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException | InvalidKeyException ex) {
            throw new IllegalStateException("Không thể tạo chữ ký MoMo", ex);
        }
    }
}

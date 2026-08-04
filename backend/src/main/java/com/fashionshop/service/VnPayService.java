package com.fashionshop.service;

import java.util.Map;

import com.fashionshop.entity.Order;

public interface VnPayService {

    String createPaymentUrl(Order order, String clientIp);

    VnPayCallbackResult verifyCallback(Map<String, String> params);

    record VnPayCallbackResult(boolean validSignature, boolean success, String orderCode, String responseCode) {
    }
}

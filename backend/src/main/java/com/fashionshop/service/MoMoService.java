package com.fashionshop.service;

import java.util.Map;

import com.fashionshop.entity.Order;

public interface MoMoService {

    String createPaymentUrl(Order order, String clientIp);

    MoMoCallbackResult verifyCallback(Map<String, String> params);

    record MoMoCallbackResult(boolean validSignature, boolean success, String orderCode, String resultCode) {
    }
}

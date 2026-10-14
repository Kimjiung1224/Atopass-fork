package com.atopy.Skinlog.domain.record.dto.request;

import com.atopy.Skinlog.domain.record.entity.OutdoorActivity;

/** 생활습관. 기록하지 않은 항목은 null. */
public record LifestyleRequest(Boolean alcohol, OutdoorActivity outdoorActivity) {
}

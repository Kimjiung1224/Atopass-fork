package com.atopy.Skinlog.domain.record.dto.response;

import java.time.LocalDateTime;

/** 기록에 연결된 사진 요약. 사진 기능이 구현되면 채워진다. */
public record PhotoSummary(Long photoId, LocalDateTime uploadedAt) {
}

package com.atopy.Atopass.domain.record.dto.response;

import com.atopy.Atopass.domain.record.entity.Photo;
import java.time.LocalDateTime;

/** 사진 업로드 응답. */
public record PhotoUploaded(Long photoId, Long recordId, LocalDateTime uploadedAt) {

	public static PhotoUploaded from(Photo photo) {
		return new PhotoUploaded(photo.getId(), photo.getRecordId(), photo.getCreatedAt());
	}

}

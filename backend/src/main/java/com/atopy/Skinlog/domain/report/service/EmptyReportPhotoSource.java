package com.atopy.Skinlog.domain.report.service;

import java.util.List;
import org.springframework.stereotype.Component;

/** 사진 기능이 구현되기 전까지 쓰는 빈 구현. 사진 기능을 만들 때 이 클래스를 실제 구현으로 바꾼다. */
@Component
class EmptyReportPhotoSource implements ReportPhotoSource {

	@Override
	public List<ReportPhoto> photosOf(Long recordId) {
		return List.of();
	}

}

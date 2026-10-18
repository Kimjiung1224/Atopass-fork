package com.atopy.Atopass.domain.record.entity;

/**
 * 신체 부위. 기록 화면의 마네킹 부위(얼굴~왼다리 하박) 순서로 둔다. 팔·다리는 좌우와 상박·하박으로 나눈다.
 * 팔·다리를 상박·하박으로 나누기 전의 부위(가슴~발)는 예전 기록을 읽기 위해 남겨 둔다.
 */
public enum BodyPart {
	FACE("얼굴"),
	NECK("목"),
	TRUNK("몸"),
	RIGHT_UPPER_ARM("오른팔 상박"),
	RIGHT_FOREARM("오른팔 하박"),
	LEFT_UPPER_ARM("왼팔 상박"),
	LEFT_FOREARM("왼팔 하박"),
	GROIN("사타구니"),
	RIGHT_THIGH("오른다리 상박"),
	RIGHT_LOWER_LEG("오른다리 하박"),
	LEFT_THIGH("왼다리 상박"),
	LEFT_LOWER_LEG("왼다리 하박"),

	// 예전 부위
	CHEST("가슴"),
	BACK("등"),
	ABDOMEN("배"),
	ARM("팔"),
	HAND("손"),
	LEG("다리"),
	FOOT("발");

	private final String label;

	BodyPart(String label) {
		this.label = label;
	}

	/** 사용자에게 보여줄 한글 이름 */
	public String label() {
		return label;
	}
}

package com.atopy.Atopass.domain.record.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Locale;

/**
 * 부위별로 점수(0~10)를 매기는 항목. 지금은 부위의 고통 점수(pain) 하나만 쓴다.
 * 예전에 받던 증상별 점수(가려움·따가움 등)는 나타난 증상({@link SkinSign})으로 옮겼다.
 * JSON 키는 소문자(pain)로 주고받는다.
 */
public enum Symptom {
	@JsonProperty("pain") PAIN("고통");

	private final String label;

	Symptom(String label) {
		this.label = label;
	}

	/** 사용자에게 보여줄 한글 이름 */
	public String label() {
		return label;
	}

	/** API 파라미터(itching 등)로 받은 값을 변환한다. 대소문자는 구분하지 않는다. */
	public static Symptom fromKey(String key) {
		return valueOf(key.trim().toUpperCase(Locale.ROOT));
	}

	public String key() {
		return name().toLowerCase(Locale.ROOT);
	}
}

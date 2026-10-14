package com.atopy.Skinlog.domain.record.entity;

import com.fasterxml.jackson.annotation.JsonProperty;

/** 증상 종류. JSON 키는 소문자(itching 등)로 주고받는다. */
public enum Symptom {
	@JsonProperty("itching") ITCHING,
	@JsonProperty("stinging") STINGING,
	@JsonProperty("redness") REDNESS,
	@JsonProperty("dryness") DRYNESS,
	@JsonProperty("flaking") FLAKING,
	@JsonProperty("swelling") SWELLING,
	@JsonProperty("pain") PAIN;

	/** API 파라미터(itching 등)로 받은 값을 변환한다. 대소문자는 구분하지 않는다. */
	public static Symptom fromKey(String key) {
		return valueOf(key.trim().toUpperCase(java.util.Locale.ROOT));
	}

	public String key() {
		return name().toLowerCase(java.util.Locale.ROOT);
	}
}

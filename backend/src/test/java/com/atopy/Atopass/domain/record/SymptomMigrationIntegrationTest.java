package com.atopy.Atopass.domain.record;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.atopy.Atopass.domain.record.service.SymptomMigration;
import com.atopy.Atopass.support.ApiTestSupport;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.jdbc.core.JdbcTemplate;

/**
 * 증상 목록을 바꾸기 전에 저장된 기록이 새 목록으로 옮겨지는지 확인한다.
 * 서버가 뜰 때 증상 칸이 문자열 칸으로 바뀌므로, 예전 값을 그대로 넣어 볼 수 있다.
 */
class SymptomMigrationIntegrationTest extends ApiTestSupport {

	private static final String AUTH = HttpHeaders.AUTHORIZATION;

	@Autowired
	JdbcTemplate jdbc;
	@Autowired
	SymptomMigration migration;

	@Test
	void 예전_증상별_점수는_부위의_나타난_증상과_고통_점수로_옮긴다() throws Exception {
		String bearer = newMemberBearer();
		long recordId = createRecord(bearer, "2026-09-01");
		long conditionId = conditionIdOf(recordId);
		// 예전 기록: 팔 가려움 4, 붉어짐 6, 따가움 3 (고통 점수 없음)
		jdbc.update("delete from symptom_scores where skin_condition_id = ?", conditionId);
		insertScore(conditionId, "ITCHING", 4);
		insertScore(conditionId, "REDNESS", 6);
		insertScore(conditionId, "STINGING", 3);

		migration.run(null);

		mockMvc.perform(get("/api/v1/records/" + recordId).header(AUTH, bearer))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.skinConditions[0].symptoms.pain").value(6))
			.andExpect(jsonPath("$.data.skinConditions[0].skinSigns.length()").value(2))
			.andExpect(jsonPath("$.data.skinConditions[0].skinSigns[0]").value("ERYTHEMA"))
			.andExpect(jsonPath("$.data.skinConditions[0].skinSigns[1]").value("ITCHING"))
			// 하루의 나타난 증상에도 함께 들어간다.
			.andExpect(jsonPath("$.data.skinSigns.length()").value(2));
		assertThat(jdbc.queryForList("select symptom from symptom_scores where skin_condition_id = ?",
			String.class, conditionId)).containsExactly("PAIN");
	}

	@Test
	void 고통_점수가_이미_있으면_그대로_두고_0점_증상은_옮기지_않는다() throws Exception {
		String bearer = newMemberBearer();
		long recordId = createRecord(bearer, "2026-09-02");
		long conditionId = conditionIdOf(recordId);
		insertScore(conditionId, "DRYNESS", 9);
		insertScore(conditionId, "SWELLING", 0);

		migration.run(null);

		assertThat(jdbc.queryForObject("select score from symptom_scores where skin_condition_id = ?",
			Integer.class, conditionId)).isEqualTo(3);
		assertThat(jdbc.queryForList("select skin_sign from skin_condition_signs where skin_condition_id = ?",
			String.class, conditionId)).containsExactly("XEROSIS");
	}

	@Test
	void 구진과_결절은_부종_구진_하나로_합치고_각질은_지운다() throws Exception {
		String bearer = newMemberBearer();
		long recordId = createRecord(bearer, "2026-09-03");
		long conditionId = conditionIdOf(recordId);
		for (String sign : List.of("PAPULE", "NODULE", "SCALING")) {
			jdbc.update("insert into record_skin_signs (record_id, skin_sign) values (?, ?)", recordId, sign);
			jdbc.update("insert into skin_condition_signs (skin_condition_id, skin_sign) values (?, ?)", conditionId, sign);
		}

		migration.run(null);
		// 두 번 실행해도 결과가 같다.
		migration.run(null);

		assertThat(jdbc.queryForList("select skin_sign from record_skin_signs where record_id = ?",
			String.class, recordId)).containsExactly("EDEMA");
		assertThat(jdbc.queryForList("select skin_sign from skin_condition_signs where skin_condition_id = ?",
			String.class, conditionId)).containsExactly("EDEMA");
	}

	private long createRecord(String bearer, String date) throws Exception {
		Map<String, Object> body = Map.of(
			"recordDate", date,
			"skinConditions", List.of(Map.of("bodyPart", "LEFT_FOREARM", "symptoms", Map.of("pain", 3))));
		String response = mockMvc.perform(withJson(post("/api/v1/records").header(AUTH, bearer), body))
			.andExpect(status().isCreated())
			.andReturn().getResponse().getContentAsString();
		return jsonMapper.readTree(response).get("data").get("recordId").asLong();
	}

	private long conditionIdOf(long recordId) {
		return jdbc.queryForObject("select id from skin_conditions where record_id = ?", Long.class, recordId);
	}

	private void insertScore(long conditionId, String symptom, int score) {
		jdbc.update("insert into symptom_scores (skin_condition_id, symptom, score) values (?, ?, ?)",
			conditionId, symptom, score);
	}

}

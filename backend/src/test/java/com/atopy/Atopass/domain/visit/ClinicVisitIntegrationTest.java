package com.atopy.Atopass.domain.visit;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.atopy.Atopass.support.ApiTestSupport;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;

class ClinicVisitIntegrationTest extends ApiTestSupport {

	private static final String AUTH = HttpHeaders.AUTHORIZATION;
	private static final String URL = "/api/v1/visits";

	@Test
	void 재진_날짜를_저장하고_날짜순으로_준다() throws Exception {
		String bearer = newMemberBearer();
		create(bearer, "2026-11-01");
		create(bearer, "2026-09-15");

		mockMvc.perform(get(URL).header(AUTH, bearer))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.length()").value(2))
			.andExpect(jsonPath("$.data[0].visitDate").value("2026-09-15"))
			.andExpect(jsonPath("$.data[1].visitDate").value("2026-11-01"))
			.andExpect(jsonPath("$.data[0].visitId").isNumber());
	}

	@Test
	void 같은_날짜는_두_번_넣을_수_없다() throws Exception {
		String bearer = newMemberBearer();
		create(bearer, "2026-11-01");

		mockMvc.perform(withJson(post(URL).header(AUTH, bearer), Map.of("visitDate", "2026-11-01")))
			.andExpect(status().isConflict())
			.andExpect(jsonPath("$.error.code").value("VISIT_ALREADY_EXISTS"));
	}

	@Test
	void 날짜가_없으면_400이다() throws Exception {
		mockMvc.perform(withJson(post(URL).header(AUTH, newMemberBearer()), Map.of()))
			.andExpect(status().isBadRequest());
	}

	@Test
	void 지운_날짜는_목록에서_빠진다() throws Exception {
		String bearer = newMemberBearer();
		long visitId = create(bearer, "2026-11-01");

		mockMvc.perform(delete(URL + "/" + visitId).header(AUTH, bearer))
			.andExpect(status().isNoContent());
		mockMvc.perform(get(URL).header(AUTH, bearer))
			.andExpect(jsonPath("$.data.length()").value(0));
	}

	@Test
	void 다른_회원의_재진_날짜는_보이지_않고_지울_수도_없다() throws Exception {
		String owner = newMemberBearer();
		long visitId = create(owner, "2026-11-01");
		String other = newMemberBearer();

		mockMvc.perform(get(URL).header(AUTH, other))
			.andExpect(jsonPath("$.data.length()").value(0));
		mockMvc.perform(delete(URL + "/" + visitId).header(AUTH, other))
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.error.code").value("VISIT_NOT_FOUND"));
	}

	private long create(String bearer, String date) throws Exception {
		String body = mockMvc.perform(withJson(post(URL).header(AUTH, bearer), Map.of("visitDate", date)))
			.andExpect(status().isCreated())
			.andReturn().getResponse().getContentAsString();
		return jsonMapper.readTree(body).path("data").path("visitId").asLong();
	}

}

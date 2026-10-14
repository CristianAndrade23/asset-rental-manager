package dev.cristianandrade.assetrental.asset;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import dev.cristianandrade.assetrental.TestcontainersConfiguration;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class AssetApiIntegrationTest {

	@Autowired
	private MockMvc mvc;

	@Autowired
	private AssetRepository repository;

	@BeforeEach
	void cleanDatabase() {
		repository.deleteAll();
	}

	private long createAsset(String code, String name) throws Exception {
		String body = """
				{"code": "%s", "name": "%s", "category": "Heavy machinery", "dailyRate": 450.00}
				""".formatted(code, name);
		String location = mvc.perform(post("/api/assets").contentType(MediaType.APPLICATION_JSON).content(body))
			.andExpect(status().isCreated())
			.andReturn()
			.getResponse()
			.getHeader("Location");
		return Long.parseLong(location.substring(location.lastIndexOf('/') + 1));
	}

	@Test
	void createsAssetAsAvailableWithNormalizedCode() throws Exception {
		mvc.perform(post("/api/assets").contentType(MediaType.APPLICATION_JSON).content("""
				{"code": " exc-001 ", "name": "Mini excavator", "category": "Heavy machinery", "dailyRate": 450.00}
				"""))
			.andExpect(status().isCreated())
			.andExpect(header().exists("Location"))
			.andExpect(jsonPath("$.code").value("EXC-001"))
			.andExpect(jsonPath("$.status").value("AVAILABLE"));
	}

	@Test
	void rejectsDuplicatedCode() throws Exception {
		createAsset("EXC-001", "Mini excavator");

		mvc.perform(post("/api/assets").contentType(MediaType.APPLICATION_JSON).content("""
				{"code": "exc-001", "name": "Another", "category": "Heavy machinery", "dailyRate": 100}
				"""))
			.andExpect(status().isConflict())
			.andExpect(jsonPath("$.detail").value("Asset code EXC-001 is already in use"));
	}

	@Test
	void returnsValidationErrorsPerField() throws Exception {
		mvc.perform(post("/api/assets").contentType(MediaType.APPLICATION_JSON).content("""
				{"code": "", "name": "Mini excavator", "category": "Heavy machinery", "dailyRate": -1}
				"""))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.errors.code").exists())
			.andExpect(jsonPath("$.errors.dailyRate").exists());
	}

	@Test
	void searchesByStatusAndText() throws Exception {
		createAsset("EXC-001", "Mini excavator");
		long generator = createAsset("GEN-001", "Diesel generator");
		mvc.perform(patch("/api/assets/{id}/status", generator).contentType(MediaType.APPLICATION_JSON)
			.content("""
					{"status": "MAINTENANCE"}
					""")).andExpect(status().isOk());

		mvc.perform(get("/api/assets").param("status", "AVAILABLE"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.totalElements").value(1))
			.andExpect(jsonPath("$.content[0].code").value("EXC-001"));

		mvc.perform(get("/api/assets").param("search", "diesel"))
			.andExpect(jsonPath("$.totalElements").value(1))
			.andExpect(jsonPath("$.content[0].code").value("GEN-001"));
	}

	@Test
	void returnsNotFoundForUnknownAsset() throws Exception {
		mvc.perform(get("/api/assets/{id}", 999_999)).andExpect(status().isNotFound());
	}

	@Test
	void deletesAsset() throws Exception {
		long id = createAsset("EXC-001", "Mini excavator");

		mvc.perform(delete("/api/assets/{id}", id)).andExpect(status().isNoContent());
		mvc.perform(get("/api/assets/{id}", id)).andExpect(status().isNotFound());
	}

}

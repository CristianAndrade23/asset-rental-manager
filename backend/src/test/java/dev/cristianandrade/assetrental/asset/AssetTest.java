package dev.cristianandrade.assetrental.asset;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;

class AssetTest {

	private Asset newAsset() {
		return new Asset("EXC-001", "Mini excavator", "Heavy machinery", null, new BigDecimal("450.00"), null);
	}

	@Test
	void newAssetStartsAvailable() {
		assertThat(newAsset().getStatus()).isEqualTo(AssetStatus.AVAILABLE);
	}

	@Test
	void canMoveAvailableAssetToMaintenanceAndBack() {
		Asset asset = newAsset();

		asset.changeStatus(AssetStatus.MAINTENANCE);
		assertThat(asset.getStatus()).isEqualTo(AssetStatus.MAINTENANCE);

		asset.changeStatus(AssetStatus.AVAILABLE);
		assertThat(asset.getStatus()).isEqualTo(AssetStatus.AVAILABLE);
	}

	@Test
	void cannotRentManually() {
		assertThatThrownBy(() -> newAsset().changeStatus(AssetStatus.RENTED))
			.isInstanceOf(AssetRuleViolationException.class);
	}

	@Test
	void retiredAssetCannotBeReactivated() {
		Asset asset = newAsset();
		asset.changeStatus(AssetStatus.RETIRED);

		assertThatThrownBy(() -> asset.changeStatus(AssetStatus.AVAILABLE))
			.isInstanceOf(AssetRuleViolationException.class);
	}

}

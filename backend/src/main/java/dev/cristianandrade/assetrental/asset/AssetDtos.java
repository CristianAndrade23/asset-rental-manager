package dev.cristianandrade.assetrental.asset;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

public final class AssetDtos {

	private AssetDtos() {
	}

	public record CreateAssetRequest(
			@NotBlank @Size(max = 30) String code,
			@NotBlank @Size(max = 120) String name,
			@NotBlank @Size(max = 60) String category,
			@Size(max = 60) String serialNumber,
			@NotNull @DecimalMin("0.00") @Digits(integer = 10, fraction = 2) BigDecimal dailyRate,
			@PastOrPresent LocalDate acquisitionDate) {
	}

	public record UpdateAssetRequest(
			@NotBlank @Size(max = 120) String name,
			@NotBlank @Size(max = 60) String category,
			@Size(max = 60) String serialNumber,
			@NotNull @DecimalMin("0.00") @Digits(integer = 10, fraction = 2) BigDecimal dailyRate,
			@PastOrPresent LocalDate acquisitionDate) {
	}

	public record ChangeStatusRequest(@NotNull AssetStatus status) {
	}

	public record AssetResponse(
			Long id,
			String code,
			String name,
			String category,
			String serialNumber,
			BigDecimal dailyRate,
			AssetStatus status,
			LocalDate acquisitionDate,
			Instant createdAt,
			Instant updatedAt) {

		static AssetResponse from(Asset asset) {
			return new AssetResponse(asset.getId(), asset.getCode(), asset.getName(), asset.getCategory(),
					asset.getSerialNumber(), asset.getDailyRate(), asset.getStatus(), asset.getAcquisitionDate(),
					asset.getCreatedAt(), asset.getUpdatedAt());
		}
	}

}

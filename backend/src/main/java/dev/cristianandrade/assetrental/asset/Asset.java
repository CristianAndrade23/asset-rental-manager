package dev.cristianandrade.assetrental.asset;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

@Entity
@Table(name = "asset")
public class Asset {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true, length = 30)
	private String code;

	@Column(nullable = false, length = 120)
	private String name;

	@Column(nullable = false, length = 60)
	private String category;

	@Column(name = "serial_number", length = 60)
	private String serialNumber;

	@Column(name = "daily_rate", nullable = false, precision = 12, scale = 2)
	private BigDecimal dailyRate;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private AssetStatus status;

	@Column(name = "acquisition_date")
	private LocalDate acquisitionDate;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	@Version
	private long version;

	protected Asset() {
	}

	public Asset(String code, String name, String category, String serialNumber, BigDecimal dailyRate,
			LocalDate acquisitionDate) {
		this.code = code;
		this.status = AssetStatus.AVAILABLE;
		updateDetails(name, category, serialNumber, dailyRate, acquisitionDate);
	}

	public void updateDetails(String name, String category, String serialNumber, BigDecimal dailyRate,
			LocalDate acquisitionDate) {
		this.name = name;
		this.category = category;
		this.serialNumber = serialNumber;
		this.dailyRate = dailyRate;
		this.acquisitionDate = acquisitionDate;
	}

	/**
	 * Manual status changes are limited to maintenance and retirement; RENTED is
	 * reserved for the rental contract flow.
	 */
	public void changeStatus(AssetStatus target) {
		if (status == target) {
			return;
		}
		if (status == AssetStatus.RENTED) {
			throw new AssetRuleViolationException("A rented asset must be returned before changing its status");
		}
		if (status == AssetStatus.RETIRED) {
			throw new AssetRuleViolationException("A retired asset cannot be reactivated");
		}
		if (target == AssetStatus.RENTED) {
			throw new AssetRuleViolationException("Assets are rented through a rental contract");
		}
		this.status = target;
	}

	public boolean isRented() {
		return status == AssetStatus.RENTED;
	}

	@PrePersist
	void onCreate() {
		createdAt = Instant.now();
		updatedAt = createdAt;
	}

	@PreUpdate
	void onUpdate() {
		updatedAt = Instant.now();
	}

	public Long getId() {
		return id;
	}

	public String getCode() {
		return code;
	}

	public String getName() {
		return name;
	}

	public String getCategory() {
		return category;
	}

	public String getSerialNumber() {
		return serialNumber;
	}

	public BigDecimal getDailyRate() {
		return dailyRate;
	}

	public AssetStatus getStatus() {
		return status;
	}

	public LocalDate getAcquisitionDate() {
		return acquisitionDate;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}

}

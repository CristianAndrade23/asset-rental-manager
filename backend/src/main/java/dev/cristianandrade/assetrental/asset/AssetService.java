package dev.cristianandrade.assetrental.asset;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import dev.cristianandrade.assetrental.asset.AssetDtos.AssetResponse;
import dev.cristianandrade.assetrental.asset.AssetDtos.CreateAssetRequest;
import dev.cristianandrade.assetrental.asset.AssetDtos.UpdateAssetRequest;

@Service
@Transactional(readOnly = true)
public class AssetService {

	private final AssetRepository repository;

	public AssetService(AssetRepository repository) {
		this.repository = repository;
	}

	public Page<AssetResponse> search(AssetStatus status, String search, Pageable pageable) {
		String pattern = StringUtils.hasText(search) ? "%" + escapeLike(search.trim().toLowerCase()) + "%" : "%";
		return repository.search(status, pattern, pageable).map(AssetResponse::from);
	}

	public AssetResponse findById(Long id) {
		return AssetResponse.from(load(id));
	}

	@Transactional
	public AssetResponse create(CreateAssetRequest request) {
		String code = request.code().trim().toUpperCase();
		if (repository.existsByCodeIgnoreCase(code)) {
			throw new AssetRuleViolationException("Asset code %s is already in use".formatted(code));
		}
		Asset asset = new Asset(code, request.name().trim(), request.category().trim(), request.serialNumber(),
				request.dailyRate(), request.acquisitionDate());
		return AssetResponse.from(repository.save(asset));
	}

	@Transactional
	public AssetResponse update(Long id, UpdateAssetRequest request) {
		Asset asset = load(id);
		asset.updateDetails(request.name().trim(), request.category().trim(), request.serialNumber(),
				request.dailyRate(), request.acquisitionDate());
		return AssetResponse.from(asset);
	}

	@Transactional
	public AssetResponse changeStatus(Long id, AssetStatus status) {
		Asset asset = load(id);
		asset.changeStatus(status);
		return AssetResponse.from(asset);
	}

	@Transactional
	public void delete(Long id) {
		Asset asset = load(id);
		if (asset.isRented()) {
			throw new AssetRuleViolationException("A rented asset cannot be deleted");
		}
		repository.delete(asset);
	}

	/** Treats user input literally: '%' and '_' are wildcards in LIKE (PostgreSQL escape char is '\'). */
	private static String escapeLike(String term) {
		return term.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
	}

	private Asset load(Long id) {
		return repository.findById(id).orElseThrow(() -> new AssetNotFoundException(id));
	}

}

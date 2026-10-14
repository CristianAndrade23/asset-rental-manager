package dev.cristianandrade.assetrental.asset;

import java.net.URI;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import dev.cristianandrade.assetrental.asset.AssetDtos.AssetResponse;
import dev.cristianandrade.assetrental.asset.AssetDtos.ChangeStatusRequest;
import dev.cristianandrade.assetrental.asset.AssetDtos.CreateAssetRequest;
import dev.cristianandrade.assetrental.asset.AssetDtos.UpdateAssetRequest;
import dev.cristianandrade.assetrental.shared.PageResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/assets")
public class AssetController {

	private final AssetService service;

	public AssetController(AssetService service) {
		this.service = service;
	}

	@GetMapping
	public PageResponse<AssetResponse> search(@RequestParam(required = false) AssetStatus status,
			@RequestParam(required = false) String search,
			@PageableDefault(size = 20, sort = "code", direction = Sort.Direction.ASC) Pageable pageable) {
		return PageResponse.from(service.search(status, search, pageable));
	}

	@GetMapping("/{id}")
	public AssetResponse findById(@PathVariable Long id) {
		return service.findById(id);
	}

	@PostMapping
	public ResponseEntity<AssetResponse> create(@Valid @RequestBody CreateAssetRequest request) {
		AssetResponse created = service.create(request);
		return ResponseEntity.created(URI.create("/api/assets/" + created.id())).body(created);
	}

	@PutMapping("/{id}")
	public AssetResponse update(@PathVariable Long id, @Valid @RequestBody UpdateAssetRequest request) {
		return service.update(id, request);
	}

	@PatchMapping("/{id}/status")
	public AssetResponse changeStatus(@PathVariable Long id, @Valid @RequestBody ChangeStatusRequest request) {
		return service.changeStatus(id, request.status());
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		service.delete(id);
		return ResponseEntity.noContent().build();
	}

}

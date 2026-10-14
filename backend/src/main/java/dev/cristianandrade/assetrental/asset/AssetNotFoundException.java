package dev.cristianandrade.assetrental.asset;

public class AssetNotFoundException extends RuntimeException {

	public AssetNotFoundException(Long id) {
		super("Asset %d not found".formatted(id));
	}

}

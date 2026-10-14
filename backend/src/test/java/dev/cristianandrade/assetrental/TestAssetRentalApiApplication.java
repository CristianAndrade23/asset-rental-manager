package dev.cristianandrade.assetrental;

import org.springframework.boot.SpringApplication;

public class TestAssetRentalApiApplication {

	public static void main(String[] args) {
		SpringApplication.from(AssetRentalApiApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}

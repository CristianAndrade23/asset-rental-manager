package dev.cristianandrade.assetrental.asset;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AssetRepository extends JpaRepository<Asset, Long> {

	boolean existsByCodeIgnoreCase(String code);

	/**
	 * @param pattern lower-case LIKE pattern, never null ({@code %} matches all);
	 * a null text parameter has no type for PostgreSQL and breaks {@code lower()}.
	 */
	@Query("""
			select a from Asset a
			where (:status is null or a.status = :status)
			  and (lower(a.code) like :pattern
			       or lower(a.name) like :pattern
			       or lower(a.category) like :pattern)
			""")
	Page<Asset> search(@Param("status") AssetStatus status, @Param("pattern") String pattern, Pageable pageable);

}

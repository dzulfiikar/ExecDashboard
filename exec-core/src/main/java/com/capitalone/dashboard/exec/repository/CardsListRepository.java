package com.capitalone.dashboard.exec.repository;

import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.capitalone.dashboard.exec.model.CardsList;

/**
 * Interface CardsListRepository extends MongoRepository<CardsList,
 * ObjectId>
 * 
 *
 */
public interface CardsListRepository extends MongoRepository<CardsList, ObjectId> {

	/**
	 * findByEnabled()
	 * 
	 * @param enabled
	 * @return List<CardsList>
	 */
	List<CardsList> findByEnabled(Boolean enabled);

	/**
	 * findByDefaultMetricsAndEnabled()
	 * 
	 * @param defaultMetrics
	 * @param enabled
	 * @param pageable
	 * @return List<CardsList>
	 */
	List<CardsList> findByDefaultMetricsAndEnabled(Boolean defaultMetrics, Boolean enabled, Pageable pageable);

}

package com.capitalone.dashboard.exec.repository;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.capitalone.dashboard.exec.model.HygieiaArtifactDetails;

/**
 * HygieiaArtifactDetailsRepository interface extends PagingAndSortingRepository
 *
 *
 */
public interface HygieiaArtifactDetailsRepository extends MongoRepository<HygieiaArtifactDetails, ObjectId> {
	/**
	 * 
	 * @param artifactName
	 * @return HygieiaArtifactDetails
	 */
	HygieiaArtifactDetails findByArtifactName(String artifactName);

}

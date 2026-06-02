package com.capitalone.dashboard.exec.repository;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.capitalone.dashboard.exec.model.AppsJobDetails;

public interface AppsJobDetailsRepository extends MongoRepository<AppsJobDetails, ObjectId> {

	AppsJobDetails findByAppId(String appId);

}

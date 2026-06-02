package com.capitalone.dashboard.exec.repository;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.capitalone.dashboard.exec.model.CollectorStatus;
import com.capitalone.dashboard.exec.model.CollectorType;

public interface CollectorStatusRepository extends MongoRepository<CollectorStatus, ObjectId> {

	CollectorStatus findByType(CollectorType type);

}
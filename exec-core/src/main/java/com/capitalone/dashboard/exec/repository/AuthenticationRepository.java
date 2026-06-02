package com.capitalone.dashboard.exec.repository;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.capitalone.dashboard.exec.model.Authentication;

public interface AuthenticationRepository extends MongoRepository<Authentication, ObjectId> {

	Authentication findByEid(String eid);

}

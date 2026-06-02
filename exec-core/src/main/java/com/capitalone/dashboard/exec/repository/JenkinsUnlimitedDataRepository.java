package com.capitalone.dashboard.exec.repository;

import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.capitalone.dashboard.exec.model.JenkinsUnlimitedData;

public interface JenkinsUnlimitedDataRepository extends MongoRepository<JenkinsUnlimitedData, ObjectId> {

	JenkinsUnlimitedData findByAppIdAndBuildJobAndPeriod(String appId, String buildJob, int period);

	List<JenkinsUnlimitedData> findByBuildJob(String buildJob);

}

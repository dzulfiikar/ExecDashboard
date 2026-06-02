package com.capitalone.dashboard.exec.repository;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.capitalone.dashboard.exec.model.MetricDetailResponse;

public interface MetricDetailResponseRepository extends MongoRepository<MetricDetailResponse, ObjectId> {

	MetricDetailResponse findByAppIdAndMetricsName(String appId, String metricsName);

	MetricDetailResponse findByAppId(String appId);

}

package com.capitalone.dashboard.exec.repository;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.capitalone.dashboard.exec.model.TrackPageViews;

/**
 *
 *
 */
public interface TrackPageViewsRepository extends MongoRepository<TrackPageViews, ObjectId> {

	/**
	 * findByView
	 * 
	 * @param view
	 * @return TrackPageViews
	 */
	TrackPageViews findByView(String view);

}

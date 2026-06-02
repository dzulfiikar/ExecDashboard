package com.capitalone.dashboard.executive;

import com.capitalone.dashboard.exec.model.MetricType;
import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class MetricTypeTest {

    @Test
    public void openSourceViolationsRouteResolvesToOpenSourceMetric() {
        assertEquals(MetricType.OPEN_SOURCE_VIOLATIONS, MetricType.fromString("open-source-violations"));
    }
}

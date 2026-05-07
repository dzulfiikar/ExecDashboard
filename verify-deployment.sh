#!/bin/bash
# Hygieia Executive Dashboard - Deployment Verification Script

FAILURES=0

echo "=========================================="
echo "Hygieia Executive Dashboard Status"
echo "=========================================="
echo ""

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "docker-compose not found"
    exit 1
fi

# Check containers
echo "Container Status:"
docker-compose ps
echo ""

# Check UI
echo "Testing UI (http://localhost:4200)..."
UI_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4200)
if [ "$UI_STATUS" = "200" ]; then
    echo "   OK - UI is accessible (HTTP $UI_STATUS)"
else
    echo "   FAIL - UI returned HTTP $UI_STATUS"
    FAILURES=$((FAILURES + 1))
fi
echo ""

# Check API
echo "Testing API (http://localhost:8080/api)..."
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/portfolio)
if [ "$API_STATUS" = "200" ]; then
    echo "   OK - API is accessible (HTTP $API_STATUS)"
elif [ "$API_STATUS" = "404" ] || [ "$API_STATUS" = "401" ]; then
    echo "   WARN - API returned HTTP $API_STATUS (endpoint exists but may need data or auth)"
else
    echo "   FAIL - API returned HTTP $API_STATUS"
    FAILURES=$((FAILURES + 1))
fi
echo ""

# Check MongoDB
echo "Testing MongoDB (localhost:27000)..."
if docker-compose exec -T exec-db mongo --quiet --eval "db.version()" > /dev/null 2>&1; then
    MONGO_VERSION=$(docker-compose exec -T exec-db mongo --quiet --eval "db.version()")
    echo "   OK - MongoDB is accessible (version $MONGO_VERSION)"
else
    echo "   FAIL - MongoDB connection failed"
    FAILURES=$((FAILURES + 1))
fi
echo ""

# Summary
echo "=========================================="
if [ "$FAILURES" -eq 0 ]; then
    echo "Deployment Status: OPERATIONAL"
    echo "=========================================="
    echo ""
    echo "Access Points:"
    echo "  UI:      http://localhost:4200"
    echo "  API:     http://localhost:8080/api"
    echo "  MongoDB: localhost:27000"
else
    echo "Deployment Status: DEGRADED ($FAILURES check(s) failed)"
    echo "=========================================="
    echo ""
    echo "Run 'docker-compose logs' to investigate failures."
    exit 1
fi
echo ""

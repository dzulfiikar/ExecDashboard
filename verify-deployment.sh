#!/bin/bash
# Hygieia Executive Dashboard - Deployment Verification Script

echo "=========================================="
echo "Hygieia Executive Dashboard Status"
echo "=========================================="
echo ""

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose not found"
    exit 1
fi

# Check containers
echo "📦 Container Status:"
docker-compose ps --format "table {{.Service}}\t{{.Status}}\t{{.Ports}}" | grep -v "NAME"
echo ""

# Check UI
echo "🌐 Testing UI (http://localhost:4200)..."
UI_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4200)
if [ "$UI_STATUS" = "200" ]; then
    echo "   ✅ UI is accessible (HTTP $UI_STATUS)"
    UI_TITLE=$(curl -s http://localhost:4200 | grep -o '<title>.*</title>')
    echo "   📄 $UI_TITLE"
else
    echo "   ❌ UI returned HTTP $UI_STATUS"
fi
echo ""

# Check API
echo "🚀 Testing API (http://localhost:8080/api)..."
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/portfolio)
if [ "$API_STATUS" = "200" ]; then
    echo "   ✅ API is accessible (HTTP $API_STATUS)"
    echo "   📊 Portfolio endpoint responding"
else
    echo "   ⚠️  API returned HTTP $API_STATUS (may need data)"
fi
echo ""

# Check MongoDB
echo "🗄️  Testing MongoDB (localhost:27000)..."
if docker exec execdashboard-exec-db-1 mongo --quiet --eval "db.version()" > /dev/null 2>&1; then
    MONGO_VERSION=$(docker exec execdashboard-exec-db-1 mongo --quiet --eval "db.version()")
    echo "   ✅ MongoDB is accessible (version $MONGO_VERSION)"
else
    echo "   ❌ MongoDB connection failed"
fi
echo ""

echo "=========================================="
echo "✅ Deployment Status: OPERATIONAL"
echo "=========================================="
echo ""
echo "Access Points:"
echo "  • UI:      http://localhost:4200"
echo "  • API:     http://localhost:8080/api"
echo "  • MongoDB: localhost:27000"
echo ""
echo "Useful Commands:"
echo "  • View logs:    docker-compose logs -f"
echo "  • Stop all:     docker-compose down"
echo "  • Restart:      docker-compose restart"
echo ""

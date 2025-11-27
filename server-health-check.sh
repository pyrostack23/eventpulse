#!/bin/bash

# EventPulse Server Health Check Script
# Run this on your VPS to check if everything is working correctly

echo "======================================"
echo "  EventPulse Server Health Check"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as ec2-user
if [ "$USER" != "ec2-user" ]; then
    echo -e "${YELLOW}⚠️  Warning: Not running as ec2-user${NC}"
fi

echo "1. Checking System Information..."
echo "   Hostname: $(hostname)"
echo "   IP Address: $(hostname -I | awk '{print $1}')"
echo "   Uptime: $(uptime -p)"
echo ""

echo "2. Checking Disk Space..."
df -h / | tail -1 | awk '{print "   Root: " $5 " used (" $3 " / " $2 ")"}'
echo ""

echo "3. Checking Memory Usage..."
free -h | grep Mem | awk '{print "   Memory: " $3 " / " $2 " used"}'
echo ""

echo "4. Checking Node.js..."
if command -v node &> /dev/null; then
    echo -e "   ${GREEN}✓${NC} Node.js installed: $(node --version)"
else
    echo -e "   ${RED}✗${NC} Node.js not installed"
fi
echo ""

echo "5. Checking npm..."
if command -v npm &> /dev/null; then
    echo -e "   ${GREEN}✓${NC} npm installed: $(npm --version)"
else
    echo -e "   ${RED}✗${NC} npm not installed"
fi
echo ""

echo "6. Checking PM2..."
if command -v pm2 &> /dev/null; then
    echo -e "   ${GREEN}✓${NC} PM2 installed: $(pm2 --version)"
    echo ""
    echo "   PM2 Status:"
    pm2 status
else
    echo -e "   ${RED}✗${NC} PM2 not installed"
fi
echo ""

echo "7. Checking Nginx..."
if command -v nginx &> /dev/null; then
    echo -e "   ${GREEN}✓${NC} Nginx installed: $(nginx -v 2>&1 | cut -d'/' -f2)"
    if systemctl is-active --quiet nginx; then
        echo -e "   ${GREEN}✓${NC} Nginx is running"
    else
        echo -e "   ${RED}✗${NC} Nginx is not running"
    fi
else
    echo -e "   ${RED}✗${NC} Nginx not installed"
fi
echo ""

echo "8. Checking Application Directory..."
if [ -d "/var/www/eventpulse" ]; then
    echo -e "   ${GREEN}✓${NC} Application directory exists"
    echo "   Contents:"
    ls -la /var/www/eventpulse | grep -E "^d" | awk '{print "     - " $9}'
else
    echo -e "   ${RED}✗${NC} Application directory not found"
fi
echo ""

echo "9. Checking Backend..."
if [ -f "/var/www/eventpulse/backend/server.js" ]; then
    echo -e "   ${GREEN}✓${NC} Backend server.js exists"
else
    echo -e "   ${RED}✗${NC} Backend server.js not found"
fi

if [ -f "/var/www/eventpulse/backend/.env" ]; then
    echo -e "   ${GREEN}✓${NC} Backend .env exists"
else
    echo -e "   ${RED}✗${NC} Backend .env not found"
fi

if [ -d "/var/www/eventpulse/backend/node_modules" ]; then
    echo -e "   ${GREEN}✓${NC} Backend node_modules exists"
else
    echo -e "   ${YELLOW}⚠️${NC}  Backend node_modules not found (run npm install)"
fi
echo ""

echo "10. Checking Frontend..."
if [ -d "/var/www/eventpulse/frontend/build" ]; then
    echo -e "   ${GREEN}✓${NC} Frontend build directory exists"
    if [ -f "/var/www/eventpulse/frontend/build/index.html" ]; then
        echo -e "   ${GREEN}✓${NC} Frontend index.html exists"
    else
        echo -e "   ${RED}✗${NC} Frontend index.html not found"
    fi
else
    echo -e "   ${RED}✗${NC} Frontend build directory not found"
fi
echo ""

echo "11. Checking Ports..."
if netstat -tuln | grep -q ":80 "; then
    echo -e "   ${GREEN}✓${NC} Port 80 (HTTP) is listening"
else
    echo -e "   ${RED}✗${NC} Port 80 (HTTP) is not listening"
fi

if netstat -tuln | grep -q ":5000 "; then
    echo -e "   ${GREEN}✓${NC} Port 5000 (Backend) is listening"
else
    echo -e "   ${RED}✗${NC} Port 5000 (Backend) is not listening"
fi
echo ""

echo "12. Testing Backend API..."
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo -e "   ${GREEN}✓${NC} Backend API is responding"
    echo "   Response:"
    curl -s http://localhost:5000/api/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:5000/api/health
else
    echo -e "   ${RED}✗${NC} Backend API is not responding"
fi
echo ""

echo "13. Testing External Access..."
if curl -s http://royalcollage.duckdns.org/api/health > /dev/null 2>&1; then
    echo -e "   ${GREEN}✓${NC} External API access working"
else
    echo -e "   ${YELLOW}⚠️${NC}  External API access failed (check Nginx/firewall)"
fi
echo ""

echo "14. Checking Logs..."
if [ -d "/var/www/eventpulse/logs" ]; then
    echo -e "   ${GREEN}✓${NC} Logs directory exists"
    echo "   Recent errors (last 5):"
    if [ -f "/var/www/eventpulse/logs/error.log" ]; then
        tail -5 /var/www/eventpulse/logs/error.log 2>/dev/null || echo "     No errors found"
    else
        echo "     Error log not found"
    fi
else
    echo -e "   ${RED}✗${NC} Logs directory not found"
fi
echo ""

echo "15. Checking Firewall..."
if command -v firewall-cmd &> /dev/null; then
    if systemctl is-active --quiet firewalld; then
        echo -e "   ${GREEN}✓${NC} Firewalld is active"
        echo "   Allowed services:"
        firewall-cmd --list-services | tr ' ' '\n' | sed 's/^/     - /'
    else
        echo -e "   ${YELLOW}⚠️${NC}  Firewalld is not active"
    fi
else
    echo "   Firewalld not installed (might be using iptables)"
fi
echo ""

echo "======================================"
echo "  Health Check Complete"
echo "======================================"
echo ""
echo "Next steps:"
echo "  - If any checks failed, refer to DEPLOYMENT_GUIDE.md"
echo "  - Check logs with: pm2 logs"
echo "  - Monitor with: pm2 monit"
echo ""

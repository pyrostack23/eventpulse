#!/bin/bash

# ============================================
# EventPulse Monitoring & Analytics Setup
# ============================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  Monitoring & Analytics Setup${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

APP_DIR="/var/www/eventpulse"
LOG_DIR="$APP_DIR/logs"

# Install PM2 monitoring modules
echo -e "${GREEN}▶ Installing PM2 monitoring modules...${NC}"
pm2 install pm2-logrotate
pm2 install pm2-server-monit

# Configure log rotation
echo -e "${GREEN}▶ Configuring log rotation...${NC}"
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss
pm2 set pm2-logrotate:workerInterval 30
pm2 set pm2-logrotate:rotateInterval '0 0 * * *'

# Create monitoring script
echo -e "${GREEN}▶ Creating monitoring script...${NC}"
cat > $APP_DIR/monitor.sh << 'EOF'
#!/bin/bash

# EventPulse Monitoring Script
# Run this periodically to check system health

LOG_FILE="/var/www/eventpulse/logs/monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] Starting health check..." >> $LOG_FILE

# Check if backend is running
if ! pm2 list | grep -q "eventpulse-backend.*online"; then
    echo "[$DATE] ERROR: Backend is not running!" >> $LOG_FILE
    pm2 restart eventpulse-backend
    echo "[$DATE] Backend restarted" >> $LOG_FILE
fi

# Check disk space
DISK_USAGE=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "[$DATE] WARNING: Disk usage is at ${DISK_USAGE}%" >> $LOG_FILE
fi

# Check memory usage
MEM_USAGE=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
if [ $MEM_USAGE -gt 80 ]; then
    echo "[$DATE] WARNING: Memory usage is at ${MEM_USAGE}%" >> $LOG_FILE
fi

# Check if Nginx is running
if ! systemctl is-active --quiet nginx; then
    echo "[$DATE] ERROR: Nginx is not running!" >> $LOG_FILE
    systemctl start nginx
    echo "[$DATE] Nginx restarted" >> $LOG_FILE
fi

# Check API health
if ! curl -sf http://localhost:5000/api/health > /dev/null; then
    echo "[$DATE] ERROR: API health check failed!" >> $LOG_FILE
    pm2 restart eventpulse-backend
    echo "[$DATE] Backend restarted due to health check failure" >> $LOG_FILE
fi

# Clean old logs (keep last 30 days)
find /var/www/eventpulse/logs -name "*.log" -mtime +30 -delete

echo "[$DATE] Health check completed" >> $LOG_FILE
EOF

chmod +x $APP_DIR/monitor.sh

# Add monitoring to crontab (every 5 minutes)
echo -e "${GREEN}▶ Setting up cron job for monitoring...${NC}"
(crontab -l 2>/dev/null | grep -v "monitor.sh"; echo "*/5 * * * * $APP_DIR/monitor.sh") | crontab -

# Create analytics collection script
echo -e "${GREEN}▶ Creating analytics script...${NC}"
cat > $APP_DIR/collect-analytics.sh << 'EOF'
#!/bin/bash

# Collect analytics data
ANALYTICS_DIR="/var/www/eventpulse/analytics"
DATE=$(date '+%Y-%m-%d')
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

mkdir -p $ANALYTICS_DIR

# Collect PM2 metrics
pm2 jlist > $ANALYTICS_DIR/pm2_metrics_$DATE.json

# Collect system metrics
cat > $ANALYTICS_DIR/system_metrics_$DATE.json << METRICS
{
  "timestamp": "$TIMESTAMP",
  "cpu_usage": "$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)",
  "memory_usage": "$(free | grep Mem | awk '{print int($3/$2 * 100)}')",
  "disk_usage": "$(df -h / | tail -1 | awk '{print $5}')",
  "active_connections": "$(netstat -an | grep ESTABLISHED | wc -l)",
  "nginx_requests": "$(grep -c "GET\\|POST" /var/log/nginx/eventpulse_access.log 2>/dev/null || echo 0)"
}
METRICS

# Clean old analytics (keep last 90 days)
find $ANALYTICS_DIR -name "*.json" -mtime +90 -delete
EOF

chmod +x $APP_DIR/collect-analytics.sh

# Add analytics collection to crontab (every hour)
(crontab -l 2>/dev/null | grep -v "collect-analytics.sh"; echo "0 * * * * $APP_DIR/collect-analytics.sh") | crontab -

# Create performance report script
echo -e "${GREEN}▶ Creating performance report script...${NC}"
cat > $APP_DIR/performance-report.sh << 'EOF'
#!/bin/bash

# Generate daily performance report
REPORT_DIR="/var/www/eventpulse/reports"
DATE=$(date '+%Y-%m-%d')
REPORT_FILE="$REPORT_DIR/performance_$DATE.txt"

mkdir -p $REPORT_DIR

cat > $REPORT_FILE << REPORT
EventPulse Performance Report - $DATE
=====================================

System Information:
-------------------
$(uname -a)

Uptime:
-------
$(uptime)

CPU Usage:
----------
$(top -bn1 | head -20)

Memory Usage:
-------------
$(free -h)

Disk Usage:
-----------
$(df -h)

PM2 Status:
-----------
$(pm2 status)

PM2 Info:
---------
$(pm2 info eventpulse-backend)

Recent Errors (last 50):
------------------------
$(tail -50 /var/www/eventpulse/logs/error.log 2>/dev/null || echo "No errors found")

Nginx Access Log (last 100):
----------------------------
$(tail -100 /var/log/nginx/eventpulse_access.log 2>/dev/null || echo "No access logs found")

Database Status:
----------------
$(mongo --eval "db.serverStatus()" eventpulse_production 2>/dev/null || echo "MongoDB not accessible")

REPORT

echo "Performance report generated: $REPORT_FILE"

# Clean old reports (keep last 30 days)
find $REPORT_DIR -name "performance_*.txt" -mtime +30 -delete
EOF

chmod +x $APP_DIR/performance-report.sh

# Add performance report to crontab (daily at 1 AM)
(crontab -l 2>/dev/null | grep -v "performance-report.sh"; echo "0 1 * * * $APP_DIR/performance-report.sh") | crontab -

# Create alert script
echo -e "${GREEN}▶ Creating alert script...${NC}"
cat > $APP_DIR/alert.sh << 'EOF'
#!/bin/bash

# Send alerts for critical issues
# Configure email settings in .env

send_alert() {
    SUBJECT="$1"
    MESSAGE="$2"
    
    # Log alert
    echo "[$(date)] ALERT: $SUBJECT - $MESSAGE" >> /var/www/eventpulse/logs/alerts.log
    
    # Send email (if configured)
    # echo "$MESSAGE" | mail -s "$SUBJECT" admin@yourdomain.com
}

# Check critical services
if ! pm2 list | grep -q "eventpulse-backend.*online"; then
    send_alert "Backend Down" "EventPulse backend is not running!"
fi

if ! systemctl is-active --quiet nginx; then
    send_alert "Nginx Down" "Nginx web server is not running!"
fi

# Check disk space
DISK_USAGE=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
    send_alert "Disk Space Critical" "Disk usage is at ${DISK_USAGE}%"
fi

# Check memory
MEM_USAGE=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
if [ $MEM_USAGE -gt 90 ]; then
    send_alert "Memory Critical" "Memory usage is at ${MEM_USAGE}%"
fi
EOF

chmod +x $APP_DIR/alert.sh

# Add alert check to crontab (every 10 minutes)
(crontab -l 2>/dev/null | grep -v "alert.sh"; echo "*/10 * * * * $APP_DIR/alert.sh") | crontab -

echo ""
echo -e "${GREEN}✓ Monitoring & Analytics setup complete!${NC}"
echo ""
echo "Installed components:"
echo "  - PM2 log rotation"
echo "  - PM2 server monitoring"
echo "  - Health check monitoring (every 5 minutes)"
echo "  - Analytics collection (hourly)"
echo "  - Performance reports (daily)"
echo "  - Alert system (every 10 minutes)"
echo ""
echo "View monitoring:"
echo "  pm2 monit"
echo "  pm2 logs"
echo "  tail -f $LOG_DIR/monitor.log"
echo ""

#!/bin/bash
API_URL="http://localhost:3001/tasks"

echo "Creating Task..."
RESPONSE=$(curl -s -X POST $API_URL -H "Content-Type: application/json" -d '{"requestingParty": "Sales", "priority": "High", "plannedTime": 5}')
echo $RESPONSE
TASK_ID=$(echo $RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "Task ID: $TASK_ID"

echo "Approving Credit..."
curl -s -X PATCH $API_URL/$TASK_ID/approve-credit
echo ""

echo "Reporting Obstacle..."
curl -s -X PATCH $API_URL/$TASK_ID/report-obstacle -H "Content-Type: application/json" -d '{"obstacle": "Material Shortage"}'
echo ""

echo "Resolving Obstacle..."
curl -s -X PATCH $API_URL/$TASK_ID/resolve-obstacle
echo ""

echo "Completing Production..."
curl -s -X PATCH $API_URL/$TASK_ID/complete-production
echo ""

echo "Closing Task..."
curl -s -X PATCH $API_URL/$TASK_ID/close
echo ""

echo "Final Task State:"
curl -s $API_URL/$TASK_ID
echo ""

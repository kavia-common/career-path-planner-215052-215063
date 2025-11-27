#!/bin/bash
cd /home/kavia/workspace/code-generation/career-path-planner-215052-215063/career_planner_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi


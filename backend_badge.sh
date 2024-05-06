#!/bin/bash
NBERR=$(grep -e "FAIL" backendTest_report.txt | wc -l)
color="green"
text="Passed"
if [[ $NBERR > 0 ]]
then 
  color="red"
  text="Failed"
fi

coverage=$(grep -E "All files\s+\|" backendTest_coverage_report.txt | awk '{print $4}') || 0.0

anybadge -o -l "Backend coverage" -v "$coverage" --suffix='%' -f "backend_coverage_test.svg" 1=red 60=yellow 80=green 90=lime 
anybadge -o -l "Backend tests " -v "$text" -c "$color" -f "backend_test.svg"
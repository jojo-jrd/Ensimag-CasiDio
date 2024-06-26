#!/bin/bash
NBERR=$(grep -e "failed" frontendTest_report.txt | wc -l)
color="green"
text="Passed"
if [[ $NBERR > 0 ]]
then 
  color="red"
  text="Failed"
fi

coverage=$(grep "%" frontendTest_coverage_report.txt | head -n 1 | tr " " "\n" | head -n 5 | tail -n1 | tr -d "%") || 0.0

anybadge -o -l "Frontend coverage" -v "$coverage" --suffix='%' -f "frontend_coverage_test.svg"  1=red 60=yellow 80=green 90=lime 
anybadge -o -l "Frontend tests" -v "$text" -c "$color" -f "frontend_test.svg"
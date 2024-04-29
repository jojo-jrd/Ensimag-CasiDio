#!/bin/bash
NBERR=$(grep -e "FAIL" backendTest_report.txt | wc -l)
color="green"
text="Passed"
if [[ $NBERR > 0 ]]
then 
  color="red"
  text="Failed"
fi
anybadge -o -l "Backend tests " -v "$text" -c "$color" -f "backend_test.svg"
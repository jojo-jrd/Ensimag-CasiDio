#!/bin/bash
NBERR=$(grep -e "failed" frontendTest_report.txt | wc -l)
color="green"
text="Passed"
if [[ $NBERR > 0 ]]
then 
  color="red"
  text="Failed"
fi
anybadge -o -l "Cypress tests " -v "$text" -c "$color" -f "frontend_test.svg"
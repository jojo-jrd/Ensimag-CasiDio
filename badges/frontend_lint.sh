#!/bin/bash
NBERR=$(grep -e "error" frontend_lint_report.txt | wc -l)
NBWARN=$(grep -e "warning" frontend_lint_report.txt | wc -l)
NBERR=$(($NBERR - 1))
NBWARN=$(($NBWARN - 1))
color="green"
if [[ $NBERR > 0 ]]
then 
  color="red"
  else if [[ $NBWARN > 0 ]]
  then 
    color="orange"
  fi
fi
anybadge -o -l "Frontend Lint" -v "errors : $NBERR warnings : $NBWARN" -c "$color" -f "frontend_lint.svg"
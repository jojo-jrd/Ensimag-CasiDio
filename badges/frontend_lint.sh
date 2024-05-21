#!/bin/bash
NBERR=$(grep -e "error" frontend_lint_report.txt | wc -l)
NBWARN=$(grep -e "warning" frontend_lint_report.txt | wc -l)

# Warning de la commande
NBWARN=$(($NBWARN - 1))

color="green"
if [[ $NBERR > 1 ]]
then
  # Error du récapitulatif
  NBERR=$(($NBERR - 1))
  color="red"
  else if [[ $NBWARN > 1 ]]
  then
    # Warning du récapitulatif
    NBWARN=$(($NBWARN - 1))
    color="orange"
  fi
fi
anybadge -o -l "Frontend Lint" -v "errors : $NBERR warnings : $NBWARN" -c "$color" -f "frontend_lint.svg"
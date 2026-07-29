# PFC — Project Log System

## What this is
Field documentation web app for Premier Finish & Construction, Moncton NB.
Built by Miguel Godbout. Crew of 5 on iOS iPhones.

## Deployment
- Frontend: GitHub Pages (miggodbout.github.io/PFC/)
- Backend: Google Apps Script
- Push frontend: git add . && git commit -m "message" && git push
- Push Apps Script: clasp push (from repo root, appscript/Code.js is the script file)

## Critical constraints
- NEVER touch Hub/Log/app_v2.html or Hub/Log/index.html
- No frameworks — vanilla HTML/CSS/JS only
- Mobile-first, iOS Safari is primary browser
- No localStorage or sessionStorage
- Logo lives at assets/logo.jpg — never embed as base64

## Brand
- Dark theme, background #0D0D0D
- Rose gold accent #C4814E
- Font: Arial
- Footer on every page: "Built by Miguel Godbout"

## Apps Script URL
https://script.google.com/macros/s/AKfycbwukwZFvoGQ_UtS2hjAqGAFxzq8EoBATey2FLNgcir0PDhAMJI3uduffmjd0AKN4DwliQ/exec

## After any Apps Script change
Run: clasp push
Then in Apps Script: Deploy → Manage deployments → pencil → New version → Deploy

## URL structure
?job=Elsliger-36-B&units=36
Floor logic: first digit of unit number = floor (301 = Floor 3)
Units always listed descending (Floor 3 first)

Five fixes off the 0.2.1 list, plus the writing rule behind one of them. No
Sheet was migrated and the backend was not touched.

## Tracking

- The phase split is three columns instead of one line of text
- Each phase shows a small label above a big number, and the columns line up
  down the whole building list
- Removed the `30 of 36 units started · 0 done` line

## Hub

- `Tracking` now reads `See and update building progress`
- `Set Up Building` now reads `Create or edit a building`
- The Log flag is centred by eye, not by pixel count
- `Add to phone` sits square with the cards above it, and its label is centred
- Fixed the class-name collision that was indenting `Add to phone` by 34px

## Adding the app to a phone

- Chrome, Firefox and Edge on an iPhone get their own install sheet
- It opens with `Open Safari`, because only Safari can add to the Home Screen
- The site address is printed, with a `Copy address` button
- Safari and Android are unchanged

## Logging an issue

- `Needed` says `Optional` beside the field name
- The empty Log screen says `Then log against it here`, not `Then you can log
  against it here`

## Writing

- `docs/crew-words.md` gains "The shape comes before the words": pick label,
  instruction or explanation first, then apply Simplified Technical English
  inside that shape
- Most screen text is a label, so it is a fragment with no full stop
- STE alone passed `You can leave this empty.`, which is why the rule exists

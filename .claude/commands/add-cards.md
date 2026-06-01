Add new flashcards to the Greek cards data repository.

## What this skill does

Takes a list of Greek words/phrases (or a topic request) from the user and:
1. Formats them into the correct `cards.json` structure
2. Appends to `/Users/o.lemeshko/projects/greek-cards-data/cards.json`
3. Commits and pushes to the data repo

## Input formats the user may provide

**Raw list:**
```
γεια - привет
ευχαριστώ - спасибо
```

**Topic request:**
```
добавь 10 слов на тему "транспорт"
```

**Mixed with transliteration:**
```
καλημέρα (kalimera) - доброе утро
```

## Steps to follow

1. Read the current `cards.json` to find the highest existing `id` number
2. Generate new cards in the format below, continuing the ID sequence
3. For each card, if transliteration is not provided — derive it yourself (Modern Greek pronunciation rules)
4. Assign a fitting `category` in Russian
5. Append new cards to the `cards` array in the JSON file
6. Show the user a preview of the cards being added
7. Ask for confirmation before committing
8. After confirmation: commit to data repo with message `cards: добавить N карточек — [category]`
9. Push using the configured remote (`github-greek-cards-data`)

## Card format

```json
{
  "id": "g051",
  "front": "Greek word or phrase",
  "back": "перевод на русском",
  "transliteration": "latinized pronunciation",
  "category": "категория",
  "notes": "optional extra context"
}
```

## ID format

Zero-padded 3 digits: `g001`, `g002`, ... `g099`, `g100`, `g101`

## Transliteration rules (Modern Greek)

- γ = y (before ε/ι) or gh/g
- θ = th
- δ = dh
- χ = h/kh
- φ = f
- ψ = ps
- ξ = x
- αι = e, ει/οι/υ = i, αυ = av/af, ευ = ev/ef
- μπ = b, ντ = d/nd, γκ = g

## Important

- Never commit without explicit user confirmation
- Validate JSON before writing (no trailing commas, correct structure)
- Keep `"updated"` field in the root object current (today's date)

# 🚀 Feature: Beheerder kan velden handmatig koppelen via het canvas

## Bounded Context

Veldkoppelingen

---

## User Stories

<!-- Written by Product Owner -->

- Als een **technisch beheerder**, wil ik een bronveld selecteren en vervolgens een doelveld selecteren om ze te koppelen, zodat ik een veldkoppeling kan definiëren zonder te slepen
- Als een **technisch beheerder**, wil ik bestaande koppelingen kunnen verwijderen, zodat ik fouten kan corrigeren
- Als een **technisch beheerder**, wil ik in één oogopslag zien hoeveel doelvelden zijn gekoppeld versus ongekoppeld, zodat ik de voortgang van de mapping kan bewaken

## Design Handoff

- Figma: —
- Oriëntatieschets: ![PoC oriëntatieschets](../docs/design/orientation-design.png)
- States covered: default / loading / error / empty
- Accessibility notes: Selectie-interactie (geen drag-and-drop) is volledig toetsenbord-toegankelijk

---

## Acceptance Criteria

- [ ] Beheerder kan een bronveld selecteren in het bronpaneel en vervolgens een doelveld selecteren in het doelpaneel om een koppeling te maken
- [ ] Een actieve koppeling is zichtbaar als een lijn tussen het bronveld en het doelveld
- [ ] Beheerder kan een bestaande koppeling verwijderen
- [ ] Het canvas toont de koppelingsdekkingsgraad (aantal gekoppelde doelvelden van het totaal)

## Edge Cases

- Beheerder verbindt een bronveld dat al aan een ander doelveld is gekoppeld → bestaande koppeling blijft staan, nieuwe wordt toegevoegd (één bronveld mag meerdere doelvelden bedienen)
- Beheerder probeert een doelveld te koppelen aan zichzelf → koppeling wordt niet aangemaakt
- Canvas met zeer veel velden (>50) → velden blijven bereikbaar via scrollen in de panelen

## Domain Events

- Emits: `VeldgekoppeldAanDoelveld`, `VeldkoppelingVerwijderd`
- Consumes: `BronschemaGeladen`, `DoelschemaGeladen`

---

## Definition of Ready

- [ ] User stories agreed by PO
- [x] Design handoff complete *(oriëntatieschets beschikbaar — geen Figma voor PoC)*
- [x] Acceptance criteria written and reviewed
- [x] Edge cases identified

---

## Proposed Tasks

- [ ] Vue Flow canvas opzetten met bron- en doelveldknooppunten
- [ ] Selectie-interactie implementeren: bronveld selecteren → doelveld selecteren → koppeling aanmaken
- [ ] Bestaande koppeling verwijderen via canvas
- [ ] Koppelingsdekkingsgraad weergeven (X van Y doelvelden gekoppeld)

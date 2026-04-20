# 🚀 Feature: Beheerder kan de koppelingsset exporteren en importeren

## Bounded Context

Veldkoppelingen

---

## User Stories

<!-- Written by Product Owner -->

- Als een **technisch beheerder**, wil ik de voltooide koppelingsset exporteren als JSON-bestand, zodat externe applicaties de koppeling kunnen gebruiken voor de daadwerkelijke datamigratie
- Als een **technisch beheerder**, wil ik een eerder geëxporteerd JSON-bestand kunnen importeren, zodat ik de app-state kan herstellen en verder werken aan een eerdere mapping
- Als een **technisch beheerder**, wil ik dat de export zowel de schema's als alle veldkoppelingen bevat, zodat het exportbestand zelfstandig bruikbaar is zonder de originele bronbestanden

## Design Handoff

- Figma: —
- Oriëntatieschets: ![PoC oriëntatieschets](../docs/design/orientation-design.png)
- States covered: default / loading / error / empty
- Accessibility notes: —

---

## Acceptance Criteria

- [ ] Beheerder kan de huidige koppelingsset exporteren als JSON-bestand via de interface
- [ ] Het JSON-exportbestand bevat: bronschema, doelschema, en alle gedefinieerde veldkoppelingen
- [ ] Beheerder kan een eerder geëxporteerd JSON-bestand importeren om de volledige app-state te herstellen
- [ ] Na het importeren zijn alle veldkoppelingen zichtbaar op het canvas, identiek aan de staat bij de export

## Edge Cases

- Export zonder koppelingen (alleen schema's geladen) → export bevat schema's zonder koppelingen
- Importbestand heeft een ongeldig of onbekend JSON-formaat → inline foutmelding
- Importbestand bevat veldverwijzingen die niet overeenkomen met de huidige schema's → markeer als verweesde koppelingen met waarschuwing

## Domain Events

- Emits: `KoppelingssetGeëxporteerd`, `KoppelingssetGeïmporteerd`
- Consumes: `BronschemaGeladen`, `DoelschemaGeladen`, `VeldgekoppeldAanDoelveld`

---

## Open Questions

- **Transformatieregels in JSON-export:** Hoe worden transformatieregels (standaardwaarden, if-else-logica op basis van andere bronvelden) opgeslagen in het exportformaat? Twee opties onder onderzoek: (1) plain JSON met eigen `type`-structuur — geen dependency, voldoende als de app alleen definieert; (2) JSONata-expressies — geschikt als de app transformaties zelf uitvoert (bijv. preview). Keuze uitgesteld; zie ook TECH.md Open Questions.
- Welke externe applicaties lezen het exportbestand in, en zijn er specifieke veldnamen of structuurvereisten?

---

## Definition of Ready

- [ ] User stories agreed by PO
- [x] Design handoff complete *(oriëntatieschets beschikbaar — geen Figma voor PoC)*
- [x] Acceptance criteria written and reviewed
- [x] Edge cases identified

---

## Proposed Tasks

- [ ] Koppelingsset serialiseren naar JSON-exportformaat (bronschema, doelschema, koppelingen)
- [ ] JSON-export downloaden via de browser als bestand
- [ ] JSON-importbestand inlezen en parsen naar app-state model
- [ ] App-state volledig herstellen vanuit importbestand (schema's en canvas-koppelingen)

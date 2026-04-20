# 🚀 Feature: Beheerder kan een bronschema laden en inspecteren

## Bounded Context

Bronbeheer

---

## User Stories

<!-- Written by Product Owner -->

- Als een **technisch beheerder**, wil ik een OpenAPI-specificatie importeren, zodat de velden van het bronsysteem beschikbaar zijn voor koppeling
- Als een **technisch beheerder**, wil ik de geladen bronvelden per schema-object inspecteren, zodat ik begrijp welke gegevens het bronsysteem levert
- Als een **technisch beheerder**, wil ik zien welke bronvelden nog niet zijn gekoppeld, zodat ik weet wat nog gemapped moet worden

## Design Handoff

- Figma: —
- Oriëntatieschets: ![PoC oriëntatieschets](../docs/design/orientation-design.png)
- States covered: default / loading / error / empty
- Accessibility notes: —

---

## Acceptance Criteria

- [ ] Beheerder kan een OpenAPI-spec (YAML of JSON) importeren via de interface
- [ ] Na het laden zijn alle velden zichtbaar in het bronpaneel, gegroepeerd per schema-object
- [ ] Velden zijn uitklapbaar per object
- [ ] Niet-gekoppelde velden zijn visueel onderscheidbaar van gekoppelde velden

## Edge Cases

- Ongeldige of onleesbare OpenAPI-spec → inline foutmelding
- Lege spec zonder schema-objecten → lege staat met instructie
- Geneste schema-objecten (`$ref`) → uitklapbare boom met opgeloste referentie

## Domain Events

- Emits: `BronschemaGeladen`
- Consumes: —

---

## Definition of Ready

- [ ] User stories agreed by PO
- [x] Design handoff complete *(oriëntatieschets beschikbaar — geen Figma voor PoC)*
- [x] Acceptance criteria written and reviewed
- [x] Edge cases identified

---

## Proposed Tasks

- [ ] OpenAPI-spec importeren via bestandsdialoog en parsen naar bronveldmodel
- [ ] Bronvelden weergeven in linkerpaneel als uitklapbare boomstructuur per schema-object
- [ ] Visuele markering voor niet-gekoppelde bronvelden

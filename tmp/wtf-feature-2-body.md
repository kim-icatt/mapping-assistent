# 🚀 Feature: Beheerder kan een doelschema laden en inspecteren

## Bounded Context

Doelbeheer

---

## User Stories

<!-- Written by Product Owner -->

- Als een **technisch beheerder**, wil ik een OpenAPI-specificatie importeren als doelschema, zodat de vereiste doelvelden beschikbaar zijn voor koppeling
- Als een **technisch beheerder**, wil ik de geladen doelvelden per schema-object inspecteren, zodat ik begrijp welke velden het doelsysteem verwacht
- Als een **technisch beheerder**, wil ik zien welke doelvelden nog niet zijn gekoppeld, zodat ik weet welke velden nog ingevuld moeten worden

## Design Handoff

- Figma: —
- Oriëntatieschets: ![PoC oriëntatieschets](../docs/design/orientation-design.png)
- States covered: default / loading / error / empty
- Accessibility notes: —

---

## Acceptance Criteria

- [ ] Beheerder kan een OpenAPI-spec (YAML of JSON) importeren als doelschema via de interface
- [ ] Na het laden zijn alle doelvelden zichtbaar in het doelpaneel, gegroepeerd per schema-object
- [ ] Velden zijn uitklapbaar per object
- [ ] Niet-gekoppelde doelvelden zijn visueel onderscheidbaar van gekoppelde doelvelden

## Edge Cases

- Ongeldige of onleesbare OpenAPI-spec → inline foutmelding
- Lege spec zonder schema-objecten → lege staat met instructie
- Geneste schema-objecten (`$ref`) → uitklapbare boom met opgeloste referentie

## Domain Events

- Emits: `DoelschemaGeladen`
- Consumes: —

---

## Definition of Ready

- [ ] User stories agreed by PO
- [x] Design handoff complete *(oriëntatieschets beschikbaar — geen Figma voor PoC)*
- [x] Acceptance criteria written and reviewed
- [x] Edge cases identified

---

## Proposed Tasks

- [ ] OpenAPI-spec importeren als doelschema via bestandsdialoog en parsen naar doelveldmodel
- [ ] Doelvelden weergeven in rechterpaneel als uitklapbare boomstructuur per schema-object
- [ ] Visuele markering voor niet-gekoppelde doelvelden

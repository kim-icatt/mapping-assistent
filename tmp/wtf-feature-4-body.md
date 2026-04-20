# 🚀 Feature: Beheerder kan AI-suggesties voor veldkoppelingen beoordelen

## Bounded Context

AI-assistentie

---

## User Stories

<!-- Written by Product Owner -->

- Als een **technisch beheerder**, wil ik automatisch AI-suggesties ontvangen voor ongekoppelde doelvelden zodra beide schema's zijn geladen, zodat ik het koppelingsproces sneller kan doorlopen
- Als een **technisch beheerder**, wil ik elke AI-suggestie kunnen accepteren of afwijzen, zodat ik de regie behoud over de uiteindelijke koppelingen
- Als een **technisch beheerder**, wil ik de betrouwbaarheidsscore van elke suggestie kunnen zien, zodat ik weloverwogen kan beslissen welke suggesties ik accepteer

## Design Handoff

- Figma: —
- Oriëntatieschets: ![PoC oriëntatieschets](../docs/design/orientation-design.png)
- States covered: default / loading / error / empty
- Accessibility notes: —

---

## Acceptance Criteria

- [ ] Nadat beide schema's zijn geladen, genereert de applicatie automatisch AI-suggesties voor ongekoppelde doelvelden
- [ ] Elke suggestie toont het voorgestelde bronveld, het doelveld en een betrouwbaarheidsscore
- [ ] Beheerder kan een suggestie accepteren (koppeling wordt aangemaakt) of afwijzen (suggestie verdwijnt)
- [ ] Het acceptatiepercentage (geaccepteerd vs. afgewezen) wordt bijgehouden en zichtbaar weergegeven in de applicatie

## Edge Cases

- AI-service niet bereikbaar → inline foutmelding; beheerder kan handmatig doorgaan zonder suggesties
- Geen ongekoppelde doelvelden aanwezig → geen suggesties gegenereerd; toon melding
- Alle suggesties afgewezen → toon lege staat met optie om opnieuw te genereren

## Domain Events

- Emits: `AISuggestiesGegenereerd`, `AISuggestieGeaccepteerd`, `AISuggestieAfgewezen`
- Consumes: `BronschemaGeladen`, `DoelschemaGeladen`

---

## Definition of Ready

- [ ] User stories agreed by PO
- [x] Design handoff complete *(oriëntatieschets beschikbaar — geen Figma voor PoC)*
- [x] Acceptance criteria written and reviewed
- [x] Edge cases identified

---

## Proposed Tasks

- [ ] AI API aanroepen vanuit de frontend met bronschema- en doelschemacontext voor suggestiegeneratie (provider TBD)
- [ ] AI-suggesties weergeven in het suggestiepaneel met betrouwbaarheidsscore
- [ ] Accepteer- en afwijsacties implementeren per suggestie
- [ ] Acceptatieratio bijhouden en weergeven in de applicatie

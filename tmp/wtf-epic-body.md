# 🎯 Epic: Fase 1 PoC — Werkende veld-voor-veld koppeling

## Stakeholders

- Product Owner: Kim
- Lead Designer: —
- Tech Lead: Youri

---

## Bounded Context

Alle vier contexten zijn vereist voor de end-to-end PoC: **Bronbeheer** (bronsysteem en schema laden), **Doelbeheer** (doelsysteem en schema definiëren), **Veldkoppelingen** (koppelingen aanmaken, transformaties configureren, exporteren), **AI-assistentie** (suggesties genereren en beoordelen).

---

## Context

Gemeenten wisselen gegevens uit tussen uiteenlopende systemen. Technische beheerders moeten handmatig bepalen hoe velden van een bronsysteem overeenkomen met velden in een doelsysteem — een foutgevoelig en tijdrovend proces zonder gespecialiseerd gereedschap.

De PoC bewijst dat Mapping Assistent dit proces kan ondersteunen: een beheerder laadt twee schema's, koppelt velden visueel, past transformaties toe, beoordeelt AI-suggesties en exporteert het resultaat als bruikbare output voor een extern systeem.

## Goal

Een technisch beheerder kan een bronsysteem en doelsysteem laden, een complete veld-voor-veld koppeling definiëren via het visuele canvas, AI-suggesties beoordelen en bevestigen, en de koppeling exporteren als machineleesbare output die door een externe applicatie kan worden ingelezen.

## Success Metrics

- [ ] Een beheerder kan een bronsysteem en doelsysteem laden en beide schema's naast elkaar bekijken
- [ ] Een beheerder kan via het koppelingscanvas handmatig velden aan elkaar koppelen
- [ ] AI-suggesties worden gegenereerd voor ongekoppelde velden en kunnen worden geaccepteerd of afgewezen
- [ ] De applicatie toont aantoonbaar hoeveel velden zijn gekoppeld versus ongekoppeld
- [ ] De voltooide koppeling kan worden geëxporteerd en opnieuw geladen via een lokaal bestand
- [ ] De AI-assistentie versnelt het koppelingsproces aantoonbaar (acceptatiepercentage bijgehouden in de applicatie)

---

## Design Artifacts

—

## Out of Scope

- Backend, server-side persistentie of API's
- Gebruikersbeheer en authenticatie
- Multi-user samenwerking

## Risks

- ***Vue Flow-integratie met dynamische schema's kan complex zijn voor geneste veldstructuren***
- ***AI API-aanroepen direct vanuit de frontend vereisen zorgvuldige sleutelbeheer in de PoC-omgeving***

## Feature Breakdown

- [ ]
- [ ]
- [ ]
- [ ]

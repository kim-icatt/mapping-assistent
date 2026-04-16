# Mapping Assistent QA-standaarden

> Gegenereerd door `steer-qa`. Verfijn dit document naarmate de teststrategie evolueert — niet opnieuw genereren vanaf nul.

Laatst bijgewerkt: 2026-04-16

## Teststrategie

| Niveau | Type | Tool | Doel |
|---|---|---|---|
| Unit | Composables, utility functions, logica | Vitest | Valideer geïsoleerde logica zonder UI |
| Component | Vue-componenten met interacties | Vitest + Vue Test Utils | Valideer rendering en gebruikersinteracties per component |
| E2E | Gebruikersflows door de applicatie | Playwright | Valideer end-to-end gedrag vanuit het perspectief van de beheerder |

## Dekkingsvereisten

- **Nieuwe en gewijzigde code:** minimaal 80% (regels + branches) — afgedwongen, niet streefwaarde
- **Publieke functies:** minimaal één happy-path- en één foutpadtest per functie
- **Bugfixes:** moeten een regressietest bevatten die de bug eerder had kunnen detecteren

## Testpatronen

- **Framework:** Vitest + Vue Test Utils (unit en component), Playwright (E2E)
- **Testbestandslocatie:** colocated `*.test.ts` naast bronbestanden; Playwright-tests in `e2e/`
- **Mockgrens:** alleen mocken op systeemgrenzen (AI API-aanroepen, bestandssysteem). Geen interne applicatiecode mocken.
- **Fase 1:** de AI API-aanroep is de enige externe grens — gebruik een mock voor de AI-service in unit- en componenttests

## Gherkin → Testmapping

- Elk Gherkin-scenario wordt gedekt door minimaal één geautomatiseerde test
- Testnamen verwijzen naar de naam van het scenario zodat fouten herleidbaar zijn
- Given-stappen → testopzet, When-stappen → actie, Then-stappen → assertie
- Scenario's beschrijven observeerbaar gedrag, geen implementatiedetails

## Definition of Done

- [ ] Alle Gherkin-scenario's gedekt door geautomatiseerde tests
- [ ] Lint en typecontrole slagen (geen TypeScript-fouten, geen lint-overtredingen)
- [ ] Playwright E2E slaagt voor alle beïnvloede gebruikersflows

## Testomgevingen

| Omgeving | Doel | Toegang |
|---|---|---|
| Lokaal | Ontwikkeling en handmatig testen | `npm run dev` + `npm run test` |
| CI | Geautomatiseerde gate op pull requests | GitHub Actions |

## Bekende onstabiele gebieden

Nog geen geïdentificeerd.

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

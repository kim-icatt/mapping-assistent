# Mapping Assistent Visie

> Gegenereerd door `steer-vision`. Verfijn dit document naarmate het product evolueert — niet opnieuw genereren vanaf nul.

Laatst bijgewerkt: 2026-04-16

## Productdoel

Mapping Assistent stelt technische beheerders bij Nederlandse gemeenten in staat om complete veld-voor-veld koppelingen te definiëren tussen bron- en doelsystemen, inclusief datatransformaties. De applicatie begeleidt beheerders bij het inspecteren van schema's, het configureren van transformaties en het beoordelen van koppelingen, en produceert exporteerbare output die downstream systemen direct kunnen verwerken. Geïntegreerde AI-suggesties versnellen het koppelingsproces; elke suggestie wordt beoordeeld en bevestigd door de beheerder voordat deze wordt toegepast.

## Doelgebruikers

| Actor | Context | Primaire doelen |
|---|---|---|
| Technisch beheerder | Werkzaam bij een Nederlandse gemeente; verantwoordelijk voor het onderhouden van datakoppelingen tussen interne en externe systemen | Een bron-naar-doel veldkoppeling voltooien, het resultaat exporteren en aanpassen wanneer schema's wijzigen |

## Kernprincipes

1. **AI-geassisteerd, menselijk bevestigd** — De AI-assistent stelt koppelingssuggesties voor; de beheerder beoordeelt en bevestigt elke suggestie voordat deze wordt toegepast. Geen enkele koppeling wordt automatisch doorgevoerd.
2. **Visueel overzichtelijk** — De koppelingsworkspace is ontworpen voor directe begrijpelijkheid. Beheerders zien de volledige velddekking, niet-gekoppelde velden en transformatieregels zonder ergens anders naartoe te navigeren.
3. **Meetbare AI-performance** — De nauwkeurigheid van AI-suggesties wordt systematisch bijgehouden zodat de kwaliteit van het systeem aantoonbaar kan worden verbeterd. Dit is een interne maatstaf voor productkwaliteit, niet een dashboard voor de beheerder.
4. **Herhaalbaar** — Koppelingsconfiguraties kunnen worden hergebruikt voor verschillende combinaties van bron- en doelsystemen. De werkwijze is consistent, ongeacht de betrokken systemen.
5. **Exporteerbare output** — Elke voltooide koppeling produceert een gestructureerde, machineleesbare export die door externe systemen kan worden verwerkt zonder handmatige transformatie.

## Strategische doelen

- [ ] PoC afgerond binnen de eerste maand: ten minste één bronsysteem succesvol gekoppeld aan een doelsysteem met een complete veld-voor-veld koppeling gedemonstreerd
- [ ] Binnen 12 maanden: een technisch beheerder kan zelfstandig een volledige bron-naar-doel koppeling voltooien, het resultaat exporteren en laten verwerken door een externe applicatie
- [ ] Koppelingen zijn visueel overzichtelijk en direct aanpasbaar wanneer schema's wijzigen, zonder opnieuw te beginnen
- [ ] AI-suggesties versnellen het koppelingsproces aantoonbaar met een meetbaar percentage, bijgehouden en zichtbaar in de applicatie

## Begrensde contexten

| Context | Verantwoordelijkheid | Belangrijke domeinobjecten |
|---|---|---|
| Bronbeheer | Verbinden met bronsystemen en inspecteren van hun veldschema's | Bronsysteem, Bronschema, Bronveld |
| Doelbeheer | Definiëren van het doelsysteem en de vereiste veldstructuur | Doelsysteem, Doelschema, Doelveld |
| Veldkoppelingen | Aanmaken, bewerken, beoordelen en exporteren van veld-voor-veld koppelingen met transformatieregels | Veldkoppeling, Transformatieregel, Mappingset |
| AI-assistentie | Genereren van koppelingssuggesties, voorstellen van transformatie-expressies, afleiden van validatieregels uit veldbeschrijvingen, en beheren van context- en API-kosten bij grote OpenAPI-specificaties | AI-suggestie, Suggestiescore, Acceptatieratio, TransformatieSuggestie, ValidatieRegel |

## Buiten bereik

- **Datatransport en pipeline-uitvoering** — Mapping Assistent definieert hoe velden worden gekoppeld; de applicatie verplaatst, synchroniseert of repliceert geen gegevens tussen systemen.

## Openstaande vragen

- Moeten koppelingstemplates deelbaar zijn tussen gemeenten, of privé per gemeente?
- Welke exportformaten moet de output ondersteunen (JSON, XML, CSV, XSD)?
- Maakt de AI-component gebruik van een externe LLM-API of een intern model?

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

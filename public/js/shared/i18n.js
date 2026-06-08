"use strict";

const CogniCheckI18n = (() => {
  const storageKey = "cognicheck_language";
  const defaultLanguage = "Dutch";
  const languages = new Set(["Dutch", "English"]);

  const translations = {
    Dutch: {
      "nav.workshop": "Workshop",
      "nav.methodology": "Methodologie",
      "nav.goToCogniCheck": "Naar CogniCheck",
      "nav.about": "Over",
      "nav.privacy": "Privacy",
      "nav.contact": "Contact",
      "nav.bookIntake": "Plan een intake",
      "nav.demoHome": "Demo home",
      "nav.reportAnalysis": "Rapportanalyse",
      "nav.requirementsBlueprint": "Requirements naar blueprint",
      "nav.logout": "Uitloggen",
      "nav.languageLabel": "Taal",

      "common.outputLanguage": "Outputtaal",
      "common.english": "English",
      "common.dutch": "Nederlands",
      "common.loading": "Laden...",
      "common.tryAgain": "Probeer het opnieuw.",

      "demo.title": "CogniCheck Demo",
      "demo.eyebrow": "CogniCheck Demo",
      "demo.heading": "Welkom bij de CogniCheck demo",
      "demo.intro": "Kies waar je wilt starten. CogniCheck ondersteunt nu rapportanalyse en requirements-naar-blueprint, beide gebaseerd op een methode voor beslissingsondersteuning.",
      "demo.card.analysis.title": "Analyseer een BI-rapport",
      "demo.card.analysis.body": "Upload een dashboardscreenshot, voeg context toe, controleer gestructureerde velden en ontvang een compacte CogniCheck-analyse gericht op cognitieve belasting en beslissingsondersteuning.",
      "demo.card.analysis.cta": "Start rapportanalyse",
      "demo.card.blueprint.title": "Zet requirements om naar een BI-blueprint",
      "demo.card.blueprint.body": "Upload dashboardrequirements en ontvang een gestructureerde blueprint met kernrequirements, aannames, risico's en implementatierichting.",
      "demo.card.blueprint.cta": "Start blueprint",
      "demo.card.method.title": "Verken de CogniCheck-methode",
      "demo.card.method.body": "Leer hoe CogniCheck cognitieve psychologie, requirements-denken en beslissingslogica gebruikt om BI-werk te beoordelen.",
      "demo.card.method.cta": "Bekijk methodologie",
      "demo.flow.title": "Aanbevolen demovolgorde",
      "demo.flow.1": "Lees de methodologie",
      "demo.flow.2": "Probeer Requirements naar Blueprint",
      "demo.flow.3": "Probeer Rapportanalyse met context",
      "demo.flow.4": "Vergelijk de aanbevelingen met je eigen BI-ontwerpoordeel",

      "analysis.pageTitle": "Rapportanalyse Demo | CogniCheck",
      "analysis.heading": "CogniCheck Rapportanalyse",
      "analysis.uploadLabel": "Upload rapportscreenshot",
      "analysis.dropzone": "Upload of sleep een screenshot",
      "analysis.dropzoneSmall": "of klik om een bestand te kiezen",
      "analysis.supportingLabel": "Upload ondersteunende bestanden",
      "analysis.supportingHelp": "Optioneel: upload requirements, notities, KPI-definities of andere contextdocumenten. TXT-bestanden worden direct gelezen. PDF- en DOCX-ondersteuning is experimenteel en wordt als bijlage naar de AI gestuurd. XLSX wordt nog niet ondersteund.",
      "analysis.contextLabel": "Achtergrondcontext",
      "analysis.contextPlaceholder": "Beschrijf het rapport, de doelgroep, het doel, ondersteunde beslissingen, KPI-definities, bekende aandachtspunten of andere informatie die CogniCheck helpt om het rapport te begrijpen.\n\nVoorbeeld:\nMaandelijks finance-dashboard voor business controllers. Wordt gebruikt tijdens maandelijkse managementmeetings om budgetafwijkingen te monitoren en te beslissen of bijsturing nodig is.",
      "analysis.importButton": "Rapport importeren",
      "analysis.importing": "Rapport importeren...",
      "analysis.structuredNote": "CogniCheck heeft gestructureerde rapportcontext opgesteld op basis van de screenshot en je input. Controleer en corrigeer deze velden voordat je de volledige analyse uitvoert.",
      "analysis.analyzeButton": "CogniCheck-analyse uitvoeren",
      "analysis.analyzing": "Analyseren...",
      "analysis.outputTitle": "Analyse-output",
      "analysis.outputIntro": "Upload een rapportscreenshot, voeg optionele context toe en importeer het rapport. Controleer daarna de gestructureerde context en voer hier de volledige CogniCheck-analyse uit.",
      "analysis.printReport": "Rapport printen",

      "requirements.pageTitle": "Van requirements naar blueprint | CogniCheck",
      "requirements.heading": "Van requirements naar blueprint",
      "requirements.hero": "Upload een stakeholderverzoek, intake-notitie of volledig requirementsdocument. CogniCheck zet dit om naar een praktische blueprint voor beslissingen, KPI's en dashboardontwerp.",
      "requirements.clarifyTitle": "Verhelder de beslissing voordat je het dashboard bouwt",
      "requirements.clarifyBody1": "Dashboardverzoeken beginnen vaak met brede woorden zoals 'strategisch', 'overzicht', 'belangrijke KPI's' of 'in control'. Deze woorden klinken duidelijk, maar kunnen verschillende aannames tussen stakeholders verbergen. CogniCheck helpt het verzoek te vertalen naar concrete beslissingen, signalen, definities en ontwerpimplicaties.",
      "requirements.clarifyBody2": "Gebruik deze flow voor een kort verzoek, ruwe meetingnotities of een volledig requirementsdocument.",
      "requirements.socraticTitle": "Waarom Socratische vragen?",
      "requirements.socraticBody": "Socrates gebruikte vragen om aannames zichtbaar te maken en vage ideeën scherper te krijgen. CogniCheck past dat principe toe op BI-requirements: het bevraagt het verzoek zodat de echte beslissing, onzekerheid en actielogica zichtbaar worden voordat ontwikkeling start.",
      "requirements.socraticNote": "Het doel is niet om het verzoek te bekritiseren. Het doel is om het beslissingsklaar te maken.",
      "requirements.looksFor": "Waar CogniCheck naar kijkt",
      "requirements.hiddenDecisions": "Verborgen beslissingen",
      "requirements.hiddenDecisionsBody": "Welke beslissing moet het dashboard, de analyse of het rapport echt ondersteunen?",
      "requirements.unclearConcepts": "Onduidelijke concepten",
      "requirements.unclearConceptsBody": "Welke termen lijken vanzelfsprekend maar hebben nog een gedeelde definitie nodig?",
      "requirements.missingSignals": "Ontbrekende signalen",
      "requirements.missingSignalsBody": "Welke risico's, drempels, trends of uitzonderingen moeten aandacht of actie triggeren?",
      "requirements.includes": "Wat de blueprint bevat",
      "requirements.include.1": "Beslissingscontext",
      "requirements.include.2": "Kernvragen voor de business",
      "requirements.include.3": "KPI- en metriclogica",
      "requirements.include.4": "Aannames om te valideren",
      "requirements.include.5": "Voorgestelde dashboardstructuur",
      "requirements.include.6": "Vervolgvragen voor stakeholders",
      "requirements.uploadTitle": "Upload je input",
      "requirements.uploadBody": "Gebruik een stakeholderverzoek, intake-notitie, interviewverslag, meetingtranscript of volledig requirementsdocument. Hoe rijker de input, hoe scherper de blueprint.",
      "requirements.generate": "Blueprint genereren",
      "requirements.generating": "Antwoord genereren...",
      "requirements.note": "Je eerste blueprint is een gespreksstarter. Gebruik hem om scope, definities en prioriteiten met stakeholders te valideren.",
      "requirements.resultTitle": "Gegenereerde blueprint",
      "requirements.invalidFile": "Upload een .txt- of .docx-bestand.",

      "methodology.title": "CogniCheck Methodologie | BI-requirements en dashboardcognitie",
      "methodology.eyebrow": "CogniCheck Methodologie",
      "methodology.heading": "Databegrip begint met begrip van mensen.",
      "methodology.subtitle": "CogniCheck combineert BI-requirements, cognitieve psychologie en beslissingsondersteuning.",
      "methodology.body": "CogniCheck is gebouwd rond een eenvoudig idee: goede BI gaat niet alleen over data tonen. Het gaat om mensen helpen complexiteit te begrijpen, verwachtingen af te stemmen en betere beslissingen te nemen.",
      "methodology.req.title": "Requirements naar Blueprint",
      "methodology.req.body": "Ga van vage dashboardverzoeken naar gestructureerde requirements, aannames, risico's en implementatierichting.",
      "methodology.req.cta": "Bekijk requirements-methodologie",
      "methodology.analysis.title": "Rapportanalyse",
      "methodology.analysis.body": "Evalueer of een rapport cognitief helder is en aansluit bij de beslissing die het moet ondersteunen.",
      "methodology.analysis.cta": "Bekijk analysemethodologie",
      "methodology.core.title": "De kernvraag van CogniCheck",
      "methodology.core.body": "Helpt deze BI-oplossing de bedoelde gebruiker om de bedoelde beslissing te nemen?",
      "methodology.tryDemo": "Probeer de demo",

      "workshop.title": "CogniCheck Workshop | Beslissingsklare BI-dashboards",
      "workshop.eyebrow": "Workshop + Tooltoegang",
      "workshop.heading": "Help je BI-team om meer beslissingsklare dashboards te bouwen.",
      "workshop.subtitle": "Een praktische CogniCheck-workshop voor teams die scherpere requirements, lagere cognitieve belasting en duidelijkere dashboardbeslissingen willen.",
      "workshop.intro": "De sessie combineert BI-consulting, cognitieve psychologie en hands-on toolgebruik. Deelnemers leren dashboardkwaliteit beoordelen vanuit de beoogde gebruiker en de beslissing die het rapport moet ondersteunen.",
      "workshop.explore": "Verken methodologie",
      "workshop.who.title": "Voor wie",
      "workshop.who.body": "BI-teams, dashboardontwikkelaars, controllers, analisten en managers die dashboardrequirements en rapportbruikbaarheid willen verbeteren.",
      "workshop.problems.title": "Welke problemen het aanpakt",
      "workshop.problems.body": "Vage verzoeken, onduidelijke KPI's, overvolle dashboards, zwakke visuele hiërarchie, conflicterende stakeholderverwachtingen en rapporten die data tonen zonder actie te ondersteunen.",
      "workshop.learn.title": "Wat deelnemers leren",
      "workshop.learn.body": "Hoe je cognitieve belasting, aandacht, groepering, werkgeheugen en beslissingsondersteuning gebruikt om BI-werk te beoordelen en verbeteren.",
      "workshop.agenda": "Voorbeeldagenda",
      "workshop.agenda.1": "Introduceer het CogniCheck-framework voor beslissingsondersteuning",
      "workshop.agenda.2": "Bespreek dashboardrequirements en verborgen aannames",
      "workshop.agenda.3": "Beoordeel een echt of voorbeeld-dashboard met cognitieve psychologie",
      "workshop.agenda.4": "Gebruik CogniCheck-tools voor requirements-naar-blueprint en rapportanalyse",
      "workshop.agenda.5": "Vertaal bevindingen naar concrete verbeteracties",
      "workshop.deliverables.title": "Deliverables",
      "workshop.deliverables.body": "Een compacte dashboardreview, geprioriteerde aanbevelingen, waar relevant een BI-blueprint en tijdelijke toegang tot CogniCheck demo-tools.",
      "workshop.formats.title": "Vormen",
      "workshop.formats.body": "Intro-workshop, teamworkshop van een halve dag, dashboardreviewpakket of betaalde pilot met tooltoegang.",
      "workshop.pricing.title": "Prijs",
      "workshop.pricing.body": "De prijs hangt af van scope, aantal dashboards en workshopvorm. Start met een korte intake om de juiste opzet te bepalen.",
      "workshop.start.title": "Start met een intake",
      "workshop.start.body": "Een korte intake is genoeg om je dashboarduitdaging, doelgroep en workshopdoel te begrijpen.",

      "privacy.title": "Privacy en dataverwerking | CogniCheck",
      "privacy.eyebrow": "Privacy",
      "privacy.heading": "Privacy en dataverwerking",
      "privacy.intro": "CogniCheck wordt gebruikt met dashboardscreenshots, requirements en businesscontext. Deze input kan gevoelig zijn, dus de workflow moet bewust worden behandeld.",
      "privacy.upload.title": "Wat geüpload kan worden",
      "privacy.upload.body": "Gebruikers kunnen dashboardscreenshots, requirementsnotities en ondersteunende contextdocumenten uploaden voor analyse.",
      "privacy.ai.title": "Hoe AI wordt gebruikt",
      "privacy.ai.body": "Geüploade content wordt naar de geconfigureerde AI-provider gestuurd om gestructureerde context, BI-blueprints en compacte CogniCheck-analyses te genereren.",
      "privacy.analytics.title": "Analytics, inputs en outputs",
      "privacy.analytics.body": "Als database-analytics zijn ingeschakeld, kan CogniCheck pageviews, analyseaantallen, login-e-mailadressen, ingediende analyse-inputs en gegenereerde LLM-outputs opslaan voor productverbetering en gebruiksanalyse.",
      "privacy.confidentiality.title": "Vertrouwelijkheid",
      "privacy.confidentiality.body": "Voor workshops of pilots moeten gevoelige dashboards en requirements alleen gedeeld worden wanneer dat passend is voor de organisatie.",
      "privacy.deletion.title": "Verwijderverzoeken",
      "privacy.deletion.body": "Voor vragen of verwijderverzoeken kun je contact opnemen met Robin via robin@cognicheck.tech.",
      "privacy.recommendation.title": "Praktische aanbeveling",
      "privacy.recommendation.body": "Gebruik voor vroege pilots waar mogelijk geanonimiseerde of representatieve dashboards. Spreek bij gevoelige productierapporten vooraf scope en omgang af.",
      "privacy.cta": "Stel een privacyvraag"
      ,
      "methodReq.title": "Requirements naar Blueprint Methodologie | CogniCheck",
      "methodReq.eyebrow": "Requirements naar Blueprint",
      "methodReq.heading": "Van vaag dashboardverzoek naar gestructureerde BI-blueprint.",
      "methodReq.intro": "Veel BI-projecten starten met verzoeken die duidelijk klinken, maar verborgen ambiguïteit bevatten. CogniCheck helpt aannames, risico's, definities en implementatiekeuzes expliciet te maken voordat ontwikkeling start.",
      "methodReq.step1.title": "Begrijp het verzoek",
      "methodReq.step1.1": "Wat wordt er gevraagd?",
      "methodReq.step1.2": "Voor wie is het rapport?",
      "methodReq.step1.3": "Welke businessvraag zit achter het verzoek?",
      "methodReq.step2.title": "Identificeer aannames",
      "methodReq.step2.1": "Wat wordt als vanzelfsprekend aangenomen?",
      "methodReq.step2.2": "Zijn definities, databronnen en verantwoordelijkheden duidelijk?",
      "methodReq.step2.3": "Wat denkt de stakeholder dat vanzelfsprekend is?",
      "methodReq.step3.title": "Verhelder beslissingscontext",
      "methodReq.step3.1": "Welke beslissing moet deze BI-oplossing ondersteunen?",
      "methodReq.step3.2": "Welke actie moet makkelijker worden?",
      "methodReq.step3.3": "Welke onzekerheid moet worden verkleind?",
      "methodReq.step4.title": "Vertaal naar BI-blueprint",
      "methodReq.step4.1": "Kernmetrics",
      "methodReq.step4.2": "Databronnen",
      "methodReq.step4.3": "Dimensies en filters",
      "methodReq.step4.4": "Security requirements",
      "methodReq.step4.5": "Performance-overwegingen",
      "methodReq.step4.6": "Risico's en open vragen",
      "methodReq.step5.title": "Gebruik de blueprint als gesprekstool",
      "methodReq.step5.1": "De blueprint is niet de definitieve waarheid.",
      "methodReq.step5.2": "Het is een gestructureerd startpunt voor stakeholderalignment.",
      "methodReq.card.title": "Goede BI begint voordat het rapport gebouwd wordt.",
      "methodReq.card.body": "CogniCheck behandelt requirements als het begin van een dialoog. Het doel is niet alleen vastleggen wat iemand vraagt, maar ontdekken wat de BI-oplossing hen moet helpen begrijpen of beslissen.",
      "methodReq.cta": "Probeer Requirements naar Blueprint",
      "methodReq.note": "Deze toolpagina is beschermd, dus niet-ingelogde gebruikers kunnen worden doorgestuurd naar login.",

      "methodAnalysis.title": "Rapportanalyse Methodologie | CogniCheck",
      "methodAnalysis.eyebrow": "Rapportanalyse",
      "methodAnalysis.heading": "Helpt dit rapport de gebruiker om de bedoelde beslissing te nemen?",
      "methodAnalysis.intro": "Een dashboard kan er professioneel uitzien en toch falen als beslissingsondersteuning. CogniCheck evalueert rapporten met cognitieve psychologie, visuele perceptie en BI-consultingprincipes.",
      "methodAnalysis.step1.title": "Context eerst",
      "methodAnalysis.step1.1": "Wie gebruikt het rapport?",
      "methodAnalysis.step1.2": "Welke beslissing moet het ondersteunen?",
      "methodAnalysis.step1.3": "Hoe vaak wordt het gebruikt?",
      "methodAnalysis.step1.4": "Welke businesscontext is belangrijk?",
      "methodAnalysis.step2.title": "Cognitieve belasting",
      "methodAnalysis.step2.1": "Hoeveel onnodige mentale inspanning veroorzaakt het rapport?",
      "methodAnalysis.step2.2": "Zijn er te veel concurrerende signalen?",
      "methodAnalysis.step2.3": "Moet de gebruiker betekenis mentaal reconstrueren?",
      "methodAnalysis.step3.title": "Psychologische lens",
      "methodAnalysis.step3.body": "Gebruik alleen de meest relevante concepten voor elk rapport:",
      "methodAnalysis.step3.1": "Aandacht",
      "methodAnalysis.step3.2": "Gestalt-groepering",
      "methodAnalysis.step3.3": "Werkgeheugen",
      "methodAnalysis.step3.4": "Cognitieve belasting",
      "methodAnalysis.step3.5": "Zichtbaarheid van verandering",
      "methodAnalysis.step3.6": "Mentale reconstructie",
      "methodAnalysis.step4.title": "Beslissingsondersteuning",
      "methodAnalysis.step4.1": "Is de relevante informatie aanwezig?",
      "methodAnalysis.step4.2": "Is de beslissingslogica zichtbaar?",
      "methodAnalysis.step4.3": "Kan de gebruiker zien of actie nodig is?",
      "methodAnalysis.step4.4": "Beweegt het rapport van data naar beslissing?",
      "methodAnalysis.step5.title": "Praktische aanbevelingen",
      "methodAnalysis.step5.1": "Wat moet veranderen?",
      "methodAnalysis.step5.2": "Waarom is dat belangrijk?",
      "methodAnalysis.step5.3": "Wat is de verbetering met de meeste impact?",
      "methodAnalysis.card.title": "Visuele polish is niet hetzelfde als beslissingsklaarheid.",
      "methodAnalysis.card.body": "CogniCheck maakt onderscheid tussen informatierelevantie en beslissingsklaarheid. Een rapport kan nuttige informatie bevatten maar nog steeds te veel interpretatie vragen voordat het actie ondersteunt.",
      "methodAnalysis.cta": "Probeer Rapportanalyse",
      "methodAnalysis.note": "Deze toolpagina is beschermd, dus niet-ingelogde gebruikers kunnen worden doorgestuurd naar login."
    },
    English: {
      "nav.workshop": "Workshop",
      "nav.methodology": "Methodology",
      "nav.goToCogniCheck": "Go to CogniCheck",
      "nav.about": "About",
      "nav.privacy": "Privacy",
      "nav.contact": "Contact",
      "nav.bookIntake": "Book an intake",
      "nav.demoHome": "Demo Home",
      "nav.reportAnalysis": "Report Analysis",
      "nav.requirementsBlueprint": "Requirements to Blueprint",
      "nav.logout": "Logout",
      "nav.languageLabel": "Language",

      "common.outputLanguage": "Output language",
      "common.english": "English",
      "common.dutch": "Nederlands",
      "common.loading": "Loading...",
      "common.tryAgain": "Please try again.",

      "demo.title": "CogniCheck Demo",
      "demo.eyebrow": "CogniCheck Demo",
      "demo.heading": "Welcome to the CogniCheck demo",
      "demo.intro": "Choose where you want to start. CogniCheck currently supports report analysis and requirements-to-blueprint generation, both based on a decision-support methodology.",
      "demo.card.analysis.title": "Analyze a BI report",
      "demo.card.analysis.body": "Upload a dashboard screenshot, add context, review structured fields and receive a concise CogniCheck analysis focused on cognitive load and decision alignment.",
      "demo.card.analysis.cta": "Start report analysis",
      "demo.card.blueprint.title": "Turn requirements into a BI blueprint",
      "demo.card.blueprint.body": "Paste or upload dashboard requirements and receive a structured blueprint with key requirements, assumptions, risks and implementation direction.",
      "demo.card.blueprint.cta": "Start blueprint",
      "demo.card.method.title": "Explore the CogniCheck method",
      "demo.card.method.body": "Learn how CogniCheck uses cognitive psychology, requirements thinking and decision-support logic to evaluate BI work.",
      "demo.card.method.cta": "View methodology",
      "demo.flow.title": "Recommended demo flow",
      "demo.flow.1": "Read the methodology",
      "demo.flow.2": "Try Requirements to Blueprint",
      "demo.flow.3": "Try Report Analysis with context",
      "demo.flow.4": "Compare the recommendations with your own BI design judgment",

      "analysis.pageTitle": "Report Analysis Demo | CogniCheck",
      "analysis.heading": "CogniCheck Analysis",
      "analysis.uploadLabel": "Upload report screenshot",
      "analysis.dropzone": "Upload or drop a screenshot",
      "analysis.dropzoneSmall": "or click to choose a file",
      "analysis.supportingLabel": "Upload supporting files",
      "analysis.supportingHelp": "Optional: upload requirements, notes, KPI definitions or other context documents. TXT files are read directly. PDF and DOCX support is experimental and sent to the AI as attachments. XLSX is not supported yet.",
      "analysis.contextLabel": "Background context",
      "analysis.contextPlaceholder": "Describe the report, audience, purpose, decisions supported, KPI definitions, known concerns, or anything else that may help CogniCheck understand the report.\n\nExample:\nMonthly finance dashboard for business controllers. Used during monthly management meetings to monitor budget deviations and decide whether corrective action is needed.",
      "analysis.importButton": "Import report",
      "analysis.importing": "Importing report...",
      "analysis.structuredNote": "CogniCheck has drafted structured report context from the screenshot and any information you provided. Please review and correct these fields before running the full analysis.",
      "analysis.analyzeButton": "Perform CogniCheck Analysis",
      "analysis.analyzing": "Analyzing...",
      "analysis.outputTitle": "Analysis output",
      "analysis.outputIntro": "Upload a report screenshot, add optional context, then import the report. After reviewing the structured context, run the full CogniCheck analysis here.",
      "analysis.printReport": "Print Report",

      "requirements.pageTitle": "From requirements to blueprint | CogniCheck",
      "requirements.heading": "From requirements to blueprint",
      "requirements.hero": "Upload a stakeholder request, intake note or full requirements document. CogniCheck turns it into a practical blueprint for decisions, KPIs and dashboard design.",
      "requirements.clarifyTitle": "Clarify the decision before building the dashboard",
      "requirements.clarifyBody1": "Dashboard requests often start with broad words like 'strategic', 'overview', 'important KPIs' or 'in control'. These words sound clear, but they can hide different assumptions across stakeholders. CogniCheck helps translate the request into concrete decisions, signals, definitions and design implications.",
      "requirements.clarifyBody2": "Use this flow for a short request, rough meeting notes or a complete requirements document.",
      "requirements.socraticTitle": "Why Socratic questioning?",
      "requirements.socraticBody": "Socrates used questions to expose assumptions and sharpen vague ideas. CogniCheck applies that principle to BI requirements: it questions the request so the real decision, uncertainty and action logic become visible before development starts.",
      "requirements.socraticNote": "The goal is not to criticize the request. The goal is to make it decision-ready.",
      "requirements.looksFor": "What CogniCheck looks for",
      "requirements.hiddenDecisions": "Hidden decisions",
      "requirements.hiddenDecisionsBody": "Which decision should the dashboard, analysis or report actually support?",
      "requirements.unclearConcepts": "Unclear concepts",
      "requirements.unclearConceptsBody": "Which terms sound obvious but still need a shared definition?",
      "requirements.missingSignals": "Missing signals",
      "requirements.missingSignalsBody": "Which risks, thresholds, trends or exceptions should trigger attention or action?",
      "requirements.includes": "What the blueprint includes",
      "requirements.include.1": "Decision context",
      "requirements.include.2": "Core business questions",
      "requirements.include.3": "KPI and metric logic",
      "requirements.include.4": "Assumptions to validate",
      "requirements.include.5": "Suggested dashboard structure",
      "requirements.include.6": "Follow-up questions for stakeholders",
      "requirements.uploadTitle": "Upload your input",
      "requirements.uploadBody": "Use a stakeholder request, intake note, interview summary, meeting transcript or full requirements document. The richer the input, the sharper the blueprint.",
      "requirements.generate": "Generate blueprint",
      "requirements.generating": "Generating response...",
      "requirements.note": "Your first blueprint is a conversation starter. Use it to validate scope, definitions and priorities with stakeholders.",
      "requirements.resultTitle": "Generated blueprint",
      "requirements.invalidFile": "Please upload a .txt or .docx file.",

      "methodology.title": "CogniCheck Methodology | BI requirements and dashboard cognition",
      "methodology.eyebrow": "CogniCheck Methodology",
      "methodology.heading": "Data understanding starts with understanding people.",
      "methodology.subtitle": "CogniCheck combines BI requirements thinking, cognitive psychology and decision-support logic.",
      "methodology.body": "CogniCheck is built around a simple idea: good BI is not only about showing data. It is about helping people understand complexity, align expectations and make better decisions.",
      "methodology.req.title": "Requirements to Blueprint",
      "methodology.req.body": "Move from vague dashboard requests to structured requirements, assumptions, risks and implementation direction.",
      "methodology.req.cta": "View requirements methodology",
      "methodology.analysis.title": "Report Analysis",
      "methodology.analysis.body": "Evaluate whether a report is cognitively clear and aligned with the decision it should support.",
      "methodology.analysis.cta": "View analysis methodology",
      "methodology.core.title": "The core CogniCheck question",
      "methodology.core.body": "Does this BI solution help the intended user make the intended decision?",
      "methodology.tryDemo": "Try the demo",

      "workshop.title": "CogniCheck Workshop | Decision-ready BI dashboards",
      "workshop.eyebrow": "Workshop + Tool Access",
      "workshop.heading": "Help your BI team build more decision-ready dashboards.",
      "workshop.subtitle": "A practical CogniCheck workshop for teams that want sharper requirements, lower cognitive load and clearer dashboard decisions.",
      "workshop.intro": "The session combines BI consulting, cognitive psychology and hands-on tool use. Participants learn how to evaluate dashboard quality from the perspective of the intended user and the decision the report should support.",
      "workshop.explore": "Explore methodology",
      "workshop.who.title": "Who it is for",
      "workshop.who.body": "BI teams, dashboard developers, controllers, analysts and managers who want to improve dashboard requirements and report usefulness.",
      "workshop.problems.title": "Problems it addresses",
      "workshop.problems.body": "Vague requests, unclear KPIs, overloaded dashboards, weak visual hierarchy, conflicting stakeholder expectations and reports that show data without supporting action.",
      "workshop.learn.title": "What participants learn",
      "workshop.learn.body": "How to use cognitive load, attention, grouping, working memory and decision alignment to judge and improve BI work.",
      "workshop.agenda": "Example agenda",
      "workshop.agenda.1": "Introduce the CogniCheck decision-support framework",
      "workshop.agenda.2": "Discuss dashboard requirements and hidden assumptions",
      "workshop.agenda.3": "Review a real or sample dashboard using cognitive psychology",
      "workshop.agenda.4": "Use CogniCheck tools for requirements-to-blueprint and report analysis",
      "workshop.agenda.5": "Translate findings into concrete improvement actions",
      "workshop.deliverables.title": "Deliverables",
      "workshop.deliverables.body": "A concise dashboard review, prioritized recommendations, a BI blueprint where relevant and temporary access to CogniCheck demo tools.",
      "workshop.formats.title": "Formats",
      "workshop.formats.body": "Intro workshop, half-day team workshop, dashboard review package or paid pilot with tool access.",
      "workshop.pricing.title": "Pricing",
      "workshop.pricing.body": "Pricing depends on scope, number of dashboards and workshop format. Start with a short intake to define the right setup.",
      "workshop.start.title": "Start with an intake",
      "workshop.start.body": "A short intake is enough to understand your dashboard challenge, audience and workshop goal.",

      "privacy.title": "Privacy and Data Handling | CogniCheck",
      "privacy.eyebrow": "Privacy",
      "privacy.heading": "Privacy and data handling",
      "privacy.intro": "CogniCheck is used with dashboard screenshots, requirements and business context. These inputs can be sensitive, so the workflow should be handled deliberately.",
      "privacy.upload.title": "What may be uploaded",
      "privacy.upload.body": "Users may upload dashboard screenshots, requirements notes and supporting context documents for analysis.",
      "privacy.ai.title": "How AI is used",
      "privacy.ai.body": "Uploaded content is sent to the configured AI provider to generate structured context, BI blueprints and concise CogniCheck analyses.",
      "privacy.analytics.title": "Analytics, inputs and outputs",
      "privacy.analytics.body": "If database analytics are enabled, CogniCheck may store page views, analysis counts, login email addresses, submitted analysis inputs and generated LLM outputs for product improvement and usage-pattern review.",
      "privacy.confidentiality.title": "Confidentiality",
      "privacy.confidentiality.body": "For workshops or pilots, sensitive dashboards and requirements should be shared only when appropriate for the organization.",
      "privacy.deletion.title": "Deletion requests",
      "privacy.deletion.body": "For questions or deletion requests, contact Robin at robin@cognicheck.tech.",
      "privacy.recommendation.title": "Practical recommendation",
      "privacy.recommendation.body": "For early pilots, use anonymized or representative dashboards where possible. For sensitive production reports, agree on scope and handling before the workshop starts.",
      "privacy.cta": "Ask a privacy question"
      ,
      "methodReq.title": "Requirements to Blueprint Methodology | CogniCheck",
      "methodReq.eyebrow": "Requirements to Blueprint",
      "methodReq.heading": "From vague dashboard request to structured BI blueprint.",
      "methodReq.intro": "Many BI projects start with requests that sound clear but contain hidden ambiguity. CogniCheck helps make assumptions, risks, definitions and implementation choices explicit before development starts.",
      "methodReq.step1.title": "Understand the request",
      "methodReq.step1.1": "What is being asked?",
      "methodReq.step1.2": "Who is the report for?",
      "methodReq.step1.3": "What business question is behind the request?",
      "methodReq.step2.title": "Identify assumptions",
      "methodReq.step2.1": "What is being taken for granted?",
      "methodReq.step2.2": "Are definitions, data sources and responsibilities clear?",
      "methodReq.step2.3": "What does the stakeholder think is obvious?",
      "methodReq.step3.title": "Clarify decision context",
      "methodReq.step3.1": "What decision should this BI solution support?",
      "methodReq.step3.2": "What action should become easier?",
      "methodReq.step3.3": "What uncertainty should be reduced?",
      "methodReq.step4.title": "Translate to BI blueprint",
      "methodReq.step4.1": "Key metrics",
      "methodReq.step4.2": "Data sources",
      "methodReq.step4.3": "Dimensions and filters",
      "methodReq.step4.4": "Security requirements",
      "methodReq.step4.5": "Performance considerations",
      "methodReq.step4.6": "Risks and open questions",
      "methodReq.step5.title": "Use the blueprint as conversation tool",
      "methodReq.step5.1": "The blueprint is not the final truth.",
      "methodReq.step5.2": "It is a structured starting point for stakeholder alignment.",
      "methodReq.card.title": "Good BI starts before the report is built.",
      "methodReq.card.body": "CogniCheck treats requirements as the beginning of a dialogue. The goal is not only to document what someone asked for, but to uncover what the BI solution must help them understand or decide.",
      "methodReq.cta": "Try Requirements to Blueprint",
      "methodReq.note": "This tool page is protected, so unauthenticated users may be redirected to login.",

      "methodAnalysis.title": "Report Analysis Methodology | CogniCheck",
      "methodAnalysis.eyebrow": "Report Analysis",
      "methodAnalysis.heading": "Does this report help the user make the intended decision?",
      "methodAnalysis.intro": "A dashboard can look professional and still fail as decision support. CogniCheck evaluates reports through cognitive psychology, visual perception and BI consulting principles.",
      "methodAnalysis.step1.title": "Context first",
      "methodAnalysis.step1.1": "Who uses the report?",
      "methodAnalysis.step1.2": "What decision should it support?",
      "methodAnalysis.step1.3": "How often is it used?",
      "methodAnalysis.step1.4": "What business context matters?",
      "methodAnalysis.step2.title": "Cognitive load",
      "methodAnalysis.step2.1": "How much unnecessary mental effort does the report create?",
      "methodAnalysis.step2.2": "Are there too many competing signals?",
      "methodAnalysis.step2.3": "Does the user need to mentally reconstruct meaning?",
      "methodAnalysis.step3.title": "Psychological lens",
      "methodAnalysis.step3.body": "Use only the most relevant concepts for each report:",
      "methodAnalysis.step3.1": "Attention",
      "methodAnalysis.step3.2": "Gestalt grouping",
      "methodAnalysis.step3.3": "Working memory",
      "methodAnalysis.step3.4": "Cognitive load",
      "methodAnalysis.step3.5": "Change visibility",
      "methodAnalysis.step3.6": "Mental reconstruction",
      "methodAnalysis.step4.title": "Decision alignment",
      "methodAnalysis.step4.1": "Is the relevant information present?",
      "methodAnalysis.step4.2": "Is the decision logic visible?",
      "methodAnalysis.step4.3": "Can the user see whether action is needed?",
      "methodAnalysis.step4.4": "Does the report move from data to decision?",
      "methodAnalysis.step5.title": "Practical recommendations",
      "methodAnalysis.step5.1": "What should change?",
      "methodAnalysis.step5.2": "Why does it matter?",
      "methodAnalysis.step5.3": "What is the highest-leverage improvement?",
      "methodAnalysis.card.title": "Visual polish is not the same as decision readiness.",
      "methodAnalysis.card.body": "CogniCheck distinguishes between information relevance and decision readiness. A report can contain useful information but still require too much interpretation before it supports action.",
      "methodAnalysis.cta": "Try Report Analysis",
      "methodAnalysis.note": "This tool page is protected, so unauthenticated users may be redirected to login."
    }
  };

  function normalizeLanguage(language) {
    if (language === "Nederlands") return "Dutch";
    return languages.has(language) ? language : defaultLanguage;
  }

  function getLanguage() {
    return normalizeLanguage(localStorage.getItem(storageKey) || defaultLanguage);
  }

  function setLanguage(language) {
    const normalizedLanguage = normalizeLanguage(language);
    localStorage.setItem(storageKey, normalizedLanguage);
    applyTranslations();
    window.dispatchEvent(new CustomEvent("cognicheck:languagechange", {
      detail: { language: normalizedLanguage }
    }));
  }

  function t(key, fallback = "") {
    const language = getLanguage();
    return translations[language]?.[key] || translations.English?.[key] || fallback || key;
  }

  function applyTranslations(root = document) {
    const language = getLanguage();
    document.documentElement.lang = language === "Dutch" ? "nl" : "en";

    root.querySelectorAll("[data-i18n]").forEach(element => {
      element.textContent = t(element.dataset.i18n, element.textContent);
    });

    root.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
      element.placeholder = t(element.dataset.i18nPlaceholder, element.placeholder);
    });

    root.querySelectorAll("[data-i18n-title]").forEach(element => {
      element.title = t(element.dataset.i18nTitle, element.title);
    });

    root.querySelectorAll("[data-i18n-document-title]").forEach(element => {
      document.title = t(element.dataset.i18nDocumentTitle, document.title);
    });

    syncLanguageSelectors(root);
  }

  function syncLanguageSelectors(root = document) {
    root.querySelectorAll("[data-language-selector]").forEach(selector => {
      selector.value = getLanguage();
    });
  }

  function languageCode() {
    return getLanguage() === "Dutch" ? "nl" : "en";
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyTranslations();
    document.addEventListener("change", event => {
      if (event.target.matches("[data-language-selector]")) {
        setLanguage(event.target.value);
      }
    });
  });

  return {
    applyTranslations,
    getLanguage,
    languageCode,
    setLanguage,
    t
  };
})();

window.CogniCheckI18n = CogniCheckI18n;

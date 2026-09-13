//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "all": {
    en: "All",
    it: "Tutte",
  },
  "campaign": {
    en: "Campaign",
    it: "Campagna",
  },
  "cancel": {
    en: "Cancel",
    it: "Annulla",
  },
  "core": {
    en: "Core",
    it: "Core",
  },
  "create": {
    en: "Create",
    it: "Crea",
  },
  "dependencies.continue": {
    en: "Continue without downloading",
    it: "Continua senza scaricare",
  },
  "dependencies.continue_description": {
    en: "Continuing without these sources may leave references, options, and related content unavailable.",
    it: "Continuando senza queste fonti, riferimenti, opzioni e contenuti correlati potrebbero non essere disponibili.",
  },
  "dependencies.description": {
    en: "<1> references additional sources that are not installed on this device.",
    it: "<1> fa riferimento a fonti aggiuntive che non sono installate su questo dispositivo.",
  },
  "dependencies.download": {
    en: "Download dependencies",
    it: "Scarica dipendenze",
  },
  "dependencies.missing": {
    en: "Missing local sources",
    it: "Fonti locali mancanti",
  },
  "dependencies.missing_description": {
    en: "These sources are not in the repository, so they cannot be downloaded automatically.",
    it: "Queste fonti non sono nell'archivio e non possono essere scaricate automaticamente.",
  },
  "dependencies.repository": {
    en: "Repository sources",
    it: "Fonti dell'archivio",
  },
  "dependencies.title": {
    en: "Additional sources",
    it: "Fonti aggiuntive",
  },
  "download": {
    en: "Download",
    it: "Scarica",
  },
  "empty": {
    en: "No sources found",
    it: "Nessuna fonte trovata",
  },
  "error.create": {
    en: "The source could not be created.",
    it: "La fonte non può essere creata.",
  },
  "error.create_required": {
    en: "Name and code are required.",
    it: "Nome e codice sono obbligatori.",
  },
  "error.download": {
    en: "The source could not be downloaded.",
    it: "La fonte non può essere scaricata.",
  },
  "error.export": {
    en: "The selected source could not be exported.",
    it: "La fonte selezionata non può essere esportata.",
  },
  "error.import": {
    en: "The selected file is not a valid source JSON.",
    it: "Il file selezionato non è una fonte JSON valida.",
  },
  "error.make_local": {
    en: "The source could not be made local.",
    it: "La fonte non può essere resa locale.",
  },
  "error.publish": {
    en: "The source could not be published.",
    it: "La fonte non può essere pubblicata.",
  },
  "error.register": {
    en: "The source could not be registered.",
    it: "La fonte non può essere registrata.",
  },
  "error.remove": {
    en: "The selected source could not be removed.",
    it: "La fonte selezionata non può essere rimossa.",
  },
  "export": {
    en: "Export",
    it: "Esporta",
  },
  "export.description": {
    en: "Export <1> as a JSON source bundle.",
    it: "Esporta <1> come fonte JSON.",
  },
  "export.include_private": {
    en: "Include private resources",
    it: "Includi risorse private",
  },
  "import": {
    en: "Import",
    it: "Importa",
  },
  "make_local": {
    en: "Make local",
    it: "Rendi locale",
  },
  "make_local.confirm": {
    en: "Make <1> local? It will no longer receive registry updates on this device.",
    it: "Rendere <1> locale? Non riceverà più aggiornamenti dal registro su questo dispositivo.",
  },
  "make_official": {
    en: "Make official",
    it: "Rendi ufficiale",
  },
  "make_official.confirm": {
    en: "Download the official version of <1> and replace the local source? Local changes will be lost.",
    it: "Scaricare la versione ufficiale di <1> e sostituire la fonte locale? Le modifiche locali andranno perse.",
  },
  "module": {
    en: "Module",
    it: "Modulo",
  },
  "my_sources": {
    en: "My Sources",
    it: "Le Mie Fonti",
  },
  "publish": {
    en: "Publish",
    it: "Pubblica",
  },
  "readonly": {
    en: "Read-only",
    it: "Sola lettura",
  },
  "register": {
    en: "Register",
    it: "Registra",
  },
  "registry_unavailable": {
    en: "The registry is currently unavailable.",
    it: "Il registro non è attualmente disponibile.",
  },
  "remove": {
    en: "Remove",
    it: "Rimuovi",
  },
  "remove.confirm_action": {
    en: "Remove source",
    it: "Rimuovi fonte",
  },
  "remove.dependents": {
    en: "Sources that depend on it",
    it: "Fonti che dipendono da essa",
  },
  "remove.dependents_description": {
    en: "Removing this source may make content from these sources unavailable.",
    it: "La rimozione di questa fonte potrebbe rendere non disponibili i contenuti di queste fonti.",
  },
  "remove.description": {
    en: "Remove <1> from this device?",
    it: "Rimuovere <1> da questo dispositivo?",
  },
  "remove.irreversible": {
    en: "This action cannot be undone.",
    it: "Questa azione non può essere annullata.",
  },
  "remove.title": {
    en: "Remove source",
    it: "Rimuovi fonte",
  },
  "repository": {
    en: "Repository",
    it: "Archivio",
  },
  "settings": {
    en: "Settings",
    it: "Impostazioni",
  },
  "status.available": {
    en: "Not installed",
    it: "Non installato",
  },
  "status.detached": {
    en: "Local copy",
    it: "Copia locale",
  },
  "status.installed": {
    en: "Installed",
    it: "Installato",
  },
  "status.local": {
    en: "Local",
    it: "Locale",
  },
  "status.update": {
    en: "Update available",
    it: "Aggiornamento disponibile",
  },
  "subtitle": {
    en: "Download, import, and create sources",
    it: "Scarica, importa e crea fonti",
  },
  "title": {
    en: "Sources",
    it: "Fonti",
  },
} as const;

export default i18nContext;

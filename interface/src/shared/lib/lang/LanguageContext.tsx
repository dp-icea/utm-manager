import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "pt";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    "header.title": "BR-UTM Manager",
    "header.subtitle": "UTM Traffic Control System",
    "header.droneMapping": "Drone Mapping",
    "header.logout": "Logout",

    // Sidebar
    "sidebar.addStrip": "Add Strip",
    "sidebar.sort": "Sort",
    "sidebar.sortById": "Sorted by ID",
    "sidebar.sortActiveFirst": "Active First",
    "sidebar.filters": "Filters",
    "sidebar.flightStrips": "Flight Strips",
    "sidebar.noStrips": "No flight strips to display",
    "sidebar.selected": "selected",
    "sidebar.deselectAll": "Deselect All",

    // Filters
    "filters.flightArea": "Flight Area",
    "filters.flightAreaPlaceholder": "Select flight areas",
    "filters.allAreas": "All Areas",
    "filters.status": "Status",
    "filters.all": "All",
    "filters.activeOnly": "Active Only",
    "filters.inactiveOnly": "Inactive Only",
    "filters.startTime": "Start Time",
    "filters.endTime": "End Time",

    // Flight Strip
    "strip.height": "Height",
    "strip.takeoffSpace": "Takeoff Space",
    "strip.landingSpace": "Landing Space",
    "strip.takeoffTime": "Takeoff Time",
    "strip.landingTime": "Landing Time",
    "strip.description": "Description",

    // Dialogs
    "dialog.addStrip": "Add Flight Strip",
    "dialog.editStrip": "Edit Flight Strip",
    "dialog.confirmDelete": "Confirm Deletion",
    "dialog.deleteMessage": "Are you sure you want to delete flight strip",
    "dialog.deleteWarning": "This action cannot be undone.",
    "dialog.cancel": "Cancel",
    "dialog.delete": "Delete",

    // Snackbar messages
    "snackbar.stripAdded": "Flight strip added",
    "snackbar.stripRemoved": "Strip {{id}} has been removed",
    "snackbar.stripUpdated": "Strip {{id}} updated successfully",
    "snackbar.stripActive": "Strip {{id}} marked as active",
    "snackbar.stripInactive": "Strip {{id}} marked as inactive",
    "snackbar.stripsMovedTogether": "{{count}} strips moved together",

    // Drone Mapping
    "droneMapping.title": "Drone Mapping",
    "droneMapping.back": "Back to Dashboard",
    "droneMapping.id": "ID",
    "droneMapping.serialNumber": "Serial Number",
    "droneMapping.sisant": "SISANT",
    "droneMapping.addRow": "Add Row",
    "droneMapping.uploadCSV": "Upload CSV",
    "droneMapping.save": "Save",
    "droneMapping.cancel": "Cancel",
    "droneMapping.saved": "Drone mappings saved successfully",
  },
  pt: {
    // Header
    "header.title": "BR-UTM Manager",
    "header.subtitle": "Sistema de Controle de Tráfego UTM",
    "header.droneMapping": "Mapeamento de Drones",
    "header.logout": "Sair",

    // Sidebar
    "sidebar.addStrip": "Adicionar Tira",
    "sidebar.sort": "Ordenar",
    "sidebar.sortById": "Ordenado por ID",
    "sidebar.sortActiveFirst": "Ativos Primeiro",
    "sidebar.filters": "Filtros",
    "sidebar.flightStrips": "Tiras de Voo",
    "sidebar.noStrips": "Nenhuma tira de voo para exibir",
    "sidebar.selected": "selecionado(s)",
    "sidebar.deselectAll": "Desmarcar Todos",

    // Filters
    "filters.flightArea": "Área de Voo",
    "filters.flightAreaPlaceholder": "Selecione áreas de voo",
    "filters.allAreas": "Todas as Áreas",
    "filters.status": "Status",
    "filters.all": "Todos",
    "filters.activeOnly": "Apenas Ativos",
    "filters.inactiveOnly": "Apenas Inativos",
    "filters.startTime": "Hora de Início",
    "filters.endTime": "Hora de Fim",

    // Flight Strip
    "strip.height": "Altura",
    "strip.takeoffSpace": "Espaço de Decolagem",
    "strip.landingSpace": "Espaço de Pouso",
    "strip.takeoffTime": "Hora de Decolagem",
    "strip.landingTime": "Hora de Pouso",
    "strip.description": "Descrição",

    // Dialogs
    "dialog.addStrip": "Adicionar Tira de Voo",
    "dialog.editStrip": "Editar Tira de Voo",
    "dialog.confirmDelete": "Confirmar Exclusão",
    "dialog.deleteMessage": "Tem certeza de que deseja excluir a tira de voo",
    "dialog.deleteWarning": "Esta ação não pode ser desfeita.",
    "dialog.cancel": "Cancelar",
    "dialog.delete": "Excluir",

    // Snackbar messages
    "snackbar.stripAdded": "Tira de voo adicionada",
    "snackbar.stripRemoved": "Tira {{id}} foi removida",
    "snackbar.stripUpdated": "Tira {{id}} atualizada com sucesso",
    "snackbar.stripActive": "Tira {{id}} marcada como ativa",
    "snackbar.stripInactive": "Tira {{id}} marcada como inativa",
    "snackbar.stripsMovedTogether": "{{count}} tiras movidas juntas",

    // Drone Mapping
    "droneMapping.title": "Mapeamento de Drones",
    "droneMapping.back": "Voltar ao Painel",
    "droneMapping.id": "ID",
    "droneMapping.serialNumber": "Número de Série",
    "droneMapping.sisant": "SISANT",
    "droneMapping.addRow": "Adicionar Linha",
    "droneMapping.uploadCSV": "Carregar CSV",
    "droneMapping.save": "Salvar",
    "droneMapping.cancel": "Cancelar",
    "droneMapping.saved": "Mapeamentos de drones salvos com sucesso",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return saved === "pt" || saved === "en" ? saved : "en";
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string, replacements?: Record<string, string | number>) => {
    let text = translations[language][key] || key;

    // Handle replacements like {{id}} or {{count}}
    if (replacements) {
      Object.entries(replacements).forEach(([key, value]) => {
        text = text.replace(`{{${key}}}`, String(value));
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: handleSetLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

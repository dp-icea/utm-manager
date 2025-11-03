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
    "droneMapping.configuration": "Drone Mapping Configuration",
    "droneMapping.mappings": "Drone Mappings",
    "droneMapping.csvFormat": "CSV format: Id, Serial Number, SISANT (with or without header row)",
    "droneMapping.idName": "ID / Name",
    "droneMapping.serialNumberSN": "Serial Number (SN)",
    "droneMapping.sisantNumber": "SISANT Number",
    "droneMapping.actions": "Actions",
    "droneMapping.enterIdName": "Enter ID or Name",
    "droneMapping.enterSerialNumber": "Enter Serial Number",
    "droneMapping.enterSisant": "Enter SISANT",
    "droneMapping.loadedFromCSV": "Loaded {{count}} drone mappings from CSV",
    "droneMapping.noValidData": "No valid data found in CSV file",
    "droneMapping.csvParseError": "Failed to parse CSV file",
    "droneMapping.addAtLeastOne": "Please add at least one drone mapping",

    // Login
    "login.title": "BR-UTM Manager",
    "login.subtitle": "Sign in to access the drone management system",
    "login.username": "Username",
    "login.password": "Password",
    "login.signIn": "Sign In",
    "login.signingIn": "Signing in...",
    "login.success": "Login Successful",
    "login.welcomeMessage": "Welcome to the BR-UTM monitoring system",
    "login.failed": "Login Failed",
    "login.invalidCredentials": "Invalid username or password",

    // Not Found
    "notFound.title": "404",
    "notFound.message": "Oops! Page not found",
    "notFound.returnHome": "Return to Home",

    // Common
    "common.close": "Close",
    "common.english": "English",
    "common.portuguese": "Português",
    "common.3dMode": "3D Mode",
    "common.2dMode": "2D Mode",
    "common.centerCamera": "Center Camera",
    "common.confirm": "Confirm",
    "common.confirmDeletion": "Confirm Deletion",
    "common.confirmStatusChange": "Confirm Status Change",
    "common.deleteConfirmMessage": "Are you sure you want to delete flight strip {{id}}? This action cannot be undone.",
    "common.statusChangeMessage": "Are you sure you want to mark this flight strip as {{status}}?",
    "common.active": "active",
    "common.inactive": "inactive",
    "common.flightArea": "Flight Area",
    "common.id": "ID",

    // Constraints
    "constraints.confirmCreation": "Confirm Constraint Creation",
    "constraints.confirmMessage": "Are you sure you want to create a constraint? The constraint will be placed at",
    "constraints.ieav": "Instituto de Estudos Avançados (IEAv)",
    "constraints.duration": "and will last for",
    "constraints.minutes": "3 minutes",

    // Sidebar Panel
    "sidebar.addStripButton": "Add Strip",
    "sidebar.sortButton": "Sort",
    "sidebar.sortedById": "Sorted by ID",
    "sidebar.activeFirst": "Active First",
    "sidebar.filtersButton": "Filters",
    "sidebar.flightStripsCount": "Flight Strips ({{count}})",
    "sidebar.noFlightStrips": "No flight strips to display",
    "sidebar.addFlightStripDialog": "Add Flight Strip",
    "sidebar.editFlightStripDialog": "Edit Flight Strip",
    "sidebar.confirmButton": "Confirm",
    "sidebar.failAddStrip": "Failed to add flight strip",
    "sidebar.failUpdateStrip": "Failed to update flight strip",
    "sidebar.failRemoveStrip": "Failed to remove strip {{name}}",
    "sidebar.failLoadStrips": "Failed to load flight strips",
    "sidebar.stripMarkedAs": "Strip {{name}} marked as {{status}}",
    "sidebar.stripUpdated": "Strip {{name}} updated successfully",
    "sidebar.stripRemoved": "Strip {{name}} has been removed",

    // Flight Strip Card
    "flightStrip.takeoff": "Takeoff",
    "flightStrip.landing": "Landing",
    "flightStrip.depart": "Depart",
    "flightStrip.arrive": "Arrive",
    "flightStrip.height": "Height",
    "flightStrip.description": "Description",

    // Add Flight Strip Form
    "addStrip.height": "Height (m)",
    "addStrip.takeoffSpace": "Takeoff Space",
    "addStrip.landingSpace": "Landing Space",
    "addStrip.description": "Description",
    "addStrip.descriptionPlaceholder": "Add a comment or note...",
    "addStrip.takeoffTime": "Takeoff Time",
    "addStrip.landingTime": "Landing Time",
    "addStrip.addFlightStrip": "Add Flight Strip",
    "addStrip.saveChanges": "Save Changes",
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
    "droneMapping.configuration": "Configuração de Mapeamento de Drones",
    "droneMapping.mappings": "Mapeamentos de Drones",
    "droneMapping.csvFormat": "Formato CSV: Id, Número de Série, SISANT (com ou sem linha de cabeçalho)",
    "droneMapping.idName": "ID / Nome",
    "droneMapping.serialNumberSN": "Número de Série (SN)",
    "droneMapping.sisantNumber": "Número SISANT",
    "droneMapping.actions": "Ações",
    "droneMapping.enterIdName": "Digite ID ou Nome",
    "droneMapping.enterSerialNumber": "Digite Número de Série",
    "droneMapping.enterSisant": "Digite SISANT",
    "droneMapping.loadedFromCSV": "{{count}} mapeamentos de drones carregados do CSV",
    "droneMapping.noValidData": "Nenhum dado válido encontrado no arquivo CSV",
    "droneMapping.csvParseError": "Falha ao analisar arquivo CSV",
    "droneMapping.addAtLeastOne": "Por favor, adicione pelo menos um mapeamento de drone",

    // Login
    "login.title": "BR-UTM Manager",
    "login.subtitle": "Entre para acessar o sistema de gerenciamento de drones",
    "login.username": "Nome de usuário",
    "login.password": "Senha",
    "login.signIn": "Entrar",
    "login.signingIn": "Entrando...",
    "login.success": "Login realizado com sucesso",
    "login.welcomeMessage": "Bem-vindo ao sistema de monitoramento BR-UTM",
    "login.failed": "Falha no login",
    "login.invalidCredentials": "Nome de usuário ou senha inválidos",

    // Not Found
    "notFound.title": "404",
    "notFound.message": "Ops! Página não encontrada",
    "notFound.returnHome": "Voltar ao Início",

    // Common
    "common.close": "Fechar",
    "common.english": "Inglês",
    "common.portuguese": "Português",
    "common.3dMode": "Modo 3D",
    "common.2dMode": "Modo 2D",
    "common.centerCamera": "Centralizar Câmera",
    "common.confirm": "Confirmar",
    "common.confirmDeletion": "Confirmar Exclusão",
    "common.confirmStatusChange": "Confirmar Mudança de Status",
    "common.deleteConfirmMessage": "Tem certeza de que deseja excluir a tira de voo {{id}}? Esta ação não pode ser desfeita.",
    "common.statusChangeMessage": "Tem certeza de que deseja marcar esta tira de voo como {{status}}?",
    "common.active": "ativa",
    "common.inactive": "inativa",
    "common.flightArea": "Área de Voo",
    "common.id": "ID",

    // Constraints
    "constraints.confirmCreation": "Confirmar Criação de Restrição",
    "constraints.confirmMessage": "Tem certeza de que deseja criar uma restrição? A restrição será colocada em",
    "constraints.ieav": "Instituto de Estudos Avançados (IEAv)",
    "constraints.duration": "e durará por",
    "constraints.minutes": "3 minutos",

    // Sidebar Panel
    "sidebar.addStripButton": "Adicionar Tira",
    "sidebar.sortButton": "Ordenar",
    "sidebar.sortedById": "Ordenado por ID",
    "sidebar.activeFirst": "Ativos Primeiro",
    "sidebar.filtersButton": "Filtros",
    "sidebar.flightStripsCount": "Tiras de Voo ({{count}})",
    "sidebar.noFlightStrips": "Nenhuma tira de voo para exibir",
    "sidebar.addFlightStripDialog": "Adicionar Tira de Voo",
    "sidebar.editFlightStripDialog": "Editar Tira de Voo",
    "sidebar.confirmButton": "Confirmar",
    "sidebar.failAddStrip": "Falha ao adicionar tira de voo",
    "sidebar.failUpdateStrip": "Falha ao atualizar tira de voo",
    "sidebar.failRemoveStrip": "Falha ao remover tira {{name}}",
    "sidebar.failLoadStrips": "Falha ao carregar tiras de voo",
    "sidebar.stripMarkedAs": "Tira {{name}} marcada como {{status}}",
    "sidebar.stripUpdated": "Tira {{name}} atualizada com sucesso",
    "sidebar.stripRemoved": "Tira {{name}} foi removida",

    // Flight Strip Card
    "flightStrip.takeoff": "Decolagem",
    "flightStrip.landing": "Pouso",
    "flightStrip.depart": "Partida",
    "flightStrip.arrive": "Chegada",
    "flightStrip.height": "Altura",
    "flightStrip.description": "Descrição",

    // Add Flight Strip Form
    "addStrip.height": "Altura (m)",
    "addStrip.takeoffSpace": "Espaço de Decolagem",
    "addStrip.landingSpace": "Espaço de Pouso",
    "addStrip.description": "Descrição",
    "addStrip.descriptionPlaceholder": "Adicione um comentário ou nota...",
    "addStrip.takeoffTime": "Horário de Decolagem",
    "addStrip.landingTime": "Horário de Pouso",
    "addStrip.addFlightStrip": "Adicionar Tira de Voo",
    "addStrip.saveChanges": "Salvar Alterações",
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

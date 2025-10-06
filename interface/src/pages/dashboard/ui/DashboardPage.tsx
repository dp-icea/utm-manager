import { Header } from "./Header";
import { MapViewer } from "./MapViewer";
import { SidebarPanel } from "./SidebarPanel";
import { MapProvider } from "@/shared/lib/map";
import { StripsProvider } from "@/shared/lib/strips";

export const DashboardPage = () => {
  return (
    <MapProvider>
      <StripsProvider>
        <div className="min-h-screen flex w-full bg-gray-900">
          <SidebarPanel />
          <div className="flex flex-1 flex-col">
            <Header />
            <main className="flex-1 flex flex-col relative">
              <div className="flex-1 relative">
                <MapViewer />
              </div>
            </main>
          </div>
        </div>
      </StripsProvider>
    </MapProvider>
  );
};

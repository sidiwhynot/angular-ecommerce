import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { appConfig } from './app.config';
import { provideServerRendering } from './provide-server-rendering'; // Assurez-vous de corriger le chemin d'importation selon l'emplacement réel de votre fichier
import { provideClientHydration } from '@angular/platform-browser';

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(), provideClientHydration()],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);

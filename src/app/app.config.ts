import { ApplicationConfig, importProvidersFrom } from '@angular/core';


import { HttpClientModule, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { provideToastr } from 'ngx-toastr';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from './animations-util';
import { loadingSpinnerInterceptorFunctional, loggingInterceptorFunctional, responseTimeInterceptorFunctional } from './loading.service/functional.interceptor';
import { AppTranslateModule } from './app-translate.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';




export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(AppTranslateModule.forRoot()),
    importProvidersFrom(HttpClientModule,BrowserAnimationsModule),
    provideHttpClient(withFetch(),withInterceptors([
    loadingSpinnerInterceptorFunctional, 
    responseTimeInterceptorFunctional,
    loggingInterceptorFunctional, ])),
    provideAnimationsAsync(),
    provideToastr(),
  ]
};


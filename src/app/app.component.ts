import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, Injector,HostListener, inject, OnInit, PLATFORM_ID } from '@angular/core';

import { CommonModule, ViewportScroller, isPlatformBrowser } from '@angular/common';

import { HeaderComponent } from './layouts/header/header.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { BottomNavigationBarComponent } from './bottom-navigation-bar/bottom-navigation-bar.component';

import { HttpClient, HttpErrorResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from './loading.service/loading-spinner.component';
import { scrollPageToTop } from './app.routes';
import { SearchResultsComponent } from './search/search-results.component';
import { environment } from '../environement/environement';
import { TranslateModule, TranslateService } from '@ngx-translate/core';











@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HeaderComponent,
    FooterComponent,
    BottomNavigationBarComponent,
    LoadingSpinnerComponent,
    TranslateModule,
    
    


  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [
    // Ajoutez scrollPageToTop en tant que fournisseur ici
    {
      provide: 'scrollPageToTop',
      useFactory: (router: Router) => () => scrollPageToTop(router),
      deps: [Router]
    },
    
  ]
})

export class AppComponent implements OnInit {
  title = 'angular-ecommerce';
  isBrowser: boolean;
  translateService= inject(TranslateService);

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private viewportScroller: ViewportScroller
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }


  getData() {
    this.http.get(`${environment.apiUrl}/data`).subscribe(
      (response) => {
        console.log('Response:', response);
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.viewportScroller.scrollToPosition([0, 0]);
        }
      });
    }
    if (this.isBrowser) {
      this.translateService.setDefaultLang('fr');
      this.translateService.use('fr');
    }
  }


  @HostListener('window:unload', ['$event'])
  unloadHandler(event: Event) {
    // Logique pour gérer l'événement de déchargement
    console.log('Window is about to be unloaded');
    // Supprimer les écouteurs d'événements de l'extension Chrome
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      try {
        chrome.runtime.onMessage.removeListener(handleExtensionEvents);
      } catch (error) {
        console.error('Error removing listener:', error);
      }
    }
  }
}

// Fonction de gestion des événements de l'extension
function handleExtensionEvents(message: any, sender: any, sendResponse: any) {
  // Votre logique de gestion des messages
}
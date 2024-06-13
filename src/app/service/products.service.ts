import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environement/environement';
import { AuthService } from './auth.service';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private apiUrl = environment.apiUrl;
  private searchResultsSubject = new Subject<any[]>();
  searchResults$ = this.searchResultsSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService, private cacheService: CacheService) { }


  getProductsByCategoryId(categoryId: number): Observable<any> {
    const url = `${this.apiUrl}/products/productsByCategoryId/${categoryId}`;
    if (this.cacheService.has(url)) {
      return this.cacheService.get(url);
    } else {
      return this.http.get<any>(url).pipe(
        tap(data => this.cacheService.put(url, data))
      );
    }
  }

  getAllProductsPaged(page: number , size: number): Observable<any> {
    const url = `${this.apiUrl}/products?page=${page}&size=${size}`;
    if (this.cacheService.has(url)) {
      return this.cacheService.get(url);
    } else {
      return this.http.get<any>(url).pipe(
        tap(data => this.cacheService.put(url, data))
      );
    }
  }

  getAllProductsBySubCategoryId(categoryId: number, page: number , size: number ): Observable<any> {
    const url = `${this.apiUrl}/products/productsBySubCategoryId/${categoryId}?page=${page}&size=${size}`;
    if (this.cacheService.has(url)) {
      return this.cacheService.get(url);
    } else {
      return this.http.get<any>(url).pipe(
        tap(data => this.cacheService.put(url, data))
      );
    }
  }

  getProductDetails(productId: number): Observable<any> {
    const url = `${this.apiUrl}/products/${productId}`;
    if (this.cacheService.has(url)) {
      return this.cacheService.get(url);
    } else {
      return this.http.get<any>(url).pipe(
        tap(data => this.cacheService.put(url, data))
      );
    }
  }

  addProduct(product: FormData): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<any>(`${this.apiUrl}/products/addProduct`, product, { headers }).pipe(
      catchError(error => {
        console.error('Error adding product:', error);
        return throwError(error);
      })
    );
  }

  getUserProducts(): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Token not found in localStorage');
      return throwError('Token not found');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const url = `${this.apiUrl}/users/myProducts`;
    if (this.cacheService.has(url)) {
      return this.cacheService.get(url);
    } else {
      return this.http.get<any>(url, { headers }).pipe(
        tap(data => this.cacheService.put(url, data)),
        catchError(error => {
          console.error('Error fetching user products:', error);
          return throwError(error);
        })
      );
    }
  }

  deleteProductById(productId:number) : Observable<any> {
    const url = `${this.apiUrl}/products/${productId}`;
    return this.http.delete(url).pipe(
      tap(() => this.cacheService.invalidate(url)) // Supprimer les données du cache après la suppression
    );
  }

  getUserProfile(userId: number): Observable<any> {
    const url = `${this.apiUrl}/users/${userId}`;
    if (this.cacheService.has(url)) {
      return this.cacheService.get(url);
    } else {
      return this.http.get<any>(url).pipe(
        tap(data => this.cacheService.put(url, data))
      );
    }
  }




  getAllRegionsWithSubRegions(): Observable<any> {
    const url = `${this.apiUrl}/regions`;
    if (this.cacheService.has(url)) {
      return this.cacheService.get(url);
    } else {
      return this.http.get<any>(url).pipe(
        tap(data => this.cacheService.put(url, data))
      );
    }
  }

  getProductsByKeyword(keyword: string): Observable<any[]> {
    const url = `${this.apiUrl}/products/productsByKeyword/${keyword}`;
    if (this.cacheService.has(url)) {
      return this.cacheService.get(url);
    } else {
      return this.http.get<any[]>(url).pipe(
        tap(data => this.cacheService.put(url, data))
      );
    }
  }

  updateSearchResults(results: any[]): void {
    this.searchResultsSubject.next(results);
  }

  AllgetProductsByCategoryId(categoryId: number): Observable<any> {
    const url = `${this.apiUrl}/products/productsByCategoryId/${categoryId}`;
    if (this.cacheService.has(url)) {
      return this.cacheService.get(url);
    } else {
      return this.http.get<any>(url).pipe(
        tap(data => this.cacheService.put(url, data))
      );
    }
  }


}

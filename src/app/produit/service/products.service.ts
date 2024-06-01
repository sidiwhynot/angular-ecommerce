import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, Subject, throwError } from 'rxjs';

import { AuthService } from '../../auth/service/auth.service';
import { environment } from '../../../environement/environement';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private apiUrl = environment.apiUrl;
  private searchResultsSubject = new Subject<any[]>();
  searchResults$ = this.searchResultsSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {}

  getAllProducts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/products`);
  }

  getProductsByCategoryId(categoryId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/products/productsByCategoryId/${categoryId}`
    );
  }

  getAllProductsPaged(page: number = 0, size: number = 11): Observable<any> {
    return this.http.get(`${this.apiUrl}/products?page=${page}&size=${size}`);
  }

  getAllProductsBySubCategoryId(
    categoryId: number,
    page: number = 0,
    size: number = 10
  ): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/products/productsBySubCategoryId/${categoryId}?page=${page}&size=${size}`
    );
  }

  getProductDetails(productId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/products/${productId}`);
  }

  addProduct(product: FormData): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .post<any>(`${this.apiUrl}/products/addProduct`, product, { headers })
      .pipe(
        catchError((error) => {
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
    return this.http
      .get<any>(`${this.apiUrl}/users/myProducts`, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error fetching user products:', error);
          return throwError(error);
        })
      );
  }

  deleteProductById(productId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/products/${productId}`);
  }

  getUserProfile(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${userId}`);
  }

  getAllWithProducts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories/withProducts`);
  }

  getAllRegionsWithSubRegions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/regions`);
  }

  getProductsByKeyword(keyword: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/products/productsByKeyword/${keyword}`
    );
  }
  updateSearchResults(results: any[]): void {
    this.searchResultsSubject.next(results);
  }

  getAllCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories`);
  }

  AllgetProductsByCategoryId(categoryId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/products/productsByCategoryId/${categoryId}`
    );
  }
}

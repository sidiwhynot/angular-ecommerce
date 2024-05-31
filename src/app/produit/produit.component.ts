import { CommonModule, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { Observable } from 'rxjs';
import { SearchService } from '../search/search-service';
import { Product } from './service/model';
import { ProductsService } from './service/products.service';

@Component({
  selector: 'app-produit',
  standalone: true,
  imports: [RouterModule, NgFor, CommonModule],
  templateUrl: './produit.component.html',
  styleUrls: ['./produit.component.css'],
})
export class ProduitComponent implements OnInit {
  pagedProducts: any[] = [];
  currentPage = 1;
  rows = 50;
  totalProducts = 0;
  categoryId: number | undefined;
  pages: number[] = [];
  searchResults: any[] = [];

  constructor(
    private productService: ProductsService,
    private router: Router,
    private route: ActivatedRoute,
    private searchService: SearchService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const categoryIdParam = params.get('categoryId');
      if (categoryIdParam) {
        const categoryId = Number(categoryIdParam);
        if (!isNaN(categoryId)) {
          this.categoryId = categoryId;
          this.fetchProducts(categoryId);
        }
      }
    });

    // Abonnez-vous aux résultats de recherche
    this.searchService.searchResults$.subscribe((results: any[]) => {
      this.pagedProducts = results;
      this.totalProducts = results.length; // Mettez à jour le total des produits avec la longueur des résultats
      this.calculatePages(); // Recalculez les pages en fonction du nouveau total des produits
    });
  }

  fetchProducts(categoryId: number) {
    let productsObservable: Observable<any>;

    if (categoryId === 0) {
      productsObservable = this.productService.getAllProductsPaged(
        this.currentPage - 1,
        this.rows
      );
    } else {
      productsObservable = this.productService.getAllProductsBySubCategoryId(
        categoryId,
        this.currentPage - 1,
        this.rows
      );
    }

    productsObservable.subscribe(
      (response: any) => {
        this.pagedProducts = response.data;
        this.totalProducts = response.meta.total;
        this.calculatePages();
      },
      (error) => {
        console.error('Error fetching products:', error);
      }
    );
  }

  calculatePages() {
    const totalPages = Math.ceil(this.totalProducts / this.rows);
    this.pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  onPageChange(event: any) {
    this.currentPage = event.page + 1;
    if (this.categoryId !== undefined) {
      this.fetchProducts(this.categoryId);
    }
  }

  shortenProductName(name: string): string {
    const maxLength = 16;
    if (name.length > maxLength) {
      return name.substr(0, maxLength) + '...';
    }
    return name;
  }

  setPage(page: number): void {
    if (page < 1 || page > this.pages.length) return;
    this.currentPage = page;
    this.fetchProducts(this.categoryId!);
  }

  redirectToAddProduct() {
    this.router.navigateByUrl('/add');
  }
  formatPrice(price: number): string {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Product } from '../produit/service/model';
import { CarouselModule } from 'primeng/carousel';
import { ProductsService } from '../produit/service/products.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, CarouselModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent implements OnInit {
  productId!: number;
  productDetails!: Product;
  status = false;

  // Déclarez une variable pour stocker l'index de l'image principale
  currentImageIndex: number = 0;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductsService
  ) {}

  ngOnInit() {
    // Get the productId from the route parameters
    this.route.params.subscribe((params) => {
      this.productId = +params['productId']; // The '+' is used to convert the string to a number
      this.fetchProductDetails();
    });
  }

  changeMainImage(index: number): void {
    this.currentImageIndex = index;
  }

  fetchProductDetails() {
    this.productService.getProductDetails(this.productId).subscribe(
      (response: any) => {
        this.productDetails = response;
        console.log(response);
      },
      (error) => {
        console.error('Error fetching product details:', error);
      }
    );
  }

  addToggle() {
    this.status = !this.status;
  }
  formatPrice(price: any): string {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
}

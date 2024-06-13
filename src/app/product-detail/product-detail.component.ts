import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
  Renderer2,
} from '@angular/core';
import { Product } from '../service/model/model';
import { CarouselModule } from 'primeng/carousel';
import { ProductsService } from '../service/products.service';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../service/auth.service';
import { FavoriteService } from '../service/favorite.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, CarouselModule, TranslateModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
})
export class ProductDetailComponent implements OnInit {
  productId!: number;
  productDetails!: any; // Use appropriate type
  isTokenAvailable = false;
  isFavorite = false;
  currentImageIndex = 0;
  startX = 0;

  @ViewChild('imageModal') imageModal!: ElementRef | undefined;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private productService: ProductsService,
    private favoriteService: FavoriteService,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2 // Inject Renderer2
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.productId = +params['productId'];
      this.fetchProductDetails();
      this.isTokenAvailable = this.authService.isTokenAvailable();
      this.checkIfProductIsFavorite(this.productId);
    });
  }

  fetchProductDetails() {
    this.productService.getProductDetails(this.productId).subscribe(
      (response: any) => {
        this.productDetails = response;
      },
      (error) => {
        console.error('Error fetching product details:', error);
      }
    );
  }

  checkIfProductIsFavorite(productId: number): void {
    if (this.isTokenAvailable) {
      this.favoriteService.checkIfProductIsFavorite(productId).subscribe(
        (response: any) => {
          this.isFavorite = response.data;
          this.cdr.detectChanges();
        },
        (error) => {
          console.error('Error checking if product is favorite:', error);
        }
      );
    }
  }

  toggleFavorite(productId: number): void {
    if (this.isTokenAvailable) {
      this.favoriteService.addOrRemoveFavorite(productId).subscribe(
        (response: any) => {
          this.isFavorite = !this.isFavorite;
          this.cdr.detectChanges();
        },
        (error) => {
          console.error('Error toggling product favorite:', error);
        }
      );
    }
  }

  openFullScreenGallery(): void {
    if (this.imageModal) {
      this.imageModal.nativeElement.style.display = 'block';
      this.renderer.addClass(document.body, 'modal-open'); // Add class to body
      this.imageModal.nativeElement.addEventListener(
        'touchstart',
        this.touchStart.bind(this)
      );
      this.imageModal.nativeElement.addEventListener(
        'touchend',
        this.touchEnd.bind(this)
      );
    }
  }

  changeMainImage(index: number): void {
    this.currentImageIndex = index;
  }

  closeFullScreenGallery(): void {
    if (this.imageModal) {
      this.imageModal.nativeElement.style.display = 'none';
      this.renderer.removeClass(document.body, 'modal-open'); // Remove class from body
      this.imageModal.nativeElement.removeEventListener(
        'touchstart',
        this.touchStart.bind(this)
      );
      this.imageModal.nativeElement.removeEventListener(
        'touchend',
        this.touchEnd.bind(this)
      );
    }
  }

  showImage(index: number): void {
    this.currentImageIndex = index;
    this.openFullScreenGallery();
  }

  nextImage(): void {
    this.currentImageIndex =
      (this.currentImageIndex + 1) % this.productDetails.images.length;
    this.triggerImageTransition();
  }

  previousImage(): void {
    this.currentImageIndex =
      (this.currentImageIndex + this.productDetails.images.length - 1) %
      this.productDetails.images.length;
    this.triggerImageTransition();
  }

  triggerImageTransition(): void {
    const images = document.querySelectorAll('.modal-img');
    images.forEach((img, index) => {
      if (index === this.currentImageIndex) {
        img.classList.add('fade-in');
      } else {
        img.classList.remove('fade-in');
      }
    });
  }

  touchStart(event: TouchEvent): void {
    this.startX = event.touches[0].clientX;
  }

  touchEnd(event: TouchEvent): void {
    const endX = event.changedTouches[0].clientX;
    if (this.startX - endX > 50) {
      this.nextImage();
    } else if (this.startX - endX < -50) {
      this.previousImage();
    }
  }
}

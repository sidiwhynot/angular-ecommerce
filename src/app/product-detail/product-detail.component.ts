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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../service/auth.service';
import { FavoriteService } from '../service/favorite.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, CarouselModule, TranslateModule,RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
})
export class ProductDetailComponent implements OnInit {
  productId!: number;
  productDetails!: any; // Utilisez le type approprié
  relatedProducts: any[] = [];
  pagedProducts: any[] = [];
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
    private renderer: Renderer2 // Injecter Renderer2
  ) {}

  ngOnInit() {
    
    this.route.params.subscribe((params) => {
      this.productId = +params['productId'];
      this.fetchProductDetails();
      this.isTokenAvailable = this.authService.isTokenAvailable();
      this.checkIfProductIsFavorite(this.productId);
    });
  }


  share() {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this product',
        text: 'Here is a product you might like!',
        url: window.location.href // or a specific URL you want to share
      })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing', error));
    } else {
      alert('Web Share API not supported in your browser.');
    }
  }


  fetchProductDetails(): void {
    console.log('Fetching product details for productId:', this.productId);
    
    this.productService.getProductDetails(this.productId).subscribe(
      (response: any) => {
        console.log('Product details fetched successfully:', response);
        this.productDetails = response;
        this.fetchRelatedProducts(response.subCategoryId); // Appel pour récupérer les produits associés
      },
      (error) => {
        console.error('Error fetching product details:', error);
      }
    );
  }

  fetchRelatedProducts(subCategoryId: number): void {
    console.log(`Fetching related products for subCategoryId: ${subCategoryId}`);
    this.productService.getAllProductsBySubCategoryId(subCategoryId, 0, 8).subscribe(
      (response: any) => {
        console.log('Related products fetched', response);
        this.pagedProducts = response.data;
      },
      error => {
        console.error('Error fetching related products:', error);
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
      this.renderer.addClass(document.body, 'modal-open'); // Ajouter la classe au body
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

  shouldShowNavigation(): boolean {
    if (!this.imageModal || !this.imageModal.nativeElement) {
      return false; // Si imageModal ou nativeElement est undefined, retourner false
    }
  
    const containerWidth = this.imageModal.nativeElement.offsetWidth; // Largeur du conteneur modal
    if (!containerWidth) {
      return false; // Si la largeur du conteneur est 0 ou undefined, retourner false
    }
  
    if (!this.productDetails?.images || this.productDetails.images.length <= 1) {
      return false; // Ne pas afficher les flèches s'il y a 0 ou 1 image
    }
  
    const totalImagesWidth = this.productDetails.images.length * containerWidth; // Largeur totale des images
  
    // Vérifier si la largeur totale des images est supérieure à la largeur du conteneur (défilement nécessaire)
    return totalImagesWidth > containerWidth;
  }
  

  changeMainImage(index: number): void {
    this.currentImageIndex = index;
  }

  closeFullScreenGallery(): void {
    if (this.imageModal) {
      this.imageModal.nativeElement.style.display = 'none';
      this.renderer.removeClass(document.body, 'modal-open'); // Supprimer la classe du body
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

  shortenProductName(name: string): string {
    const maxLength = 19;
    if (name.length > maxLength) {
      return name.substr(0, maxLength) + '...';
    }
    return name;
  }
}

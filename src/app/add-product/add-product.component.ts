import { Component, Inject, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ProductsService } from '../service/products.service';
import { CategoryService } from '../service/category.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Category, SubCategory } from '../service/model/Category';
import { FileUploadModule } from 'primeng/fileupload';
import { FieldsetModule } from 'primeng/fieldset';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import * as WebpConverter from 'webp-converter';




import { ToastrService } from 'ngx-toastr';
import { TranslateModule, TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [FormsModule,CommonModule,FieldsetModule,FileUploadModule, TranslateModule, ],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css',
  providers: [MessageService],

})
export class AddProductComponent implements OnInit {
  selectedImages: { file: File, url: string }[] = [];
  product: any = {};
  images: File[] = [];
  msgs: any[] = [];
  categories: any[] = [];
  subcategories: any[] = [];
  regions: any[] = [];
  subregions: any[] = [];
  selectedRegionId: string = '';
  selectedCategory: string = '';
  selectedSubcategory: string = '';
  selectedRegion: string = '';
  selectedSubregion: string = '';
  isBrowser: boolean;

  constructor(
    private productService: ProductsService,
    private categoryService: CategoryService,
    private router: Router,
    private messageService: MessageService,
    private authService: AuthService,
    public translate:TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  toaster = inject(ToastrService);

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
    } else {
      this.loadCategories();
      this.loadRegions();
    }
  }

  loadCategories() {
    this.categoryService.getAllCategories().subscribe(
      (response: any) => {
        this.categories = response;
      },
      (error) => {
        console.error('Error fetching categories:', error);
      }
    );
  }

  loadRegions() {
    this.productService.getAllRegionsWithSubRegions().subscribe(
      (data: any) => {
        console.log('Régions récupérées :', data);
        this.regions = data.data;
      },
      (error) => {
        console.error('Erreur lors de la récupération des régions :', error);
      }
    );
  }

  onSubmit() {
    const tokenAvailable = this.authService.isAuthenticated();
    if (!tokenAvailable) {
      console.log('Token non trouvé dans le localStorage');
      this.router.navigate(['/login']);
      return;
    }

    const token = this.authService.getToken();
    console.log('Token found:', token);

    const formData = new FormData();
    formData.append('name', this.product.name);
    formData.append('description', this.product.description);
    formData.append('price', this.product.price);
    formData.append('category', this.product.category);
    formData.append('subCategoryId', this.product.subcategory);
    formData.append('regionId', this.product.region);
    formData.append('subRegionId', this.product.subregion);
    for (let i = 0; i < this.images.length; i++) {
      formData.append('images', this.images[i]);
    }

    this.productService.addProduct(formData).subscribe(
      (response) => {
        console.log('Produit ajouté avec succès', response);
        this.showSuccessToast();
        this.clearForm();
        this.router.navigate(['/home']);  // Redirection vers la page d'accueil après le succès
      },
      (error) => {
        console.error('Erreur lors de ajout du produit', error);
        this.showErrorToast();
      }
    );
  }

  clearForm() {
    this.product = {};
    this.images = [];
    this.selectedCategory = '';
    this.selectedSubcategory = '';
    this.selectedRegionId = '';
    this.selectedSubregion = '';
    this.selectedImages = [];
  }

  onFileSelect(event: any) {
    const files: File[] = Array.from(event.target.files);
  
    // Limiter le nombre de fichiers à 6
    for (let i = 0; i < Math.min(files.length, 6 - this.images.length); i++) {
      const file = files[i];
      const fileURL = URL.createObjectURL(file);
  
      // Ajouter l'image originale à selectedImages et images
      this.selectedImages.push({ file, url: fileURL });
    
  
      // Vérifier si le fichier est une image et si la conversion en WebP est possible
      if (file.type.startsWith('image/')) {
        this.convertToWebP(file).then((webpFile: File) => {
          const webpURL = URL.createObjectURL(webpFile);
  
          // Ajouter l'image convertie en WebP à selectedImages et images

          this.images.push(webpFile);
  
          // Afficher dans la console pour vérification
          console.log('Fichier WebP ajouté:', webpFile);
        }).catch((error: any) => {
          console.error('Erreur lors de la conversion en WebP:', error);
        });
      }
    }
  
    console.log('Fichiers sélectionnés:', this.images);
  }

  convertToWebP(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context could not be created.'));
        return;
      }

      const image = new Image();
      image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to convert image to blob.'));
            return;
          }

          const webpFile = new File([blob], file.name.replace(/\.\w+$/, '.webp'), {
            type: 'image/webp'
          });

          resolve(webpFile);
        }, 'image/webp', 0.8); // Qualité de l'image WebP (0.0 - 1.0)
      };

      image.onerror = (error) => {
        reject(error);
      };

      image.src = URL.createObjectURL(file);
    });
  }



  onCategoryChange(categoryId: string) {
    const selectedCategory = this.categories.find(category => category.id === parseInt(categoryId, 10));
    if (selectedCategory && selectedCategory.subCategories) {
      this.subcategories = selectedCategory.subCategories;
      this.product.subcategory = this.subcategories[0].id;
    } else {
      this.subcategories = [];
      this.product.subcategory = '';
    }
  }

  onRegionChange(regionId: string) {
    const selectedRegion = this.regions.find(region => region.id === parseInt(regionId, 10));
    if (selectedRegion && selectedRegion.subRegions) {
      this.subregions = selectedRegion.subRegions;
      this.product.subregion = this.subregions[0].id;
    } else {
      this.subregions = [];
      this.product.subregion = '';
    }
  }

  showSuccessToast() {
    if (this.isBrowser) {
      this.toaster.success('Produit ajouté avec succès', 'Succès');
    }
  }

  showErrorToast() {
    if (this.isBrowser) {
      this.toaster.error('Erreur lors de ajout du produit', 'Erreur');
    }
  }
}
import { Image } from './Image';
import { VendorDetails } from './VendorDetails';

export interface Product {
  categoryId: number;
  id: number;
  name: string;
  price: number;
  mark: string;
  hit: number;
  region: string;
  vendorDetails: VendorDetails;
  subRegion: string;
  description: string;
  createDate: Date;
  updateDate: Date;
  images: Image[];
  subCategory: string;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  meta?: any;
}

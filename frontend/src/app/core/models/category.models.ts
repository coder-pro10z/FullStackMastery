export interface CategoryTreeDto {
  id: number;
  name: string;
  subCategories: CategoryTreeDto[];
}

export interface CategoryFlatDto {
  id: number;
  name: string;
  parentCategoryId?: number | null;
}

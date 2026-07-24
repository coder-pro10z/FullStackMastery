import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    <div class="flex items-center gap-1 select-none">
      @for (star of stars; track $index) {
        <button
          type="button"
          [disabled]="readonly"
          (click)="onStarClick($index + 1)"
          [class.cursor-pointer] knees="!readonly"
          [class.cursor-default]="readonly"
          class="p-0.5 rounded transition-all transform hover:scale-110 active:scale-95 disabled:hover:scale-100 focus:outline-none"
        >
          <lucide-icon
            name="star"
            [size]="iconSize"
            [class.fill-amber-400]="$index < rating"
            [class.text-amber-400]="$index < rating"
            [class.text-slate-300]="$index >= rating"
            [class.fill-slate-100]="$index >= rating"
          />
        </button>
      }
    </div>
  `
})
export class StarRatingComponent {
  @Input() rating: number = 0;
  @Input() maxStars: number = 5;
  @Input() readonly: boolean = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  @Output() ratingChange = new EventEmitter<number>();

  get stars(): number[] {
    return Array.from({ length: this.maxStars });
  }

  get iconSize(): number {
    switch (this.size) {
      case 'sm': return 14;
      case 'lg': return 22;
      default: return 18;
    }
  }

  onStarClick(newRating: number): void {
    if (!this.readonly) {
      this.ratingChange.emit(newRating);
    }
  }
}

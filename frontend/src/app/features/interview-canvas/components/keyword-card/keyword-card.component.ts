import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronRight } from 'lucide-angular';
import { PremiumCheckboxComponent } from '../../../../shared/components/premium-checkbox/premium-checkbox.component';

interface KeywordItem {
  id: string;
  term: string;
  def: string;
  useCase: string;
  impl: string;
  checked: boolean;
}

@Component({
  selector: 'app-keyword-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, PremiumCheckboxComponent],
  templateUrl: './keyword-card.component.html',
  styleUrl: './keyword-card.component.scss'
})
export class KeywordCardComponent {
  keywords: KeywordItem[] = [
    {
      id: 'k1',
      term: 'Kestrel Web Server',
      def: 'A cross-platform, high-performance, open-source web server for ASP.NET Core.',
      useCase: 'Validates understanding of modern .NET hosting decoupled from legacy IIS.',
      impl: 'Deploying the ASP.NET Core application utilizing Kestrel as the edge server.',
      checked: false
    },
    {
      id: 'k2',
      term: 'Entity Framework Core',
      def: 'The standard, cross-platform Object-Relational Mapper (ORM) for .NET data access.',
      useCase: 'Required for rapid backend development and standard CRUD operations.',
      impl: 'Leveraging EF Core features like .AsNoTracking() to minimize memory overhead.',
      checked: false
    }
  ];
}

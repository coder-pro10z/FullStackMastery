import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NodepadWidgetComponent } from '@coder-pro10z/nodepad-widget';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NodepadWidgetComponent],
  template: `<router-outlet /> 
  <nodepad-widget></nodepad-widget>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent { }

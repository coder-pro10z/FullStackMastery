import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { ISkillCategory } from '../../../../core/models/dashboard.model';

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

@Component({
  selector: 'app-radar-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './radar-chart.component.html',
  styleUrl: './radar-chart.component.scss'
})
export class RadarChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() skills: ISkillCategory[] = [];
  @Input() targetLabel = 'Full-Stack Architect';

  @ViewChild('radarCanvas') radarCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart<'radar'> | null = null;

  ngAfterViewInit() {
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['skills'] || changes['targetLabel']) && this.chart) {
      this.renderChart();
    }
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }

  private renderChart() {
    const canvas = this.radarCanvas?.nativeElement;
    if (!canvas) {
      return;
    }

    this.chart?.destroy();

    const labels = this.skills.length > 0
      ? this.skills.map((skill) => skill.category)
      : ['Frontend', 'Backend', 'Data', 'Cloud', 'Architecture'];

    const values = this.skills.length > 0
      ? this.skills.map((skill) => Math.min(skill.key_topics.length * 2, 10))
      : [6, 8, 5, 7, 6];

    this.chart = new Chart(canvas, {
      type: 'radar',
      data: {
        labels,
        datasets: [
          {
            label: 'Current Coverage',
            data: values,
            backgroundColor: 'rgba(26, 115, 232, 0.18)',
            borderColor: '#1A73E8',
            pointBackgroundColor: '#1A73E8',
            pointBorderColor: '#ffffff',
            pointHoverBackgroundColor: '#ffffff',
            pointHoverBorderColor: '#1A73E8',
            borderWidth: 2,
            fill: true
          }
        ]
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          r: {
            min: 0,
            max: 10,
            ticks: {
              display: false,
              stepSize: 2
            },
            grid: {
              color: 'rgba(224, 224, 224, 0.9)'
            },
            angleLines: {
              color: 'rgba(224, 224, 224, 0.7)'
            },
            pointLabels: {
              color: '#5F6368',
              font: {
                size: 11,
                family: 'system-ui'
              }
            }
          }
        }
      }
    });
  }
}

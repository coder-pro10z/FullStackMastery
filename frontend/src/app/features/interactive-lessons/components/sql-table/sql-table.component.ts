import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Department {
  id: number;
  name: string;
  floor: string;
}

interface Employee {
  emp_id: number;
  name: string;
  role: string;
  dept_id: number;
}

interface OutputRow {
  name: string;
  role: string;
  department: string;
}

@Component({
  selector: 'app-sql-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sql-table.component.html',
  styleUrl: './sql-table.component.scss'
})
export class SqlTableComponent {
  departmentsData: Department[] = [
    { id: 1, name: 'Engineering', floor: '3rd' },
    { id: 2, name: 'Design', floor: '4th' }
  ];

  employeesData: Employee[] = [
    { emp_id: 101, name: 'Alice', role: 'Backend Dev', dept_id: 1 },
    { emp_id: 102, name: 'Bob', role: 'UX Designer', dept_id: 2 },
    { emp_id: 103, name: 'Charlie', role: 'QA Engineer', dept_id: 1 }
  ];

  outputData: OutputRow[] = [];
  
  hoveredDeptId: number | null = null;
  isRunning = false;
  showOutput = false;

  onHoverEmployee(deptId: number | null) {
    this.hoveredDeptId = deptId;
  }

  executeQuery() {
    this.isRunning = true;
    
    // Simulate network/execution delay
    setTimeout(() => {
      this.outputData = [
        { name: 'Alice', role: 'Backend Dev', department: 'Engineering' },
        { name: 'Bob', role: 'UX Designer', department: 'Design' },
        { name: 'Charlie', role: 'QA Engineer', department: 'Engineering' }
      ];
      this.isRunning = false;
      this.showOutput = true;
      
      // Give DOM time to render before scrolling
      setTimeout(() => {
        const outputSection = document.getElementById('output-section');
        if (outputSection) {
          outputSection.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }, 50);
    }, 600);
  }
}

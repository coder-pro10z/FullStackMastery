import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Employee {
  emp_id: number;
  name: string;
  dept_id: number | null;
  manager_id: number | null;
}

interface Department {
  dept_id: number;
  dept_name: string;
}

interface OutputRow {
  a_id: number | null;
  b_id: number | null;
  emp: string | null;
  a_dept: number | null;
  b_dept: number | null;
  dept: string | null;
  manager_id?: number | null;
  manager_name?: string | null;
}

@Component({
  selector: 'app-venn-diagram',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './venn-diagram.component.html',
  styleUrl: './venn-diagram.component.scss'
})
export class VennDiagramComponent implements OnInit {
  currentJoinType = 'inner';
  showSecondaryTabs = false;
  hoveredSrcA: number | null = null;
  hoveredSrcB: number | null = null;
  hoveredSrcASecondary: number | null = null;

  tableA: Employee[] = [
    { emp_id: 1, name: 'Alice', dept_id: 10, manager_id: 2 },
    { emp_id: 2, name: 'Bob', dept_id: 20, manager_id: null },
    { emp_id: 3, name: 'Charlie', dept_id: null, manager_id: 1 }
  ];

  tableB: Department[] = [
    { dept_id: 10, dept_name: 'Engineering' },
    { dept_id: 20, dept_name: 'Sales' },
    { dept_id: 30, dept_name: 'Marketing' }
  ];

  sqlQueries: Record<string, string> = {
    inner: `<span class="text-[#7C3AED] font-bold">SELECT</span> A.Name, B.Dept_Name\n<span class="text-[#7C3AED] font-bold">FROM</span> <span class="text-[#1A73E8]">Employees</span> A\n<span class="text-[#7C3AED] font-bold">INNER JOIN</span> <span class="text-[#1A73E8]">Departments</span> B\n<span class="text-[#7C3AED] font-bold">ON</span> A.Dept_ID = B.Dept_ID;`,
    left: `<span class="text-[#7C3AED] font-bold">SELECT</span> A.Name, B.Dept_Name\n<span class="text-[#7C3AED] font-bold">FROM</span> <span class="text-[#1A73E8]">Employees</span> A\n<span class="text-[#7C3AED] font-bold">LEFT OUTER JOIN</span> <span class="text-[#1A73E8]">Departments</span> B\n<span class="text-[#7C3AED] font-bold">ON</span> A.Dept_ID = B.Dept_ID;`,
    right: `<span class="text-[#7C3AED] font-bold">SELECT</span> A.Name, B.Dept_Name\n<span class="text-[#7C3AED] font-bold">FROM</span> <span class="text-[#1A73E8]">Employees</span> A\n<span class="text-[#7C3AED] font-bold">RIGHT OUTER JOIN</span> <span class="text-[#1A73E8]">Departments</span> B\n<span class="text-[#7C3AED] font-bold">ON</span> A.Dept_ID = B.Dept_ID;`,
    full: `<span class="text-[#7C3AED] font-bold">SELECT</span> A.Name, B.Dept_Name\n<span class="text-[#7C3AED] font-bold">FROM</span> <span class="text-[#1A73E8]">Employees</span> A\n<span class="text-[#7C3AED] font-bold">FULL OUTER JOIN</span> <span class="text-[#1A73E8]">Departments</span> B\n<span class="text-[#7C3AED] font-bold">ON</span> A.Dept_ID = B.Dept_ID;`,
    cross: `<span class="text-[#7C3AED] font-bold">SELECT</span> A.Name, B.Dept_Name\n<span class="text-[#7C3AED] font-bold">FROM</span> <span class="text-[#1A73E8]">Employees</span> A\n<span class="text-[#7C3AED] font-bold">CROSS JOIN</span> <span class="text-[#1A73E8]">Departments</span> B;`,
    self: `<span class="text-[#7C3AED] font-bold">SELECT</span> E.Name <span class="text-[#7C3AED] font-bold">AS</span> Employee, M.Name <span class="text-[#7C3AED] font-bold">AS</span> Manager\n<span class="text-[#7C3AED] font-bold">FROM</span> <span class="text-[#1A73E8]">Employees</span> E\n<span class="text-[#7C3AED] font-bold">LEFT JOIN</span> <span class="text-[#1A73E8]">Employees</span> M\n<span class="text-[#7C3AED] font-bold">ON</span> E.Manager_ID = M.Emp_ID;`
  };

  outputData: OutputRow[] = [];

  ngOnInit() {
    this.handleNavigation('inner');
  }

  handleNavigation(type: string) {
    if (['inner', 'self', 'cross'].includes(type)) {
      this.showSecondaryTabs = false;
      this.currentJoinType = type;
    } else if (type === 'outer') {
      this.showSecondaryTabs = true;
      if (!['left', 'right', 'full'].includes(this.currentJoinType)) {
        this.currentJoinType = 'left';
      }
    } else if (['left', 'right', 'full'].includes(type)) {
      this.showSecondaryTabs = true;
      this.currentJoinType = type;
    }
    this.generateOutputData();
  }

  generateOutputData() {
    let results: OutputRow[] = [];
    const type = this.currentJoinType;
    
    if (type === 'self') {
      this.tableA.forEach(emp => {
        const manager = this.tableA.find(m => m.emp_id === emp.manager_id);
        results.push({ 
          a_id: emp.emp_id, manager_id: manager ? manager.emp_id : null, 
          emp: emp.name, manager_name: manager ? manager.name : null,
          b_id: null, a_dept: null, b_dept: null, dept: null
        });
      });
      this.outputData = results;
      return;
    }

    if (type === 'cross') {
      this.tableA.forEach(a => {
        this.tableB.forEach(b => results.push({ a_id: a.emp_id, b_id: b.dept_id, emp: a.name, a_dept: a.dept_id, b_dept: b.dept_id, dept: b.dept_name }));
      });
      this.outputData = results;
      return;
    }

    let matchedBIds = new Set<number>();
    this.tableA.forEach(a => {
      let matchFound = false;
      this.tableB.forEach(b => {
        if (a.dept_id === b.dept_id) {
          results.push({ a_id: a.emp_id, b_id: b.dept_id, emp: a.name, a_dept: a.dept_id, b_dept: b.dept_id, dept: b.dept_name });
          matchFound = true;
          matchedBIds.add(b.dept_id);
        }
      });
      if (!matchFound && (type === 'left' || type === 'full')) {
        results.push({ a_id: a.emp_id, b_id: null, emp: a.name, a_dept: a.dept_id, b_dept: null, dept: null });
      }
    });

    if (type === 'right' || type === 'full') {
      this.tableB.forEach(b => {
        if (!matchedBIds.has(b.dept_id)) {
          results.push({ a_id: null, b_id: b.dept_id, emp: null, a_dept: null, b_dept: b.dept_id, dept: b.dept_name });
        }
      });
    }
    this.outputData = results;
  }

  onHoverRow(row: OutputRow | null) {
    if (!row) {
      this.hoveredSrcA = null;
      this.hoveredSrcB = null;
      this.hoveredSrcASecondary = null;
      return;
    }
    this.hoveredSrcA = row.a_id;
    this.hoveredSrcB = row.b_id;
    this.hoveredSrcASecondary = row.manager_id || null;
  }
}

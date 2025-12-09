import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Renderer2, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Chart, registerables, ChartConfiguration, ChartEvent, ActiveElement, ChartData, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { TaskService } from '../../services/task.service';
import { DepartmentService } from '../../services/department.service';
import { Task, TaskPriority, TaskStatus } from '../../models/task.model';
import { Department } from '../../models/department.model';

Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-reporting-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './reporting-dashboard.component.html',
  styleUrls: ['./reporting-dashboard.component.css'],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'd-block min-vh-100 bg-light' }
})
export class ReportingDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  @ViewChild('chartTitle') chartTitle!: ElementRef;
  @ViewChild('breadcrumb') breadcrumb!: ElementRef;
  @ViewChild('modeIndicator') modeIndicator!: ElementRef;

  activeTab: string = 'priority';
  viewState: any = { level: 'priority-root', priorityKey: null, deptId: null, statusKey: null };
  counts: any = { in_progress: 0, stopped: 0, done: 0 };

  data: any = { departments: [] };
  displayedTasks: any[] = [];
  currentDepartment: any = null;

  // Chart Properties
  public chartType: 'pie' = 'pie';
  public chartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [] }]
  };
  public chartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = (context.chart as any)._metasets[context.datasetIndex].total;
            const percentage = Math.round((Number(value) / total) * 100) + '%';
            return `${label}: ${value} (${percentage})`;
          }
        }
      },
      datalabels: {
        color: '#fff',
        font: {
          weight: 'bold',
          size: 14
        },
        formatter: (value, ctx) => {
          const label = ctx.chart.data.labels ? ctx.chart.data.labels[ctx.dataIndex] : '';
          const total = (ctx.chart as any)._metasets[ctx.datasetIndex].total;
          const percentage = Math.round((Number(value) / total) * 100) + '%';
          return [label, value, percentage].join('\n');
        }
      }
    }
  };

  // Callback for click handling
  private currentClickCallback: ((index: number) => void) | null = null;

  COLORS: any = {
    priority: { high: '#E53935', medium: '#FB8C00', low: '#4CAF50' },
    status: { in_progress: '#FB8C00', stopped: '#E53935', done: '#4CAF50' }
  };

  constructor(
    private renderer: Renderer2,
    private taskService: TaskService,
    private departmentService: DepartmentService,
    private router: Router
  ) { }

  ngOnInit(): void {
    forkJoin({
      tasks: this.taskService.getTasks(),
      departments: this.departmentService.getDepartments()
    }).subscribe(({ tasks, departments }) => {
      this.transformData(tasks, departments);
      const allTasks = this.flattenTasks();
      this.counts = this.countByStatus(allTasks);
    });
  }

  ngAfterViewInit(): void {
    if (this.data.departments.length > 0) {
      this.renderPriorityRoot();
    }
  }

  transformData(tasks: Task[], departments: Department[]) {
    const deptMap = new Map<string, any>();

    departments.forEach((d, index) => {
      const colors = ['#FB8C00', '#4CAF50', '#E53935', '#1976D2', '#9C27B0'];
      const color = colors[index % colors.length];

      deptMap.set(d.id, {
        id: d.id,
        name_ar: d.name,
        text_color: color,
        tasks: []
      });
    });

    tasks.forEach(task => {
      let mappedPriority = 'low';
      if (task.priority === TaskPriority.HIGH) mappedPriority = 'high';
      else if (task.priority === TaskPriority.MEDIUM) mappedPriority = 'medium';

      let mappedStatus = 'in_progress';
      if (task.status === TaskStatus.BLOCKED) mappedStatus = 'stopped';
      else if (task.status === TaskStatus.COMPLETED || task.status === TaskStatus.CLOSED) mappedStatus = 'done';

      const deptId = task.currentDepartment || 'Unknown';
      let deptName = 'Unknown';
      let deptColor = '#666';

      if (deptMap.has(deptId)) {
        deptName = deptMap.get(deptId).name_ar;
        deptColor = deptMap.get(deptId).text_color;
      } else if (deptMap.has('Other')) {
        deptName = deptMap.get('Other').name_ar;
        deptColor = deptMap.get('Other').text_color;
      }

      const taskData = {
        id: task.id,
        name_ar: task.name,
        priority: mappedPriority,
        status: mappedStatus,
        department_id: deptId,
        department_name: deptName,
        department_color: deptColor
      };

      if (deptMap.has(deptId)) {
        deptMap.get(deptId).tasks.push(taskData);
      } else {
        if (!deptMap.has('Other')) {
          deptMap.set('Other', { id: 'Other', name_ar: 'Other', text_color: '#666', tasks: [] });
        }
        deptMap.get('Other').tasks.push(taskData);
      }
    });

    this.data.departments = Array.from(deptMap.values());

    if (this.chart) {
      this.renderPriorityRoot();
    }
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'priority') {
      this.viewState = { level: 'priority-root', priorityKey: null, deptId: null, statusKey: null };
      this.renderPriorityRoot();
    } else if (tab === 'department') {
      this.viewState = { level: 'department-root', priorityKey: null, deptId: null, statusKey: null };
      this.renderDepartmentRoot();
    } else {
      this.viewState = { level: 'status-root', priorityKey: null, deptId: null, statusKey: null };
      this.renderStatusRoot();
    }
  }

  /* ========= UTIL ========= */
  sum(arr: any[]) { return arr.reduce((a, b) => a + b, 0); }

  countByPriority(tasks: any[]) {
    return { high: tasks.filter((t: any) => t.priority === 'high').length, medium: tasks.filter((t: any) => t.priority === 'medium').length, low: tasks.filter((t: any) => t.priority === 'low').length };
  }

  countByStatus(tasks: any[]) {
    return { in_progress: tasks.filter((t: any) => t.status === 'in_progress').length, stopped: tasks.filter((t: any) => t.status === 'stopped').length, done: tasks.filter((t: any) => t.status === 'done').length };
  }

  flattenTasks() { return this.data.departments.flatMap((d: any) => d.tasks); }

  /* ========= CHART HANDLERS ========= */

  public chartClicked({ event, active }: { event?: ChartEvent, active?: {}[] }): void {
    if (active && active.length > 0 && this.currentClickCallback) {
      const index = (active[0] as any).index;
      this.currentClickCallback(index);
    }
  }

  updateChart(labels: string[], data: number[], colors: string[], title: string, onClickCallback: (index: number) => void) {
    this.chartTitle.nativeElement.textContent = title;
    this.currentClickCallback = onClickCallback;

    this.chartData = {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        hoverOffset: 4
      }]
    };

    if (this.chart) {
      this.chart.update();
    }
  }

  onTaskClick(taskId: string) {
    this.router.navigate(['/tasks', taskId]);
  }


  /* ========= RENDERERS ========= */

  renderPriorityRoot() {
    this.viewState.level = 'priority-root';
    this.breadcrumb.nativeElement.textContent = 'الأهمية';
    this.modeIndicator.nativeElement.textContent = 'عرض حسب: الأهمية';
    const all = this.flattenTasks();
    const counts = this.countByPriority(all);

    const slices = [
      { id: 'high', label: 'هام', value: counts.high, color: this.COLORS.priority.high },
      { id: 'medium', label: 'متوسط', value: counts.medium, color: this.COLORS.priority.medium },
      { id: 'low', label: 'منخفض', value: counts.low, color: this.COLORS.priority.low }
    ].filter(s => s.value > 0);

    this.updateChart(
      slices.map(s => s.label),
      slices.map(s => s.value),
      slices.map(s => s.color),
      'عرض حسب الأهمية',
      (index) => {
        const slice = slices[index];
        this.renderDepartmentsForPriority(slice.id);
      }
    );
    this.updateDisplayedTasks(all);
  }

  renderDepartmentsForPriority(priorityKey: string) {
    this.viewState.level = 'priority->departments';
    this.viewState.priorityKey = priorityKey;
    this.breadcrumb.nativeElement.textContent = `الأهمية › ${priorityKey === 'high' ? 'هام' : priorityKey === 'medium' ? 'متوسط' : 'منخفض'}`;
    this.modeIndicator.nativeElement.textContent = `عرض حسب: الأهمية › ${this.breadcrumb.nativeElement.textContent.split('›').pop().trim()}`;

    const deptSlices = this.data.departments.map((d: any) => {
      const cnt = d.tasks.filter((t: any) => t.priority === priorityKey).length;
      return { id: d.id, label: d.name_ar, value: cnt, color: this.COLORS.priority[priorityKey] };
    }).filter((s: any) => s.value > 0);

    if (deptSlices.length === 0) {
      this.handleEmptyState('لا توجد مهمات في هذا المستوى من الأهمية.');
      return;
    }

    this.updateChart(
      deptSlices.map((s: any) => s.label),
      deptSlices.map((s: any) => s.value),
      this.data.departments.filter((d: any) => deptSlices.some((s: any) => s.id === d.id)).map((d: any) => d.text_color),
      `تفصيل الأقسام — ${priorityKey === 'high' ? 'هام' : priorityKey === 'medium' ? 'متوسط' : 'منخفض'}`,
      (index) => {
        const slice = deptSlices[index];
        this.renderStatusForDeptAndPriority(slice.id, priorityKey);
      }
    );

    const tasks = this.data.departments.flatMap((d: any) => d.tasks).filter((t: any) => t.priority === priorityKey);
    this.updateDisplayedTasks(tasks);
  }

  renderStatusForDeptAndPriority(deptId: string, priorityKey: string) {
    this.viewState.level = 'priority->departments->status';
    this.viewState.deptId = deptId;
    this.viewState.priorityKey = priorityKey;

    const dept = this.data.departments.find((d: any) => d.id === deptId)!;
    this.breadcrumb.nativeElement.textContent = `الأهمية › ${priorityKey === 'high' ? 'هام' : priorityKey === 'medium' ? 'متوسط' : 'منخفض'} › ${dept.name_ar}`;
    this.modeIndicator.nativeElement.textContent = `عرض حسب: ${dept.name_ar} › ${priorityKey === 'high' ? 'هام' : priorityKey === 'medium' ? 'متوسط' : 'منخفض'}`;

    const tasksInDept = dept.tasks.filter((t: any) => t.priority === priorityKey);
    const counts = this.countByStatus(tasksInDept);
    const slices = [
      { id: 'in_progress', label: 'جاري العمل', value: counts.in_progress, color: this.COLORS.status.in_progress },
      { id: 'stopped', label: 'متوقف', value: counts.stopped, color: this.COLORS.status.stopped },
      { id: 'done', label: 'تم', value: counts.done, color: this.COLORS.status.done }
    ].filter(s => s.value > 0);

    if (slices.length === 0) {
      this.handleEmptyState('لا توجد مهمات في هذا القسم بالمستوى المطلوب.');
      return;
    }

    this.updateChart(
      slices.map(s => s.label),
      slices.map(s => s.value),
      slices.map(s => s.color),
      `تفصيل الحالة — ${dept.name_ar}`,
      (index) => {
        const slice = slices[index];
        const tasks = dept.tasks.filter((t: any) => t.priority === priorityKey && t.status === slice.id);
        this.updateDisplayedTasks(tasks, dept);
      }
    );
    this.updateDisplayedTasks(tasksInDept, dept);
  }

  renderDepartmentRoot() {
    this.viewState = { level: 'department-root', priorityKey: null, deptId: null, statusKey: null };
    this.breadcrumb.nativeElement.textContent = 'الأقسام';
    this.modeIndicator.nativeElement.textContent = 'عرض حسب: الأقسام';
    const slices = this.data.departments.map((d: any) => {
      const cnt = d.tasks.length;
      return { id: d.id, label: d.name_ar, value: cnt, color: d.text_color };
    }).filter((s: any) => s.value > 0);

    this.updateChart(
      slices.map((s: any) => s.label),
      slices.map((s: any) => s.value),
      slices.map((s: any) => s.color),
      'عرض حسب الأقسام',
      (index) => {
        const slice = slices[index];
        this.renderDepartmentToPriority(slice.id);
      }
    );
    this.updateDisplayedTasks(this.flattenTasks());
  }

  renderDepartmentToPriority(deptId: string) {
    const dept = this.data.departments.find((d: any) => d.id === deptId)!;
    const counts = this.countByPriority(dept.tasks);
    const slices = [
      { id: 'high', label: 'هام', value: counts.high, color: this.COLORS.priority.high },
      { id: 'medium', label: 'متوسط', value: counts.medium, color: this.COLORS.priority.medium },
      { id: 'low', label: 'منخفض', value: counts.low, color: this.COLORS.priority.low },
    ].filter(s => s.value > 0);

    this.updateChart(
      slices.map(s => s.label),
      slices.map(s => s.value),
      slices.map(s => s.color),
      `تفصيل: ${dept.name_ar}`,
      (index) => {
        const slice = slices[index];
        const tasks = dept.tasks.filter((t: any) => t.priority === slice.id);
        this.updateDisplayedTasks(tasks, dept);
      }
    );
    this.updateDisplayedTasks(dept.tasks, dept);
  }

  renderStatusRoot() {
    this.viewState = { level: 'status-root', priorityKey: null, deptId: null, statusKey: null };
    this.breadcrumb.nativeElement.textContent = 'الحالة';
    this.modeIndicator.nativeElement.textContent = 'عرض حسب: الحالة';
    const all = this.flattenTasks();
    const counts = this.countByStatus(all);
    const slices = [
      { id: 'in_progress', label: 'جاري العمل', value: counts.in_progress, color: this.COLORS.status.in_progress },
      { id: 'stopped', label: 'متوقف', value: counts.stopped, color: this.COLORS.status.stopped },
      { id: 'done', label: 'تم', value: counts.done, color: this.COLORS.status.done }
    ].filter(s => s.value > 0);

    this.updateChart(
      slices.map(s => s.label),
      slices.map(s => s.value),
      slices.map(s => s.color),
      'عرض حسب الحالة',
      (index) => {
        const slice = slices[index];
        this.renderDepartmentsForStatus(slice.id);
      }
    );
    this.updateDisplayedTasks(all);
  }

  renderDepartmentsForStatus(statusKey: string) {
    this.viewState.level = 'status->departments';
    this.viewState.statusKey = statusKey;
    this.breadcrumb.nativeElement.textContent = `الحالة › ${statusKey === 'in_progress' ? 'جاري العمل' : statusKey === 'stopped' ? 'متوقف' : 'تم'}`;
    this.modeIndicator.nativeElement.textContent = `عرض حسب: الحالة › ${this.breadcrumb.nativeElement.textContent.split('›').pop().trim()}`;

    const deptSlices = this.data.departments.map((d: any) => {
      const cnt = d.tasks.filter((t: any) => t.status === statusKey).length;
      return { id: d.id, label: d.name_ar, value: cnt, color: d.text_color };
    }).filter((s: any) => s.value > 0);

    if (deptSlices.length === 0) {
      this.handleEmptyState('لا توجد مهمات بهذه الحالة.');
      return;
    }

    this.updateChart(
      deptSlices.map((s: any) => s.label),
      deptSlices.map((s: any) => s.value),
      deptSlices.map((s: any) => s.color),
      `تفصيل الأقسام — الحالة`,
      (index) => {
        const slice = deptSlices[index];
        const dept = this.data.departments.find((d: any) => d.id === slice.id)!;
        const tasks = dept.tasks.filter((t: any) => t.status === statusKey);
        this.updateDisplayedTasks(tasks, dept);
      }
    );
    const tasks = this.flattenTasks().filter((t: any) => t.status === statusKey);
    this.updateDisplayedTasks(tasks);
  }

  handleEmptyState(message: string) {
    this.chartData = { labels: [], datasets: [] };
    if (this.chart) this.chart.update();
    this.chartTitle.nativeElement.textContent = message;
    this.displayedTasks = [];
  }

  sortTasks(tasks: any[]): any[] {
    const sorted = [...tasks];
    if (this.activeTab === 'priority') {
      const priorityOrder: any = { 'high': 1, 'medium': 2, 'low': 3 };
      sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else if (this.activeTab === 'department') {
      sorted.sort((a, b) => (a.department_name || '').localeCompare(b.department_name || ''));
    } else if (this.activeTab === 'status') {
      const statusOrder: any = { 'in_progress': 1, 'stopped': 2, 'done': 3 };
      sorted.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    }
    return sorted;
  }

  updateDisplayedTasks(tasks: any[], department: any = null) {
    this.displayedTasks = this.sortTasks(tasks);
    this.currentDepartment = department;
  }
}

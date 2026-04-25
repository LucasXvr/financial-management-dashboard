import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  protected readonly cards = [
    { title: 'Receitas', value: 'R$ 0,00' },
    { title: 'Despesas', value: 'R$ 0,00' },
    { title: 'Saldo Atual', value: 'R$ 0,00' }
  ];
}

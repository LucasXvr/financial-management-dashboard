import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { CategoryService } from '../../core/services/category.service';
import { CategoriesComponent } from './categories.component';

describe('CategoriesComponent', () => {
  let fixture: ComponentFixture<CategoriesComponent>;

  const categoryService = {
    getCategories: () => of({
      data: [{ id: 1, title: 'Moradia', description: 'Despesas da casa' }],
      currentPage: 1,
      totalPages: 1,
      totalCount: 1,
      pageSize: 10
    }),
    deleteCategory: () => throwError(() => new HttpErrorResponse({
      status: 400,
      error: {
        data: null,
        message: 'Não é possível excluir uma categoria com transações vinculadas'
      }
    }))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesComponent],
      providers: [{ provide: CategoryService, useValue: categoryService }]
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriesComponent);
    fixture.detectChanges();
  });

  it('shows the API message when a linked category cannot be deleted', () => {
    const element = fixture.nativeElement as HTMLElement;
    const deleteButton = element.querySelector<HTMLButtonElement>('.danger-button');

    deleteButton?.click();
    fixture.detectChanges();

    const confirmButton = element.querySelector<HTMLButtonElement>('.confirm-delete');
    confirmButton?.click();
    fixture.detectChanges();

    expect(element.querySelector('[role="alert"]')?.textContent?.trim()).toBe(
      'Não é possível excluir uma categoria com transações vinculadas'
    );
    expect(element.querySelector('.confirmation-modal')).toBeTruthy();
  });
});

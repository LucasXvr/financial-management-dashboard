import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Category } from '../../core/models/category.models';
import { extractApiMessage } from '../../core/models/auth-api.models';
import { CategoryService } from '../../core/services/category.service';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit {
  protected categories: Category[] = [];
  protected loading = true;
  protected saving = false;
  protected loadError = '';
  protected formError = '';
  protected successMessage = '';
  protected currentPage = 1;
  protected totalPages = 0;
  protected totalCount = 0;
  protected readonly pageSize = 10;
  protected editingCategory: Category | null = null;
  protected categoryPendingDeletion: Category | null = null;
  protected deleting = false;
  protected deleteError = '';
  protected readonly categoryForm;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly categoryService: CategoryService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {
    this.categoryForm = this.formBuilder.nonNullable.group({
      title: ['', [Validators.required, Validators.maxLength(80)]],
      description: ['', [Validators.required, Validators.maxLength(255)]]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  protected loadCategories(pageNumber = this.currentPage): void {
    this.loading = true;
    this.loadError = '';
    this.changeDetectorRef.markForCheck();

    this.categoryService.getCategories(pageNumber, this.pageSize).subscribe({
      next: (response) => {
        this.categories = [...(response.data ?? [])].sort((left, right) =>
          left.title.localeCompare(right.title, 'pt-BR')
        );
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
        this.totalCount = response.totalCount;
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      },
      error: (error: unknown) => {
        this.loadError = this.getErrorMessage(
          error,
          'Nao foi possivel carregar as categorias.'
        );
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  protected submit(): void {
    this.formError = '';
    this.successMessage = '';

    if (this.categoryForm.invalid || this.saving) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const values = this.categoryForm.getRawValue();
    const title = values.title.trim();
    const description = values.description.trim();

    if (!title || !description) {
      this.formError = 'Titulo e descricao sao obrigatorios.';
      return;
    }

    this.saving = true;
    const request = { title, description };
    const operation = this.editingCategory
      ? this.categoryService.updateCategory(this.editingCategory.id, request)
      : this.categoryService.createCategory(request);

    operation.subscribe({
      next: (category) => {
        const wasEditing = !!this.editingCategory;

        if (wasEditing) {
          this.categories = this.categories
            .map((item) => (item.id === category.id ? category : item))
            .sort((left, right) => left.title.localeCompare(right.title, 'pt-BR'));
        }

        this.categoryForm.reset();
        this.editingCategory = null;
        this.successMessage = wasEditing
          ? 'Categoria atualizada com sucesso.'
          : 'Categoria cadastrada com sucesso.';
        this.saving = false;
        this.changeDetectorRef.markForCheck();

        if (!wasEditing) {
          this.loadCategories(1);
        }
      },
      error: (error: unknown) => {
        const fallback = this.editingCategory
          ? 'Nao foi possivel atualizar a categoria.'
          : 'Nao foi possivel cadastrar a categoria.';
        this.formError = this.getErrorMessage(
          error,
          fallback
        );
        this.saving = false;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  protected startEditing(category: Category): void {
    this.editingCategory = category;
    this.formError = '';
    this.successMessage = '';
    this.categoryForm.setValue({
      title: category.title,
      description: category.description ?? ''
    });
  }

  protected cancelEditing(): void {
    this.editingCategory = null;
    this.formError = '';
    this.categoryForm.reset();
  }

  protected previousPage(): void {
    if (!this.loading && this.currentPage > 1) {
      this.loadCategories(this.currentPage - 1);
    }
  }

  protected nextPage(): void {
    if (!this.loading && this.currentPage < this.totalPages) {
      this.loadCategories(this.currentPage + 1);
    }
  }

  protected requestDeletion(category: Category): void {
    this.categoryPendingDeletion = category;
    this.deleteError = '';
  }

  protected cancelDeletion(): void {
    if (this.deleting) return;
    this.categoryPendingDeletion = null;
    this.deleteError = '';
  }

  protected confirmDeletion(): void {
    const category = this.categoryPendingDeletion;
    if (!category || this.deleting) return;

    this.deleting = true;
    this.deleteError = '';

    this.categoryService.deleteCategory(category.id).subscribe({
      next: () => {
        const targetPage = this.categories.length === 1 && this.currentPage > 1
          ? this.currentPage - 1
          : this.currentPage;

        this.categoryPendingDeletion = null;
        this.deleting = false;
        this.successMessage = 'Categoria excluida com sucesso.';
        this.changeDetectorRef.markForCheck();
        this.loadCategories(targetPage);
      },
      error: (error: unknown) => {
        this.deleteError = this.getErrorMessage(
          error,
          'Não foi possível excluir a categoria.'
        );
        this.deleting = false;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      return extractApiMessage(error.error, fallback);
    }

    return error instanceof Error ? error.message : fallback;
  }
}

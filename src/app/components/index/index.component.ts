import { Component, OnInit, OnDestroy } from '@angular/core';
import { ArticlesService } from 'src/app/services/articles.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Article } from 'src/app/models/article';
import { Category } from 'src/app/models/category';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit, OnDestroy {

  public loading$: Observable<boolean>;
  public items: Article[] = [];
  public clicked: string = 'New';
  public subscriptions: Subscription[] = [];
  public categories: Category[];

  constructor(
    private readonly articlesService: ArticlesService,
    private readonly _snackBar: MatSnackBar
  ) {

    this.articlesService.getArticles('newstories');
    this.categories = this.articlesService.categories

    this.loading$ = this.articlesService.getLoadingFromState();

    this.subscriptions.push(this.articlesService.getArticlesFromState().subscribe(items => {
      this.items = items;
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }));
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.subscriptions.forEach(x => x.unsubscribe());
  }

  showMoreArticles() {
    if (this.articlesService.currentArticleId > this.articlesService.maxArticlesSize) {
      this._snackBar.open('Max articles reached!', 'Close', {
        duration: 5000,
      });
    } else {
      this.articlesService.getArticlesChunk();
    }
  }

  changeCategory(name: string) {
    this.clicked = name;
    const categoryClicked = this.categories.find(x => x.name === name);
    this.articlesService.getArticles(categoryClicked.value);
  }

}

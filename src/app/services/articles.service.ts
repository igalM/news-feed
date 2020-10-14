import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Article } from 'src/app/models/article';
import * as moment from 'moment';
import { Store } from '../state';
import { Category } from '../models/category';

interface ArticlesState {
  loading: boolean;
  articles: Article[];
  categories: Category[];
}

const initialState: ArticlesState = {
  loading: false,
  articles: [],
  categories: [
    { id: 0, value: 'newstories', name: 'New' },
    { id: 1, value: 'beststories', name: 'Best' },
    { id: 2, value: 'topstories', name: 'Top' }
  ]
}

@Injectable()
export class ArticlesService extends Store<ArticlesState> {

  public ids: number[] = [];
  public start: number = 0;
  public end: number = 25;
  public currentArticleId: number = 1;
  public chunkSize: number = 0;
  public maxArticlesSize: number = 0;
  public type: string = 'newstories';
  public categories: Category[];

  constructor(private readonly http: HttpClient) {
    super(initialState);
    this.categories = initialState.categories;
  }

  getArticlesFromState(): Observable<Article[]> {
    return this.getState().pipe(
      map(state => {
        return state.articles;
      })
    );
  }

  getLoadingFromState(): Observable<boolean> {
    return this.getState().pipe(map(state => state.loading));
  }

  getArticles(type: string) {
    this.setState({ ...this.state, loading: true });
    this.http.get(`${environment.api}${type}.json`).subscribe((items: number[]) => {
      this.setState({ ...this.state, loading: false });
      if (this.type !== type) {
        this.type = type;
        this.chunkSize = 0;
        this.start = 0;
        this.end = 25;
        this.currentArticleId = 1;
      }
      this.ids = items.slice(this.chunkSize, this.chunkSize + 100);
      this.maxArticlesSize = items.length;
      this.chunkSize += 100;
      this.getArticlesChunk();
    });
  }

  getArticlesChunk() {
    this.setState({ ...this.state, loading: true });
    if (this.start === 100) {
      this.start = 0;
      this.end = 25;
      this.getArticles(this.type);
    } else {
      const requests = [];
      for (let i = this.start; i < this.end; i++) {
        let request = this.http.get(`${environment.api}item/${this.ids[i]}.json`);
        requests.push(request);
      }
      this.start = this.end;
      this.end += 25;
      forkJoin(requests).pipe(
        map(results => results.map((article: Article) => {
          if (article) {
            article.id = this.currentArticleId;
            article.time = this.transformDate(parseInt(article.time));
            const hostname = article.url ? new URL(article.url).hostname : null;
            article.hostname = hostname;
            this.currentArticleId++;
          }
          return article;
        })))
        .subscribe((results: Article[]) => {
          this.setState({ ...this.state, articles: results });
          this.setState({ ...this.state, loading: false });
        });
    }
  }

  transformDate(timestamp: number): string {
    let date = new Date(timestamp * 1000);
    return moment(date).fromNow();
  }

}

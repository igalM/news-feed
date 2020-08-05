import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Article } from 'src/app/models/article';
import * as moment from 'moment';


@Injectable()
export class ArticlesService {

  public ids: number[] = [];

  private readonly _loading = new BehaviorSubject<boolean>(false);
  public loading$ = this._loading.asObservable();

  get loading(): boolean {
    return this._loading.getValue();
  }

  set loading(val: boolean) {
    this._loading.next(val);
  }

  private readonly _items = new BehaviorSubject<Article[]>([]);
  public items$ = this._items.asObservable();

  get items(): Article[] {
    return this._items.getValue();
  }

  set items(val: Article[]) {
    this._items.next(val);
  }

  public start: number = 0;
  public end: number = 25;
  public currentArticleId: number = 1;
  public chunkSize: number = 0;
  public maxArticlesSize: number = 0;
  public type: string = 'newstories';

  constructor(
    private readonly http: HttpClient
  ) { }

  getArticles(type: string) {
    this.loading = true;
    this.http.get(`${environment.api}${type}.json`).subscribe((items: number[]) => {
      this.loading = false;
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
    this.loading = true;
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
        }))
      ).subscribe((results: Article[]) => {
        this.items = results;
        this.loading = false;
      });
    }
  }

  transformDate(timestamp: number): string {
    let date = new Date(timestamp * 1000);
    return moment(date).fromNow();
  }

}

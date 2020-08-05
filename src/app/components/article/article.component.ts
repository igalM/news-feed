import { Component, OnInit, Input } from '@angular/core';
import { Article } from 'src/app/models/article';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit {

  @Input() article: Article = null;

  constructor() { }

  ngOnInit(): void {
  }

  openLink(url: string) {
    window.open(url);
  }

}

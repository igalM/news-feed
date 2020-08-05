import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { IndexComponent } from './components/index/index.component';
import { ArticleComponent } from './components/article/article.component';

import { ArticlesService } from './services/articles.service';

import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

const components = [
  AppComponent,
  IndexComponent,
  ArticleComponent
];

const services = [
  ArticlesService
];

const angularModules = [
  BrowserModule,
  AppRoutingModule,
  HttpClientModule,
  BrowserAnimationsModule,
];

const angularMaterialModules = [
  MatSnackBarModule,
  MatProgressSpinnerModule
];

@NgModule({
  declarations: [components],
  imports: [
    angularModules,
    angularMaterialModules
  ],
  providers: [services],
  bootstrap: [AppComponent]
})
export class AppModule { }

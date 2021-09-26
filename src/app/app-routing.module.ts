import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { environment } from 'src/environments/environment';


@NgModule({
  imports: [RouterModule.forRoot([
    {
      path: 'app',
      component: AppComponent,
      canActivate: [],
      canActivateChild: [],
      children: [
        {
          path: 'query',
          loadChildren: () => import('src/app/views/query/query.module').then(m => m.QueryModule), // Lazy load main module
          data: { preload: true }
        }
      ]
    }
  ], { useHash: environment.useHash })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

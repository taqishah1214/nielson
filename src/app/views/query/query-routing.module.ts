import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CreateQueryComponent } from './create-query/create-query.component';
import { ListQueriesComponent } from './list-queries/list-queries.component';


@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: '', component: ListQueriesComponent  },
                    { path: 'create', component: CreateQueryComponent  },
                    { path: 'edit/:id', component: CreateQueryComponent  },



                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class QueryRoutingModule { }

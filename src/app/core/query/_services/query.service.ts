// Angular
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpResponse,
  HttpErrorResponse,
  HttpResponseBase,
  HttpHeaders,
} from '@angular/common/http';
import stringInject from 'stringinject';

// RxJS
import { Observable, of as _observableOf, throwError, of } from 'rxjs';

// Models
import { ConfigurationSet } from '../_models/query/create/configurationSets.model';
import { ConversionType } from '../_models/query/create/conversionTypes.model';
import { Dimension } from '../_models/query/create/dimensions.model';
import { DateRange } from '../_models/query/create/dateRange.model';
import { Metric } from '../_models/query/create/metric.model';
import { Attribute } from '../_models/query/create/attribute.model';
// Envoiroment
import { CreateOrEditQuery } from '../_models/query/create/createOrEditQuery.model';
import { FCRootObject } from '../_models/query/create/dimensionValue.model';
import { ListQuery } from '../_models/query/list/list-query.model';
import { environment } from 'src/environments/environment';
import { catchError, map } from 'rxjs/operators';
import { QueryServiceParams } from '../_models/query/queryServiceParams';

const API_Url_Create = 'f2f676-adhocreportercreatequery';
const API_Url_List = '8d56aa0bda-adhocreportersavequery';
const API_CheckQueryNameNotExist_URL = 'query/notexist?name=';
const API_Delete_Query = 'query?id=';
const API_Duplicate_Query = 'query/';
const API_Edit_Query = 'query/';

const urlMap = {
  API_Url_List: '8d56aa0bda-adhocreportersavequery',
  API_Url_Create: 'f2f676-adhocreportercreatequery',
  API_ConfigurationSet_URL: '/configurationSets',
  API_Attribute_URL: '/dimensions',
  API_Metric_URL: '/metrics',
  API_ConversionType_URL:
    '/conversionTypes?configurationSet=%configurationSet%',
  API_Dimesion_URL: '/dimensions',
  API_DateRange_URL:
    '/dateRange?configurationSet=%configurationSet%&conversionType=%conversionType%',
  API_DimesionValue_URL: '/dimensionValues?dimensionName=%dimensionName%',
  API_Save_Query: '/query',
  API_List_Query: '/query',
  API_Delete_Query: 'query?id=',
  API_Duplicate_Query: 'query/',
  API_Run_Query: '/runQuery/query/%queryId%',
  API_Query_Detail: '/query/%queryId%',
  API_Edit_Query: 'query/',
};

@Injectable()
export class QueryService {
  constructor(private http: HttpClient) {}

  get(
    url: string,
    paramMap: QueryServiceParams,
    type: string
  ): Observable<any> {
    if (!paramMap.clientId || !paramMap.clientId.trim()) {
      throw new Error(
        'The parameter \'clientId\' cannot be null/empty/undefined.'
      );
    }
    let str = stringInject(environment.remoteServiceBaseUrl, {
      apiary: urlMap[type],
      clientCode: paramMap.clientId,
    });
    str += urlMap[url];
    str = this.replaceParameters(str, paramMap);
    return this.http.get(str);
  }

  post(
    url: string,
    paramMap: QueryServiceParams,
    type: string,
    payload
  ): Observable<any> {
    if (!paramMap.clientId || !paramMap.clientId.trim()) {
      throw new Error(
        'The parameter \'clientId\' cannot be null/empty/undefined.'
      );
    }
    let str = stringInject(environment.remoteServiceBaseUrl, {
      apiary: urlMap[type],
      clientCode: paramMap.clientId,
    });
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    str += urlMap[url];
    str = this.replaceParameters(str, paramMap);
    return this.http.post(str, payload, { headers: headers });
  }

  replaceParameters(str: string, params: QueryServiceParams): string {
    if (str.includes('%queryId%')) {
      str = str.replace('%queryId%', encodeURIComponent(params.queryId));
    }
    if (str.includes('%clientId%')) {
      str = str.replace('%clientId%', encodeURIComponent(params.clientId));
    }
    if (str.includes('%configurationSet%')) {
      str = str.replace(
        '%configurationSet%',
        encodeURIComponent(params.configurationSet)
      );
    }
    if (str.includes('%conversionType%')) {
      str = str.replace(
        '%conversionType%',
        encodeURIComponent(params.conversionType)
      );
    }
    if (str.includes('%dimensionName%')) {
      str = str.replace(
        '%dimensionName%',
        encodeURIComponent(params.dimensionName)
      );
    }
    return str;
  }

  getConfigurationSet(clientId: string): Observable<ConfigurationSet[]> {
    const params = new QueryServiceParams();
    params.clientId = clientId;
    return this.get('API_ConfigurationSet_URL', params, 'API_Url_Create');
  }

  getConversionType(
    clientId: string,
    configurationSet: string
  ): Observable<ConversionType[]> {
    if (!configurationSet || !configurationSet.trim()) {
      throw new Error(
        'The parameter \'configurationSet\' cannot be null/empty/undefined.'
      );
    }
    const params = new QueryServiceParams();
    params.clientId = clientId;
    params.configurationSet = configurationSet;
    return this.get('API_ConversionType_URL', params, 'API_Url_Create');
  }

  getDimensions(clientId: string): Observable<Dimension[]> {
    const params = new QueryServiceParams();
    params.clientId = clientId;
    return this.get('API_Dimesion_URL', params, 'API_Url_Create');
  }

  getDateRange(
    clientId: string,
    configurationSet: string,
    conversionType: string
  ): Observable<DateRange[]> {
    if (!configurationSet || !configurationSet.trim()) {
      throw new Error(
        'The parameter \'configurationSet\' cannot be null/empty/undefined.'
      );
    }
    if (!conversionType || !conversionType.trim()) {
      throw new Error(
        'The parameter \'conversionType\' cannot be null/empty/undefined.'
      );
    }
    const params = new QueryServiceParams();
    params.clientId = clientId;
    params.configurationSet = configurationSet;
    params.conversionType = conversionType;
    return this.get('API_DateRange_URL', params, 'API_Url_Create');
  }

  getDimensionValues(
    clientId: string,
    dimensionName: string,
    body: FCRootObject
  ): Observable<string[]> {
    const content_ = JSON.stringify(body);
    if (!dimensionName || !dimensionName.trim()) {
      throw new Error(
        'The parameter \'dimensionName\' cannot be null/empty/undefined.'
      );
    }
    const params = new QueryServiceParams();
    params.clientId = clientId;
    params.dimensionName = dimensionName;
    return this.post(
      'API_DimesionValue_URL',
      params,
      'API_Url_Create',
      content_
    );
  }

  getAttributes(clientId: string): Observable<Attribute[]> {
    const params = new QueryServiceParams();
    params.clientId = clientId;
    return this.get('API_Attribute_URL', params, 'API_Url_Create');
  }

  getMetrics(clientId: string): Observable<Metric[]> {
    const params = new QueryServiceParams();
    params.clientId = clientId;
    return this.get('API_Metric_URL', params, 'API_Url_Create');
  }

  saveQuery(clientId: string, body: CreateOrEditQuery): Observable<any> {
    const content_ = JSON.stringify(body);
    const params = new QueryServiceParams();
    params.clientId = clientId;
    return this.post('API_Save_Query', params, 'API_Url_Create', content_);
  }

  editQuery(
    clientId: string,
    queryId: number,
    body: CreateOrEditQuery
  ): Observable<any> {
    let url_ = stringInject(environment.remoteServiceBaseUrl, {
      apiary: API_Url_List,
      clientCode: clientId,
    });
    const content_ = JSON.stringify(body);
    if (!clientId) {
      throw new Error(
        'The parameter \'clientId\' cannot be null/empty/undefined.'
      );
    }
    if (clientId !== undefined) {
      url_ += encodeURIComponent('' + clientId) + '/' + API_Edit_Query;
    }
    if (queryId === null) {
      throw new Error('The parameter \'queryId\' cannot be null.');
    }
    if (queryId !== undefined) {
      url_ += encodeURIComponent('' + queryId);
    }
    url_ = url_.replace(/[?&]$/, '');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.put<any>(url_, content_, {
      responseType: 'text' as 'json',
      headers: headers,
    });
  }

  listQueries(clientId: string): Observable<ListQuery[]> {
    const params = new QueryServiceParams();
    params.clientId = clientId;
    return this.get('API_List_Query', params, 'API_Url_List');
  }

  deleteQueries(clientId: string, id: string[]): Observable<any> {
    let url_ = stringInject(environment.remoteServiceBaseUrl, {
      apiary: API_Url_List,
      clientCode: clientId,
    });
    if (!clientId || !clientId.trim()) {
      throw new Error(
        'The parameter \'clientId\' cannot be null/empty/undefined.'
      );
    }
    if (id === null || id === undefined) {
      throw new Error('The parameter \'id\' cannot be null/empty/undefined.');
    }
    if (clientId !== undefined) {
      url_ += '/' + API_Delete_Query + id;
    }
    url_ = url_.replace(/[?&]$/, '');
    const result = this.http.delete<any>(url_);
    return result;
  }

  duplicateQuery(clientId: string, id: number, body: any): Observable<any> {
    let url_ = stringInject(environment.remoteServiceBaseUrl, {
      apiary: API_Url_List,
      clientCode: clientId,
    });
    const content_ = JSON.stringify(body);
    if (!clientId || !clientId.trim()) {
      throw new Error(
        'The parameter \'clientId\' cannot be null/empty/undefined.'
      );
    }
    if (clientId !== undefined) {
      url_ += '/' + API_Duplicate_Query;
    }
    if (id === null) {
      throw new Error('The parameter \'Id\' cannot be null.');
    }
    if (id !== undefined) {
      url_ += encodeURIComponent('' + id);
    }
    url_ += '/copy';
    url_ = url_.replace(/[?&]$/, '');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    const response = this.http
      .post<any>(url_, content_, { headers: headers })
      .pipe(
        catchError((r) => {
          if (r instanceof HttpErrorResponse) {
            // Check if this error has a 2xx status
            if (this.is2xxStatus(r)) {
              // Convert the error to a standard response with a null body and then return
              return of(
                new HttpResponse({
                  headers: r.headers,
                  status: r.status,
                  statusText: r.statusText,
                  url: r.url,
                })
              );
            }
          }

          // This is a real error, rethrow
          return r;
        })
      );
    return response;
  }

  runQuery(clientId: string, id: number): Observable<any> {
    const params = new QueryServiceParams();
    params.clientId = clientId;
    params.queryId = id;
    return this.get('API_Run_Query', params, 'API_Url_List');
  }

  getQueryById(
    clientId: string,
    queryId: number
  ): Observable<CreateOrEditQuery> {
    if (queryId === null) {
      throw new Error('The parameter \'queryId\' cannot be null.');
    }
    const params = new QueryServiceParams();
    params.clientId = clientId;
    params.queryId = queryId;
    return this.get('API_Query_Detail', params, 'API_Url_List');
  }

  validateQueryName(
    clientId: string,
    queryName: string
  ): Observable<HttpResponse<Object>> {
    let url_ = stringInject(environment.remoteServiceBaseUrl, {
      apiary: API_Url_Create,
      clientCode: clientId,
    });
    if (!clientId || !clientId.trim()) {
      throw new Error(
        'The parameter \'clientId\' cannot be null/empty/undefined.'
      );
    }
    if (clientId !== undefined) {
      url_ += '/' + API_CheckQueryNameNotExist_URL;
    }
    if (queryName === null) {
      throw new Error('The parameter \'queryName\' cannot be null.');
    }
    if (queryName !== undefined) {
      url_ += encodeURIComponent('' + queryName);
    }
    url_ = url_.replace(/[?&]$/, '');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http
      .head<any>(url_, { headers: headers })
      .pipe(
        map((r) => {
          // For Status Code 200 Convert a null response to standard
          r = new HttpResponse();
          return r;
        }),
        catchError((e) => {
          if (e instanceof HttpErrorResponse) {
            // Convert the error to a standard response with a null body and then return
            return of(
              new HttpResponse({
                headers: e.headers,
                status: e.status,
                statusText: e.statusText,
                url: e.url,
              })
            );
          }
          // This is a real error, rethrow
          return e;
        })
      );
  }

  is2xxStatus(response: HttpResponseBase) {
    return (
      response.status >= 200 &&
      response.status < 300 &&
      response.statusText === 'OK'
    );
  }
}

import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { forwardRef, Injector, ChangeDetectorRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, FormBuilder } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { QueryConfigComponent } from './query-config.component';

import { QueryService } from 'src/app/core/query/_services/query.service';
import { ClientService } from 'src/app/core/query/_services/client.service';
import { SpinnerOverlayService } from 'src/app/core/query/_services/spinner-overlay.service';
import { NotifyService } from 'src/app/core/query/_services/notify.service';

import { environment } from 'src/environments/environment';
import { AppComponentBase } from 'src/app/core/app-component-base';

import { Observable, Observer, of as _observableOf, throwError, of } from 'rxjs';

class MockClientService {
  getUserName() {
    return 'Test';
  }
}

class MockQueryService {
  getConfigurationSet(clientId) {
    return new Observable((observer: Observer<any>) => {
      observer.next([]);
    });
  }

  validateQueryName(
    clientId: string,
    queryName: string
  ) {
    return new Observable((observer: Observer<any>) => {
      observer.next({ result: { status: 200 } });
    });
  }

  getConversionType(
    clientId: string,
    configurationSet: string
  ) {
    return new Observable((observer: Observer<any>) => {
      observer.next([]);
    });
  }

  getDateRange(
    clientId: string,
    configurationSet: string,
    conversionType: string
  ) {
    return new Observable((observer: Observer<any>) => {
      observer.next([{ startDate: new Date(), endDate: new Date() }]);
    });
  }
}

class MockSpinnerOverlayService {

  public show(message = '') { }
  public hide() { }
}

class MockNotifyService {

  info(message: string, title?: string, options?: any): void {
    throw new Error('Method not implemented.');
  }
  warn(message: string, title?: string, options?: any): void {
    throw new Error('Method not implemented.');
  }
  error(message: string, title?: string, options?: any): void {
    throw new Error('Method not implemented.');
  }
  // for success toast
  success(message: string, title?: string, options?: any) {
    console.log(message);
  }
}

class MockAppComponentBase {
  loader: any = {
    show: (message) => { },
    hide: () => { }
  };

  notify: any = {
    info: (message: string, title?: string, options?: any) => {
    },
    warn: (message: string, title?: string, options?: any) => {
    },
    error: (message: string, title?: string, options?: any) => {
    },
    success: (message: string, title?: string, options?: any) => {
    }
  };
}


describe('QueryConfigComponent', () => {
  let component: QueryConfigComponent;
  let fixture: ComponentFixture<QueryConfigComponent>;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [QueryConfigComponent],
      imports: [
        RouterTestingModule
      ],
      providers: [
        {
          provide: NG_VALUE_ACCESSOR,
          useExisting: forwardRef(() => QueryConfigComponent),
          multi: true,
        },
        {
          provide: NG_VALIDATORS,
          useExisting: forwardRef(() => QueryConfigComponent),
          multi: true,
        },
        {
          provide: AppComponentBase,
          useClass: MockAppComponentBase
        },
        {
          provide: ClientService,
          useClass: MockClientService
        },
        {
          provide: QueryService,
          useClass: MockQueryService
        },
        {
          provide: SpinnerOverlayService,
          useClass: MockSpinnerOverlayService
        },
        {
          provide: NotifyService,
          useClass: MockNotifyService
        },
        FormBuilder,
        DatePipe,
        RouterTestingModule,
        Injector,
        ChangeDetectorRef
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Query Name Change API Validation', <any>fakeAsync((): void => {
    let respCode = 0;
    setTimeout(() => {
      respCode = 200;
    }, 100);
    // expect(respCode).toBe(200);
    // tick(500);
    // expect(respCode).toBe(200);
     tick(200);
     expect(respCode).toBe(200);
  }));

  it('Query Name Validation', () => {
    let errors = {};
    const queryName = component.configForm.controls['queryName'];

    // queryName field is required
    errors = queryName.errors || {};
    // // Set queryName to something
    // queryName.setValue("");
    // errors = queryName.errors || {};
    // expect(errors['required']).toBeFalsy();
    // expect(errors['minlength']).toBeFalsy();

    // Set queryName to something correct
    queryName.setValue('123456789');
    errors = queryName.errors || {};
    expect(errors['required']).toBeFalsy();
    expect(errors['minlength']).toBeFalsy();
  });

  it('Query Description Max length', () => {
    let errors = {};
    const description = component.configForm.controls['description'];

    // description field is required
    errors = description.errors || {};

    // Set description to something correct
    description.setValue('This is perfect decription');
    errors = description.errors || {};
    expect(errors['maxlength']).toBeFalsy();
  });
});

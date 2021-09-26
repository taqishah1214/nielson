import { MomentFormatPipe } from '../layout/pipes/moment-format.pipe';
import { MomentFromNowPipe } from '../layout/pipes/moment-from-now.pipe';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [
        CommonModule
    ],
    providers: [
    ],
    declarations: [

        MomentFormatPipe,
        MomentFromNowPipe,
    ],
    exports: [
        MomentFormatPipe,
        MomentFromNowPipe,
    ]
})
export class UtilsModule { }

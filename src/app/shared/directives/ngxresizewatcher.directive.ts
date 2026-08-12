import { Directive, AfterContentChecked } from '@angular/core';
// @ts-ignore
import { DatatableComponent } from '@swimlane/ngx-datatable';

// tslint:disable-next-line:directive-selector
@Directive({ selector: '[ngx-resize-watcher]' })
export class NgxResizeWatcherDirective implements AfterContentChecked {

    constructor(private readonly table: any) { }

    private latestWidth: number = 0;

    ngAfterContentChecked(): void {
        if (this.table && this.table.recalculate && this.table.element.clientWidth !== this.latestWidth) {
            this.latestWidth = this.table.element.clientWidth;
            this.table.recalculate();
            this.table.recalculateColumns();
            window.dispatchEvent(new Event('resize'));
        }
    }
}

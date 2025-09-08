import {Directive, ElementRef, Renderer2, AfterViewInit, OnDestroy} from '@angular/core';

@Directive({
  selector: '[appRemoveItemFromDom]',
  standalone: true,
})
export class RemoveItemFromDomDirective implements AfterViewInit, OnDestroy {
  resizeObserver!: ResizeObserver;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const height = entry.contentRect.height;
        if (height === 0) {
          this.removeElement();
        }
      }
    });

    this.resizeObserver.observe(this.el.nativeElement);
  }

  private removeElement(): void {
    const nativeElement = this.el.nativeElement;
    const parent = nativeElement.parentNode;
    if (parent) {
      this.renderer.removeChild(parent, nativeElement);
    }
    this.resizeObserver.disconnect();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }
}

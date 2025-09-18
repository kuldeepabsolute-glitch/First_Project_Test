import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'confirm-modal',
  standalone: true,
  templateUrl: './confirm-modal.html',
  styleUrls: ['./confirm-modal.css']
})
export class ConfirmModal implements AfterViewInit, OnDestroy {
  @Input() message = 'Are you sure?';
  @Input() title = 'Confirm';
  @Output() confirmed = new EventEmitter<boolean>();

  @ViewChild('okBtn', { read: ElementRef, static: true }) okBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('modalRoot', { read: ElementRef, static: true }) modalRoot!: ElementRef<HTMLElement>;

  private previouslyFocused?: Element | null;
  private focusableElements: HTMLElement[] = [];

  ngAfterViewInit(): void {
    // save previously focused element to restore on destroy
    this.previouslyFocused = document.activeElement;

    // gather focusable elements inside the modal
    const root = this.modalRoot?.nativeElement;
    if (root) {
      const nodes = Array.from(root.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'));
      this.focusableElements = nodes.filter(n => !n.hasAttribute('disabled'));
    }

    // focus the primary action for clarity
    try { this.okBtn?.nativeElement.focus(); } catch {}
  }

  ngOnDestroy(): void {
    try { if (this.previouslyFocused && (this.previouslyFocused as HTMLElement).focus) (this.previouslyFocused as HTMLElement).focus(); } catch {}
  }

  // close on ESC
  @HostListener('window:keydown.escape')
  onEsc() {
    this.cancel();
  }

  // trap focus inside modal
  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab') return;
    if (!this.focusableElements.length) return;

    const first = this.focusableElements[0];
    const last = this.focusableElements[this.focusableElements.length - 1];
    const active = document.activeElement as HTMLElement;

    if (event.shiftKey) {
      if (active === first) {
        last.focus();
        event.preventDefault();
      }
    } else {
      if (active === last) {
        first.focus();
        event.preventDefault();
      }
    }
  }

  ok() { this.confirmed.emit(true); }
  cancel() { this.confirmed.emit(false); }
}

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenMatrixComponent } from './screen-matrix.component';

describe('ScreenMatrixComponent', () => {
  let component: ScreenMatrixComponent;
  let fixture: ComponentFixture<ScreenMatrixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScreenMatrixComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenMatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

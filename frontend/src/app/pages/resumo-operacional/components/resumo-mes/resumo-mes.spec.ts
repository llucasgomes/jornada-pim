import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumoMes } from './resumo-mes';

describe('ResumoMes', () => {
  let component: ResumoMes;
  let fixture: ComponentFixture<ResumoMes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumoMes],
    }).compileComponents();

    fixture = TestBed.createComponent(ResumoMes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

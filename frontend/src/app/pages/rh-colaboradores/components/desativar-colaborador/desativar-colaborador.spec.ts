import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesativarColaborador } from './desativar-colaborador';

describe('DesativarColaborador', () => {
  let component: DesativarColaborador;
  let fixture: ComponentFixture<DesativarColaborador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesativarColaborador],
    }).compileComponents();

    fixture = TestBed.createComponent(DesativarColaborador);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

// @vitest-environment jsdom
import '@angular/compiler';
import 'reflect-metadata';
import { Component, inject, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import { ThreeLensModule, ThreeLensService } from './index';

@Component({
  standalone: false,
  template: `
    <threelens-panel [readonly]="true"></threelens-panel>
    <threelens-hud [lens]="lens"></threelens-hud>
  `,
})
class HostComponent {
  lens = inject(ThreeLensService).getLens();
}

beforeAll(() => {
  TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
});

afterEach(() => {
  TestBed.resetTestingModule();
});

afterAll(() => {
  TestBed.resetTestEnvironment();
});

it('initializes the panel and HUD through ThreeLensModule and unmounts both on destroy', async () => {
  await TestBed.configureTestingModule({
    declarations: [HostComponent],
    imports: [ThreeLensModule.forRoot({ autoInit: true, hud: false })],
    providers: [provideZonelessChangeDetection()],
  }).compileComponents();

  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();

  const service = TestBed.inject(ThreeLensService);
  const host: HTMLElement = fixture.nativeElement;
  const container = host.querySelector('threelens-panel .threelens-container');
  const hud = document.querySelector('[data-three-lens="hud"]');
  expect(service.getLens()).toBeTruthy();
  expect(container?.querySelector('.tlp-workspace')?.isConnected).toBe(true);
  expect(hud?.isConnected).toBe(true);

  fixture.destroy();

  expect(container?.querySelector('.tlp-workspace')).toBeNull();
  expect(document.querySelector('[data-three-lens="hud"]')).toBeNull();

  TestBed.resetTestingModule();
  expect(service.getLens()).toBeNull();
});

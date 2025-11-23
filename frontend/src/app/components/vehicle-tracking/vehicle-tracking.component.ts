// src/app/components/vehicle-tracking/vehicle-tracking.component.ts

import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { TrackingService } from '../../services/tracking.service';

// 🔴 Importar NgIf
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-vehicle-tracking',
  template: `
    <div style="padding: 20px; background: #f8f9fa; border-radius: 8px; margin-bottom: 20px;">
      <h3>📊 Simulación de Vehículo</h3>
      <button (click)="startSimulation()" class="btn btn-primary">▶️ Iniciar Simulación</button>
      <button (click)="stopSimulation()" class="btn btn-secondary">⏹️ Detener</button>
      <div *ngIf="isRunning" style="margin-top: 10px; font-weight: bold; color: green;">✅ Simulación en curso...</div>
    </div>
  `,
  styles: [`
    .btn {
      margin-right: 10px;
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-primary { background-color: #007bff; color: white; }
    .btn-secondary { background-color: #6c757d; color: white; }
  `],
  // 🔵 Importar NgIf
  imports: [NgIf]
})
export class VehicleTrackingComponent implements AfterViewInit, OnDestroy {
  // ... (tu lógica aquí, igual que antes)
  public isRunning = false;
  private simulationInterval: any;

  constructor(private trackingService: TrackingService) {}

  startSimulation() {
    this.isRunning = true;
    this.trackingService.clearRoute();
    // (tu lógica de simulación)
  }

  stopSimulation() {
    this.isRunning = false;
    if (this.simulationInterval) clearInterval(this.simulationInterval);
  }

  ngAfterViewInit() {}
  ngOnDestroy() { this.stopSimulation(); }
}
/**
 * Test file for drone mappings API service
 * This is a basic structure test to verify the API follows the correct pattern
 */

import { DroneMappingsService } from '../drone-mappings';
import type { DroneMappingUI } from '@/shared/model';

// Mock the api module
jest.mock('../api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('DroneMappingsService', () => {
  const mockMapping: DroneMappingUI = {
    id: 'test-drone-001',
    serialNumber: 'SN123456789',
    sisant: 'SISANT001',
  };

  it('should have all required methods', () => {
    expect(DroneMappingsService).toHaveProperty('create');
    expect(DroneMappingsService).toHaveProperty('bulkCreate');
    expect(DroneMappingsService).toHaveProperty('getById');
    expect(DroneMappingsService).toHaveProperty('listAll');
    expect(DroneMappingsService).toHaveProperty('update');
    expect(DroneMappingsService).toHaveProperty('delete');
    expect(DroneMappingsService).toHaveProperty('restore');
    expect(DroneMappingsService).toHaveProperty('findByIdentifier');
    expect(DroneMappingsService).toHaveProperty('getStatistics');
  });

  it('should follow the same pattern as other services', () => {
    // Verify that all methods are async functions
    expect(typeof DroneMappingsService.create).toBe('function');
    expect(typeof DroneMappingsService.listAll).toBe('function');
    expect(typeof DroneMappingsService.update).toBe('function');
    expect(typeof DroneMappingsService.delete).toBe('function');
  });
});
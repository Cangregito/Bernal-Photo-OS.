import { describe, it, expect, beforeEach } from 'vitest';
import { SignContract } from './SignContract';
import { ContractRepository } from '../../../domain/repositories/ContractRepository';
import { Contract } from '../../../domain/entities/Contract';

// Mock del repositorio
class MockContractRepository implements ContractRepository {
  async getAll(): Promise<Contract[]> { return []; }
  async getByClientId(_clientId: string): Promise<Contract[]> { return []; }
  async create(contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contract> { return { ...contract, id: '99', createdAt: new Date(), updatedAt: new Date() }; }
  async delete(_id: string): Promise<void> {}
  
  async getById(id: string): Promise<Contract | null> {
    if (id === '1') {
      return {
        id: '1',
        clientId: '1',
        content: 'Condiciones de la Boda...',
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    if (id === 'signed_already') {
      return {
        id: 'signed_already',
        clientId: '1',
        content: 'Terminos',
        status: 'signed',
        hashSignature: 'abc',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    return null;
  }
  
  async update(id: string, data: Partial<Contract>): Promise<Contract> {
    return {
      id,
      clientId: '1',
      content: 'Condiciones de la Boda...',
      status: data.status || 'draft',
      hashSignature: data.hashSignature,
      ipAddress: data.ipAddress,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    } as Contract;
  }
}

describe('SignContract', () => {
  let useCase: SignContract;
  let mockRepo: MockContractRepository;

  beforeEach(() => {
    mockRepo = new MockContractRepository();
    useCase = new SignContract(mockRepo);
  });

  it('debe arrojar error si el contrato no existe', async () => {
    await expect(useCase.execute({
      contractId: '999',
      signatureBase64: 'base64',
      ipAddress: '127.0.0.1'
    })).rejects.toThrow('Contract not found');
  });

  it('debe arrojar error si el contrato ya está firmado', async () => {
    await expect(useCase.execute({
      contractId: 'signed_already',
      signatureBase64: 'base64',
      ipAddress: '127.0.0.1'
    })).rejects.toThrow('Contract is already signed and sealed');
  });

  it('debe generar exitosamente el Hash SHA-256 y marcar como signed', async () => {
    const result = await useCase.execute({
      contractId: '1',
      signatureBase64: 'firma_base64_test',
      ipAddress: '192.168.1.1'
    });

    expect(result.status).toBe('signed');
    expect(result.ipAddress).toBe('192.168.1.1');
    expect(result.hashSignature).toBeDefined();
    expect(result.hashSignature?.length).toBe(64); // SHA-256 en HEX siempre es de 64 caracteres
  });

  it('debe generar hashes distintos para firmas o IPs distintas (Inmutabilidad)', async () => {
    const result1 = await useCase.execute({
      contractId: '1',
      signatureBase64: 'firma_A',
      ipAddress: '1.1.1.1'
    });

    // Simulamos crear otro UseCase para evitar cache de mock si hubiera
    const useCase2 = new SignContract(new MockContractRepository());
    const result2 = await useCase2.execute({
      contractId: '1',
      signatureBase64: 'firma_B', // Firma distinta
      ipAddress: '1.1.1.1'
    });

    expect(result1.hashSignature).not.toBe(result2.hashSignature);
  });
});

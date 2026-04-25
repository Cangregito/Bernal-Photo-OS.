import { Contract } from '../../domain/entities/Contract';
import { ContractRepository } from '../../domain/repositories/ContractRepository';

export class InMemoryContractRepository implements ContractRepository {
  private contracts: Contract[] = [
    {
      id: '1',
      clientId: '1', // Ana García
      quoteId: '1',
      content: 'Contrato de Prestación de Servicios Fotográficos: El fotógrafo cubrirá el evento civil...',
      status: 'signed',
      signedAt: new Date('2026-04-13T12:00:00Z'),
      ipAddress: '189.213.24.150',
      hashSignature: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', // Fake hash
      createdAt: new Date('2026-04-12T10:00:00Z'),
      updatedAt: new Date('2026-04-13T12:00:00Z'),
    },
    {
      id: '2',
      clientId: '2', // Carlos López
      quoteId: '2',
      content: 'Contrato de Prestación de Servicios Fotográficos: Sesión de compromiso en la playa...',
      status: 'draft',
      createdAt: new Date('2026-04-18T16:00:00Z'),
      updatedAt: new Date('2026-04-18T16:00:00Z'),
    }
  ];

  async getAll(): Promise<Contract[]> {
    return [...this.contracts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getByClientId(clientId: string): Promise<Contract[]> {
    return this.contracts.filter(c => c.clientId === clientId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getById(id: string): Promise<Contract | null> {
    const contract = this.contracts.find(c => c.id === id);
    return contract ? { ...contract } : null;
  }

  async create(contractData: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contract> {
    const newContract: Contract = {
      ...contractData,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.contracts.push(newContract);
    return { ...newContract };
  }

  async update(id: string, data: Partial<Contract>): Promise<Contract> {
    const index = this.contracts.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Contract not found');
    
    this.contracts[index] = {
      ...this.contracts[index],
      ...data,
      updatedAt: new Date(),
    };
    
    return { ...this.contracts[index] };
  }

  async delete(id: string): Promise<void> {
    this.contracts = this.contracts.filter(c => c.id !== id);
  }
}

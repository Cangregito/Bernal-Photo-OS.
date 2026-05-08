import { ContractRepository } from '../../../domain/repositories/ContractRepository';

/**
 * Caso de Uso: Verificar la integridad de un contrato comparando
 * su contenido actual con el hash SHA-256 almacenado al momento de la firma.
 * 
 * Implementa MAESTER §4.4: "El sistema permite verificar en cualquier momento
 * si el PDF actual coincide con el Hash original."
 */
export class VerifyContractIntegrity {
  constructor(private contractRepository: ContractRepository) {}

  async execute(contractId: string): Promise<{
    isValid: boolean;
    storedHash: string | null;
    computedHash: string;
    contractId: string;
  }> {
    const contract = await this.contractRepository.getById(contractId);
    if (!contract) throw new Error(`Contrato ${contractId} no encontrado.`);

    // Recalcular el hash con el mismo algoritmo usado al firmar
    const encoder = new TextEncoder();
    const data = encoder.encode(contract.content + (contract.signedAt?.toISOString() || ''));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return {
      isValid: contract.hashSignature === computedHash,
      storedHash: contract.hashSignature || null,
      computedHash,
      contractId: contract.id,
    };
  }
}

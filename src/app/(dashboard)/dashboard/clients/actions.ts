'use server';

import { revalidatePath } from 'next/cache';
import { SupabaseClientRepository } from '../../../../infrastructure/repositories/SupabaseClientRepository';

const clientRepository = new SupabaseClientRepository();

export async function createClientAction(formData: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  notes?: string;
}) {
  try {
    await clientRepository.create(formData);
    revalidatePath('/dashboard/clients');
    revalidatePath('/dashboard/sessions'); // Also revalidate sessions since it needs clients
    return { success: true };
  } catch (error: any) {
    console.error('Error creating client:', error);
    return { success: false, error: error.message };
  }
}
